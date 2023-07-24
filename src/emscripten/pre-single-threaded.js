Module["__IS_SINGLE_THREADED__"] = true;
Module["_origOnCustomMessage"] = Module["onCustomMessage"];
Module["onCustomMessage"] = function (data)
{
    if (data === "stop" || data === "quit") {
        Module["_stop"]();
    } else if (data === "ponderhit") {
        Module["_ponderhit"]();
    }
    return Module["_origOnCustomMessage"](data);
};
