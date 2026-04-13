import { Font } from '@react-pdf/renderer';

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

Font.register({
  family: 'Space Grotesk',
  fonts: [
    {
      src: `${BASE_URL}/fonts/SpaceGrotesk-Regular.otf`,
      fontWeight: 400,
    },
    {
      src: `${BASE_URL}/fonts/SpaceGrotesk-Medium.otf`,
      fontWeight: 500,
    },
    {
      src: `${BASE_URL}/fonts/SpaceGrotesk-Bold.otf`,
      fontWeight: 700,
    }
  ]
});

Font.register({
  family: 'Termina',
  fonts: [
    {
      src: `${BASE_URL}/fonts/TerminaTest-Light.otf`,
      fontWeight: 300,
    },
    {
      src: `${BASE_URL}/fonts/TerminaTest-Regular.otf`,
      fontWeight: 400,
    },
    {
      src: `${BASE_URL}/fonts/TerminaTest-Bold.otf`,
      fontWeight: 700,
    },
  ]
});

Font.registerHyphenationCallback(word => [word]);

export const FONTS = {
  text: 'Space Grotesk',
  heading: 'Termina'
}; 