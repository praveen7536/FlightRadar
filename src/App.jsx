import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import FlightMap from './components/FlightMap';
import Loader from './components/Loader';

// Country configurations - optimized for better API performance
const countries = {
  india: {
    name: 'India',
    bounds: { latMin: 6, latMax: 37, lngMin: 68, lngMax: 97 },
    center: [23.5937, 78.9629],
    zoom: 5
  },
  china: {
    name: 'China',
    bounds: { latMin: 18, latMax: 54, lngMin: 73, lngMax: 135 },
    center: [35.8617, 104.1954],
    zoom: 4
  },
  usa: {
    name: 'United States',
    bounds: { latMin: 25, latMax: 50, lngMin: -125, lngMax: -65 },
    center: [39.8283, -98.5795],
    zoom: 4
  },
  germany: {
    name: 'Germany',
    bounds: { latMin: 47, latMax: 55, lngMin: 6, lngMax: 15 },
    center: [51.1657, 10.4515],
    zoom: 6
  },
  france: {
    name: 'France',
    bounds: { latMin: 41, latMax: 51, lngMin: -5, lngMax: 10 },
    center: [46.2276, 2.2137],
    zoom: 6
  },
  uk: {
    name: 'United Kingdom',
    bounds: { latMin: 50, latMax: 59, lngMin: -8, lngMax: 2 },
    center: [55.3781, -3.4360],
    zoom: 6
  },
  japan: {
    name: 'Japan',
    bounds: { latMin: 30, latMax: 46, lngMin: 129, lngMax: 146 },
    center: [36.2048, 138.2529],
    zoom: 5
  },
  australia: {
    name: 'Australia',
    bounds: { latMin: -44, latMax: -10, lngMin: 113, lngMax: 154 },
    center: [-25.2744, 133.7751],
    zoom: 4
  }
};

