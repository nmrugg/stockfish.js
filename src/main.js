/*
Stockfish is free, and distributed under the **GNU General Public License**
(GPL). Essentially, this means that you are free to do almost exactly
what you want with the program, including distributing it among your
friends, making it available for download from your web site, selling
it (either by itself or as part of some bigger software package), or
using it as the starting point for a software project of your own.

The only real limitation is that whenever you distribute Stockfish in
some way, you must always include the full source code, or a pointer
to where the source code can be found. If you make any changes to the
source code, these changes must also be made available under the GPL.

The source code for this emscripten port of stockfish can be found
at http://github.com/exoticorn/stockfish-js
*/
(function() {
	if(typeof process == 'undefined') {
		var initialized = false;
		
		onmessage = function(event) {
			if(!initialized) {
				Module.ccall('init', 'number', [], []);
				initialized = true;
			}
			if(typeof event.data == 'object') {
				if(event.data.book) {
					var book = event.data.book;
					var byteArray = new Uint8Array(book);
					var buf = Module._malloc(book.byteLength);
					Module.HEAPU8.set(byteArray, buf);
					Module.ccall('set_book', 'number', ['number', 'number'], [buf, book.byteLength]);
				}
			} else {
				Module.ccall('uci_command', 'number', ['string'], [event.data])
			}
		}
		
		console = {
			log: function(line) {
				postMessage(line);
			}
		}
	} else {
		process.stdin.resume();
		var lines = null;
		var init = function() {
			if(lines === null) {
				Module.ccall('init', 'number', [], []);
				lines = '';
			}			
		};
		process.nextTick(init);
		process.stdin.on('data', function(chunk) {
			init();
			lines += chunk;
			var match;
			while(match = lines.match(/\r\n|\n\r|\n|\r/)) {
				var line = lines.slice(0, match.index);
				lines = lines.slice(match.index + match[0].length);
				Module.ccall('uci_command', 'number', ['string'], [line]);
				if(line == 'quit') {
					process.exit();
				}
			}
		});
		process.stdin.on('end', function() {
			process.exit();
		});
		
	}
})();
