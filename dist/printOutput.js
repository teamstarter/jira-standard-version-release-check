"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printOutput = void 0;
const interfaces_1 = require("./globals/interfaces");
const setUpOptions_1 = require("./setUpOptions");
const printRegular = (output, isWarning, outputFormat) => {
    for (const lineObj of output) {
        let formatedLine = "";
        if ((0, interfaces_1.isILineNoUS)(lineObj)) {
            formatedLine = `${lineObj.textMode}${lineObj.textColor}${lineObj.warningText}${outputFormat.modeEscape} ${lineObj.text}`;
        }
        else if ((0, interfaces_1.isILine)(lineObj)) {
            if (lineObj.US.warningType)
                formatedLine = `${outputFormat.modeBold}${outputFormat.colorWarning}${lineObj.US.warningText}${outputFormat.modeEscape} `;
            if (!isWarning) {
                formatedLine += `${lineObj.US.textMode}${lineObj.US.textColor}${lineObj.US.statusText} ${lineObj.US.number} |${lineObj.US.statusType === "isNotOk" ? ` @${lineObj.US.assignee}` : ``} ${lineObj.US.title}${outputFormat.modeEscape}`;
                if (lineObj.tasks && lineObj.tasks.length > 0) {
                    formatedLine += `\n`;
                    for (const subtask of lineObj.tasks) {
                        formatedLine += `${subtask.textMode}${subtask.textColor}(${subtask.statusText} ${subtask.number})${outputFormat.modeEscape}`;
                    }
                    formatedLine += `\n`;
                }
                if (lineObj.US.statusType === "isNotOk") {
                    if (formatedLine.slice(-1) !== `\n`)
                        formatedLine += `\n`;
                    formatedLine += `${outputFormat.modeDim}${outputFormat.colorDefault}${lineObj.US.link}${outputFormat.modeEscape}\n`;
                }
            }
        }
        if (formatedLine !== "")
            console.log(formatedLine);
    }
};
const printTab = (output, isWarning) => {
    let table = [];
    for (const lineObj of output) {
        if (lineObj === undefined || (0, interfaces_1.isILineEmpty)(lineObj))
            continue;
        let formatedRow;
        if ((0, interfaces_1.isILineNoUS)(lineObj)) {
            const matched = lineObj.text.match(/\*\*.+\*\*.+ /);
            formatedRow = {
                USstatus: lineObj.warningText,
                USTitle: matched ? matched[0] : "",
            };
        }
        if ((0, interfaces_1.isILine)(lineObj)) {
            if (lineObj.US.warningType) {
                const matched = lineObj.US.title.match(/\*\*.+\*\*.+ /);
                formatedRow = {
                    USstatus: lineObj.US.warningText,
                    USNumber: lineObj.US.number,
                    USTitle: matched ? matched[0] : "",
                };
            }
            else if (!isWarning) {
                formatedRow = {
                    USstatus: lineObj.US.statusText,
                    USNumber: lineObj.US.number,
                    USTitle: lineObj.US.title,
                };
            }
        }
        if (formatedRow !== undefined)
            table.push(formatedRow);
    }
    console.table(table, ["USstatus", "USNumber", "USTitle"]);
};
const printOutput = (output, outputFormat) => {
    if (output === undefined)
        return;
    const options = setUpOptions_1.SOptions.getOptions();
    if (options.table) {
        printTab(output, options.onlyWarnings);
    }
    else
        printRegular(output, options.onlyWarnings, outputFormat);
};
exports.printOutput = printOutput;
//# sourceMappingURL=printOutput.js.map