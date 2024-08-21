
/// Fix fetch in Node.js
if (typeof global !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]" && typeof fetch !== "undefined") {
    /// XMLHttpRequest polyfill for Node.js.
    if (typeof XMLHttpRequest === "undefined") {
        global["XMLHttpRequest"] = function (a)
        {
            var url
            var xhr = {
                open: function (method, _url)
                {
                    url = _url;
                },
                send: function ()
                {
                    require("fs").readFile(url, function (err, data)
                    {
                        xhr.readyState = 4; /// DONE
                        if (err) {
                            console.error(err);
                            xhr.status = 404;
                            xhr.onerror(err);
                        } else {
                            xhr.status = 200;
                            xhr.response = data;
                            xhr.onreadystatechange();
                            xhr.onload();
                        }
                    });
                }
            };
            return xhr;
        }
    }
    fetch = null;
}

Module["print"] = function (data)
{
    if (Module["listener"]) {
        Module["listener"](data);
    } else {
        console.log(data);
    }
}
Module["printErr"] = function (data)
{
    if (Module["listener"]) {
        Module["listener"](data);
    } else {
        console.error(data);
    }
}

Module["terminate"] = function ()
{
    if (typeof PThread !== "undefined") {
        PThread.terminateAllThreads();
    }
};
