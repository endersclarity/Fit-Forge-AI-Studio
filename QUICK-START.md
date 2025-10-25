# FitForge Local - Quick Start Guide

## ⚡ 30-Second Start

### Windows (Recommended)
```bash
./start.bat
```
Then open: **http://localhost:3000**

### Docker (Any OS)
```bash
docker-compose up -d
```
Then open: **http://localhost:3000**

### Local npm (Development)
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2 (new terminal)
npm run dev
```
Then open: **http://localhost:3000**

---

## ✅ Verify It's Working

1. Open http://localhost:3000 in browser
2. You should see the FitForge Dashboard with 13 muscle groups
3. Click "Workout" tab → Log an exercise → See muscle fatigue update

---

## 📍 Where to Access

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main app |
| Backend API | http://localhost:3001/api | API endpoints (Docker) |
| Backend API | http://localhost:3002/api | API endpoints (npm dev) |
| Health Check | http://localhost:3001/api/health | Server status |

---

## 🛑 Stop the Application

**Docker:**
```bash
docker-compose down
```

**npm:**
- Press `Ctrl+C` in both terminals

---

## 📖 Full Documentation

See **FITFORGE-INIT.md** for comprehensive setup guide.

---

## 🔧 Common Issues

**Can't access localhost:3000?**
- Check if Docker is running: `docker ps`
- Check if backend is running: `curl http://localhost:3001/api/health`

**Database error?**
- Ensure `data/` directory exists
- Try rebuilding Docker: `docker-compose build --no-cache && docker-compose up -d`

**Port already in use?**
- Change port in `docker-compose.yml` or `backend/.env.local`

---

That's it! You're ready to track your workouts. 💪

---

*For detailed setup, troubleshooting, and features, see FITFORGE-INIT.md*
