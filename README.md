<div align="center">

<img src="./stack/public/logo.png" alt="CodeQuest Logo" width="100" />

#  CodeQuest
### Full-Stack Developer Q&A & Community Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

A full-stack, feature-rich developer community platform and Stack Overflow clone engineered with **Next.js 16**, **React 19**, **Tailwind CSS v4**, **Node.js/Express**, and **MongoDB**. Featuring advanced Q&A workflows, multi-factor authentication, reputation gamification, social community feeds, subscription billing with automated PDF invoicing, and multilingual localization.

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture--folder-structure) • [Getting Started](#-getting-started) • [API Overview](#-api-endpoints)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [1. Q&A Engine](#1-qa-engine)
  - [2. Reputation & Gamification](#2-reputation--gamification)
  - [3. Community & Social Hub](#3-community--social-hub)
  - [4. Security & Session Management](#4-security--session-management)
  - [5. Subscriptions & Payment Invoicing](#5-subscriptions--payment-invoicing)
  - [6. Multilingual Localization](#6-multilingual-localization)
- [Tech Stack](#-tech-stack)
- [Architecture & Folder Structure](#-architecture--folder-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
- [API Endpoints](#-api-endpoints)
- [License](#-license)

---

## 🌟 Overview

**CodeQuest** is an end-to-end developer question-and-answer platform that replicates and expands on Stack Overflow's core strengths. Beyond asking and answering questions, CodeQuest integrates social networking feeds, a transparent reputation-badge economy, enterprise-grade session security with device tracking, multi-channel 2FA (Email & Twilio SMS), and tier-based subscriptions with automated PDF invoice dispatching.

---

## ✨ Key Features

### 1. ❓ Q&A Engine
- **Ask & Answer**: Create rich questions with title, body, and customizable tag taxonomies.
- **Voting System**: Upvote and downvote questions and answers to curate high-quality solutions.
- **Save & Bookmarks**: Organize questions into personal bookmark collections for quick reference.
- **Tag Filtering & Search**: Instant filtering by tags, newest activity, vote counts, and unanswered queries.

### 2. 🏆 Reputation & Gamification
- **Dynamic Point System**: Earn reputation through upvotes, accepted answers, and community engagement.
- **Tiered Badges**: Unlock Bronze, Silver, and Gold achievement badges at custom milestones.
- **Public Leaderboards**: Real-time rank calculation of top community contributors.
- **Reputation Transfers & History**: Audit log of all points gained, spent, or transferred, plus admin moderation controls.

### 3. 🌐 Community & Social Hub
- **Social Feed**: Post updates, dev snippets, and media attachments to the community stream.
- **Comments & Interactions**: Engage with comments, likes, and follow favorite developers.
- **Content Moderation**: Built-in reporting system for flagging offensive or spam content.
- **Notifications**: In-app notifications for votes, comments, follows, and badge achievements.

### 4. 🛡️ Security & Session Management
- **Multi-Factor Authentication (2FA)**: One-Time Password (OTP) verification over Email (Nodemailer/SendGrid) or SMS (Twilio).
- **Session & Device Auditing**: Tracks login activity including IP address, browser, OS, and location.
- **Trusted Device Management**: Remember authorized hardware and terminate suspicious sessions remotely.
- **Configurable Inactivity Timeout**: Automatically expires inactive sessions for enhanced safety.
- **OAuth Integration**: Quick login support via GitHub and Google OAuth.

### 5. 💳 Subscriptions & Payment Invoicing
- **Tiered Memberships**: Free, Silver, and Gold tiers unlocking enhanced daily posting limits and features.
- **Payment Gateways**: Seamless checkout integration with Razorpay and Stripe.
- **Automated PDF Invoices**: Generates customized PDF receipts on the fly with PDFKit and automatically emails them upon payment.

### 6. 🌍 Multilingual Localization
- **Internationalization**: Powered by `i18next` with support for dynamic language switching across the application.

---

## 🛠 Tech Stack

### Frontend (`/stack`)
| Technology | Description |
| :--- | :--- |
| **Next.js 16** | React framework with SSR, SSG, and file-system routing |
| **React 19** | Modern UI rendering library with Concurrent Features |
| **TypeScript** | Type-safe development |
| **Tailwind CSS v4** | Next-generation utility-first styling engine |
| **Radix UI** | Accessible, unstyled UI primitives (Dialog, Avatar, Checkbox, Slot) |
| **Lucide React** | Clean, customizable iconography |
| **Axios** | Promise-based HTTP client |
| **i18next** | Multilingual translation engine |
| **React Toastify** | Toast notifications |

### Backend (`/server`)
| Technology | Description |
| :--- | :--- |
| **Node.js & Express 5** | High-performance backend API server (ES Modules) |
| **MongoDB & Mongoose 8** | NoSQL database with schema-based object modeling |
| **JWT & bcryptjs** | Stateless token authentication & password hashing |
| **PDFKit** | Programmatic PDF generation for billing invoices |
| **Nodemailer & SendGrid** | Transactional email & OTP delivery |
| **Twilio SDK** | SMS OTP verification gateway |
| **Razorpay & Stripe** | Secure payment processing |

---

## 📁 Architecture & Folder Structure

```text
CodeQuest/
├── server/                      # Express backend service
│   ├── controller/              # Route controllers (Auth, Questions, Community, Payments, etc.)
│   ├── middleware/              # Authentication & validation middlewares
│   ├── models/                  # Mongoose data models
│   │   ├── auth.js              # User model & credentials
│   │   ├── question.js          # Questions schema
│   │   ├── post.js              # Community posts schema
│   │   ├── session.js           # Active sessions & device tracking
│   │   ├── reputationHistory.js # Reputation audit logs
│   │   └── ...
│   ├── routes/                  # API route definitions
│   ├── services/                # Business logic (Email, OTP, Session, Reputation)
│   ├── utils/                   # Helper utilities
│   ├── .env.example             # Backend environment template
│   ├── index.js                 # Server entry point
│   └── package.json             # Backend dependencies
│
├── stack/                       # Next.js frontend application
│   ├── public/                  # Static assets & localization files
│   ├── src/
│   │   ├── components/          # Reusable UI components & modals
│   │   ├── layout/              # Navigation bars, sidebars, and base layouts
│   │   ├── lib/                 # Utility helpers and API client instances
│   │   ├── pages/               # Application routes (Q&A, Community, Auth, Admin, etc.)
│   │   └── styles/              # Global CSS & Tailwind directives
│   ├── .env.example             # Frontend environment template
│   ├── next.config.ts           # Next.js configuration
│   ├── tsconfig.json            # TypeScript configuration
│   └── package.json             # Frontend dependencies
│
└── README.md                    # Project documentation
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm** or **yarn** / **pnpm**
- **MongoDB**: Local instance or MongoDB Atlas cluster URI

---

### Installation & Setup

#### 1. Clone the repository
```bash
git clone https://github.com/DhruvGupta1075/StackOverflow-clone.git
cd StackOverflow-clone
```

#### 2. Backend Setup
```bash
# Navigate to the server folder
cd server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and API keys

# Start development server
npm run dev
```
The backend server will run on `http://localhost:5000` by default.

#### 3. Frontend Setup
```bash
# In a separate terminal, navigate to the frontend folder
cd stack

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Set NEXT_PUBLIC_BACKEND_URL to http://localhost:5000

# Start development server
npm run dev
```
The Next.js frontend will launch on `http://localhost:3000`.

---

## 📡 API Endpoints

| Resource | Base Route | Key Operations |
| :--- | :--- | :--- |
| **Auth & Security** | `/api/auth`, `/api/security` | Login, Register, OTP Verify, Password Reset, Device Management, Session Kill |
| **Questions** | `/question` | List, Search, Ask, Delete, Upvote, Downvote |
| **Answers** | `/answer` | Post answer, Delete answer |
| **Community Feed**| `/api/community` | Create post, Add comments, Like, Follow user, Report content |
| **Reputation** | `/api/reputation` | Get user reputation, Badges breakdown, Transfer points |
| **Admin** | `/api/admin/reputation`| System reputation oversight and adjustments |
| **Payments** | `/payment` | Order creation, Payment verification, Invoice dispatch |
| **Language** | `/api/language` | Retrieve available locales & translations |

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
