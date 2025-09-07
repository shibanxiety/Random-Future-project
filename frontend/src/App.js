import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Components
const SearchBar = ({ onSearch, searchQuery, setSearchQuery }) => (
  <div className="relative w-full max-w-5xl mx-auto">
    <div className="flex items-center bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden backdrop-blur-sm">
      <div className="pl-6 text-gray-400">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search hospitals, treatments, doctors, or locations..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 px-4 py-5 text-lg focus:outline-none placeholder-gray-400"
        onKeyPress={(e) => e.key === 'Enter' && onSearch()}
      />
      <button
        onClick={onSearch}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-10 py-5 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        <span className="flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Search</span>
        </span>
      </button>
    </div>
  </div>
);

const FilterPanel = ({ filters, setFilters, onApplyFilters }) => (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
    <div className="flex items-center mb-6">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-800">Advanced Filters</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Location</label>
        <select
          value={filters.location}
          onChange={(e) => setFilters({...filters, location: e.target.value})}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">All Locations</option>
          <option value="Chennai">Chennai, India</option>
          <option value="Bangkok">Bangkok, Thailand</option>
          <option value="Istanbul">Istanbul, Turkey</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Specialty</label>
        <select
          value={filters.specialty}
          onChange={(e) => setFilters({...filters, specialty: e.target.value})}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">All Specialties</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Orthopedics">Orthopedics</option>
          <option value="Cosmetic Surgery">Cosmetic Surgery</option>
          <option value="IVF">IVF</option>
          <option value="Hair Transplant">Hair Transplant</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Accreditation</label>
        <select
          value={filters.accreditation}
          onChange={(e) => setFilters({...filters, accreditation: e.target.value})}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">All Accreditations</option>
          <option value="JCI">JCI</option>
          <option value="NABH">NABH</option>
          <option value="ISO">ISO</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Minimum Rating</label>
        <select
          value={filters.rating_min}
          onChange={(e) => setFilters({...filters, rating_min: e.target.value})}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">Any Rating</option>
          <option value="4.5">4.5+ Stars</option>
          <option value="4.0">4.0+ Stars</option>
          <option value="3.5">3.5+ Stars</option>
        </select>
      </div>
      
      <div className="flex items-end">
        <button
          onClick={onApplyFilters}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <span className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            <span>Apply Filters</span>
          </span>
        </button>
      </div>
    </div>
  </div>
);

const HospitalCard = ({ hospital, onViewDetails, onCreatePackage }) => (
  <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group transform hover:-translate-y-2 border border-gray-100">
    <div className="relative overflow-hidden">
      <img
        src={hospital.photos[0]}
        alt={hospital.name}
        className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
        <span className="flex items-center space-x-1">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>{hospital.rating}</span>
        </span>
      </div>
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
        {hospital.reviews_count} reviews
      </div>
    </div>
    
    <div className="p-8">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
          {hospital.name}
        </h3>
        <div className="flex space-x-1">
          {hospital.accreditations.slice(0, 2).map((acc, idx) => (
            <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
              {acc}
            </span>
          ))}
        </div>
      </div>
      
      <p className="text-gray-600 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {hospital.location.city}, {hospital.location.country}
      </p>
      
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Top Specialties:</p>
        <div className="flex flex-wrap gap-2">
          {hospital.specialties.slice(0, 3).map((specialty, idx) => (
            <span key={idx} className="bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 text-sm px-3 py-2 rounded-xl font-medium border border-indigo-100">
              {specialty}
            </span>
          ))}
          {hospital.specialties.length > 3 && (
            <span className="bg-gray-50 text-gray-600 text-sm px-3 py-2 rounded-xl font-medium border border-gray-200">
              +{hospital.specialties.length - 3} more
            </span>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Popular Procedures:</p>
        <div className="space-y-2">
          {hospital.procedures.slice(0, 2).map((proc, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-700 font-medium">{proc.name}</span>
              <span className="text-emerald-600 font-bold">{proc.price_range}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={() => onViewDetails(hospital)}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          View Details
        </button>
        <button
          onClick={() => onCreatePackage(hospital)}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
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
      <header className="bg-white shadow-sm border-b backdrop-blur-md bg-white/95 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent cursor-pointer flex items-center space-x-3" onClick={() => setCurrentView('search')}>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span>YourCareTrip</span>
            </h1>
            <nav className="flex space-x-8">
              <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-300 hover:scale-105 transform">Find Hospitals</button>
              <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-300 hover:scale-105 transform">My Packages</button>
              <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-300 hover:scale-105 transform">About</button>
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
                Sign In
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'search' && (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-500/20 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10 pt-20 pb-32">
              {/* Hero Section */}
              <div className="text-center mb-16">
                <div className="max-w-5xl mx-auto px-6">
                  <div className="inline-block mb-6">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      🌟 World's Most Trusted Medical Tourism Platform
                    </span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
                    Find World-Class <br />
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Healthcare
                    </span> Anywhere
                  </h2>
                  <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                    Discover top hospitals and medical professionals worldwide. Plan your medical journey with 
                    <span className="font-semibold text-indigo-600"> transparent pricing</span> and 
                    <span className="font-semibold text-indigo-600"> comprehensive packages</span>.
                  </p>
                  
                  <SearchBar 
                    onSearch={handleSearch}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                  />
                  
                  <div className="mt-8 flex justify-center space-x-8 text-sm text-gray-500">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      JCI Accredited Hospitals
                    </span>
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Transparent Pricing
                    </span>
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Complete Care Packages
                    </span>
                  </div>
                </div>
              </div>

              {/* Popular Destinations */}
              <div className="mb-20 px-6">
                <div className="max-w-7xl mx-auto">
                  <h3 className="text-4xl font-bold text-gray-800 mb-4 text-center">Popular Destinations</h3>
                  <p className="text-gray-600 text-center mb-12 text-lg">Discover world-class healthcare in these medical tourism hotspots</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {popularLocations.map((location, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery(`${location.city}, ${location.country}`);
                          handleSearch();
                        }}
                        className="group bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 border border-gray-200 hover:border-blue-300 rounded-2xl p-8 text-center transition-all duration-500 transform hover:scale-105 hover:shadow-xl"
                      >
                        <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{location.flag}</div>
                        <div className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">{location.city}</div>
                        <div className="text-gray-500 group-hover:text-blue-500 transition-colors">{location.country}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Popular Specialties */}
              <div className="px-6">
                <div className="max-w-7xl mx-auto">
                  <h3 className="text-4xl font-bold text-gray-800 mb-4 text-center">Popular Treatments</h3>
                  <p className="text-gray-600 text-center mb-12 text-lg">Find specialized medical care for your specific needs</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {popularSpecialties.map((specialty, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery(specialty.name);
                          handleSearch();
                        }}
                        className="group bg-white hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 border border-gray-200 hover:border-indigo-300 rounded-2xl p-8 text-center transition-all duration-500 transform hover:scale-105 hover:shadow-xl"
                      >
                        <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{specialty.icon}</div>
                        <div className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">{specialty.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'results' && (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-4xl font-bold text-gray-800 mb-2">
                    Search Results
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {hospitals.length} world-class hospitals found for your needs
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('search')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>New Search</span>
                </button>
              </div>
              
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                onApplyFilters={handleApplyFilters}
              />
              
              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <div className="text-xl text-gray-600">Searching world-class hospitals...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
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