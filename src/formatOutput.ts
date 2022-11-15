import { Version3Client } from "jira.js";
import { Issue } from "jira.js/out/version3/models/issue";
import { _gASCII } from "./globals/globals";
import { IOptionsArguments } from "./globals/interfaces";
import { SClient } from "./setUpJiraClient";
import { SOptions } from "./setUpOptions";

export function formatUS(issue: Issue) {
  const options = SOptions.getOptions();

  const isUsInProd =
    issue.fields.status.name === process.env.JIRA_US_RELEASE_STATUS;
  const isUsReady =
    issue.fields.status.name === process.env.JIRA_US_READY_TO_RELEASE_STATUS;

  if (options && options.onlyWarnings) {
    if (!isUsReady && !isUsInProd)
      return `${_gASCII.modeBold}${_gASCII.colorNotReady}[❌ ${issue.fields.status.name}](${issue.key}) @${issue.fields.creator.displayName} ${issue.fields.summary}${_gASCII.modeEscape}`;
    return "";
  }
  return `${_gASCII.modeBold}${
    isUsInProd
      ? `${_gASCII.colorNoAction}[🚀`
      : isUsReady
      ? `${_gASCII.colorReady}[✅ `
      : `${_gASCII.colorNotReady}[❌ `
  }${isUsInProd ? "" : issue.fields.status.name}] (${issue.key})${
    isUsReady ? `` : isUsInProd ? `` : ` @${issue.fields.creator.displayName}`
  } ${issue.fields.summary}${_gASCII.modeEscape}`;
}

export async function formatSingleSubtask(sub: Issue) {
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
  if (options && options.onlyWarnings) {
    if (!isReady && !isProd)
      return `${_gASCII.modeDim}${_gASCII.colorNotReady}(👎 ${sub.fields.status.name} @${assigneeName} ${sub.key})${_gASCII.modeEscape}`;
    return "";
  }
  return `${_gASCII.modeDim}${
    isReady
      ? _gASCII.colorReady
      : isProd
      ? _gASCII.colorDefault
      : _gASCII.colorNotReady
  }(${
    isReady
      ? `✅ ${sub.fields.status.name}`
      : isProd
      ? `👌`
      : `👎 ${sub.fields.status.name} @${assigneeName}`
  } ${sub.key})${_gASCII.modeEscape}`;
}

export async function formatSubtasks(issue: Issue) {
  let subTasks = "";

  for await (const sub of issue.fields.subtasks) {
    subTasks += await formatSingleSubtask(sub);
  }
  if (subTasks !== "") return `\n${subTasks}\n`;
  return "";
}

export function formatLink(key: string) {
  return `${_gASCII.modeLink}https://${process.env.JIRA_SUBDOMAIN}.atlassian.net/browse/${key}${_gASCII.modeEscape}\n`;
}
