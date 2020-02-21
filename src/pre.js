/**
 * Copyright (C) Tord Romstad (Glaurung author)
 * Copyright (C) Marco Costalba, Joona Kiiski, Tord Romstad (Stockfish authors)
 * Copyright (C) Chess.com
 * Copyright (C) Nathan Rugg (Stockfish.js)
 * Copyright (C) Phillip Albanese - https://github.com/philososaur
 *
 * Stockfish is free, and distributed under the GNU General Public License
 * (GPL). Essentially, this means that you are free to do almost exactly
 * what you want with the program, including distributing it among your
 * friends, making it available for download from your web site, selling
 * it (either by itself or as part of some bigger software package), or
 * using it as the starting point for a software project of your own.
 *
 * The only real limitation is that whenever you distribute Stockfish in
 * some way, you must always include the full source code, or a pointer
 * to where the source code can be found. If you make any changes to the
 * source code, these changes must also be made available under the GPL.
 *
 * The source code for this emscripten port of stockfish can be found
 * at http://github.com/nmrugg/stockfish.js.
 */
var STOCKFISH = (function ()
{
    function load_stockfish(console, WasmPath)
    {
        /// Fake timer for Safari and IE/Edge.
        ///NOTE: Both Chrome and Edge have "Safari" in it.
        if (typeof navigator !== "undefined" && (/MSIE|Trident|Edge/i.test(navigator.userAgent) || (/Safari/i.test(navigator.userAgent) && !/Chrome|CriOS/i.test(navigator.userAgent)))) {
            var dateNow = Date.now;
        }
        var Module = {
            wasmBinaryFile: WasmPath
        };
        