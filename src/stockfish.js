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
d.postCustomMessage=function(a){for(var b of l.ya)b.postMessage({cmd:"custom",userData:a})};d.queue=function(){var a=[],b;return{get:async function(){return 0<a.length?a.shift():await new Promise(function(c){return b=c})},put:function(c){b?(b(c),b=null):a.push(c)}}}();d.onCustomMessage=function(a){ca?da.push(a):d.queue.put(a)};var ca,da=[];d.pauseQueue=function(){ca=!0};d.unpauseQueue=function(){var a=da;da=[];ca=!1;a.forEach(function(b){d.queue.put(b)})};d.postMessage=d.postCustomMessage;
var ea=[];d.addMessageListener=function(a){ea.push(a)};d.removeMessageListener=function(a){a=ea.indexOf(a);0<=a&&ea.splice(a,1)};d.print=d.printErr=function(a){if(0===ea.length)return console.log(a);for(var b of ea)b(a)};d.terminate=function(){l.Ra()};var fa={},m;for(m in d)d.hasOwnProperty(m)&&(fa[m]=d[m]);var ha=[],ia="./this.program";function ja(a,b){throw b;}
var ka="object"===typeof window,n="function"===typeof importScripts,q="object"===typeof process&&"object"===typeof process.versions&&"string"===typeof process.versions.node,z=d.ENVIRONMENT_IS_PTHREAD||!1,A="";function la(a){return d.locateFile?d.locateFile(a,A):A+a}var ma,na,oa,pa;
if(q){A=n?require("path").dirname(A)+"/":__dirname+"/";ma=function(a,b){oa||(oa=require("fs"));pa||(pa=require("path"));a=pa.normalize(a);return oa.readFileSync(a,b?null:"utf8")};na=function(a){a=ma(a,!0);a.buffer||(a=new Uint8Array(a));assert(a.buffer);return a};1<process.argv.length&&(ia=process.argv[1].replace(/\\/g,"/"));ha=process.argv.slice(2);process.on("uncaughtException",function(a){if(!(a instanceof qa))throw a;});process.on("unhandledRejection",B);ja=function(a,b){if(ra())throw process.exitCode=
a,b;process.exit(a)};d.inspect=function(){return"[Emscripten Module object]"};var sa;try{sa=require("worker_threads")}catch(a){throw console.error('The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?'),a;}global.Worker=sa.Worker}else if(ka||n)n?A=self.location.href:"undefined"!==typeof document&&document.currentScript&&(A=document.currentScript.src),_scriptDir&&(A=_scriptDir),0!==A.indexOf("blob:")?A=A.substr(0,A.lastIndexOf("/")+1):A="",q?(ma=function(a,
b){oa||(oa=require("fs"));pa||(pa=require("path"));a=pa.normalize(a);return oa.readFileSync(a,b?null:"utf8")},na=function(a){a=ma(a,!0);a.buffer||(a=new Uint8Array(a));assert(a.buffer);return a}):(ma=function(a){var b=new XMLHttpRequest;b.open("GET",a,!1);b.send(null);return b.responseText},n&&(na=function(a){var b=new XMLHttpRequest;b.open("GET",a,!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)}));q&&"undefined"===typeof performance&&(global.performance=require("perf_hooks").performance);
var ta=d.print||console.log.bind(console),E=d.printErr||console.warn.bind(console);for(m in fa)fa.hasOwnProperty(m)&&(d[m]=fa[m]);fa=null;d.arguments&&(ha=d.arguments);d.thisProgram&&(ia=d.thisProgram);d.quit&&(ja=d.quit);var ua,va;d.wasmBinary&&(va=d.wasmBinary);var noExitRuntime=d.noExitRuntime||!0;"object"!==typeof WebAssembly&&B("no native wasm support detected");var F,wa,ya=!1,za;function assert(a,b){a||B("Assertion failed: "+b)}
function Aa(a){var b=new TextDecoder(a);this.decode=function(c){c.buffer instanceof SharedArrayBuffer&&(c=new Uint8Array(c));return b.decode.call(b,c)}}var Ba="undefined"!==typeof TextDecoder?new Aa("utf8"):void 0;
function Ca(a,b,c){var e=b+c;for(c=b;a[c]&&!(c>=e);)++c;if(16<c-b&&a.subarray&&Ba)return Ba.decode(a.subarray(b,c));for(e="";b<c;){var h=a[b++];if(h&128){var g=a[b++]&63;if(192==(h&224))e+=String.fromCharCode((h&31)<<6|g);else{var k=a[b++]&63;h=224==(h&240)?(h&15)<<12|g<<6|k:(h&7)<<18|g<<12|k<<6|a[b++]&63;65536>h?e+=String.fromCharCode(h):(h-=65536,e+=String.fromCharCode(55296|h>>10,56320|h&1023))}}else e+=String.fromCharCode(h)}return e}function H(a){return a?Ca(I,a,void 0):""}
function K(a,b,c,e){if(0<e){e=c+e-1;for(var h=0;h<a.length;++h){var g=a.charCodeAt(h);if(55296<=g&&57343>=g){var k=a.charCodeAt(++h);g=65536+((g&1023)<<10)|k&1023}if(127>=g){if(c>=e)break;b[c++]=g}else{if(2047>=g){if(c+1>=e)break;b[c++]=192|g>>6}else{if(65535>=g){if(c+2>=e)break;b[c++]=224|g>>12}else{if(c+3>=e)break;b[c++]=240|g>>18;b[c++]=128|g>>12&63}b[c++]=128|g>>6&63}b[c++]=128|g&63}}b[c]=0}}
function Da(a){for(var b=0,c=0;c<a.length;++c){var e=a.charCodeAt(c);55296<=e&&57343>=e&&(e=65536+((e&1023)<<10)|a.charCodeAt(++c)&1023);127>=e?++b:b=2047>=e?b+2:65535>=e?b+3:b+4}return b}"undefined"!==typeof TextDecoder&&new Aa("utf-16le");function Fa(a){var b=Da(a)+1,c=Ga(b);K(a,Ha,c,b);return c}var Ia,Ha,I,L,M,N,Ja;z&&(Ia=d.buffer);var Ka=d.INITIAL_MEMORY||1073741824;
if(z)F=d.wasmMemory,Ia=d.buffer;else if(d.wasmMemory)F=d.wasmMemory;else if(F=new WebAssembly.Memory({initial:Ka/65536,maximum:Ka/65536,shared:!0}),!(F.buffer instanceof SharedArrayBuffer))throw E("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"),q&&console.log("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and also use a recent version)"),
Error("bad memory");F&&(Ia=F.buffer);Ka=Ia.byteLength;var Q=Ia;Ia=Q;d.HEAP8=Ha=new Int8Array(Q);d.HEAP16=new Int16Array(Q);d.HEAP32=M=new Int32Array(Q);d.HEAPU8=I=new Uint8Array(Q);d.HEAPU16=L=new Uint16Array(Q);d.HEAPU32=N=new Uint32Array(Q);d.HEAPF32=new Float32Array(Q);d.HEAPF64=Ja=new Float64Array(Q);var La=[],Ma=[],Na=[],Oa=[],R=0;function ra(){return noExitRuntime||0<R}function Pa(){var a=d.preRun.shift();La.unshift(a)}var Qa=0,Ra=null,Sa=null;
function Ta(){Qa++;d.monitorRunDependencies&&d.monitorRunDependencies(Qa)}function Ua(){Qa--;d.monitorRunDependencies&&d.monitorRunDependencies(Qa);if(0==Qa&&(null!==Ra&&(clearInterval(Ra),Ra=null),Sa)){var a=Sa;Sa=null;a()}}d.preloadedImages={};d.preloadedAudios={};function B(a){if(d.onAbort)d.onAbort(a);assert(!z);E(a);ya=!0;za=1;a=new WebAssembly.RuntimeError("abort("+a+"). Build with -s ASSERTIONS=1 for more info.");ba(a);throw a;}
function Va(){return S.startsWith("data:application/octet-stream;base64,")}var S;S="stockfish.wasm";Va()||(S=la(S));function Wa(){var a=S;try{if(a==S&&va)return new Uint8Array(va);if(na)return na(a);throw"both async and sync fetching of the wasm failed";}catch(b){B(b)}}
function Xa(){return va||!ka&&!n||"function"!==typeof fetch?Promise.resolve().then(function(){return Wa()}):fetch(S,{credentials:"same-origin"}).then(function(a){if(!a.ok)throw"failed to load wasm binary file at '"+S+"'";return a.arrayBuffer()}).catch(function(){return Wa()})}var Ya={28269:function(){throw"Canceled!";}};
function Za(a){for(;0<a.length;){var b=a.shift();if("function"==typeof b)b(d);else{var c=b.Va;"number"===typeof c?void 0===b.Da?dynCall_v.call(null,c):dynCall_vi.apply(null,[c,b.Da]):c(void 0===b.Da?null:b.Da)}}}
function $a(a,b){if(0>=a||a>Ha.length||a&1||0>b)return-28;if(0==b)return 0;2147483647<=b&&(b=Infinity);var c=Atomics.load(M,ab>>2),e=0;if(c==a&&Atomics.compareExchange(M,ab>>2,c,0)==c&&(--b,e=1,0>=b))return 1;a=Atomics.notify(M,a>>2,b);if(0<=a)return a+e;throw"Atomics.notify returned an unexpected value "+a;}d._emscripten_futex_wake=$a;
function bb(a){if(z)throw"Internal Error! cleanupThread() can only ever be called from main application thread!";if(!a)throw"Internal Error! Null pthread_ptr in cleanupThread!";var b=l.wa[a];b&&(M[a+12>>2]=0,l.Ka(b.worker))}
var l={za:[],ya:[],Ta:[],Db:function(){},gb:function(){for(var a=T(228),b=0;57>b;++b)N[a/4+b]=0;M[a+12>>2]=a;b=a+152;M[b>>2]=b;var c=T(512);for(b=0;128>b;++b)N[c/4+b]=0;Atomics.store(N,a+100>>2,c);Atomics.store(N,a+40>>2,a);cb(a,!n,1);db(a)},hb:function(){l.receiveObjectTransfer=l.kb;l.threadInit=l.pb;l.threadCancel=l.ob;l.threadExit=l.$a;l.setExitStatus=l.mb},wa:{},Sa:[],Ya:function(){for(;0<l.Sa.length;)l.Sa.pop()();eb()},Za:function(a,b){Atomics.store(N,a+56>>2,1);Atomics.store(N,a+60>>2,0);l.Ya();
Atomics.store(N,a+4>>2,b);Atomics.store(N,a+0>>2,1);$a(a+0,2147483647);cb(0,0,0)},mb:function(a){za=a},$a:function(a){var b=fb();b&&(l.Za(b,a),z&&postMessage({cmd:"exit"}))},ob:function(){l.Za(fb(),-1);postMessage({cmd:"cancelDone"})},Ra:function(){for(var a in l.wa){var b=l.wa[a];b&&b.worker&&l.Ka(b.worker)}l.wa={};for(a=0;a<l.za.length;++a){var c=l.za[a];c.terminate()}l.za=[];for(a=0;a<l.ya.length;++a)c=l.ya[a],b=c.va,l.Pa(b),c.terminate();l.ya=[]},Pa:function(a){if(a){if(a.xa){var b=M[a.xa+100>>
2];M[a.xa+100>>2]=0;gb(b);gb(a.xa)}a.xa=0;a.Oa&&a.Aa&&gb(a.Aa);a.Aa=0;a.worker&&(a.worker.va=null)}},Ka:function(a){l.lb(function(){delete l.wa[a.va.xa];l.za.push(a);l.ya.splice(l.ya.indexOf(a),1);l.Pa(a.va);a.va=void 0})},lb:function(a){M[hb>>2]=0;try{a()}finally{M[hb>>2]=1}},kb:function(){},pb:function(){for(var a in l.Ta)l.Ta[a]()},ib:function(a,b){a.onmessage=function(c){var e=c.data,h=e.cmd;a.va&&(l.bb=a.va.xa);if(e.targetThread&&e.targetThread!=fb()){var g=l.wa[e.Ib];g?g.worker.postMessage(c.data,
e.transferList):E('Internal error! Worker sent a message "'+h+'" to target pthread '+e.targetThread+", but that thread no longer exists!")}else if("processQueuedMainThreadWork"===h)ib();else if("spawnThread"===h)jb(c.data);else if("cleanupThread"===h)bb(e.thread);else if("killThread"===h){c=e.thread;if(z)throw"Internal Error! killThread() can only ever be called from main application thread!";if(!c)throw"Internal Error! Null pthread_ptr in killThread!";M[c+12>>2]=0;e=l.wa[c];delete l.wa[c];e.worker.terminate();
l.Pa(e);l.ya.splice(l.ya.indexOf(e.worker),1);e.worker.va=void 0}else if("cancelThread"===h){c=e.thread;if(z)throw"Internal Error! cancelThread() can only ever be called from main application thread!";if(!c)throw"Internal Error! Null pthread_ptr in cancelThread!";l.wa[c].worker.postMessage({cmd:"cancel"})}else if("loaded"===h)a.loaded=!0,b&&b(a),a.Ea&&(a.Ea(),delete a.Ea);else if("print"===h)ta("Thread "+e.threadId+": "+e.text);else if("printErr"===h)E("Thread "+e.threadId+": "+e.text);else if("alert"===
h)alert("Thread "+e.threadId+": "+e.text);else if("exit"===h)a.va&&Atomics.load(N,a.va.xa+64>>2)&&l.Ka(a);else if("exitProcess"===h)try{kb(e.returnCode)}catch(k){if(k instanceof qa)return;throw k;}else"cancelDone"===h?l.Ka(a):"objectTransfer"!==h&&("setimmediate"===c.data.target?a.postMessage(c.data):E("worker sent an unknown command "+h));l.bb=void 0};a.onerror=function(c){E("pthread sent an error! "+c.filename+":"+c.lineno+": "+c.message)};q&&(a.on("message",function(c){a.onmessage({data:c})}),
a.on("error",function(c){a.onerror(c)}),a.on("exit",function(){}));a.postMessage({cmd:"load",urlOrBlob:d.mainScriptUrlOrBlob||_scriptDir,wasmMemory:F,wasmModule:wa})},ab:function(){var a=la("stockfish.worker.js");l.za.push(new Worker(a))},eb:function(){0==l.za.length&&(l.ab(),l.ib(l.za[0]));return l.za.pop()},wb:function(a){for(a=performance.now()+a;performance.now()<a;);}};d.establishStackSpace=function(a,b){lb(a,b);mb(a)};d.invokeEntryPoint=function(a,b){return nb.apply(null,[a,b])};var ob;
ob=q?function(){var a=process.hrtime();return 1E3*a[0]+a[1]/1E6}:z?function(){return performance.now()-d.__performance_now_clock_drift}:function(){return performance.now()};
function jb(a){if(z)throw"Internal Error! spawnThread() can only ever be called from main application thread!";var b=l.eb();if(!b)return 6;if(void 0!==b.va)throw"Internal error!";if(!a.Ja)throw"Internal error, no pthread ptr!";l.ya.push(b);for(var c=T(512),e=0;128>e;++e)M[c+4*e>>2]=0;var h=a.Aa+a.Ba;e=l.wa[a.Ja]={worker:b,Aa:a.Aa,Ba:a.Ba,Oa:a.Oa,xa:a.Ja};var g=e.xa>>2;Atomics.store(N,g+16,a.detached);Atomics.store(N,g+25,c);Atomics.store(N,g+10,e.xa);Atomics.store(N,g+20,a.Ba);Atomics.store(N,g+19,
h);Atomics.store(N,g+26,a.Ba);Atomics.store(N,g+28,h);Atomics.store(N,g+29,a.detached);c=pb()+40;Atomics.store(N,g+43,c);b.va=e;var k={cmd:"run",start_routine:a.nb,arg:a.Da,threadInfoStruct:a.Ja,stackBase:a.Aa,stackSize:a.Ba};b.Ea=function(){k.time=performance.now();b.postMessage(k,a.ub)};b.loaded&&(b.Ea(),delete b.Ea);return 0}
function qb(a,b,c){if(0>=a||a>Ha.length||a&1)return-28;if(ka){if(Atomics.load(M,a>>2)!=b)return-6;var e=performance.now();c=e+c;for(Atomics.exchange(M,ab>>2,a);;){e=performance.now();if(e>c)return Atomics.exchange(M,ab>>2,0),-73;e=Atomics.exchange(M,ab>>2,0);if(0==e)break;ib();if(Atomics.load(M,a>>2)!=b)return-6;Atomics.exchange(M,ab>>2,a)}return 0}a=Atomics.wait(M,a>>2,b,c);if("timed-out"===a)return-73;if("not-equal"===a)return-6;if("ok"===a)return 0;throw"Atomics.wait returned an unexpected value "+
a;}function rb(){q||n||(ua||(ua={}),ua["Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread"]||(ua["Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread"]=1,E("Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread")))}
function sb(a,b){if(!a)return E("pthread_join attempted on a null thread pointer!"),71;if(z&&fb()==a)return E("PThread "+a+" is attempting to join to itself!"),16;if(!z&&tb()==a)return E("Main thread "+a+" is attempting to join to itself!"),16;if(M[a+12>>2]!==a)return E("pthread_join attempted on thread "+a+", which does not point to a valid thread, or does not exist anymore!"),71;if(Atomics.load(N,a+64>>2))return E("Attempted to join thread "+a+", which was already detached!"),28;for(rb();;){var c=
Atomics.load(N,a>>2);if(1==c)return c=Atomics.load(N,a+4>>2),b&&(M[b>>2]=c),Atomics.store(N,a+64>>2,1),z?postMessage({cmd:"cleanupThread",thread:a}):bb(a),0;ub();z||ib();qb(a,c,z?100:1)}}var vb=[null,[],[]],wb={};function xb(a,b,c){return z?U(2,1,a,b,c):0}function yb(a,b,c){return z?U(3,1,a,b,c):0}function zb(a,b,c){if(z)return U(4,1,a,b,c)}function Ab(){if(z)return U(5,1);B()}var Bb=[];function Cb(a){if(z)return U(6,1,a);noExitRuntime=!1;R=0;kb(a)}
function U(a,b){for(var c=arguments.length-2,e=Db(),h=Ga(8*c),g=h>>3,k=0;k<c;k++)Ja[g+k]=arguments[2+k];c=Eb(a,c,h,b);mb(e);return c}var Fb=[],Gb=[0,"undefined"!==typeof document?document:0,"undefined"!==typeof window?window:0];function Hb(a){a=2<a?H(a):a;return Gb[a]||("undefined"!==typeof document?document.querySelector(a):void 0)}
function Ib(a,b,c){var e=Hb(a);if(!e)return-4;e.Ia&&(M[e.Ia>>2]=b,M[e.Ia+4>>2]=c);if(e.Xa||!e.yb)e.Xa&&(e=e.Xa),a=!1,e.Ha&&e.Ha.Ga&&(a=e.Ha.Ga.getParameter(2978),a=0===a[0]&&0===a[1]&&a[2]===e.width&&a[3]===e.height),e.width=b,e.height=c,a&&e.Ha.Ga.viewport(0,0,b,c);else{if(e.Ia){e=M[e.Ia+8>>2];a=a?H(a):"";var h=Db(),g=Ga(12),k=0;if(a){k=Da(a)+1;var u=T(k);K(a,I,u,k);k=u}M[g>>2]=k;M[g+4>>2]=b;M[g+8>>2]=c;Jb(0,e,657457152,0,k,g);mb(h);return 1}return-4}return 0}
function Kb(a,b,c){return z?U(7,1,a,b,c):Ib(a,b,c)}function W(a,b){if(!ya)if(b)a();else{try{a()}catch(c){if(c instanceof qa)return;if("unwind"!==c)throw c&&"object"===typeof c&&c.stack&&E("exception thrown: "+[c,c.stack]),c;}if(z&&!ra())try{z?Lb(za):kb(za)}catch(c){if(!(c instanceof qa))throw c;}}}var Mb=[];function X(a,b){N[a>>2]=b;N[a+4>>2]=b/4294967296|0}
function Nb(a,b){try{var c=indexedDB.open("emscripten_filesystem",1)}catch(e){b(e);return}c.onupgradeneeded=function(e){e=e.target.result;e.objectStoreNames.contains("FILES")&&e.deleteObjectStore("FILES");e.createObjectStore("FILES")};c.onsuccess=function(e){a(e.target.result)};c.onerror=function(e){b(e)}}var Ob;
function Pb(a,b,c,e,h){function g(C){var D=0,w=0;C&&(w=p.response?p.response.byteLength:0,D=T(w),I.set(new Uint8Array(p.response),D));N[a+12>>2]=D;X(a+16,w)}var k=N[a+8>>2];if(k){var u=H(k),t=a+112,v=H(t);v||(v="GET");var y=N[t+52>>2],O=N[t+56>>2],J=!!N[t+60>>2],f=N[t+68>>2],r=N[t+72>>2];k=N[t+76>>2];var x=N[t+80>>2],G=N[t+84>>2];t=N[t+88>>2];var P=!!(y&1),V=!!(y&2);y=!!(y&64);f=f?H(f):void 0;r=r?H(r):void 0;var Ea=x?H(x):void 0,p=new XMLHttpRequest;p.withCredentials=J;p.open(v,u,!y,f,r);y||(p.timeout=
O);p.vb=u;p.responseType="arraybuffer";x&&p.overrideMimeType(Ea);if(k)for(;;){v=N[k>>2];if(!v)break;u=N[k+4>>2];if(!u)break;k+=8;v=H(v);u=H(u);p.setRequestHeader(v,u)}Mb.push(p);N[a+0>>2]=Mb.length;k=G&&t?I.slice(G,G+t):null;p.onload=function(C){g(P&&!V);var D=p.response?p.response.byteLength:0;X(a+24,0);D&&X(a+32,D);L[a+40>>1]=p.readyState;L[a+42>>1]=p.status;p.statusText&&K(p.statusText,I,a+44,64);200<=p.status&&300>p.status?b&&b(a,p,C):c&&c(a,p,C)};p.onerror=function(C){g(P);var D=p.status;X(a+
24,0);X(a+32,p.response?p.response.byteLength:0);L[a+40>>1]=p.readyState;L[a+42>>1]=D;c&&c(a,p,C)};p.ontimeout=function(C){c&&c(a,p,C)};p.onprogress=function(C){var D=P&&V&&p.response?p.response.byteLength:0,w=0;P&&V&&(w=T(D),I.set(new Uint8Array(p.response),w));N[a+12>>2]=w;X(a+16,D);X(a+24,C.loaded-D);X(a+32,C.total);L[a+40>>1]=p.readyState;3<=p.readyState&&0===p.status&&0<C.loaded&&(p.status=200);L[a+42>>1]=p.status;p.statusText&&K(p.statusText,I,a+44,64);e&&e(a,p,C);w&&gb(w)};p.onreadystatechange=
function(C){L[a+40>>1]=p.readyState;2<=p.readyState&&(L[a+42>>1]=p.status);h&&h(a,p,C)};try{p.send(k)}catch(C){c&&c(a,p,C)}}else c(a,0,"no url specified!")}
function Qb(a,b,c,e){var h=Ob;if(h){var g=N[a+112+64>>2];g||(g=N[a+8>>2]);var k=H(g);try{var u=h.transaction(["FILES"],"readwrite").objectStore("FILES").put(b,k);u.onsuccess=function(){L[a+40>>1]=4;L[a+42>>1]=200;K("OK",I,a+44,64);c(a,0,k)};u.onerror=function(t){L[a+40>>1]=4;L[a+42>>1]=413;K("Payload Too Large",I,a+44,64);e(a,0,t)}}catch(t){e(a,0,t)}}else e(a,0,"IndexedDB not available!")}
function Rb(a,b,c){var e=Ob;if(e){var h=N[a+112+64>>2];h||(h=N[a+8>>2]);h=H(h);try{var g=e.transaction(["FILES"],"readonly").objectStore("FILES").get(h);g.onsuccess=function(k){if(k.target.result){k=k.target.result;var u=k.byteLength||k.length,t=T(u);I.set(new Uint8Array(k),t);N[a+12>>2]=t;X(a+16,u);X(a+24,0);X(a+32,u);L[a+40>>1]=4;L[a+42>>1]=200;K("OK",I,a+44,64);b(a,0,k)}else L[a+40>>1]=4,L[a+42>>1]=404,K("Not Found",I,a+44,64),c(a,0,"no data")};g.onerror=function(k){L[a+40>>1]=4;L[a+42>>1]=404;
K("Not Found",I,a+44,64);c(a,0,k)}}catch(k){c(a,0,k)}}else c(a,0,"IndexedDB not available!")}
function Sb(a,b,c){var e=Ob;if(e){var h=N[a+112+64>>2];h||(h=N[a+8>>2]);h=H(h);try{var g=e.transaction(["FILES"],"readwrite").objectStore("FILES").delete(h);g.onsuccess=function(k){k=k.target.result;N[a+12>>2]=0;X(a+16,0);X(a+24,0);X(a+32,0);L[a+40>>1]=4;L[a+42>>1]=200;K("OK",I,a+44,64);b(a,0,k)};g.onerror=function(k){L[a+40>>1]=4;L[a+42>>1]=404;K("Not Found",I,a+44,64);c(a,0,k)}}catch(k){c(a,0,k)}}else c(a,0,"IndexedDB not available!")}
function Tb(a){var b=a.getExtension("ANGLE_instanced_arrays");b&&(a.vertexAttribDivisor=function(c,e){b.vertexAttribDivisorANGLE(c,e)},a.drawArraysInstanced=function(c,e,h,g){b.drawArraysInstancedANGLE(c,e,h,g)},a.drawElementsInstanced=function(c,e,h,g,k){b.drawElementsInstancedANGLE(c,e,h,g,k)})}
function Ub(a){var b=a.getExtension("OES_vertex_array_object");b&&(a.createVertexArray=function(){return b.createVertexArrayOES()},a.deleteVertexArray=function(c){b.deleteVertexArrayOES(c)},a.bindVertexArray=function(c){b.bindVertexArrayOES(c)},a.isVertexArray=function(c){return b.isVertexArrayOES(c)})}function Vb(a){var b=a.getExtension("WEBGL_draw_buffers");b&&(a.drawBuffers=function(c,e){b.drawBuffersWEBGL(c,e)})}
function Wb(a,b){a.Wa||(a.Wa=a.getContext,a.getContext=function(e,h){h=a.Wa(e,h);return"webgl"==e==h instanceof WebGLRenderingContext?h:null});var c=a.getContext("webgl",b);return c?Xb(c,b):0}function Xb(a,b){var c=T(8);M[c+4>>2]=fb();var e={Cb:c,attributes:b,version:b.jb,Ga:a};a.canvas&&(a.canvas.Ha=e);("undefined"===typeof b.Ua||b.Ua)&&Yb(e);return c}
function Yb(a){a||(a=Zb);if(!a.fb){a.fb=!0;var b=a.Ga;Tb(b);Ub(b);Vb(b);b.zb=b.getExtension("EXT_disjoint_timer_query");b.Fb=b.getExtension("WEBGL_multi_draw");(b.getSupportedExtensions()||[]).forEach(function(c){c.includes("lose_context")||c.includes("debug")||b.getExtension(c)})}}var Zb,$b=["default","low-power","high-performance"],ac={};
function bc(){if(!cc){var a={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:("object"===typeof navigator&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:ia||"./this.program"},b;for(b in ac)void 0===ac[b]?delete a[b]:a[b]=ac[b];var c=[];for(b in a)c.push(b+"="+a[b]);cc=c}return cc}var cc;
function dc(a,b){if(z)return U(8,1,a,b);var c=0;bc().forEach(function(e,h){var g=b+c;h=M[a+4*h>>2]=g;for(g=0;g<e.length;++g)Ha[h++>>0]=e.charCodeAt(g);Ha[h>>0]=0;c+=e.length+1});return 0}function ec(a,b){if(z)return U(9,1,a,b);var c=bc();M[a>>2]=c.length;var e=0;c.forEach(function(h){e+=h.length+1});M[b>>2]=e;return 0}function fc(a){return z?U(10,1,a):0}function gc(a,b,c,e){if(z)return U(11,1,a,b,c,e);a=wb.Bb(a);b=wb.Ab(a,b,c);M[e>>2]=b;return 0}
function hc(a,b,c,e,h){if(z)return U(12,1,a,b,c,e,h)}function ic(a,b,c,e){if(z)return U(13,1,a,b,c,e);for(var h=0,g=0;g<c;g++){for(var k=M[b+8*g>>2],u=M[b+(8*g+4)>>2],t=0;t<u;t++){var v=I[k+t],y=vb[a];0===v||10===v?((1===a?ta:E)(Ca(y,0)),y.length=0):y.push(v)}h+=u}M[e>>2]=h;return 0}function jc(a){return 0===a%4&&(0!==a%100||0===a%400)}function kc(a,b){for(var c=0,e=0;e<=b;c+=a[e++]);return c}var lc=[31,29,31,30,31,30,31,31,30,31,30,31],mc=[31,28,31,30,31,30,31,31,30,31,30,31];
function nc(a,b){for(a=new Date(a.getTime());0<b;){var c=a.getMonth(),e=(jc(a.getFullYear())?lc:mc)[c];if(b>e-a.getDate())b-=e-a.getDate()+1,a.setDate(1),11>c?a.setMonth(c+1):(a.setMonth(0),a.setFullYear(a.getFullYear()+1));else{a.setDate(a.getDate()+b);break}}return a}
function oc(a,b,c,e){function h(f,r,x){for(f="number"===typeof f?f.toString():f||"";f.length<r;)f=x[0]+f;return f}function g(f,r){return h(f,r,"0")}function k(f,r){function x(P){return 0>P?-1:0<P?1:0}var G;0===(G=x(f.getFullYear()-r.getFullYear()))&&0===(G=x(f.getMonth()-r.getMonth()))&&(G=x(f.getDate()-r.getDate()));return G}function u(f){switch(f.getDay()){case 0:return new Date(f.getFullYear()-1,11,29);case 1:return f;case 2:return new Date(f.getFullYear(),0,3);case 3:return new Date(f.getFullYear(),
0,2);case 4:return new Date(f.getFullYear(),0,1);case 5:return new Date(f.getFullYear()-1,11,31);case 6:return new Date(f.getFullYear()-1,11,30)}}function t(f){f=nc(new Date(f.U+1900,0,1),f.Na);var r=new Date(f.getFullYear()+1,0,4),x=u(new Date(f.getFullYear(),0,4));r=u(r);return 0>=k(x,f)?0>=k(r,f)?f.getFullYear()+1:f.getFullYear():f.getFullYear()-1}var v=M[e+40>>2];e={sb:M[e>>2],rb:M[e+4>>2],La:M[e+8>>2],Fa:M[e+12>>2],Ca:M[e+16>>2],U:M[e+20>>2],Ma:M[e+24>>2],Na:M[e+28>>2],Jb:M[e+32>>2],qb:M[e+36>>
2],tb:v?H(v):""};c=H(c);v={"%c":"%a %b %d %H:%M:%S %Y","%D":"%m/%d/%y","%F":"%Y-%m-%d","%h":"%b","%r":"%I:%M:%S %p","%R":"%H:%M","%T":"%H:%M:%S","%x":"%m/%d/%y","%X":"%H:%M:%S","%Ec":"%c","%EC":"%C","%Ex":"%m/%d/%y","%EX":"%H:%M:%S","%Ey":"%y","%EY":"%Y","%Od":"%d","%Oe":"%e","%OH":"%H","%OI":"%I","%Om":"%m","%OM":"%M","%OS":"%S","%Ou":"%u","%OU":"%U","%OV":"%V","%Ow":"%w","%OW":"%W","%Oy":"%y"};for(var y in v)c=c.replace(new RegExp(y,"g"),v[y]);var O="Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),
J="January February March April May June July August September October November December".split(" ");v={"%a":function(f){return O[f.Ma].substring(0,3)},"%A":function(f){return O[f.Ma]},"%b":function(f){return J[f.Ca].substring(0,3)},"%B":function(f){return J[f.Ca]},"%C":function(f){return g((f.U+1900)/100|0,2)},"%d":function(f){return g(f.Fa,2)},"%e":function(f){return h(f.Fa,2," ")},"%g":function(f){return t(f).toString().substring(2)},"%G":function(f){return t(f)},"%H":function(f){return g(f.La,
2)},"%I":function(f){f=f.La;0==f?f=12:12<f&&(f-=12);return g(f,2)},"%j":function(f){return g(f.Fa+kc(jc(f.U+1900)?lc:mc,f.Ca-1),3)},"%m":function(f){return g(f.Ca+1,2)},"%M":function(f){return g(f.rb,2)},"%n":function(){return"\n"},"%p":function(f){return 0<=f.La&&12>f.La?"AM":"PM"},"%S":function(f){return g(f.sb,2)},"%t":function(){return"\t"},"%u":function(f){return f.Ma||7},"%U":function(f){var r=new Date(f.U+1900,0,1),x=0===r.getDay()?r:nc(r,7-r.getDay());f=new Date(f.U+1900,f.Ca,f.Fa);return 0>
k(x,f)?g(Math.ceil((31-x.getDate()+(kc(jc(f.getFullYear())?lc:mc,f.getMonth()-1)-31)+f.getDate())/7),2):0===k(x,r)?"01":"00"},"%V":function(f){var r=new Date(f.U+1901,0,4),x=u(new Date(f.U+1900,0,4));r=u(r);var G=nc(new Date(f.U+1900,0,1),f.Na);return 0>k(G,x)?"53":0>=k(r,G)?"01":g(Math.ceil((x.getFullYear()<f.U+1900?f.Na+32-x.getDate():f.Na+1-x.getDate())/7),2)},"%w":function(f){return f.Ma},"%W":function(f){var r=new Date(f.U,0,1),x=1===r.getDay()?r:nc(r,0===r.getDay()?1:7-r.getDay()+1);f=new Date(f.U+
1900,f.Ca,f.Fa);return 0>k(x,f)?g(Math.ceil((31-x.getDate()+(kc(jc(f.getFullYear())?lc:mc,f.getMonth()-1)-31)+f.getDate())/7),2):0===k(x,r)?"01":"00"},"%y":function(f){return(f.U+1900).toString().substring(2)},"%Y":function(f){return f.U+1900},"%z":function(f){f=f.qb;var r=0<=f;f=Math.abs(f)/60;return(r?"+":"-")+String("0000"+(f/60*100+f%60)).slice(-4)},"%Z":function(f){return f.tb},"%%":function(){return"%"}};for(y in v)c.includes(y)&&(c=c.replace(new RegExp(y,"g"),v[y](e)));y=pc(c);if(y.length>
b)return 0;Ha.set(y,a);return y.length-1}function qc(a){try{a()}catch(b){B(b)}}var Y=0,Z=null,rc=0,sc=[],tc={},uc={},vc=0,wc=null,xc=[],yc=[];function zc(a){var b={},c;for(c in a)(function(e){var h=a[e];b[e]="function"===typeof h?function(){sc.push(e);try{return h.apply(null,arguments)}finally{if(!ya){var g=sc.pop();assert(g===e);Z&&1===Y&&0===sc.length&&(R+=1,Y=0,qc(d._asyncify_stop_unwind),"undefined"!==typeof Fibers&&Fibers.Kb(),wc&&(wc(),wc=null))}}}:h})(c);return b}
function Ac(){var a=T(4108),b=a+12;M[a>>2]=b;M[a+4>>2]=b+4096;b=sc[0];var c=tc[b];void 0===c&&(c=vc++,tc[b]=c,uc[c]=b);M[a+8>>2]=c;return a}function Bc(){var a=d.asm[uc[M[Z+8>>2]]];--R;return a()}
function Cc(a){if(!ya){if(0===Y){var b=!1,c=!1;a(function(e){if(!ya&&(rc=e||0,b=!0,c)){Y=2;qc(function(){d._asyncify_start_rewind(Z)});"undefined"!==typeof Browser&&Browser.Qa.Va&&Browser.Qa.resume();var h=Bc();Z||(e=xc,xc=[],e.forEach(function(g){g(h)}))}});c=!0;b||(Y=1,Z=Ac(),qc(function(){d._asyncify_start_unwind(Z)}),"undefined"!==typeof Browser&&Browser.Qa.Va&&Browser.Qa.pause())}else 2===Y?(Y=0,qc(d._asyncify_stop_rewind),gb(Z),Z=null,yc.forEach(function(e){W(e)})):B("invalid state: "+Y);return rc}}
function Dc(a){return Cc(function(b){a().then(b)})}z||(Nb(function(a){Ob=a;Ua()},function(){Ob=!1;Ua()}),"undefined"!==typeof ENVIRONMENT_IS_FETCH_WORKER&&ENVIRONMENT_IS_FETCH_WORKER||Ta());var Ec=[null,function(a,b){if(z)return U(1,1,a,b)},xb,yb,zb,Ab,Cb,Kb,dc,ec,fc,gc,hc,ic];function pc(a){var b=Array(Da(a)+1);K(a,b,0,b.length);return b}
var Jc={c:function(a,b,c,e){B("Assertion failed: "+H(a)+", at: "+[b?H(b):"unknown filename",c,e?H(e):"unknown function"])},E:function(a,b){Fc(a,b)},o:function(a,b){l.Sa.push(function(){dynCall_vi.apply(null,[a,b])})},L:function(a,b,c,e){if("undefined"===typeof SharedArrayBuffer)return E("Current environment does not support SharedArrayBuffer, pthreads are not available!"),6;if(!a)return E("pthread_create called with a null thread pointer!"),28;var h=[];if(z&&0===h.length)return Gc(687865856,a,b,c,
e);var g=0,k=0;if(b&&-1!=b){var u=M[b>>2];u+=81920;g=M[b+8>>2];k=0!==M[b+12>>2]}else u=2097152;(b=0==g)?g=Hc(16,u):(g-=u,assert(0<g));for(var t=T(228),v=0;57>v;++v)N[(t>>2)+v]=0;M[a>>2]=t;M[t+12>>2]=t;a=t+152;M[a>>2]=a;c={Aa:g,Ba:u,Oa:b,detached:k,nb:c,Ja:t,Da:e,ub:h};return z?(c.xb="spawnThread",postMessage(c,h),0):jb(c)},J:function(a){z?l.$a(a):(l.Ya(),kb(a));throw"unwind";},K:function(a,b){return sb(a,b)},h:xb,x:yb,y:zb,P:function(a){delete Mb[a-1]},O:function(a,b){if(a==b)postMessage({cmd:"processQueuedMainThreadWork"});
else if(z)postMessage({targetThread:a,cmd:"processThreadQueue"});else{a=(a=l.wa[a])&&a.worker;if(!a)return;a.postMessage({cmd:"processThreadQueue"})}return 1},b:Ab,D:function(a,b){if(0===a)a=Date.now();else if(1===a||4===a)a=ob();else return M[Ic()>>2]=28,-1;M[b>>2]=a/1E3|0;M[b+4>>2]=a%1E3*1E6|0;return 0},m:function(a,b,c){Bb.length=0;var e;for(c>>=2;e=I[b++];)(e=105>e)&&c&1&&c++,Bb.push(e?Ja[c++>>1]:M[c]),++c;return Ya[a].apply(null,Bb)},C:rb,l:function(){},p:Cb,d:qb,e:$a,f:ob,s:function(a,b,c){I.copyWithin(a,
b,b+c)},G:function(a,b,c){Fb.length=b;c>>=3;for(var e=0;e<b;e++)Fb[e]=Ja[c+e];return(0>a?Ya[-a-1]:Ec[a]).apply(null,Fb)},t:function(){B("OOM")},H:function(a,b,c){return Hb(a)?Ib(a,b,c):Kb(a,b,c)},k:function(){},F:function(){},N:function(a,b,c){R+=1;return setTimeout(function(){--R;W(function(){dynCall_vi.apply(null,[a,c])})},b)},n:function(a,b,c,e,h){function g(w){Pb(w,k,v,y,t)}function k(w,Mc){Qb(w,Mc.response,function(xa){--R;W(function(){r?dynCall_vi.apply(null,[r,xa]):b&&b(xa)},D)},function(xa){--R;
W(function(){r?dynCall_vi.apply(null,[r,xa]):b&&b(xa)},D)})}function u(w){Pb(w,O,v,y,t)}function t(w){W(function(){P?dynCall_vi.apply(null,[P,w]):h&&h(w)},D)}function v(w){--R;W(function(){x?dynCall_vi.apply(null,[x,w]):c&&c(w)},D)}function y(w){W(function(){G?dynCall_vi.apply(null,[G,w]):e&&e(w)},D)}function O(w){--R;W(function(){r?dynCall_vi.apply(null,[r,w]):b&&b(w)},D)}R+=1;var J=a+112,f=H(J),r=N[J+36>>2],x=N[J+40>>2],G=N[J+44>>2],P=N[J+48>>2],V=N[J+52>>2],Ea=!!(V&4),p=!!(V&32),C=!!(V&16),D=!!(V&
64);if("EM_IDB_STORE"===f)f=N[J+84>>2],Qb(a,I.slice(f,f+N[J+88>>2]),O,v);else if("EM_IDB_DELETE"===f)Sb(a,O,v);else if(C){if(p)return 0;Pb(a,Ea?k:O,v,y,t)}else Rb(a,O,p?v:Ea?g:u);return a},r:function(){return Dc(async()=>{var a=await d.queue.get();const b=Da(a)+1,c=T(b);K(a,I,c,b);return c})},I:function(a,b){b>>=2;b={alpha:!!M[b],depth:!!M[b+1],stencil:!!M[b+2],antialias:!!M[b+3],premultipliedAlpha:!!M[b+4],preserveDrawingBuffer:!!M[b+5],powerPreference:$b[M[b+6]],failIfMajorPerformanceCaveat:!!M[b+
7],jb:M[b+8],Eb:M[b+9],Ua:M[b+10],cb:M[b+11],Gb:M[b+12],Hb:M[b+13]};a=Hb(a);return!a||b.cb?0:Wb(a,b)},v:dc,w:ec,g:function(a){kb(a)},i:fc,A:gc,q:hc,z:ic,M:function(){l.gb()},a:F||d.wasmMemory,B:function(){d.pauseQueue()},u:function(a,b,c,e){return oc(a,b,c,e)},j:function(){d.unpauseQueue()}};
(function(){function a(g,k){g=g.exports;g=zc(g);d.asm=g;Ma.unshift(d.asm.Q);l.Ta.push(d.asm.T);wa=k;z||Ua()}function b(g){a(g.instance,g.module)}function c(g){return Xa().then(function(k){return WebAssembly.instantiate(k,e)}).then(g,function(k){E("failed to asynchronously prepare wasm: "+k);B(k)})}var e={a:Jc};z||Ta();if(d.instantiateWasm)try{var h=d.instantiateWasm(e,a);return h=zc(h)}catch(g){return E("Module.instantiateWasm callback failed with error: "+g),!1}(function(){return va||"function"!==
typeof WebAssembly.instantiateStreaming||Va()||"function"!==typeof fetch?c(b):fetch(S,{credentials:"same-origin"}).then(function(g){return WebAssembly.instantiateStreaming(g,e).then(b,function(k){E("wasm streaming compile failed: "+k);E("falling back to ArrayBuffer instantiation");return c(b)})})})().catch(ba);return{}})();d.___wasm_call_ctors=function(){return(d.___wasm_call_ctors=d.asm.Q).apply(null,arguments)};
var Fc=d._main=function(){return(Fc=d._main=d.asm.R).apply(null,arguments)},gb=d._free=function(){return(gb=d._free=d.asm.S).apply(null,arguments)};d._emscripten_tls_init=function(){return(d._emscripten_tls_init=d.asm.T).apply(null,arguments)};var T=d._malloc=function(){return(T=d._malloc=d.asm.V).apply(null,arguments)};d._emscripten_current_thread_process_queued_calls=function(){return(d._emscripten_current_thread_process_queued_calls=d.asm.W).apply(null,arguments)};
var db=d._emscripten_register_main_browser_thread_id=function(){return(db=d._emscripten_register_main_browser_thread_id=d.asm.X).apply(null,arguments)},tb=d._emscripten_main_browser_thread_id=function(){return(tb=d._emscripten_main_browser_thread_id=d.asm.Y).apply(null,arguments)},Gc=d._emscripten_sync_run_in_main_thread_4=function(){return(Gc=d._emscripten_sync_run_in_main_thread_4=d.asm.Z).apply(null,arguments)},ib=d._emscripten_main_thread_process_queued_calls=function(){return(ib=d._emscripten_main_thread_process_queued_calls=
d.asm._).apply(null,arguments)},Eb=d._emscripten_run_in_main_runtime_thread_js=function(){return(Eb=d._emscripten_run_in_main_runtime_thread_js=d.asm.$).apply(null,arguments)},Jb=d.__emscripten_call_on_thread=function(){return(Jb=d.__emscripten_call_on_thread=d.asm.aa).apply(null,arguments)};d._emscripten_proxy_main=function(){return(d._emscripten_proxy_main=d.asm.ba).apply(null,arguments)};
var ub=d._pthread_testcancel=function(){return(ub=d._pthread_testcancel=d.asm.ca).apply(null,arguments)},fb=d._pthread_self=function(){return(fb=d._pthread_self=d.asm.da).apply(null,arguments)},Lb=d._pthread_exit=function(){return(Lb=d._pthread_exit=d.asm.ea).apply(null,arguments)},cb=d.__emscripten_thread_init=function(){return(cb=d.__emscripten_thread_init=d.asm.fa).apply(null,arguments)},Ic=d.___errno_location=function(){return(Ic=d.___errno_location=d.asm.ga).apply(null,arguments)},pb=d._emscripten_get_global_libc=
function(){return(pb=d._emscripten_get_global_libc=d.asm.ha).apply(null,arguments)},eb=d.___pthread_tsd_run_dtors=function(){return(eb=d.___pthread_tsd_run_dtors=d.asm.ia).apply(null,arguments)},Db=d.stackSave=function(){return(Db=d.stackSave=d.asm.ja).apply(null,arguments)},mb=d.stackRestore=function(){return(mb=d.stackRestore=d.asm.ka).apply(null,arguments)},Ga=d.stackAlloc=function(){return(Ga=d.stackAlloc=d.asm.la).apply(null,arguments)},lb=d._emscripten_stack_set_limits=function(){return(lb=
d._emscripten_stack_set_limits=d.asm.ma).apply(null,arguments)},Hc=d._memalign=function(){return(Hc=d._memalign=d.asm.na).apply(null,arguments)},dynCall_vi=d.dynCall_vi=function(){return(dynCall_vi=d.dynCall_vi=d.asm.oa).apply(null,arguments)},nb=d.dynCall_ii=function(){return(nb=d.dynCall_ii=d.asm.pa).apply(null,arguments)},dynCall_v=d.dynCall_v=function(){return(dynCall_v=d.dynCall_v=d.asm.qa).apply(null,arguments)};
d._asyncify_start_unwind=function(){return(d._asyncify_start_unwind=d.asm.ra).apply(null,arguments)};d._asyncify_stop_unwind=function(){return(d._asyncify_stop_unwind=d.asm.sa).apply(null,arguments)};d._asyncify_start_rewind=function(){return(d._asyncify_start_rewind=d.asm.ta).apply(null,arguments)};d._asyncify_stop_rewind=function(){return(d._asyncify_stop_rewind=d.asm.ua).apply(null,arguments)};var hb=d.__emscripten_allow_main_runtime_queued_calls=27424,ab=d.__emscripten_main_thread_futex=1170668;
d.keepRuntimeAlive=ra;d.PThread=l;d.PThread=l;d.wasmMemory=F;d.ExitStatus=qa;var Kc;function qa(a){this.name="ExitStatus";this.message="Program terminated with exit("+a+")";this.status=a}Sa=function Lc(){Kc||Nc();Kc||(Sa=Lc)};
function Nc(a){function b(){if(!Kc&&(Kc=!0,d.calledRun=!0,!ya)){z||Za(Ma);z||Za(Na);aa(d);if(d.onRuntimeInitialized)d.onRuntimeInitialized();if(Oc){var c=a,e=d._emscripten_proxy_main;c=c||[];var h=c.length+1,g=Ga(4*(h+1));M[g>>2]=Fa(ia);for(var k=1;k<h;k++)M[(g>>2)+k]=Fa(c[k-1]);M[(g>>2)+h]=0;e(h,g)}if(!z){if(d.postRun)for("function"==typeof d.postRun&&(d.postRun=[d.postRun]);d.postRun.length;)c=d.postRun.shift(),Oa.unshift(c);Za(Oa)}}}a=a||ha;if(!(0<Qa))if(z)aa(d),z||Za(Ma),postMessage({cmd:"loaded"});
else{if(!z){if(d.preRun)for("function"==typeof d.preRun&&(d.preRun=[d.preRun]);d.preRun.length;)Pa();Za(La)}0<Qa||(d.setStatus?(d.setStatus("Running..."),setTimeout(function(){setTimeout(function(){d.setStatus("")},1);b()},1)):b())}}d.run=Nc;function kb(a){za=a;if(z)throw postMessage({cmd:"exitProcess",returnCode:a}),new qa(a);ra()||l.Ra();za=a;if(!ra()){l.Ra();if(d.onExit)d.onExit(a);ya=!0}ja(a,new qa(a))}if(d.preInit)for("function"==typeof d.preInit&&(d.preInit=[d.preInit]);0<d.preInit.length;)d.preInit.pop()();
var Oc=!0;d.noInitialRun&&(Oc=!1);z&&(noExitRuntime=!1,l.hb());Nc();


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
            Stockfish(mod).then(function onCreate(sf)
            {
                myEngine = sf;
                sf.addMessageListener(function onMessage(line)
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
            }).catch(function (e)
            {
                /// Sadly, Web Workers will not trigger the error event when errors occur in promises, so we need to create a new context and throw an error there.
                setTimeout(function throwError()
                {
                    throw e;
                }, 1);
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