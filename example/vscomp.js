var game = new Chess();
var board;
var stockfish = new Worker('stockfish.js');
var engineStatus = {};
var time = { wtime: 300000, btime: 300000, winc: 2000, binc: 2000 };
var playerColor = 'white';
var clockTimeoutID = null;

// do not pick up pieces if the game is over
// only pick up pieces for White
var onDragStart = function(source, piece, position, orientation) {
    var re = playerColor == 'white' ? /^b/ : /^w/
    if (game.game_over() ||
        piece.search(re) !== -1) {
        return false;
    }
};

function uciCmd(cmd) {
//    console.log(cmd);
    stockfish.postMessage(cmd);
}
uciCmd('uci');

function displayStatus() {
    var status = 'Engine: ';
    if(!engineStatus.engineLoaded) {
        status += 'loading...';
    } else if(!engineStatus.engineReady) {
        status += 'loaded...';
    } else {
        status += 'ready.';
    }
    status += ' Book: ';
    if(engineStatus.bookLoaded) {
        status += 'loaded.';
    } else {
        status += 'loading...';
    }
    if(engineStatus.search) {
        status += '<br>' + engineStatus.search;
        if(engineStatus.score && $('#showScore').is(':checked')) {
            status += ' Score: ' + engineStatus.score;
        }
    }
    $('#engineStatus').html(status);
}

function displayClock(color, t) {
    var isRunning = false;
    if(time.startTime > 0 && color == time.clockColor) {
        t = Math.max(0, t + time.startTime - Date.now());
        isRunning = true;
    }
    var id = color == playerColor ? '#time2' : '#time1';
    var sec = Math.ceil(t / 1000);
    var min = Math.floor(sec / 60);
    sec -= min * 60;
    var hours = Math.floor(min / 60);
    min -= hours * 60;
    var display = hours + ':' + ('0' + min).slice(-2) + ':' + ('0' + sec).slice(-2);
    if(isRunning) {
        display += sec & 1 ? ' <--' : ' <-';
    }
    $(id).text(display);
}

function updateClock() {
    displayClock('white', time.wtime);
    displayClock('black', time.btime);
}

function clockTick() {
    updateClock();
    var t = (time.clockColor == 'white' ? time.wtime : time.btime) + time.startTime - Date.now();
    var timeToNextSecond = (t % 1000) + 1;
    clockTimeoutID = setTimeout(clockTick, timeToNextSecond);
}

function stopClock() {
    if(clockTimeoutID !== null) {
        clearTimeout(clockTimeoutID);
        clockTimeoutID = null;
    }
    if(time.startTime > 0) {
        var elapsed = Date.now() - time.startTime;
        time.startTime = null;
        if(time.clockColor == 'white') {
            time.wtime = Math.max(0, time.wtime - elapsed);
        } else {
            time.btime = Math.max(0, time.btime - elapsed);
        }
    }
}

function startClock() {
    if(game.turn() == 'w') {
        time.wtime += time.winc;
        time.clockColor = 'white';
    } else {
        time.btime += time.binc;
        time.clockColor = 'black';
    }
    time.startTime = Date.now();
    clockTick();
}

function prepareMove() {
    stopClock();
    $('#pgn').text(game.pgn());
    board.position(game.fen());
    updateClock();
    var turn = game.turn() == 'w' ? 'white' : 'black';
    if(!game.game_over()) {
        if(turn != playerColor) {
            var moves = '';
            var history = game.history({verbose: true});
            for(var i = 0; i < history.length; ++i) {
                var move = history[i];
                moves += ' ' + move.from + move.to + (move.promotion ? move.promotion : '');
            }
            uciCmd('position startpos moves' + moves);
            uciCmd('go wtime ' + time.wtime + ' winc ' + time.winc + ' btime ' + time.btime + ' binc ' + time.binc);
        }
        if(game.history().length >= 2) {
            startClock();
        }
    }
}

function newGame() {
    var baseTime = parseFloat($('#timeBase').val()) * 60 * 1000;
    var inc = parseFloat($('#timeInc').val()) * 1000;
    var skill = parseInt($('#skillLevel').val());
    time = { wtime: baseTime, btime: baseTime, winc: inc, binc: inc };
    game.reset();
    playerColor = $('#color-white').hasClass('active') ? 'white' : 'black';
    board.orientation(playerColor);
    uciCmd('ucinewgame');
    uciCmd('setoption name Skill Level value ' + skill);
    uciCmd('isready');
    engineStatus.engineReady = false;
    engineStatus.search = null;
    displayStatus();
    prepareMove();
}

stockfish.onmessage = function(event) {
    var line = event.data;
    if(line == 'uciok') {
        engineStatus.engineLoaded = true;
    } else if(line == 'readyok') {
        engineStatus.engineReady = true;
    } else {
        var match = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbk])?/);
        if(match) {
            game.move({from: match[1], to: match[2], promotion: match[3]});
            prepareMove();
        } else if(match = line.match(/^info .*\bdepth (\d+) .*\bnps (\d+)/)) {
            engineStatus.search = 'Depth: ' + match[1] + ' Nps: ' + match[2];
        }
        if(match = line.match(/^info .*\bscore (\w+) (-?\d+)/)) {
            var score = parseInt(match[2]) * (game.turn() == 'w' ? 1 : -1);
            if(match[1] == 'cp') {
                engineStatus.score = (score / 100.0).toFixed(2);
            } else if(match[1] == 'mate') {
                engineStatus.score = '#' + score;
            }
            if(match = line.match(/\b(upper|lower)bound\b/)) {
                engineStatus.score = (match[1] == 'upper' ? '<= ' : '>= ') + engineStatus.score
            }
        }
    }
    displayStatus();
};

var onDrop = function(source, target) {
    // see if the move is legal
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a pawn for example simplicity
    });

    // illegal move
    if (move === null) return 'snapback';

    prepareMove();
};

// update the board position after the piece snap
// for castling, en passant, pawn promotion
var onSnapEnd = function() {
    board.position(game.fen());
};

var cfg = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
};

var bookRequest = new XMLHttpRequest();
bookRequest.open('GET', 'book.bin', true);
bookRequest.responseType = "arraybuffer";
bookRequest.onload = function(event) {
    if(bookRequest.status == 200) {
        stockfish.postMessage({book: bookRequest.response});
        engineStatus.bookLoaded = true;
        displayStatus();
    }
};
bookRequest.send(null);

board = new ChessBoard('board', cfg);

newGame();
