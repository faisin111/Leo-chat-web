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
      {/* Outer Orbiting Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full p-[1.5px] bg-gradient-to-tr from-zinc-900 via-zinc-400 to-zinc-900 dark:from-white dark:via-zinc-400 dark:to-white opacity-85 shadow-sm"
      >
        <div className="w-full h-full bg-white dark:bg-[#0d0d0d] rounded-full" />
      </motion.div>

      {/* Orbiting Satellite Particle */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 flex items-start justify-center pointer-events-none"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] -mt-0.5" />
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
        className="relative z-10 text-zinc-900 dark:text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]"
      >
        <path
          d="M12 1 C12 7.5, 7.5 12, 1 12 C7.5 12, 12 16.5, 12 23 C12 16.5, 16.5 12, 23 12 C16.5 12, 12 7.5, 12 1 Z"
          fill="currentColor"
        />
      </motion.svg>
    </div>
  );
};
