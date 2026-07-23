const nodemailer = require('nodemailer');

/**
 * Configure the SendGrid SMTP transport
 * For SendGrid, user is always 'apikey' and pass is the actual API Key.
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587, // or 465 for secure
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});

/**
 * Sends a low stock alert email to the business owner
 * @param {string} toEmail - Business owner's email address
 * @param {object} product - Product object containing name, quantity, minimumStock
 */
const sendLowStockEmail = async (toEmail, product) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('⚠️ SENDGRID_API_KEY is not set. Skipping low stock email alert.');
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@stockhub.com',
      to: toEmail,
      subject: `🚨 Low Stock Alert: ${product.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #ef476f; text-align: center;">Low Stock Alert</h2>
          <p>Hello,</p>
          <p>This is an automated alert from StockHub to inform you that a product in your inventory has dropped to or below its minimum required stock level.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Product Name:</strong> ${product.name}</p>
            <p><strong>Current Quantity:</strong> <span style="color: #ef476f; font-weight: bold;">${product.quantity}</span></p>
            <p><strong>Minimum Required:</strong> ${product.minimumStock}</p>
          </div>
          
          <p>Please log in to your StockHub dashboard to restock this item soon to avoid running out.</p>
          <p>Best regards,<br/><strong>StockHub Automated System</strong></p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Low stock email alert sent to ${toEmail}. MessageId: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending low stock email:', error.message);
  }
};

module.exports = { sendLowStockEmail };
