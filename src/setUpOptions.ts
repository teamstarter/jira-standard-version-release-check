import { parse } from "ts-command-line-args";
import { IOptionsArguments } from "./interfaces/interfaces";

export const SOptions = (function () {
  let options: IOptionsArguments;

  function setOptions() {
    const options = parse<IOptionsArguments>({
      onlyWarnings: { type: Boolean, alias: "w" },
      table: { type: Boolean, alias: "t" },
      disableChecks: { type: Boolean, alias: "c" },
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
