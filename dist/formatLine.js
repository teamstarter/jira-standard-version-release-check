"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatLine = void 0;
const interfaces_1 = require("./globals/interfaces");
const formatNoUS = (lineObj) => {
    if (lineObj.warningType === "FetchErr")
        lineObj.warningText = `[🔥 ERROR DURING FETCH]`;
    if (lineObj.warningType === "MissUSNb")
        lineObj.warningText = `[🚨 MISSING US NB]`;
    if (lineObj.warningType === "WrongUsNumber")
        lineObj.warningText = `[❓ WRONG US NB]`;
    return lineObj;
};
const formatILine = (lineObj) => {
    const result = lineObj;
    debugger;
    if (result.US.warningType == "USIsTask") {
        result.US.warningText = `[👮‍ ${lineObj.US.warningTaskNumber} is a TASK]`;
    }
    result.US.statusText = `${lineObj.US.statusType == "isProd"
        ? `[🚀`
        : lineObj.US.statusType == "isReadyToRelease"
            ? `[✅`
            : `[❌ `}${lineObj.US.statusType === "isProd" || lineObj.US.statusType === "isReadyToRelease" ? `` : lineObj.US.statusJira}]`;
    if (result.tasks)
        for (const task of result.tasks) {
            task.statusText = `${task.statusType === "isReadyToRelease"
                ? `✅`
                : task.statusType === "isProd"
                    ? `👌`
                    : `👎 ${task.statusJira} @${task.assignee}`}`;
        }
    return result;
};
const formatILineEmpty = (lineObj) => {
    return lineObj;
};
const formatLine = (lineObj) => {
    if ((0, interfaces_1.isILineEmpty)(lineObj))
        return formatILineEmpty(lineObj);
    if ((0, interfaces_1.isILineNoUS)(lineObj))
        return formatNoUS(lineObj);
    if ((0, interfaces_1.isILine)(lineObj))
        return formatILine(lineObj);
    return undefined;
};
exports.formatLine = formatLine;
//# sourceMappingURL=formatLine.js.map