import { Issue } from "jira.js/out/version3/models/issue";
import { _gASCII } from "./globals/globals";
import {
  ISubtask,
  IUserStory,
  StatusTypes,
  WarningTypes,
} from "./globals/interfaces";
import { SClient } from "./setUpJiraClient";
import { SOptions } from "./setUpOptions";

export function getUs(issue: Issue, warning?: WarningTypes) {
  const statusName = issue.fields.status.name;
  const assigneeName = issue.fields.creator.displayName;
  const isUsInProd = statusName === process.env.JIRA_US_RELEASE_STATUS;
  const isUsReady = statusName === process.env.JIRA_US_READY_TO_RELEASE_STATUS;

  let status: StatusTypes = "isNotOk";
  let color = _gASCII.colorNotReady;

  if (isUsReady) {
    status = "isReadyToRelease";
    color = _gASCII.colorReady;
  } else if (isUsInProd) {
    status = "isProd";
    color = _gASCII.colorNoAction;
  }

  const result: IUserStory = {
    warningType: warning,
    showSubtasks: (!isUsReady && !isUsInProd) || isUsReady,
    statusType: status,
    statusJira: statusName ? statusName : "status-undefined",
    number: issue.key,
    assignee: assigneeName ? assigneeName : "no-assignee",
    title: issue.fields.summary,
    textColor: color,
    textMode: _gASCII.modeBold,
    link: makeLink(issue.key),
  };
  return result;
}

export async function getSingleSubtask(sub: Issue) {
  const statusName = sub.fields.status.name;
  let assigneeName;
  const options = SOptions.getOptions();
  const client = await SClient.getClient();

  const isReady = statusName === process.env.JIRA_TASK_READY_TO_RELEASE_STATUS;
  const isProd = statusName === process.env.JIRA_TASK_RELEASE_STATUS;

  let status: StatusTypes = "isNotOk";
  let color = _gASCII.colorNotReady;

  if (isReady) {
    status = "isReadyToRelease";
    color = _gASCII.colorReady;
  } else if (isProd) {
    status = "isProd";
    color = _gASCII.colorNoAction;
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
    textMode: _gASCII.modeDim,
  };
  return result;
}

export async function getSubtasks(issue: Issue) {
  const subtasks: ISubtask[] = [];

  for await (const sub of issue.fields.subtasks) {
    subtasks.push(await getSingleSubtask(sub));
  }
  return subtasks;
}

export function makeLink(key: string) {
  return `https://${process.env.JIRA_SUBDOMAIN}.atlassian.net/browse/${key}`;
}
