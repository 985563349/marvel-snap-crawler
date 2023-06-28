const DataSource = require('./lib/data-source');
const Card = require('./models/card');
const CardProFile = require('./models/card-pro-file');
const Deck = require('./models/deck');

const AppDataSource = new DataSource({
  url: 'mongodb://127.0.0.1:27017/marvel_snap',
  synchronize: true,
  schemas: [Card, CardProFile, Deck],
});

module.exports = AppDataSource;
