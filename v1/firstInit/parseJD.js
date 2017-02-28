const getJsonData = require('getJsonData.js')

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
  const priceData = new Promise(resolve => getJsonData(priceUrl, price => resolve(price)))
  const commentData = new Promise(resolve => getJsonData(commentUrl, comment =>resolve(comment), 'CommentsCount'))

  Promise.all([priceData, commentData]).then(value => {
    const [priceData, commentData] = value
    const immutable = immutableData.data

    for (let i = 0, len = immutable.length; i < len; i++ ){
      // Api 返回的数据和 请求的 ID的顺序一致。可以不检测
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
