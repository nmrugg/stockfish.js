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

var Stockfish = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename;
  return (
function(Stockfish = {})  {

var d;d||(d=typeof Stockfish !== 'undefined' ? Stockfish : {});var aa,ba;d.ready=new Promise((a,b)=>{aa=a;ba=b});"undefined"===typeof XMLHttpRequest&&(global.XMLHttpRequest=function(){var a,b={open:function(c,f){a=f},send:function(){require("fs").readFile(a,function(c,f){b.readyState=4;c?(console.error(c),b.status=404,b.onerror(c)):(b.status=200,b.response=f,b.onreadystatechange(),b.onload())})}};return b});d.postCustomMessage=function(a){for(var b of m.ga)b.postMessage({cmd:"custom",userData:a})};
d.queue=function(){var a=[],b;return{get:async function(){return 0<a.length?a.shift():await new Promise(function(c){return b=c})},put:function(c){b?(b(c),b=null):a.push(c)}}}();d.onCustomMessage=function(a){da?ea.push(a):d.queue.put(a)};var da,ea=[];d.pauseQueue=function(){da=!0};d.unpauseQueue=function(){var a=ea;ea=[];da=!1;a.forEach(function(b){d.queue.put(b)})};d.postMessage=d.postCustomMessage;var fa=[];d.addMessageListener=function(a){fa.push(a)};
d.removeMessageListener=function(a){a=fa.indexOf(a);0<=a&&fa.splice(a,1)};d.print=d.printErr=function(a){if(0===fa.length)return console.log(a);for(var b of fa)b(a)};d.terminate=function(){m.pa()};var ha=Object.assign({},d),ia=[],ja="./this.program",ka=(a,b)=>{throw b;},la="object"==typeof window,n="function"==typeof importScripts,t="object"==typeof process&&"object"==typeof process.versions&&"string"==typeof process.versions.node,z=d.ENVIRONMENT_IS_PTHREAD||!1,A="";
function na(a){return d.locateFile?d.locateFile(a,A):A+a}var oa,pa;
if(t){var fs=require("fs"),qa=require("path");A=n?qa.dirname(A)+"/":__dirname+"/";oa=(b,c)=>{b=b.startsWith("file://")?new URL(b):qa.normalize(b);return fs.readFileSync(b,c?void 0:"utf8")};pa=b=>{b=oa(b,!0);b.buffer||(b=new Uint8Array(b));return b};!d.thisProgram&&1<process.argv.length&&(ja=process.argv[1].replace(/\\/g,"/"));ia=process.argv.slice(2);ka=(b,c)=>{process.exitCode=b;throw c;};d.inspect=()=>"[Emscripten Module object]";let a;try{a=require("worker_threads")}catch(b){throw console.error('The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?'),
b;}global.Worker=a.Worker}else if(la||n)n?A=self.location.href:"undefined"!=typeof document&&document.currentScript&&(A=document.currentScript.src),_scriptDir&&(A=_scriptDir),0!==A.indexOf("blob:")?A=A.substr(0,A.replace(/[?#].*/,"").lastIndexOf("/")+1):A="",t||(oa=a=>{var b=new XMLHttpRequest;b.open("GET",a,!1);b.send(null);return b.responseText},n&&(pa=a=>{var b=new XMLHttpRequest;b.open("GET",a,!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)}));
t&&"undefined"==typeof performance&&(global.performance=require("perf_hooks").performance);var ra=console.log.bind(console),sa=console.warn.bind(console);t&&(ra=(...a)=>fs.writeSync(1,a.join(" ")+"\n"),sa=(...a)=>fs.writeSync(2,a.join(" ")+"\n"));var ta=d.print||ra,B=d.printErr||sa;Object.assign(d,ha);ha=null;d.arguments&&(ia=d.arguments);d.thisProgram&&(ja=d.thisProgram);d.quit&&(ka=d.quit);var ua;d.wasmBinary&&(ua=d.wasmBinary);var noExitRuntime=d.noExitRuntime||!0;
"object"!=typeof WebAssembly&&C("no native wasm support detected");var D,va,E=!1,F,wa,H,J,K,L,xa,ya=d.INITIAL_MEMORY||1073741824;65536<=ya||C("INITIAL_MEMORY should be larger than STACK_SIZE, was "+ya+"! (STACK_SIZE=65536)");
if(z)D=d.wasmMemory;else if(d.wasmMemory)D=d.wasmMemory;else if(D=new WebAssembly.Memory({initial:ya/65536,maximum:ya/65536,shared:!0}),!(D.buffer instanceof SharedArrayBuffer))throw B("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"),t&&B("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"),
Error("bad memory");var O=D.buffer;d.HEAP8=wa=new Int8Array(O);d.HEAP16=new Int16Array(O);d.HEAP32=K=new Int32Array(O);d.HEAPU8=H=new Uint8Array(O);d.HEAPU16=J=new Uint16Array(O);d.HEAPU32=L=new Uint32Array(O);d.HEAPF32=new Float32Array(O);d.HEAPF64=xa=new Float64Array(O);ya=D.buffer.byteLength;var za=[],Aa=[],Ba=[],Ca=[],Q=0;function Da(){return noExitRuntime||0<Q}function Ea(){var a=d.preRun.shift();za.unshift(a)}var R=0,Fa=null,Ga=null;
function Ha(){R++;d.monitorRunDependencies&&d.monitorRunDependencies(R)}function Ia(){R--;d.monitorRunDependencies&&d.monitorRunDependencies(R);if(0==R&&(null!==Fa&&(clearInterval(Fa),Fa=null),Ga)){var a=Ga;Ga=null;a()}}function C(a){if(d.onAbort)d.onAbort(a);a="Aborted("+a+")";B(a);E=!0;F=1;a=new WebAssembly.RuntimeError(a+". Build with -sASSERTIONS for more info.");ba(a);throw a;}function Ja(a){return a.startsWith("data:application/octet-stream;base64,")}var Ka;Ka="stockfish.wasm";Ja(Ka)||(Ka=na(Ka));
function La(a){try{if(a==Ka&&ua)return new Uint8Array(ua);if(pa)return pa(a);throw"both async and sync fetching of the wasm failed";}catch(b){C(b)}}function Ma(a){return ua||!la&&!n||"function"!=typeof fetch?Promise.resolve().then(()=>La(a)):fetch(a,{credentials:"same-origin"}).then(b=>{if(!b.ok)throw"failed to load wasm binary file at '"+a+"'";return b.arrayBuffer()}).catch(()=>La(a))}
function Na(a,b,c){return Ma(a).then(f=>WebAssembly.instantiate(f,b)).then(f=>f).then(c,f=>{B("failed to asynchronously prepare wasm: "+f);C(f)})}function Oa(a,b){var c=Ka;return ua||"function"!=typeof WebAssembly.instantiateStreaming||Ja(c)||t||"function"!=typeof fetch?Na(c,a,b):fetch(c,{credentials:"same-origin"}).then(f=>WebAssembly.instantiateStreaming(f,a).then(b,function(k){B("wasm streaming compile failed: "+k);B("falling back to ArrayBuffer instantiation");return Na(c,a,b)}))}
function Pa(a){this.name="ExitStatus";this.message="Program terminated with exit("+a+")";this.status=a}function Qa(a){a.terminate();a.onmessage=()=>{}}function Ra(a){(a=m.O[a])||C();m.Ca(a)}function Sa(a){var b=m.wa();if(!b)return 6;m.ga.push(b);m.O[a.fa]=b;b.fa=a.fa;var c={cmd:"run",start_routine:a.Da,arg:a.ta,pthread_ptr:a.fa};t&&b.unref();b.postMessage(c,a.Ia);return 0}var Ta="undefined"!=typeof TextDecoder?new TextDecoder("utf8"):void 0;
function Ua(a,b){for(var c=b+NaN,f=b;a[f]&&!(f>=c);)++f;if(16<f-b&&a.buffer&&Ta)return Ta.decode(a.buffer instanceof SharedArrayBuffer?a.slice(b,f):a.subarray(b,f));for(c="";b<f;){var k=a[b++];if(k&128){var g=a[b++]&63;if(192==(k&224))c+=String.fromCharCode((k&31)<<6|g);else{var h=a[b++]&63;k=224==(k&240)?(k&15)<<12|g<<6|h:(k&7)<<18|g<<12|h<<6|a[b++]&63;65536>k?c+=String.fromCharCode(k):(k-=65536,c+=String.fromCharCode(55296|k>>10,56320|k&1023))}}else c+=String.fromCharCode(k)}return c}
function S(a){return a?Ua(H,a):""}function Va(a){if(z)return T(1,1,a);F=a;if(!Da()){m.pa();if(d.onExit)d.onExit(a);E=!0}ka(a,new Pa(a))}function Wa(a){F=a;if(z)throw Xa(a),"unwind";Va(a)}function Ya(a){a instanceof Pa||"unwind"==a||ka(1,a)}
var m={ja:[],ga:[],ra:[],O:{},xa:function(){z&&m.ya()},Ma:function(){},ya:function(){m.receiveObjectTransfer=m.Ba;m.threadInitTLS=m.qa;m.setExitStatus=m.oa;noExitRuntime=!1},oa:function(a){F=a},Oa:["$terminateWorker"],pa:function(){for(var a of m.ga)Qa(a);for(a of m.ja)Qa(a);m.ja=[];m.ga=[];m.O=[]},Ca:function(a){var b=a.fa;delete m.O[b];m.ja.push(a);m.ga.splice(m.ga.indexOf(a),1);a.fa=0;t&&a.unref();Za(b)},Ba:function(){},qa:function(){m.ra.forEach(a=>a())},Aa:a=>new Promise(b=>{a.onmessage=g=>{g=
g.data;var h=g.cmd;a.fa&&(m.ua=a.fa);if(g.targetThread&&g.targetThread!=$a()){var q=m.O[g.Na];q?q.postMessage(g,g.transferList):B('Internal error! Worker sent a message "'+h+'" to target pthread '+g.targetThread+", but that thread no longer exists!")}else if("checkMailbox"===h)ab();else if("spawnThread"===h)Sa(g);else if("cleanupThread"===h)Ra(g.thread);else if("killThread"===h)g=g.thread,h=m.O[g],delete m.O[g],Qa(h),Za(g),m.ga.splice(m.ga.indexOf(h),1),h.fa=0;else if("cancelThread"===h)m.O[g.thread].postMessage({cmd:"cancel"});
else if("loaded"===h)a.loaded=!0,b(a);else if("print"===h)ta("Thread "+g.threadId+": "+g.text);else if("printErr"===h)B("Thread "+g.threadId+": "+g.text);else if("alert"===h)alert("Thread "+g.threadId+": "+g.text);else if("setimmediate"===g.target)a.postMessage(g);else if("callHandler"===h)d[g.handler](...g.args);else h&&B("worker sent an unknown command "+h);m.ua=void 0};a.onerror=g=>{B("worker sent an error! "+g.filename+":"+g.lineno+": "+g.message);throw g;};t&&(a.on("message",function(g){a.onmessage({data:g})}),
a.on("error",function(g){a.onerror(g)}));var c=[],f=["onExit","onAbort","print","printErr"],k;for(k of f)d.hasOwnProperty(k)&&c.push(k);a.postMessage({cmd:"load",handlers:c,urlOrBlob:d.mainScriptUrlOrBlob||_scriptDir,wasmMemory:D,wasmModule:va})}),za:function(a){a()},sa:function(){var a=na("stockfish.worker.js");a=new Worker(a);m.ja.push(a)},wa:function(){0==m.ja.length&&(m.sa(),m.Aa(m.ja[0]));return m.ja.pop()}};d.PThread=m;function bb(a){for(;0<a.length;)a.shift()(d)}
d.establishStackSpace=function(){var a=$a(),b=K[a+52>>2];cb(b,b-K[a+56>>2]);db(b)};function Xa(a){if(z)return T(2,0,a);--Q;Wa(a)}d.invokeEntryPoint=function(a,b){a=eb.apply(null,[a,b]);Da()?m.oa(a):fb(a)};function gb(a,b,c,f){return z?T(3,1,a,b,c,f):hb(a,b,c,f)}
function hb(a,b,c,f){if("undefined"==typeof SharedArrayBuffer)return B("Current environment does not support SharedArrayBuffer, pthreads are not available!"),6;var k=[];if(z&&0===k.length)return gb(a,b,c,f);a={Da:c,fa:a,ta:f,Ia:k};return z?(a.La="spawnThread",postMessage(a,k),0):Sa(a)}function ib(a,b,c){return z?T(4,1,a,b,c):0}function jb(a,b,c){return z?T(5,1,a,b,c):0}function kb(a,b,c,f){if(z)return T(6,1,a,b,c,f)}
function lb(a){if(!E)try{if(a(),!Da())try{z?fb(F):Wa(F)}catch(b){Ya(b)}}catch(b){Ya(b)}}function mb(a){"function"===typeof Atomics.Ja&&(Atomics.Ja(K,a>>2,a).value.then(ab),Atomics.store(K,a+128>>2,1))}d.__emscripten_thread_mailbox_await=mb;function ab(){var a=$a();a&&(mb(a),lb(()=>nb()))}d.checkMailbox=ab;function ob(a){if(z)return T(7,1,a);noExitRuntime=!1;Q=0;Wa(a)}var pb;pb=t?()=>{var a=process.hrtime();return 1E3*a[0]+a[1]/1E6}:()=>performance.timeOrigin+performance.now();
function qb(a){var b=rb();a=a();db(b);return a}function T(a,b){var c=arguments.length-2,f=arguments;return qb(()=>{for(var k=sb(8*c),g=k>>3,h=0;h<c;h++)xa[g+h]=f[2+h];return tb(a,c,k,b)})}var ub=[],U={};function vb(a,b){try{var c=indexedDB.open("emscripten_filesystem",1)}catch(f){b(f);return}c.onupgradeneeded=f=>{f=f.target.result;f.objectStoreNames.contains("FILES")&&f.deleteObjectStore("FILES");f.createObjectStore("FILES")};c.onsuccess=f=>a(f.target.result);c.onerror=f=>b(f)}var wb;
function xb(a,b,c,f,k){function g(){var x=0,M=0;l.response&&I&&0===L[a+12>>2]&&(M=l.response.byteLength);0<M&&(x=yb(M),H.set(new Uint8Array(l.response),x));L[a+12>>2]=x;V(a+16,M);V(a+24,0);(x=l.response?l.response.byteLength:0)&&V(a+32,x);J[a+40>>1]=l.readyState;J[a+42>>1]=l.status;l.statusText&&W(l.statusText,H,a+44,64)}var h=L[a+8>>2];if(h){var q=S(h),p=a+112,u=S(p);u||(u="GET");var y=L[p+52>>2],X=L[p+56>>2],N=!!L[p+60>>2],e=L[p+68>>2],r=L[p+72>>2];h=L[p+76>>2];var v=L[p+80>>2],G=L[p+84>>2];p=L[p+
88>>2];var I=!!(y&1),ca=!!(y&2);y=!!(y&64);e=e?S(e):void 0;r=r?S(r):void 0;var l=new XMLHttpRequest;l.withCredentials=N;l.open(u,q,!y,e,r);y||(l.timeout=X);l.Ka=q;l.responseType="arraybuffer";v&&(q=S(v),l.overrideMimeType(q));if(h)for(;;){u=L[h>>2];if(!u)break;q=L[h+4>>2];if(!q)break;h+=8;u=S(u);q=S(q);l.setRequestHeader(u,q)}var P=L[a+0>>2];U[P]=l;h=G&&p?H.slice(G,G+p):null;l.onload=x=>{P in U&&(g(),200<=l.status&&300>l.status?b&&b(a,l,x):c&&c(a,l,x))};l.onerror=x=>{P in U&&(g(),c&&c(a,l,x))};l.ontimeout=
x=>{P in U&&c&&c(a,l,x)};l.onprogress=x=>{if(P in U){var M=I&&ca&&l.response?l.response.byteLength:0,w=0;0<M&&I&&ca&&(w=yb(M),H.set(new Uint8Array(l.response),w));L[a+12>>2]=w;V(a+16,M);V(a+24,x.loaded-M);V(a+32,x.total);J[a+40>>1]=l.readyState;3<=l.readyState&&0===l.status&&0<x.loaded&&(l.status=200);J[a+42>>1]=l.status;l.statusText&&W(l.statusText,H,a+44,64);f&&f(a,l,x);w&&zb(w)}};l.onreadystatechange=x=>{P in U?(J[a+40>>1]=l.readyState,2<=l.readyState&&(J[a+42>>1]=l.status),k&&k(a,l,x)):--Q};try{l.send(h)}catch(x){c&&
c(a,l,x)}}else c(a,0,"no url specified!")}function V(a,b){L[a>>2]=b;L[a+4>>2]=(b-L[a>>2])/4294967296}function W(a,b,c,f){if(0<f){f=c+f-1;for(var k=0;k<a.length;++k){var g=a.charCodeAt(k);if(55296<=g&&57343>=g){var h=a.charCodeAt(++k);g=65536+((g&1023)<<10)|h&1023}if(127>=g){if(c>=f)break;b[c++]=g}else{if(2047>=g){if(c+1>=f)break;b[c++]=192|g>>6}else{if(65535>=g){if(c+2>=f)break;b[c++]=224|g>>12}else{if(c+3>=f)break;b[c++]=240|g>>18;b[c++]=128|g>>12&63}b[c++]=128|g>>6&63}b[c++]=128|g&63}}b[c]=0}}
function Ab(a,b,c,f){var k=wb;if(k){var g=L[a+112+64>>2];g||(g=L[a+8>>2]);var h=S(g);try{var q=k.transaction(["FILES"],"readwrite").objectStore("FILES").put(b,h);q.onsuccess=()=>{J[a+40>>1]=4;J[a+42>>1]=200;W("OK",H,a+44,64);c(a,0,h)};q.onerror=p=>{J[a+40>>1]=4;J[a+42>>1]=413;W("Payload Too Large",H,a+44,64);f(a,0,p)}}catch(p){f(a,0,p)}}else f(a,0,"IndexedDB not available!")}
function Bb(a,b,c){var f=wb;if(f){var k=L[a+112+64>>2];k||(k=L[a+8>>2]);k=S(k);try{var g=f.transaction(["FILES"],"readonly").objectStore("FILES").get(k);g.onsuccess=h=>{if(h.target.result){h=h.target.result;var q=h.byteLength||h.length,p=yb(q);H.set(new Uint8Array(h),p);L[a+12>>2]=p;V(a+16,q);V(a+24,0);V(a+32,q);J[a+40>>1]=4;J[a+42>>1]=200;W("OK",H,a+44,64);b(a,0,h)}else J[a+40>>1]=4,J[a+42>>1]=404,W("Not Found",H,a+44,64),c(a,0,"no data")};g.onerror=h=>{J[a+40>>1]=4;J[a+42>>1]=404;W("Not Found",
H,a+44,64);c(a,0,h)}}catch(h){c(a,0,h)}}else c(a,0,"IndexedDB not available!")}
function Cb(a,b,c){var f=wb;if(f){var k=L[a+112+64>>2];k||(k=L[a+8>>2]);k=S(k);try{var g=f.transaction(["FILES"],"readwrite").objectStore("FILES").delete(k);g.onsuccess=h=>{h=h.target.result;L[a+12>>2]=0;V(a+16,0);V(a+24,0);V(a+32,0);J[a+40>>1]=4;J[a+42>>1]=200;W("OK",H,a+44,64);b(a,0,h)};g.onerror=h=>{J[a+40>>1]=4;J[a+42>>1]=404;W("Not Found",H,a+44,64);c(a,0,h)}}catch(h){c(a,0,h)}}else c(a,0,"IndexedDB not available!")}var Db={};
function Eb(){if(!Fb){var a={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:("object"==typeof navigator&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:ja||"./this.program"},b;for(b in Db)void 0===Db[b]?delete a[b]:a[b]=Db[b];var c=[];for(b in a)c.push(b+"="+a[b]);Fb=c}return Fb}var Fb;
function Gb(a,b){if(z)return T(8,1,a,b);var c=0;Eb().forEach(function(f,k){var g=b+c;k=L[a+4*k>>2]=g;for(g=0;g<f.length;++g)wa[k++>>0]=f.charCodeAt(g);wa[k>>0]=0;c+=f.length+1});return 0}function Hb(a,b){if(z)return T(9,1,a,b);var c=Eb();L[a>>2]=c.length;var f=0;c.forEach(function(k){f+=k.length+1});L[b>>2]=f;return 0}function Ib(a){return z?T(10,1,a):52}function Jb(a,b,c,f){return z?T(11,1,a,b,c,f):52}function Kb(a,b,c,f,k){return z?T(12,1,a,b,c,f,k):70}var Lb=[null,[],[]];
function Mb(a,b,c,f){if(z)return T(13,1,a,b,c,f);for(var k=0,g=0;g<c;g++){var h=L[b>>2],q=L[b+4>>2];b+=8;for(var p=0;p<q;p++){var u=H[h+p],y=Lb[a];0===u||10===u?((1===a?ta:B)(Ua(y,0)),y.length=0):y.push(u)}k+=q}L[f>>2]=k;return 0}function Nb(a){return 0===a%4&&(0!==a%100||0===a%400)}var Ob=[31,29,31,30,31,30,31,31,30,31,30,31],Pb=[31,28,31,30,31,30,31,31,30,31,30,31];
function Qb(a){for(var b=0,c=0;c<a.length;++c){var f=a.charCodeAt(c);127>=f?b++:2047>=f?b+=2:55296<=f&&57343>=f?(b+=4,++c):b+=3}return b}function Rb(a){var b=Array(Qb(a)+1);W(a,b,0,b.length);return b}
function Sb(a,b,c,f){function k(e,r,v){for(e="number"==typeof e?e.toString():e||"";e.length<r;)e=v[0]+e;return e}function g(e,r){return k(e,r,"0")}function h(e,r){function v(I){return 0>I?-1:0<I?1:0}var G;0===(G=v(e.getFullYear()-r.getFullYear()))&&0===(G=v(e.getMonth()-r.getMonth()))&&(G=v(e.getDate()-r.getDate()));return G}function q(e){switch(e.getDay()){case 0:return new Date(e.getFullYear()-1,11,29);case 1:return e;case 2:return new Date(e.getFullYear(),0,3);case 3:return new Date(e.getFullYear(),
0,2);case 4:return new Date(e.getFullYear(),0,1);case 5:return new Date(e.getFullYear()-1,11,31);case 6:return new Date(e.getFullYear()-1,11,30)}}function p(e){var r=e.ha;for(e=new Date((new Date(e.ia+1900,0,1)).getTime());0<r;){var v=e.getMonth(),G=(Nb(e.getFullYear())?Ob:Pb)[v];if(r>G-e.getDate())r-=G-e.getDate()+1,e.setDate(1),11>v?e.setMonth(v+1):(e.setMonth(0),e.setFullYear(e.getFullYear()+1));else{e.setDate(e.getDate()+r);break}}v=new Date(e.getFullYear()+1,0,4);r=q(new Date(e.getFullYear(),
0,4));v=q(v);return 0>=h(r,e)?0>=h(v,e)?e.getFullYear()+1:e.getFullYear():e.getFullYear()-1}var u=K[f+40>>2];f={Ga:K[f>>2],Fa:K[f+4>>2],ka:K[f+8>>2],na:K[f+12>>2],la:K[f+16>>2],ia:K[f+20>>2],ea:K[f+24>>2],ha:K[f+28>>2],Pa:K[f+32>>2],Ea:K[f+36>>2],Ha:u?S(u):""};c=S(c);u={"%c":"%a %b %d %H:%M:%S %Y","%D":"%m/%d/%y","%F":"%Y-%m-%d","%h":"%b","%r":"%I:%M:%S %p","%R":"%H:%M","%T":"%H:%M:%S","%x":"%m/%d/%y","%X":"%H:%M:%S","%Ec":"%c","%EC":"%C","%Ex":"%m/%d/%y","%EX":"%H:%M:%S","%Ey":"%y","%EY":"%Y","%Od":"%d",
"%Oe":"%e","%OH":"%H","%OI":"%I","%Om":"%m","%OM":"%M","%OS":"%S","%Ou":"%u","%OU":"%U","%OV":"%V","%Ow":"%w","%OW":"%W","%Oy":"%y"};for(var y in u)c=c.replace(new RegExp(y,"g"),u[y]);var X="Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),N="January February March April May June July August September October November December".split(" ");u={"%a":function(e){return X[e.ea].substring(0,3)},"%A":function(e){return X[e.ea]},"%b":function(e){return N[e.la].substring(0,3)},"%B":function(e){return N[e.la]},
"%C":function(e){return g((e.ia+1900)/100|0,2)},"%d":function(e){return g(e.na,2)},"%e":function(e){return k(e.na,2," ")},"%g":function(e){return p(e).toString().substring(2)},"%G":function(e){return p(e)},"%H":function(e){return g(e.ka,2)},"%I":function(e){e=e.ka;0==e?e=12:12<e&&(e-=12);return g(e,2)},"%j":function(e){for(var r=0,v=0;v<=e.la-1;r+=(Nb(e.ia+1900)?Ob:Pb)[v++]);return g(e.na+r,3)},"%m":function(e){return g(e.la+1,2)},"%M":function(e){return g(e.Fa,2)},"%n":function(){return"\n"},"%p":function(e){return 0<=
e.ka&&12>e.ka?"AM":"PM"},"%S":function(e){return g(e.Ga,2)},"%t":function(){return"\t"},"%u":function(e){return e.ea||7},"%U":function(e){return g(Math.floor((e.ha+7-e.ea)/7),2)},"%V":function(e){var r=Math.floor((e.ha+7-(e.ea+6)%7)/7);2>=(e.ea+371-e.ha-2)%7&&r++;if(r)53==r&&(v=(e.ea+371-e.ha)%7,4==v||3==v&&Nb(e.ia)||(r=1));else{r=52;var v=(e.ea+7-e.ha-1)%7;(4==v||5==v&&Nb(e.ia%400-1))&&r++}return g(r,2)},"%w":function(e){return e.ea},"%W":function(e){return g(Math.floor((e.ha+7-(e.ea+6)%7)/7),2)},
"%y":function(e){return(e.ia+1900).toString().substring(2)},"%Y":function(e){return e.ia+1900},"%z":function(e){e=e.Ea;var r=0<=e;e=Math.abs(e)/60;return(r?"+":"-")+String("0000"+(e/60*100+e%60)).slice(-4)},"%Z":function(e){return e.Ha},"%%":function(){return"%"}};c=c.replace(/%%/g,"\x00\x00");for(y in u)c.includes(y)&&(c=c.replace(new RegExp(y,"g"),u[y](f)));c=c.replace(/\0\0/g,"%");y=Rb(c);if(y.length>b)return 0;wa.set(y,a);return y.length-1}function Tb(a){try{a()}catch(b){C(b)}}
function Ub(a){var b={},c;for(c in a)(function(f){var k=a[f];b[f]="function"==typeof k?function(){Vb.push(f);try{return k.apply(null,arguments)}finally{E||(Vb.pop()===f||C(),Y&&1===Z&&0===Vb.length&&(Z=0,Q+=1,Tb(Wb),"undefined"!=typeof Fibers&&Fibers.Qa()))}}:k})(c);return b}var Z=0,Y=null,Xb=0,Vb=[],Yb={},Zb={},$b=0,ac=null,bc=[];function cc(){var a=yb(4108),b=a+12;K[a>>2]=b;K[a+4>>2]=b+4096;b=Vb[0];var c=Yb[b];void 0===c&&(c=$b++,Yb[b]=c,Zb[c]=b);K[a+8>>2]=c;return a}
function dc(){var a=d.asm[Zb[K[Y+8>>2]]];--Q;return a()}
function ec(a){if(!E){if(0===Z){var b=!1,c=!1;a((f=0)=>{if(!E&&(Xb=f,b=!0,c)){Z=2;Tb(()=>fc(Y));"undefined"!=typeof Browser&&Browser.ma.va&&Browser.ma.resume();f=!1;try{var k=dc()}catch(q){k=q,f=!0}var g=!1;if(!Y){var h=ac;h&&(ac=null,(f?h.reject:h.resolve)(k),g=!0)}if(f&&!g)throw k;}});c=!0;b||(Z=1,Y=cc(),"undefined"!=typeof Browser&&Browser.ma.va&&Browser.ma.pause(),Tb(()=>gc(Y)))}else 2===Z?(Z=0,Tb(hc),zb(Y),Y=null,bc.forEach(f=>lb(f))):C("invalid state: "+Z);return Xb}}
function ic(a){return ec(b=>{a().then(b)})}m.xa();z||(Ha(),vb(a=>{wb=a;Ia()},()=>{wb=!1;Ia()}));
var jc=[null,Va,Xa,gb,ib,jb,kb,ob,Gb,Hb,Ib,Jb,Kb,Mb],lc={G:function(a){kc(a,!n,1,!la);m.qa()},h:function(a){z?postMessage({cmd:"cleanupThread",thread:a}):Ra(a)},A:hb,g:ib,v:jb,w:kb,B:function(){return 65536},k:function(a){var b=U[a];b&&(delete U[a],0<b.readyState&&4>b.readyState&&b.abort())},C:function(){return!0},z:function(a,b){a==b?setTimeout(()=>ab()):z?postMessage({targetThread:a,cmd:"checkMailbox"}):(a=m.O[a])&&a.postMessage({cmd:"checkMailbox"})},E:function(){return-1},F:mb,e:function(a){t&&
m.O[a].ref()},b:function(){C("")},j:function(){},H:function(){Q+=1;throw"unwind";},n:ob,c:pb,D:function(a,b,c){ub.length=b;c>>=3;for(var f=0;f<b;f++)ub[f]=xa[c+f];return jc[a].apply(null,ub)},y:function(){C("OOM")},m:function(){return Da()},l:function(a,b,c,f,k){function g(w){G?w():lb(w)}Q+=1;var h=a+112,q=S(h),p=L[h+36>>2],u=L[h+40>>2],y=L[h+44>>2],X=L[h+48>>2],N=L[h+52>>2],e=!!(N&4),r=!!(N&32),v=!!(N&16),G=!!(N&64),I=w=>{--Q;g(()=>{p?dynCall_vi.apply(null,[p,w]):b&&b(w)})},ca=w=>{g(()=>{y?dynCall_vi.apply(null,
[y,w]):f&&f(w)})},l=w=>{--Q;g(()=>{u?dynCall_vi.apply(null,[u,w]):c&&c(w)})},P=w=>{g(()=>{X?dynCall_vi.apply(null,[X,w]):k&&k(w)})};N=w=>{xb(w,I,l,ca,P)};var x=(w,pc)=>{Ab(w,pc.response,ma=>{--Q;g(()=>{p?dynCall_vi.apply(null,[p,ma]):b&&b(ma)})},ma=>{--Q;g(()=>{p?dynCall_vi.apply(null,[p,ma]):b&&b(ma)})})},M=w=>{xb(w,x,l,ca,P)};if("EM_IDB_STORE"===q)q=L[h+84>>2],Ab(a,H.slice(q,q+L[h+88>>2]),I,l);else if("EM_IDB_DELETE"===q)Cb(a,I,l);else if(v){if(r)return 0;xb(a,e?x:I,l,ca,P)}else Bb(a,I,r?l:e?M:
N);return a},o:function(){return ic(async()=>{var a=await d.queue.get();const b=Qb(a)+1,c=yb(b);W(a,H,c,b);return c})},r:Gb,t:Hb,d:Wa,f:Ib,u:Jb,p:Kb,x:Mb,a:D||d.wasmMemory,s:function(){d.pauseQueue()},q:function(a,b,c,f){return Sb(a,b,c,f)},i:function(){d.unpauseQueue()}};
(function(){function a(c,f){c=c.exports;c=Ub(c);d.asm=c;m.ra.push(d.asm.L);Aa.unshift(d.asm.I);va=f;m.za(()=>Ia());return c}var b={a:lc};Ha();if(d.instantiateWasm)try{return d.instantiateWasm(b,a)}catch(c){B("Module.instantiateWasm callback failed with error: "+c),ba(c)}Oa(b,function(c){a(c.instance,c.module)}).catch(ba);return{}})();d._main=function(){return(d._main=d.asm.J).apply(null,arguments)};function zb(){return(zb=d.asm.K).apply(null,arguments)}
d.__emscripten_tls_init=function(){return(d.__emscripten_tls_init=d.asm.L).apply(null,arguments)};var $a=d._pthread_self=function(){return($a=d._pthread_self=d.asm.M).apply(null,arguments)},mc=d.__emscripten_proxy_main=function(){return(mc=d.__emscripten_proxy_main=d.asm.N).apply(null,arguments)};function yb(){return(yb=d.asm.P).apply(null,arguments)}var kc=d.__emscripten_thread_init=function(){return(kc=d.__emscripten_thread_init=d.asm.Q).apply(null,arguments)};
d.__emscripten_thread_crashed=function(){return(d.__emscripten_thread_crashed=d.asm.R).apply(null,arguments)};function tb(){return(tb=d.asm.S).apply(null,arguments)}function Za(){return(Za=d.asm.T).apply(null,arguments)}var fb=d.__emscripten_thread_exit=function(){return(fb=d.__emscripten_thread_exit=d.asm.U).apply(null,arguments)},nb=d.__emscripten_check_mailbox=function(){return(nb=d.__emscripten_check_mailbox=d.asm.V).apply(null,arguments)};
function cb(){return(cb=d.asm.W).apply(null,arguments)}function rb(){return(rb=d.asm.X).apply(null,arguments)}function db(){return(db=d.asm.Y).apply(null,arguments)}function sb(){return(sb=d.asm.Z).apply(null,arguments)}var eb=d.dynCall_ii=function(){return(eb=d.dynCall_ii=d.asm._).apply(null,arguments)},dynCall_vi=d.dynCall_vi=function(){return(dynCall_vi=d.dynCall_vi=d.asm.$).apply(null,arguments)};function gc(){return(gc=d.asm.aa).apply(null,arguments)}
function Wb(){return(Wb=d.asm.ba).apply(null,arguments)}function fc(){return(fc=d.asm.ca).apply(null,arguments)}function hc(){return(hc=d.asm.da).apply(null,arguments)}d.___start_em_js=38564;d.___stop_em_js=38920;d.keepRuntimeAlive=Da;d.wasmMemory=D;d.ExitStatus=Pa;d.PThread=m;var nc;Ga=function oc(){nc||qc();nc||(Ga=oc)};
function rc(a=[]){var b=mc;Q+=1;a.unshift(ja);var c=a.length,f=sb(4*(c+1)),k=f>>2;a.forEach(h=>{var q=k++,p=Qb(h)+1,u=sb(p);W(h,H,u,p);K[q]=u});K[k]=0;try{var g=b(c,f);Wa(g,!0)}catch(h){Ya(h)}}
function qc(){var a=ia;function b(){if(!nc&&(nc=!0,d.calledRun=!0,!E)){z||bb(Aa);z||bb(Ba);aa(d);if(d.onRuntimeInitialized)d.onRuntimeInitialized();sc&&rc(a);if(!z){if(d.postRun)for("function"==typeof d.postRun&&(d.postRun=[d.postRun]);d.postRun.length;){var c=d.postRun.shift();Ca.unshift(c)}bb(Ca)}}}if(!(0<R))if(z)aa(d),z||bb(Aa),startWorker(d);else{if(d.preRun)for("function"==typeof d.preRun&&(d.preRun=[d.preRun]);d.preRun.length;)Ea();bb(za);0<R||(d.setStatus?(d.setStatus("Running..."),setTimeout(function(){setTimeout(function(){d.setStatus("")},
1);b()},1)):b())}}if(d.preInit)for("function"==typeof d.preInit&&(d.preInit=[d.preInit]);0<d.preInit.length;)d.preInit.pop()();var sc=!0;d.noInitialRun&&(sc=!1);qc();


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
        "use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:function(f){(0,eval)(fs.readFileSync(f,"utf8")+"//# sourceURL="+f)},postMessage:function(msg){parentPort.postMessage(msg)},performance:global.performance||{now:function(){return Date.now()}}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason??e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=function(){postMessage({cmd:"callHandler",handler:handler,args:[...arguments]})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;Stockfish=INIT_ENGINE();Stockfish(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*isMainBrowserThread=*/0,/*isMainRuntimeThread=*/0,/*canBlock=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err("worker.js received unknown command "+e.data.cmd);err(e.data)}}catch(ex){if(Module["__emscripten_thread_crashed"]){Module["__emscripten_thread_crashed"]()}throw ex}}self.onmessage=handleMessage;
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