import { _gASCII } from "./globals/globals";
import {
  ILine,
  ILineNoUS,
  ILineEmpty,
  isILineEmpty,
  isILineNoUS,
  isILine,
} from "./globals/interfaces";

const formatNoUS = (lineObj: ILineNoUS) => {
  if (lineObj.warningType === "FetchErr")
    lineObj.warningText = `[🔥 ERROR DURING FETCH]`;
  if (lineObj.warningType === "MissUSNb")
    lineObj.warningText = `[🚨 MISSING US NB]`;
  if (lineObj.warningType === "WrongUsNumber")
    lineObj.warningText = `[❓ WRONG US NB]`;
  return lineObj;
};

const formatILine = (lineObj: ILine) => {
  const result: ILine = lineObj;

  if (result.US.warningType == "USIsTask") {
    result.US.warningText = `[👮‍ ${lineObj.US.warningTaskNumber} is a TASK]`;
  }
  result.US.statusText = `${
    lineObj.US.statusType == "isProd"
      ? `[🚀`
      : lineObj.US.statusType == "isReadyToRelease"
      ? `[✅ `
      : `[❌ `
  }${lineObj.US.statusType == "isProd" ? `` : lineObj.US.statusJira}]`;

  if (result.tasks)
    for (const task of result.tasks) {
      task.statusText = `${
        task.statusType === "isReadyToRelease"
          ? `✅ ${task.statusType}`
          : task.statusType === "isProd"
          ? `👌`
          : `👎 ${task.statusJira} @${task.assignee}`
      }`;
    }
  return result;
};

const formatILineEmpty = (lineObj: ILineEmpty) => {
  return lineObj;
};

export const formatLine = (
  lineObj: ILine | ILineNoUS | ILineEmpty | undefined
) => {

  if (isILineEmpty(lineObj)) return formatILineEmpty(lineObj);
  if (isILineNoUS(lineObj)) return formatNoUS(lineObj);
  if (isILine(lineObj)) return formatILine(lineObj);
  return undefined;
};
