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
    updated: { type: Date, default: Date.now },
  },
  { collection: 'cards' }
);

cardSchema.name = 'Card';

module.exports = cardSchema;
