@echo off
setlocal enabledelayedexpansion
echo ===== BITTERR - SCRIPT KHOI DONG TONG THE =====
echo.

:: Kiem tra xem file .env co ton tai khong
if not exist .env (
    echo [LOI] File .env khong ton tai. Vui long chay setup.bat truoc.
    pause
    exit /b
)

echo Chon che do khoi dong:
echo 1. Khoi dong toan bo he thong (Backend + Frontend + ML Models)
echo 2. Chi khoi dong Backend
echo 3. Chi khoi dong Frontend
echo 4. Chi khoi dong ML Models
echo 5. Thoat
echo.

set /p option="Nhap lua chon cua ban (1-5): "

if "%option%"=="1" (
    echo.
    echo Dang khoi dong toan bo he thong...
    
    :: Kiem tra MongoDB da chay chua
    echo Dang kiem tra MongoDB...
    netstat -an | find "27017" > nul
    if %errorlevel% neq 0 (
        echo [CANH BAO] MongoDB chua duoc khoi dong. 
        echo Vui long khoi dong MongoDB truoc khi tiep tuc.
        pause
        exit /b
    )
    
    echo MongoDB da duoc khoi dong.
    echo.
    
    :: Khoi dong Backend trong cua so moi
    echo Dang khoi dong Backend...
    
    
    :: Khoi dong Frontend trong cua so moi neu co
    if exist frontend (
        echo Dang khoi dong Frontend...
        start "Bitterr Frontend" cmd /k "color 0B && echo FRONTEND SERVER && echo. && cd frontend && npm start"
    ) else (
        echo [CANH BAO] Khong tim thay thu muc frontend.
    )
    
    :: Khoi dong ML Models trong cua so moi neu co
    if exist ml_models (
        echo Dang khoi dong ML Models...
        if exist ml_models\app.py (
            start "Bitterr ML Models" cmd /k "color 0C && echo ML SERVER && echo. && cd ml_models && python app.py"
        ) else if exist ml_models\main.py (
            start "Bitterr ML Models" cmd /k "color 0C && echo ML SERVER && echo. && cd ml_models && python main.py"
        ) else if exist ml_models\server.py (
            start "Bitterr ML Models" cmd /k "color 0C && echo ML SERVER && echo. && cd ml_models && python server.py"
        ) else (
            echo [CANH BAO] Khong tim thay file khoi dong cho ML Models.
        )
    ) else (
        echo [CANH BAO] Khong tim thay thu muc ml_models.
    )
    
    echo.
    echo He thong da duoc khoi dong!
    echo.
    echo Backend: http://localhost:5050
    echo Frontend: http://localhost:3000 (neu duoc cau hinh)
    echo.
    echo [LUU Y] Dong cua so nay se KHONG dung cac server.
    echo De dung he thong, vui long dong tung cua so server rieng biet.
    
) else if "%option%"=="2" (
    echo.
    echo Dang khoi dong chi Backend...
    echo [Nhan Ctrl+C de dung]
    echo.
    call npm run dev
    
) else if "%option%"=="3" (
    echo.
    if exist frontend (
        echo Dang khoi dong chi Frontend...
        echo [Nhan Ctrl+C de dung]
        echo.
        cd frontend
        call npm start
        cd ..
    ) else (
        echo [LOI] Khong tim thay thu muc frontend.
        pause
        exit /b
    )
    
) else if "%option%"=="4" (
    echo.
    if exist ml_models (
        echo Dang khoi dong chi ML Models...
        echo [Nhan Ctrl+C de dung]
        echo.
        cd ml_models
        if exist app.py (
            python app.py
        ) else if exist main.py (
            python main.py
        ) else if exist server.py (
            python server.py
        ) else (
            echo [LOI] Khong tim thay file khoi dong cho ML Models.
            cd ..
            pause
            exit /b
        )
        cd ..
    ) else (
        echo [LOI] Khong tim thay thu muc ml_models.
        pause
        exit /b
    )
    
) else if "%option%"=="5" (
    exit /b
) else (
    echo Lua chon khong hop le. Vui long chay lai script.
    pause
    exit /b
)

pause 