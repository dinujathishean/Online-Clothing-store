import { Link } from 'react-router-dom';

const LOGO_SRC = '/brand/aurvexa-logo.png';

const SIZE_PX = {
  sm: 28,
  md: 34,
  lg: 38,
  hero: 72,
};

/**
 * AURVEXA gold-metallic wordmark. Asset is gold on transparent (black plate removed).
 */
export default function AurvexaLogo({
  className = '',
  size = 'md',
  height,
  to,
  alt,
}) {
  const resolved = height ?? SIZE_PX[size] ?? SIZE_PX.md;
  const hPx = typeof resolved === 'number' ? resolved : SIZE_PX.hero;
  const label = alt === undefined ? 'AURVEXA' : alt;

  const mark = (
    <span className={`inline-flex items-end ${className}`.trim()} style={{ height: resolved }}>
      <img
        src={LOGO_SRC}
        alt={to ? '' : label}
        width={Math.round(hPx * (866 / 147))}
        height={hPx}
        className="h-full w-auto object-contain"
        decoding="async"
      />
    </span>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-end no-underline" aria-label={label || 'AURVEXA'}>
        {mark}
      </Link>
    );
  }

  return mark;
}
