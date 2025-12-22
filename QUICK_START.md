# ⚡ Quick Start Guide

This guide provides the minimum steps required to run the POS Inventory System locally for development.

---

## ✅ Prerequisites

Ensure the following are installed on your machine:

- Git
- Node.js 18.x or higher
- Python 3.10 or higher
- PostgreSQL 14.x or higher

---

## 📥 Clone the Repository

git clone https://github.com/<your-org-or-username>/pos-inventory-system.git  
cd pos-inventory-system

---

## 🐍 Backend Setup (Django)

### 1. Create and activate virtual environment

cd backend  
python -m venv venv  
# ManOS source venv/bin/activate   # Windows: venv\Scripts\activate

### 2. Install dependencies

pip install -r requirements.txt

### 3. Configure environment variables

cp .env.example .env  

Edit `.env` and set your database credentials and secret key.

### 4. Run migrations and create admin user

python manage.py migrate  
python manage.py createsuperuser

### 5. Install psycopg2-binary library

pip install psycopg2-binary

### 6. Start backend server

python manage.py runserver

Backend will be available at:
- API: http://localhost:8000
- Admin panel: http://localhost:8000/admin

---

## 🌐 Frontend Setup (Next.js)

Open a new terminal window.

### 1. Install dependencies

cd frontend  
npm install

### 2. Configure environment variables

cp .env.example .env.local  

Ensure the API URL is set:

NEXT_PUBLIC_API_URL=http://localhost:8000/api

### 3. Start frontend server

npm run dev

Frontend will be available at:
- http://localhost:3000

---

## ✅ Verify Local Setup

Confirm that:
- Backend server is running on port 8000
- Frontend server is running on port 3000
- Django admin is accessible
- No errors appear in terminal logs

---

## 🔑 Key Environment Variables

Backend:
- SECRET_KEY
- DEBUG
- DATABASE_URL (or individual DB credentials)

Frontend:
- NEXT_PUBLIC_API_URL

---

## 🧪 Optional: Run Tests

Backend:
cd backend  
pytest

Frontend:
cd frontend  
npm test

---

## 🆘 Need Help?

If setup fails:
- Check terminal error messages
- Confirm environment variables are set correctly
- Ask in the team communication channel or open a GitHub issue

---

You are now ready to run the project locally.
