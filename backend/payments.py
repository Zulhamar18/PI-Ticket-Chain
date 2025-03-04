import os
import httpx
import logging
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)

# API Router untuk pembayaran
router = APIRouter()

# Konstanta
PI_API_KEY = os.getenv("PI_API_KEY")
PI_API_URL = "https://api.minepi.com/v2"

if not PI_API_KEY:
    logging.error("❌ PI_API_KEY not found! Check your .env file.")
    raise ValueError("PI_API_KEY is missing in .env!")

# API untuk membuat pembayaran
@router.post("/payments")
async def create_payment(request: Request):
    try:
        data = await request.json()
        amount = data.get("amount")
        memo = data.get("memo")
        metadata = data.get("metadata")
        uid = data.get("uid")

        if not all([amount, memo, metadata, uid]):
            raise HTTPException(status_code=400, detail="❌ Missing required fields")

        headers = {"Authorization": f"Key {PI_API_KEY}", "Content-Type": "application/json"}

        payment_payload = {
            "amount": amount,
            "memo": memo,
            "metadata": metadata,
            "uid": uid
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(f"{PI_API_URL}/payments", json=payment_payload, headers=headers)

        if response.status_code == 201:
            payment_data = response.json()
            logging.info(f"✅ Payment Created: {payment_data}")
            return JSONResponse(content={"message": "Payment initiated successfully!", "payment": payment_data})
        else:
            logging.error(f"❌ Payment Failed: {response.text}")
            raise HTTPException(status_code=response.status_code, detail="Payment failed!")

    except Exception as e:
        logging.error(f"❌ Error in create_payment: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

# API untuk memeriksa status pembayaran
@router.get("/payments/{payment_id}")
async def check_payment_status(payment_id: str):
    try:
        headers = {"Authorization": f"Key {PI_API_KEY}"}

        async with httpx.AsyncClient() as client:
            response = await client.get(f"{PI_API_URL}/payments/{payment_id}", headers=headers)

        if response.status_code == 200:
            payment_status = response.json()
            logging.info(f"✅ Payment Status: {payment_status}")
            return JSONResponse(content={"message": "Payment status retrieved!", "status": payment_status})
        else:
            logging.error(f"❌ Payment Status Fetch Failed: {response.text}")
            raise HTTPException(status_code=response.status_code, detail="Failed to retrieve payment status")

    except Exception as e:
        logging.error(f"❌ Error in check_payment_status: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
