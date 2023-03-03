export function getJiraUSFromText(line: string) {

  const regex = new RegExp(`${process.env.JIRA_PROJECT_KEY?.toUpperCase()}.(\\d+)`);
  const found = line.toUpperCase().match(regex);
  if (found && found[1]) {
    return `${process.env.JIRA_PROJECT_KEY}-${found[1]}`;
  }
  return null;
}
