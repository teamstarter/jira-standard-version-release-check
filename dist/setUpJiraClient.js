"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SClient = void 0;
const jira_js_1 = require("jira.js");
const setUpClient = () => {
    if (!process.env.JIRA_ACCOUNT_EMAIL || !process.env.JIRA_ACCOUNT_TOKEN)
        throw new Error("You need to provide a JIRA_US_READY_TO_RELEASE_STATUS and JIRA_TASK_READY_TO_RELEASE_STATUS env variable. They must contain the status name of the User Story and the status name of Tasks you expect for any feature to check when releasing.");
    const client = new jira_js_1.Version3Client({
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
const setUpJiraAPI = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = setUpClient();
    try {
        const currentUser = yield client.myself.getCurrentUser();
        if (currentUser &&
            currentUser["status-code"] === "401")
            throw new Error("Wrong credentials. Please verify JIRA_ACCOUNT_EMAIL and JIRA_ACCOUNT_TOKEN env variables.");
    }
    catch (err) {
        throw new Error(`Could not authenticate with JIRA_ACCOUNT_EMAIL and JIRA_ACCOUNT_TOKEN from .env file. Are you sure those are valid credentials ?`);
    }
    return client;
});
exports.SClient = (function () {
    let client;
    function setClient() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield setUpJiraAPI();
        });
    }
    return {
        getClient: function () {
            return __awaiter(this, void 0, void 0, function* () {
                if (!client) {
                    client = yield setClient();
                }
                return client;
            });
        },
    };
})();
//# sourceMappingURL=setUpJiraClient.js.map