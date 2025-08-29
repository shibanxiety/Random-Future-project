import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Components
const SearchBar = ({ onSearch, searchQuery, setSearchQuery }) => (
  <div className="relative w-full max-w-4xl mx-auto">
    <div className="flex items-center bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
      <input
        type="text"
        placeholder="Search hospitals, treatments, doctors, or locations..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 px-6 py-4 text-lg focus:outline-none"
        onKeyPress={(e) => e.key === 'Enter' && onSearch()}
      />
      <button
        onClick={onSearch}
        className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-white font-semibold transition-colors"
      >
        🔍 Search
      </button>
    </div>
  </div>
);

const FilterPanel = ({ filters, setFilters, onApplyFilters }) => (
  <div className="bg-white rounded-xl shadow-md p-6 mb-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <select
        value={filters.location}
        onChange={(e) => setFilters({...filters, location: e.target.value})}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Locations</option>
        <option value="Chennai">Chennai, India</option>
        <option value="Bangkok">Bangkok, Thailand</option>
        <option value="Istanbul">Istanbul, Turkey</option>
      </select>
      
      <select
        value={filters.specialty}
        onChange={(e) => setFilters({...filters, specialty: e.target.value})}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Specialties</option>
        <option value="Cardiology">Cardiology</option>
        <option value="Orthopedics">Orthopedics</option>
        <option value="Cosmetic Surgery">Cosmetic Surgery</option>
        <option value="IVF">IVF</option>
        <option value="Hair Transplant">Hair Transplant</option>
      </select>
      
      <select
        value={filters.accreditation}
        onChange={(e) => setFilters({...filters, accreditation: e.target.value})}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Accreditations</option>
        <option value="JCI">JCI</option>
        <option value="NABH">NABH</option>
        <option value="ISO">ISO</option>
      </select>
      
      <select
        value={filters.rating_min}
        onChange={(e) => setFilters({...filters, rating_min: e.target.value})}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Any Rating</option>
        <option value="4.5">4.5+ Stars</option>
        <option value="4.0">4.0+ Stars</option>
        <option value="3.5">3.5+ Stars</option>
      </select>
      
      <button
        onClick={onApplyFilters}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Apply Filters
      </button>
    </div>
  </div>
);

