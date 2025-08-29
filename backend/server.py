from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class Doctor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    specialty: str
    experience_years: int
    qualification: str
    photo_url: str
    rating: float
    reviews_count: int

class Hospital(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    location: Dict[str, Any]  # {city, country, address, coordinates}
    specialties: List[str]
    accreditations: List[str]
    rating: float
    reviews_count: int
    photos: List[str]
    description: str
    contact: Dict[str, Any]  # {phone, email, website}
    doctors: List[Doctor]
    procedures: List[Dict[str, Any]]  # {name, price_range}
    amenities: List[str]
    languages: List[str]

class SearchFilters(BaseModel):
    location: Optional[str] = None
    specialty: Optional[str] = None
    accreditation: Optional[str] = None
    hospital_type: Optional[str] = None
    language: Optional[str] = None
    rating_min: Optional[float] = None

class Hotel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    location: Dict[str, Any]
    rating: float
    price_per_night: float
    distance_from_hospital: float  # in km
    amenities: List[str]
    photos: List[str]

class PackageItem(BaseModel):
    hospital_id: str
    doctor_id: Optional[str] = None
    procedure: str
    accommodation_days: int
    hotel_id: Optional[str] = None
    services: List[str] = []

class Package(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    items: PackageItem
    total_cost: float
    breakdown: Dict[str, float]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Mock Data
MOCK_HOSPITALS = [
    {
        "id": "hosp_001",
        "name": "Apollo Hospitals Chennai",
        "location": {
            "city": "Chennai",
            "country": "India", 
            "address": "21, Greams Lane, Off Greams Road, Chennai - 600006",
            "coordinates": {"lat": 13.0627, "lng": 80.2707}
        },
        "specialties": ["Cardiology", "Oncology", "Orthopedics", "Neurology", "Gastroenterology"],
        "accreditations": ["JCI", "NABH", "ISO"],
        "rating": 4.8,
        "reviews_count": 2456,
        "photos": [
            "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800",
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800"
        ],
        "description": "Apollo Hospitals Chennai is one of India's leading healthcare institutions, renowned for pioneering medical treatments and advanced technology.",
        "contact": {
            "phone": "+91-44-2829-3333",
            "email": "info@apollochennai.com",
            "website": "https://www.apollohospitals.com"
        },
        "doctors": [
            {
                "id": "doc_001",
                "name": "Dr. Devi Shetty",
                "specialty": "Cardiology",
                "experience_years": 25,
                "qualification": "MS, MCh Cardiac Surgery",
                "photo_url": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
                "rating": 4.9,
                "reviews_count": 890
            },
            {
                "id": "doc_002", 
                "name": "Dr. Priya Reddy",
                "specialty": "Oncology",
                "experience_years": 18,
                "qualification": "MD Oncology, DM Medical Oncology",
                "photo_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
                "rating": 4.7,
                "reviews_count": 567
            }
        ],
        "procedures": [
            {"name": "Heart Bypass Surgery", "price_range": "$7000-9500"},
            {"name": "Knee Replacement", "price_range": "$4000-6000"},
            {"name": "Liver Transplant", "price_range": "$35000-45000"}
        ],
        "amenities": ["24/7 Emergency", "International Coordination", "Airport Transfer", "In-house Accommodation"],
        "languages": ["English", "Tamil", "Hindi", "Telugu"]
    },
    {
        "id": "hosp_002",
        "name": "Bumrungrad International Hospital",
        "location": {
            "city": "Bangkok",
            "country": "Thailand",
            "address": "33 Sukhumvit 3, Wattana, Bangkok 10110",
            "coordinates": {"lat": 13.7563, "lng": 100.5018}
        },
        "specialties": ["Cosmetic Surgery", "IVF", "Orthopedics", "Cardiology", "Wellness"],
        "accreditations": ["JCI", "ISO", "TEMOS"],
        "rating": 4.9,
        "reviews_count": 3421,
        "photos": [
            "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800",
            "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800"
        ],
        "description": "Southeast Asia's leading international hospital, serving patients from over 190 countries with world-class medical care.",
        "contact": {
            "phone": "+66-2-667-1000",
            "email": "info@bumrungrad.com", 
            "website": "https://www.bumrungrad.com"
        },
        "doctors": [
            {
                "id": "doc_003",
                "name": "Dr. Somchai Thanasarn",
                "specialty": "Cosmetic Surgery",
                "experience_years": 20,
                "qualification": "MD Plastic Surgery, FRCST",
                "photo_url": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400",
                "rating": 4.8,
                "reviews_count": 1234
            }
        ],
        "procedures": [
            {"name": "Rhinoplasty", "price_range": "$3000-5000"},
            {"name": "IVF Treatment", "price_range": "$4500-7000"},
            {"name": "Hip Replacement", "price_range": "$12000-16000"}
        ],
        "amenities": ["Luxury Accommodation", "Interpreter Services", "Airport Transfer", "Spa & Wellness"],
        "languages": ["English", "Thai", "Arabic", "Japanese", "Chinese"]
    },
    {
        "id": "hosp_003", 
        "name": "Memorial Şişli Hospital",
        "location": {
            "city": "Istanbul",
            "country": "Turkey",
            "address": "Piyalepaşa Bulvarı, Şişli/İstanbul",
            "coordinates": {"lat": 41.0370, "lng": 28.9857}
        },
        "specialties": ["Hair Transplant", "Dental", "Bariatric Surgery", "Cardiology", "Eye Surgery"],
        "accreditations": ["JCI", "ISO", "TUV"],
        "rating": 4.6,
        "reviews_count": 1876,
        "photos": [
            "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800",
            "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800"
        ],
        "description": "Leading Turkish hospital specializing in hair transplant and cosmetic procedures with international quality standards.",
        "contact": {
            "phone": "+90-212-314-6666",
            "email": "international@memorial.com.tr",
            "website": "https://www.memorial.com.tr"
        },
        "doctors": [
            {
                "id": "doc_004",
                "name": "Dr. Mehmet Özkan",
                "specialty": "Hair Transplant",
                "experience_years": 15,
                "qualification": "MD Dermatology, Hair Restoration Specialist", 
                "photo_url": "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400",
                "rating": 4.7,
                "reviews_count": 892
            }
        ],
        "procedures": [
            {"name": "Hair Transplant (FUE)", "price_range": "$2000-3500"},
            {"name": "Gastric Sleeve", "price_range": "$3500-5000"},
            {"name": "Dental Implants", "price_range": "$800-1200"}
        ],
        "amenities": ["VIP Accommodation", "Airport Transfer", "Translation Services", "Recovery Suites"],
        "languages": ["English", "Turkish", "Arabic", "German", "Russian"]
    }
]

MOCK_HOTELS = [
    {
        "id": "hotel_001",
        "name": "Park Hyatt Chennai",
        "location": {
            "city": "Chennai", 
            "country": "India",
            "address": "39 Velachery Road, Guindy, Chennai",
            "coordinates": {"lat": 13.0067, "lng": 80.2206}
        },
        "rating": 4.8,
        "price_per_night": 150.0,
        "distance_from_hospital": 2.5,
        "amenities": ["WiFi", "Restaurant", "Spa", "Gym", "Pool"],
        "photos": ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"]
    },
    {
        "id": "hotel_002",
        "name": "Grande Centre Point Sukhumvit 55",
        "location": {
            "city": "Bangkok",
            "country": "Thailand", 
            "address": "300 Sukhumvit Road, Wattana, Bangkok",
            "coordinates": {"lat": 13.7459, "lng": 100.5621}
        },
        "rating": 4.7,
        "price_per_night": 120.0,
        "distance_from_hospital": 1.2,
        "amenities": ["WiFi", "Restaurant", "Pool", "Fitness Center", "Spa"],
        "photos": ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400"]
    }
]

# Initialize mock data on startup
@app.on_event("startup")
async def init_db():
    # Clear existing data
    await db.hospitals.delete_many({})
    await db.hotels.delete_many({})
    
    # Insert mock hospitals
    for hospital_data in MOCK_HOSPITALS:
        await db.hospitals.insert_one(hospital_data)
    
    # Insert mock hotels  
    for hotel_data in MOCK_HOTELS:
        await db.hotels.insert_one(hotel_data)

# Routes
@api_router.get("/")
async def root():
    return {"message": "YourCareTrip API is running"}

@api_router.get("/hospitals/search")
async def search_hospitals(
    q: Optional[str] = Query(None, description="Search query"),
    location: Optional[str] = Query(None),
    specialty: Optional[str] = Query(None),
    accreditation: Optional[str] = Query(None),
    rating_min: Optional[float] = Query(None)
):
    """Search hospitals with filters"""
    query_filter = {}
    
    if q:
        query_filter["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"specialties": {"$regex": q, "$options": "i"}},
            {"location.city": {"$regex": q, "$options": "i"}},
            {"location.country": {"$regex": q, "$options": "i"}},
            {"doctors.name": {"$regex": q, "$options": "i"}},
            {"procedures.name": {"$regex": q, "$options": "i"}}
        ]
    
    if location:
        query_filter["$or"] = query_filter.get("$or", []) + [
            {"location.city": {"$regex": location, "$options": "i"}},
            {"location.country": {"$regex": location, "$options": "i"}}
        ]
    
    if specialty:
        query_filter["specialties"] = {"$regex": specialty, "$options": "i"}
    
    if accreditation:
        query_filter["accreditations"] = {"$regex": accreditation, "$options": "i"}
        
    if rating_min:
        query_filter["rating"] = {"$gte": rating_min}
    
    hospitals = await db.hospitals.find(query_filter).to_list(100)
    
    # Remove MongoDB _id field
    for hospital in hospitals:
        hospital.pop('_id', None)
    
    return {"hospitals": hospitals, "total": len(hospitals)}

@api_router.get("/hospitals/{hospital_id}")
async def get_hospital_details(hospital_id: str):
    """Get detailed hospital information"""
    hospital = await db.hospitals.find_one({"id": hospital_id})
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    hospital.pop('_id', None)
    return hospital

@api_router.get("/hospitals/{hospital_id}/nearby-hotels")
async def get_nearby_hotels(hospital_id: str):
    """Get hotels near a specific hospital"""
    hospital = await db.hospitals.find_one({"id": hospital_id})
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    hospital_city = hospital["location"]["city"]
    hotels = await db.hotels.find({"location.city": hospital_city}).to_list(50)
    
    # Remove MongoDB _id field
    for hotel in hotels:
        hotel.pop('_id', None)
    
    return {"hotels": hotels}

@api_router.post("/packages/calculate")
async def calculate_package(package_item: PackageItem):
    """Calculate package cost based on selected items"""
    # Get hospital details
    hospital = await db.hospitals.find_one({"id": package_item.hospital_id})
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    # Find procedure cost
    procedure_cost = 0
    for proc in hospital["procedures"]:
        if proc["name"].lower() == package_item.procedure.lower():
            # Extract average price from range (e.g., "$7000-9500" -> 8250)
            price_range = proc["price_range"].replace("$", "").replace(",", "")
            if "-" in price_range:
                min_price, max_price = map(float, price_range.split("-"))
                procedure_cost = (min_price + max_price) / 2
            break
    
    # Get hotel cost if selected
    accommodation_cost = 0
    if package_item.hotel_id:
        hotel = await db.hotels.find_one({"id": package_item.hotel_id})
        if hotel:
            accommodation_cost = hotel["price_per_night"] * package_item.accommodation_days
    
    # Calculate service costs
    service_costs = {
        "Airport Transfer": 50,
        "Case Manager": 200,
        "Local SIM Card": 25,
        "Private Nurse": 100,
        "City Tour": 150
    }
    
    services_cost = sum(service_costs.get(service, 0) for service in package_item.services)
    
    total_cost = procedure_cost + accommodation_cost + services_cost
    
    breakdown = {
        "procedure": procedure_cost,
        "accommodation": accommodation_cost,
        "services": services_cost,
        "total": total_cost
    }
    
    package = Package(
        items=package_item,
        total_cost=total_cost,
        breakdown=breakdown
    )
    
    return package

@api_router.get("/locations/popular")
async def get_popular_locations():
    """Get popular medical tourism locations"""
    locations = [
        {"city": "Chennai", "country": "India", "flag": "🇮🇳"},
        {"city": "Bangkok", "country": "Thailand", "flag": "🇹🇭"},
        {"city": "Istanbul", "country": "Turkey", "flag": "🇹🇷"},
        {"city": "Singapore", "country": "Singapore", "flag": "🇸🇬"},
        {"city": "Dubai", "country": "UAE", "flag": "🇦🇪"},
        {"city": "Seoul", "country": "South Korea", "flag": "🇰🇷"}
    ]
    return {"locations": locations}

@api_router.get("/specialties/popular")
async def get_popular_specialties():
    """Get popular medical specialties"""
    specialties = [
        {"name": "Cardiology", "icon": "❤️"},
        {"name": "Orthopedics", "icon": "🦴"},
        {"name": "Cosmetic Surgery", "icon": "✨"},
        {"name": "IVF", "icon": "👶"},
        {"name": "Hair Transplant", "icon": "💇‍♂️"},
        {"name": "Dental", "icon": "🦷"},
        {"name": "Oncology", "icon": "🎗️"},
        {"name": "Bariatric Surgery", "icon": "⚖️"}
    ]
    return {"specialties": specialties}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()