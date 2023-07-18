"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOptions = void 0;
const ts_command_line_args_1 = require("ts-command-line-args");
exports.SOptions = (function () {
    let options;
    function setOptions() {
        const options = (0, ts_command_line_args_1.parse)({
            launchPreProd: { type: Boolean, alias: "p" },
            onlyWarnings: { type: Boolean, alias: "w" },
            table: { type: Boolean, alias: "t" },
            disableChecks: { type: Boolean, alias: "d" },
            genMarkdown: { type: Boolean, alias: "m" },
        });
        return options;
    }
    return {
        getOptions: function () {
            if (!options) {
                options = setOptions();
            }
            return options;
        },
    };
})();
//# sourceMappingURL=setUpOptions.js.map