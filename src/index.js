const Koa = require('koa');
const cors = require('@koa/cors');
const AppDataSource = require('./app-data-source');

AppDataSource.initialize()
  .then(async () => {
    const app = new Koa();

    app.use(cors()).use(require('./router').routes());

    app.listen(3008, () => {
      console.log('Koa server has started on port 3008. Open http://localhost:3008 to see results');
    });

    // crawling job running...
    require('./schedule').scheduleJob();
  })
  .catch((error) => {
    console.log(error);
  });
