// Optional live-analysis scheduler for an engine created by loadEngine.js.
// The caller must not send other searches through that engine while using it.
function latestAnalysis(engine)
{
    "use strict";
    var active;
    var pending;
    var scheduled = false;
    var failure;

    function cancel(job)
    {
        if (job && !job.cancelled) {
            job.cancelled = true;
            job.resolve({status: "cancelled"});
        }
    }

    function fail(error)
    {
        failure = error;
        if (active) { active.reject(error); }
        if (pending) { pending.reject(error); }
        active = pending = null;
    }

    function start()
    {
        if (active || scheduled || !pending || failure) { return; }
        var job = active = pending;
        pending = null;
        try {
            engine.send(job.position);
            engine.send(job.go, function (bestmove)
            {
                active = null;
                // Let loadEngine finish dispatching this response before
                // sending another search, including with synchronous adapters.
                scheduled = true;
                setTimeout(function () { scheduled = false; start(); }, 0);
                if (!job.cancelled) {
                    job.resolve({status: "completed", bestmove: bestmove});
                }
            }, function (line)
            {
                if (!job.cancelled && job.onInfo) { job.onInfo(line); }
            });
        } catch (error) {
            fail(error);
        }
    }

    function stopActive()
    {
        if (active && !active.stopping) {
            active.stopping = true;
            try { engine.send("stop"); } catch (error) { fail(error); }
        }
    }

    return {
        analyze: function (position, go, onInfo)
        {
            if (typeof position !== "string" || !/^position\s+\S/.test(position.trim()) ||
                    /[\r\n]/.test(position) || typeof go !== "string" ||
                    !/^go(?:\s|$)/.test(go.trim()) || /[\r\n]/.test(go) ||
                    /(?:^|\s)perft(?:\s|$)/.test(go) ||
                    (typeof onInfo !== "undefined" && typeof onInfo !== "function")) {
                return Promise.reject(new TypeError("Expected one position command, one search go command and an optional info callback"));
            }
            if (failure) { return Promise.reject(failure); }
            return new Promise(function (resolve, reject)
            {
                cancel(pending);
                pending = {position: position.trim(), go: go.trim(), onInfo: onInfo, resolve: resolve, reject: reject};
                cancel(active);
                stopActive();
                start();
            });
        },
        stop: function ()
        {
            cancel(pending);
            pending = null;
            cancel(active);
            stopActive();
        }
    };
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = latestAnalysis;
}
