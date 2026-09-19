const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['food', 'travel', 'bills', 'shopping', 'other'],
      message: 'Category must be one of: food, travel, bills, shopping, other',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
