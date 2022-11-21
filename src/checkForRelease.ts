import fs from "fs";
import readline from "readline";
import standardVersion from "standard-version";
import { getLine } from "./getLine";
import { getEnvVariables } from "./getEnvVariables";
import { ILine, ILineEmpty, ILineNoUS } from "./globals/interfaces";
import { formatLine } from "./formatLine";
import { printOutput } from "./printOutput";
import { SOptions } from "./setUpOptions";

module.exports = async function main() {
  getEnvVariables();
  useStandardVersion();
};

async function useStandardVersion() {
  const options = SOptions.getOptions();
  // standard version do not provide a way to get the output
  // So we intercept it!
  const interceptedContent: String[] = [];
  const outputOrigin = process.stdout.write;
  function captureConsole(data: string) {
    interceptedContent.push(data);
    return true;
  }
  // Start the interception
  process.stdout.write = captureConsole;

  await standardVersion({
    noVerify: true,
    infile: "docs/CHANGELOG.md",
    silent: true,
    dryRun: true,
  });
  // // Release the interception of the console
  process.stdout.write = outputOrigin;

  let consoleOutputArray: (ILine | ILineNoUS | ILineEmpty | undefined)[] = [];
  for (const line of interceptedContent[0].split("\n")) {
    const lineObj: ILine | ILineNoUS | ILineEmpty | undefined = await getLine(
      line
    );
    if (options.disableChecks) console.log(line);
    else consoleOutputArray.push(formatLine(lineObj));
  }
  printOutput(consoleOutputArray);
}
