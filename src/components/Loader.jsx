import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => (
  <div className="flex justify-center items-center py-12">
    <motion.div
      className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      aria-label="Loading"
    />
  </div>
);

export default Loader; 