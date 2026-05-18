/**
 * controllers/exportController.js
 * --------------------------------------------
 * Export the user's expenses as CSV (for Excel/Google Sheets) or
 * PDF (for printing or attaching to reports).
 *
 * We stream the PDF using pdfkit; CSV is generated via json2csv.
 */

const asyncHandler = require('express-async-handler');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const Expense = require('../models/Expense');

const fetchExpenses = async (userId, { startDate, endDate } = {}) => {
  const filter = { user: userId };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  return Expense.find(filter).sort({ date: -1 }).lean();
};

const exportCSV = asyncHandler(async (req, res) => {
  const expenses = await fetchExpenses(req.user._id, req.query);
  const fields = ['date', 'category', 'amount', 'description', 'paymentMethod'];
  const parser = new Parser({ fields });
  const csv = parser.parse(
    expenses.map((e) => ({
      date: new Date(e.date).toISOString().split('T')[0],
      category: e.category,
      amount: e.amount,
      description: e.description || '',
      paymentMethod: e.paymentMethod,
    }))
  );
  res.header('Content-Type', 'text/csv');
  res.attachment(`financeflow-expenses-${Date.now()}.csv`);
  return res.send(csv);
});

const exportPDF = asyncHandler(async (req, res) => {
  const expenses = await fetchExpenses(req.user._id, req.query);
  const doc = new PDFDocument({ margin: 50 });
  res.header('Content-Type', 'application/pdf');
  res.attachment(`financeflow-report-${Date.now()}.pdf`);
  doc.pipe(res);

  // Header
  doc.fontSize(22).text('FinanceFlow — Expense Report', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor('#666').text(
    `User: ${req.user.name}    Generated: ${new Date().toLocaleString()}`,
    { align: 'center' }
  );
  doc.moveDown(1);
  doc.fillColor('#000');

  // Table header
  doc.fontSize(11).text('Date', 50, doc.y, { continued: true, width: 90 });
  doc.text('Category', { continued: true, width: 100 });
  doc.text('Amount', { continued: true, width: 80 });
  doc.text('Method', { continued: true, width: 70 });
  doc.text('Description');
  doc.moveTo(50, doc.y + 2).lineTo(550, doc.y + 2).stroke();
  doc.moveDown(0.5);

  let total = 0;
  expenses.forEach((e) => {
    total += e.amount;
    doc.fontSize(10).text(new Date(e.date).toISOString().split('T')[0], {
      continued: true,
      width: 90,
    });
    doc.text(e.category, { continued: true, width: 100 });
    doc.text(`₹ ${e.amount}`, { continued: true, width: 80 });
    doc.text(e.paymentMethod || '-', { continued: true, width: 70 });
    doc.text(e.description || '-');
  });

  doc.moveDown(1).fontSize(12).text(`Total: ₹ ${total}`, { align: 'right' });
  doc.end();
});

module.exports = { exportCSV, exportPDF };
