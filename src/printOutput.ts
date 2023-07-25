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

const printRegular: any = (
  output: (ILine | ILineNoUS | ILineEmpty | undefined)[],
  isWarning: boolean, outputFormat: any
) => {
  for (const lineObj of output) {
    let formatedLine: string = "";
    if (isILineNoUS(lineObj)) {
      formatedLine = `${lineObj.textMode}${lineObj.textColor}${lineObj.warningText}${outputFormat.modeEscape} ${lineObj.text}`;
    } else if (isILine(lineObj)) {
      if (lineObj.US.warningType)
        formatedLine = `${outputFormat.modeBold}${outputFormat.colorWarning}${lineObj.US.warningText}${outputFormat.modeEscape} `;
      if (!isWarning) {
        formatedLine += `${lineObj.US.textMode}${lineObj.US.textColor}${
          lineObj.US.statusText
        } ${lineObj.US.number} |${
          lineObj.US.statusType === "isNotOk" ? ` ${lineObj.US.assignee}` : ``
        } ${lineObj.US.title}${outputFormat.modeEscape}`;

        if (lineObj.tasks && lineObj.tasks.length > 0) {
          formatedLine += `\n`;
          for (const subtask of lineObj.tasks) {
            formatedLine += `${subtask.textMode}${subtask.textColor}(${subtask.statusText} ${subtask.number})${outputFormat.modeEscape}`;
          }
          formatedLine += `\n`;
        }
        if (lineObj.US.statusType === "isNotOk") {
          if (formatedLine.slice(-1) !== `\n`) formatedLine += `\n`;
          formatedLine += `${outputFormat.modeDim}${outputFormat.colorDefault}${lineObj.US.link}${outputFormat.modeEscape}\n`;
        }
      }
    }
    if (formatedLine !== "") console.log(formatedLine);
  }
};

const printTab: any = (
  output: (ILine | ILineNoUS | ILineEmpty | undefined)[],
  isWarning: boolean
) => {
  let table: IRow[] = [];
  for (const lineObj of output) {
    if (lineObj === undefined || isILineEmpty(lineObj)) continue;

    let formatedRow: IRow | undefined;
    if (isILineNoUS(lineObj)) {
      const matched = lineObj.text!.match(/\*\*.+\*\*.+ /);
      formatedRow = {
        USstatus: lineObj.warningText!,
        USTitle: matched ? matched[0] : "",
      };
    }
    if (isILine(lineObj)) {
      if (lineObj.US.warningType) {
        const matched = lineObj.US.title.match(/\*\*.+\*\*.+ /);
        formatedRow = {
          USstatus: lineObj.US.warningText!,
          USNumber: lineObj.US.number,
          USTitle: matched ? matched[0] : "",
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
  output: (ILine | ILineNoUS | ILineEmpty | undefined)[] | undefined, outputFormat: any
) => {
  if (output === undefined) return;
  const options = SOptions.getOptions();
  if (options.table) {
    printTab(output, options.onlyWarnings);
  } else printRegular(output, options.onlyWarnings, outputFormat);
};
