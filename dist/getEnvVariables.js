"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvVariables = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const dotenv_expand_1 = __importDefault(require("dotenv-expand"));
const getEnvVariables = () => {
    // Loads environment variables from project_path/.env file.
    dotenv_1.default.config();
    // When run for the unit/func tests, we do not expand the .env as it will lose
    // the unset of variable from the command line. (SENDGRID_API_KEY=)
    if (process.env.NODE_ENV !== "test") {
        const myEnv = dotenv_1.default.config();
        dotenv_expand_1.default.expand(myEnv);
    }
    if (!process.env.JIRA_ACCOUNT_EMAIL || !process.env.JIRA_ACCOUNT_TOKEN) {
        throw new Error("You need to provide a JIRA_ACCOUNT_EMAIL and JIRA_ACCOUNT_TOKEN env variable. Put your work email and a token generated at this url: https://id.atlassian.com/manage-profile/security/api-tokens.");
    }
    if (!process.env.JIRA_US_READY_TO_RELEASE_STATUS ||
        !process.env.JIRA_TASK_READY_TO_RELEASE_STATUS) {
        throw new Error("You need to provide a JIRA_US_READY_TO_RELEASE_STATUS and JIRA_TASK_READY_TO_RELEASE_STATUS env variable. They must contain the status name of the User Story and the status name of Tasks you expect for any feature to check when releasing.");
    }
};
exports.getEnvVariables = getEnvVariables;
//# sourceMappingURL=getEnvVariables.js.map