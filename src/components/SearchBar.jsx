import React from 'react';
import { motion } from 'framer-motion';

const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative flex-1 max-w-md w-full group"
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search flights by callsign or country..."
          className="block w-full pl-12 sm:pl-14 pr-12 sm:pr-14 py-3 sm:py-4 border border-slate-200 dark:border-slate-600 rounded-2xl leading-5 bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl text-sm sm:text-base relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-purple-50/30 rounded-2xl pointer-events-none"></div>
        
        {searchTerm && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-4 sm:pr-5 flex items-center"
          >
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-all duration-300 hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default SearchBar; 