#!/usr/bin/env node
var params = getParams({booleans: ["help", "h", "ssl", "list", "coop", "coep", "cors"]});
params.cors = true;
var url  = require("url");
var p    = require("path");
var fs   = require("fs");
var qs   = require("querystring");
var dir  = params.dir || process.cwd();
var port = (params.port || params.p) || (params.ssl ? 443 : 9092);
var listDir = params.list || false;

/// Added mime-types from https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
/// Using /([^\t]+)\t([^\t]+)\t([^\t]+)\n/g, "    "$1": "$3", /// $2\n" (after some clean up)
/// Another source is https://www.sitepoint.com/mime-types-complete-list/
var mimeData = {
    ".htm": "text/html", /// HyperText Markup Language (HTML)
    ".html": "text/html", /// HyperText Markup Language (HTML)
    ".jpg": "image/jpeg", /// JPEG images
    ".jpeg": "image/jpeg", /// JPEG images
    ".gif": "image/gif", /// Graphics Interchange Format (GIF)
    ".png": "image/png", /// Portable Network Graphics
    ".js": "text/javascript", /// JavaScript
    ".css": "text/css", /// Cascading Style Sheets (CSS)
    ".ico": "image/vnd.microsoft.icon", /// Icon format
    ".woff": "font/woff", /// Web Open Font Format (WOFF)
    ".woff2": "font/woff2", /// Web Open Font Format (WOFF)
    ".pdf": "application/pdf", /// Adobe Portable Document Format (PDF)
    ".wasm": "application/wasm", /// WASM
    ".mp4": "video/mp4", /// MP4
    ".mkv": "video/x-matroska", /// Matroska multimedia container format
    ".svg": "image/svg+xml", /// Scalable Vector Graphics (SVG)
    ".weba": "audio/webm", /// WEBM audio
    ".webm": "video/webm", /// WEBM video
    ".webp": "image/webp", /// WEBP image
    ".mp3": "audio/mpeg", /// MP3 audio
    ".babylon": "application/babylon", /// Babylon.js
    ".gltf": "model/gltf+json", /// GLTF text model
    ".glb": "model/gltf-binary", /// GLTF binary model (also compressable?)
    ".obj": "model/obj", /// Wavefront model
    ".stl": "model/stl", /// STL model
    
    /// Putting less common ones below
    ".aac": "audio/aac", /// AAC audio
    ".abw": "application/x-abiword", /// AbiWord document
    ".arc": "application/x-freearc", /// Archive document (multiple files embedded)
    ".avi": "video/x-msvideo", /// AVI: Audio Video Interleave
    ".azw": "application/vnd.amazon.ebook", /// Amazon Kindle eBook format
    ".bin": "application/octet-stream", /// Any kind of binary data
    ".bmp": "image/bmp", /// Windows OS/2 Bitmap Graphics
    ".bz": "application/x-bzip", /// BZip archive
    ".bz2": "application/x-bzip2", /// BZip2 archive
    ".csh": "application/x-csh", /// C-Shell script
    ".csv": "text/csv", /// Comma-separated values (CSV)
    ".doc": "application/msword", /// Microsoft Word
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", /// Microsoft Word (OpenXML)
    ".eot": "application/vnd.ms-fontobject", /// MS Embedded OpenType fonts
    ".epub": "application/epub+zip", /// Electronic publication (EPUB)
    ".gz": "application/gzip", /// GZip Compressed Archive
    ".ics": "text/calendar", /// iCalendar format
    ".jar": "application/java-archive", /// Java Archive (JAR)
    ".json": "application/json", /// JSON format
    ".jsonld": "application/ld+json", /// JSON-LD format
    ".mid": "audio/midi audio/x-midi", /// Musical Instrument Digital Interface (MIDI)
    ".midi": "audio/midi audio/x-midi", /// Musical Instrument Digital Interface (MIDI)
    ".mjs": "text/javascript", /// JavaScript module
    ".mpeg": "video/mpeg", /// MPEG Video
    ".mpkg": "application/vnd.apple.installer+xml", /// Apple Installer Package
    ".odp": "application/vnd.oasis.opendocument.presentation", /// OpenDocument presentation document
    ".ods": "application/vnd.oasis.opendocument.spreadsheet", /// OpenDocument spreadsheet document
    ".odt": "application/vnd.oasis.opendocument.text", /// OpenDocument text document
    ".oga": "audio/ogg", /// OGG audio
    ".ogv": "video/ogg", /// OGG video
    ".ogx": "application/ogg", /// OGG
    ".opus": "audio/opus", /// Opus audio
    ".otf": "font/otf", /// OpenType font
    ".php": "application/x-httpd-php", /// Hypertext Preprocessor (Personal Home Page)
    ".ppt": "application/vnd.ms-powerpoint", /// Microsoft PowerPoint
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation", /// Microsoft PowerPoint (OpenXML)
    ".rar": "application/vnd.rar", /// RAR archive
    ".rtf": "application/rtf", /// Rich Text Format (RTF)
    ".sh": "application/x-sh", /// Bourne shell script
    ".swf": "application/x-shockwave-flash", /// Small web format (SWF) or Adobe Flash document
    ".tar": "application/x-tar", /// Tape Archive (TAR)
    ".tif": "image/tiff", /// Tagged Image File Format (TIFF)
    ".tiff": "image/tiff", /// Tagged Image File Format (TIFF)
    ".ts": "video/mp2t", /// MPEG transport stream
    ".ttf": "font/ttf", /// TrueType Font
    ".txt": "text/plain", /// Text, (generally ASCII or ISO 8859-n)
    ".vsd": "application/vnd.visio", /// Microsoft Visio
    ".wav": "audio/wav", /// Waveform Audio Format
    ".xhtml": "application/xhtml+xml", /// XHTML
    ".xls": "application/vnd.ms-excel", /// Microsoft Excel
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", /// Microsoft Excel (OpenXML)
    ".xml": "application/xml", /// XML
    ".xul": "application/vnd.mozilla.xul+xml", /// XUL
    ".zip": "application/zip", /// ZIP archive
    ".3gp": "video/3gpp", /// 3GPP audio/video container
    ".3g2": "video/3gpp2", /// 3GPP2 audio/video container
    ".7z": "application/x-7z-compressed", /// 7-zip archive
};

