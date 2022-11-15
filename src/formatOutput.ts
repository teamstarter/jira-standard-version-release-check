import { Version3Client } from "jira.js";
import { Issue } from "jira.js/out/version3/models/issue";
import { formated } from "./globals";
import { IOptionsArguments } from "./interfaces/interfaces";
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
      return (
        `${formated.modeBold}${formated.colorNotReady}[❌ ${issue.fields.status.name}]` +
        ` (${issue.key}) @` +
        issue.fields.creator.displayName +
        ` ${issue.fields.summary}${formated.modeEscape}`
      );
    else return "";
  }
  return (
    `${formated.modeBold}${
      isUsInProd
        ? `${formated.colorNoAction}[🚀`
        : isUsReady
        ? `${formated.colorReady}[✅ `
        : `${formated.colorNotReady}[❌ `
    }` +
    `${isUsInProd ? "" : issue.fields.status.name}` +
    `]` +
    ` (${issue.key})` +
    `${
      isUsReady ? `` : isUsInProd ? `` : ` @` + issue.fields.creator.displayName
    }` +
    ` ${issue.fields.summary}${formated.modeEscape}`
  );
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
      return (
        formated.modeDim +
        `${formated.colorNotReady}(👎 ${sub.fields.status.name} @${assigneeName} ${sub.key})` +
        formated.modeEscape
      );
    else return "";
  }
  return (
    formated.modeDim +
    `${
      isReady
        ? formated.colorReady
        : isProd
        ? formated.colorDefault
        : formated.colorNotReady
    }` +
    `(${
      isReady
        ? `✅ ${sub.fields.status.name}`
        : isProd
        ? `👌`
        : `👎 ${sub.fields.status.name} @${assigneeName}`
    } ${sub.key})` +
    formated.modeEscape
  );
}

export async function formatSubtasks(issue: Issue) {
  let subTasks = "";

  for await (const sub of issue.fields.subtasks) {
    subTasks += await formatSingleSubtask(sub);
  }
  if (subTasks !== "") return `\n` + subTasks + `\n`;
  else return "";
}

export function formatLink(key: string) {
  return `${formated.modeLink}${
    "https://" +
    process.env.JIRA_SUBDOMAIN +
    ".atlassian.net" +
    "/browse/" +
    key
  }${formated.modeEscape}\n`;
}
