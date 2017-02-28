const getData = require('./getData.js')

// 从api获取数据
function getJsonData(url, callback, key) {
  const begin = new Date().getTime()
  getData(url, data => callback({
      data: key ? JSON.parse(data)[key] : JSON.parse(data),
      begin,
      end: new Date().getTime(),
    }))
}
