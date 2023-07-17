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
  {
    collection: 'cards',
    timestamps: { createdAt: false, updatedAt: 'updated' },
  }
);

cardSchema.name = 'Card';

module.exports = cardSchema;
