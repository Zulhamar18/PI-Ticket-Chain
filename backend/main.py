import logging
import httpx
import os
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import JSONResponse, FileResponse
from config import PI_API_KEY, PI_API_URL  # Pastikan config.py tersedia

# Konfigurasi Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Pastikan API Key tersedia sebelum menjalankan aplikasi
if not PI_API_KEY:
    logging.error("❌ PI_API_KEY tidak ditemukan! Periksa file .env")
    raise ValueError("PI_API_KEY tidak ditemukan!")

# Inisialisasi FastAPI
app = FastAPI()

# Middleware untuk Logging Semua Request
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logging.info(f"📡 Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    return response

@app.get("/")
async def read_root():
    return JSONResponse(content={"message": "✅ Welcome to Ticket Chain API!"})

# Endpoint untuk Memeriksa Validation Key
@app.get("/validation-key.txt")
async def get_validation_key():
    key_path = "validation-key.txt"
    
    if os.path.exists(key_path):
        return FileResponse(key_path, media_type="text/plain")
    else:
        logging.warning("❌ Validation Key tidak ditemukan!")
        raise HTTPException(status_code=404, detail="Validation Key tidak ditemukan!")

# Authentication with Pi Network
@app.post("/auth")
async def auth(request: Request):
    try:
        data = await request.json()
        access_token = data.get("access_token")

        if not access_token:
            logging.warning("⚠️ Access token tidak ditemukan di request!")
            raise HTTPException(status_code=400, detail="❌ Access token diperlukan!")

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{PI_API_URL}/me", headers=headers)

        logging.info(f"📡 Response dari Pi API: {response.status_code} - {response.text}")

        if response.status_code == 200:
            try:
                user_data = response.json()
                logging.info(f"✅ User authenticated: {user_data}")
                return JSONResponse(content={"message": "✅ User authenticated", "user": user_data})
            except Exception as json_err:
                logging.error(f"❌ Gagal memproses JSON dari Pi API: {str(json_err)}")
                raise HTTPException(status_code=500, detail="Kesalahan parsing JSON dari Pi API")

        elif response.status_code == 401:
            logging.warning("⚠️ Authentication gagal: Token tidak valid")
            raise HTTPException(status_code=401, detail="❌ Token tidak valid!")

        else:
            logging.error(f"❌ Authentication gagal: {response.status_code} - {response.text}")
            raise HTTPException(status_code=response.status_code, detail="Authentication gagal!")

    except httpx.ConnectError:
        logging.error("❌ Tidak dapat terhubung ke Pi API. Periksa koneksi jaringan!")
        raise HTTPException(status_code=502, detail="Tidak dapat terhubung ke Pi API")
    except httpx.TimeoutException:
        logging.error("❌ Request ke Pi API melebihi batas waktu!")
        raise HTTPException(status_code=504, detail="Request timeout saat menghubungi Pi API")
    except httpx.HTTPError as http_err:
        logging.error(f"❌ Kesalahan HTTP: {str(http_err)}")
        raise HTTPException(status_code=500, detail="Kesalahan HTTP selama autentikasi")
    except Exception as e:
        logging.error(f"❌ Kesalahan tidak terduga: {str(e)}")
        raise HTTPException(status_code=500, detail="Terjadi kesalahan tidak terduga")
