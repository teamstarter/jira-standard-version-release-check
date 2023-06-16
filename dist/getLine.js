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
exports.getLine = void 0;
const getJiraTasks_1 = require("./getJiraTasks");
const getJiraUSFromText_1 = require("./getJiraUSFromText");
const setUpJiraClient_1 = require("./setUpJiraClient");
function issueIsUS(issue, outputFormat) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!issue)
            throw new Error();
        const userStory = (0, getJiraTasks_1.getUs)(issue, outputFormat);
        let subtasks = [];
        if (userStory.showSubtasks)
            subtasks = yield (0, getJiraTasks_1.getSubtasks)(issue, outputFormat);
        const result = { lineType: "ILine", US: userStory, tasks: subtasks };
        return result;
    });
}
function issueIsSub(issue, outputFormat) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield setUpJiraClient_1.SClient.getClient();
        try {
            const parentIssue = yield client.issues.getIssue({
                issueIdOrKey: issue.fields.parent.key,
            });
            let subtask = [];
            const userStory = (0, getJiraTasks_1.getUs)(parentIssue, outputFormat, "USIsTask");
            userStory.warningTaskNumber = issue.key;
            const result = { lineType: "ILine", US: userStory, tasks: subtask };
            return result;
        }
        catch (error) {
            const result = {
                lineType: "ILineNoUS",
                warningType: "FetchErr",
                textColor: outputFormat.colorWarning,
                textMode: outputFormat.modeBold,
            };
            return result;
        }
    });
}
function getLine(line, outputFormat) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield setUpJiraClient_1.SClient.getClient();
        if (!line) {
            const result = {
                lineType: "ILineEmpty",
                text: line,
                textColor: outputFormat.colorDefault,
                textMode: outputFormat.modeDim,
            };
            return result;
        }
        const issueId = (0, getJiraUSFromText_1.getJiraUSFromText)(line);
        if (!issueId) {
            if (line.search(/:\*\*/) !== -1) {
                const result = {
                    lineType: "ILineNoUS",
                    warningType: "MissUSNb",
                    text: line.substring(2),
                    textColor: outputFormat.colorWarning,
                    textMode: outputFormat.modeBold,
                };
                return result;
            }
            const result = {
                lineType: "ILineEmpty",
                text: line,
                textColor: outputFormat.colorDefault,
                textMode: outputFormat.modeDim,
            };
            return result;
        }
        let issue;
        try {
            issue = yield client.issues.getIssue({ issueIdOrKey: issueId });
        }
        catch (err) {
            const result = {
                lineType: "ILineNoUS",
                warningType: "WrongUsNumber",
                text: line.substring(2),
                textColor: outputFormat.colorWarning,
                textMode: outputFormat.modeBold,
            };
            return result;
        }
        if (process.env.CONFIG_SUBTASKS === "false" ||
            (issue.fields.subtasks && issue.fields.subtasks.length > 0) ||
            !((_b = (_a = issue === null || issue === void 0 ? void 0 : issue.fields) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.key)) {
            return yield issueIsUS(issue, outputFormat);
        }
        else if (issue.fields.subtasks.length <= 0) {
            return yield issueIsSub(issue, outputFormat);
        }
    });
}
exports.getLine = getLine;
//# sourceMappingURL=getLine.js.map