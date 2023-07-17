const mongoose = require('mongoose');
const { Schema } = mongoose;

const cardProFileSchema = Schema(
  {
    cid: Number,
    name: String,
    ranking: String,
    description: String,
    variant_images: [String],
    of_games: String,
    cube_rate_on_draw: String,
    cube_rate_on_play: String,
    total_cube_share: String,
    total_meta_share: String,
    win_rate_on_draw: String,
    win_rate_on_play: String,
  },
  {
    collection: 'card_pro_files',
    timestamps: { createdAt: false, updatedAt: 'updated' },
  }
);

cardProFileSchema.name = 'CardProFile';

module.exports = cardProFileSchema;
