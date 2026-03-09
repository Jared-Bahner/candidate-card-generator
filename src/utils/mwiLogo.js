import mwiLogoDarkSvg from '../assets/mwiLogoDark.svg?raw';

const MWI_LOGO_FALLBACK_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="220" height="72" viewBox="0 0 220 72" role="img" aria-label="MWI Logo">
    <text x="110" y="47" text-anchor="middle" font-size="38" font-family="Arial, sans-serif" font-weight="700" fill="#000000">
      MWI
    </text>
  </svg>
`.trim();

export const MWI_LOGO_FALLBACK_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(MWI_LOGO_FALLBACK_SVG)}`;

// Inline the dark logo to avoid runtime URL resolution failures in export rendering.
export const MWI_LOGO_PRIMARY_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(mwiLogoDarkSvg)}`;
