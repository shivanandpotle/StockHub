require('dotenv').config();
const { sendLowStockEmail } = require('./utils/sendEmail');

async function testEmail() {
  try {
    console.log("Testing SendGrid Email...");
    await sendLowStockEmail(process.env.EMAIL_FROM || 'noreply@stockhub.com', {
      name: 'Test Product (SendGrid API Test)',
      quantity: 2,
      minimumStock: 10
    });
    console.log("✅ Process completed.");
  } catch (error) {
    console.error("❌ SendGrid error:", error);
  }
}

testEmail();
