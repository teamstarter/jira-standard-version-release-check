import fs from "fs";
import readline from "readline";
import standardVersion from "standard-version";
import { formatLine } from "./formatLine";
import { getEnvVariables } from "./getEnvVariables";
import { SOptions } from "./setUpOptions";

main();
async function main() {
  getEnvVariables();
  useStandardVersion();
  // useLocalChangelog();
}

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
  for (const line of interceptedContent[0].split("\n")) {
    if (options.disableChecks) console.log(line);
    else {
      const formatedLine = await formatLine(line);
      console.log(formatedLine);
    }
  }
}

async function useLocalChangelog() {
  if (!process.env.CHANGELOG_FILE)
    throw new Error("Please set CHANGELOG_FILE variable in .env.");
  if (!fs.existsSync(process.env.CHANGELOG_FILE))
    throw new Error(
      "File referenced by CHANGELOG_FILE variable in .env does not exist."
    );
  var user_file = process.env.CHANGELOG_FILE;
  var r = readline.createInterface({
    input: fs.createReadStream(user_file),
  });
  for await (const line of r) {
    const formatedLine = await formatLine(line);
    if (formatedLine !== "") console.log(formatedLine);
  }
}
