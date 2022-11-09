const fs = require("fs");
const readline = require("readline");
const { Version3Client } = require("jira.js");
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
const getJiraUSFromText = require("./getJiraUSFromText");
const standardVersion = require("standard-version");
const { GetCurrentUser } = require("jira.js/out/version2/parameters");
const commandLineArgs = require("command-line-args");

const modeDefault = "\x1b[";
const modeBold = "\x1b[1;";
const modeDim = "\x1b[2;";
const modeLink = "\x1b[2;4;3m";
const colorReady = "32m";
const colorNotReady = "31m";
const colorNoAction = "36m";
const colorDefault = "39m";
const modeEscape = "\x1b[0m";

const optionDefinitions = [
  { name: "onlyWarnings", alias: "w", type: Boolean },
  { name: "table", alias: "t", type: Boolean },
  { name: "disableChecks", alias: "d", type: Boolean },
];

try {
  const options = commandLineArgs(optionDefinitions);
  console.log(options);
} catch {
  console.log(
    "Wrong options. Available options are\n--onlyWarnings (-w),\n--table (-t),\n--disableChecks (-d)."
  );
  return;
}

// Loads environment variables from project_path/.env file.
dotenv.config();

// When run for the unit/func tests, we do not expand the .env as it will lose
// the unset of variable from the command line. (SENDGRID_API_KEY=)
if (process.env.NODE_ENV !== "test") {
  const myEnv = dotenv.config();
  dotenvExpand.expand(myEnv);
}

if (!process.env.JIRA_ACCOUNT_EMAIL || !process.env.JIRA_ACCOUNT_TOKEN) {
  return console.error(
    "You need to provide a JIRA_ACCOUNT_EMAIL and JIRA_ACCOUNT_TOKEN env variable. Put your work email and a token generated at this url: https://id.atlassian.com/manage-profile/security/api-tokens."
  );
}

if (
  !process.env.JIRA_US_READY_TO_RELEASE_STATUS ||
  !process.env.JIRA_TASK_READY_TO_RELEASE_STATUS
) {
  return console.error(
    "You need to provide a JIRA_US_READY_TO_RELEASE_STATUS and JIRA_TASK_READY_TO_RELEASE_STATUS env variable. They must contain the status name of the User Story and the status name of Tasks you expect for any feature to check when releasing."
  );
}

const client = new Version3Client({
  host: "https://teamstarter.atlassian.net",
  authentication: {
    basic: {
      email: process.env.JIRA_ACCOUNT_EMAIL,
      apiToken: process.env.JIRA_ACCOUNT_TOKEN,
    },
  },
  newErrorHandling: true,
});

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
  const interceptedContent = [];
  const outputOrigin = process.stdout.write;
  function captureConsole(data) {
    interceptedContent.push(data);
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
    console.log(formatedLine);
  }
}

async function main() {
  const currentUser = await getAuthUser();
  if (currentUser["status-code"] === 401)
    return console.log(
      "Wrong credentials. Please verify JIRA_ACCOUNT_EMAIL and JIRA_ACCOUNT_TOKEN env variables."
    );
  // useStandardVersion();
  useLocalChangelog();
}

function formatSubtasks(issue) {
  let subTasks = "";
  let color = colorReady;

  if (issue.fields.subtasks && issue.fields.subtasks.length > 0) {
    for (const sub of issue.fields.subtasks) {
      const isReady =
        sub.fields.status.name ===
        process.env.JIRA_TASK_READY_TO_RELEASE_STATUS;
      const isProd =
        sub.fields.status.name === process.env.JIRA_TASK_RELEASE_STATUS;
      if (!isReady) {
        subTasksReady = false;
        color = colorNotReady;
      }
      subTasks +=
        modeDim +
        `${isReady ? colorReady : isProd ? colorDefault : colorNotReady}` +
        `(${isReady ? "✅" : isProd ? "👌" : "👎"} ${sub.fields.status.name} (${
          sub.key
        }))` +
        modeEscape;
    }
  }
  return subTasks;
}

// function formatUS() {
//   if (
//     issue.fields.status.name !== process.env.JIRA_US_READY_TO_RELEASE_STATUS
//   ) {
//     return `[${
//       issue.fields.status.name === process.env.JIRA_US_RELEASE_STATUS
//         ? "🚀"
//         : "❌"
//     } ${issue.fields.status.name} (${issue.key})]`;
//   }
// }

async function checkRelease(line) {
  if (!line) {
    return line;
  }
  const issueId = getJiraUSFromText(line);
  if (!issueId) {
    if (line.search(/:\*\*/) !== -1) {
      return `[🚨 MISSING US NUMBER 🤬🫵] ${line}`;
    }
    return line;
  }
  try {
    const issue = await client.issues.getIssue({ issueIdOrKey: issueId });

    if (!issue) {
      return `[⁇ UNKNOWN US] ${line} `;
    }
    let subTasks = formatSubtasks(issue);
    // let us = formatUS(issue);
    if (
      issue.fields.status.name !== process.env.JIRA_US_READY_TO_RELEASE_STATUS
    ) {
      return (
        `[${
          issue.fields.status.name === process.env.JIRA_US_RELEASE_STATUS
            ? "🚀"
            : "❌"
        } ${issue.fields.status.name} (${issue.key})]` +
        ` ${modeBold}${colorNoAction}${issue.fields.summary}${modeEscape}` +
        `\n${subTasks}\n` +
        `${modeLink}${
          "https://" +
          process.env.JIRA_SUBDOMAIN +
          ".atlassian.net" +
          "/browse/" +
          issue.key
        }${modeEscape}`
      );
    }
    // \x1b[36m${line}\x1b[0m
    return;
  } catch (err) {
    return `[🔥 ERROR DURING FETCH] ${line}`;
  }
}

main();
