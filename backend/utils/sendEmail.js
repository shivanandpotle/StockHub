/**
 * Sends a low stock alert email to the business owner using SendGrid HTTPS API
 * This bypasses outbound SMTP port blocks (587/465) commonly found on free hosting tiers like Render.
 * @param {string} toEmail - Business owner's email address
 * @param {object} product - Product object containing name, quantity, minimumStock
 */
const sendLowStockEmail = async (toEmail, product) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('⚠️ SENDGRID_API_KEY is not set. Skipping low stock email alert.');
      return;
    }

    const payload = {
      personalizations: [
        {
          to: [{ email: toEmail }],
          subject: `🚨 Low Stock Alert: ${product.name}`,
        },
      ],
      from: { email: process.env.EMAIL_FROM || 'noreply@stockhub.com' },
      content: [
        {
          type: 'text/html',
          value: `
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
        },
      ],
    };

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`Low stock email alert sent via HTTPS to ${toEmail}.`);
    } else {
      const errorText = await response.text();
      console.error('SendGrid API Error:', response.status, errorText);
    }
  } catch (error) {
    console.error('Error sending low stock email over HTTPS:', error.message);
  }
};

module.exports = { sendLowStockEmail };
