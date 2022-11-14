import fs from "fs";
import readline from "readline";
import { Version3Client } from "jira.js";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

import standardVersion from "standard-version";
import { GetCurrentUser } from "jira.js/out/version2/parameters";
import commandLineArgs from "ts-command-line-args";
import { parse } from "ts-command-line-args";
import { getJiraUSFromText } from "./getJiraUSFromText";

const modeDefault = "\x1b[";
const modeBold = "\x1b[1;";
const modeDim = "\x1b[2;";
const modeLink = "\x1b[2;4;3m";
const colorReady = "32m";
const colorNotReady = "31m";
const colorNoAction = "36m";
const colorWarning = "33m";
const colorDefault = "39m";
const modeEscape = "\x1b[0m";

interface IOptionsArguments {
  onlyWarnings: boolean;
  table: boolean;
  disableChecks: boolean;
}

let options: IOptionsArguments;
let consoleOutputArray = [];

let client: Version3Client;

const setOptions = () => {
  try {
    options = parse<IOptionsArguments>({
      onlyWarnings: { type: Boolean, alias: "w" },
      table: { type: Boolean, alias: "t" },
      disableChecks: { type: Boolean, alias: "c" },
    });
  } catch {
    console.error(
      "Wrong options. Available options are\n--onlyWarnings (-w),\n--table (-t),\n--disableChecks (-d)."
    );
    return false;
  }
  return true;
};

const getEnvVariables = () => {
  // Loads environment variables from project_path/.env file.
  dotenv.config();

  // When run for the unit/func tests, we do not expand the .env as it will lose
  // the unset of variable from the command line. (SENDGRID_API_KEY=)
  if (process.env.NODE_ENV !== "test") {
    const myEnv = dotenv.config();
    dotenvExpand.expand(myEnv);
  }

  if (!process.env.JIRA_ACCOUNT_EMAIL || !process.env.JIRA_ACCOUNT_TOKEN) {
    console.error(
      "You need to provide a JIRA_ACCOUNT_EMAIL and JIRA_ACCOUNT_TOKEN env variable. Put your work email and a token generated at this url: https://id.atlassian.com/manage-profile/security/api-tokens."
    );
    return false;
  }

  if (
    !process.env.JIRA_US_READY_TO_RELEASE_STATUS ||
    !process.env.JIRA_TASK_READY_TO_RELEASE_STATUS
  ) {
    console.error(
      "You need to provide a JIRA_US_READY_TO_RELEASE_STATUS and JIRA_TASK_READY_TO_RELEASE_STATUS env variable. They must contain the status name of the User Story and the status name of Tasks you expect for any feature to check when releasing."
    );
    return false;
  }
  client = new Version3Client({
    host: "https://teamstarter.atlassian.net",
    authentication: {
      basic: {
        email: process.env.JIRA_ACCOUNT_EMAIL,
        apiToken: process.env.JIRA_ACCOUNT_TOKEN,
      },
    },
    newErrorHandling: true,
  });
  return true;
};

async function getAuthUser() {
  try {
    return await client.myself.getCurrentUser();
  } catch (err) {
    return err;
  }
}

async function useStandardVersion() {
  // standard version do not provide a way to get the output
  // So we intercept it!
  const interceptedContent: String[] = [];
  const outputOrigin = process.stdout.write;
  function captureConsole(data: string) {
    interceptedContent.push(data);
    return true;
  }

  // Start the interception
  process.stdout.write = captureConsole;

  await standardVersion({
    noVerify: true,
    infile: "docs/CHANGELOG.md",
    silent: true,
    dryRun: true,
  });
  // // Release the interception of the console
  process.stdout.write = outputOrigin;
  for (const line of interceptedContent[0].split("\n")) {
    const formatedLine = await checkRelease(line);
    console.log(formatedLine);
  }
}

async function useLocalChangelog() {
  var user_file = "./CHANGELOG.md";
  var r = readline.createInterface({
    input: fs.createReadStream(user_file),
  });
  for await (const line of r) {
    const formatedLine = await checkRelease(line);
    if (formatedLine !== "") console.log(formatedLine);
  }
}

async function main() {
  if (!setOptions || !getEnvVariables) return;
  const currentUser = await getAuthUser();
  debugger;
  if (
    currentUser &&
    currentUser["status-code" as keyof typeof currentUser] === 401
  )
    return console.log(
      "Wrong credentials. Please verify JIRA_ACCOUNT_EMAIL and JIRA_ACCOUNT_TOKEN env variables."
    );
  useStandardVersion();
  // useLocalChangelog();
}

