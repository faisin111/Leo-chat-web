interface WebQrNavIconProps {
  className?: string;
  active?: boolean;
}

export function WebQrNavIcon({ className = 'w-5 h-5', active = false }: WebQrNavIconProps) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transition-transform duration-300 group-hover:scale-110"
      >
        {/* Viewfinder frame corners */}
        <path
          d="M3 8V5.5A2.5 2.5 0 0 1 5.5 3H8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M3 16v2.5A2.5 2.5 0 0 0 5.5 21H8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 21h2.5a2.5 2.5 0 0 0 2.5-2.5V16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Inner QR Matrix Corner Nodes */}
        <rect x="6.5" y="6.5" width="3" height="3" rx="0.8" fill="currentColor" />
        <rect x="14.5" y="6.5" width="3" height="3" rx="0.8" fill="currentColor" />
        <rect x="6.5" y="14.5" width="3" height="3" rx="0.8" fill="currentColor" />

        {/* Center Web Connect Core */}
        <circle cx="12" cy="12" r="1.75" fill="currentColor" />
        <path
          d="M12 9.25v-1M12 15.75v-1M9.25 12h-1M15.75 12h-1"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Bottom-right connection dot */}
        <circle cx="16" cy="16" r="1.25" fill="currentColor" />
      </svg>

      {/* Subtle glowing beacon when active */}
      {active && (
        <span className="absolute inset-0 rounded-full bg-primary/25 blur-xs pointer-events-none -z-10 animate-pulse" />
      )}
    </div>
  );
}

export default WebQrNavIcon;
