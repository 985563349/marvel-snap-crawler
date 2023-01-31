const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');
const request = require('superagent');
const cheerio = require('cheerio');

const app = new Koa();
const router = new Router();

const mapKey = {
  obtained: 'method',
  'card ability': 'ability',
};

router.get('/', (ctx) => {
  ctx.body = 'Marvel Snap';
});

router.get('/search', async (ctx) => {
  const { text } = await request
    .get('https://marvelsnap.io/api/search.php?database')
    .query(ctx.query);

  ctx.body = text;
});

router.get('/card/:id', async (ctx) => {
  const { id } = ctx.params;

  const response = await request.get(`https://marvelsnap.io/card/${id}`);
  const $ = cheerio.load(response.text);
  const data = {};

  data.id = id.match(/\d$/)[0];
  data.name = $('.card-area .column2 h1').text();
  data.pretty_url = id;
  data.image = $('.card-area .column1 img')
    .data('src')
    .match(/https:\/\/.*$/)[0];

  $('.card-area .column2 h4').each((_, elem) => {
    const key = $(elem).text().toLowerCase();
    data[mapKey[key] ?? key] = $(elem).next().text();
  });

  $('.card-area .column2 .card-data-info li').each((_, elem) => {
    const key = $('.card-data-header', elem).text().toLowerCase();
    data[key] = $('.card-data-subheader', elem).text().trim();
  });

  data.variant_images = $('.alt-cards img')
    .map((_, elem) =>
      $(elem)
        .attr('src')
        .match(/https:\/\/.*$/)
    )
    .get();

  ctx.body = data;
});

app.use(cors()).use(router.routes());

app.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
