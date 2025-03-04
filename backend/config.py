import os
from dotenv import load_dotenv
import logging

# Load environment variables from .env
load_dotenv()

# Konfigurasi API
PI_API_KEY = os.getenv("PI_API_KEY")
PI_SANDBOX = os.getenv("PI_SANDBOX", "false").lower() == "true"  # Konversi ke Boolean

# URL API Pi Network
PI_API_URL = "https://api.minepi.com/v2"

# Pastikan API Key tersedia
if not PI_API_KEY:
    logging.error("❌ PI_API_KEY tidak ditemukan! Periksa kembali file .env Anda.")
    raise ValueError("PI_API_KEY tidak ditemukan! Pastikan sudah diatur di .env")

# Logging untuk debugging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logging.info(f"🔧 Konfigurasi: PI_SANDBOX = {PI_SANDBOX}")