const HospitalCard = ({ hospital, onViewDetails, onCreatePackage }) => (
  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
    <div className="relative">
      <img
        src={hospital.photos[0]}
        alt={hospital.name}
        className="w-full h-48 object-cover"
      />
      <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
        ⭐ {hospital.rating} ({hospital.reviews_count})
      </div>
    </div>
    
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-2">{hospital.name}</h3>
      <p className="text-gray-600 mb-3">
        📍 {hospital.location.city}, {hospital.location.country}
      </p>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">Specialties:</p>
        <div className="flex flex-wrap gap-1">
          {hospital.specialties.slice(0, 3).map((specialty, idx) => (
            <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {specialty}
            </span>
          ))}
          {hospital.specialties.length > 3 && (
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              +{hospital.specialties.length - 3} more
            </span>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-1">Popular Procedures:</p>
        {hospital.procedures.slice(0, 2).map((proc, idx) => (
          <p key={idx} className="text-sm text-gray-700">
            • {proc.name}: {proc.price_range}
          </p>
        ))}
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={() => onViewDetails(hospital)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => onCreatePackage(hospital)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          Create Package
        </button>
      </div>
    </div>
  </div>
);

const HospitalDetails = ({ hospital, onBack, onCreatePackage }) => (
  <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
    <div className="relative">
      <img
        src={hospital.photos[0]}
        alt={hospital.name}
        className="w-full h-64 object-cover"
      />
      <button
        onClick={onBack}
        className="absolute top-4 left-4 bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-md transition-colors"
      >
        ← Back to Search
      </button>
    </div>
    
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{hospital.name}</h1>
          <p className="text-lg text-gray-600">📍 {hospital.location.address}</p>
          <p className="text-gray-600">{hospital.location.city}, {hospital.location.country}</p>
        </div>
        <div className="text-right">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg mb-2">
            ⭐ {hospital.rating}/5 ({hospital.reviews_count} reviews)
          </div>
          <button
            onClick={() => onCreatePackage(hospital)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Create Package
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">About</h3>
          <p className="text-gray-700 mb-6">{hospital.description}</p>
          
          <h3 className="text-xl font-semibold mb-4">Specialties</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {hospital.specialties.map((specialty, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {specialty}
              </span>
            ))}
          </div>
          
          <h3 className="text-xl font-semibold mb-4">Accreditations</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {hospital.accreditations.map((acc, idx) => (
              <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                {acc}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-4">Featured Doctors</h3>
          <div className="space-y-4 mb-6">
            {hospital.doctors.map((doctor, idx) => (
              <div key={idx} className="flex items-center space-x-4 p-4 border rounded-lg">
                <img
                  src={doctor.photo_url}
                  alt={doctor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">{doctor.name}</h4>
                  <p className="text-gray-600">{doctor.specialty}</p>
                  <p className="text-sm text-gray-500">{doctor.experience_years} years experience</p>
                  <p className="text-sm text-green-600">⭐ {doctor.rating} ({doctor.reviews_count} reviews)</p>
                </div>
              </div>
            ))}
          </div>
          
          <h3 className="text-xl font-semibold mb-4">Popular Procedures & Pricing</h3>
          <div className="space-y-3">
            {hospital.procedures.map((proc, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{proc.name}</span>
                <span className="text-green-600 font-semibold">{proc.price_range}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const PackageMaker = ({ hospital, onBack }) => {
  const [step, setStep] = useState(1);
  const [selectedProcedure, setSelectedProcedure] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [accommodationDays, setAccommodationDays] = useState(3);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [nearbyHotels, setNearbyHotels] = useState([]);
  const [packageQuote, setPackageQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  const availableServices = [
    'Airport Transfer',
    'Case Manager', 
    'Local SIM Card',
    'Private Nurse',
    'City Tour'
  ];

  useEffect(() => {
    if (hospital) {
      fetchNearbyHotels();
    }
  }, [hospital]);

  const fetchNearbyHotels = async () => {
    try {
      const response = await axios.get(`${API}/hospitals/${hospital.id}/nearby-hotels`);
      setNearbyHotels(response.data.hotels);
    } catch (error) {
      console.error('Error fetching nearby hotels:', error);
    }
  };

  const calculatePackage = async () => {
    setLoading(true);
    try {
      const packageData = {
        hospital_id: hospital.id,
        doctor_id: selectedDoctor || null,
        procedure: selectedProcedure,
        accommodation_days: accommodationDays,
        hotel_id: selectedHotel || null,
        services: selectedServices
      };

      const response = await axios.post(`${API}/packages/calculate`, packageData);
      setPackageQuote(response.data);
      setStep(5);
    } catch (error) {
      console.error('Error calculating package:', error);
    }
    setLoading(false);
  };

  const toggleService = (service) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Hospital Details
        </button>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <div
              key={num}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Step 1: Select Procedure</h2>
          <div className="space-y-3">
            {hospital.procedures.map((proc, idx) => (
              <label key={idx} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="procedure"
                  value={proc.name}
                  checked={selectedProcedure === proc.name}
                  onChange={(e) => setSelectedProcedure(e.target.value)}
                  className="text-blue-600"
                />
                <div className="flex-1">
                  <span className="font-medium">{proc.name}</span>
                  <span className="text-green-600 font-semibold ml-4">{proc.price_range}</span>
                </div>
              </label>
            ))}
          </div>
          <button
            onClick={() => selectedProcedure && setStep(2)}
            disabled={!selectedProcedure}
            className="mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Next Step
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Step 2: Choose Doctor (Optional)</h2>
          <div className="space-y-4">
            <label className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="doctor"
                value=""
                checked={selectedDoctor === ''}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="text-blue-600"
              />
              <span>No preference - Hospital will assign</span>
            </label>
            {hospital.doctors.map((doctor, idx) => (
              <label key={idx} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="doctor"
                  value={doctor.id}
                  checked={selectedDoctor === doctor.id}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="text-blue-600"
                />
                <img src={doctor.photo_url} alt={doctor.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="font-medium">{doctor.name}</div>
                  <div className="text-gray-600">{doctor.specialty} • {doctor.experience_years} years</div>
                  <div className="text-sm text-green-600">⭐ {doctor.rating} ({doctor.reviews_count} reviews)</div>
                </div>
              </label>
            ))}
          </div>
          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => setStep(1)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setStep(3)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Step 3: Accommodation</h2>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of nights needed:
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={accommodationDays}
              onChange={(e) => setAccommodationDays(parseInt(e.target.value))}
              className="w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="hotel"
                value=""
                checked={selectedHotel === ''}
                onChange={(e) => setSelectedHotel(e.target.value)}
                className="text-blue-600"
              />
              <span>I'll arrange my own accommodation</span>
            </label>
            {nearbyHotels.map((hotel, idx) => (
              <label key={idx} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="hotel"
                  value={hotel.id}
                  checked={selectedHotel === hotel.id}
                  onChange={(e) => setSelectedHotel(e.target.value)}
                  className="text-blue-600"
                />
                <img src={hotel.photos[0]} alt={hotel.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="font-medium">{hotel.name}</div>
                  <div className="text-gray-600">⭐ {hotel.rating} • {hotel.distance_from_hospital}km from hospital</div>
                  <div className="text-green-600 font-semibold">${hotel.price_per_night}/night</div>
                </div>
              </label>
            ))}
          </div>
          
          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => setStep(2)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setStep(4)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Step 4: Additional Services</h2>
          <div className="space-y-3">
            {availableServices.map((service, idx) => (
              <label key={idx} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedServices.includes(service)}
                  onChange={() => toggleService(service)}
                  className="text-blue-600"
                />
                <span className="font-medium">{service}</span>
              </label>
            ))}
          </div>
          
          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => setStep(3)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Previous
            </button>
            <button
              onClick={calculatePackage}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Calculating...' : 'Get Quote'}
            </button>
          </div>
        </div>
      )}

      {step === 5 && packageQuote && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Package Quote</h2>
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">Package Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Hospital:</span>
                <span className="font-medium">{hospital.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Procedure:</span>
                <span className="font-medium">{selectedProcedure}</span>
              </div>
              {selectedDoctor && (
                <div className="flex justify-between">
                  <span>Doctor:</span>
                  <span className="font-medium">
                    {hospital.doctors.find(d => d.id === selectedDoctor)?.name}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Accommodation:</span>
                <span className="font-medium">{accommodationDays} nights</span>
              </div>
              {selectedServices.length > 0 && (
                <div className="flex justify-between">
                  <span>Services:</span>
                  <span className="font-medium">{selectedServices.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">Cost Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Medical Procedure</span>
                <span className="font-medium">${packageQuote.breakdown.procedure.toFixed(2)}</span>
              </div>
              {packageQuote.breakdown.accommodation > 0 && (
                <div className="flex justify-between">
                  <span>Accommodation ({accommodationDays} nights)</span>
                  <span className="font-medium">${packageQuote.breakdown.accommodation.toFixed(2)}</span>
                </div>
              )}
              {packageQuote.breakdown.services > 0 && (
                <div className="flex justify-between">
                  <span>Additional Services</span>
                  <span className="font-medium">${packageQuote.breakdown.services.toFixed(2)}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-xl font-bold text-green-600">
                <span>Total Package Cost</span>
                <span>${packageQuote.total_cost.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => setStep(4)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Modify Package
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Book This Package
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    specialty: '',
    accreditation: '',
    rating_min: ''
  });
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popularLocations, setPopularLocations] = useState([]);
  const [popularSpecialties, setPopularSpecialties] = useState([]);

  useEffect(() => {
    fetchPopularData();
  }, []);

  const fetchPopularData = async () => {
    try {
      const [locationsRes, specialtiesRes] = await Promise.all([
        axios.get(`${API}/locations/popular`),
        axios.get(`${API}/specialties/popular`)
      ]);
      setPopularLocations(locationsRes.data.locations);
      setPopularSpecialties(specialtiesRes.data.specialties);
    } catch (error) {
      console.error('Error fetching popular data:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      
      const response = await axios.get(`${API}/hospitals/search?${params}`);
      setHospitals(response.data.hospitals);
      setCurrentView('results');
    } catch (error) {
      console.error('Error searching hospitals:', error);
    }
    setLoading(false);
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await axios.get(`${API}/hospitals/search?${params}`);
      setHospitals(response.data.hospitals);
    } catch (error) {
      console.error('Error applying filters:', error);
    }
    setLoading(false);
  };

  const handleViewDetails = (hospital) => {
    setSelectedHospital(hospital);
    setCurrentView('details');
  };

  const handleCreatePackage = (hospital) => {
    setSelectedHospital(hospital);
    setCurrentView('package');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => setCurrentView('search')}>
              🏥 YourCareTrip
            </h1>
            <nav className="flex space-x-6">
              <button className="text-gray-600 hover:text-blue-600 font-medium">Find Hospitals</button>
              <button className="text-gray-600 hover:text-blue-600 font-medium">My Packages</button>
              <button className="text-gray-600 hover:text-blue-600 font-medium">About</button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'search' && (
          <div>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
                Find World-Class <br />
                <span className="text-blue-600">Healthcare</span> Anywhere
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Discover top hospitals and medical professionals worldwide. Plan your medical journey with transparent pricing and comprehensive packages.
              </p>
              
              <SearchBar 
                onSearch={handleSearch}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>

            {/* Popular Locations */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Popular Destinations</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {popularLocations.map((location, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(`${location.city}, ${location.country}`);
                      handleSearch();
                    }}
                    className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg px-6 py-4 text-center transition-colors"
                  >
                    <div className="text-3xl mb-2">{location.flag}</div>
                    <div className="font-semibold text-gray-800">{location.city}</div>
                    <div className="text-sm text-gray-600">{location.country}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Specialties */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Popular Treatments</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {popularSpecialties.map((specialty, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(specialty.name);
                      handleSearch();
                    }}
                    className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg p-6 text-center transition-colors"
                  >
                    <div className="text-4xl mb-3">{specialty.icon}</div>
                    <div className="font-semibold text-gray-800">{specialty.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'results' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Search Results ({hospitals.length} hospitals found)
              </h2>
              <button
                onClick={() => setCurrentView('search')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← New Search
              </button>
            </div>
            
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              onApplyFilters={handleApplyFilters}
            />
            
            {loading ? (
              <div className="text-center py-12">
                <div className="text-lg text-gray-600">Searching hospitals...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hospitals.map((hospital, idx) => (
                  <HospitalCard
                    key={idx}
                    hospital={hospital}
                    onViewDetails={handleViewDetails}
                    onCreatePackage={handleCreatePackage}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'details' && selectedHospital && (
          <HospitalDetails
            hospital={selectedHospital}
            onBack={() => setCurrentView('results')}
            onCreatePackage={handleCreatePackage}
          />
        )}

        {currentView === 'package' && selectedHospital && (
          <PackageMaker
            hospital={selectedHospital}
            onBack={() => setCurrentView('details')}
          />
        )}
      </main>
    </div>
  );
}

export default App;