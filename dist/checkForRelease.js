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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const readline_1 = __importDefault(require("readline"));
const standard_version_1 = __importDefault(require("standard-version"));
const getLine_1 = require("./getLine");
const getEnvVariables_1 = require("./getEnvVariables");
const formatLine_1 = require("./formatLine");
const printOutput_1 = require("./printOutput");
const setUpOptions_1 = require("./setUpOptions");
const globals_1 = require("./globals/globals");
if (process.env.CHECK_RELEASE_ENV && process.env.CHECK_RELEASE_ENV === "dev") {
    main();
    function main() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, getEnvVariables_1.getEnvVariables)();
            if (process.env.USE_CHANGELOG_ENV &&
                process.env.USE_CHANGELOG_ENV === "true")
                useLocalChangelog();
            else
                useStandardVersion();
        });
    }
}
else {
    module.exports = function main() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, getEnvVariables_1.getEnvVariables)();
            useStandardVersion();
        });
    };
}
function defineOutputFormat() {
    const options = setUpOptions_1.SOptions.getOptions();
    if (options.genMarkdown)
        return globals_1._gMarkdown;
    else
        return globals_1._gASCII;
}
function useLocalChangelog() {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const options = setUpOptions_1.SOptions.getOptions();
        const outputFormat = defineOutputFormat();
        if (!process.env.CHANGELOG_FILE)
            throw new Error("Please set CHANGELOG_FILE variable in .env.");
        if (!fs_1.default.existsSync(process.env.CHANGELOG_FILE))
            throw new Error("File referenced by CHANGELOG_FILE variable in .env does not exist.");
        var user_file = process.env.CHANGELOG_FILE;
        var r = readline_1.default.createInterface({
            input: fs_1.default.createReadStream(user_file),
        });
        let consoleOutputArray = [];
        try {
            for (var _d = true, r_1 = __asyncValues(r), r_1_1; r_1_1 = yield r_1.next(), _a = r_1_1.done, !_a;) {
                _c = r_1_1.value;
                _d = false;
                try {
                    const line = _c;
                    const lineObj = yield (0, getLine_1.getLine)(line, outputFormat);
                    if (lineObj === undefined)
                        continue;
                    if (options.disableChecks)
                        console.log(line);
                    else
                        consoleOutputArray.push((0, formatLine_1.formatLine)(lineObj));
                }
                finally {
                    _d = true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = r_1.return)) yield _b.call(r_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (!options.disableChecks)
            (0, printOutput_1.printOutput)(consoleOutputArray, outputFormat);
    });
}
function useStandardVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        const options = setUpOptions_1.SOptions.getOptions();
        const outputFormat = defineOutputFormat();
        // standard version do not provide a way to get the output
        // So we intercept it!
        const interceptedContent = [];
        const outputOrigin = process.stdout.write;
        function captureConsole(data) {
            interceptedContent.push(data);
            return true;
        }
        // Start the interception
        process.stdout.write = captureConsole;
        yield (0, standard_version_1.default)({
            noVerify: true,
            infile: "CHANGELOG.md",
            silent: true,
            dryRun: true,
        });
        // // Release the interception of the console
        process.stdout.write = outputOrigin;
        let consoleOutputArray = [];
        for (const line of interceptedContent[0].split("\n")) {
            const lineObj = yield (0, getLine_1.getLine)(line, outputFormat);
            if (options.disableChecks)
                console.log(line);
            else
                consoleOutputArray.push((0, formatLine_1.formatLine)(lineObj));
        }
        if (!options.disableChecks)
            (0, printOutput_1.printOutput)(consoleOutputArray, outputFormat);
    });
}
//# sourceMappingURL=checkForRelease.js.map