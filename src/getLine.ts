import { Issue } from "jira.js/out/version3/models/issue";
import { getUs, getSubtasks, makeLink, getSingleSubtask } from "./getJiraTasks";
import { getJiraUSFromText } from "./getJiraUSFromText";
import { _gASCII } from "./globals/globals";
import {
  ILine,
  ILineEmpty,
  ILineNoUS,
  ISubtask,
  IUserStory,
} from "./globals/interfaces";
import { SClient } from "./setUpJiraClient";

async function issueIsUS(issue: Issue) {
  if (!issue) throw new Error();
  const userStory: IUserStory = getUs(issue);
  let subtasks: ISubtask[] = [];

  if (userStory.showSubtasks) subtasks = await getSubtasks(issue);
  return <ILine>{ US: userStory, tasks: subtasks };
}

async function issueIsSub(issue: Issue) {
  const client = await SClient.getClient();

  try {
    if (!issue?.fields?.parent?.key) throw new Error();
    const parentIssue = await client.issues.getIssue({
      issueIdOrKey: issue.fields.parent!.key,
    });
    let subtask: ISubtask[] = [];
    subtask.push(await getSingleSubtask(issue));

    const userStory: IUserStory = getUs(parentIssue, "USIsTask");
    return <ILine>{ US: userStory, tasks: subtask };
  } catch (error) {
    return <ILineNoUS>{ warningType: "NoUS" };
  }
}

export async function getLine(line: string) {
  const client = await SClient.getClient();

  if (!line) {
    return <ILineEmpty>{ text: line };
  }
  const issueId = getJiraUSFromText(line);
  if (!issueId) {
    if (line.search(/:\*\*/) !== -1) {
      return <ILineNoUS>{
        warningType: "MissUSNb",
        text: line,
      };
    }
    return <ILineEmpty>{ text: line };
  }
  let issue: Issue;
  try {
    issue = await client.issues.getIssue({ issueIdOrKey: issueId });
  } catch (err) {
    return <ILineNoUS>{
      warningType: "FetchErr",
      text: line,
    };
  }
  if (!issue) {
    return <ILineNoUS>{
      warningType: "USNotFound",
      text: line,
    };
  }
  if (issue.fields.subtasks && issue.fields.subtasks.length > 0) {
    return await issueIsUS(issue);
  } else if (issue.fields.subtasks.length <= 0) {
    return await issueIsSub(issue);
  }
}
