# 🏏 Cricopedia - T20 World Cup Prediction Game

A full-stack cricket prediction game where users predict match winners, play quizzes, earn points, and compete on the leaderboard for exciting prizes.

## ✨ Features

- **Match Predictions** - Predict T20 World Cup match winners before deadlines
- **Live Quiz System** - Time-based quizzes with real-time countdown
- **Dynamic Leaderboard** - Real-time rankings with pagination
- **Points & Streaks** - Earn points, maintain streaks, unlock badges
- **Admin Dashboard** - Manage matches, quizzes, and users
- **Fair Play Detection** - IP/location logging for fraud prevention
- **OTP Authentication** - Email-based verification system

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB Atlas
- **Authentication**: NextAuth.js with JWT
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Email**: Nodemailer (Brevo SMTP)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Brevo (Sendinblue) account for emails

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/predict-game.git
cd predict-game

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create `.env.local` with:

```env
MONGODB_URI=mongodb+srv://your-connection-string
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Email (Brevo SMTP)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-email
SMTP_PASS=your-brevo-api-key
EMAIL_FROM=noreply@yourdomain.com
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Admin Access

1. Create a regular account via signup
2. Manually set `isAdmin: true` in MongoDB for that user
3. Access admin at `/admin`

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── api/          # API routes
│   ├── admin/        # Admin dashboard
│   ├── dashboard/    # User dashboard
│   ├── leaderboard/  # Rankings page
│   ├── quiz/         # Quiz hub
│   └── ...
├── components/       # Reusable UI components
├── lib/              # Utilities (MongoDB, email, etc.)
└── models/           # Mongoose schemas
```

## 🎮 Scoring System

| Action | Points |
|--------|--------|
| Correct Prediction | +10 |
| Wrong Prediction | -2 |
| Quiz (varies) | +5 to +50 / -1 to -15 |
| 3-Day Streak | +3 |
| 5-Day Streak | +5 |
| 7-Day Streak | +10 |

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Environment Variables for Production

- Set `NEXTAUTH_URL` to your production domain
- Generate a strong `NEXTAUTH_SECRET`
- Use production MongoDB Atlas connection string

## 📱 Screenshots

*Coming soon*

## 🤝 Contributing

This is a solo project by [@mubashir_builds](https://instagram.com/mubashir_builds).

## 📄 License

MIT License - feel free to use and modify.

---

Made with ❤️ by [Mubashir Iqbal](https://instagram.com/mubashir_builds)
