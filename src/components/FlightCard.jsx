import React from 'react';
import { motion } from 'framer-motion';

const FlightCard = ({ flight }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      layout
      className="card p-4 flex flex-col gap-2 shadow hover:shadow-lg transition-shadow duration-200"
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-lg text-primary-700 dark:text-primary-400">
          {flight.callsign}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {flight.country}
        </span>
      </div>
      <div className="flex flex-wrap gap-4 mt-2">
        <div className="text-sm">
          <span className="font-medium">Lat:</span> {flight.latitude?.toFixed(2)}
        </div>
        <div className="text-sm">
          <span className="font-medium">Lng:</span> {flight.longitude?.toFixed(2)}
        </div>
        <div className="text-sm">
          <span className="font-medium">Alt:</span> {flight.altitude ? `${flight.altitude.toLocaleString()} m` : 'N/A'}
        </div>
        <div className="text-sm">
          <span className="font-medium">Speed:</span> {flight.speed ? `${flight.speed.toFixed(1)} m/s` : 'N/A'}
        </div>
      </div>
    </motion.div>
  );
};

export default FlightCard; 