import { Issue } from "jira.js/out/version3/models/issue";
import {
  ISubtask,
  IUserStory,
  StatusTypes,
  WarningTypes,
} from "./globals/interfaces";
import { SClient } from "./setUpJiraClient";
import { SOptions } from "./setUpOptions";

export function getUs(issue: Issue, outputFormat: any, warning?: WarningTypes) {
  const options = SOptions.getOptions();
  const statusName = issue.fields.status.name;
  const assigneeName = issue.fields.assignee?.displayName;
  let isUsInProd = false;
  let isUsReady = false;
  const usReadyToReleaseStatus = options.launchPreProd ? process.env.JIRA_US_PREPROD_READY_TO_RELEASE_STATUS : process.env.JIRA_US_READY_TO_RELEASE_STATUS;
  const usReleaseStatus = options.launchPreProd ? process.env.JIRA_US_PREPROD_RELEASE_STATUS : process.env.JIRA_US_RELEASE_STATUS;

  if (statusName) {
    if (usReleaseStatus)
      isUsInProd = usReleaseStatus.toLowerCase().includes(
        statusName.toLowerCase()
      );
    if (usReadyToReleaseStatus)
      isUsReady =
      usReadyToReleaseStatus.toLowerCase().includes(
          statusName.toLowerCase()
        );
  }
  let status: StatusTypes = "isNotOk";
  let color = outputFormat.colorNotReady;

  if (isUsReady) {
    status = "isReadyToRelease";
    color = outputFormat.colorReady;
  } else if (isUsInProd) {
    status = "isProd";
    color = outputFormat.colorNoAction;
  }
  let showTasks: boolean = true;

  if (status === "isNotOk") {
    if (options.table) showTasks = false;
    if (options.onlyWarnings) showTasks = false;
    else showTasks = true;
  } else showTasks = false;
  if (options.table) showTasks = false;
  else if (options.onlyWarnings) showTasks = false;

  const result: IUserStory = {
    warningType: warning,
    statusType: status,
    showSubtasks: showTasks,
    statusJira: statusName ? statusName : "status-undefined",
    number: issue.key,
    assignee: assigneeName ? assigneeName : "no-assignee",
    title: issue.fields.summary,
    textColor: color,
    textMode: outputFormat.modeBold,
    link: makeLink(issue.key),
  };
  return result;
}

export async function getSingleSubtask(sub: Issue, outputFormat: any) {
  const statusName = sub.fields.status.name;
  let assigneeName;
  const options = SOptions.getOptions();
  const client = await SClient.getClient();
  let isReady = false;
  let isProd = false;

  if (statusName) {
    if (process.env.JIRA_TASK_READY_TO_RELEASE_STATUS)
      isReady =
        process.env.JIRA_TASK_READY_TO_RELEASE_STATUS.toLowerCase().includes(
          statusName.toLowerCase()
        );
    if (process.env.JIRA_TASK_RELEASE_STATUS)
      isProd = process.env.JIRA_TASK_RELEASE_STATUS.toLowerCase().includes(
        statusName.toLowerCase()
      );
  }
  let status: StatusTypes = "isNotOk";
  let color = outputFormat.colorNotReady;

  if (isReady) {
    status = "isReadyToRelease";
    color = outputFormat.colorReady;
  } else if (isProd) {
    status = "isProd";
    color = outputFormat.colorNoAction;
  }

  if (!isReady) {
    try {
      const SubIssue = await client.issues.getIssue({
        issueIdOrKey: sub.key,
      });
      assigneeName = SubIssue.fields.assignee.displayName;
    } catch (error) {
      assigneeName = "no-assignee";
    }
  }
  const result: ISubtask = {
    statusType: status,
    statusJira: statusName ? statusName : "status-undefined",
    assignee: assigneeName ? assigneeName : "no-assignee",
    number: sub.key,
    textColor: color,
    textMode: outputFormat.modeDim,
  };
  return result;
}

export async function getSubtasks(issue: Issue, outputFormat: any) {
  const subtasks: ISubtask[] = [];

  for await (const sub of issue.fields.subtasks) {
    subtasks.push(await getSingleSubtask(sub, outputFormat));
  }
  return subtasks;
}

export function makeLink(key: string) {
  return `https://${process.env.JIRA_SUBDOMAIN}.atlassian.net/browse/${key}`;
}
