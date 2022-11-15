export interface IOptionsArguments {
  onlyWarnings: boolean;
  table: boolean;
  disableChecks: boolean;
}

export interface IUserStory {
  warningType?: WarningTypes;
  status: StatusTypes;
  showSubtasks: boolean;
  number: string;
  assignee: string | undefined;
  title: string;
  link: string;
}
export interface ISubtask {
  status: StatusTypes;
  assignee: string;
  number: string;
}

export interface ILine {
  US: IUserStory;
  tasks?: ISubtask[];
}

export interface ILineNoUS {
  warningType: WarningTypes;
  text: string;
}

export interface ILineEmpty {
  text: string;
}

export type WarningTypes =
  | "NoUS"
  | "MissUSNb"
  | "FetchErr"
  | "USNotFound"
  | "USIsTask";

export type StatusTypes = "isNotOk" | "isProd" | "isReadyToRelease";
