#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for YourCareTrip
Tests all backend APIs including Hospital Search, Details, Package Calculator, Hotels, and Popular Data
"""

import requests
import json
import sys
from typing import Dict, Any, List
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from frontend environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://yourcareguide.preview.emergentagent.com')
API_BASE_URL = f"{BACKEND_URL}/api"

class YourCareTripAPITester:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.test_results = []
        self.failed_tests = []
        
    def log_test(self, test_name: str, success: bool, details: str, response_data: Any = None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'details': details,
            'response_data': response_data
        }
        self.test_results.append(result)
        if not success:
            self.failed_tests.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
    
    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_test("API Root", True, f"API is running: {data['message']}", data)
                else:
                    self.log_test("API Root", False, "Missing message in response", data)
            else:
                self.log_test("API Root", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("API Root", False, f"Connection error: {str(e)}")
    
    def test_hospital_search_basic(self):
        """Test basic hospital search without filters"""
        try:
            response = requests.get(f"{self.base_url}/hospitals/search", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "hospitals" in data and "total" in data:
                    hospitals = data["hospitals"]
                    total = data["total"]
                    if len(hospitals) > 0:
                        self.log_test("Hospital Search Basic", True, 
                                    f"Found {total} hospitals, first: {hospitals[0]['name']}", 
                                    {"total": total, "sample_hospital": hospitals[0]["name"]})
                    else:
                        self.log_test("Hospital Search Basic", False, "No hospitals returned", data)
                else:
                    self.log_test("Hospital Search Basic", False, "Missing hospitals/total in response", data)
            else:
                self.log_test("Hospital Search Basic", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Hospital Search Basic", False, f"Error: {str(e)}")
    
    def test_hospital_search_with_query(self):
        """Test hospital search with query parameters"""
        test_queries = [
            ("cardiology", "Cardiology specialty search"),
            ("Chennai", "Chennai location search"),
            ("Apollo", "Apollo hospital search")
        ]
        
        for query, description in test_queries:
            try:
                response = requests.get(f"{self.base_url}/hospitals/search?q={query}", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    hospitals = data.get("hospitals", [])
                    if len(hospitals) > 0:
                        # Check if results are relevant
                        found_match = any(
                            query.lower() in hospital.get("name", "").lower() or
                            query.lower() in str(hospital.get("specialties", [])).lower() or
                            query.lower() in hospital.get("location", {}).get("city", "").lower()
                            for hospital in hospitals
                        )
                        if found_match:
                            self.log_test(f"Hospital Search Query: {query}", True, 
                                        f"{description} - Found {len(hospitals)} relevant results")
                        else:
                            self.log_test(f"Hospital Search Query: {query}", False, 
                                        f"{description} - Results not relevant to query")
                    else:
                        self.log_test(f"Hospital Search Query: {query}", False, 
                                    f"{description} - No results found")
                else:
                    self.log_test(f"Hospital Search Query: {query}", False, 
                                f"HTTP {response.status_code}")
            except Exception as e:
                self.log_test(f"Hospital Search Query: {query}", False, f"Error: {str(e)}")
    
    def test_hospital_search_filters(self):
        """Test hospital search with various filters"""
        filter_tests = [
            ({"location": "Chennai"}, "Location filter"),
            ({"specialty": "Cardiology"}, "Specialty filter"),
            ({"accreditation": "JCI"}, "Accreditation filter"),
            ({"rating_min": 4.5}, "Rating minimum filter"),
            ({"location": "Bangkok", "specialty": "Cosmetic Surgery"}, "Combined filters")
        ]
        
        for filters, description in filter_tests:
            try:
                params = "&".join([f"{k}={v}" for k, v in filters.items()])
                response = requests.get(f"{self.base_url}/hospitals/search?{params}", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    hospitals = data.get("hospitals", [])
                    self.log_test(f"Hospital Search Filter: {description}", True, 
                                f"Filter applied successfully - Found {len(hospitals)} results")
                else:
                    self.log_test(f"Hospital Search Filter: {description}", False, 
                                f"HTTP {response.status_code}")
            except Exception as e:
                self.log_test(f"Hospital Search Filter: {description}", False, f"Error: {str(e)}")
    
    def test_hospital_details(self):
        """Test hospital details API with sample hospital IDs"""
        test_hospital_ids = ["hosp_001", "hosp_002", "hosp_003"]
        
        for hospital_id in test_hospital_ids:
            try:
                response = requests.get(f"{self.base_url}/hospitals/{hospital_id}", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    required_fields = ["id", "name", "location", "specialties", "doctors", "procedures"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        self.log_test(f"Hospital Details: {hospital_id}", True, 
                                    f"Complete hospital profile for {data['name']}")
                    else:
                        self.log_test(f"Hospital Details: {hospital_id}", False, 
                                    f"Missing fields: {missing_fields}")
                elif response.status_code == 404:
                    self.log_test(f"Hospital Details: {hospital_id}", False, 
                                "Hospital not found (404)")
                else:
                    self.log_test(f"Hospital Details: {hospital_id}", False, 
                                f"HTTP {response.status_code}")
            except Exception as e:
                self.log_test(f"Hospital Details: {hospital_id}", False, f"Error: {str(e)}")
        
        # Test invalid hospital ID
        try:
            response = requests.get(f"{self.base_url}/hospitals/invalid_id", timeout=10)
            if response.status_code == 404:
                self.log_test("Hospital Details: Invalid ID", True, 
                            "Correctly returns 404 for invalid hospital ID")
            else:
                self.log_test("Hospital Details: Invalid ID", False, 
                            f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Hospital Details: Invalid ID", False, f"Error: {str(e)}")
    
    def test_package_calculator(self):
        """Test package calculator API"""
        test_packages = [
            {
                "hospital_id": "hosp_001",
                "procedure": "Heart Bypass Surgery",
                "accommodation_days": 7,
                "services": ["Airport Transfer", "Case Manager"]
            },
            {
                "hospital_id": "hosp_002", 
                "procedure": "Rhinoplasty",
                "accommodation_days": 5,
                "hotel_id": "hotel_002",
                "services": ["Airport Transfer", "Private Nurse", "City Tour"]
            },
            {
                "hospital_id": "hosp_003",
                "procedure": "Hair Transplant (FUE)",
                "accommodation_days": 3,
                "services": ["Local SIM Card"]
            }
        ]
        
        for i, package_data in enumerate(test_packages):
            try:
                response = requests.post(f"{self.base_url}/packages/calculate", 
                                       json=package_data, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    required_fields = ["total_cost", "breakdown", "items"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        breakdown = data["breakdown"]
                        total = data["total_cost"]
                        self.log_test(f"Package Calculator: Test {i+1}", True, 
                                    f"Package calculated - Total: ${total}, Breakdown: {breakdown}")
                    else:
                        self.log_test(f"Package Calculator: Test {i+1}", False, 
                                    f"Missing fields: {missing_fields}")
                else:
                    self.log_test(f"Package Calculator: Test {i+1}", False, 
                                f"HTTP {response.status_code}")
            except Exception as e:
                self.log_test(f"Package Calculator: Test {i+1}", False, f"Error: {str(e)}")
        
        # Test invalid hospital ID
        try:
            invalid_package = {
                "hospital_id": "invalid_hospital",
                "procedure": "Test Procedure",
                "accommodation_days": 1,
                "services": []
            }
            response = requests.post(f"{self.base_url}/packages/calculate", 
                                   json=invalid_package, timeout=10)
            if response.status_code == 404:
                self.log_test("Package Calculator: Invalid Hospital", True, 
                            "Correctly returns 404 for invalid hospital")
            else:
                self.log_test("Package Calculator: Invalid Hospital", False, 
                            f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Package Calculator: Invalid Hospital", False, f"Error: {str(e)}")
    
    def test_nearby_hotels(self):
        """Test nearby hotels API"""
        test_hospital_ids = ["hosp_001", "hosp_002", "hosp_003"]
        
        for hospital_id in test_hospital_ids:
            try:
                response = requests.get(f"{self.base_url}/hospitals/{hospital_id}/nearby-hotels", 
                                      timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if "hotels" in data:
                        hotels = data["hotels"]
                        self.log_test(f"Nearby Hotels: {hospital_id}", True, 
                                    f"Found {len(hotels)} nearby hotels")
                    else:
                        self.log_test(f"Nearby Hotels: {hospital_id}", False, 
                                    "Missing hotels field in response")
                elif response.status_code == 404:
                    self.log_test(f"Nearby Hotels: {hospital_id}", False, 
                                "Hospital not found (404)")
                else:
                    self.log_test(f"Nearby Hotels: {hospital_id}", False, 
                                f"HTTP {response.status_code}")
            except Exception as e:
                self.log_test(f"Nearby Hotels: {hospital_id}", False, f"Error: {str(e)}")
    
    def test_popular_locations(self):
        """Test popular locations API"""
        try:
            response = requests.get(f"{self.base_url}/locations/popular", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "locations" in data:
                    locations = data["locations"]
                    if len(locations) > 0:
                        sample_location = locations[0]
                        required_fields = ["city", "country"]
                        if all(field in sample_location for field in required_fields):
                            self.log_test("Popular Locations", True, 
                                        f"Found {len(locations)} popular locations")
                        else:
                            self.log_test("Popular Locations", False, 
                                        "Location objects missing required fields")
                    else:
                        self.log_test("Popular Locations", False, "No locations returned")
                else:
                    self.log_test("Popular Locations", False, "Missing locations field")
            else:
                self.log_test("Popular Locations", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Popular Locations", False, f"Error: {str(e)}")
    
    def test_popular_specialties(self):
        """Test popular specialties API"""
        try:
            response = requests.get(f"{self.base_url}/specialties/popular", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "specialties" in data:
                    specialties = data["specialties"]
                    if len(specialties) > 0:
                        sample_specialty = specialties[0]
                        if "name" in sample_specialty:
                            self.log_test("Popular Specialties", True, 
                                        f"Found {len(specialties)} popular specialties")
                        else:
                            self.log_test("Popular Specialties", False, 
                                        "Specialty objects missing name field")
                    else:
                        self.log_test("Popular Specialties", False, "No specialties returned")
                else:
                    self.log_test("Popular Specialties", False, "Missing specialties field")
            else:
                self.log_test("Popular Specialties", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Popular Specialties", False, f"Error: {str(e)}")
    
    def run_all_tests(self):
        """Run comprehensive API tests"""
        print(f"🚀 Starting YourCareTrip Backend API Tests")
        print(f"📍 Testing API at: {self.base_url}")
        print("=" * 80)
        
        # Test API connectivity
        self.test_api_root()
        
        # Test Hospital Search APIs
        print("\n🏥 Testing Hospital Search APIs...")
        self.test_hospital_search_basic()
        self.test_hospital_search_with_query()
        self.test_hospital_search_filters()
        
        # Test Hospital Details API
        print("\n📋 Testing Hospital Details API...")
        self.test_hospital_details()
        
        # Test Package Calculator API
        print("\n💰 Testing Package Calculator API...")
        self.test_package_calculator()
        
        # Test Nearby Hotels API
        print("\n🏨 Testing Nearby Hotels API...")
        self.test_nearby_hotels()
        
        # Test Popular Data APIs
        print("\n⭐ Testing Popular Data APIs...")
        self.test_popular_locations()
        self.test_popular_specialties()
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = total_tests - len(self.failed_tests)
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        return len(self.failed_tests) == 0

if __name__ == "__main__":
    tester = YourCareTripAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! Backend APIs are working correctly.")
        sys.exit(0)
    else:
        print(f"\n⚠️  {len(tester.failed_tests)} test(s) failed. Check the details above.")
        sys.exit(1)