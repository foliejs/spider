const cheerio = require('cheerio')
const https = require('https')
const fs = require('fs')

const { JD } = require('./config.js')
const { shortString } = require('./utils/index.js')
let htmlContent = ''

function getHTML(url, callback) {
  let htmlContent = ''
  https.get(url, (res) => {
    res.setEncoding('utf-8')
    res.on('data', chunk => htmlContent += chunk)
    res.on('end', () => callback(htmlContent))
    res.resume();
  }).on('error', (e) => {
    console.log(`Got error: ${e.message}`);
  })
}

function initData(cheerio, html) {
  let data = {
    priceUrl: '',
    commentUrl: '',
    timestamp: '',
    data: [],
  };
  let paramStr = ''

  let $ = cheerio.load(html)
  const item = $('li.gl-item')
  item.each((i, el) => {
    const li = $(el)
    const div = li.find('div.j-sku-item')
    const d = {
      id: `J_${div.attr('data-sku')}`,
      name: li.find('div.p-name em').text(),
      href: `https:${li.find('div.p-img a').attr('href')}`,
    }
    if (i !== item.length - 1) paramStr += `${d.id}${JD.priceJoiner}`
    data.data.push(d)
  })
  data.priceUrl = `${JD.priceUrl}${paramStr}`
  data.commentUrl = `${JD.commentUrl}${paramStr}`
  return data;
}

function parseJD(html) {
  let data = initData(cheerio, html);
  getHTML(data.priceUrl, (price) => {
    const priceData = JSON.parse(price)
    priceData.map((el, i) => {
      if (data.data[i].id !== el.id) {
        console.error(`\n\nnot match: ${data.data[i]} ${el.id}\n\n`);
        return;
      }
      data.data[i].price = el.p
      data.timestamp = new Date().getTime()
    })
    console.log(data);
  })
  // console.log(data.priceUrl);
  // console.log(data.commentUrl);
  // console.log(data.data.length);

  // let $ = cheerio.load(html)
  // const item = $('li.gl-item')
  // item.each((i, el) => {
  //   const li = $(el)
  //   const div = li.find('div.j-sku-item')
  //   const d = {
  //     skuId: div.attr('data-sku') || div.attr('data-sku_temp'),
  //     name: li.find('div.p-name em').text(),
  //     price: li.find('div.p-price strong.J_price i').text(),
  //     imgSrc: li.find('div.p-img img').attr('src')
  //   }
  //   data.push(d)
  //   // console.log(`${i} { ID:${d.skuId}, 名称:${shortString({ str: d.name, len: 20 })}, 价格:${d.price}, 图片:${shortString({ str: d.imgSrc })} }`);
  // })
  // return data;
  // const writeStream = fs.createWriteStream(`./data/${urlParam.cat}${urlParam.page}`)
}

getHTML(JD.url, parseJD)
