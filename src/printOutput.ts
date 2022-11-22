import { _gASCII } from "./globals/globals";
import {
  ILine,
  ILineNoUS,
  ILineEmpty,
  isILineEmpty,
  isILine,
  isILineNoUS,
  IRow,
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
        if (lineObj.US.statusType === "isReadyToRelease") {
          if (formatedLine.slice(-1) !== `\n`) formatedLine += `\n`;
          formatedLine += `${_gASCII.modeDim}${_gASCII.colorDefault}${lineObj.US.link}${_gASCII.modeEscape}\n`;
        }
      }
    }
    if (formatedLine !== "") console.log(formatedLine);
  }
};

const printTab = (
  output: (ILine | ILineNoUS | ILineEmpty | undefined)[],
  isWarning: boolean
) => {
  let table: IRow[] = [];
  for (const lineObj of output) {
    if (lineObj === undefined || isILineEmpty(lineObj)) continue;

    let formatedRow: IRow | undefined;
    if (isILineNoUS(lineObj)) {
      const title = lineObj.text!.match(/\*\*.+\*\*.+ /)![0];
      formatedRow = {
        USstatus: lineObj.warningText!,
        USTitle: title ? title : "",
      };
    }
    if (isILine(lineObj)) {
      if (lineObj.US.warningType) {
        const title = lineObj.US.title.match(/\*\*.+\*\*.+ /)![0];
        formatedRow = {
          USstatus: lineObj.US.warningText!,
          USNumber: lineObj.US.number,
          USTitle: title ? title : "",
        };
      } else if (!isWarning) {
        formatedRow = {
          USstatus: lineObj.US.statusText!,
          USNumber: lineObj.US.number,
          USTitle: lineObj.US.title,
        };
      }
    }
    if (formatedRow !== undefined) table.push(formatedRow);
  }
  console.table(table, ["USstatus", "USNumber", "USTitle"]);
};

export const printOutput = (
  output: (ILine | ILineNoUS | ILineEmpty | undefined)[] | undefined
) => {
  if (output === undefined) return;
  const options = SOptions.getOptions();
  if (options.table) {
    printTab(output, options.onlyWarnings);
  } else printRegular(output, options.onlyWarnings);
};
