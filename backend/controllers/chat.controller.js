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

    // 2. Call Groq / xAI API (if configured)
    const grokKey = process.env.GROK_API_KEY || process.env.GROQ_API_KEY;
    if (grokKey) {
      try {
        const isGroq = grokKey.startsWith('gsk_');
        const baseUrl = isGroq ? 'https://api.groq.com/openai/v1' : 'https://api.x.ai/v1';
        const aiName = isGroq ? 'Groq' : 'Grok (xAI)';
        
        console.log(`Fetching available ${aiName} models...`);
        const modelsRes = await fetch(`${baseUrl}/models`, {
          headers: { 'Authorization': `Bearer ${grokKey}` }
        });
        const modelsData = await modelsRes.json();
        const models = modelsData.data || [];
        
        for (const m of models) {
          try {
            console.log(`Trying ${aiName} model: ${m.id}`);
            const response = await fetch(`${baseUrl}/chat/completions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${grokKey}`
              },
              body: JSON.stringify({
                model: m.id,
                messages: [
                  { role: 'system', content: inventoryContext },
                  { role: 'user', content: message }
                ]
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              const text = data.choices[0].message.content;
              console.log(`Success with ${aiName} model: ${m.id}`);
              return res.json({ reply: text });
            }
          } catch (e) {
            // Silently ignore and try next
          }
        }
        
        throw new Error(`No available ${aiName} models worked.`);
      } catch (grokError) {
        console.error('Groq/xAI API Error:', grokError.message);
        return res.json({ reply: "I am the StockHub AI Assistant! (Note: API encountered an error. Please check your API key)." });
      }
    }
    // 3. Call Gemini API (if configured as fallback)
    else if (process.env.GEMINI_API_KEY) {
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
        
        // If the model was not found, try to dynamically fetch available models
        // If the initial model fails, dynamically test available models until one succeeds
        try {
          console.log("Attempting dynamic model discovery due to API error...");
          const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
          const modelsData = await modelsRes.json();
          const models = modelsData.models || [];
          
          for (const m of models) {
            if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
              try {
                const safeModelName = m.name.replace('models/', '');
                console.log(`Trying fallback model: ${safeModelName}`);
                const fallbackModel = genAI.getGenerativeModel({ model: safeModelName });
                const result = await fallbackModel.generateContent(prompt);
                const replyText = await result.response.text();
                console.log(`Success with fallback model: ${safeModelName}`);
                return res.json({ reply: replyText });
              } catch (e) {
                // Silently fail and try the next model
              }
            }
          }
          console.error("All fallback models failed (likely due to 0 quota limits).");
        } catch (fallbackError) {
          console.error('Fallback model discovery failed:', fallbackError.message);
        }
        
        // If Gemini completely fails (region block, invalid key, etc), fallback to basic response
        console.warn("⚠️ Gemini API completely failed. Falling back to basic mock response.");
        
        let reply = "I am the StockHub AI Assistant! (Note: Gemini API is currently unavailable in your region or your key is invalid, so this is a basic automated response). \n\n";
        
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('low stock')) {
          reply += `You currently have ${lowStockItems.length} low stock items.`;
        } else if (lowerMsg.includes('value') || lowerMsg.includes('worth')) {
          reply += `Your total inventory value is $${totalValue.toFixed(2)}.`;
        } else if (lowerMsg.includes('total') || lowerMsg.includes('how many') || lowerMsg.includes('stock')) {
          reply += `You have a total of ${totalProducts} products in your inventory.`;
        } else {
          reply += "How can I help you manage your inventory today?";
        }
        
        return res.json({ reply });
      }
    } else {
      // 3. Fallback Mock Response (if no API key is provided yet)
      console.warn("⚠️ No GEMINI_API_KEY found. Returning mock chatbot response.");
      
      let reply = "I am the StockHub AI Assistant! (Note: Gemini API Key is missing, so this is a mock response). \n\n";
      
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('low stock')) {
        reply += `You currently have ${lowStockItems.length} low stock items.`;
      } else if (lowerMsg.includes('value') || lowerMsg.includes('worth')) {
        reply += `Your total inventory value is $${totalValue.toFixed(2)}.`;
      } else if (lowerMsg.includes('total') || lowerMsg.includes('how many') || lowerMsg.includes('stock')) {
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
