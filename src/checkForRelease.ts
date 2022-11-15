import fs from "fs";
import readline from "readline";
import standardVersion from "standard-version";
import { formatLine } from "./formatLine";
import { getEnvVariables } from "./getEnvVariables";

main();
async function main() {
  getEnvVariables();
  // useStandardVersion();
  useLocalChangelog();
}

async function useStandardVersion() {
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
  for (const line of interceptedContent[0].split("\n")) {
    const formatedLine = await formatLine(line);
    console.log(formatedLine);
  }
}

async function useLocalChangelog() {
  var user_file = "./CHANGELOG.md";
  var r = readline.createInterface({
    input: fs.createReadStream(user_file),
  });
  for await (const line of r) {
    const formatedLine = await formatLine(line);
    if (formatedLine !== "") console.log(formatedLine);
  }
}
