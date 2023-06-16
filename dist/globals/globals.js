"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._gMarkdown = exports._gASCII = void 0;
exports._gASCII = {
    modeDefault: "\x1b[",
    modeBold: "\x1b[1;",
    modeDim: "\x1b[2;",
    modeLink: "\x1b[2;4;3m",
    colorReady: "32m",
    colorNotReady: "31m",
    colorNoAction: "36m",
    colorWarning: "33m",
    colorDefault: "39m",
    modeEscape: "\x1b[0m",
};
exports._gMarkdown = {
    modeDefault: "",
    modeBold: "",
    modeDim: "",
    modeLink: "",
    colorReady: "<span style=\"color: green;\">",
    colorNotReady: "<span style=\"color: red;\">",
    colorNoAction: "<span style=\"color: cyan;\">",
    colorWarning: "<span style=\"color: yellow;\">",
    colorDefault: "<span style=\"color:;\">",
    modeEscape: "</span>",
};
//# sourceMappingURL=globals.js.map