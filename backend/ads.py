import os
import httpx
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)

# API Router untuk iklan
router = APIRouter()

# Konstanta
PI_API_KEY = os.getenv("PI_API_KEY")
PI_API_URL = "https://api.minepi.com/v2"

if not PI_API_KEY:
    logging.error("❌ PI_API_KEY not found! Check your .env file.")
    raise ValueError("PI_API_KEY is missing in .env!")

# API untuk mengecek status rewarded ad
@router.get("/ads/status/{ad_id}")
async def check_ad_status(ad_id: str):
    try:
        headers = {"Authorization": f"Key {PI_API_KEY}"}

        async with httpx.AsyncClient() as client:
            response = await client.get(f"{PI_API_URL}/ads/{ad_id}/status", headers=headers)

        if response.status_code == 200:
            ad_status = response.json()
            logging.info(f"✅ Ad Status: {ad_status}")
            return JSONResponse(content={"message": "Ad status retrieved!", "status": ad_status})
        else:
            logging.error(f"❌ Ad Status Fetch Failed: {response.text}")
            raise HTTPException(status_code=response.status_code, detail="Failed to retrieve ad status")

    except Exception as e:
        logging.error(f"❌ Error in check_ad_status: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
