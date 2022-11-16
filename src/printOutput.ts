import { _gASCII } from "./globals/globals";
import {
  ILine,
  ILineNoUS,
  ILineEmpty,
  isILineEmpty,
  isILine,
  isILineNoUS,
  IOptionsArguments,
} from "./globals/interfaces";
import { SOptions } from "./setUpOptions";

const printRegular = (
  output: (ILine | ILineNoUS | ILineEmpty | undefined)[],
  isWarning: boolean
) => {
  for (const lineObj of output) {
    let formatedLine: string = "";
    if (isILineNoUS(lineObj)) {
      formatedLine = `${lineObj.textMode}${lineObj.textColor}${lineObj.warningText}${_gASCII.modeEscape} ${lineObj.text}`;
    } else if (isILine(lineObj)) {
      if (lineObj.US.warningType)
        formatedLine = `${_gASCII.modeBold}${_gASCII.colorWarning}${lineObj.US.warningText}${_gASCII.modeEscape} `;
      if (!isWarning) {
        formatedLine += `${lineObj.US.textMode}${lineObj.US.textColor}${
          lineObj.US.statusText
        }${
          lineObj.US.statusType === "isNotOk" ? ` @${lineObj.US.assignee}` : ``
        } ${lineObj.US.title}${_gASCII.modeEscape}`;

        if (lineObj.tasks && lineObj.tasks.length > 0) {
          formatedLine += `\n`;
          for (const subtask of lineObj.tasks) {
            formatedLine += `${subtask.textMode}${subtask.textColor}(${subtask.statusText} ${subtask.number})${_gASCII.modeEscape}`;
          }
          formatedLine += `\n`;
        }
      }
    } else if (isILineEmpty(lineObj) && !isWarning)
      formatedLine = `${lineObj.textMode}${lineObj.textColor}${lineObj.text}${_gASCII.modeEscape}`;
    if (formatedLine !== "") console.log(formatedLine);
  }
};

export const printOutput = (
  output: (ILine | ILineNoUS | ILineEmpty | undefined)[] | undefined
) => {
  if (output === undefined) return;
  const options = SOptions.getOptions();
  if (options.table && options.onlyWarnings) {
  } else if (options.table) {
  } else {
  }
  printRegular(output, options.onlyWarnings);
};
