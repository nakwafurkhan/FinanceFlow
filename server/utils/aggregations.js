/**
 * utils/aggregations.js
 * --------------------------------------------
 * Centralized MongoDB aggregation pipeline builders.
 *
 * Why a separate file?
 *   - Pipelines are reusable across controllers (analytics, insights, export).
 *   - One place to audit query performance / index coverage.
 *   - Easier to explain in viva — "all heavy lifting happens at the DB layer,
 *     not in JavaScript loops".
 *
 * Why aggregation over .find() + JS loops?
 *   - Runs inside MongoDB engine (C++), much faster than fetching docs.
 *   - Lets us $group / $sum / $project / $sort / $lookup in one round trip.
 *   - Scales: even with 100k expenses, group-by-category is sub-second.
 */

const mongoose = require('mongoose');

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

/**
 * Category-wise totals between two dates — powers the Pie Chart.
 */
const categoryBreakdownPipeline = (userId, start, end) => [
  {
    $match: {
      user: toObjectId(userId),
      date: { $gte: start, $lte: end },
    },
  },
  {
    $group: {
      _id: '$category',
      total: { $sum: '$amount' },
      count: { $sum: 1 },
    },
  },
  { $sort: { total: -1 } },
  {
    $project: {
      _id: 0,
      category: '$_id',
      total: 1,
      count: 1,
    },
  },
];

/**
 * Daily totals between two dates — powers the Line Chart (spending trend).
 */
const dailyTrendPipeline = (userId, start, end) => [
  {
    $match: {
      user: toObjectId(userId),
      date: { $gte: start, $lte: end },
    },
  },
  {
    $group: {
      _id: {
        $dateToString: { format: '%Y-%m-%d', date: '$date' },
      },
      total: { $sum: '$amount' },
    },
  },
  { $sort: { _id: 1 } },
  {
    $project: {
      _id: 0,
      date: '$_id',
      total: 1,
    },
  },
];

/**
 * Monthly totals for the last N months — powers the Bar Chart.
 */
const monthlyTrendPipeline = (userId, months = 6) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  return [
    {
      $match: {
        user: toObjectId(userId),
        date: { $gte: start },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        total: 1,
        count: 1,
      },
    },
  ];
};

/**
 * Whole-month total + count + avg-per-day — powers Dashboard stat cards.
 */
const monthlySummaryPipeline = (userId, year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999); // last day of month

  return [
    {
      $match: {
        user: toObjectId(userId),
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
        avgPerTransaction: { $avg: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        totalSpent: 1,
        transactionCount: 1,
        avgPerTransaction: { $round: ['$avgPerTransaction', 2] },
      },
    },
  ];
};

module.exports = {
  toObjectId,
  categoryBreakdownPipeline,
  dailyTrendPipeline,
  monthlyTrendPipeline,
  monthlySummaryPipeline,
};
