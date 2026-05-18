/**
 * seed.js
 * --------------------------------------------
 * Populates the database with realistic demo data for viva demos.
 *
 * Run with:    npm run seed
 *
 * Creates:
 *   - 1 demo user (demo@financeflow.app / demo1234)
 *   - 3 months of expenses across 8 categories
 *   - Budgets for the current month
 *   - 3 months of income
 *   - 2 savings goals
 *   - 3 recurring subscriptions
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const Expense = require('./models/Expense');
const Budget = require('./models/Budget');
const Income = require('./models/Income');
const SavingsGoal = require('./models/SavingsGoal');
const RecurringExpense = require('./models/RecurringExpense');

const CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Other',
];

const SAMPLE_DESCRIPTIONS = {
  Food: ['Zomato dinner', 'Groceries', 'Coffee with friends', 'Lunch at office', 'Pizza night'],
  Travel: ['Uber ride', 'Metro card recharge', 'Flight booking', 'Petrol', 'Bus pass'],
  Shopping: ['New headphones', 'Amazon order', 'Clothes from Myntra', 'Books', 'Gift'],
  Bills: ['Electricity', 'Internet', 'Mobile recharge', 'Water bill', 'Gas cylinder'],
  Entertainment: ['Netflix monthly', 'Movie ticket', 'Spotify Premium', 'Concert', 'PS5 game'],
  Health: ['Pharmacy', 'Doctor visit', 'Gym membership', 'Yoga class', 'Health supplements'],
  Education: ['Udemy course', 'Textbook', 'Coursera subscription', 'Workshop', 'Notebook'],
  Other: ['Donation', 'Repair', 'Stationery', 'Misc', 'Subscription'],
};

const randomFromArray = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomAmount = (min, max) =>
  Math.round((Math.random() * (max - min) + min) * 100) / 100;

const seed = async () => {
  await connectDB();

  console.log('⚠️  Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Expense.deleteMany({}),
    Budget.deleteMany({}),
    Income.deleteMany({}),
    SavingsGoal.deleteMany({}),
    RecurringExpense.deleteMany({}),
  ]);

  console.log('👤 Creating demo user...');
  const user = await User.create({
    name: 'Demo User',
    email: 'demo@financeflow.app',
    password: 'demo1234',
    currency: 'INR',
  });

  console.log('💸 Generating expenses for the last 3 months...');
  const now = new Date();
  const expenses = [];

  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const daysInMonth = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0
    ).getDate();

    // ~30 expenses per month
    for (let i = 0; i < 30; i++) {
      const category = randomFromArray(CATEGORIES);
      const day = Math.floor(Math.random() * daysInMonth) + 1;
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      const amountRange = {
        Food: [100, 1500],
        Travel: [50, 3000],
        Shopping: [200, 5000],
        Bills: [500, 4000],
        Entertainment: [150, 2000],
        Health: [100, 3000],
        Education: [200, 4000],
        Other: [50, 1500],
      }[category];
      expenses.push({
        user: user._id,
        amount: randomAmount(amountRange[0], amountRange[1]),
        category,
        date,
        description: randomFromArray(SAMPLE_DESCRIPTIONS[category]),
        paymentMethod: randomFromArray(['UPI', 'Card', 'Cash', 'NetBanking']),
      });
    }
  }
  await Expense.insertMany(expenses);
  console.log(`   → ${expenses.length} expenses inserted`);

  console.log('🎯 Creating budgets for the current month...');
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const budgetData = [
    { category: 'Food', monthlyLimit: 8000 },
    { category: 'Travel', monthlyLimit: 5000 },
    { category: 'Shopping', monthlyLimit: 6000 },
    { category: 'Bills', monthlyLimit: 7000 },
    { category: 'Entertainment', monthlyLimit: 3000 },
    { category: 'Health', monthlyLimit: 4000 },
    { category: 'Education', monthlyLimit: 5000 },
    { category: 'Other', monthlyLimit: 2000 },
  ];
  await Budget.insertMany(
    budgetData.map((b) => ({ ...b, user: user._id, month, year }))
  );
  console.log(`   → ${budgetData.length} budgets inserted`);

  console.log('💰 Generating income...');
  const incomes = [];
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    incomes.push({
      user: user._id,
      source: 'Salary',
      amount: 55000,
      description: 'Monthly salary',
      date,
    });
    if (Math.random() > 0.4) {
      incomes.push({
        user: user._id,
        source: 'Freelance',
        amount: randomAmount(3000, 12000),
        description: 'Freelance project',
        date: new Date(date.getFullYear(), date.getMonth(), 15),
      });
    }
  }
  await Income.insertMany(incomes);
  console.log(`   → ${incomes.length} income entries inserted`);

  console.log('🌱 Creating savings goals...');
  await SavingsGoal.insertMany([
    {
      user: user._id,
      title: 'New MacBook Air',
      targetAmount: 110000,
      savedAmount: 42000,
      targetDate: new Date(now.getFullYear() + 1, 2, 1),
      icon: '💻',
    },
    {
      user: user._id,
      title: 'Goa Trip',
      targetAmount: 25000,
      savedAmount: 18500,
      targetDate: new Date(now.getFullYear(), now.getMonth() + 3, 1),
      icon: '🏖️',
    },
  ]);

  console.log('🔁 Creating recurring expenses...');
  await RecurringExpense.insertMany([
    {
      user: user._id,
      title: 'Netflix',
      amount: 499,
      category: 'Entertainment',
      frequency: 'monthly',
      nextDueDate: new Date(now.getFullYear(), now.getMonth() + 1, 5),
    },
    {
      user: user._id,
      title: 'Spotify Premium',
      amount: 119,
      category: 'Entertainment',
      frequency: 'monthly',
      nextDueDate: new Date(now.getFullYear(), now.getMonth() + 1, 12),
    },
    {
      user: user._id,
      title: 'Apartment Rent',
      amount: 15000,
      category: 'Bills',
      frequency: 'monthly',
      nextDueDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
    },
  ]);

  console.log('');
  console.log('✅ Seed complete!');
  console.log('   Email:    demo@financeflow.app');
  console.log('   Password: demo1234');
  console.log('');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