function getParams(options, argv)
{
    var i;
    var params = {_: []};
    var last;
    var len;
    var match;
        
    if (Array.isArray(options)) {
        argv = options;
        options = {};
    }
    
    options = options || {};
    
    if (!options.booleans) {
        options.booleans = [];
    }
    
    argv = argv || process.argv;
    
    len = argv.length;
    
    for (i = 2; i < len; i += 1) {
        if (argv[i][0] === "-") {
            if (argv[i][1] === "-") {
                if (argv[i] === "--") {
                    params["--"] = argv.slice(i + 1);
                    break;
                }
                last = argv[i].substr(2);
                match = last.match(/([^=]*)=(.*)/);
                if (match) {
                    last = match[1];
                    params[last] = match[2];
                    last = "";
                } else {
                    params[last] = true;
                }
            } else {
                /// E.g., -hav should indicate h, a, and v as TRUE.
                // jshint loopfunc:true
                argv[i].split("").slice(1).forEach(function oneach(letter)
                {
                    params[letter] = true;
                    last = letter;
                });
                // jshint loopfunc:false
            }
        } else if (last) {
            params[last] = argv[i];
            last = "";
        } else {
            params._.push(argv[i]);
            last = "";
        }
        /// Handle booleans.
        if (last && options.booleans.indexOf(last) > -1) {
            last = "";
        }
    }
    
    return params;
}


function getMime(filename)
{
    return mimeData[p.extname(filename)] || "application/octet-stream";
}

