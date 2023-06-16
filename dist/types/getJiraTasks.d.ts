import { Issue } from "jira.js/out/version3/models/issue";
import { ISubtask, IUserStory, WarningTypes } from "./globals/interfaces";
export declare function getUs(issue: Issue, outputFormat: any, warning?: WarningTypes): IUserStory;
export declare function getSingleSubtask(sub: Issue, outputFormat: any): Promise<ISubtask>;
export declare function getSubtasks(issue: Issue, outputFormat: any): Promise<ISubtask[]>;
export declare function makeLink(key: string): string;
