import { Version3Client } from "jira.js";

const setUpClient = () => {
  if (!process.env.JIRA_ACCOUNT_EMAIL || !process.env.JIRA_ACCOUNT_TOKEN)
    throw new Error(
      "You need to provide a JIRA_US_READY_TO_RELEASE_STATUS and JIRA_TASK_READY_TO_RELEASE_STATUS env variable. They must contain the status name of the User Story and the status name of Tasks you expect for any feature to check when releasing."
    );
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
  return client;
};

const setUpJiraAPI = async () => {
  const client = setUpClient();
  try {
    const currentUser = await client.myself.getCurrentUser();
    if (
      currentUser &&
      currentUser["status-code" as keyof typeof currentUser] === "401"
    )
      throw new Error(
        "Wrong credentials. Please verify JIRA_ACCOUNT_EMAIL and JIRA_ACCOUNT_TOKEN env variables."
      );
  } catch (err) {
    throw new Error(
      `Could not authenticate with JIRA_ACCOUNT_EMAIL and JIRA_ACCOUNT_TOKEN from .env file. Are you sure those are valid credentials ?`
    );
  }
  return client;
};

export const SClient = (function () {
  let client: Version3Client;

  async function setClient() {
    return await setUpJiraAPI();
  }
  return {
    getClient: async function () {
      if (!client) {
        client = await setClient();
      }
      return client;
    },
  };
})();
