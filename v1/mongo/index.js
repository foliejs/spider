const { mongoDB } = require('../config.js')
const mongoose = require('mongoose');
const db = mongoose.connection;

db.once('open', () => console.log('db open'));
db.on('close', () => console.log('db close'));
db.on('error', (err) => {
  db.close();
  console.error('mongodb error:', err.message);
});

const Immutable = mongoose.Schema({
  ID: Array,
  data: [{
    id: String,
    name: String,
    href: String,
  }]
});
// mutable
const Mutable = mongoose.Schema({
  time: Number,
  computer: [{
    id: String,
    price: Number,
    commentCount: Number,
    averageScore: Number,
    goodCount: Number,
    generalCount: Number,
    poorCount: Number,
    afterCount: Number,
  }],
  getPriceTime: Number,
  getCommentTime: Number,
  parseTime: Number,
})

const immutable = mongoose.model('Immutable', Immutable);
const mutable = mongoose.model('Mutable', Mutable);

module.exports = {
  connectDB(){
    mongoose.connect(mongoDB.url, err => console.error('connecting error: ', err));
  },
  closeDB(){
    db.close();
  },
  save_computer(immutableData, mutableData) {
    immutable.create(immutableData, err => console.error('create immutable: ', err))
    mutable.create(mutableData, err => console.error('create mutable: ', err))
  }
}
