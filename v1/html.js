const cheerio = require('cheerio')
const https = require('https')
const fs = require('fs')
const { JD } = require('./config.js')
const { shortString } = require('./utils/index.js')

function getData(url, callback) {
  let data = ''
  https.get(url, (res) => {
    const statusCode = res.statusCode;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      error = new Error(`Request Failed.\n` +
                        `Status Code: ${statusCode}`);
    }
    // else if (!/^application\/json/.test(contentType)) {
    //   error = new Error(`Invalid content-type.\n` +
    //                     `Expected application/json but received ${contentType}`);
    // }
    if (error) {
      console.error(error.message);
      // consume response data to free up memory
      res.resume();
      return;
    }

    res.setEncoding('utf-8')
    res.on('data', chunk => data += chunk)
    res.on('end', () => callback(data))
    res.resume();
  }).on('error', e => console.error(`Got error: ${e.message}`) )
}

function initData(cheerio, html) {
  let data = {
    dataID: [],
    data: [],
    timestamp: '',
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
      href: `https:${li.find('div.p-img a').attr('href')}`,
    }
    data.dataID.push(d.id)
    data.data.push(d)
  })
  return data;
}

function getPrice(url, callback) {
  const priceBegin = new Date().getTime()
  getData(url, price => callback({
      priceData: JSON.parse(price),
      priceBegin,
      priceEnd: new Date().getTime(),
    }))
}

function getComment(url, callback) {
  const commentBegin = new Date().getTime()
  getData(url, comment => callback({
      comment: JSON.parse(comment).CommentsCount,
      commentBegin,
      commentEnd: new Date().getTime()
    }))
}

function parseJD(html) {
  let data = initData(cheerio, html);
  const priceUrl = `${JD.priceUrl}J_${data.dataID.join(JD.priceJoiner+'J_')}`
  const commentUrl = `${JD.commentUrl}${data.dataID.join(JD.commentJoiner)}`
  const price = new Promise(resolve => getPrice(priceUrl, price => resolve(price)) )
  const comment = new Promise(resolve => getComment(commentUrl, comment =>resolve(comment)) )

  Promise.all([price, comment]).then(value => {
    for (let i = 0, len = data.data.length; i < len; i++ ){
      const price = value[0]
      data.data[i].price = price.priceData[i].p
      data.priceBegin = price.priceBegin
      data.priceEnd = price.priceEnd

      const comment = value[1].comment[i]
      data.data[i].CommentCount = comment.CommentCount
      data.data[i].AverageScore = comment.AverageScore
      data.data[i].GoodCount = comment.GoodCount
      data.data[i].GeneralCount = comment.GeneralCount
      data.data[i].PoorCount = comment.PoorCount
      data.data[i].AfterCount = comment.AfterCount
      data.commentBegin = value[1].commentBegin
      data.commentEnd = value[1].commentEnd
    }
    console.log(data);
  })
}

getData(JD.url, parseJD)
