import { Font } from '@react-pdf/renderer';

// Register Space Grotesk font for PDF generation
Font.register({
  family: 'Space Grotesk',
  fonts: [
    {
      src: '/fonts/SpaceGrotesk-Regular.otf',
      fontWeight: 400,
    },
    {
      src: '/fonts/SpaceGrotesk-Medium.otf',
      fontWeight: 500,
    },
    {
      src: '/fonts/SpaceGrotesk-Bold.otf',
      fontWeight: 700,
    }
  ]
});

// Register Termina font
Font.register({
  family: 'Termina',
  src: '/fonts/TerminaTest-Regular.otf',
  fontWeight: 400
});

// Export font family names for consistent usage
export const FONTS = {
  text: 'Space Grotesk',
  heading: 'Termina'
}; 