async function formatSingleSubtask(sub: any) {
  let assigneeName;
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
      return `${modeDim}${colorNotReady}(👎 ${sub.fields.status.name} \
        @${assigneeName} ${sub.key})${modeEscape}`;
    return "";
  }
  return `${modeDim}${
    isReady ? colorReady : isProd ? colorDefault : colorNotReady
  }(${
    isReady
      ? `✅ ${sub.fields.status.name}`
      : isProd
      ? `👌`
      : `👎 ${sub.fields.status.name} @${assigneeName}`
  } ${sub.key})${modeEscape}`;
}

async function formatSubtasks(issue: any) {
  let subTasks = "";

  for await (const sub of issue.fields.subtasks) {
    subTasks += await formatSingleSubtask(sub);
  }
  if (subTasks !== "") return `\n` + subTasks + `\n`;
  return "";
}

function formatUS(issue: any) {
  const isUsInProd =
    issue.fields.status.name === process.env.JIRA_US_RELEASE_STATUS;
  const isUsReady =
    issue.fields.status.name === process.env.JIRA_US_READY_TO_RELEASE_STATUS;

  if (options && options.onlyWarnings) {
    if (!isUsReady && !isUsInProd)
      return `${modeBold}${colorNotReady}[❌ ${issue.fields.status.name}](${issue.key}) \
      @${issue.fields.creator.displayName} ${issue.fields.summary}${modeEscape}`;
    return "";
  }
  return `${modeBold}${
    isUsInProd
      ? `${colorNoAction}[🚀`
      : isUsReady
      ? `${colorReady}[✅ `
      : `${colorNotReady}[❌ `
  }${isUsInProd ? "" : issue.fields.status.name}] (${issue.key})${
    isUsReady ? `` : isUsInProd ? `` : ` @ ${issue.fields.creator.displayName}`
  } ${issue.fields.summary}${modeEscape}`;
}

function formatLink(key) {
  return `${modeLink}https://${process.env.JIRA_SUBDOMAIN}.atlassian.net/browse/${key}${modeEscape}\n`;
}

async function issueIsUS(issue: any) {
  const usFormatted = formatUS(issue);
  let subFormatted = "";
  if (usFormatted !== "") subFormatted = await formatSubtasks(issue);
  const result =
    usFormatted +
    subFormatted +
    `${usFormatted === "" ? "" : formatLink(issue.key)}`;
  return result;
}

async function issueIsSub(issue: any) {
  try {
    const parentIssue = await client.issues.getIssue({
      issueIdOrKey: issue.fields.parent.key,
    });
    const subFormatted = await formatSingleSubtask(issue);
    const parentFormatted = await formatUS(parentIssue);
    return `${modeBold}${colorWarning}[👮‍ ${
      issue.key
    } is a TASK]${modeEscape} ${parentFormatted}\
    ${subFormatted === "" ? "" : `\n${subFormatted}\n`} \
      ${
        parentFormatted === ""
          ? parentFormatted === "" && subFormatted === ""
            ? "\n"
            : formatLink(parentIssue.key)
          : ""
      }`;
  } catch (error) {
    return `${modeBold}${colorWarning}[TASK ${issue.key} has no US]${modeEscape}`;
  }
}

async function checkRelease(line: any) {
  if (!line) {
    return line;
  }
  const issueId = getJiraUSFromText(line);
  if (!issueId) {
    if (line.search(/:\*\*/) !== -1) {
      return `${modeBold}${colorWarning}[🚨 No US number]${modeEscape} ${line}\n`;
    }
    return line;
  }
  let issue;
  debugger;
  try {
    issue = await client.issues.getIssue({ issueIdOrKey: issueId });
    debugger;
  } catch (err) {
    return `${modeBold}${colorWarning}[🔥 ERROR DURING FETCH]${modeEscape} ${line}\n`;
  }
  if (!issue) {
    return `${modeBold}${colorWarning}[US not found]${modeEscape} ${line} `;
  }
  if (issue.fields.subtasks && issue.fields.subtasks.length > 0) {
    return await issueIsUS(issue);
  }
  return await issueIsSub(issue);
}

main();
