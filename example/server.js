try {
    var connect = require('connect');
} catch (e) {
    console.log("Can't find connect. Run 'npm install' from the root.");
    process.exit();
}
connect.createServer(connect.static(__dirname)).listen(8080);
console.log("Go to http://localhost:8080/");
