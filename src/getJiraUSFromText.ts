export function getJiraUSFromText(line: any) {
  const found = line.match(/DP.(\d+)/);
  if (found && found[1]) {
    return "DP-" + found[1];
  }
  return null;
}
