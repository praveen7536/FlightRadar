import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Create realistic flight icon like FlightRadar
const createFlightIcon = (heading) => {
  const rotation = heading || 0;
  return L.divIcon({
    html: `
      <div class="flight-marker" style="transform: rotate(${rotation}deg);">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main fuselage - realistic airplane body */}
          <path d="M20 8L22 16L30 18L22 20L20 28L18 20L10 18L18 16L20 8Z" fill="#FF6B35" stroke="#E55A2B" stroke-width="0.5"/>
          {/* Wings - realistic airplane wings */}
          <path d="M8 17L32 17L30 21L10 21L8 17Z" fill="#FFFFFF" opacity="0.9"/>
          {/* Horizontal stabilizer */}
          <path d="M16 10L24 10L22 13L18 13L16 10Z" fill="#FFFFFF" opacity="0.8"/>
          {/* Vertical stabilizer */}
          <path d="M19 8L21 8L20 12L19 12L19 8Z" fill="#FFFFFF" opacity="0.8"/>
          {/* Windows */}
          <circle cx="20" cy="18" r="1.2" fill="#87CEEB" opacity="0.8"/>
          <circle cx="20" cy="15" r="0.8" fill="#87CEEB" opacity="0.6"/>
          <circle cx="20" cy="21" r="0.8" fill="#87CEEB" opacity="0.6"/>
          {/* Engine nacelles */}
          <circle cx="12" cy="18" r="0.8" fill="#333333" opacity="0.7"/>
          <circle cx="28" cy="18" r="0.8" fill="#333333" opacity="0.7"/>
        </svg>
        <div class="flight-pulse"></div>
      </div>
    `,
    className: 'flight-icon-container',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const FlightMap = ({ flights, country }) => {
  const [animatedFlights, setAnimatedFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);

  // Animate flight positions
  useEffect(() => {
    if (flights.length === 0) return;

    const interval = setInterval(() => {
      setAnimatedFlights(prevFlights => {
        return flights.map(flight => {
          const prevFlight = prevFlights.find(f => f.id === flight.id);
          if (!prevFlight) return flight;

          // Calculate new position based on speed and heading
          if (flight.speed && flight.heading && flight.speed > 10) {
            const speedKmH = flight.speed * 3.6; // Convert m/s to km/h
            const distanceKm = speedKmH / 3600; // Distance traveled in 1 second
            
            const headingRad = (flight.heading * Math.PI) / 180;
            const earthRadius = 6371;
            
            const latRad = (prevFlight.latitude * Math.PI) / 180;
            const lngRad = (prevFlight.longitude * Math.PI) / 180;
            
            const newLatRad = Math.asin(
              Math.sin(latRad) * Math.cos(distanceKm / earthRadius) +
              Math.cos(latRad) * Math.sin(distanceKm / earthRadius) * Math.cos(headingRad)
            );
            
            const newLngRad = lngRad + Math.atan2(
              Math.sin(headingRad) * Math.sin(distanceKm / earthRadius) * Math.cos(latRad),
              Math.cos(distanceKm / earthRadius) - Math.sin(latRad) * Math.sin(newLatRad)
            );
            
            return {
              ...flight,
              latitude: (newLatRad * 180) / Math.PI,
              longitude: (newLngRad * 180) / Math.PI
            };
          }
          
          return flight;
        });
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [flights]);

  const displayFlights = animatedFlights.length > 0 ? animatedFlights : flights;

  // Calculate flight direction in compass format
  const getDirectionText = (heading) => {
    if (!heading) return 'Unknown';
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(heading / 22.5) % 16;
    return directions[index];
  };

  // Generate sample origin/destination based on callsign and position
  const getFlightRoute = (flight) => {
    const callsign = flight.callsign;
    
    // Comprehensive routes based on common patterns and real airports
    const routes = {
      'AI': { origin: 'Delhi (DEL)', destination: 'Mumbai (BOM)' },
      '6E': { origin: 'Bangalore (BLR)', destination: 'Delhi (DEL)' },
      'SG': { origin: 'Mumbai (BOM)', destination: 'Chennai (MAA)' },
      'UK': { origin: 'Delhi (DEL)', destination: 'Kolkata (CCU)' },
      '9W': { origin: 'Mumbai (BOM)', destination: 'Bangalore (BLR)' },
      'IX': { origin: 'Delhi (DEL)', destination: 'Hyderabad (HYD)' },
      'G8': { origin: 'Mumbai (BOM)', destination: 'Delhi (DEL)' },
      'I5': { origin: 'Delhi (DEL)', destination: 'Pune (PNQ)' },
      'QP': { origin: 'Mumbai (BOM)', destination: 'Ahmedabad (AMD)' },
      'S2': { origin: 'Delhi (DEL)', destination: 'Lucknow (LKO)' },
      'default': { origin: 'Unknown', destination: 'Unknown' }
    };

    // Try to match callsign prefix
    for (const [prefix, route] of Object.entries(routes)) {
      if (callsign.startsWith(prefix)) {
        return route;
      }
    }
    
    // If no prefix match, generate based on position and callsign
    if (callsign.length >= 2) {
      const firstChar = callsign.charAt(0);
      const secondChar = callsign.charAt(1);
      
      // Generate realistic routes based on callsign characters
      const possibleOrigins = ['Delhi (DEL)', 'Mumbai (BOM)', 'Bangalore (BLR)', 'Chennai (MAA)', 'Kolkata (CCU)', 'Hyderabad (HYD)'];
      const possibleDestinations = ['Mumbai (BOM)', 'Delhi (DEL)', 'Bangalore (BLR)', 'Chennai (MAA)', 'Kolkata (CCU)', 'Hyderabad (HYD)'];
      
      const originIndex = (firstChar.charCodeAt(0) + secondChar.charCodeAt(0)) % possibleOrigins.length;
      const destIndex = (firstChar.charCodeAt(0) + secondChar.charCodeAt(0) + 1) % possibleDestinations.length;
      
      return {
        origin: possibleOrigins[originIndex],
        destination: possibleDestinations[destIndex]
      };
    }
    
    return routes.default;
  };

  return (
    <div className="w-full h-[75vh] rounded-2xl overflow-hidden relative">
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-blue-500/30 rounded-tl-lg z-[1001]"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-blue-500/30 rounded-tr-lg z-[1001]"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-blue-500/30 rounded-bl-lg z-[1001]"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-blue-500/30 rounded-br-lg z-[1001]"></div>

      {/* Flight Path Legend */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-slate-200 dark:border-slate-700 max-w-[200px]">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
          <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
          </svg>
          Flight Paths
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-500"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">Current Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-green-500"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">Selected Flight</span>
          </div>
        </div>
      </div>

      {/* Flight Counter */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z" />
          </svg>
          {displayFlights.length} flights
        </div>
      </div>

      <MapContainer
        center={country.center}
        zoom={country.zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ minHeight: '500px' }}
        maxZoom={12}
        minZoom={3}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render flight paths for all flights */}
        {displayFlights.map(flight => {
          if (flight.estimatedDestination) {
            const isSelected = selectedFlight && selectedFlight.id === flight.id;
            return (
              <Polyline
                key={`path-${flight.id}`}
                positions={[
                  [flight.latitude, flight.longitude],
                  [flight.estimatedDestination.latitude, flight.estimatedDestination.longitude]
                ]}
                color={isSelected ? "#10B981" : "#3B82F6"}
                weight={isSelected ? 4 : 2}
                opacity={isSelected ? 0.8 : 0.5}
                dashArray={isSelected ? "15, 5" : "8, 4"}
              />
            );
          }
          return null;
        })}
        
        {/* Render flight markers */}
        {displayFlights.map(flight => {
          const flightIcon = createFlightIcon(flight.heading);
          const route = getFlightRoute(flight);
          
          return (
            <Marker
              key={flight.id + flight.callsign}
              position={[flight.latitude, flight.longitude]}
              icon={flightIcon}
              eventHandlers={{
                click: () => setSelectedFlight(flight),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                <div className="text-sm font-semibold bg-white dark:bg-slate-800 px-2 py-1 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                  {flight.callsign}
                  {selectedFlight && selectedFlight.id === flight.id && (
                    <span className="ml-1 text-green-500">✓</span>
                  )}
                </div>
              </Tooltip>
              <Popup>
                <div className="space-y-2 min-w-[280px] max-w-[320px] p-3">
                  <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-base text-blue-600 dark:text-blue-400">
                        {flight.callsign}
                      </div>
                      {selectedFlight && selectedFlight.id === flight.id && (
                        <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-full text-xs font-semibold">
                          SELECTED
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {flight.country}
                    </div>
                  </div>

                  {/* Flight Route */}
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-2 rounded-lg">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Flight Route</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-medium">From:</span> {route.origin}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-medium">To:</span> {route.destination}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Position</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                        <div className="grid grid-cols-2 gap-1">
                          <div><span className="font-medium">Lat:</span> {flight.latitude?.toFixed(4)}</div>
                          <div><span className="font-medium">Lng:</span> {flight.longitude?.toFixed(4)}</div>
                        </div>
                      </div>
                    </div>
                    
                    {flight.estimatedDestination && (
                      <div>
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Estimated Destination</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                          <div className="grid grid-cols-2 gap-1">
                            <div><span className="font-medium">Lat:</span> {flight.estimatedDestination.latitude?.toFixed(4)}</div>
                            <div><span className="font-medium">Lng:</span> {flight.estimatedDestination.longitude?.toFixed(4)}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                      <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">Altitude</div>
                      <div className="text-xs font-medium text-slate-900 dark:text-white">
                        {flight.altitude ? `${flight.altitude.toLocaleString()} m` : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                      <div className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">Speed</div>
                      <div className="text-xs font-medium text-slate-900 dark:text-white">
                        {flight.speed ? `${flight.speed.toFixed(1)} m/s` : 'N/A'}
                      </div>
                    </div>
                    {flight.heading && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg">
                        <div className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-1">Direction</div>
                        <div className="text-xs font-medium text-slate-900 dark:text-white">
                          {flight.heading.toFixed(1)}° ({getDirectionText(flight.heading)})
                        </div>
                      </div>
                    )}
                    {flight.verticalRate && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                        <div className="text-xs font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wide mb-1">Vertical Rate</div>
                        <div className="text-xs font-medium text-slate-900 dark:text-white">
                          {flight.verticalRate.toFixed(1)} m/s
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {flight.onGround !== undefined && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${flight.onGround ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {flight.onGround ? 'On Ground' : 'In Flight'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Flight Path Button */}
                  {flight.estimatedDestination && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => setSelectedFlight(flight)}
                        className={`w-full py-1.5 px-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                          selectedFlight && selectedFlight.id === flight.id
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40'
                        }`}
                      >
                        {selectedFlight && selectedFlight.id === flight.id ? '✓ Flight Path Selected' : 'Show Flight Path'}
                      </button>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default FlightMap; 