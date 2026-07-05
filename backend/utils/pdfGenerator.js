const PDFDocument = require('pdfkit-table');

const COLORS = {
  primary: '#1a56db',
  headerBg: '#1e40af',
  headerText: '#ffffff',
  altRow: '#f0f4ff',
  text: '#1f2937',
  lightText: '#6b7280',
  border: '#e5e7eb',
  success: '#059669',
  danger: '#dc2626',
  warning: '#d97706',
};

/**
 * Add a styled header to the PDF document
 */
function addHeader(doc, title, subtitle) {
  doc.fontSize(24).fillColor(COLORS.primary).text('StockHub', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(16).fillColor(COLORS.text).text(title, { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor(COLORS.lightText).text(subtitle || `Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });
  doc.moveDown(0.3);

  // Horizontal line
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor(COLORS.border).lineWidth(1).stroke();
  doc.moveDown(1);
}

/**
 * Add summary stats section
 */
function addSummarySection(doc, stats) {
  doc.fontSize(14).fillColor(COLORS.primary).text('Summary', { underline: true });
  doc.moveDown(0.5);

  stats.forEach(({ label, value }) => {
    doc.fontSize(10).fillColor(COLORS.lightText).text(label, { continued: true });
    doc.fillColor(COLORS.text).text(`  ${value}`);
    doc.moveDown(0.2);
  });

  doc.moveDown(1);
}

/**
 * Generate Inventory Summary PDF
 */
const generateInventorySummaryPDF = async (products, stats, res) => {
  try {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory-summary.pdf');

    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
    doc.pipe(res);

    addHeader(doc, 'Inventory Summary Report');

    // Summary stats
    addSummarySection(doc, [
      { label: 'Total Products:', value: stats.totalProducts },
      { label: 'Total Inventory Value:', value: `$${stats.totalInventoryValue.toLocaleString()}` },
      { label: 'Expected Profit:', value: `$${stats.expectedProfit.toLocaleString()}` },
    ]);

    // Products table
    const tableData = {
      headers: [
        { label: 'Product Name', property: 'name', width: 120 },
        { label: 'SKU', property: 'sku', width: 80 },
        { label: 'Category', property: 'category', width: 90 },
        { label: 'Qty', property: 'quantity', width: 50 },
        { label: 'Buying Price', property: 'buyingPrice', width: 80 },
        { label: 'Selling Price', property: 'sellingPrice', width: 80 },
        { label: 'Total Value', property: 'totalValue', width: 90 },
        { label: 'Status', property: 'status', width: 80 },
      ],
      rows: products.map((p) => [
        p.name,
        p.sku,
        p.categoryId?.name || 'N/A',
        p.quantity.toString(),
        `$${p.buyingPrice.toFixed(2)}`,
        `$${p.sellingPrice.toFixed(2)}`,
        `$${(p.quantity * p.buyingPrice).toFixed(2)}`,
        p.quantity === 0 ? 'Out of Stock' : p.quantity <= p.minimumStock ? 'Low Stock' : 'In Stock',
      ]),
    };

    await doc.table(tableData, {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.headerText),
      prepareRow: (row, indexColumn, indexRow) => {
        doc.font('Helvetica').fontSize(8).fillColor(COLORS.text);
        return doc;
      },
      headerColor: COLORS.headerBg,
      alternateRowColor: COLORS.altRow,
    });

    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error generating PDF' });
    }
  }
};

/**
 * Generate Monthly Report PDF
 */
const generateMonthlyReportPDF = async (data, month, year, res) => {
  try {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=monthly-report-${month}-${year}.pdf`);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(res);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[month - 1] || 'Unknown';

    addHeader(doc, `Monthly Report - ${monthName} ${year}`);

    // Summary
    const totalIn = data.reduce((sum, t) => t.type === 'IN' ? sum + t.quantity : sum, 0);
    const totalOut = data.reduce((sum, t) => t.type === 'OUT' ? sum + t.quantity : sum, 0);

    addSummarySection(doc, [
      { label: 'Total Stock In:', value: totalIn },
      { label: 'Total Stock Out:', value: totalOut },
      { label: 'Net Change:', value: totalIn - totalOut },
      { label: 'Total Transactions:', value: data.length },
    ]);

    // Transactions table
    const tableData = {
      headers: [
        { label: 'Date', property: 'date', width: 100 },
        { label: 'Product', property: 'product', width: 150 },
        { label: 'Type', property: 'type', width: 60 },
        { label: 'Quantity', property: 'quantity', width: 70 },
        { label: 'Reason', property: 'reason', width: 150 },
      ],
      rows: data.map((t) => [
        new Date(t.createdAt).toLocaleDateString(),
        t.productId?.name || 'N/A',
        t.type,
        t.quantity.toString(),
        t.reason || 'N/A',
      ]),
    };

    await doc.table(tableData, {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.headerText),
      prepareRow: () => doc.font('Helvetica').fontSize(8).fillColor(COLORS.text),
      headerColor: COLORS.headerBg,
      alternateRowColor: COLORS.altRow,
    });

    doc.end();
  } catch (error) {
    console.error('Monthly PDF error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error generating monthly PDF' });
    }
  }
};

