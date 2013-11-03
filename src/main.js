onmessage = function(event) {
	if(event.data.cmd == 'init') {
		Module.ccall('init', 'number', [], []);
	} else if(event.data.cmd == 'uci') {
		Module.ccall('uci_command', 'number', ['string'], [event.data.line])
	}
}

console = {
	log: function(line) {
		postMessage(line);
	}
}