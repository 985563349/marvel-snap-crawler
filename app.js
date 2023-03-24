const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');
const request = require('superagent');
const cheerio = require('cheerio');
const { pick, snakeCase } = require('lodash');

const app = new Koa();
const router = new Router();

const stringify = (obj) => {
  return Object.entries(obj)
    .map(([key, val]) => (Array.isArray(val) ? `${key}=[${val}]` : `${key}=${val}`))
    .join('&');
};

router.get('/', (ctx) => {
  ctx.body = 'Marvel Snap';
});

router.get('/api/cards', async (ctx) => {
  const { text } = await request
    .get('https://marvelsnapzone.com/getinfo')
    .query({ searchtype: 'cards', searchcardstype: true });

  let data = JSON.parse(text).success.cards;
  ctx.body = data;
});

router.get('/api/cards/:id', async (ctx) => {
  const { id } = ctx.params;

  const response = await request.get(`https://marvelsnapzone.com/cards/${id}`);
  const $ = cheerio.load(response.text);
  const data = {};

  data.id = id;
  data.name = $('h1').text();
  data.art = $('.cardimage img')
    .attr('src')
    .match(/https:\/\/.*$/)[0];
  data.cost = $('.content-right .cost').text();
  data.power = $('.content-right .power').text();

  $('.content-right .name-line').each((_, elem) => {
    const key = $('.name', elem).text().toLowerCase();

    switch (key) {
      case 'type':
        data.type = $('.info', elem).text();
        break;

      case 'description':
        data.description = $('.info p', elem).text();
        break;

      case 'source':
        data.source = $('.info a p', elem).text();
        break;

      case 'status':
        data.status = $('.info a', elem).text();
        break;
    }
  });

  $('.card-detail-stats .item').each((_, elem) => {
    const key = $('.item-name', elem).text().toLowerCase();
    data[snakeCase(key)] = $('.item-value', elem).text();
  });

  data.variant_images = $('.card-variants .variant img')
    .map(
      (_, elem) =>
        $(elem)
          .data('src')
          ?.match(/https:\/\/.*$/)[0]
    )
    .get();

  ctx.body = data;
});

router.get('/api/cards/:cid/decks', async (ctx) => {
  const { cid } = ctx.params;

  const { text } = await request
    .get('https://marvelsnapzone.com/getinfo')
    .query({ cid, getrelateddeckscard: true });

  const data = JSON.parse(text).success.map((item) => ({
    info: pick(item.info, ['name', 'code', 'lastup']),
    cards: item.decklist?.cards,
  }));

  ctx.body = data;
});

router.get('/api/decks', async (ctx) => {
  const { nextpage, abilities, sources } = ctx.query;

  const query = {
    searchdecks: true,
    tags: [],
    cardtags: [],
    deckname: '',
    abilities: [abilities],
    sources: [sources],
    cards: [],
    collection: [],
    onlywithlikes: 0,
    onlywithvideo: 0,
    onlycontentcreators: 0,
    onlynonanonymous: 0,
    sorttype: 'updated',
    sortorder: 'asc',
    nextpage,
  };

  const { text } = await request.get(`https://marvelsnapzone.com/getinfo`).query(stringify(query));

  const data = JSON.parse(text).success;
  ctx.body = data;
});

app.use(cors()).use(router.routes());

app.listen(3008, () => {
  console.log('server running at http://localhost:3008');
});
