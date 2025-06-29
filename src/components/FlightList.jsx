import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import FlightCard from './FlightCard';

const FlightList = ({ flights }) => {
  if (!flights.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-gray-500 dark:text-gray-400 py-12"
      >
        No flights found.
      </motion.div>
    );
  }
  return (
    <motion.div
      layout
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <AnimatePresence>
        {flights.map(flight => (
          <FlightCard key={flight.id + flight.callsign} flight={flight} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default FlightList; 