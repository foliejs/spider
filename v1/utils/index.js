module.exports = {
  shortString({str, len = 10}) {
    if(!str || str.length <= len) return str;
    return str.substr(0, len) + '...';
  }
}
