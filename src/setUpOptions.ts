import { exit } from "process";
import { parse } from "ts-command-line-args";
import { IOptionsArguments } from "./globals/interfaces";

export const SOptions = (function () {
  let options: IOptionsArguments;

  function setOptions() {
    try {
      const options = parse<IOptionsArguments>(
        {
          onlyWarnings: {
            type: Boolean,
            alias: "w",
            description: "Only prints warnings",
          },
          table: {
            type: Boolean,
            alias: "t",
            description: "Prints as a table format.",
          },
          disableChecks: {
            type: Boolean,
            alias: "c",
            description: "Output raw standard-version.",
          },
          help: {
            type: Boolean,
            optional: true,
            alias: "h",
            description: "Prints this usage guide",
          },
        },
        {
          helpArg: "help",
          headerContentSections: [
            {
              header: "Jira Standard-Version Release Check",
              content: "Thanks for using Our Awesome Package",
            },
          ],
          footerContentSections: [
            {
              header: "Github",
              content: `https://github.com/teamstarter/jira-standard-version-release-check`,
            },
          ],
        }
      );
    } catch {
      throw new Error(
        "Wrong arguments, please use --help or -h to see options."
      );
    }
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
