//
// String async iterator from Web or NodeJS stream
//
const normalizeReadableStream = (stream) => {
  // TODO: When we support `Bot.stop` we have to be carefull not to leak resouce e.g. by ReadableStream.cancel (Web) or Readable.destroy (NodeJS).

  // https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/getReader
  if (typeof ReadableStream === 'function' && stream instanceof ReadableStream) {
    const decoder = new TextDecoder("utf-8");
    const reader = stream.getReader();
    return {
      async* [Symbol.asyncIterator]() {
        while (true) {
          const { value, done } = await reader.read();
          if (done) { break; }
          yield decoder.decode(value);
        }
      }
    };
  }

  // https://nodejs.org/api/stream.html#stream_readable_symbol_asynciterator
  if (typeof Symbol === 'function' && typeof Symbol.asyncIterator === 'symbol' && typeof stream[Symbol.asyncIterator] === 'function') {
    stream.setEncoding('utf8');
    return stream;
  }

  throw new Error('Unreachable');
};

//
// AsyncIterator utility
//
const makeLineIterator = async function* (iterator) {
  let buffer = "";
  for await (const chunk of iterator) {
    buffer += chunk;
    while (true) {
      const i = buffer.indexOf('\n');
      if (i == -1) { break; }
      yield buffer.substr(0, i);
      buffer = buffer.substr(i + 1);
    }
  }
};

const mapAsyncIterator = async function* (iterator, f) {
  for await (const x of iterator) {
    yield f(x);
  }
}

const filterAsyncIterator = async function* (iterator, f) {
  for await (const x of iterator) {
    if (f(x)) { yield x; }
  }
}

//
// Simple queue with async get (assume single consumer)
//
class Queue {
  constructor() {
    this.getter = null;
    this.list = [];
  }
  async get() {
    if (this.list.length > 0) { return this.list.shift(); }
    return await new Promise(resolve => this.getter = resolve);
  }
  put(x) {
    if (this.getter) { this.getter(x); this.getter = null; return; }
    this.list.push(x);
  }
};

//
// Lichess Web API
//
class Api {
  constructor(key) {
    this.base = 'https://lichess.org';
    this.key = key;
    this.headers = { authorization: `Bearer ${this.key}` };
  }

  async request(path, method, body) {
    const url = this.base + path;
    const resp = await fetch(url, { method, body, headers: this.headers });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`fetch failure (${method}, ${url}, ${resp.status}, ${text})`);
    }
    return resp;
  }

  async GET(path) {
    const resp = await this.request(path, 'GET');
    return resp.json();
  }

  async POST(path, params) {
    const body = new URLSearchParams(params);
    const resp = await this.request(path, 'POST', body);
    return resp.json();
  }

  async GET_NDJSON(path) {
    const resp = await this.request(path, 'GET');
    let iterator = normalizeReadableStream(resp.body)
    iterator = makeLineIterator(iterator);
    iterator = filterAsyncIterator(iterator, s => s.trim() !== '');
    iterator = mapAsyncIterator(iterator, JSON.parse);
    return iterator;
  }

  account() { return this.GET('/api/account'); }
  upgrade() { return this.POST('/api/bot/account/upgrade'); }
  streamEvent() { return this.GET_NDJSON('/api/stream/event'); }
  createChallenge(username, params) { return this.POST(`/api/challenge/${username}`, params); }
  acceptChallenge(challengeId) { return this.POST(`/api/challenge/${challengeId}/accept`); }
  declineChallenge(challengeId) { return this.POST(`/api/challenge/${challengeId}/decline`); }
  streamGame(gameId) { return this.GET_NDJSON(`/api/bot/game/stream/${gameId}`); }
  move(gameId, move) { return this.POST(`/api/bot/game/${gameId}/move/${move}`); }
};

//
// UCI Engine wrapper
//
class EngineWrapper {
  constructor(engine, log = console.log) {
    this.engine = engine;
    this.queue = new Queue();
    this.engine.addMessageListener(line => this.queue.put(line));
    this.log = log;
  }

  send(command) {
    this.log('>>(engine)', command);
    this.engine.postMessage(command);
  }

  async receive() {
    const line = await this.queue.get();
    this.log('<<(engine)', line);
    return line;
  }

  async receiveUntil(predicate) {
    const lines = []
    while (true) {
      const line = await this.receive();
      lines.push(line);
      if (predicate(line)) { break; }
    }
    return lines;
  }

  async initialize(options = {}) {
    this.send('uci');
    await this.receiveUntil(line => line === 'uciok');
    for (const name in options) {
      this.send(`setoption name ${name} value ${options[name]}`)
    }
    this.send('isready');
    await this.receiveUntil(line => line === 'readyok');
  }

  async initializeGame() {
    this.send('ucinewgame');
    this.send('isready');
    await this.receiveUntil(line => line === 'readyok');
  }

