"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJiraUSFromText = void 0;
function getJiraUSFromText(line) {
    var _a;
    const regex = new RegExp(`${(_a = process.env.JIRA_PROJECT_KEY) === null || _a === void 0 ? void 0 : _a.toUpperCase()}.(\\d+)`);
    const found = line.toUpperCase().match(regex);
    if (found && found[1]) {
        return `${process.env.JIRA_PROJECT_KEY}-${found[1]}`;
    }
    return null;
}
exports.getJiraUSFromText = getJiraUSFromText;
//# sourceMappingURL=getJiraUSFromText.js.map