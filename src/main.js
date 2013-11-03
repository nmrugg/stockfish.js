(function() {
	var initialized = false;
	
	onmessage = function(event) {
		if(!initialized) {
			Module.ccall('init', 'number', [], []);
			initialized = true;
		}
		Module.ccall('uci_command', 'number', ['string'], [event.data])
	}
	
	console = {
		log: function(line) {
			postMessage(line);
		}
	}
})();