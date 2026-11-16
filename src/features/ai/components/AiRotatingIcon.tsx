import { motion } from 'framer-motion';

interface AiRotatingIconProps {
  size?: 'sm' | 'nav' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

export const AiRotatingIcon = ({
  size = 'md',
  className = '',
  animate = true,
}: AiRotatingIconProps) => {
  const sizeMap = {
    sm: { container: 'w-4 h-4', star: 10 },
    nav: { container: 'w-5 h-5', star: 13 },
    md: { container: 'w-6 h-6', star: 15 },
    lg: { container: 'w-10 h-10', star: 22 },
  };

  const current = sizeMap[size];

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${current.container} ${className}`}
    >
      {/* Outer Orbiting Ring */}
      <motion.div
        animate={animate ? { rotate: 360 } : undefined}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full p-[1.2px] bg-gradient-to-tr from-current via-transparent to-current opacity-75 shadow-sm"
      >
        <div className="w-full h-full bg-slate-950/80 dark:bg-black/80 rounded-full" />
      </motion.div>

      {/* Orbiting Satellite Particle */}
      <motion.div
        animate={animate ? { rotate: -360 } : undefined}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 flex items-start justify-center pointer-events-none"
      >
        <span className="w-1 h-1 rounded-full bg-current shadow-[0_0_6px_currentColor] -mt-0.5" />
      </motion.div>

      {/* Center 4-Pointed Modern AI Diamond Star */}
      <motion.svg
        width={current.star}
        height={current.star}
        viewBox="0 0 24 24"
        fill="none"
        animate={
          animate
            ? {
                scale: [0.88, 1.12, 0.88],
                rotate: [0, 90, 180, 270, 360],
              }
            : undefined
        }
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-10 text-current drop-shadow-[0_0_6px_currentColor]"
      >
        <path
          d="M12 1 C12 7.5, 7.5 12, 1 12 C7.5 12, 12 16.5, 12 23 C12 16.5, 16.5 12, 23 12 C16.5 12, 12 7.5, 12 1 Z"
          fill="currentColor"
        />
      </motion.svg>
    </div>
  );
};
