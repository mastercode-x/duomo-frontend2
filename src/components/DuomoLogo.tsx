// Logo de Campus Duomo
// Diseño oficial: texto "Campus" + triángulo con "d" cursiva

interface DuomoLogoProps {
  className?: string;
  variant?: 'dark' | 'light';
}

export function DuomoLogo({ className = '', variant = 'dark' }: DuomoLogoProps) {
  const textColor = variant === 'dark' ? '#000000' : '#ffffff';
  const iconColor = variant === 'dark' ? '#000000' : '#ffffff';

  return (
    <svg 
      viewBox="0 0 280 60" 
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Texto "Campus" en negrita */}
      <text
        x="0"
        y="45"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="42"
        fontWeight="900"
        fill={textColor}
        letterSpacing="-1"
      >
        Campus
      </text>
      
      {/* Separador vertical */}
      <line
        x1="155"
        y1="8"
        x2="155"
        y2="52"
        stroke={iconColor}
        strokeWidth="2"
        opacity="0.3"
      />
      
      {/* Triángulo play/flecha */}
      <g transform="translate(175, 10)">
        {/* Triángulo exterior con línea gruesa */}
        <path
          d="M 0 0 L 35 20 L 0 40 Z"
          stroke={iconColor}
          strokeWidth="2.5"
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        
        {/* Letra "d" cursiva estilizada */}
        <text
          x="10"
          y="30"
          fontFamily="Georgia, serif"
          fontSize="22"
          fontStyle="italic"
          fontWeight="600"
          fill={iconColor}
        >
          d
        </text>
      </g>
    </svg>
  );
}

// Versión simplificada solo con el ícono
export function DuomoIcon({ className = '', variant = 'dark' }: DuomoLogoProps) {
  const iconColor = variant === 'dark' ? '#000000' : '#ffffff';

  return (
    <svg 
      viewBox="0 0 50 50" 
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Triángulo play/flecha */}
      <path
        d="M 5 5 L 45 25 L 5 45 Z"
        stroke={iconColor}
        strokeWidth="3"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      
      {/* Letra "d" cursiva estilizada */}
      <text
        x="14"
        y="35"
        fontFamily="Georgia, serif"
        fontSize="24"
        fontStyle="italic"
        fontWeight="600"
        fill={iconColor}
      >
        d
      </text>
    </svg>
  );
}

export default DuomoLogo;
