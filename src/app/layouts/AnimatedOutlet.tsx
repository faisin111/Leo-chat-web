import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ 
          duration: 0.2, 
          ease: 'easeInOut' 
        }}
        className="w-full h-full flex-1 flex flex-col relative"
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}
