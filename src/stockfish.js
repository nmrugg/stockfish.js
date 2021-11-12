/*!
 * Stockfish.js (c) Chess.com, LLC
 * https://github.com/nmrugg/stockfish.js
 * License: GPLv3
 *
 * Based on stockfish.wasm (c)
 * Niklas Fiekas <niklas.fiekas@backscattering.de>
 * Hiroshi Ogawa <hi.ogawa.zz@gmail.com>
 * https://github.com/niklasf/stockfish.wasm
 * https://github.com/hi-ogawa/Stockfish
 *
 * Based on Stockfish (c) T. Romstad, M. Costalba, J. Kiiski, G. Linscott and other contributors.
 * https://github.com/official-stockfish/Stockfish
 */
var Stockfish;
function INIT_ENGINE() {


var Stockfish = (function() {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename;
  return (
function(Stockfish) {
  Stockfish = Stockfish || {};


null;var d;d||(d=typeof Stockfish !== 'undefined' ? Stockfish : {});var aa,ba;d.ready=new Promise(function(a,b){aa=a;ba=b});"undefined"===typeof XMLHttpRequest&&(global.XMLHttpRequest=function(){var a,b={open:function(c,e){a=e},send:function(){require("fs").readFile(a,function(c,e){b.readyState=4;c?(console.error(c),b.status=404,b.onerror(c)):(b.status=200,b.response=e,b.onreadystatechange(),b.onload())})}};return b});
d.postCustomMessage=a=>{for(let b of l.ya)b.postMessage({cmd:"custom",userData:a})};class ca{constructor(){this.Da=null;this.Va=[]}async get(){return 0<this.Va.length?this.Va.shift():await new Promise(a=>this.Da=a)}put(a){this.Da?(this.Da(a),this.Da=null):this.Va.push(a)}}d.queue=new ca;d.onCustomMessage=a=>{da?ea.push(a):d.queue.put(a)};var da,ea=[];d.pauseQueue=function(){da=!0};d.unpauseQueue=function(){var a=ea;ea=[];da=!1;a.forEach(function(b){d.queue.put(b)})};d.postMessage=d.postCustomMessage;
const fa=[];d.addMessageListener=a=>{fa.push(a)};d.removeMessageListener=a=>{a=fa.indexOf(a);0<=a&&fa.splice(a,1)};d.print=d.printErr=a=>{if(0===fa.length)console.log(a);else for(let b of fa)b(a)};d.terminate=()=>{l.Sa()};var ha={},m;for(m in d)d.hasOwnProperty(m)&&(ha[m]=d[m]);var ia=[],ja="./this.program";function ka(a,b){throw b;}
var la="object"===typeof window,n="function"===typeof importScripts,q="object"===typeof process&&"object"===typeof process.versions&&"string"===typeof process.versions.node,z=d.ENVIRONMENT_IS_PTHREAD||!1,A="";function ma(a){return d.locateFile?d.locateFile(a,A):A+a}var na,oa,pa,qa;
if(q){A=n?require("path").dirname(A)+"/":__dirname+"/";na=function(a,b){pa||(pa=require("fs"));qa||(qa=require("path"));a=qa.normalize(a);return pa.readFileSync(a,b?null:"utf8")};oa=function(a){a=na(a,!0);a.buffer||(a=new Uint8Array(a));assert(a.buffer);return a};1<process.argv.length&&(ja=process.argv[1].replace(/\\/g,"/"));ia=process.argv.slice(2);process.on("uncaughtException",function(a){if(!(a instanceof ra))throw a;});process.on("unhandledRejection",B);ka=function(a,b){if(sa())throw process.exitCode=
a,b;process.exit(a)};d.inspect=function(){return"[Emscripten Module object]"};var ta;try{ta=require("worker_threads")}catch(a){throw console.error('The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?'),a;}global.Worker=ta.Worker}else if(la||n)n?A=self.location.href:"undefined"!==typeof document&&document.currentScript&&(A=document.currentScript.src),_scriptDir&&(A=_scriptDir),0!==A.indexOf("blob:")?A=A.substr(0,A.lastIndexOf("/")+1):A="",q?(na=function(a,
b){pa||(pa=require("fs"));qa||(qa=require("path"));a=qa.normalize(a);return pa.readFileSync(a,b?null:"utf8")},oa=function(a){a=na(a,!0);a.buffer||(a=new Uint8Array(a));assert(a.buffer);return a}):(na=function(a){var b=new XMLHttpRequest;b.open("GET",a,!1);b.send(null);return b.responseText},n&&(oa=function(a){var b=new XMLHttpRequest;b.open("GET",a,!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)}));q&&"undefined"===typeof performance&&(global.performance=require("perf_hooks").performance);
var ua=d.print||console.log.bind(console),E=d.printErr||console.warn.bind(console);for(m in ha)ha.hasOwnProperty(m)&&(d[m]=ha[m]);ha=null;d.arguments&&(ia=d.arguments);d.thisProgram&&(ja=d.thisProgram);d.quit&&(ka=d.quit);var va,wa;d.wasmBinary&&(wa=d.wasmBinary);var noExitRuntime=d.noExitRuntime||!0;"object"!==typeof WebAssembly&&B("no native wasm support detected");var F,ya,za=!1,Aa;function assert(a,b){a||B("Assertion failed: "+b)}
function Ba(a){var b=new TextDecoder(a);this.decode=function(c){c.buffer instanceof SharedArrayBuffer&&(c=new Uint8Array(c));return b.decode.call(b,c)}}var Ca="undefined"!==typeof TextDecoder?new Ba("utf8"):void 0;
function Da(a,b,c){var e=b+c;for(c=b;a[c]&&!(c>=e);)++c;if(16<c-b&&a.subarray&&Ca)return Ca.decode(a.subarray(b,c));for(e="";b<c;){var h=a[b++];if(h&128){var g=a[b++]&63;if(192==(h&224))e+=String.fromCharCode((h&31)<<6|g);else{var k=a[b++]&63;h=224==(h&240)?(h&15)<<12|g<<6|k:(h&7)<<18|g<<12|k<<6|a[b++]&63;65536>h?e+=String.fromCharCode(h):(h-=65536,e+=String.fromCharCode(55296|h>>10,56320|h&1023))}}else e+=String.fromCharCode(h)}return e}function H(a){return a?Da(I,a,void 0):""}
function K(a,b,c,e){if(0<e){e=c+e-1;for(var h=0;h<a.length;++h){var g=a.charCodeAt(h);if(55296<=g&&57343>=g){var k=a.charCodeAt(++h);g=65536+((g&1023)<<10)|k&1023}if(127>=g){if(c>=e)break;b[c++]=g}else{if(2047>=g){if(c+1>=e)break;b[c++]=192|g>>6}else{if(65535>=g){if(c+2>=e)break;b[c++]=224|g>>12}else{if(c+3>=e)break;b[c++]=240|g>>18;b[c++]=128|g>>12&63}b[c++]=128|g>>6&63}b[c++]=128|g&63}}b[c]=0}}
function Fa(a){for(var b=0,c=0;c<a.length;++c){var e=a.charCodeAt(c);55296<=e&&57343>=e&&(e=65536+((e&1023)<<10)|a.charCodeAt(++c)&1023);127>=e?++b:b=2047>=e?b+2:65535>=e?b+3:b+4}return b}"undefined"!==typeof TextDecoder&&new Ba("utf-16le");function Ga(a){var b=Fa(a)+1,c=Ha(b);K(a,Ia,c,b);return c}var Ja,Ia,I,L,M,N,Ka;z&&(Ja=d.buffer);var La=d.INITIAL_MEMORY||1073741824;
if(z)F=d.wasmMemory,Ja=d.buffer;else if(d.wasmMemory)F=d.wasmMemory;else if(F=new WebAssembly.Memory({initial:La/65536,maximum:La/65536,shared:!0}),!(F.buffer instanceof SharedArrayBuffer))throw E("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"),q&&console.log("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and also use a recent version)"),
Error("bad memory");F&&(Ja=F.buffer);La=Ja.byteLength;var Q=Ja;Ja=Q;d.HEAP8=Ia=new Int8Array(Q);d.HEAP16=new Int16Array(Q);d.HEAP32=M=new Int32Array(Q);d.HEAPU8=I=new Uint8Array(Q);d.HEAPU16=L=new Uint16Array(Q);d.HEAPU32=N=new Uint32Array(Q);d.HEAPF32=new Float32Array(Q);d.HEAPF64=Ka=new Float64Array(Q);var Ma=[],Na=[],Oa=[],Pa=[],R=0;function sa(){return noExitRuntime||0<R}function Qa(){var a=d.preRun.shift();Ma.unshift(a)}var Ra=0,Sa=null,Ta=null;
function Ua(){Ra++;d.monitorRunDependencies&&d.monitorRunDependencies(Ra)}function Va(){Ra--;d.monitorRunDependencies&&d.monitorRunDependencies(Ra);if(0==Ra&&(null!==Sa&&(clearInterval(Sa),Sa=null),Ta)){var a=Ta;Ta=null;a()}}d.preloadedImages={};d.preloadedAudios={};function B(a){if(d.onAbort)d.onAbort(a);assert(!z);E(a);za=!0;Aa=1;a=new WebAssembly.RuntimeError("abort("+a+"). Build with -s ASSERTIONS=1 for more info.");ba(a);throw a;}
function Wa(){return S.startsWith("data:application/octet-stream;base64,")}var S;S="stockfish.wasm";Wa()||(S=ma(S));function Xa(){var a=S;try{if(a==S&&wa)return new Uint8Array(wa);if(oa)return oa(a);throw"both async and sync fetching of the wasm failed";}catch(b){B(b)}}
function Ya(){return wa||!la&&!n||"function"!==typeof fetch?Promise.resolve().then(function(){return Xa()}):fetch(S,{credentials:"same-origin"}).then(function(a){if(!a.ok)throw"failed to load wasm binary file at '"+S+"'";return a.arrayBuffer()}).catch(function(){return Xa()})}var Za={27421:function(){throw"Canceled!";}};
function $a(a){for(;0<a.length;){var b=a.shift();if("function"==typeof b)b(d);else{var c=b.Xa;"number"===typeof c?void 0===b.Ea?dynCall_v.call(null,c):dynCall_vi.apply(null,[c,b.Ea]):c(void 0===b.Ea?null:b.Ea)}}}
function ab(a,b){if(0>=a||a>Ia.length||a&1||0>b)return-28;if(0==b)return 0;2147483647<=b&&(b=Infinity);var c=Atomics.load(M,bb>>2),e=0;if(c==a&&Atomics.compareExchange(M,bb>>2,c,0)==c&&(--b,e=1,0>=b))return 1;a=Atomics.notify(M,a>>2,b);if(0<=a)return a+e;throw"Atomics.notify returned an unexpected value "+a;}d._emscripten_futex_wake=ab;
function cb(a){if(z)throw"Internal Error! cleanupThread() can only ever be called from main application thread!";if(!a)throw"Internal Error! Null pthread_ptr in cleanupThread!";var b=l.wa[a];b&&(M[a+12>>2]=0,l.La(b.worker))}
var l={za:[],ya:[],Ua:[],Eb:function(){},ib:function(){for(var a=T(228),b=0;57>b;++b)N[a/4+b]=0;M[a+12>>2]=a;b=a+152;M[b>>2]=b;var c=T(512);for(b=0;128>b;++b)N[c/4+b]=0;Atomics.store(N,a+100>>2,c);Atomics.store(N,a+40>>2,a);db(a,!n,1);eb(a)},jb:function(){l.receiveObjectTransfer=l.mb;l.threadInit=l.rb;l.threadCancel=l.qb;l.threadExit=l.bb;l.setExitStatus=l.ob},wa:{},Ta:[],$a:function(){for(;0<l.Ta.length;)l.Ta.pop()();fb()},ab:function(a,b){Atomics.store(N,a+56>>2,1);Atomics.store(N,a+60>>2,0);l.$a();
Atomics.store(N,a+4>>2,b);Atomics.store(N,a+0>>2,1);ab(a+0,2147483647);db(0,0,0)},ob:function(a){Aa=a},bb:function(a){var b=gb();b&&(l.ab(b,a),z&&postMessage({cmd:"exit"}))},qb:function(){l.ab(gb(),-1);postMessage({cmd:"cancelDone"})},Sa:function(){for(var a in l.wa){var b=l.wa[a];b&&b.worker&&l.La(b.worker)}l.wa={};for(a=0;a<l.za.length;++a){var c=l.za[a];c.terminate()}l.za=[];for(a=0;a<l.ya.length;++a)c=l.ya[a],b=c.va,l.Qa(b),c.terminate();l.ya=[]},Qa:function(a){if(a){if(a.xa){var b=M[a.xa+100>>
2];M[a.xa+100>>2]=0;hb(b);hb(a.xa)}a.xa=0;a.Pa&&a.Aa&&hb(a.Aa);a.Aa=0;a.worker&&(a.worker.va=null)}},La:function(a){l.nb(function(){delete l.wa[a.va.xa];l.za.push(a);l.ya.splice(l.ya.indexOf(a),1);l.Qa(a.va);a.va=void 0})},nb:function(a){M[ib>>2]=0;try{a()}finally{M[ib>>2]=1}},mb:function(){},rb:function(){for(var a in l.Ua)l.Ua[a]()},kb:function(a,b){a.onmessage=function(c){var e=c.data,h=e.cmd;a.va&&(l.eb=a.va.xa);if(e.targetThread&&e.targetThread!=gb()){var g=l.wa[e.Jb];g?g.worker.postMessage(c.data,
e.transferList):E('Internal error! Worker sent a message "'+h+'" to target pthread '+e.targetThread+", but that thread no longer exists!")}else if("processQueuedMainThreadWork"===h)jb();else if("spawnThread"===h)kb(c.data);else if("cleanupThread"===h)cb(e.thread);else if("killThread"===h){c=e.thread;if(z)throw"Internal Error! killThread() can only ever be called from main application thread!";if(!c)throw"Internal Error! Null pthread_ptr in killThread!";M[c+12>>2]=0;e=l.wa[c];delete l.wa[c];e.worker.terminate();
l.Qa(e);l.ya.splice(l.ya.indexOf(e.worker),1);e.worker.va=void 0}else if("cancelThread"===h){c=e.thread;if(z)throw"Internal Error! cancelThread() can only ever be called from main application thread!";if(!c)throw"Internal Error! Null pthread_ptr in cancelThread!";l.wa[c].worker.postMessage({cmd:"cancel"})}else if("loaded"===h)a.loaded=!0,b&&b(a),a.Fa&&(a.Fa(),delete a.Fa);else if("print"===h)ua("Thread "+e.threadId+": "+e.text);else if("printErr"===h)E("Thread "+e.threadId+": "+e.text);else if("alert"===
h)alert("Thread "+e.threadId+": "+e.text);else if("exit"===h)a.va&&Atomics.load(N,a.va.xa+64>>2)&&l.La(a);else if("exitProcess"===h)try{lb(e.returnCode)}catch(k){if(k instanceof ra)return;throw k;}else"cancelDone"===h?l.La(a):"objectTransfer"!==h&&("setimmediate"===c.data.target?a.postMessage(c.data):E("worker sent an unknown command "+h));l.eb=void 0};a.onerror=function(c){E("pthread sent an error! "+c.filename+":"+c.lineno+": "+c.message)};q&&(a.on("message",function(c){a.onmessage({data:c})}),
a.on("error",function(c){a.onerror(c)}),a.on("exit",function(){}));a.postMessage({cmd:"load",urlOrBlob:d.mainScriptUrlOrBlob||_scriptDir,wasmMemory:F,wasmModule:ya})},cb:function(){var a=ma("stockfish.worker.js");l.za.push(new Worker(a))},gb:function(){0==l.za.length&&(l.cb(),l.kb(l.za[0]));return l.za.pop()},xb:function(a){for(a=performance.now()+a;performance.now()<a;);}};d.establishStackSpace=function(a,b){mb(a,b);nb(a)};d.invokeEntryPoint=function(a,b){return ob.apply(null,[a,b])};var pb;
pb=q?function(){var a=process.hrtime();return 1E3*a[0]+a[1]/1E6}:z?function(){return performance.now()-d.__performance_now_clock_drift}:function(){return performance.now()};
function kb(a){if(z)throw"Internal Error! spawnThread() can only ever be called from main application thread!";var b=l.gb();if(!b)return 6;if(void 0!==b.va)throw"Internal error!";if(!a.Ka)throw"Internal error, no pthread ptr!";l.ya.push(b);for(var c=T(512),e=0;128>e;++e)M[c+4*e>>2]=0;var h=a.Aa+a.Ba;e=l.wa[a.Ka]={worker:b,Aa:a.Aa,Ba:a.Ba,Pa:a.Pa,xa:a.Ka};var g=e.xa>>2;Atomics.store(N,g+16,a.detached);Atomics.store(N,g+25,c);Atomics.store(N,g+10,e.xa);Atomics.store(N,g+20,a.Ba);Atomics.store(N,g+19,
h);Atomics.store(N,g+26,a.Ba);Atomics.store(N,g+28,h);Atomics.store(N,g+29,a.detached);c=qb()+40;Atomics.store(N,g+43,c);b.va=e;var k={cmd:"run",start_routine:a.pb,arg:a.Ea,threadInfoStruct:a.Ka,stackBase:a.Aa,stackSize:a.Ba};b.Fa=function(){k.time=performance.now();b.postMessage(k,a.wb)};b.loaded&&(b.Fa(),delete b.Fa);return 0}
function rb(a,b,c){if(0>=a||a>Ia.length||a&1)return-28;if(la){if(Atomics.load(M,a>>2)!=b)return-6;var e=performance.now();c=e+c;for(Atomics.exchange(M,bb>>2,a);;){e=performance.now();if(e>c)return Atomics.exchange(M,bb>>2,0),-73;e=Atomics.exchange(M,bb>>2,0);if(0==e)break;jb();if(Atomics.load(M,a>>2)!=b)return-6;Atomics.exchange(M,bb>>2,a)}return 0}a=Atomics.wait(M,a>>2,b,c);if("timed-out"===a)return-73;if("not-equal"===a)return-6;if("ok"===a)return 0;throw"Atomics.wait returned an unexpected value "+
a;}function sb(){q||n||(va||(va={}),va["Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread"]||(va["Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread"]=1,E("Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread")))}
function tb(a,b){if(!a)return E("pthread_join attempted on a null thread pointer!"),71;if(z&&gb()==a)return E("PThread "+a+" is attempting to join to itself!"),16;if(!z&&ub()==a)return E("Main thread "+a+" is attempting to join to itself!"),16;if(M[a+12>>2]!==a)return E("pthread_join attempted on thread "+a+", which does not point to a valid thread, or does not exist anymore!"),71;if(Atomics.load(N,a+64>>2))return E("Attempted to join thread "+a+", which was already detached!"),28;for(sb();;){var c=
Atomics.load(N,a>>2);if(1==c)return c=Atomics.load(N,a+4>>2),b&&(M[b>>2]=c),Atomics.store(N,a+64>>2,1),z?postMessage({cmd:"cleanupThread",thread:a}):cb(a),0;vb();z||jb();rb(a,c,z?100:1)}}var wb=[null,[],[]],xb={};function yb(a,b,c){return z?U(2,1,a,b,c):0}function zb(a,b,c){return z?U(3,1,a,b,c):0}function Ab(a,b,c){if(z)return U(4,1,a,b,c)}function Bb(){if(z)return U(5,1);B()}var Cb=[];function Db(a){if(z)return U(6,1,a);noExitRuntime=!1;R=0;lb(a)}
function U(a,b){for(var c=arguments.length-2,e=Eb(),h=Ha(8*c),g=h>>3,k=0;k<c;k++)Ka[g+k]=arguments[2+k];c=Fb(a,c,h,b);nb(e);return c}var Gb=[],Hb=[0,"undefined"!==typeof document?document:0,"undefined"!==typeof window?window:0];function Ib(a){a=2<a?H(a):a;return Hb[a]||("undefined"!==typeof document?document.querySelector(a):void 0)}
function Jb(a,b,c){var e=Ib(a);if(!e)return-4;e.Ja&&(M[e.Ja>>2]=b,M[e.Ja+4>>2]=c);if(e.Za||!e.zb)e.Za&&(e=e.Za),a=!1,e.Ia&&e.Ia.Ha&&(a=e.Ia.Ha.getParameter(2978),a=0===a[0]&&0===a[1]&&a[2]===e.width&&a[3]===e.height),e.width=b,e.height=c,a&&e.Ia.Ha.viewport(0,0,b,c);else{if(e.Ja){e=M[e.Ja+8>>2];a=a?H(a):"";var h=Eb(),g=Ha(12),k=0;if(a){k=Fa(a)+1;var u=T(k);K(a,I,u,k);k=u}M[g>>2]=k;M[g+4>>2]=b;M[g+8>>2]=c;Kb(0,e,657457152,0,k,g);nb(h);return 1}return-4}return 0}
function Lb(a,b,c){return z?U(7,1,a,b,c):Jb(a,b,c)}function W(a,b){if(!za)if(b)a();else{try{a()}catch(c){if(c instanceof ra)return;if("unwind"!==c)throw c&&"object"===typeof c&&c.stack&&E("exception thrown: "+[c,c.stack]),c;}if(z&&!sa())try{z?Mb(Aa):lb(Aa)}catch(c){if(!(c instanceof ra))throw c;}}}var Nb=[];function X(a,b){N[a>>2]=b;N[a+4>>2]=b/4294967296|0}
function Ob(a,b){try{var c=indexedDB.open("emscripten_filesystem",1)}catch(e){b(e);return}c.onupgradeneeded=function(e){e=e.target.result;e.objectStoreNames.contains("FILES")&&e.deleteObjectStore("FILES");e.createObjectStore("FILES")};c.onsuccess=function(e){a(e.target.result)};c.onerror=function(e){b(e)}}var Pb;
function Qb(a,b,c,e,h){function g(C){var D=0,w=0;C&&(w=p.response?p.response.byteLength:0,D=T(w),I.set(new Uint8Array(p.response),D));N[a+12>>2]=D;X(a+16,w)}var k=N[a+8>>2];if(k){var u=H(k),t=a+112,v=H(t);v||(v="GET");var y=N[t+52>>2],O=N[t+56>>2],J=!!N[t+60>>2],f=N[t+68>>2],r=N[t+72>>2];k=N[t+76>>2];var x=N[t+80>>2],G=N[t+84>>2];t=N[t+88>>2];var P=!!(y&1),V=!!(y&2);y=!!(y&64);f=f?H(f):void 0;r=r?H(r):void 0;var Ea=x?H(x):void 0,p=new XMLHttpRequest;p.withCredentials=J;p.open(v,u,!y,f,r);y||(p.timeout=
O);p.Da=u;p.responseType="arraybuffer";x&&p.overrideMimeType(Ea);if(k)for(;;){v=N[k>>2];if(!v)break;u=N[k+4>>2];if(!u)break;k+=8;v=H(v);u=H(u);p.setRequestHeader(v,u)}Nb.push(p);N[a+0>>2]=Nb.length;k=G&&t?I.slice(G,G+t):null;p.onload=function(C){g(P&&!V);var D=p.response?p.response.byteLength:0;X(a+24,0);D&&X(a+32,D);L[a+40>>1]=p.readyState;L[a+42>>1]=p.status;p.statusText&&K(p.statusText,I,a+44,64);200<=p.status&&300>p.status?b&&b(a,p,C):c&&c(a,p,C)};p.onerror=function(C){g(P);var D=p.status;X(a+
24,0);X(a+32,p.response?p.response.byteLength:0);L[a+40>>1]=p.readyState;L[a+42>>1]=D;c&&c(a,p,C)};p.ontimeout=function(C){c&&c(a,p,C)};p.onprogress=function(C){var D=P&&V&&p.response?p.response.byteLength:0,w=0;P&&V&&(w=T(D),I.set(new Uint8Array(p.response),w));N[a+12>>2]=w;X(a+16,D);X(a+24,C.loaded-D);X(a+32,C.total);L[a+40>>1]=p.readyState;3<=p.readyState&&0===p.status&&0<C.loaded&&(p.status=200);L[a+42>>1]=p.status;p.statusText&&K(p.statusText,I,a+44,64);e&&e(a,p,C);w&&hb(w)};p.onreadystatechange=
function(C){L[a+40>>1]=p.readyState;2<=p.readyState&&(L[a+42>>1]=p.status);h&&h(a,p,C)};try{p.send(k)}catch(C){c&&c(a,p,C)}}else c(a,0,"no url specified!")}
function Rb(a,b,c,e){var h=Pb;if(h){var g=N[a+112+64>>2];g||(g=N[a+8>>2]);var k=H(g);try{var u=h.transaction(["FILES"],"readwrite").objectStore("FILES").put(b,k);u.onsuccess=function(){L[a+40>>1]=4;L[a+42>>1]=200;K("OK",I,a+44,64);c(a,0,k)};u.onerror=function(t){L[a+40>>1]=4;L[a+42>>1]=413;K("Payload Too Large",I,a+44,64);e(a,0,t)}}catch(t){e(a,0,t)}}else e(a,0,"IndexedDB not available!")}
function Sb(a,b,c){var e=Pb;if(e){var h=N[a+112+64>>2];h||(h=N[a+8>>2]);h=H(h);try{var g=e.transaction(["FILES"],"readonly").objectStore("FILES").get(h);g.onsuccess=function(k){if(k.target.result){k=k.target.result;var u=k.byteLength||k.length,t=T(u);I.set(new Uint8Array(k),t);N[a+12>>2]=t;X(a+16,u);X(a+24,0);X(a+32,u);L[a+40>>1]=4;L[a+42>>1]=200;K("OK",I,a+44,64);b(a,0,k)}else L[a+40>>1]=4,L[a+42>>1]=404,K("Not Found",I,a+44,64),c(a,0,"no data")};g.onerror=function(k){L[a+40>>1]=4;L[a+42>>1]=404;
K("Not Found",I,a+44,64);c(a,0,k)}}catch(k){c(a,0,k)}}else c(a,0,"IndexedDB not available!")}
function Tb(a,b,c){var e=Pb;if(e){var h=N[a+112+64>>2];h||(h=N[a+8>>2]);h=H(h);try{var g=e.transaction(["FILES"],"readwrite").objectStore("FILES").delete(h);g.onsuccess=function(k){k=k.target.result;N[a+12>>2]=0;X(a+16,0);X(a+24,0);X(a+32,0);L[a+40>>1]=4;L[a+42>>1]=200;K("OK",I,a+44,64);b(a,0,k)};g.onerror=function(k){L[a+40>>1]=4;L[a+42>>1]=404;K("Not Found",I,a+44,64);c(a,0,k)}}catch(k){c(a,0,k)}}else c(a,0,"IndexedDB not available!")}
function Ub(a){var b=a.getExtension("ANGLE_instanced_arrays");b&&(a.vertexAttribDivisor=function(c,e){b.vertexAttribDivisorANGLE(c,e)},a.drawArraysInstanced=function(c,e,h,g){b.drawArraysInstancedANGLE(c,e,h,g)},a.drawElementsInstanced=function(c,e,h,g,k){b.drawElementsInstancedANGLE(c,e,h,g,k)})}
function Vb(a){var b=a.getExtension("OES_vertex_array_object");b&&(a.createVertexArray=function(){return b.createVertexArrayOES()},a.deleteVertexArray=function(c){b.deleteVertexArrayOES(c)},a.bindVertexArray=function(c){b.bindVertexArrayOES(c)},a.isVertexArray=function(c){return b.isVertexArrayOES(c)})}function Wb(a){var b=a.getExtension("WEBGL_draw_buffers");b&&(a.drawBuffers=function(c,e){b.drawBuffersWEBGL(c,e)})}
function Xb(a,b){a.Ya||(a.Ya=a.getContext,a.getContext=function(e,h){h=a.Ya(e,h);return"webgl"==e==h instanceof WebGLRenderingContext?h:null});var c=a.getContext("webgl",b);return c?Yb(c,b):0}function Yb(a,b){var c=T(8);M[c+4>>2]=gb();var e={Db:c,attributes:b,version:b.lb,Ha:a};a.canvas&&(a.canvas.Ia=e);("undefined"===typeof b.Wa||b.Wa)&&Zb(e);return c}
function Zb(a){a||(a=$b);if(!a.hb){a.hb=!0;var b=a.Ha;Ub(b);Vb(b);Wb(b);b.Ab=b.getExtension("EXT_disjoint_timer_query");b.Gb=b.getExtension("WEBGL_multi_draw");(b.getSupportedExtensions()||[]).forEach(function(c){c.includes("lose_context")||c.includes("debug")||b.getExtension(c)})}}var $b,ac=["default","low-power","high-performance"],bc={};
function cc(){if(!dc){var a={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:("object"===typeof navigator&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:ja||"./this.program"},b;for(b in bc)void 0===bc[b]?delete a[b]:a[b]=bc[b];var c=[];for(b in a)c.push(b+"="+a[b]);dc=c}return dc}var dc;
function ec(a,b){if(z)return U(8,1,a,b);var c=0;cc().forEach(function(e,h){var g=b+c;h=M[a+4*h>>2]=g;for(g=0;g<e.length;++g)Ia[h++>>0]=e.charCodeAt(g);Ia[h>>0]=0;c+=e.length+1});return 0}function fc(a,b){if(z)return U(9,1,a,b);var c=cc();M[a>>2]=c.length;var e=0;c.forEach(function(h){e+=h.length+1});M[b>>2]=e;return 0}function gc(a){return z?U(10,1,a):0}function hc(a,b,c,e){if(z)return U(11,1,a,b,c,e);a=xb.Cb(a);b=xb.Bb(a,b,c);M[e>>2]=b;return 0}
function ic(a,b,c,e,h){if(z)return U(12,1,a,b,c,e,h)}function jc(a,b,c,e){if(z)return U(13,1,a,b,c,e);for(var h=0,g=0;g<c;g++){for(var k=M[b+8*g>>2],u=M[b+(8*g+4)>>2],t=0;t<u;t++){var v=I[k+t],y=wb[a];0===v||10===v?((1===a?ua:E)(Da(y,0)),y.length=0):y.push(v)}h+=u}M[e>>2]=h;return 0}function kc(a){return 0===a%4&&(0!==a%100||0===a%400)}function lc(a,b){for(var c=0,e=0;e<=b;c+=a[e++]);return c}var mc=[31,29,31,30,31,30,31,31,30,31,30,31],nc=[31,28,31,30,31,30,31,31,30,31,30,31];
function oc(a,b){for(a=new Date(a.getTime());0<b;){var c=a.getMonth(),e=(kc(a.getFullYear())?mc:nc)[c];if(b>e-a.getDate())b-=e-a.getDate()+1,a.setDate(1),11>c?a.setMonth(c+1):(a.setMonth(0),a.setFullYear(a.getFullYear()+1));else{a.setDate(a.getDate()+b);break}}return a}
function pc(a,b,c,e){function h(f,r,x){for(f="number"===typeof f?f.toString():f||"";f.length<r;)f=x[0]+f;return f}function g(f,r){return h(f,r,"0")}function k(f,r){function x(P){return 0>P?-1:0<P?1:0}var G;0===(G=x(f.getFullYear()-r.getFullYear()))&&0===(G=x(f.getMonth()-r.getMonth()))&&(G=x(f.getDate()-r.getDate()));return G}function u(f){switch(f.getDay()){case 0:return new Date(f.getFullYear()-1,11,29);case 1:return f;case 2:return new Date(f.getFullYear(),0,3);case 3:return new Date(f.getFullYear(),
0,2);case 4:return new Date(f.getFullYear(),0,1);case 5:return new Date(f.getFullYear()-1,11,31);case 6:return new Date(f.getFullYear()-1,11,30)}}function t(f){f=oc(new Date(f.U+1900,0,1),f.Oa);var r=new Date(f.getFullYear()+1,0,4),x=u(new Date(f.getFullYear(),0,4));r=u(r);return 0>=k(x,f)?0>=k(r,f)?f.getFullYear()+1:f.getFullYear():f.getFullYear()-1}var v=M[e+40>>2];e={ub:M[e>>2],tb:M[e+4>>2],Ma:M[e+8>>2],Ga:M[e+12>>2],Ca:M[e+16>>2],U:M[e+20>>2],Na:M[e+24>>2],Oa:M[e+28>>2],Kb:M[e+32>>2],sb:M[e+36>>
2],vb:v?H(v):""};c=H(c);v={"%c":"%a %b %d %H:%M:%S %Y","%D":"%m/%d/%y","%F":"%Y-%m-%d","%h":"%b","%r":"%I:%M:%S %p","%R":"%H:%M","%T":"%H:%M:%S","%x":"%m/%d/%y","%X":"%H:%M:%S","%Ec":"%c","%EC":"%C","%Ex":"%m/%d/%y","%EX":"%H:%M:%S","%Ey":"%y","%EY":"%Y","%Od":"%d","%Oe":"%e","%OH":"%H","%OI":"%I","%Om":"%m","%OM":"%M","%OS":"%S","%Ou":"%u","%OU":"%U","%OV":"%V","%Ow":"%w","%OW":"%W","%Oy":"%y"};for(var y in v)c=c.replace(new RegExp(y,"g"),v[y]);var O="Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),
J="January February March April May June July August September October November December".split(" ");v={"%a":function(f){return O[f.Na].substring(0,3)},"%A":function(f){return O[f.Na]},"%b":function(f){return J[f.Ca].substring(0,3)},"%B":function(f){return J[f.Ca]},"%C":function(f){return g((f.U+1900)/100|0,2)},"%d":function(f){return g(f.Ga,2)},"%e":function(f){return h(f.Ga,2," ")},"%g":function(f){return t(f).toString().substring(2)},"%G":function(f){return t(f)},"%H":function(f){return g(f.Ma,
2)},"%I":function(f){f=f.Ma;0==f?f=12:12<f&&(f-=12);return g(f,2)},"%j":function(f){return g(f.Ga+lc(kc(f.U+1900)?mc:nc,f.Ca-1),3)},"%m":function(f){return g(f.Ca+1,2)},"%M":function(f){return g(f.tb,2)},"%n":function(){return"\n"},"%p":function(f){return 0<=f.Ma&&12>f.Ma?"AM":"PM"},"%S":function(f){return g(f.ub,2)},"%t":function(){return"\t"},"%u":function(f){return f.Na||7},"%U":function(f){var r=new Date(f.U+1900,0,1),x=0===r.getDay()?r:oc(r,7-r.getDay());f=new Date(f.U+1900,f.Ca,f.Ga);return 0>
k(x,f)?g(Math.ceil((31-x.getDate()+(lc(kc(f.getFullYear())?mc:nc,f.getMonth()-1)-31)+f.getDate())/7),2):0===k(x,r)?"01":"00"},"%V":function(f){var r=new Date(f.U+1901,0,4),x=u(new Date(f.U+1900,0,4));r=u(r);var G=oc(new Date(f.U+1900,0,1),f.Oa);return 0>k(G,x)?"53":0>=k(r,G)?"01":g(Math.ceil((x.getFullYear()<f.U+1900?f.Oa+32-x.getDate():f.Oa+1-x.getDate())/7),2)},"%w":function(f){return f.Na},"%W":function(f){var r=new Date(f.U,0,1),x=1===r.getDay()?r:oc(r,0===r.getDay()?1:7-r.getDay()+1);f=new Date(f.U+
1900,f.Ca,f.Ga);return 0>k(x,f)?g(Math.ceil((31-x.getDate()+(lc(kc(f.getFullYear())?mc:nc,f.getMonth()-1)-31)+f.getDate())/7),2):0===k(x,r)?"01":"00"},"%y":function(f){return(f.U+1900).toString().substring(2)},"%Y":function(f){return f.U+1900},"%z":function(f){f=f.sb;var r=0<=f;f=Math.abs(f)/60;return(r?"+":"-")+String("0000"+(f/60*100+f%60)).slice(-4)},"%Z":function(f){return f.vb},"%%":function(){return"%"}};for(y in v)c.includes(y)&&(c=c.replace(new RegExp(y,"g"),v[y](e)));y=qc(c);if(y.length>
b)return 0;Ia.set(y,a);return y.length-1}function rc(a){try{a()}catch(b){B(b)}}var Y=0,Z=null,sc=0,tc=[],uc={},vc={},wc=0,xc=null,yc=[],zc=[];function Ac(a){var b={},c;for(c in a)(function(e){var h=a[e];b[e]="function"===typeof h?function(){tc.push(e);try{return h.apply(null,arguments)}finally{if(!za){var g=tc.pop();assert(g===e);Z&&1===Y&&0===tc.length&&(R+=1,Y=0,rc(d._asyncify_stop_unwind),"undefined"!==typeof Fibers&&Fibers.Lb(),xc&&(xc(),xc=null))}}}:h})(c);return b}
function Bc(){var a=T(4108),b=a+12;M[a>>2]=b;M[a+4>>2]=b+4096;b=tc[0];var c=uc[b];void 0===c&&(c=wc++,uc[b]=c,vc[c]=b);M[a+8>>2]=c;return a}function Cc(){var a=d.asm[vc[M[Z+8>>2]]];--R;return a()}
function Dc(a){if(!za){if(0===Y){var b=!1,c=!1;a(function(e){if(!za&&(sc=e||0,b=!0,c)){Y=2;rc(function(){d._asyncify_start_rewind(Z)});"undefined"!==typeof Browser&&Browser.Ra.Xa&&Browser.Ra.resume();var h=Cc();Z||(e=yc,yc=[],e.forEach(function(g){g(h)}))}});c=!0;b||(Y=1,Z=Bc(),rc(function(){d._asyncify_start_unwind(Z)}),"undefined"!==typeof Browser&&Browser.Ra.Xa&&Browser.Ra.pause())}else 2===Y?(Y=0,rc(d._asyncify_stop_rewind),hb(Z),Z=null,zc.forEach(function(e){W(e)})):B("invalid state: "+Y);return sc}}
function Ec(a){return Dc(function(b){a().then(b)})}z||(Ob(function(a){Pb=a;Va()},function(){Pb=!1;Va()}),"undefined"!==typeof ENVIRONMENT_IS_FETCH_WORKER&&ENVIRONMENT_IS_FETCH_WORKER||Ua());var Fc=[null,function(a,b){if(z)return U(1,1,a,b)},yb,zb,Ab,Bb,Db,Lb,ec,fc,gc,hc,ic,jc];function qc(a){var b=Array(Fa(a)+1);K(a,b,0,b.length);return b}
var Kc={c:function(a,b,c,e){B("Assertion failed: "+H(a)+", at: "+[b?H(b):"unknown filename",c,e?H(e):"unknown function"])},E:function(a,b){Gc(a,b)},o:function(a,b){l.Ta.push(function(){dynCall_vi.apply(null,[a,b])})},L:function(a,b,c,e){if("undefined"===typeof SharedArrayBuffer)return E("Current environment does not support SharedArrayBuffer, pthreads are not available!"),6;if(!a)return E("pthread_create called with a null thread pointer!"),28;var h=[];if(z&&0===h.length)return Hc(687865856,a,b,c,
e);var g=0,k=0;if(b&&-1!=b){var u=M[b>>2];u+=81920;g=M[b+8>>2];k=0!==M[b+12>>2]}else u=2097152;(b=0==g)?g=Ic(16,u):(g-=u,assert(0<g));for(var t=T(228),v=0;57>v;++v)N[(t>>2)+v]=0;M[a>>2]=t;M[t+12>>2]=t;a=t+152;M[a>>2]=a;c={Aa:g,Ba:u,Pa:b,detached:k,pb:c,Ka:t,Ea:e,wb:h};return z?(c.yb="spawnThread",postMessage(c,h),0):kb(c)},J:function(a){z?l.bb(a):(l.$a(),lb(a));throw"unwind";},K:function(a,b){return tb(a,b)},h:yb,x:zb,y:Ab,P:function(a){delete Nb[a-1]},O:function(a,b){if(a==b)postMessage({cmd:"processQueuedMainThreadWork"});
else if(z)postMessage({targetThread:a,cmd:"processThreadQueue"});else{a=(a=l.wa[a])&&a.worker;if(!a)return;a.postMessage({cmd:"processThreadQueue"})}return 1},b:Bb,D:function(a,b){if(0===a)a=Date.now();else if(1===a||4===a)a=pb();else return M[Jc()>>2]=28,-1;M[b>>2]=a/1E3|0;M[b+4>>2]=a%1E3*1E6|0;return 0},m:function(a,b,c){Cb.length=0;var e;for(c>>=2;e=I[b++];)(e=105>e)&&c&1&&c++,Cb.push(e?Ka[c++>>1]:M[c]),++c;return Za[a].apply(null,Cb)},C:sb,l:function(){},p:Db,d:rb,e:ab,f:pb,s:function(a,b,c){I.copyWithin(a,
b,b+c)},G:function(a,b,c){Gb.length=b;c>>=3;for(var e=0;e<b;e++)Gb[e]=Ka[c+e];return(0>a?Za[-a-1]:Fc[a]).apply(null,Gb)},t:function(){B("OOM")},H:function(a,b,c){return Ib(a)?Jb(a,b,c):Lb(a,b,c)},k:function(){},F:function(){},N:function(a,b,c){R+=1;return setTimeout(function(){--R;W(function(){dynCall_vi.apply(null,[a,c])})},b)},n:function(a,b,c,e,h){function g(w){Qb(w,k,v,y,t)}function k(w,Nc){Rb(w,Nc.response,function(xa){--R;W(function(){r?dynCall_vi.apply(null,[r,xa]):b&&b(xa)},D)},function(xa){--R;
W(function(){r?dynCall_vi.apply(null,[r,xa]):b&&b(xa)},D)})}function u(w){Qb(w,O,v,y,t)}function t(w){W(function(){P?dynCall_vi.apply(null,[P,w]):h&&h(w)},D)}function v(w){--R;W(function(){x?dynCall_vi.apply(null,[x,w]):c&&c(w)},D)}function y(w){W(function(){G?dynCall_vi.apply(null,[G,w]):e&&e(w)},D)}function O(w){--R;W(function(){r?dynCall_vi.apply(null,[r,w]):b&&b(w)},D)}R+=1;var J=a+112,f=H(J),r=N[J+36>>2],x=N[J+40>>2],G=N[J+44>>2],P=N[J+48>>2],V=N[J+52>>2],Ea=!!(V&4),p=!!(V&32),C=!!(V&16),D=!!(V&
64);if("EM_IDB_STORE"===f)f=N[J+84>>2],Rb(a,I.slice(f,f+N[J+88>>2]),O,v);else if("EM_IDB_DELETE"===f)Tb(a,O,v);else if(C){if(p)return 0;Qb(a,Ea?k:O,v,y,t)}else Sb(a,O,p?v:Ea?g:u);return a},r:function(){return Ec(async()=>{var a=await d.queue.get();const b=Fa(a)+1,c=T(b);K(a,I,c,b);return c})},I:function(a,b){b>>=2;b={alpha:!!M[b],depth:!!M[b+1],stencil:!!M[b+2],antialias:!!M[b+3],premultipliedAlpha:!!M[b+4],preserveDrawingBuffer:!!M[b+5],powerPreference:ac[M[b+6]],failIfMajorPerformanceCaveat:!!M[b+
7],lb:M[b+8],Fb:M[b+9],Wa:M[b+10],fb:M[b+11],Hb:M[b+12],Ib:M[b+13]};a=Ib(a);return!a||b.fb?0:Xb(a,b)},v:ec,w:fc,g:function(a){lb(a)},i:gc,A:hc,q:ic,z:jc,M:function(){l.ib()},a:F||d.wasmMemory,B:function(){d.pauseQueue()},u:function(a,b,c,e){return pc(a,b,c,e)},j:function(){d.unpauseQueue()}};
(function(){function a(g,k){g=g.exports;g=Ac(g);d.asm=g;Na.unshift(d.asm.Q);l.Ua.push(d.asm.T);ya=k;z||Va()}function b(g){a(g.instance,g.module)}function c(g){return Ya().then(function(k){return WebAssembly.instantiate(k,e)}).then(g,function(k){E("failed to asynchronously prepare wasm: "+k);B(k)})}var e={a:Kc};z||Ua();if(d.instantiateWasm)try{var h=d.instantiateWasm(e,a);return h=Ac(h)}catch(g){return E("Module.instantiateWasm callback failed with error: "+g),!1}(function(){return wa||"function"!==
typeof WebAssembly.instantiateStreaming||Wa()||"function"!==typeof fetch?c(b):fetch(S,{credentials:"same-origin"}).then(function(g){return WebAssembly.instantiateStreaming(g,e).then(b,function(k){E("wasm streaming compile failed: "+k);E("falling back to ArrayBuffer instantiation");return c(b)})})})().catch(ba);return{}})();d.___wasm_call_ctors=function(){return(d.___wasm_call_ctors=d.asm.Q).apply(null,arguments)};
var Gc=d._main=function(){return(Gc=d._main=d.asm.R).apply(null,arguments)},hb=d._free=function(){return(hb=d._free=d.asm.S).apply(null,arguments)};d._emscripten_tls_init=function(){return(d._emscripten_tls_init=d.asm.T).apply(null,arguments)};var T=d._malloc=function(){return(T=d._malloc=d.asm.V).apply(null,arguments)};d._emscripten_current_thread_process_queued_calls=function(){return(d._emscripten_current_thread_process_queued_calls=d.asm.W).apply(null,arguments)};
var eb=d._emscripten_register_main_browser_thread_id=function(){return(eb=d._emscripten_register_main_browser_thread_id=d.asm.X).apply(null,arguments)},ub=d._emscripten_main_browser_thread_id=function(){return(ub=d._emscripten_main_browser_thread_id=d.asm.Y).apply(null,arguments)},Hc=d._emscripten_sync_run_in_main_thread_4=function(){return(Hc=d._emscripten_sync_run_in_main_thread_4=d.asm.Z).apply(null,arguments)},jb=d._emscripten_main_thread_process_queued_calls=function(){return(jb=d._emscripten_main_thread_process_queued_calls=
d.asm._).apply(null,arguments)},Fb=d._emscripten_run_in_main_runtime_thread_js=function(){return(Fb=d._emscripten_run_in_main_runtime_thread_js=d.asm.$).apply(null,arguments)},Kb=d.__emscripten_call_on_thread=function(){return(Kb=d.__emscripten_call_on_thread=d.asm.aa).apply(null,arguments)};d._emscripten_proxy_main=function(){return(d._emscripten_proxy_main=d.asm.ba).apply(null,arguments)};
var vb=d._pthread_testcancel=function(){return(vb=d._pthread_testcancel=d.asm.ca).apply(null,arguments)},gb=d._pthread_self=function(){return(gb=d._pthread_self=d.asm.da).apply(null,arguments)},Mb=d._pthread_exit=function(){return(Mb=d._pthread_exit=d.asm.ea).apply(null,arguments)},db=d.__emscripten_thread_init=function(){return(db=d.__emscripten_thread_init=d.asm.fa).apply(null,arguments)},Jc=d.___errno_location=function(){return(Jc=d.___errno_location=d.asm.ga).apply(null,arguments)},qb=d._emscripten_get_global_libc=
function(){return(qb=d._emscripten_get_global_libc=d.asm.ha).apply(null,arguments)},fb=d.___pthread_tsd_run_dtors=function(){return(fb=d.___pthread_tsd_run_dtors=d.asm.ia).apply(null,arguments)},Eb=d.stackSave=function(){return(Eb=d.stackSave=d.asm.ja).apply(null,arguments)},nb=d.stackRestore=function(){return(nb=d.stackRestore=d.asm.ka).apply(null,arguments)},Ha=d.stackAlloc=function(){return(Ha=d.stackAlloc=d.asm.la).apply(null,arguments)},mb=d._emscripten_stack_set_limits=function(){return(mb=
d._emscripten_stack_set_limits=d.asm.ma).apply(null,arguments)},Ic=d._memalign=function(){return(Ic=d._memalign=d.asm.na).apply(null,arguments)},dynCall_vi=d.dynCall_vi=function(){return(dynCall_vi=d.dynCall_vi=d.asm.oa).apply(null,arguments)},ob=d.dynCall_ii=function(){return(ob=d.dynCall_ii=d.asm.pa).apply(null,arguments)},dynCall_v=d.dynCall_v=function(){return(dynCall_v=d.dynCall_v=d.asm.qa).apply(null,arguments)};
d._asyncify_start_unwind=function(){return(d._asyncify_start_unwind=d.asm.ra).apply(null,arguments)};d._asyncify_stop_unwind=function(){return(d._asyncify_stop_unwind=d.asm.sa).apply(null,arguments)};d._asyncify_start_rewind=function(){return(d._asyncify_start_rewind=d.asm.ta).apply(null,arguments)};d._asyncify_stop_rewind=function(){return(d._asyncify_stop_rewind=d.asm.ua).apply(null,arguments)};var ib=d.__emscripten_allow_main_runtime_queued_calls=26576,bb=d.__emscripten_main_thread_futex=1169820;
d.keepRuntimeAlive=sa;d.PThread=l;d.PThread=l;d.wasmMemory=F;d.ExitStatus=ra;var Lc;function ra(a){this.name="ExitStatus";this.message="Program terminated with exit("+a+")";this.status=a}Ta=function Mc(){Lc||Oc();Lc||(Ta=Mc)};
function Oc(a){function b(){if(!Lc&&(Lc=!0,d.calledRun=!0,!za)){z||$a(Na);z||$a(Oa);aa(d);if(d.onRuntimeInitialized)d.onRuntimeInitialized();if(Pc){var c=a,e=d._emscripten_proxy_main;c=c||[];var h=c.length+1,g=Ha(4*(h+1));M[g>>2]=Ga(ja);for(var k=1;k<h;k++)M[(g>>2)+k]=Ga(c[k-1]);M[(g>>2)+h]=0;e(h,g)}if(!z){if(d.postRun)for("function"==typeof d.postRun&&(d.postRun=[d.postRun]);d.postRun.length;)c=d.postRun.shift(),Pa.unshift(c);$a(Pa)}}}a=a||ia;if(!(0<Ra))if(z)aa(d),z||$a(Na),postMessage({cmd:"loaded"});
else{if(!z){if(d.preRun)for("function"==typeof d.preRun&&(d.preRun=[d.preRun]);d.preRun.length;)Qa();$a(Ma)}0<Ra||(d.setStatus?(d.setStatus("Running..."),setTimeout(function(){setTimeout(function(){d.setStatus("")},1);b()},1)):b())}}d.run=Oc;function lb(a){Aa=a;if(z)throw postMessage({cmd:"exitProcess",returnCode:a}),new ra(a);sa()||l.Sa();Aa=a;if(!sa()){l.Sa();if(d.onExit)d.onExit(a);za=!0}ka(a,new ra(a))}if(d.preInit)for("function"==typeof d.preInit&&(d.preInit=[d.preInit]);0<d.preInit.length;)d.preInit.pop()();
var Pc=!0;d.noInitialRun&&(Pc=!1);z&&(noExitRuntime=!1,l.jb());Oc();


  return Stockfish.ready
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = Stockfish;
else if (typeof define === 'function' && define['amd'])
  define([], function() { return Stockfish; });
else if (typeof exports === 'object')
  exports["Stockfish"] = Stockfish;
return Stockfish;
}

if (typeof self !== "undefined" && self.location.hash.split(",")[1] === "worker" || typeof global !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]" && !require("worker_threads").isMainThread) {
    (function() {
        "use strict";var Module={};if(typeof process==="object"&&typeof process.versions==="object"&&typeof process.versions.node==="string"){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",function(data){onmessage({data:data})});var nodeFS=require("fs");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:function(f){(0,eval)(nodeFS.readFileSync(f,"utf8"))},postMessage:function(msg){parentPort.postMessage(msg)},performance:global.performance||{now:function(){return Date.now()}}})}function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=function(info,receiveInstance){var instance=new WebAssembly.Instance(Module["wasmModule"],info);receiveInstance(instance);Module["wasmModule"]=null;return instance.exports};function moduleLoaded(){}self.onmessage=function(e){try{if(e.data.cmd==="load"){Module["wasmModule"]=e.data.wasmModule;Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;Stockfish=INIT_ENGINE();Stockfish(Module).then(function(instance){Module=instance;moduleLoaded()})}else if(e.data.cmd==="objectTransfer"){Module["PThread"].receiveObjectTransfer(e.data)}else if(e.data.cmd==="run"){Module["__performance_now_clock_drift"]=performance.now()-e.data.time;Module["__emscripten_thread_init"](e.data.threadInfoStruct,/*isMainBrowserThread=*/0,/*isMainRuntimeThread=*/0);var max=e.data.stackBase;var top=e.data.stackBase+e.data.stackSize;Module["establishStackSpace"](top,max);Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInit();try{var result=Module["invokeEntryPoint"](e.data.start_routine,e.data.arg);if(Module["keepRuntimeAlive"]()){Module["PThread"].setExitStatus(result)}else{Module["PThread"].threadExit(result)}}catch(ex){if(ex==="Canceled!"){Module["PThread"].threadCancel()}else if(ex!="unwind"){if(ex instanceof Module["ExitStatus"]){if(Module["keepRuntimeAlive"]()){}else{Module["PThread"].threadExit(ex.status)}}else{Module["PThread"].threadExit(-2);throw ex}}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["PThread"].threadCancel()}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="processThreadQueue"){if(Module["_pthread_self"]()){Module["_emscripten_current_thread_process_queued_calls"]()}}else{err("worker.js received unknown command "+e.data.cmd);err(e.data)}}catch(ex){err("worker.js onmessage() captured an uncaught exception: "+ex);if(ex&&ex.stack)err(ex.stack);throw ex}};
//
// Patch `onmessage` to support custom message
//
const old_onmessage = self.onmessage;

const new_onmessage = (e) => {
  if (e.data.cmd === 'custom') {
    if (typeof Module['onCustomMessage'] === 'function') {
      Module['onCustomMessage'](e.data.userData);
    }
  } else {
    old_onmessage(e);
  }
}

onmessage = self.onmessage = new_onmessage;
    })();
/// Is it a web worker?
} else if (typeof onmessage !== "undefined" && (typeof window === "undefined" || typeof window.document === "undefined") || typeof global !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]") {
    (function ()
    {
        var isNode = typeof global !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]";
        var mod;
        var myEngine;
        var queue = [];
        var args;
        var wasmPath;
        
        function completer(line)
        {
            var completions = [
                "compiler",
                "d",
                "eval",
                "exit",
                "flip",
                "go ",
                "isready ",
                "ponderhit ",
                "position fen ",
                "position startpos",
                "position startpos moves",
                "quit",
                "setoption name Clear Hash value true",
                "setoption name Contempt value ",
                "setoption name Hash value ",
                "setoption name Minimum Thinking Time value ",
                "setoption name Move Overhead value ",
                "setoption name MultiPV value ",
                "setoption name Ponder value ",
                //"setoption name Skill Level Maximum Error value ",
                //"setoption name Skill Level Probability value ",
                "setoption name Skill Level value ",
                "setoption name Slow Mover value ",
                "setoption name Threads value ",
                "setoption name UCI_Chess960 value false",
                "setoption name UCI_Chess960 value true",
                "setoption name UCI_AnalyseMode value true",
                "setoption name UCI_AnalyseMode value false",
                "setoption name UCI_LimitStrength value true",
                "setoption name UCI_LimitStrength value false",
                "setoption name UCI_Elo value ",
                "setoption name UCI_ShowWDL value true",
                "setoption name UCI_ShowWDL value false",
                "setoption name Use NNUE value true",
                "setoption name Use NNUE value false",
                "setoption name nodestime value ",
                "setoption name EvalFile value ",
                "stop",
                "uci",
                "ucinewgame"
            ];
            var completionsMid = [
                "binc ",
                "btime ",
                "confidence ",
                "depth ",
                "infinite ",
                "mate ",
                "maxdepth ",
                "maxtime ",
                "mindepth ",
                "mintime ",
                "moves ", /// for position fen ... moves
                "movestogo ",
                "movetime ",
                "ponder ",
                "searchmoves ",
                "shallow ",
                "winc ",
                "wtime "
            ];
            
            function filter(c)
            {
                return c.indexOf(line) === 0;
            }
            
            /// This looks for completions starting at the very beginning of the line.
            /// If the user has typed nothing, it will match everything.
            var hits = completions.filter(filter);
            
            if (!hits.length) {
                /// Just get the last word.
                line = line.replace(/^.*\s/, "");
                if (line) {
                    /// Find completion mid line too.
                    hits = completionsMid.filter(filter);
                } else {
                    /// If no word has been typed, show all options.
                    hits = completionsMid;
                }
            }
            
            return [hits, line];
        }
        
        if (isNode) {
            ///NOTE: Node.js v14+ needs --experimental-wasm-threads --experimental-wasm-simd
            /// Was it called directly?
            if (require.main === module) {
                wasmPath = require("path").join(__dirname, "stockfish.wasm");
                mod = {
                    locateFile: function (path)
                    {
                        if (path.indexOf(".wasm") > -1) {
                            /// Set the path to the wasm binary.
                            return wasmPath;
                        } else {
                            /// Set path to worker (self + the worker hash)
                            return __filename;
                        }
                    },
                };
                Stockfish = INIT_ENGINE();
                Stockfish(mod).then(function (sf)
                {
                    myEngine = sf;
                    sf.addMessageListener(function (line)
                    {
                        console.log(line);
                    });
                    
                    if (queue.length) {
                        queue.forEach(function (line)
                        {
                            sf.postMessage(line, true);
                        });
                    }
                    queue = null;
                });
                
                require("readline").createInterface({
                    input: process.stdin,
                    output: process.stdout,
                    completer: completer,
                    historySize: 100,
                }).on("line", function online(line)
                {
                    if (line) {
                        if (line === "quit" || line === "exit") {
                            process.exit();
                        }
                        if (myEngine) {
                            myEngine.postMessage(line, true);
                        } else {
                            queue.push(line);
                        }
                    }
                }).on("close", function onend()
                {
                    process.exit();
                }).setPrompt("");
                
            /// Is this a node module?
            } else {
                module.exports = INIT_ENGINE;
            }
        } else {
            args = self.location.hash.substr(1).split(",");
            wasmPath = decodeURIComponent(args[0] || "stockfish.wasm");
            mod = {
                locateFile: function (path)
                {
                    if (path.indexOf(".wasm") > -1) {
                        /// Set the path to the wasm binary.
                        return wasmPath;
                    } else {
                        /// Set path to worker (self + the worker hash)
                        return self.location.origin + self.location.pathname + "#" + wasmPath + ",worker";
                    }
                }
            };
            Stockfish = INIT_ENGINE();
            Stockfish(mod).then(function (sf)
            {
                myEngine = sf;
                sf.addMessageListener(function (line)
                {
                    postMessage(line);
                });
                
                if (queue.length) {
                    queue.forEach(function (line)
                    {
                        sf.postMessage(line, true);
                    });
                }
                queue = null;
            });
            
            /// Make sure that this is only added once.
            if (!onmessage) {
                onmessage = function (event)
                {
                    if (myEngine) {
                        myEngine.postMessage(event.data, true);
                    } else {
                        queue.push(event.data);
                    }
                };
            }
        }
    }());
} else {
    ///NOTE: If it's a normal browser, the client can use the Stockfish() function directly.
    Stockfish = INIT_ENGINE();
}