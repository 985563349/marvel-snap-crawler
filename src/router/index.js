const Router = require('@koa/router');
const { startCase } = require('lodash');
const AppDataSource = require('../app-data-source');

const Card = AppDataSource.model('Card');
const CardProFile = AppDataSource.model('CardProFile');
const Deck = AppDataSource.model('Deck');

const router = new Router();

router.get('/', (ctx) => {
  ctx.body = 'Marvel Snap';
});

router.get('/api/cards', async (ctx) => {
  ctx.body = await Card.find();
});

router.get('/api/cards/:name', async (ctx) => {
  const name = startCase(ctx.params.name);
  const card = await Card.findOne({ name });
  const cardProFile = await CardProFile.findOne({ name });
  ctx.body = { ...card.toObject(), pro_file: cardProFile?.toObject() };
});

router.get('/api/cards/:name/decks', async (ctx) => {
  const name = startCase(ctx.params.name);
  ctx.body = await Deck.find({ 'cards.name': name }).sort({ lastup: 'desc' }).limit(6);
});

router.get('/api/decks', async (ctx) => {
  const { pageSize, currentPage } = ctx.query;
  const skip = (currentPage - 1) * pageSize;
  const decks = await Deck.find().skip(skip).limit(pageSize);
  ctx.body = { currentPage: Number(currentPage), decks };
});

module.exports = router;
