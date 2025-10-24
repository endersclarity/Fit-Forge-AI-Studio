@echo off
echo.
echo ================================================
echo   Starting FitForge Local
echo ================================================
echo.
echo Building and starting containers...
echo.

docker-compose up -d

echo.
echo ================================================
echo   FitForge is starting!
echo ================================================
echo.
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:3001/api
echo   Database: ./data/fitforge.db
echo.
echo   To view logs: docker-compose logs -f
echo   To stop: docker-compose down
echo.
echo ================================================
echo.

pause
