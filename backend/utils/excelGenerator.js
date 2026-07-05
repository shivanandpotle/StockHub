const ExcelJS = require('exceljs');

const HEADER_STYLE = {
  font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } },
  alignment: { horizontal: 'center', vertical: 'middle' },
  border: {
    top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  },
};

const DATA_STYLE = {
  border: {
    top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  },
};

const CURRENCY_FORMAT = '$#,##0.00';

/**
 * Style a worksheet header row and set auto-width
 */
function styleSheet(worksheet) {
  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = HEADER_STYLE.font;
    cell.fill = HEADER_STYLE.fill;
    cell.alignment = HEADER_STYLE.alignment;
    cell.border = HEADER_STYLE.border;
  });
  headerRow.height = 25;

  // Auto-width columns
  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellLength = cell.value ? cell.value.toString().length : 10;
      if (cellLength > maxLength) maxLength = cellLength;
    });
    column.width = Math.min(Math.max(maxLength + 4, 12), 40);
  });

  // Style data rows with alternating colors
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.eachCell((cell) => {
        cell.border = DATA_STYLE.border;
        cell.alignment = { vertical: 'middle' };
      });
      if (rowNumber % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4FF' } };
        });
      }
    }
  });
}

/**
 * Generate Inventory Summary Excel
 */
const generateInventorySummaryExcel = async (products, transactions, lowStockProducts, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'StockHub';
    workbook.created = new Date();

    // Sheet 1: Inventory Summary
    const summarySheet = workbook.addWorksheet('Inventory Summary');
    summarySheet.columns = [
      { header: 'Product Name', key: 'name' },
      { header: 'Category', key: 'category' },
      { header: 'SKU', key: 'sku' },
      { header: 'Quantity', key: 'quantity' },
      { header: 'Buying Price', key: 'buyingPrice' },
      { header: 'Selling Price', key: 'sellingPrice' },
      { header: 'Total Value', key: 'totalValue' },
    ];

    products.forEach((p) => {
      summarySheet.addRow({
        name: p.name,
        category: p.categoryId?.name || 'N/A',
        sku: p.sku,
        quantity: p.quantity,
        buyingPrice: p.buyingPrice,
        sellingPrice: p.sellingPrice,
        totalValue: p.quantity * p.buyingPrice,
      });
    });

    // Apply currency format
    summarySheet.getColumn('buyingPrice').numFmt = CURRENCY_FORMAT;
    summarySheet.getColumn('sellingPrice').numFmt = CURRENCY_FORMAT;
    summarySheet.getColumn('totalValue').numFmt = CURRENCY_FORMAT;
    styleSheet(summarySheet);

    // Sheet 2: Stock Movement
    const movementSheet = workbook.addWorksheet('Stock Movement');
    movementSheet.columns = [
      { header: 'Date', key: 'date' },
      { header: 'Product', key: 'product' },
      { header: 'Type', key: 'type' },
      { header: 'Quantity', key: 'quantity' },
      { header: 'Reason', key: 'reason' },
    ];

    transactions.forEach((t) => {
      movementSheet.addRow({
        date: new Date(t.createdAt).toLocaleDateString(),
        product: t.productId?.name || 'N/A',
        type: t.type,
        quantity: t.quantity,
        reason: t.reason || 'N/A',
      });
    });
    styleSheet(movementSheet);

    // Sheet 3: Low Stock Products
    const lowStockSheet = workbook.addWorksheet('Low Stock Products');
    lowStockSheet.columns = [
      { header: 'Product', key: 'name' },
      { header: 'Available Stock', key: 'available' },
      { header: 'Minimum Stock', key: 'minimum' },
      { header: 'Status', key: 'status' },
    ];

    lowStockProducts.forEach((p) => {
      lowStockSheet.addRow({
        name: p.name,
        available: p.quantity,
        minimum: p.minimumStock,
        status: p.quantity === 0 ? 'Out of Stock' : 'Low Stock',
      });
    });
    styleSheet(lowStockSheet);

    // Stream to response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory-summary.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Excel generation error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error generating Excel file' });
    }
  }
};

/**
 * Generate Monthly Report Excel
 */
const generateMonthlyReportExcel = async (data, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'StockHub';

    const sheet = workbook.addWorksheet('Monthly Report');
    sheet.columns = [
      { header: 'Date', key: 'date' },
      { header: 'Product', key: 'product' },
      { header: 'Type', key: 'type' },
      { header: 'Quantity', key: 'quantity' },
      { header: 'Previous Qty', key: 'previousQuantity' },
      { header: 'Updated Qty', key: 'updatedQuantity' },
      { header: 'Reason', key: 'reason' },
    ];

    data.forEach((t) => {
      sheet.addRow({
        date: new Date(t.createdAt).toLocaleDateString(),
        product: t.productId?.name || 'N/A',
        type: t.type,
        quantity: t.quantity,
        previousQuantity: t.previousQuantity || 0,
        updatedQuantity: t.updatedQuantity || 0,
        reason: t.reason || 'N/A',
      });
    });
    styleSheet(sheet);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=monthly-report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Monthly Excel error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error generating monthly Excel' });
    }
  }
};

/**
 * Generate Yearly Report Excel
 */
const generateYearlyReportExcel = async (data, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'StockHub';

    const sheet = workbook.addWorksheet('Yearly Report');
    sheet.columns = [
      { header: 'Month', key: 'month' },
      { header: 'Stock In', key: 'stockIn' },
      { header: 'Stock Out', key: 'stockOut' },
      { header: 'Net Change', key: 'netChange' },
    ];

    data.forEach((d) => {
      sheet.addRow({
        month: d.month,
        stockIn: d.stockIn,
        stockOut: d.stockOut,
        netChange: d.stockIn - d.stockOut,
      });
    });
    styleSheet(sheet);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=yearly-report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Yearly Excel error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error generating yearly Excel' });
    }
  }
};

/**
 * Generate Low Stock Excel
 */
const generateLowStockExcel = async (products, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'StockHub';

    const sheet = workbook.addWorksheet('Low Stock Products');
    sheet.columns = [
      { header: 'Product Name', key: 'name' },
      { header: 'Category', key: 'category' },
      { header: 'SKU', key: 'sku' },
      { header: 'Available Stock', key: 'available' },
      { header: 'Minimum Stock', key: 'minimum' },
      { header: 'Buying Price', key: 'buyingPrice' },
      { header: 'Selling Price', key: 'sellingPrice' },
      { header: 'Status', key: 'status' },
    ];

    products.forEach((p) => {
      sheet.addRow({
        name: p.name,
        category: p.categoryId?.name || 'N/A',
        sku: p.sku,
        available: p.quantity,
        minimum: p.minimumStock,
        buyingPrice: p.buyingPrice,
        sellingPrice: p.sellingPrice,
        status: p.quantity === 0 ? 'Out of Stock' : 'Low Stock',
      });
    });

    sheet.getColumn('buyingPrice').numFmt = CURRENCY_FORMAT;
    sheet.getColumn('sellingPrice').numFmt = CURRENCY_FORMAT;
    styleSheet(sheet);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=low-stock-report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Low stock Excel error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error generating low stock Excel' });
    }
  }
};

module.exports = {
  generateInventorySummaryExcel,
  generateMonthlyReportExcel,
  generateYearlyReportExcel,
  generateLowStockExcel,
};
