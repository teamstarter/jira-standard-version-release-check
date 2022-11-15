import { Issue } from "jira.js/out/version3/models/issue";
import {
  formatUS,
  formatSubtasks,
  formatLink,
  formatSingleSubtask,
} from "./formatOutput";
import { getJiraUSFromText } from "./getJiraUSFromText";
import { _gASCII } from "./globals/globals";
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
    return `${_gASCII.modeBold}${_gASCII.colorWarning}[👮‍ ${
      issue.key
    } is a TASK]${_gASCII.modeEscape} ${parentFormatted}${
      subFormatted === "" ? "" : `\n${subFormatted}\n`
    } ${
      parentFormatted === ""
        ? parentFormatted === "" && subFormatted === ""
          ? "\n"
          : formatLink(parentIssue.key)
        : ""
    }`;
  } catch (error) {
    return `${_gASCII.modeBold}${_gASCII.colorWarning}[TASK ${issue.key} has no US]${_gASCII.modeEscape}`;
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
      return `${_gASCII.modeBold}${_gASCII.colorWarning}[🚨 No US number]${_gASCII.modeEscape} ${line}\n`;
    }
    return line;
  }
  let issue: Issue;
  try {
    issue = await client.issues.getIssue({ issueIdOrKey: issueId });
  } catch (err) {
    return `${_gASCII.modeBold}${_gASCII.colorWarning}[🔥 ERROR DURING FETCH]${_gASCII.modeEscape} ${line}\n`;
  }
  if (!issue) {
    return `${_gASCII.modeBold}${_gASCII.colorWarning}[US not found]${_gASCII.modeEscape} ${line} `;
  }
  if (issue.fields.subtasks && issue.fields.subtasks.length > 0) {
    return await issueIsUS(issue);
  } else if (issue.fields.subtasks.length <= 0) {
    return await issueIsSub(issue);
  }
}
