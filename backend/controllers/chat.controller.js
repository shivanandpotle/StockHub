const Product = require('../models/Product');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // 1. Gather Inventory Context
    const filter = req.user.role === 'super_admin' ? {} : { businessId: req.user._id };
    
    // Get total products & value
    const products = await Product.find(filter).populate('categoryId', 'name');
    const totalProducts = products.length;
    
    let totalValue = 0;
    const lowStockItems = [];
    const outOfStockItems = [];
    
    products.forEach(p => {
      totalValue += (p.quantity * p.buyingPrice);
      if (p.quantity === 0) outOfStockItems.push(p.name);
      else if (p.quantity <= p.minimumStock) lowStockItems.push(p.name);
    });

    const inventoryContext = `
      You are an AI Inventory Assistant for the StockHub application.
      Current Business Info:
      - Total Products: ${totalProducts}
      - Total Inventory Value: $${totalValue.toFixed(2)}
      - Low Stock Items: ${lowStockItems.length > 0 ? lowStockItems.join(', ') : 'None'}
      - Out of Stock Items: ${outOfStockItems.length > 0 ? outOfStockItems.join(', ') : 'None'}
      
      User's role: ${req.user.role}
      
      Instructions: Answer the user's questions about their inventory concisely and professionally. If they ask something unrelated to inventory or the business, politely redirect them. Do not format your response with markdown code blocks unless it's code. Keep responses conversational and under 3 paragraphs.
    `;

    // 2. Call Gemini API (if configured)
    if (process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `${inventoryContext}\n\nUser Question: ${message}\n\nAI Response:`;
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return res.json({ reply: text });
      } catch (geminiError) {
        console.error('Gemini Initial API Error:', geminiError.message);
        
        // If the model was not found, try to dynamically fetch available models and use the first one
        if (geminiError.message.includes('404')) {
          try {
            console.log("Attempting dynamic model discovery...");
            const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
            const modelsData = await modelsRes.json();
            const models = modelsData.models || [];
            
            // Find any gemini model that supports generateContent
            const validModel = models.find(m => 
              m.name.includes('gemini') && 
              m.supportedGenerationMethods && 
              m.supportedGenerationMethods.includes('generateContent')
            );
            
            if (validModel) {
              const safeModelName = validModel.name.replace('models/', '');
              console.log("Dynamically selected model:", safeModelName);
              const fallbackModel = genAI.getGenerativeModel({ model: safeModelName });
              const result = await fallbackModel.generateContent(prompt);
              return res.json({ reply: (await result.response).text() });
            }
          } catch (fallbackError) {
            console.error('Fallback model discovery failed:', fallbackError.message);
          }
        }
        
        // If all else fails
        let errorMessage = "I'm having trouble thinking right now. Please check if my Gemini API key is valid!";
        if (geminiError.message.includes('API key not valid')) {
          errorMessage = "Your Gemini API key is invalid. Please generate a new one from Google AI Studio (aistudio.google.com).";
        } else {
          errorMessage = "My Gemini API is encountering a region or permissions error. I couldn't find any available AI models for your API key!";
        }
        
        return res.json({ reply: errorMessage });
      }
    } else {
      // 3. Fallback Mock Response (if no API key is provided yet)
      console.warn("⚠️ No GEMINI_API_KEY found. Returning mock chatbot response.");
      
      let reply = "I am the StockHub AI Assistant! (Note: Gemini API Key is missing, so this is a mock response). ";
      
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('low stock')) {
        reply += `You currently have ${lowStockItems.length} low stock items.`;
      } else if (lowerMsg.includes('value')) {
        reply += `Your total inventory value is $${totalValue.toFixed(2)}.`;
      } else if (lowerMsg.includes('total') || lowerMsg.includes('how many')) {
        reply += `You have a total of ${totalProducts} products in your inventory.`;
      } else {
        reply += "How can I help you manage your inventory today?";
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.json({ reply });
    }
    
  } catch (error) {
    console.error('handleChat error:', error.message);
    res.status(500).json({ message: 'Error processing chat request' });
  }
};

module.exports = { handleChat };
