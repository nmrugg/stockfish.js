/*jslint onevar: true, undef: true, newcap: true, nomen: true, regexp: true, plusplus: true, bitwise: true, node: true, indent: 4, white: false */

/// Usage: node static_server.js PORT

var http = require("http"),
    url  = require("url"),
    path = require("path"),
    fs   = require("fs"),
    port = process.argv[2] || 8080; /// Defaults to port 8080

/// Start the server.
http.createServer(function (request, response)
{
    var cwd = process.cwd(),
        filename,
        uri = url.parse(request.url).pathname;
    
    filename = path.join(cwd, uri);
    
    /// Make sure the URI is valid and withing the current working directory.
    if (uri.indexOf("/../") !== -1 || uri[0] !== "/" || path.relative(cwd, filename).substr(0, 3) === "../") {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not Found\n");
        response.end();
        return;
    }
    
    path.exists(filename, function (exists)
    {
        /// If the URI does not exist, display a 404 error.
        if (!exists) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();
            return;
        }
        
        /// If the URI is a directory, try to load index.html.
        if (fs.statSync(filename).isDirectory()) {
            filename += "/index.html";
        }
        
        fs.readFile(filename, "binary", function (err, file)
        {
            /// If the file cannot be loaded, display a 500 error.
            if (err) {
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(err + "\n");
                response.end();
                return;
            }
            
            /// If the file loads correctly, write it to the client.
            response.writeHead(200);
            response.write(file, "binary");
            response.end();
        });
    });
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
