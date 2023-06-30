const { default: mongoose } = require('mongoose');

const deckSchema = mongoose.Schema(
  {
    uuid: String,
    name: String,
    lastup: Number,
    code: String,
    cards: [{ cid: Number, name: String, art: String }],
    updated: { type: Date, default: Date.now },
  },
  { collection: 'decks' }
);

deckSchema.name = 'Deck';

module.exports = deckSchema;
