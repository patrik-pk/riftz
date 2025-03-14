import mongoose from 'mongoose'

const startingCurrency = 500

const UserSchema = new mongoose.Schema({
  userId: { type: Number, },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  ownedItems: {
    type: Array,
    default: [],
  },
  dailyReward: {
    type: Object,
    default: {
      availableAt: Date.now(),
      amount: 100,
    },
  },
  currency: {
    type: Number,
    default: startingCurrency,
  },
  currencyHistory: {
    type: Array,
    default: [
      {
        date: Date.now(),
        type: 'ACCOUNT_CREATION',
        amount: startingCurrency,
      },
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const User = mongoose.model('user', UserSchema)

export default User
