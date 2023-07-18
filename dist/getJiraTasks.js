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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeLink = exports.getSubtasks = exports.getSingleSubtask = exports.getUs = void 0;
const setUpJiraClient_1 = require("./setUpJiraClient");
const setUpOptions_1 = require("./setUpOptions");
function getUs(issue, outputFormat, warning) {
    var _a;
    const options = setUpOptions_1.SOptions.getOptions();
    const statusName = issue.fields.status.name;
    const assigneeName = (_a = issue.fields.assignee) === null || _a === void 0 ? void 0 : _a.displayName;
    let isUsInProd = false;
    let isUsReady = false;
    const usReadyToReleaseStatus = options.launchPreProd ? process.env.JIRA_US_PREPROD_READY_TO_RELEASE_STATUS : process.env.JIRA_US_READY_TO_RELEASE_STATUS;
    const usReleaseStatus = options.launchPreProd ? process.env.JIRA_US_PREPROD_RELEASE_STATUS : process.env.JIRA_US_RELEASE_STATUS;
    if (statusName) {
        if (usReleaseStatus)
            isUsInProd = usReleaseStatus.toLowerCase().includes(statusName.toLowerCase());
        if (usReadyToReleaseStatus)
            isUsReady =
                usReadyToReleaseStatus.toLowerCase().includes(statusName.toLowerCase());
    }
    let status = "isNotOk";
    let color = outputFormat.colorNotReady;
    if (isUsReady) {
        status = "isReadyToRelease";
        color = outputFormat.colorReady;
    }
    else if (isUsInProd) {
        status = "isProd";
        color = outputFormat.colorNoAction;
    }
    let showTasks = true;
    if (status === "isNotOk") {
        if (options.table)
            showTasks = false;
        if (options.onlyWarnings)
            showTasks = false;
        else
            showTasks = true;
    }
    else
        showTasks = false;
    if (options.table)
        showTasks = false;
    else if (options.onlyWarnings)
        showTasks = false;
    const result = {
        warningType: warning,
        statusType: status,
        showSubtasks: showTasks,
        statusJira: statusName ? statusName : "status-undefined",
        number: issue.key,
        assignee: assigneeName ? assigneeName : "no-assignee",
        title: issue.fields.summary,
        textColor: color,
        textMode: outputFormat.modeBold,
        link: makeLink(issue.key),
    };
    return result;
}
exports.getUs = getUs;
function getSingleSubtask(sub, outputFormat) {
    return __awaiter(this, void 0, void 0, function* () {
        const statusName = sub.fields.status.name;
        let assigneeName;
        const options = setUpOptions_1.SOptions.getOptions();
        const client = yield setUpJiraClient_1.SClient.getClient();
        let isReady = false;
        let isProd = false;
        if (statusName) {
            if (process.env.JIRA_TASK_READY_TO_RELEASE_STATUS)
                isReady =
                    process.env.JIRA_TASK_READY_TO_RELEASE_STATUS.toLowerCase().includes(statusName.toLowerCase());
            if (process.env.JIRA_TASK_RELEASE_STATUS)
                isProd = process.env.JIRA_TASK_RELEASE_STATUS.toLowerCase().includes(statusName.toLowerCase());
        }
        let status = "isNotOk";
        let color = outputFormat.colorNotReady;
        if (isReady) {
            status = "isReadyToRelease";
            color = outputFormat.colorReady;
        }
        else if (isProd) {
            status = "isProd";
            color = outputFormat.colorNoAction;
        }
        if (!isReady) {
            try {
                const SubIssue = yield client.issues.getIssue({
                    issueIdOrKey: sub.key,
                });
                assigneeName = SubIssue.fields.assignee.displayName;
            }
            catch (error) {
                assigneeName = "no-assignee";
            }
        }
        const result = {
            statusType: status,
            statusJira: statusName ? statusName : "status-undefined",
            assignee: assigneeName ? assigneeName : "no-assignee",
            number: sub.key,
            textColor: color,
            textMode: outputFormat.modeDim,
        };
        return result;
    });
}
exports.getSingleSubtask = getSingleSubtask;
function getSubtasks(issue, outputFormat) {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const subtasks = [];
        try {
            for (var _d = true, _e = __asyncValues(issue.fields.subtasks), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                _c = _f.value;
                _d = false;
                try {
                    const sub = _c;
                    subtasks.push(yield getSingleSubtask(sub, outputFormat));
                }
                finally {
                    _d = true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return subtasks;
    });
}
exports.getSubtasks = getSubtasks;
function makeLink(key) {
    return `https://${process.env.JIRA_SUBDOMAIN}.atlassian.net/browse/${key}`;
}
exports.makeLink = makeLink;
//# sourceMappingURL=getJiraTasks.js.map