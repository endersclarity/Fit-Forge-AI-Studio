<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# FitForge Local - Offline Fitness Tracker

This is a fully offline version of FitForge that runs on your computer with a local SQLite database.

## Quick Start (RECOMMENDED)

**Windows Users:**
1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Double-click `start.bat` in this folder
3. Open browser to http://localhost:3000

**All Platforms:**
```bash
docker-compose up -d
# Open browser to http://localhost:3000
```

## Documentation

For complete setup instructions, troubleshooting, and alternative methods, see:
- **[README-LOCAL.md](README-LOCAL.md)** - Full documentation for offline setup

## Why Docker?

Docker is the recommended way to run FitForge Local because:
- Works reliably across Windows, macOS, and Linux
- Avoids npm dependency issues (especially the Rollup bug on Windows)
- Clean, isolated environment
- Easy to start/stop with `start.bat`

## Alternative: Local Development

See [README-LOCAL.md](README-LOCAL.md) for instructions on running without Docker.

**Note:** Windows users may encounter npm/Rollup dependency issues. Docker is strongly recommended.
