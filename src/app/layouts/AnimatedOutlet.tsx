import { useOutlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppearanceStore } from '@/shared/theme';

export function AnimatedOutlet() {
  const outlet = useOutlet();
  const location = useLocation();
  const animations = useAppearanceStore((s) => s.animations);

  const isReduced = animations === 'reduced';

  return (
    <div className="w-full h-full flex-1 flex flex-col relative overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={isReduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={isReduced ? undefined : { opacity: 0, y: -6 }}
          transition={{
            duration: animations === 'smooth' ? 0.25 : 0.18,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="w-full h-full flex-1 flex flex-col"
        >
          {outlet}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
