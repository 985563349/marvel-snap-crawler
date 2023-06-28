const mongoose = require('mongoose');
const { Schema } = mongoose;

const cardSchema = new Schema(
  {
    cid: Number,
    type: String,
    name: String,
    cost: Number,
    power: Number,
    art: String,
    source: String,
    status: String,
  },
  { collection: 'cards' }
);

cardSchema.name = 'Card';

module.exports = cardSchema;
