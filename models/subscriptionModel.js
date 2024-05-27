const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  subscription: Object,
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
