# StockHub: Smart Inventory Management System

**StockHub** is a web-based Smart Inventory Management System designed to streamline inventory operations for businesses. It enables users to manage products, monitor stock levels, track inventory movement, and receive real-time low-stock alerts. Built with the **MERN stack**, containerized with **Docker**, and designed with modern SaaS aesthetics.

---

## 🌟 Key Features

- **🔐 Secure Role-Based Authentication (JWT)**:
  - **Business Owner Role**: Restricted to viewing and managing only their own company's inventory data.
  - **Super Admin Role**: Has global visibility across all companies on the platform.
- **📈 Advanced Analytics Dashboard**:
  - Real-time KPI cards: Total Products, Categories, Inventory Value, Sales Value, Expected Profit, Low Stock Count, Out of Stock Count, and Monthly Stock Movement.
  - Interactive **Recharts** visualizations: Monthly Stock Movement (Area Chart), Yearly Growth (Bar Chart), Category Distribution (Donut Pie Chart), and Top Outgoing Products (Horizontal Bar Chart).
- **📄 Professional Report Generation**:
  - Export PDF reports (`pdfkit`) with branded headers, summaries, and paginated tables.
  - Export multi-sheet Excel spreadsheets (`exceljs`) configured with custom cell styling and auto-widths.
- **⚡ Real-time Stock Tracking**:
  - Separate Stock In and Stock Out operations with reason tracking and transaction logs.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Recharts, React Router v6, Axios, Vanilla CSS (SaaS Dark Theme).
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, BcryptJS.
- **Reporting**: PDFKit, ExcelJS.
- **DevOps**: Docker, Docker Compose, Git.

---

## 🚀 Getting Started

### Option 1: Running with Docker (Recommended)

1. Make sure **Docker Desktop** is running.
2. Clone the repository and run:
   ```bash
   docker-compose up --build -d
   ```
3. Access the application:
   - **Frontend UI**: [http://localhost](http://localhost)
   - **Backend API**: [http://localhost:5000](http://localhost:5000)

### Option 2: Running Locally (Manual Setup)

1. **Start MongoDB**: Ensure MongoDB is running locally on port `27017` or update `MONGO_URI` in `.env`.
2. **Start Backend API Server**:
   ```bash
   cd backend
   npm install
   npm run seed    # Populates demo database
   npm start
   ```
   *(Runs on `http://localhost:5000`)*
3. **Start Frontend Dev Server**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *(Runs on `http://localhost:5173`)*

---

## 🔑 Demo Credentials

After seeding the database (`npm run seed`), you can log in with:

| Role | Email | Password |
|------|-------|----------|
| **Business Owner** | `john@stockhub.com` | `password123` |
| **Super Admin** | `admin@stockhub.com` | `admin123` |

---

## 📦 Environment Variables (.env)

See `.env.example` in the `backend/` directory for configuration options:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/stockhub
JWT_SECRET=your_secret_jwt_key_here
CLIENT_URL=http://localhost:5173
```
