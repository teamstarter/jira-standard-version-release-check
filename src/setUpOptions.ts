import { parse } from "ts-command-line-args";
import { IOptionsArguments } from "./globals/interfaces";

export const SOptions = (function () {
  let options: IOptionsArguments;

  function setOptions() {
    const options = parse<IOptionsArguments>({
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
