const schedule = require('node-schedule');
const request = require('superagent');
const cheerio = require('cheerio');
const { pick, snakeCase, kebabCase, random } = require('lodash');
const { stringify, sleep } = require('../utils');
const AppDataSource = require('../app-data-source');

const Card = AppDataSource.model('Card');
const CardProFile = AppDataSource.model('CardProFile');
const Deck = AppDataSource.model('Deck');

const crawlingCards = async () => {
  const { text } = await request
    .get('https://marvelsnapzone.com/getinfo')
    .query({ searchtype: 'cards', searchcardstype: true });

  return JSON.parse(text).success.cards;
};

const writeCards = async () => {
  const cards = await crawlingCards();

  const operations = cards.map((card) => ({
    updateOne: {
      filter: { cid: card.cid },
      update: card,
      upsert: true,
    },
  }));

  return Card.bulkWrite(operations);
};

const crawlingCardProFile = async (id) => {
  const response = await request.get(`https://marvelsnapzone.com/cards/${id}`);
  const $ = cheerio.load(response.text);
  const data = {};

  data.name = $('h1').text();
  data.art = $('.cardimage img')
    .attr('src')
    ?.match(/https:\/\/.*$/)[0];
  data.cost = $('.content-right .cost').text();
  data.power = $('.content-right .power').text();

  $('.content-right .name-line').each((_, elem) => {
    const key = $('.name', elem).text().toLowerCase();

    switch (key) {
      case 'description':
        data.description = $('.info p', elem).text();
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

  return data;
};

const writeCardProFile = async () => {
  const cards = await Card.find();
  const cardProFiles = [];

  for (let i = 0; i < cards.length; i++) {
    try {
      const cardProFile = await crawlingCardProFile(kebabCase(cards[i].name));
      Object.assign(cardProFile, pick(cards[i], ['cid', 'name']));
      cardProFiles.push(cardProFile);
      await sleep(random(500, 1000)); // random delay of 0.5 to 1 second.
    } catch (error) {
      console.log(error);
    }
  }

  const operations = cardProFiles.map((cardProFile) => ({
    updateOne: {
      filter: { cid: cardProFile.cid },
      update: cardProFile,
      upsert: true,
    },
  }));

  return CardProFile.bulkWrite(operations);
};

const crawlingDecks = async (nextpage) => {
  const query = {
    searchdecks: true,
    tags: [],
    cardtags: [],
    deckname: '',
    abilities: [],
    sources: [],
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

  const { text } = await request.get('https://marvelsnapzone.com/getinfo').query(stringify(query));
  const decks = JSON.parse(text).success.decks;

  return decks.map(({ deck }) =>
    Object.assign(deck.info, {
      cards: deck.decklist.cards?.map((card) => ({ ...card, name: card.cname })),
    })
  );
};

const writeDecks = async () => {
  const limit = 1000;
  let currentPage = 0;
  let cacheQueue = [];

  const write = async () => {
    const operations = cacheQueue.map((deck) => ({
      updateOne: {
        filter: { uuid: deck.uuid },
        update: deck,
        upsert: true,
      },
    }));

    cacheQueue = [];
    await Deck.bulkWrite(operations);
  };

  while (true && currentPage < 3) {
    try {
      const decks = await crawlingDecks(currentPage);

      if (decks.length === 0) {
        break;
      }

      cacheQueue = cacheQueue.concat(decks);
      if (cacheQueue.length > limit) {
        await write();
      }

      await sleep(random(500, 1000)); // random delay of 0.5 to 1 second.
      currentPage++;
    } catch (error) {
      console.log(error);
    }
  }

  if (cacheQueue.length) {
    await write();
  }
};

const scheduleJob = async () => {
  // execute tasks at two o'clock every day
  return schedule.scheduleJob('0 2 * * *', async () => {
    console.log('crawling job started \n');

    console.log('crawl card job started');
    await writeCards();
    console.log('crawl card job completed \n');

    console.log('crawl card pro file job started');
    await writeCardProFile();
    console.log('crawl card pro file job completed \n');

    console.log('crawl deck job started');
    await writeDecks();
    console.log('crawl deck job completed \n');

    console.log('crawling job completed');
  });
};

module.exports = { scheduleJob };
