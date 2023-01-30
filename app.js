const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');

const app = new Koa();
const router = new Router();

router.get('/', (ctx) => {
  ctx.body = 'Hello Koa';
});

app.use(cors()).use(router.routes());

app.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