function App() {
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('india');

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Calculate estimated destination based on current position, heading, and speed
  const calculateEstimatedDestination = useCallback((lat, lng, heading, speed) => {
    if (!heading || !speed || speed < 10) return null; // Only for moving aircraft
    
    // Convert heading to radians
    const headingRad = (heading * Math.PI) / 180;
    
    // Calculate distance based on speed (assuming 1 hour flight)
    const distanceKm = (speed * 3.6) / 1000; // Convert m/s to km/h, then divide by 1000 for reasonable distance
    
    // Earth's radius in kilometers
    const earthRadius = 6371;
    
    // Calculate new position
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    
    const newLatRad = Math.asin(
      Math.sin(latRad) * Math.cos(distanceKm / earthRadius) +
      Math.cos(latRad) * Math.sin(distanceKm / earthRadius) * Math.cos(headingRad)
    );
    
    const newLngRad = lngRad + Math.atan2(
      Math.sin(headingRad) * Math.sin(distanceKm / earthRadius) * Math.cos(latRad),
      Math.cos(distanceKm / earthRadius) - Math.sin(latRad) * Math.sin(newLatRad)
    );
    
    return {
      latitude: (newLatRad * 180) / Math.PI,
      longitude: (newLngRad * 180) / Math.PI
    };
  }, []);

  // Generate sample data for demonstration
  const generateSampleData = useCallback((countryKey) => {
    const country = countries[countryKey];
    
    // Create more realistic flight patterns
    const flightPatterns = [
      {
        callsign: 'AI101',
        baseLat: country.center[0] + 2,
        baseLng: country.center[1] - 3,
        altitude: 12000,
        speed: 250,
        heading: 45
      },
      {
        callsign: '6E456',
        baseLat: country.center[0] - 1,
        baseLng: country.center[1] + 2,
        altitude: 15000,
        speed: 280,
        heading: 135
      },
      {
        callsign: 'SG789',
        baseLat: country.center[0] + 3,
        baseLng: country.center[1] + 1,
        altitude: 10000,
        speed: 220,
        heading: 225
      },
      {
        callsign: 'UK234',
        baseLat: country.center[0] - 2,
        baseLng: country.center[1] - 2,
        altitude: 18000,
        speed: 300,
        heading: 315
      },
      {
        callsign: '9W567',
        baseLat: country.center[0] + 1,
        baseLng: country.center[1] + 3,
        altitude: 14000,
        speed: 260,
        heading: 90
      },
      {
        callsign: 'IX890',
        baseLat: country.center[0] - 3,
        baseLng: country.center[1] + 1,
        altitude: 11000,
        speed: 240,
        heading: 180
      },
      {
        callsign: 'G8123',
        baseLat: country.center[0] + 2,
        baseLng: country.center[1] - 1,
        altitude: 16000,
        speed: 290,
        heading: 270
      },
      {
        callsign: 'I5456',
        baseLat: country.center[0] - 1,
        baseLng: country.center[1] - 3,
        altitude: 9000,
        speed: 200,
        heading: 0
      }
    ];

    const sampleFlights = flightPatterns.map((pattern, index) => {
      // Add some variation to make it more realistic
      const variation = (Math.random() - 0.5) * 0.5;
      const altitudeVariation = (Math.random() - 0.5) * 2000;
      const speedVariation = (Math.random() - 0.5) * 50;
      
      return {
        id: `sample${index + 1}`,
        callsign: pattern.callsign,
        country: 'India',
        latitude: pattern.baseLat + variation,
        longitude: pattern.baseLng + variation,
        altitude: pattern.altitude + altitudeVariation,
        speed: pattern.speed + speedVariation,
        verticalRate: (Math.random() - 0.5) * 150,
        heading: pattern.heading + (Math.random() - 0.5) * 20,
        timestamp: Date.now() - Math.random() * 60000, // Random timestamp within last minute
        originCountry: 'India',
        squawk: Math.floor(1000 + Math.random() * 9000).toString(),
        onGround: false
      };
    });

    // Add estimated destinations
    const flightsWithDestinations = sampleFlights.map(flight => ({
      ...flight,
      estimatedDestination: calculateEstimatedDestination(flight.latitude, flight.longitude, flight.heading, flight.speed)
    }));
    
    return flightsWithDestinations;
  }, [calculateEstimatedDestination]);

  // Process flight data
  const processFlightData = useCallback((data) => {
    if (!data.states || !Array.isArray(data.states)) {
      throw new Error('Invalid data format received from API');
    }

    const country = countries[selectedCountry];
    
    // Transform the data to a more usable format with country filtering
    const transformedFlights = data.states
      .filter(flight => {
        // Filter out flights without essential data
        if (!flight[1] || !flight[2] || !flight[5] || !flight[6]) return false;
        if (flight[5] === 0 && flight[6] === 0) return false;
        if (isNaN(flight[5]) || isNaN(flight[6])) return false;
        
        // Filter by country bounds
        const lat = flight[6];
        const lng = flight[5];
        return lat >= country.bounds.latMin && 
               lat <= country.bounds.latMax && 
               lng >= country.bounds.lngMin && 
               lng <= country.bounds.lngMax;
      })
      .map(flight => ({
        id: flight[0],
        callsign: flight[1]?.trim() || 'Unknown',
        country: flight[2] || 'Unknown',
        latitude: flight[6],
        longitude: flight[5],
        altitude: flight[7],
        speed: flight[9],
        verticalRate: flight[11],
        heading: flight[10],
        timestamp: flight[4],
        originCountry: flight[2] || 'Unknown',
        squawk: flight[4],
        onGround: flight[8],
        estimatedDestination: calculateEstimatedDestination(flight[6], flight[5], flight[10], flight[9])
      }));

    console.log(`Fetched ${data.states.length} total flights, ${transformedFlights.length} valid flights in ${country.name}`);
    
    setFlights(transformedFlights);
    setFilteredFlights(transformedFlights);
  }, [selectedCountry, calculateEstimatedDestination]);

  // Fetch flight data from OpenSky API with country-specific filtering
  const fetchFlights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const country = countries[selectedCountry];
      const { latMin, latMax, lngMin, lngMax } = country.bounds;
      
      // Use country-specific API call for better performance
      const apiUrl = `https://opensky-network.org/api/states/all?lamin=${latMin}&lamax=${latMax}&lomin=${lngMin}&lomax=${lngMax}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        timeout: 10000 // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.states) {
        throw new Error('Invalid data format received from API');
      }
      
      processFlightData(data);
      
    } catch (err) {
      console.error('Error fetching flights:', err);
      setError('OpenSky Network API is temporarily unavailable. Using realistic sample data for demonstration.');
      const sampleData = generateSampleData(selectedCountry);
      setFlights(sampleData);
      setFilteredFlights(sampleData);
    } finally {
      setLoading(false);
    }
  }, [selectedCountry, processFlightData, generateSampleData]);

  // Filter flights based on search term
  useEffect(() => {
    const filtered = flights.filter(flight =>
      flight.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFlights(filtered);
  }, [searchTerm, flights]);

  // Fetch flights when country changes
  useEffect(() => {
    fetchFlights();
  }, [selectedCountry, fetchFlights]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchFlights, 30000);
    return () => clearInterval(interval);
  }, [fetchFlights]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500 aviation-bg flight-pattern ${darkMode ? 'dark' : ''}`}>
      {/* Modern floating background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-1/3 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-600/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '3s'}}></div>
        
        {/* Modern geometric shapes */}
        <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg rotate-45 float-animation"></div>
        <div className="absolute top-1/3 right-1/3 w-12 h-12 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full float-animation-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-14 h-14 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-lg rotate-12 float-animation"></div>
        <div className="absolute bottom-1/3 right-1/4 w-10 h-10 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full float-animation-delayed"></div>
        
        {/* Subtle grid lines */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        {/* Enhanced radar circles */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-500/40 rounded-full animate-ping shadow-lg"></div>
        <div className="absolute top-1/2 left-1/2 w-4 h-4 border border-blue-500/30 rounded-full animate-ping shadow-lg" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-6 h-6 border border-blue-500/20 rounded-full animate-ping shadow-lg" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="min-h-screen relative">
        <Header 
          darkMode={darkMode} 
          onToggleDarkMode={toggleDarkMode} 
        />
        
        <div className="container mx-auto px-4 py-6">
          {/* Enhanced Control Panel */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-slate-700/50 p-6 sm:p-8 mb-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 rounded-3xl pointer-events-none"></div>
            
            <div className="relative flex flex-col lg:flex-row gap-6 sm:gap-8 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center flex-1 w-full">
                <SearchBar 
                  searchTerm={searchTerm} 
                  onSearchChange={setSearchTerm} 
                />
                
                {/* Enhanced Country Selector */}
                <div className="relative w-full sm:w-auto">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 ml-1">
                    Select Region
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full sm:w-auto appearance-none px-4 sm:px-6 py-3 sm:py-4 pr-12 border border-slate-200 dark:border-slate-600 rounded-2xl bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-slate-900 dark:text-white focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl"
                  >
                    <option value="india">🇮🇳 India</option>
                    <option value="china">🇨🇳 China</option>
                    <option value="usa">🇺🇸 United States</option>
                    <option value="germany">🇩🇪 Germany</option>
                    <option value="france">🇫🇷 France</option>
                    <option value="uk">🇬🇧 United Kingdom</option>
                    <option value="japan">🇯🇵 Japan</option>
                    <option value="australia">🇦🇺 Australia</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Auto-refresh Toggle */}
                <div className="relative w-full sm:w-auto">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 ml-1">
                    Auto-refresh
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-600 shadow-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">30s</span>
                  </div>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchFlights}
                disabled={loading}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm sm:text-base relative overflow-hidden group"
                style={{
                  boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="relative z-10">Refreshing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="relative z-10">Refresh Data</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 px-6 py-4 rounded-2xl mb-6 flex items-center gap-3 shadow-lg backdrop-blur-sm"
            >
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="font-bold text-lg">Demo Mode Active</div>
                <div className="text-sm opacity-90">{error}</div>
              </div>
            </motion.div>
          )}

          {/* Enhanced Flight Counter */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl px-8 py-4 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-2xl border border-white/30 dark:border-slate-700/50">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse shadow-lg"></div>
              <span className="font-bold text-lg">Live tracking</span>
              <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
              <span className="text-lg">{filteredFlights.length} flights in {countries[selectedCountry].name}</span>
              <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z" />
                </svg>
                <span className="text-blue-600 dark:text-blue-400 font-bold">Active</span>
              </div>
            </div>
          </motion.div>

          {/* Professional Statistics Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Total Flights */}
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 dark:border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Flights</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{filteredFlights.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Average Altitude */}
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 dark:border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Altitude</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {filteredFlights.length > 0 
                      ? Math.round(filteredFlights.reduce((sum, flight) => sum + (flight.altitude || 0), 0) / filteredFlights.length / 100) * 100
                      : 0} ft
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Average Speed */}
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 dark:border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Speed</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {filteredFlights.length > 0 
                      ? Math.round(filteredFlights.reduce((sum, flight) => sum + (flight.speed || 0), 0) / filteredFlights.length * 3.6)
                      : 0} km/h
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active Countries */}
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 dark:border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Countries</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {new Set(filteredFlights.map(f => f.country)).size}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Flight Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 dark:border-slate-700/50 mb-8"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Flight Filters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Altitude Range</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="50000" 
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">All</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Speed Range</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="1000" 
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">All</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Status</label>
                <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm">
                  <option>All Flights</option>
                  <option>In Flight</option>
                  <option>On Ground</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Sort By</label>
                <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm">
                  <option>Altitude (High to Low)</option>
                  <option>Speed (High to Low)</option>
                  <option>Distance (Near to Far)</option>
                  <option>Recent Updates</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Map Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/98 dark:bg-slate-800/98 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-slate-700/50 overflow-hidden radar-sweep relative"
            style={{ 
              minHeight: '600px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Enhanced map border decoration */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-8 h-8 border-l-3 border-t-3 border-blue-500/50 rounded-tl-xl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-r-3 border-t-3 border-blue-500/50 rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-3 border-b-3 border-blue-500/50 rounded-bl-xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-3 border-b-3 border-blue-500/50 rounded-br-xl"></div>
            </div>
            
            {loading ? (
              <div className="h-[75vh] flex items-center justify-center">
                <Loader />
              </div>
            ) : (
              <FlightMap flights={filteredFlights} country={countries[selectedCountry]} />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default App; 