import { Issue } from "jira.js/out/version3/models/issue";
import { _gASCII } from "./globals/globals";
import { ISubtask, IUserStory, WarningTypes } from "./globals/interfaces";
import { SClient } from "./setUpJiraClient";
import { SOptions } from "./setUpOptions";

export function getUs(issue: Issue, warning?: WarningTypes) {
  const statusName = issue.fields.status.name;
  const isUsInProd = statusName === process.env.JIRA_US_RELEASE_STATUS;
  const isUsReady = statusName === process.env.JIRA_US_READY_TO_RELEASE_STATUS;

  return <IUserStory>{
    warningType: warning,
    showSubtasks: (!isUsReady && !isUsInProd) || isUsReady,
    status: isUsReady ? "isReadyToRelease" : isUsInProd ? "isProd" : "isNotOk",
    number: issue.key,
    assignee: issue.fields.creator.displayName,
    title: issue.fields.summary,
    link: makeLink(issue.key),
  };
}

export async function getSingleSubtask(sub: Issue) {
  let subTask: ISubtask;

  let assigneeName;
  const options = SOptions.getOptions();
  const client = await SClient.getClient();

  const isReady =
    sub.fields.status.name === process.env.JIRA_TASK_READY_TO_RELEASE_STATUS;
  const isProd =
    sub.fields.status.name === process.env.JIRA_TASK_RELEASE_STATUS;

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
  return <ISubtask>{
    status: sub.fields.status.name,
    assignee: assigneeName,
    number: sub.key,
  };
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