  async search(initialFen, moves, wtime, btime, winc, binc) {
    this.send(`position ${initialFen} moves ${moves}`);
    this.send('isready');
    await this.receiveUntil(line => line === 'readyok');

    this.send(`go wtime ${wtime} btime ${btime} winc ${winc} binc ${binc}`);
    const lines = await this.receiveUntil(line => line.startsWith('bestmove'));
    const last_line = lines[lines.length - 1];
    const bestmove = last_line.split(' ')[1];
    return bestmove;
  }
};

const ignoreError = (func) => {
  return async (...args) => {
    try {
      await func(...args);
    } catch (e) {
      console.error('--- ignoreError ---');
      console.error(e);
    }
  }
}

//
// Bot implementation
//
class Bot {
  constructor(api, engine, log = console.log) {
    this.api = api;
    this.engine = new EngineWrapper(engine, log);
    this.bot_id = null;
    this.log = log;
  }

  async verify() {
    const resp = await this.api.account();
    this.bot_id = resp.id;
    return resp.title === 'BOT';
  }

  async start() {
    const ok = await this.verify();
    if (!ok) { throw new Error('Failed to verify bot account'); }

    await this.engine.initialize();

    this.log(':: Waiting for challenges...');

    // TODO: Handle disconnection in a robust way
    const iterator = await this.api.streamEvent();

    for await (const data of iterator) {
      this.log(`[event stream (type = ${data.type})]`, data);

      if (data.type === 'challenge') {
        const { id, rated, challenger, variant, timeControl } = data.challenge;
        // Skip our own challenge to someone
        if (challenger.id === this.bot_id) { continue; }

        // time ≤ 30min, increment ≤ 30sec
        const ok =
          !rated && // TODO: Only unrated since it's not stable yet
          (variant.key === 'standard') &&
          (0 <= timeControl.limit) && (timeControl.limit <= 30 * 60) &&
          (0 <= timeControl.increment) && (timeControl.increment <= 30);

        if (ok) {
          this.log(`:: Accept challenge [${id}]`)
          await ignoreError(this.api.acceptChallenge.bind(this.api))(id);

        } else {
          this.log(`:: Decline challenge [${id}]`)
          await ignoreError(this.api.declineChallenge.bind(this.api))(id);
        }
      }

      if (data.type === 'gameStart') {
        const { game: { id } } = data;
        await ignoreError(this.playGame.bind(this))(id);
        this.log(':: Waiting for challenges...');
      }
    }
  }

  async playGame(gameId) {
    this.log(`:: Game started [${gameId}]`);
    const iterator = await this.api.streamGame(gameId);
    const move_overhead = 2000;
    let first_line = true;
    let color; // white = 0, black = 1
    let state;

    for await (const data of iterator) {
      this.log(`[game stream (type = ${data.type})]`, data);

      if (first_line) {
        first_line = false;
        if (data.type !== 'gameFull') { throw new Error('Expected [type = "gameFull"]'); }
        if (data.initialFen != 'startpos') { throw new Error('Expected [initialFen = "startpos"]'); }

        const { white, black } = data;
        if (this.bot_id !== white.id && this.bot_id !== black.id) { throw new Error(`Expected ${white.id} or ${black.id} = ${this.bot_id}`); }

        color = Number(this.bot_id === black.id);
        state = data.state;
        await this.engine.initializeGame();
      }

      if (data.type === 'gameState') {
        state = data;
      }

      let { moves, wtime, btime, winc, binc, status } = state;
      if (!status === 'started') { continue; }

      // Check if we're the side to move
      const move_list = (moves === '') ? [] : moves.split(' ');
      const side_to_move = move_list.length % 2;
      if (side_to_move !== color) { continue; }

      if (color === 0) {
        wtime = Math.max(100, wtime - move_overhead);
      } else {
        btime = Math.max(100, btime - move_overhead);
      }

      const bestmove = await this.engine.search('startpos', moves, wtime, btime, winc, binc);
      await this.api.move(gameId, bestmove);
    }

    this.log(`:: Game finished [${gameId}]`);
  }
};

//
// NodeJS support
//

const isNode = () => {
  return Boolean(typeof module !== 'undefined' && module.exports);
}

const initNode = () => {
  global.fetch = require('node-fetch');
  global.Stockfish = require('./stockfish.js');
};

const upgrade = async (key) => {
  if (isNode()) { initNode(); }

  const api = new Api(key);
  console.log(':: Get account');
  const accountResp = await api.account();
  console.log(accountResp);

  if (upgrade) {
    console.log(':: Upgrade account')
    const upgradeResp = await api.upgrade();
    console.log(upgradeResp);
  }
};

const start = async (key) => {
  if (isNode()) { initNode(); }

  const api = new Api(key);
  console.log(':: Get account');
  const accountResp = await api.account();
  console.log(accountResp);

  console.log(':: Load Stockfish');
  const stockfish = await Stockfish();

  console.log(':: Start Bot');
  const bot = new Bot(api, stockfish);
  await bot.start();
}

if (isNode()) {
  module.exports = {
    Api, Engine, Bot,
    initNode, upgrade, start
  };
}