function parseRange(headers, total)
{
    var match;
    var start;
    var end;
    if (headers && headers.range && typeof headers.range === "string" && total) {
        match = headers.range.match(/bytes=(\d+)(?:-(\d+))?/) || [];
        start = match[1] && match[1] >= 0 ? Number(match[1]) : 0;
        end = match[2] && match[2] > start && match[2] < total ? Number(match[2]) : total - 1;
        return {
            start: start,
            end: end
        };
    }
}

function escapeHTML(str)
{
    return String(str).replace("<", "&lt;").replace("\"", "&quot;");
}

function generateKeys()
{
    var execFileSync = require("child_process").execFileSync;
    var keyPem = "k" + Math.random() + ".pem";
    var key;
    var cert = execFileSync("openssl", ["req", "-new", "-newkey", "rsa:4096","-days", "9999", "-nodes", "-x509", "-subj", "/C=US/ST=State/L=Locality/O=Organization/CN=www.example.com", "-keyout", keyPem], {encoding: "utf8", stdio: ["pipe","pipe","pipe"]});
    
    key = fs.readFileSync(keyPem, "utf8");
    
    fs.unlinkSync(keyPem);
    return {
        key: key,
        cert: cert,
    };
}

function createServer(cb)
{
    var options;
    var server;
    if (params.ssl) {
        options = generateKeys();
        server = require("https").createServer(options, cb);
    } else {
        server = require("http").createServer(cb);
    }
    server.on("error", function (err)
    {
        if (err.code === "EADDRINUSE") {
            console.error();
            console.error("ERROR: " + err.code)
            console.error("  Another process is already listening to port " + port + ".");
            console.error("  You either need to close that process or use a different port.");
            console.error();
        } else if (err.code === "EACCES") {
            console.error();
            console.error("ERROR: " + err.code)
            console.error("  You do not have permission to listen to port " + port + ".");
            console.error("  Try listening to a higher port (>1023) or running the same command again with root permission: sudo !!");
            console.error();
        } else {
            throw err;
        }
    });
    return server;
}

if (params.h || params.help) {
    return (function ()
    {
        function color(colorCode, str)
        {
            if (process.stdout.isTTY) {
                str = "\u001B[" + colorCode + "m" + str + "\u001B[0m";
            }
            
            return str;
        }
        
        function bold(str)
        {
            return color(1, str);
        }
        
        function note(str)
        {
            return color(36, str);
        }
        
        function highlight(str)
        {
            return color(33, str);
        }

        console.log();
        console.log(bold("Simple Server"));
        console.log();
        console.log("Usage: ./server.js " + highlight("[options]"));
        console.log();
        console.log("Options:");
        console.log("  " + note("--dir") + "      Which director to serve files from (default " + highlight("cwd") + ")");
        console.log("  " + note("-p") + " " + note("--port") + "  Which port to listen to (default " + highlight("8080") + " or " + highlight("443") + " for SSL)");
        console.log("  " + note("--ssl") + "      Enable SSL encryption (a random key is generated)");
        console.log("  " + note("--list") + "     List directory contents instead of returning 404");
        console.log("  " + note("--coop") + "     Adds Cross-Origin-Opener-Policy header");
        console.log("  " + note("--coep") + "     Adds Cross-Origin-Embedder-Policy header");
        console.log("  " + note("--cors") + "     Enable headers for Cross-Origin Resource Sharing (alias of " + note("--coop") + " and " + note("--coep") + ")");
        console.log("  " + note("-h") + " " + note("--help") + "  Print this help message");
        console.log();
    }());
}

