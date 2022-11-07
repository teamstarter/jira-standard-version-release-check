module.exports = function getJiraUSFromText(line) {
    const found = line.match(/DP-\d+/g)
  
    if (found) {
      return found[0]
    }
    return null
  }