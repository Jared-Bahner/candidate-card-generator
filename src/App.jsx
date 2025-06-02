import React, { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import ProfileForm from './components/ProfileForm';
import ProfileCard from './components/ProfileCard';

// Constants
const TEMPLATE_WIDTH = 1920;
const TEMPLATE_HEIGHT = 1080;
const DEFAULT_FORM_DATA = {
  name: '',
  position: '',
  linkedin: '',
  resumeLink: '',
  address: '',
  phone: '',
  email: '',
  highlights: [''],
  profileImage: null,
  coreSkills: ['', '', ''],
  placementType: 'Contractor'
};

// Utility functions
const ensureHttps = (url) => url.startsWith('http') ? url : `https://${url}`;

const getElementRect = (element) => {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left,
    right: rect.right,
    top: rect.top,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height
  };
};

const calculatePdfCoordinates = (rect, canvas) => {
  return {
    x: (rect.left / canvas.width) * TEMPLATE_WIDTH,
    y: ((canvas.height - rect.bottom) / canvas.height) * TEMPLATE_HEIGHT,
    width: (rect.width / canvas.width) * TEMPLATE_WIDTH,
    height: (rect.height / canvas.height) * TEMPLATE_HEIGHT
  };
};

export default function App() {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const templateRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const scaleFactor = containerWidth / TEMPLATE_WIDTH;
        containerRef.current.style.setProperty('--scale-factor', scaleFactor);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleHighlightChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.map((h, i) => i === index ? value : h)
    }));
  };

  const handleAddHighlight = () => {
    setFormData(prev => ({
      ...prev,
      highlights: [...prev.highlights, '']
    }));
  };

  const handleRemoveHighlight = (index) => {
    if (formData.highlights.length > 1) {
      setFormData(prev => ({
        ...prev,
        highlights: prev.highlights.filter((_, i) => i !== index)
      }));
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        profileImage: e.target?.result?.toString() || null
      }));
    };
    reader.readAsDataURL(file);
  };

  const setupExportStyles = (element) => {
    const styles = {
      container: containerRef.current.style.cssText,
      template: element.style.cssText,
      parent: element.parentElement.style.cssText
    };

    // Set temporary styles for capture
    const exportStyles = {
      width: `${TEMPLATE_WIDTH}px`,
      height: `${TEMPLATE_HEIGHT}px`,
      transform: 'none'
    };

    containerRef.current.style.cssText = Object.entries(exportStyles)
      .map(([key, value]) => `${key}: ${value}`).join(';');
    
    element.style.cssText = Object.entries({
      ...exportStyles,
      position: 'relative',
      background: 'black'
    }).map(([key, value]) => `${key}: ${value}`).join(';');
    
    element.parentElement.style.cssText = Object.entries(exportStyles)
      .map(([key, value]) => `${key}: ${value}`).join(';');

    return styles;
  };

  const restoreStyles = (element, originalStyles) => {
    containerRef.current.style.cssText = originalStyles.container;
    element.style.cssText = originalStyles.template;
    element.parentElement.style.cssText = originalStyles.parent;
  };

  const addLinksToPage = (element, pdf, canvas) => {
    const linkElements = element.querySelectorAll('[data-pdf-link]');
    console.log('Found link elements:', linkElements.length);
    
    linkElements.forEach((linkElement, index) => {
      const linkAnchor = linkElement.querySelector('a[data-pdf-link-url]');
      if (!linkAnchor) return;

      const url = linkAnchor.getAttribute('data-pdf-link-url');
      if (!url) return;

      const rect = getElementRect(linkElement);
      const pdfCoords = calculatePdfCoordinates(rect, canvas);
      
      console.log(`Link ${index + 1}:`, {
        url,
        element: linkElement.textContent,
        originalRect: rect,
        pdfCoords
      });
      
      pdf.link(pdfCoords.x, pdfCoords.y, pdfCoords.width, pdfCoords.height, { url });
    });
  };

  const handleExportPDF = async () => {
    const element = templateRef.current;
    if (!element) return;
    
    try {
      // Setup export styles and store originals
      const originalStyles = setupExportStyles(element);

      // Capture the canvas at full size
      const canvas = await html2canvas(element, {
        width: TEMPLATE_WIDTH,
        height: TEMPLATE_HEIGHT,
        scale: 1,
        useCORS: true,
        backgroundColor: '#000000',
        logging: false,
      });

      // Create PDF with exact dimensions
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: [TEMPLATE_WIDTH, TEMPLATE_HEIGHT],
        compress: true,
      });

      // Add the image to the PDF
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        0,
        0,
        TEMPLATE_WIDTH,
        TEMPLATE_HEIGHT,
        undefined,
        'FAST'
      );

      // Add clickable links
      addLinksToPage(element, pdf, canvas);

      // Save the PDF
      pdf.save(`${formData.name || 'candidate'}-card.pdf`);

      // Restore original styles
      restoreStyles(element, originalStyles);
    } catch (error) {
      console.error('Export error:', error);
      alert('There was an error exporting the PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <header className="w-full bg-black py-4 px-6 mb-6 border-b-4 border-[#2237F1]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-2 items-start">
            <img 
              src="/assets/mwilogo.png" 
              alt="MWI Logo" 
              className="h-12 w-auto object-contain" 
            />
            <h1 className="text-xl font-bold text-white">
              Candidate Card Creator
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <ProfileForm
            formData={formData}
            onInputChange={handleInputChange}
            onHighlightChange={handleHighlightChange}
            onAddHighlight={handleAddHighlight}
            onRemoveHighlight={handleRemoveHighlight}
            onImageUpload={handleImageUpload}
          />

          {/* Live Preview Section */}
          <section className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-700">
                Live Preview
              </h2>
              <button
                onClick={handleExportPDF}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                <Download className="mr-2" size={18} />
                Export PDF
              </button>
            </div>
            
            {/* Template Preview Container */}
            <div>
              <div 
                ref={containerRef} 
                className="relative w-full" 
                style={{ paddingTop: '56.25%' }}
              >
                <div className="absolute inset-0 overflow-hidden">
                  <div 
                    ref={templateRef} 
                    className="w-full h-full" 
                    style={{ 
                      width: '100%',
                      height: '100%',
                      transform: 'scale(var(--scale-factor))',
                      transformOrigin: 'top left',
                    }}
                  >
                    <div style={{ 
                      width: `${TEMPLATE_WIDTH}px`, 
                      height: `${TEMPLATE_HEIGHT}px` 
                    }}>
                      <ProfileCard formData={formData} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}