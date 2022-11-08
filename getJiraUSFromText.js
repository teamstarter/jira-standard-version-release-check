module.exports = function getJiraUSFromText(line) {
    const found = line.match(/DP.(\d+)/)
    if (found && found[1]) {
      return 'DP-' + found[1]
    }
    return null
  }