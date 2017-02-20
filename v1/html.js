const cheerio = require('cheerio')
const https = require('https')
const URL = require('url')
const { JD } = require('./config.js')
const { shortString, para_type } = require('./utils/index.js')
const { connectDB, closeDB, save_computer } = require('./mongo/index.js')

function getData(url, callback) {
  const u = URL.parse(url)

  const options = {
    protocol: u.protocol,
    host: u.host,
    hostname: u.hostname,
    path: u.path,
    headers: {
      Date: new Date(),
      Host: 'list.jd.com',
      'Cache-Control': 'no-cache',
      'Postman-Token': 'bc29e755-3564-da66-b879-12bbcb6fbe53'
    }
  }

  let data = ''
  https.get(url, (res) => {
    const statusCode = res.statusCode;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      if (statusCode === 302) {
        console.log(res.headers);
        getData(res.headers.location, callback)
        return;
      }
      error = new Error(`Request Failed.\n` +
                        `Status Code: ${statusCode}`);
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

function initData(html) {
  let data = {
    ID: [],
    data: [],
  };
  let paramStr = ''

  let $ = cheerio.load(html)
  const item = $('li.gl-item')
  item.each((i, el) => {
    const li = $(el)
    const div = li.find('div.j-sku-item')
    const d = {
      id: div.attr('data-sku'),
      name: li.find('div.p-name em').text(),
      href: li.find('div.p-img a').attr('href'),
    }
    data.ID.push(d.id)
    data.data.push(d)
  })
  return data;
}

function getPrice(url, callback) {
  const priceBegin = new Date().getTime()
  getData(url, price => callback({
      data: JSON.parse(price),
      priceBegin,
      priceEnd: new Date().getTime(),
    }))
}

function getComment(url, callback) {
  const commentBegin = new Date().getTime()
  getData(url, comment => callback({
      data: JSON.parse(comment).CommentsCount,
      commentBegin,
      commentEnd: new Date().getTime()
    }))
}

function parseJD(content, saveData) {
  const parseBegin = new Date().getTime()
  let immutableData = initData(content)
  let mutableData = {
      time: '',
      computer: [],
      getPriceTime: 0,
      getCommentTime: 0,
      parseTime: 0,
    }
  const priceUrl = `${JD.priceUrl}J_${immutableData.ID.join(JD.priceJoiner+'J_')}`
  const commentUrl = `${JD.commentUrl}${immutableData.ID.join(JD.commentJoiner)}`
  const priceData = new Promise(resolve => getPrice(priceUrl, price => resolve(price)) )
  const commentData = new Promise(resolve => getComment(commentUrl, comment =>resolve(comment)) )

  Promise.all([priceData, commentData]).then(value => {
    const [priceData, commentData] = value
    const immutable = immutableData.data

    for (let i = 0, len = immutable.length; i < len; i++ ){
      if ('J_'+immutable[i].id !== priceData.data[i].id || immutable[i].id != commentData.data[i].SkuId) {
        console.error(`ID Not Match, ID:${immutable[i].id}\n
          priceID:${priceData.data[i].id}\n
          commentID:${comment.data[i].SkuId}`);
        break;
      }

      let d = {}
      d.id = immutable[i].id
      d.price = ~~priceData.data[i].p

      const comment = commentData.data[i]
      d.commentCount = comment.GoodCount + comment.GeneralCount + comment.PoorCount
      d.averageScore = comment.AverageScore
      d.goodCount = comment.GoodCount
      d.generalCount = comment.GeneralCount
      d.poorCount = comment.PoorCount
      d.afterCount = comment.AfterCount

      mutableData.computer.push(d)
    }
    mutableData.time = new Date().getTime()
    mutableData.getPriceTime = priceData.priceEnd - priceData.priceBegin
    mutableData.getCommentTime = commentData.commentEnd - commentData.commentBegin
    mutableData.parseTime = new Date().getTime() - parseBegin

    saveData(immutableData, mutableData)
  })
}

function main(){
  connectDB();
  let immutableData = {
    ID: [],
    data: [],
  }
  let mutableData = {
    time: 0,
    computer: [],
    getPriceTime: 0,
    getCommentTime: 0,
    parseTime: 0,
  }
  const pages = 100
  let i = 1
  let intervaltime =  Math.random()*1000
  const inter = setInterval(() => {
    getData(`${JD.url}&page=${i}`, content => parseJD(content, (a, b) => {
      console.log(a.ID.length);
      if(!a.ID.length) return
      immutableData.ID = immutableData.ID.concat(a.ID)
      immutableData.data = immutableData.data.concat(a.data)
      mutableData.time += b.time
      mutableData.computer = mutableData.computer.concat(b.computer)
      mutableData.getPriceTime += b.getPriceTime
      mutableData.getCommentTime += b.getCommentTime
      mutableData.parseTime += b.parseTime
    }))
    i++;
    if (i > pages) {
      clearInterval(inter);
      console.log(immutableData.ID.length);
      save_computer(immutableData, mutableData);
      // closeDB()
    }
  }, intervaltime)
}

main();
