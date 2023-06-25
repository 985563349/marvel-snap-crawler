const Koa = require('koa');
const cors = require('@koa/cors');
const router = require('./router');

const app = new Koa();

app.use(cors()).use(router.routes());

app.listen(3008, () => {
  console.log('server running at http://localhost:3008');
});
