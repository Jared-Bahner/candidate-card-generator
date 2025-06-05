import React, { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ProfileForm from './components/ProfileForm';
import ProfileCard from './components/ProfileCard';
import PDFProfileCard from './components/PDFProfileCard';
import './fonts'; // Import font registration

// Constants
const TEMPLATE_WIDTH = 1920;
const TEMPLATE_HEIGHT = 1080;
const DEFAULT_FORM_DATA = {
  name: '',
  position: '',
  linkedin: '',
  resumeLink: '',
  portfolioLink: '',
  address: '',
  phone: '',
  email: '',
  highlights: [''],
  profileImage: null,
  coreSkills: ['', '', ''],
  placementType: 'Contractor'
};

export default function App() {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [scaleFactor, setScaleFactor] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateScaleFactor = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setScaleFactor(containerWidth / TEMPLATE_WIDTH);
      }
    };

    updateScaleFactor();
    window.addEventListener('resize', updateScaleFactor);
    return () => window.removeEventListener('resize', updateScaleFactor);
  }, []);

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHighlightChange = (index, value) => {
    const newHighlights = [...formData.highlights];
    newHighlights[index] = value;
    handleInputChange('highlights', newHighlights);
  };

  const handleAddHighlight = () => {
    handleInputChange('highlights', [...formData.highlights, '']);
  };

  const handleRemoveHighlight = (index) => {
    const newHighlights = formData.highlights.filter((_, i) => i !== index);
    handleInputChange('highlights', newHighlights);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('profileImage', e.target.result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  document.documentElement.style.setProperty('--scale-factor', scaleFactor);

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
              <PDFDownloadLink
                document={<PDFProfileCard formData={formData} />}
                fileName={`${formData.name || 'candidate'}-card.pdf`}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                {({ loading }) => (
                  <>
                    <Download className="mr-2" size={18} />
                    {loading ? 'Preparing PDF...' : 'Export PDF'}
                  </>
                )}
              </PDFDownloadLink>
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