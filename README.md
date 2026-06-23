<div align="center">
  <h1>🌿 Sapplingo (Plantify)</h1>
  <p><strong>Your Ultimate Plant E-Commerce Platform & Botanical Assistant</strong></p>

  [![Live Demo](https://img.shields.io/badge/Live_Demo-sapplingo--1.onrender.com-success?style=for-the-badge)](https://sapplingo-1.onrender.com/)

  ![React](https://img.shields.io/badge/react-19-blue?style=for-the-badge&logo=react)
  ![Vite](https://img.shields.io/badge/vite-6-purple?style=for-the-badge&logo=vite)
  ![Tailwind CSS](https://img.shields.io/badge/tailwindcss-4-38B2AC?style=for-the-badge&logo=tailwind-css)
  ![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql)
</div>

---

## 📖 Overview

**Sapplingo** (also known as Plantify) is a modern, full-stack multi-vendor marketplace designed exclusively for plant enthusiasts and nurseries. It provides a seamless e-commerce experience for users looking to buy plants and a powerful dashboard for nurseries to manage their inventory. 

To take plant care to the next level, Sapplingo features an **AI-driven Botanical Assistant** powered by the **Groq API** (Qwen3 32B), which helps users with personalized plant maintenance tips and answers all botanical queries.

---

## ✨ Key Features

- **Multi-Vendor Marketplace:** Dual-login authentication allowing both individual users and registered nurseries to use the platform.
- **Nursery Dashboards:** Dedicated features for nurseries to add, update, and manage their plant inventory.
- **AI Botanical Assistant:** Chat with an expert AI botanist for real-time plant care advice and information, powered by Groq.
- **Shopping Cart & Checkout:** Persistent cart system with dynamic total calculation and seamless checkout flow.
- **User Profiles & History:** Comprehensive user profiles featuring automatic date-of-birth age calculation and persistent order history.
- **Beautiful & Responsive UI:** Built with React, Tailwind CSS, and Framer Motion for a stunning, glassmorphism-inspired aesthetic with smooth animations.
- **Dynamic Landing Page:** An engaging homepage featuring interactive 3D elements (Spline) and auto-scrolling plant carousels.

---

## 📸 Screenshots

<div align="center">
  <img src="assets/screenshot1.png" width="800" alt="Sapplingo Screenshot 1">
  <br/><br/>
  <img src="assets/screenshot2.png" width="800" alt="Sapplingo Screenshot 2">
  <br/><br/>
  <img src="assets/screenshot3.png" width="800" alt="Sapplingo Screenshot 3">
  <br/><br/>
  <img src="assets/screenshot4.png" width="800" alt="Sapplingo Screenshot 4">
  <br/><br/>
  <img src="assets/screenshot5.png" width="800" alt="Sapplingo Screenshot 5">
</div>

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS 4, PostCSS
- **Animations:** Framer Motion, Spline React, React CountUp
- **Routing:** React Router DOM
- **HTTP Client:** Axios

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL with SQLAlchemy (ORM) & psycopg2
- **AI Integration:** Groq API SDK (Qwen3 32B model)
- **Validation:** Pydantic

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.9 or higher)
- PostgreSQL database
- A Groq API Key

### Backend Setup

1. **Navigate to the backend directory** (root of the project):
   ```bash
   cd plantify
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add:
   ```env
   DATABASE_URL=postgresql://username:password@localhost/plantify
   GROQ_API_KEY=your_groq_api_key_here
   ```

5. **Run the FastAPI server:**
   ```bash
   uvicorn main:app --reload
   ```
   *The API will be available at `http://127.0.0.1:8000`*

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd plantify/frontend
   ```

2. **Install Node modules:**
   ```bash
   npm install
   ```

3. **Run the Vite development server:**
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:5173`*

---

## 📡 API Endpoints Summary

Here is a quick overview of the main RESTful endpoints:

- **Users:** `POST /api/register`, `POST /api/login`, `GET /api/users`
- **Nurseries:** `POST /api/nursery/register`, `POST /api/nursery/login`
- **Plants:** `GET /api/plants`, `GET /api/plants/{id}`, `POST /api/plants`
- **Cart:** `POST /api/cart`, `GET /api/cart/{user_id}`, `DELETE /api/cart/{item_id}`
- **Orders:** `POST /api/checkout/{user_id}`, `GET /api/orders/{user_id}`
- **AI Chat:** `POST /api/chat`, `POST /api/generate-details`
- **Utilities:** `GET /api/seed` (Seeds the database with sample nurseries and plants)

---

## 🌱 Seeding the Database

If you want to test the app with pre-populated data, simply visit:
`http://127.0.0.1:8000/api/seed`
This will automatically generate a sample nursery and 15 beautiful houseplants with complete botanical descriptions!

---

<div align="center">
  <p>Built with 💚 for Plant Lovers.</p>
</div>
