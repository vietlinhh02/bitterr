@echo off
echo ===== BITTERR - SCRIPT CAI DAT TONG THE =====
echo.

:: Kiem tra xem Node.js da duoc cai dat chua
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [CANH BAO] Node.js chua duoc cai dat. Vui long cai dat Node.js v16+ truoc khi tiep tuc.
    echo Download tai: https://nodejs.org/
    pause
    exit /b
)

:: Kiem tra xem Python da duoc cai dat chua (cho ML models)
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [CANH BAO] Python chua duoc cai dat. Vui long cai dat Python 3.8+ truoc khi tiep tuc.
    echo Download tai: https://www.python.org/downloads/
    pause
    exit /b
)

:: Tao file .env neu chua ton tai
if not exist .env (
    echo Dang tao file .env...
    (
        echo # MongoDB
        echo MONGO_ROOT_USERNAME=admin
        echo MONGO_ROOT_PASSWORD=bitterr_secure_password
        echo.
        echo # JWT
        echo JWT_SECRET=bitterr_jwt_secret_%RANDOM%
        echo.
        echo # API Keys
        echo OPENAI_API_KEY=your_openai_api_key
        echo GOOGLE_API_KEY=your_google_api_key
        echo GOOGLE_CLOUD_PROJECT=your_google_cloud_project_id
        echo.
        echo # Other configs
        echo NODE_ENV=development
        echo PORT=5050
        echo FRONTEND_PORT=3000
        echo.
        echo # MongoDB URL cho local
        echo MONGODB_URI=mongodb://localhost:27017/bitterr
    ) > .env
    echo File .env da duoc tao. Vui long chinh sua cac thong so trong file nay truoc khi tiep tuc.
    echo Dac biet la cac API key can duoc cau hinh chinh xac.
    notepad .env
) else (
    echo File .env da ton tai.
)

:: Tao cac thu muc can thiet
echo Dang tao cac thu muc can thiet...
if not exist uploads mkdir uploads
if not exist temp mkdir temp
if not exist processed mkdir processed
if not exist results mkdir results
if not exist logs mkdir logs

echo.
echo ===== CAI DAT BACKEND =====
:: Cai dat cac dependencies backend
echo Dang cai dat cac goi phu thuoc cho backend...
call npm install

echo.
echo ===== CAI DAT FRONTEND =====
:: Cai dat cac dependencies frontend
if exist frontend (
    echo Dang cai dat cac goi phu thuoc cho frontend...
    cd frontend
    call npm install
    cd ..
) else (
    echo [CANH BAO] Khong tim thay thu muc frontend.
)

echo.
echo ===== CAI DAT ML MODELS =====
:: Cai dat cac dependencies cho ML models
if exist ml_models (
    echo Dang cai dat cac goi phu thuoc cho ML models...
    cd ml_models
    if exist requirements.txt (
        call pip install -r requirements.txt
    ) else (
        echo [CANH BAO] Khong tim thay file requirements.txt trong thu muc ml_models.
    )
    cd ..
) else (
    echo [CANH BAO] Khong tim thay thu muc ml_models.
)

echo.
echo ===== CAI DAT HOAN TAT =====
echo.
echo Cac buoc tiep theo:
echo 1. Kiem tra va chinh sua file .env voi cac thong so phu hop
echo 2. Dam bao MongoDB da duoc cai dat va dang chay tren may tinh
echo 3. Chay file run.bat de khoi dong toan bo he thong
echo.
pause 