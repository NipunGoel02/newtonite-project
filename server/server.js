const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Expense = require('./models/expense');

const app = express();
const PORT = 3000;
const MONGO_URI = 'mongodb://localhost:27017/expense-tracker';

app.use(cors());
app.use(express.json());

app.get('/api/expenses', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category.toLowerCase();
    }

    const expenses = await Expense.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(expenses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { title, amount, category } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({ message: 'Title, amount, and category are required' });
    }

    const expense = new Expense({
      title: title.trim(),
      amount: Number(amount),
      category: category.toLowerCase(),
    });

    const savedExpense = await expense.save();
    return res.status(201).json(savedExpense);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.get('/api/expenses/summary', async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          category: { $first: '$category' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    return res.status(200).json(summary);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });
