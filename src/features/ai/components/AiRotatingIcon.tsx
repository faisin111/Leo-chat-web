import { motion } from 'framer-motion';

interface AiRotatingIconProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AiRotatingIcon = ({ size = 'md', className = '' }: AiRotatingIconProps) => {
  const sizeMap = {
    sm: { container: 'w-4 h-4', star: 11 },
    md: { container: 'w-6 h-6', star: 15 },
    lg: { container: 'w-10 h-10', star: 22 },
  };

  const current = sizeMap[size];

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${current.container} ${className}`}
    >
      {/* Outer Orbiting Iridescent Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full p-[1.5px] bg-gradient-to-tr from-primary via-violet-500 to-sky-400 opacity-90 shadow-sm"
      >
        <div className="w-full h-full bg-slate-950/80 rounded-full" />
      </motion.div>

      {/* Orbiting Satellite Particle */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 flex items-start justify-center pointer-events-none"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.9)] -mt-0.5" />
      </motion.div>

      {/* Center 4-Pointed Modern AI Diamond Star */}
      <motion.svg
        width={current.star}
        height={current.star}
        viewBox="0 0 24 24"
        fill="none"
        animate={{
          scale: [0.85, 1.15, 0.85],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-10 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]"
      >
        <defs>
          <linearGradient id="aiModernStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <path
          d="M12 1 C12 7.5, 7.5 12, 1 12 C7.5 12, 12 16.5, 12 23 C12 16.5, 16.5 12, 23 12 C16.5 12, 12 7.5, 12 1 Z"
          fill="url(#aiModernStarGrad)"
        />
      </motion.svg>
    </div>
  );
};
