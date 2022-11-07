const fs = require("fs");
const readline = require("readline");

const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
/**
 * Loads environment variables from project_path/.env file.
 */
dotenv.config();

// When run for the unit/func tests, we do not expand the .env as it will lose
// the unset of variable from the command line. (SENDGRID_API_KEY=)
if (process.env.NODE_ENV !== "test") {
  const myEnv = dotenv.config();
  dotenvExpand.expand(myEnv);
}

const standardVersion = require("standard-version");
const getJiraUSFromText = require("./getJiraUSFromText");

const { Version3Client } = require("jira.js");

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
});

// standard version do not provide a way to get the output
// So we intercept it!
// const interceptedContent = [];
// const outputOrigin = process.stdout.write;
// function captureConsole(data) {
//   interceptedContent.push(data);
// }

async function analyseRelease() {
  // Start the interception
  //   process.stdout.write = captureConsole;

  //   await standardVersion({
  //     noVerify: true,
  //     infile: "./TESTCHANGELOG.md",
  //     silent: false,
  //     dryRun: false,
  //   });

  // Release the interception of the console
  //   process.stdout.write = outputOrigin;
  var user_file = "./CHANGELOG.md";
  var r = readline.createInterface({
    input: fs.createReadStream(user_file),
  });
  r.on("line", async function (line) {
	const linee =  await test(line);
    console.log(linee);
  });

//   for (const line of readFile.split("\n")) {
//     const linee = await test(line);
//     console.log(linee);
//   }
}

async function test(text) {
  if (!text) {
    return text;
  }

  const issueId = getJiraUSFromText(text);

  if (!issueId) {
    if (text.search(/:\*\*/) !== -1) {
      return `[🚨 MISSING US NUMBER 🤬🫵] ${text}`;
    }
    return text;
  }
  try {
    const issue = await client.issues.getIssue({ issueIdOrKey: issueId });

    let subTasks = "";
    let subTasksReady = true;
    if (issue.fields.subtasks && issue.fields.subtasks.length > 0) {
      for (const sub of issue.fields.subtasks) {
        const isReady =
          sub.fields.status.name ===
          process.env.JIRA_TASK_READY_TO_RELEASE_STATUS;
        if (!isReady) {
          subTasksReady = false;
        }
        subTasks += `[${isReady ? "👍" : "❌"}${sub.fields.status.name}]`;
      }
    }

    if (!issue) {
      return `[⁇ UNKNOWN US] ${text} `;
    }

    if (
      issue.fields.status.name !== process.env.JIRA_US_READY_TO_RELEASE_STATUS
    ) {
      return `[❌ ${issue.fields.status.name}]${subTasks} ${text} `;
    }

    return `[${subTasksReady ? "✅" : "👎"} ${
      issue.fields.status.name
    }]${subTasks} ${text} `;
  } catch (err) {
    return `[🔥 ERROR DURING FETCH] ${text}`;
  }
}

analyseRelease();
