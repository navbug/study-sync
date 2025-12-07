# StudySync - AI-Powered Learning Platform (Next.js 16)

A production-ready full-stack CRUD application built with **Next.js 16**, **React 19**, **MongoDB**, and **Gemini AI** featuring Server Components, Server Actions, and Type-safe.

## 🚀 Features

### Core CRUD Operations
- **Study Materials Management**: Create, read, update, and delete study notes
- **Flashcards System**: Manage flashcards with difficulty levels and subjects
- **Search & Filter**: Find materials by subject, tags, or search query
- **User Authentication**: Secure JWT-based authentication with Server Actions

### AI-Powered Features (Gemini)
1. **AI Summary Generation**: Automatically generate concise summaries from study materials
2. **AI Flashcard Generator**: Generate flashcards from the notes with one click

### Modern Architecture
- ✅ **Next.js 16** with App Router
- ✅ **React 19** with Server Components
- ✅ **Server Actions** for secure mutations
- ✅ **Server Components** by default for better performance
- ✅ **Client Components** only where necessary

### Security & Best Practices
- JWT-based authentication with HTTP-only cookies
- Password hashing with bcryptjs
- Input validation with Zod
- Server-side data fetching
- Protected routes with middleware

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js Server Actions, Server Components
- **Database**: MongoDB with Mongoose ODM
- **AI**: Google Gemini AI API
- **Authentication**: JWT (jsonwebtoken) + Server Actions
- **Validation**: Zod

## 🔧 Installation

### 1. Clone & Install

```bash
git clone <repo-url>
cd studysync
npm install
```

### 2. Environment Variables

Create `.env.local`:

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/studysync

# JWT Secret
JWT_SECRET=jwt-secret-key

# Gemini AI API Key
GEMINI_API_KEY=gemini_api_key_here

# App URL
NEXT_PUBLIC_APP_URL=app-url
```

### 3. Get Gemini API Key

Visit [Google AI Studio](https://makersuite.google.com/app/apikey) & create API key

### 4. Setup MongoDB

Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) & setup a DB

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
studysync/
├── app/
│   ├── (auth)/           # Auth pages
│   ├── (dashboard)/      # Protected pages
│   └── layout.tsx
├── components/
│   ├── ui/               # Reusable UI components
│   └── features/         # Feature-specific components
├── lib/
│   ├── actions/          # ⭐ Server Actions
│   ├── db/               # Database models
│   ├── auth/             # JWT utilities
│   └── ai/               # Gemini AI integration
├── types/                # TypeScript types
└── middleware.ts         # Route protection
```

## 🔒 Security Features

- ✅ Password hashing (bcrypt)
- ✅ JWT tokens (7-day expiration)
- ✅ HTTP-only cookies (XSS protection)
- ✅ Zod validation (input sanitization)
- ✅ Protected routes (middleware)
- ✅ Server-side auth checks

## 👨‍💻 Developer

**Naveen Bugalia**
- GitHub: [github.com/navbug](https://github.com/navbug)
- LinkedIn: [linkedin.com/in/naveenbugalia512](https://linkedin.com/in/naveenbugalia512)

---

Built with ❤️ using Next.js 16, React 19, MongoDB, and Gemini AI