createServer(function(req, res)
{
    var filename;
    var uri = qs.unescape(url.parse(req.url).pathname);
    
    function showDir(filename)
    {
        var html;
        var baseURL = filename;
        baseURL = p.relative(dir, baseURL);
        if (baseURL.slice(-1) !== "/") {
            baseURL += "/";
        }
        if (baseURL[0] !== "/") {
            baseURL = "/" + baseURL;
        }
        
        html = "<!doctype html><html><head><style>html{background: #000}a{color: #ccc!important;}</style><meta charset=utf-8><title>" + escapeHTML(p.basename(baseURL)) + "</title></head><body>";
        
        res.writeHead(200, {"Content-Type": "text/html"});
        if (baseURL !== "/") {
            html += "<div>";
            html += "<a href=\"" + escapeHTML(p.dirname(baseURL)) + "\">";
            html += ".. (up)";
            html += "</a>";
            html += "</div>\n";
        }
        fs.readdirSync(filename).forEach(function (entry)
        {
            html += "<div>";
            html += "<a href=\"" + escapeHTML(baseURL + encodeURI(entry)) + "\">";
            html += escapeHTML(entry);
            html += "</a>";
            html += "</div>\n";
        });
        html += "</body></html>";
        res.write(html);
        res.end();
    }
    
    filename = p.join(dir, uri);
    
    if (uri.substr(0,4) === "/../" || uri.substr(0, 1) !== "/" || p.relative(dir, filename).substr(0, 3) === "../") {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("404 Not Found\n");
        res.end();
        return;
    }
    
    function sendFile(filename)
    {
        fs.stat(filename, function (err, stats)
        {
            var resHeaders = {};
            var range;
            var streamOptions = {"bufferSize": 4096};
            var code = 200;
            
            if (err) {
                res.writeHead(404, {"Content-Type": "text/plain"});
                res.write("404 Not Found\n");
                res.end();
                return;
            }
            
            if (stats.isDirectory()) {
                if (listDir) {
                    return showDir(filename);
                }
                filename += "/index.html";
                return sendFile(filename);
            }
            
            /// Most browsers needs these headers in order to handle shared array buffers for multi-threaded WASM.
            if (params.coop || params.cors) {
                resHeaders["Cross-Origin-Opener-Policy"] = "same-origin";
            }
            if (params.coep || params.cors) {
                resHeaders["Cross-Origin-Embedder-Policy"] = "require-corp";
            }
            
            if (req.headers["if-modified-since"] && Date.parse(stats.mtime) <= Date.parse(req.headers["if-modified-since"])) {
                res.writeHead(304, resHeaders);
                res.end();
                return;
            }
            
            /// This tells the browser to check the Last-Modified header every time.
            resHeaders.Expires = "0";
            resHeaders["Cache-Control"] = "max-age=0, must-revalidate"; /// Add "no-cache" to force the browser not to cache the file at all.
            
            resHeaders["Content-Type"] = getMime(filename);
            resHeaders["Content-Length"] = stats.size;
            resHeaders["Access-Control-Allow-Origin"] = "*";
            resHeaders["Accept-Ranges"] = "bytes";
            resHeaders["Last-Modified"] = new Date(stats.mtime).toUTCString();
            
            range = parseRange(req.headers, stats.size);
            
            if (range) {
                if (range.end <= range.start) {
                    /// Range not satisfiable.
                    res.writeHead(416);
                    res.end();
                    return;
                }
                streamOptions.start = range.start;
                streamOptions.end = range.end;
                resHeaders["Content-Range"] = "bytes " + range.start + '-' + range.end + '/' + stats.size;
                resHeaders["Content-Length"] = range.end - range.start + 1;
                code = 206;
            }
            
            res.writeHead(code, resHeaders);
            
            /// Stream the data out to prevent massive buffers on large files.
            fs.createReadStream(filename, streamOptions).pipe(res).once("error", function (err)
            {
                console.error(err);
                res.end();
            });
        });
    }
    
    sendFile(filename)
    
}).listen(parseInt(port, 10), function onopen()
{
    console.log("Listening to http" + (params.ssl ? "s" : "") + "://localhost:" + port);
});
