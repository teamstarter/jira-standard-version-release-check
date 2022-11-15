import { Issue } from "jira.js/out/version3/models/issue";
import {
  formatUS,
  formatSubtasks,
  formatLink,
  formatSingleSubtask,
} from "./formatOutput";
import { getJiraUSFromText } from "./getJiraUSFromText";
import { formated } from "./globals/globals";
import { SClient } from "./setUpJiraClient";

async function issueIsUS(issue: Issue) {
  if (!issue) throw new Error();
  const usFormatted = formatUS(issue);
  let subFormatted = "";
  if (usFormatted !== "") subFormatted = await formatSubtasks(issue);
  const result = `${usFormatted}${subFormatted}${
    usFormatted === "" ? "" : formatLink(issue.key)
  }`;
  return result;
}

async function issueIsSub(issue: Issue) {
  const client = await SClient.getClient();

  try {
    if (!issue?.fields?.parent?.key) throw new Error();
    const parentIssue = await client.issues.getIssue({
      issueIdOrKey: issue.fields.parent!.key,
    });
    const subFormatted = await formatSingleSubtask(issue);
    const parentFormatted = formatUS(parentIssue);
    return `${formated.modeBold}${formated.colorWarning}[👮‍ ${
      issue.key
    } is a TASK]${formated.modeEscape} ${parentFormatted}${
      subFormatted === "" ? "" : `\n${subFormatted}\n`
    } ${
      parentFormatted === ""
        ? parentFormatted === "" && subFormatted === ""
          ? "\n"
          : formatLink(parentIssue.key)
        : ""
    }`;
  } catch (error) {
    return `${formated.modeBold}${formated.colorWarning}[TASK ${issue.key} has no US]${formated.modeEscape}`;
  }
}

export async function formatLine(line: string) {
  const client = await SClient.getClient();

  if (!line) {
    return line;
  }
  const issueId = getJiraUSFromText(line);
  if (!issueId) {
    if (line.search(/:\*\*/) !== -1) {
      return `${formated.modeBold}${formated.colorWarning}[🚨 No US number]${formated.modeEscape} ${line}\n`;
    }
    return line;
  }
  let issue: Issue;
  try {
    issue = await client.issues.getIssue({ issueIdOrKey: issueId });
  } catch (err) {
    return `${formated.modeBold}${formated.colorWarning}[🔥 ERROR DURING FETCH]${formated.modeEscape} ${line}\n`;
  }
  if (!issue) {
    return `${formated.modeBold}${formated.colorWarning}[US not found]${formated.modeEscape} ${line} `;
  }
  if (issue.fields.subtasks && issue.fields.subtasks.length > 0) {
    return await issueIsUS(issue);
  } else if (issue.fields.subtasks.length <= 0) {
    return await issueIsSub(issue);
  }
}
