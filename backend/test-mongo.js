const mongoose = require('mongoose');

async function testConnection(uri) {
  try {
    console.log(`Testing: ${uri.replace(/:([^:@]+)@/, ':<hidden>@')}`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Success!");
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.log("❌ Failed: " + err.message);
    return false;
  }
}

async function run() {
  const uris = [
    "mongodb+srv://StockHub:Mayuresh%40123@cluster0.mom2fmj.mongodb.net/stockhub?appName=Cluster0",
    "mongodb+srv://StockHub:Mayuresh%40123@cluster0.mom2fmj.mongodb.net/stockhub?appName=Cluster0&authSource=admin",
    "mongodb+srv://StockHub%40admin:Mayuresh%40123@cluster0.mom2fmj.mongodb.net/stockhub?appName=Cluster0",
    "mongodb+srv://StockHub%40admin:Mayuresh%40123@cluster0.mom2fmj.mongodb.net/stockhub?appName=Cluster0&authSource=admin",
    "mongodb+srv://StockHub:Mayuresh123@cluster0.mom2fmj.mongodb.net/stockhub?appName=Cluster0"
  ];
  
  for (const uri of uris) {
    const success = await testConnection(uri);
    if (success) {
      console.log("\nFOUND CORRECT URI!");
      process.exit(0);
    }
  }
}

run();
