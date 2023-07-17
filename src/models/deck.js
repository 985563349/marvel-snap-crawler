const { default: mongoose } = require('mongoose');

const deckSchema = mongoose.Schema(
  {
    uuid: String,
    name: String,
    lastup: Number,
    code: String,
    cards: [{ cid: Number, name: String, art: String }],
  },
  {
    collection: 'decks',
    timestamps: { createdAt: false, updatedAt: 'updated' },
  }
);

deckSchema.name = 'Deck';

module.exports = deckSchema;
