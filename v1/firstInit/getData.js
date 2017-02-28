const https = require('https')
const URL = require('url')
cosnt { getHeaders } = require('../config.js')

function getData(url, callback) {
  const u = URL.parse(url)

  const options = {
    protocol: u.protocol,
    host: u.host,
    hostname: u.hostname,
    path: u.path,
    headers: getHeaders()
  }

  let data = ''
  https.get(options, (res) => {
    const statusCode = res.statusCode;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      if (statusCode === 302) {
        console.log(`redirection: ${res.headers.location}`)
        getData(res.headers.location, callback)
        return;
      }
      error = new Error(`Request Failed.  Status Code: ${statusCode}`);
    }

    if (error) {
      console.error(error.message);
      res.resume();
      return;
    }

    res.setEncoding('utf-8')
    res.on('data', chunk => data += chunk)
    res.on('end', () => callback(data))
    res.resume()
  }).on('error', e => console.error(`Got error: ${e.message}`) )
}
