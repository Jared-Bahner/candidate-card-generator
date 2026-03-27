import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MWI_LOGO_FALLBACK_DATA_URI } from './mwiLogo';

const TEMPLATE_WIDTH = 1920;
const TEMPLATE_HEIGHT = 1080;

const isExportableLink = (href) => {
  if (!href) return false;
  const normalized = href.trim().toLowerCase();
  return normalized.length > 0 && !normalized.startsWith('javascript:') && !normalized.startsWith('#');
};

const waitForFonts = async () => {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
};

const waitForImages = async (element) => {
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        const done = () => resolve();
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      });
    })
  );
};

const waitForImageReady = (img) =>
  new Promise((resolve) => {
    if (img.complete) {
      resolve();
      return;
    }

    const done = () => resolve();
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  });

const ensureMwiLogoIsRenderable = async (element) => {
  const logoImages = Array.from(element.querySelectorAll('img[alt="MWI Logo"]'));

  await Promise.all(
    logoImages.map(async (img) => {
      await waitForImageReady(img);
      if (img.naturalWidth > 0) return;

      img.src = MWI_LOGO_FALLBACK_DATA_URI;
      await waitForImageReady(img);
    })
  );
};

const getLinkOverlays = (element, pdfWidth, pdfHeight) => {
  const rootRect = element.getBoundingClientRect();
  const anchors = Array.from(element.querySelectorAll('a[href]'));
  const scaleX = pdfWidth / rootRect.width;
  const scaleY = pdfHeight / rootRect.height;

  return anchors
    .map((anchor) => {
      const href = anchor.getAttribute('href') || '';
      if (!isExportableLink(href)) return null;

      const anchorRect = anchor.getBoundingClientRect();
      const width = anchorRect.width * scaleX;
      const height = anchorRect.height * scaleY;

      if (width <= 0 || height <= 0) return null;

      return {
        href,
        x: (anchorRect.left - rootRect.left) * scaleX,
        y: (anchorRect.top - rootRect.top) * scaleY,
        width,
        height
      };
    })
    .filter(Boolean);
};

export const exportProfileCardToPdf = async ({
  element,
  fileName = 'candidate-card.pdf'
}) => {
  if (!element) {
    throw new Error('Export element is required.');
  }

  await waitForFonts();
  await waitForImages(element);
  await ensureMwiLogoIsRenderable(element);
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));

  const canvas = await html2canvas(element, {
    backgroundColor: '#FFFFFF',
    scale: Math.max(window.devicePixelRatio || 1, 2),
    useCORS: true,
    allowTaint: false,
    logging: false,
    foreignObjectRendering: false,
    removeContainer: true,
    width: TEMPLATE_WIDTH,
    height: TEMPLATE_HEIGHT,
    windowWidth: TEMPLATE_WIDTH,
    windowHeight: TEMPLATE_HEIGHT,
    scrollX: 0,
    scrollY: 0
  });

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [TEMPLATE_WIDTH, TEMPLATE_HEIGHT],
    compress: true
  });

  const imageData = canvas.toDataURL('image/png', 1.0);
  pdf.addImage(imageData, 'PNG', 0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);

  const links = getLinkOverlays(element, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);
  links.forEach((link) => {
    pdf.link(link.x, link.y, link.width, link.height, { url: link.href });
  });

  pdf.save(fileName);
};
