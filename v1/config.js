const config = {
  JD: {
    url: 'https://list.jd.com/list.html?cat=666,671,672&sort=sort_totalsales15_desc',
    priceUrl: 'https://p.3.cn/prices/mgets?skuIds=',
    priceJoiner: '%2C',
    commentUrl: 'https://club.jd.com/comment/productCommentSummaries.action?referenceIds=',
    commentJoiner: ','
  },
  TM: {
    url: 'https://list.tmall.com/search_product.htm?q=%B5%E7%C4%D4&type=p&vmarket=&spm=875.7931836.a2227oh.d100&from=mallfp..pc_1_searchbutton'
  },
  mongoDB: {
    url: 'mongodb://localhost:27017/test',
  }
  // sourceSite: 'https://www.jd.com'
}

module.exports = config
