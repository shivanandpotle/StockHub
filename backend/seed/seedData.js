const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const Report = require('../models/Report');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear all collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await InventoryTransaction.deleteMany({});
    await Report.deleteMany({});
    console.log('All collections cleared.');

    // ==================== USERS ====================
    const users = await User.create([
      {
        name: 'John Smith',
        email: 'john@stockhub.com',
        password: 'password123',
        businessName: 'Smith Electronics',
        role: 'business_owner',
      },
      {
        name: 'Admin User',
        email: 'admin@stockhub.com',
        password: 'admin123',
        businessName: 'StockHub Admin',
        role: 'super_admin',
      },
    ]);

    const john = users[0];
    const admin = users[1];
    console.log(`✓ Created ${users.length} users`);

    // ==================== CATEGORIES ====================
    const categoryData = [
      { businessId: john._id, name: 'Electronics', description: 'Electronic devices, accessories, and gadgets' },
      { businessId: john._id, name: 'Clothing', description: 'Apparel, footwear, and fashion accessories' },
      { businessId: john._id, name: 'Food & Beverages', description: 'Consumable food items and drinks' },
      { businessId: john._id, name: 'Home & Garden', description: 'Home decor, garden tools, and household items' },
      { businessId: john._id, name: 'Sports & Fitness', description: 'Sports equipment and fitness accessories' },
    ];

    const categories = await Category.create(categoryData);
    console.log(`✓ Created ${categories.length} categories`);

    const catMap = {};
    categories.forEach((c) => { catMap[c.name] = c._id; });

    // ==================== PRODUCTS ====================
    const productData = [
      // Electronics (10 items)
      { businessId: john._id, name: 'iPhone 15 Case', sku: 'ELEC-001', categoryId: catMap['Electronics'], quantity: 250, minimumStock: 10, buyingPrice: 8, sellingPrice: 14.99 },
      { businessId: john._id, name: 'Samsung Charger', sku: 'ELEC-002', categoryId: catMap['Electronics'], quantity: 180, minimumStock: 10, buyingPrice: 12, sellingPrice: 21.99 },
      { businessId: john._id, name: 'Wireless Keyboard', sku: 'ELEC-003', categoryId: catMap['Electronics'], quantity: 75, minimumStock: 10, buyingPrice: 25, sellingPrice: 44.99 },
      { businessId: john._id, name: 'USB-C Hub', sku: 'ELEC-004', categoryId: catMap['Electronics'], quantity: 120, minimumStock: 10, buyingPrice: 18, sellingPrice: 32.99 },
      { businessId: john._id, name: 'Bluetooth Speaker', sku: 'ELEC-005', categoryId: catMap['Electronics'], quantity: 8, minimumStock: 10, buyingPrice: 35, sellingPrice: 59.99 },
      { businessId: john._id, name: 'Gaming Mouse', sku: 'ELEC-006', categoryId: catMap['Electronics'], quantity: 200, minimumStock: 10, buyingPrice: 22, sellingPrice: 39.99 },
      { businessId: john._id, name: 'Laptop Stand', sku: 'ELEC-007', categoryId: catMap['Electronics'], quantity: 5, minimumStock: 10, buyingPrice: 30, sellingPrice: 49.99 },
      { businessId: john._id, name: 'HDMI Cable', sku: 'ELEC-008', categoryId: catMap['Electronics'], quantity: 350, minimumStock: 10, buyingPrice: 5, sellingPrice: 11.99 },
      { businessId: john._id, name: 'Power Bank', sku: 'ELEC-009', categoryId: catMap['Electronics'], quantity: 0, minimumStock: 10, buyingPrice: 20, sellingPrice: 35.99 },
      { businessId: john._id, name: 'Webcam HD', sku: 'ELEC-010', categoryId: catMap['Electronics'], quantity: 45, minimumStock: 10, buyingPrice: 40, sellingPrice: 69.99 },

      // Clothing (5 items)
      { businessId: john._id, name: "Men's T-Shirt", sku: 'CLTH-001', categoryId: catMap['Clothing'], quantity: 400, minimumStock: 10, buyingPrice: 8, sellingPrice: 19.99 },
      { businessId: john._id, name: "Women's Jacket", sku: 'CLTH-002', categoryId: catMap['Clothing'], quantity: 60, minimumStock: 10, buyingPrice: 45, sellingPrice: 79.99 },
      { businessId: john._id, name: 'Running Shoes', sku: 'CLTH-003', categoryId: catMap['Clothing'], quantity: 7, minimumStock: 10, buyingPrice: 55, sellingPrice: 89.99 },
      { businessId: john._id, name: 'Baseball Cap', sku: 'CLTH-004', categoryId: catMap['Clothing'], quantity: 150, minimumStock: 10, buyingPrice: 10, sellingPrice: 22.99 },
      { businessId: john._id, name: 'Leather Belt', sku: 'CLTH-005', categoryId: catMap['Clothing'], quantity: 0, minimumStock: 10, buyingPrice: 15, sellingPrice: 29.99 },

      // Food & Beverages (5 items)
      { businessId: john._id, name: 'Organic Coffee Beans', sku: 'FOOD-001', categoryId: catMap['Food & Beverages'], quantity: 300, minimumStock: 10, buyingPrice: 12, sellingPrice: 22.99 },
      { businessId: john._id, name: 'Green Tea Pack', sku: 'FOOD-002', categoryId: catMap['Food & Beverages'], quantity: 220, minimumStock: 10, buyingPrice: 6, sellingPrice: 12.99 },
      { businessId: john._id, name: 'Protein Bars', sku: 'FOOD-003', categoryId: catMap['Food & Beverages'], quantity: 9, minimumStock: 10, buyingPrice: 15, sellingPrice: 24.99 },
      { businessId: john._id, name: 'Energy Drink Mix', sku: 'FOOD-004', categoryId: catMap['Food & Beverages'], quantity: 100, minimumStock: 10, buyingPrice: 8, sellingPrice: 16.99 },
      { businessId: john._id, name: 'Dried Fruit Pack', sku: 'FOOD-005', categoryId: catMap['Food & Beverages'], quantity: 175, minimumStock: 10, buyingPrice: 7, sellingPrice: 14.99 },

      // Home & Garden (5 items)
      { businessId: john._id, name: 'LED Desk Lamp', sku: 'HOME-001', categoryId: catMap['Home & Garden'], quantity: 90, minimumStock: 10, buyingPrice: 25, sellingPrice: 44.99 },
      { businessId: john._id, name: 'Plant Pot Set', sku: 'HOME-002', categoryId: catMap['Home & Garden'], quantity: 6, minimumStock: 10, buyingPrice: 18, sellingPrice: 34.99 },
      { businessId: john._id, name: 'Kitchen Timer', sku: 'HOME-003', categoryId: catMap['Home & Garden'], quantity: 130, minimumStock: 10, buyingPrice: 10, sellingPrice: 19.99 },
      { businessId: john._id, name: 'Scented Candles', sku: 'HOME-004', categoryId: catMap['Home & Garden'], quantity: 0, minimumStock: 10, buyingPrice: 12, sellingPrice: 24.99 },
      { businessId: john._id, name: 'Tool Kit', sku: 'HOME-005', categoryId: catMap['Home & Garden'], quantity: 55, minimumStock: 10, buyingPrice: 35, sellingPrice: 59.99 },

      // Sports & Fitness (5 items)
      { businessId: john._id, name: 'Yoga Mat', sku: 'SPRT-001', categoryId: catMap['Sports & Fitness'], quantity: 140, minimumStock: 10, buyingPrice: 20, sellingPrice: 34.99 },
      { businessId: john._id, name: 'Resistance Bands', sku: 'SPRT-002', categoryId: catMap['Sports & Fitness'], quantity: 200, minimumStock: 10, buyingPrice: 8, sellingPrice: 16.99 },
      { businessId: john._id, name: 'Water Bottle', sku: 'SPRT-003', categoryId: catMap['Sports & Fitness'], quantity: 3, minimumStock: 10, buyingPrice: 10, sellingPrice: 19.99 },
      { businessId: john._id, name: 'Jump Rope', sku: 'SPRT-004', categoryId: catMap['Sports & Fitness'], quantity: 180, minimumStock: 10, buyingPrice: 7, sellingPrice: 14.99 },
      { businessId: john._id, name: 'Fitness Tracker', sku: 'SPRT-005', categoryId: catMap['Sports & Fitness'], quantity: 0, minimumStock: 10, buyingPrice: 80, sellingPrice: 129.99 },
    ];

    const products = await Product.create(productData);
    console.log(`✓ Created ${products.length} products`);

    // ==================== INVENTORY TRANSACTIONS ====================
    const reasons = {
      IN: ['Initial Stock', 'Restock', 'Supplier Delivery', 'Return', 'Seasonal Restock', 'Bulk Purchase', 'Warehouse Transfer In'],
      OUT: ['Customer Order', 'Damaged', 'Return to Supplier', 'Promotional Giveaway', 'Internal Use', 'Expired', 'Online Sale'],
    };

    const currentYear = new Date().getFullYear();
    const transactions = [];

    // Helper to pick a random element from an array
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Generate transactions for current year (Jan - current month)
    const currentMonth = new Date().getMonth() + 1;

    for (let month = 1; month <= currentMonth; month++) {
      // Generate 15-25 transactions per month for current year
      const txCount = randBetween(15, 25);

      for (let i = 0; i < txCount; i++) {
        const product = pick(products);
        const type = pick(['IN', 'OUT']);

        // Seasonal variation: more stock IN during Jan, Mar, Sep; more OUT during Nov, Dec (holidays)
        let quantity;
        if (type === 'IN') {
          if ([1, 3, 9].includes(month)) {
            quantity = randBetween(30, 100); // Seasonal restock months
          } else {
            quantity = randBetween(10, 60);
          }
        } else {
          if ([11, 12].includes(month)) {
            quantity = randBetween(20, 80); // Holiday sales surge
          } else if ([6, 7].includes(month)) {
            quantity = randBetween(15, 50); // Summer sales
          } else {
            quantity = randBetween(10, 40);
          }
        }

        const day = randBetween(1, 28);
        const createdAt = new Date(currentYear, month - 1, day, randBetween(8, 18), randBetween(0, 59));

        transactions.push({
          businessId: john._id,
          productId: product._id,
          type,
          quantity,
          previousQuantity: product.quantity,
          updatedQuantity: type === 'IN' ? product.quantity + quantity : Math.max(0, product.quantity - quantity),
          reason: pick(reasons[type]),
          month,
          year: currentYear,
          createdAt,
        });
      }
    }

    // Generate transactions for 2024 (historical data for yearly growth)
    for (let month = 1; month <= 12; month++) {
      const txCount = randBetween(8, 15);

      for (let i = 0; i < txCount; i++) {
        const product = pick(products);
        const type = pick(['IN', 'OUT']);
        const quantity = type === 'IN' ? randBetween(15, 70) : randBetween(10, 45);
        const day = randBetween(1, 28);
        const createdAt = new Date(2024, month - 1, day, randBetween(8, 18), randBetween(0, 59));

        transactions.push({
          businessId: john._id,
          productId: product._id,
          type,
          quantity,
          previousQuantity: product.quantity,
          updatedQuantity: type === 'IN' ? product.quantity + quantity : Math.max(0, product.quantity - quantity),
          reason: pick(reasons[type]),
          month,
          year: 2024,
          createdAt,
        });
      }
    }

    // Generate transactions for 2025 (more historical data)
    for (let month = 1; month <= 12; month++) {
      const txCount = randBetween(10, 20);

      for (let i = 0; i < txCount; i++) {
        const product = pick(products);
        const type = pick(['IN', 'OUT']);
        const quantity = type === 'IN' ? randBetween(20, 80) : randBetween(10, 55);
        const day = randBetween(1, 28);
        const createdAt = new Date(2025, month - 1, day, randBetween(8, 18), randBetween(0, 59));

        transactions.push({
          businessId: john._id,
          productId: product._id,
          type,
          quantity,
          previousQuantity: product.quantity,
          updatedQuantity: type === 'IN' ? product.quantity + quantity : Math.max(0, product.quantity - quantity),
          reason: pick(reasons[type]),
          month,
          year: 2025,
          createdAt,
        });
      }
    }

    await InventoryTransaction.insertMany(transactions);
    console.log(`✓ Created ${transactions.length} inventory transactions`);

    // ==================== SUMMARY ====================
    console.log('\n========================================');
    console.log('       SEED DATA SUMMARY');
    console.log('========================================');
    console.log(`Users:                ${users.length}`);
    console.log(`  - Business Owner:   John Smith (john@stockhub.com / password123)`);
    console.log(`  - Super Admin:      Admin User (admin@stockhub.com / admin123)`);
    console.log(`Categories:           ${categories.length}`);
    console.log(`Products:             ${products.length}`);
    console.log(`  - In Stock:         ${products.filter((p) => p.quantity > p.minimumStock).length}`);
    console.log(`  - Low Stock:        ${products.filter((p) => p.quantity > 0 && p.quantity <= p.minimumStock).length}`);
    console.log(`  - Out of Stock:     ${products.filter((p) => p.quantity === 0).length}`);
    console.log(`Transactions:         ${transactions.length}`);
    console.log(`  - Stock IN:         ${transactions.filter((t) => t.type === 'IN').length}`);
    console.log(`  - Stock OUT:        ${transactions.filter((t) => t.type === 'OUT').length}`);
    console.log(`  - Year 2024:        ${transactions.filter((t) => t.year === 2024).length}`);
    console.log(`  - Year 2025:        ${transactions.filter((t) => t.year === 2025).length}`);
    console.log(`  - Year ${currentYear}:        ${transactions.filter((t) => t.year === currentYear).length}`);
    console.log('========================================');
    console.log('Seeding completed successfully! 🚀');
    console.log('========================================\n');

    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedData();
