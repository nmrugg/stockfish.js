(function() {
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
})();