export function getJiraUSFromText(line: string) {
  const regex = new RegExp(`${process.env.JIRA_PROJECT_KEY}.(\\d+)`);

  const found = line.match(regex);
  debugger
  if (found && found[1]) {
    return `${process.env.JIRA_PROJECT_KEY}-${found[1]}`;
  }
  return null;
}
