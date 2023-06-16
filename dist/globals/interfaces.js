"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isILineNoUS = exports.isILineEmpty = exports.isILine = void 0;
function isILine(line) {
    return line.lineType === "ILine";
}
exports.isILine = isILine;
function isILineEmpty(line) {
    return line.lineType === "ILineEmpty";
}
exports.isILineEmpty = isILineEmpty;
function isILineNoUS(line) {
    return line.lineType === "ILineNoUS";
}
exports.isILineNoUS = isILineNoUS;
//# sourceMappingURL=interfaces.js.map