# 🍽️ Dishcovery

**Dishcovery** is a modern full-stack web application for discovering dishes and recipes, built with a clean static frontend and a secure backend.

The project focuses on **fundamentals done right** — no frontend frameworks, a well-structured backend, real authentication, and production-ready deployment.

---

## 🚀 Live Links

- 🌐 **Live Website**: https://dishcovery-pi.vercel.app  
- ⚙️ **Backend API**: https://dishcovery-api.vercel.app  
- 🐙 **GitHub Repository**: https://github.com/shvirat/dishcovery  

---

## ✨ Features

### Frontend
- Responsive, modern UI
- Login & signup modal flow
- JWT-based authentication
- Session restore on page reload
- Toast notifications for user feedback
- Built using **pure HTML, CSS & JavaScript**

### Backend
- Node.js + Express REST API
- MongoDB Atlas database
- JWT authentication
- Secure password hashing with bcrypt
- Rate limiting & security headers
- Serverless deployment on Vercel
- Custom animated API landing page (no “Cannot GET /” 😄)

---

## 🧱 Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express
- MongoDB (Atlas)
- Mongoose
- JWT
- bcrypt
- Helmet, CORS, Rate Limiting

### Deployment
- **Vercel** (Frontend & Backend)
- **MongoDB Atlas** (Database)

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` — Register a new user  
- `POST /api/auth/login` — Login user  
- `GET /api/auth/me` — Get current user (JWT required)

### Health
- `GET /api/health` — API status check

---

## 🔐 Authentication Flow

- User logs in → JWT stored in `localStorage`
- JWT sent via `Authorization: Bearer <token>`
- Session restored using `GET /api/auth/me`
- Expired sessions handled gracefully

---

## 🧠 Why Dishcovery?

- No frontend frameworks — strong fundamentals
- Clean, readable backend architecture
- Strong serverless-ready design
- Ideal for learning real-world full-stack deployment

---

## 🤝 Contributing

- Small, focused pull requests are welcome
- Please explain changes clearly
- Avoid unnecessary dependencies

---

## 📄 License

MIT License  
See the `LICENSE` file for details.

---

## 🙌 Acknowledgements

Built with ❤️ while learning real-world backend deployment, authentication, and system design.