/**
 * Generate Yearly Report PDF
 */
const generateYearlyReportPDF = async (data, year, res) => {
  try {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=yearly-report-${year}.pdf`);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(res);

    addHeader(doc, `Yearly Report - ${year}`);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    // Summary
    const totalIn = data.reduce((sum, d) => sum + d.stockIn, 0);
    const totalOut = data.reduce((sum, d) => sum + d.stockOut, 0);

    addSummarySection(doc, [
      { label: 'Year:', value: year },
      { label: 'Total Stock In:', value: totalIn },
      { label: 'Total Stock Out:', value: totalOut },
      { label: 'Net Stock Change:', value: totalIn - totalOut },
    ]);

    // Monthly breakdown table
    const tableData = {
      headers: [
        { label: 'Month', property: 'month', width: 150 },
        { label: 'Stock In', property: 'stockIn', width: 100 },
        { label: 'Stock Out', property: 'stockOut', width: 100 },
        { label: 'Net Change', property: 'netChange', width: 100 },
      ],
      rows: data.map((d) => [
        d.month,
        d.stockIn.toString(),
        d.stockOut.toString(),
        (d.stockIn - d.stockOut).toString(),
      ]),
    };

    await doc.table(tableData, {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.headerText),
      prepareRow: () => doc.font('Helvetica').fontSize(8).fillColor(COLORS.text),
      headerColor: COLORS.headerBg,
      alternateRowColor: COLORS.altRow,
    });

    doc.end();
  } catch (error) {
    console.error('Yearly PDF error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error generating yearly PDF' });
    }
  }
};

/**
 * Generate Low Stock Report PDF
 */
const generateLowStockPDF = async (products, res) => {
  try {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=low-stock-report.pdf');

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(res);

    addHeader(doc, 'Low Stock Alert Report');

    addSummarySection(doc, [
      { label: 'Total Low Stock Items:', value: products.filter((p) => p.quantity > 0 && p.quantity <= p.minimumStock).length },
      { label: 'Out of Stock Items:', value: products.filter((p) => p.quantity === 0).length },
      { label: 'Total Items Requiring Attention:', value: products.length },
    ]);

    const tableData = {
      headers: [
        { label: 'Product Name', property: 'name', width: 150 },
        { label: 'Available Stock', property: 'available', width: 90 },
        { label: 'Minimum Stock', property: 'minimum', width: 90 },
        { label: 'Category', property: 'category', width: 100 },
        { label: 'Status', property: 'status', width: 90 },
      ],
      rows: products.map((p) => [
        p.name,
        p.quantity.toString(),
        p.minimumStock.toString(),
        p.categoryId?.name || 'N/A',
        p.quantity === 0 ? 'OUT OF STOCK' : 'LOW STOCK',
      ]),
    };

    await doc.table(tableData, {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.headerText),
      prepareRow: () => doc.font('Helvetica').fontSize(8).fillColor(COLORS.text),
      headerColor: COLORS.headerBg,
      alternateRowColor: COLORS.altRow,
    });

    doc.end();
  } catch (error) {
    console.error('Low stock PDF error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error generating low stock PDF' });
    }
  }
};

module.exports = {
  generateInventorySummaryPDF,
  generateMonthlyReportPDF,
  generateYearlyReportPDF,
  generateLowStockPDF,
};
