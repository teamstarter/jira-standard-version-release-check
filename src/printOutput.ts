import { _gASCII } from "./globals/globals";
import {
  ILine,
  ILineNoUS,
  ILineEmpty,
  isILineEmpty,
  isILine,
  isILineNoUS,
  IOptionsArguments,
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
      const title = lineObj.text!.split(/\(\[.+\]\(.+\)/)[0];
      formatedRow = {
        USstatus: lineObj.warningText!,
        USTitle: title,
      };
    }
    let subtaskTab: string[] | undefined;

    if (isILine(lineObj)) {
      const title = lineObj.US.title.split(/\(\[.+\]\(.+\)/)[0];
      if (lineObj.US.warningType) {
        formatedRow = {
          USstatus: lineObj.US.warningText!,
          USNumber: lineObj.US.number,
          USTitle: title,
        };
      } else if (!isWarning) {
        if (lineObj.tasks && lineObj.tasks.length > 0) {
          subtaskTab = [];
          for (const subtask of lineObj.tasks) {
            if (subtask.statusType === "isReadyToRelease")
              subtaskTab.push(`(${subtask.statusText} ${subtask.number})`);
          }
        }
        formatedRow = {
          USstatus: lineObj.US.statusText!,
          USNumber: lineObj.US.number,
          USTitle: lineObj.US.title,
        };
      }
      if (subtaskTab !== undefined && formatedRow !== undefined)
        formatedRow.TasksText = subtaskTab;
    }
    if (formatedRow !== undefined) table.push(formatedRow);
  }
  console.table(table);
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
