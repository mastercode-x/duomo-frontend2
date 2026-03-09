// Logo de Campus Duomo - Imagen oficial
// Usa la imagen real del logo oficial de Campus Duomo

import logoSrc from '@/assets/logo-campus-duomo.jpg';

interface DuomoLogoProps {
  className?: string;
  variant?: 'dark' | 'light';
}

export function DuomoLogo({ className = '', variant = 'dark' }: DuomoLogoProps) {
  // En variante 'light' (fondos oscuros), aplicamos un filtro para invertir colores
  const style = variant === 'light'
    ? { filter: 'brightness(0) invert(1)' }
    : {};

  return (
    <img
      src={logoSrc}
      alt="Campus Duomo"
      className={className}
      style={style}
      draggable={false}
    />
  );
}

// Versión simplificada solo con el ícono (mantiene compatibilidad)
export function DuomoIcon({ className = '', variant = 'dark' }: DuomoLogoProps) {
  const style = variant === 'light'
    ? { filter: 'brightness(0) invert(1)' }
    : {};

  return (
    <img
      src={logoSrc}
      alt="Campus Duomo"
      className={className}
      style={style}
      draggable={false}
    />
  );
}

export default DuomoLogo;
