# 🛒 POS Inventory System

**Inventory & Point-of-Sale (POS) Management System**  
Built with **Next.js**, **Django**, and **PostgreSQL**

---

## 📌 Project Overview

A modular, scalable Point-of-Sale and Inventory Management System designed for retail operations.  
The system supports product management, stock tracking, sales processing, reporting, and role-based access control.

This project is developed as a **capstone software engineering project**, following Domain-Driven Design (DDD), modular architecture, and continuous integration best practices.

---

## 👥 Team Members & Roles

| Name | Role | GitHub Username |
|------|------|----------------|
| Tobe Ofili  | Product Manager | TobeOf17 |
| Kene Obiekwe  | Project Manager | kene-obiekwe |
| Alex-Ojukwu Nduka | Lead Software Architect/ Frontend Developer | Alex-Ojukwu |
| Yasir Tella | Lead UX Designer | yasir-tella12 |
| Akpe Omokafe | Lead Software Developer (Backend) | KAFE860 |
| Oluwatimilehin Ilesanmi | Software QA Lead | Timmynathan |
| Nmesoma Okonkwo | Backend Developer | n-okonkwo |
| Oluwademilade Somide | Backend Developer | demisomi |
| Osara Oseiga Joseph | UX Designer | oseigaosara |
| Omole Taiwo | Software Architect/ Frontend Developer | Tai-Om |

---

## 🏗️ Architecture

**Architecture Style:** Modular Monolith  

**Justification:**
- Clear separation of domain modules (Products, Inventory, Sales, Suppliers, Reports)
- Simplified deployment suitable for team size
- Strong alignment with Domain-Driven Design
- Can evolve into microservices if required

---

## 🛠️ Technology Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- TanStack Query
- React Hook Form + Zod

### Backend
- Django 5
- Django REST Framework
- JWT Authentication (Simple JWT)
- PostgreSQL
- django-cors-headers

### DevOps & Tooling
- Git & GitHub
- GitHub Actions (CI)
- Pytest (Backend Testing)
- Jest (Frontend Testing)

---

## 🎯 Core Features (MVP)

- Authentication & role-based access
- Product and SKU management
- Inventory tracking with stock movements
- POS sales processing
- Returns and refunds
- Supplier & purchase order management
- Sales and inventory reports

---

## 🔄 Development Workflow

- Task tracking via **GitHub Issues & Projects**
- Feature-based branching (`feature/*`)
- Pull-request based collaboration
- Mandatory CI checks before merge enforced with github actions workflows

---

## 📚 Documentation

- **DDD Documentation:** `/docs/ddd`
- **Architecture Decisions:** `/docs/architecture`
- **UX Designs:** `/docs/ux-design`
- **API Documentation:** `/docs/api`

---

## 📄 License

MIT License

---