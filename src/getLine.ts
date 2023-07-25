import { Issue } from "jira.js/out/version3/models/issue";
import { getUs, getSubtasks } from "./getJiraTasks";
import { getJiraUSFromText } from "./getJiraUSFromText";
import {
  ILine,
  ILineEmpty,
  ILineNoUS,
  ISubtask,
  IUserStory,
} from "./globals/interfaces";
import { SClient } from "./setUpJiraClient";
import { SOptions } from "./setUpOptions";

async function issueIsUS(issue: Issue, outputFormat: any) {
  if (!issue) throw new Error();
  const userStory: IUserStory = getUs(issue, outputFormat);
  let subtasks: ISubtask[] = [];

  if (userStory.showSubtasks) subtasks = await getSubtasks(issue, outputFormat);
  const result: ILine = { lineType: "ILine", US: userStory, tasks: subtasks };
  return result;
}

async function issueIsSub(issue: Issue, outputFormat: any) {
  const client = await SClient.getClient();
  try {
    const parentIssue = await client.issues.getIssue({
      issueIdOrKey: issue.fields.parent!.key,
    });
    let subtask: ISubtask[] = [];

    const userStory: IUserStory = getUs(parentIssue, outputFormat, "USIsTask");
    userStory.warningTaskNumber = issue.key;
    const result: ILine = { lineType: "ILine", US: userStory, tasks: subtask };
    return result;
  } catch (error) {
    const result: ILineNoUS = {
      lineType: "ILineNoUS",
      warningType: "FetchErr",
      textColor: outputFormat.colorWarning,
      textMode: outputFormat.modeBold,
    };
    return result;
  }
}

export async function getLine(line: string, outputFormat: any) {
  const client = await SClient.getClient();
  const options = await SOptions.getOptions();
  const usReadyToReleaseStatus = options.launchPreProd ? process.env.JIRA_US_PREPROD_READY_TO_RELEASE_STATUS : process.env.JIRA_US_READY_TO_RELEASE_STATUS;
  let jiraStatus = []

  if (options.launchPreProd)
  {
    jiraStatus = ["Ready for Dev", "In Progress", "To Code Review", "Dev Review Staging", "Designer Review Staging", "PO Review Staging", "Validated Staging"]
  }
  else
  {
    jiraStatus = ["Dev Review PreProd", "Validated Dev PreProd"]
  }

  if (!line) {
    const result: ILineEmpty = {
      lineType: "ILineEmpty",
      text: line,
      textColor: outputFormat.colorDefault,
      textMode: outputFormat.modeDim,
    };
    return result;
  }
  const issueId = getJiraUSFromText(line);
  if (!issueId) {
    if (line.search(/:\*\*/) !== -1) {
      const result: ILineNoUS = {
        lineType: "ILineNoUS",
        warningType: "MissUSNb",
        text: line.substring(2),
        textColor: outputFormat.colorWarning,
        textMode: outputFormat.modeBold,
      };
      return result;
    }
    const result: ILineEmpty = {
      lineType: "ILineEmpty",
      text: line,
      textColor: outputFormat.colorDefault,
      textMode: outputFormat.modeDim,
    };
    return result;
  }
  let issue: Issue;
  try {
    issue = await client.issues.getIssue({ issueIdOrKey: issueId });
  } catch (err) {
    const result: ILineNoUS = {
      lineType: "ILineNoUS",
      warningType: "WrongUsNumber",
      text: line.substring(2),
      textColor: outputFormat.colorWarning,
      textMode: outputFormat.modeBold,
    };
    return result;
  }
  if (!jiraStatus.includes(issue.fields.status.name as string))
  {
    return undefined
  }
  if (options.doTransition && usReadyToReleaseStatus && issue.fields.status.name === usReadyToReleaseStatus) {
    let transitions
    try {
        transitions = await client.issues.getTransitions({ issueIdOrKey: issueId });
        if (transitions && transitions.transitions)
        {
          await client.issues.doTransition({
              issueIdOrKey: issueId,
              transition: {
                  id: transitions.transitions[2].id,
                },
              });
        }
              else throw new Error("Not enough transitions")
            } catch (err) {
                console.log(err);
              }
  }
  if ( process.env.CONFIG_SUBTASKS === "false" ||
    (issue.fields.subtasks && issue.fields.subtasks.length > 0) ||
    !issue?.fields?.parent?.key
  ) {
    return await issueIsUS(issue, outputFormat);
  } else if (issue.fields.subtasks.length <= 0) {
    return await issueIsSub(issue, outputFormat);
  }
}
