#!/usr/bin/env node

"use strict";

// jshint maxlen: false
// jshint maxlen: false, forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:strict, curly:true, browser:false, evil:false, node:true, camelcase:true, quotmark:double, latedef:nofunc, +W081, -W064, -W038

var p = require("path");
var fs = require("fs");
var dir = p.join(__dirname);
var port = Number(process.argv[2]) || 8080;
var execFile;

var mimeData = {
    ".html": "text/html; charset=utf-8",
    ".htm":  "text/html; charset=utf-8",
    ".css":  "text/css; charset=utf-8",
    ".js":   "application/javascript; charset=utf-8",
    ".png":  "image/png",
    ".jpeg": "image/jpeg",
    ".jpg":  "image/jpeg",
    ".gif":  "image/gif",
    ".webp": "image/webp",
    ".pdf":  "application/pdf",
    ".txt":  "text/plain",
    ".svg":  "image/svg+xml; charset=utf-8",
    ".xml":  "application/xml",
    ".ttf":  "application/x-font-ttf",
    ".woff": "application/x-font-woff",
    ".mp3":  "audio/mpeg",
    ".mp4":  "video/mp4",
    ".ogg":  "application/ogg",
    ".ogv":  "video/ogg",
    ".oga":  "audio/ogg",
    ".avi":  "video/avi",
    ".wav":  "audio/x-wav",
    ".webm": "video/webm",
    ".zip":  "application/x-compressed",
    ".bin":  "application/octet-stream",
    ".json": "application/json; charset=utf-8",
    ".wasm": "application/wasm",
};

function getMime(filename)
{
    return mimeData[p.extname(filename)] /* istanbul ignore next */ || "application/octet-stream";
}

function parseRange(headers, total)
{
    var match;
    var start;
    var end;
    if (headers && headers.range && typeof headers.range === "string" && total) {
        match = headers.range.match(/bytes=(\d+)(?:-(\d+))?/) /* istanbul ignore next */ || [];
        start = match[1] && match[1] >= 0 ? Number(match[1]) /* istanbul ignore next */ : 0;
        end = match[2] && match[2] > start && match[2] < total ? Number(match[2]) : total - 1;
        return {
            start: start,
            end: end
        };
    }
}

function badRequest(res, mes)
{
    res.writeHead(400, {"Content-Type": "application/json"});
    res.write(mes || "{\"err\":1,\"message\":\"Bad length\"}");
    res.end();
}

function handleCache(req, res, stats)
{
    var mtime;
    var clientMTime;
    
    if (req.headers["if-modified-since"]) {
        /// Since the "Last-Modified" and "if-modified-since" headers cannot handle miliseconds, we need to remove them from the time values.
        mtime = Math.floor(stats.mtime.getTime() / 1000);
        clientMTime = Math.floor(Date.parse(req.headers["if-modified-since"]) / 1000);
        if (clientMTime >= mtime) {
            res.status = 304;
            res.writeHead(res.status, res.headers);
            res.end();
            return true;
        }
    }
}
function serve(req, res)
{
    var filename;
    var url = req.url;
    var endOfPath = url.indexOf("?");
    
    if (endOfPath > -1) {
        url = url.substr(0, endOfPath);
    }
    
    url = decodeURI(url);
    
    /// Redirect dirs to index.html.
    url = url.replace(/(.*\/)$/, "$1index.html");
    
    filename = p.join(dir, url);
    
    /// Make sure that the request within the allowed directory.
    if (url.indexOf("..") !== -1 || url.substr(0, 1) !== "/" || p.relative(dir, filename).indexOf("..") !== -1) {
        return false;
    }
    
    fs.stat(filename, function (err, stats)
    {
        var resHeaders = {};
        var range;
        var streamOptions = {"bufferSize": 4096};
        var code = 200;
        var stream;
        
        if (!err && !stats.isDirectory()) {
            if (!handleCache(req, res, stats)) {
                resHeaders["Content-Type"] = getMime(filename);
                resHeaders["Content-Length"] = stats.size;
                resHeaders["Accept-Ranges"] = "bytes";
                resHeaders["Last-Modified"] = new Date(stats.mtime).toUTCString();
                resHeaders.Expires = new Date().toUTCString(); /// Tell the client to check for changes every time.
                
                /// Firefox needs these headers in order to handle shared array buffers for multi-threaded WASM.
                resHeaders["Cross-Origin-Embedder-Policy"] = "require-corp";
                resHeaders["Cross-Origin-Opener-Policy"] = "same-origin";
                
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
                    resHeaders["Content-Range"] = "bytes " + range.start + "-" + range.end + "/" + stats.size;
                    code = 206;
                }
                
                res.writeHead(code, resHeaders);
                
                /// Stream the data out to prevent massive buffers on large files.
                stream = fs.createReadStream(filename, streamOptions);
                stream.on("close", function onclose()
                {
                    res.end();
                });
                stream.pipe(res);
            }
        } else {
            badRequest(res);
        }
    });
    
    return true;
}

function createServer(cb)
{
    return require("http").createServer(cb);
}
createServer(serve).listen(port, function onopen()
{
    console.log("Listening to http://127.0.0.1:" + port);
});
