// Logo de Campus Duomo
// Diseño basado en el logo oficial

interface DuomoLogoProps {
  className?: string;
  variant?: 'dark' | 'light';
}

export function DuomoLogo({ className = '', variant = 'dark' }: DuomoLogoProps) {
  const textColor = variant === 'dark' ? '#1a1a1a' : '#ffffff';
  const iconColor = variant === 'dark' ? '#1a1a1a' : '#ffffff';

  return (
    <svg 
      viewBox="0 0 200 40" 
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Texto "Campus" */}
      <text
        x="0"
        y="30"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="28"
        fontWeight="600"
        fill={textColor}
      >
        Campus
      </text>
      
      {/* Icono Play/D */}
      <g transform="translate(115, 5)">
        {/* Triángulo exterior */}
        <path
          d="M5 5 L30 17.5 L5 30 Z"
          stroke={iconColor}
          strokeWidth="2.5"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Letra D dentro */}
        <text
          x="12"
          y="23"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="14"
          fontWeight="700"
          fill={iconColor}
        >
          D
        </text>
      </g>
    </svg>
  );
}

// Versión simplificada solo con el ícono
export function DuomoIcon({ className = '', variant = 'dark' }: DuomoLogoProps) {
  const iconColor = variant === 'dark' ? '#1a1a1a' : '#ffffff';

  return (
    <svg 
      viewBox="0 0 40 40" 
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Triángulo exterior */}
      <path
        d="M5 5 L35 20 L5 35 Z"
        stroke={iconColor}
        strokeWidth="3"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Letra D dentro */}
      <text
        x="12"
        y="26"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="16"
        fontWeight="700"
        fill={iconColor}
      >
        D
      </text>
    </svg>
  );
}

export default DuomoLogo;
