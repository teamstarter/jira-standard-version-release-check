export interface IOptionsArguments {
  onlyWarnings: boolean;
  table: boolean;
  disableChecks: boolean;
}

export interface IUserStory {
  warningType?: WarningTypes;
  warningText?: string;
  warningTaskNumber?: string;
  statusType: StatusTypes;
  statusJira: string;
  statusText?: string;
  showSubtasks: boolean;
  number: string;
  assignee: string;
  title: string;
  textColor: string;
  textMode: string;
  link: string;
}
export interface ISubtask {
  statusType: StatusTypes;
  statusJira: string;
  statusText?: string;
  assignee: string;
  number: string;
  textColor: string;
  textMode: string;
}

export interface ILine {
  lineType: LineTypes;
  US: IUserStory;
  tasks?: ISubtask[];
}

export interface ILineNoUS {
  lineType: LineTypes;
  warningType: WarningTypes;
  warningText?: string;
  USNunber?: string;
  text?: string;
  textColor: string;
  textMode: string;
}

export interface ILineEmpty {
  lineType: LineTypes;
  text: string;
  textColor: string;
  textMode: string;
}

export type WarningTypes =
  | "MissUSNb"
  | "FetchErr"
  | "WrongUsNumber"
  | "USIsTask";

export type LineTypes = "ILineNoUS" | "ILineEmpty" | "ILine";

export type StatusTypes = "isNotOk" | "isProd" | "isReadyToRelease";

export function isILine(
  line: ILine | ILineNoUS | ILineEmpty | undefined
): line is ILine {
  return (line as ILine).lineType === "ILine";
}
export function isILineEmpty(
  line: ILine | ILineNoUS | ILineEmpty | undefined
): line is ILineEmpty {
  return (line as ILineEmpty).lineType === "ILineEmpty";
}
export function isILineNoUS(
  line: ILine | ILineNoUS | ILineEmpty | undefined
): line is ILineNoUS {
  return (line as ILineNoUS).lineType === "ILineNoUS";
}
