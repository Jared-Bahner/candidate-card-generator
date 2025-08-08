import React, { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ProfileForm from './components/ProfileForm';
import ProfileCard from './components/ProfileCard';
import PDFProfileCard from './components/PDFProfileCard';
import RecentCards from './components/RecentCards';
import ErrorBoundary from './components/ErrorBoundary';
import { saveRecentCard, getRecentCards, clearRecentCards } from './utils/storage';
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

function AppContent() {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [scaleFactor, setScaleFactor] = useState(0.5);
  const [recentCards, setRecentCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateScaleFactor = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        
        console.log('Container dimensions:', { containerWidth, containerHeight });
        
        // Calculate scale based on available space
        const maxWidth = containerWidth - 20; // 20px for padding
        const maxHeight = containerHeight - 20; // 20px for padding
        
        const scaleX = maxWidth / TEMPLATE_WIDTH;
        const scaleY = maxHeight / TEMPLATE_HEIGHT;
        
        console.log('Scale calculations:', { scaleX, scaleY, maxWidth, maxHeight });
        
        // Use the smaller scale to fit both dimensions perfectly
        const newScale = Math.min(scaleX, scaleY);
        
        // Set reasonable bounds - allow scaling up to 1.2 for better visibility
        const boundedScale = Math.max(Math.min(newScale, 1.2), 0.1);
        
        console.log('Final scale:', boundedScale);
        setScaleFactor(boundedScale);
      } else {
        console.log('Container ref not available');
      }
    };

    // Initial calculation
    updateScaleFactor();
    
    // Update on resize
    const handleResize = () => {
      setTimeout(updateScaleFactor, 100); // Small delay to ensure DOM is updated
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load recent cards on component mount
  useEffect(() => {
    try {
      const cards = getRecentCards();
      setRecentCards(cards);
    } catch (error) {
      console.error('Error loading recent cards:', error);
    }
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
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('profileImage', e.target.result);
        setIsLoading(false);
      };
      reader.onerror = () => {
        throw new Error('Failed to read image file');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      setIsLoading(false);
    }
  };

  // Recent cards handlers
  const handleLoadCard = (cardData) => {
    setFormData(cardData);
  };

  // Note: handleRemoveCard is currently not used but kept for future functionality
  // const handleRemoveCard = (cardId) => {
  //   try {
  //     clearRecentCards();
  //     const updatedCards = getRecentCards();
  //     setRecentCards(updatedCards);
  //   } catch (error) {
  //     console.error('Error removing card:', error);
  //   }
  // };

  const handleClearHistory = () => {
    try {
      clearRecentCards();
      setRecentCards([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const handleSaveCard = () => {
    try {
      saveRecentCard(formData);
      const updatedCards = getRecentCards();
      setRecentCards(updatedCards);
    } catch (error) {
      console.error('Error saving card:', error);
      alert('Failed to save card. Please try again.');
    }
  };

  // Note: handleExportPDF is currently not used but kept for future functionality
  // const handleExportPDF = () => {
  //   console.log('Exporting PDF...');
  // };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="app-header">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="header-content">
            <div className="flex flex-col items-start">
              <img 
                src="/assets/mwilogo.png" 
                alt="MWI Logo"
                className="header-logo"
                style={{ marginBottom: '0.5em' }}
              />
              <h1 className="header-title" style={{ marginTop: '0.5em' }}>
                {import.meta.env.VITE_APP_NAME || 'Candidate Card Generator'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <ProfileForm
              formData={formData}
              onInputChange={handleInputChange}
              onHighlightChange={handleHighlightChange}
              onAddHighlight={handleAddHighlight}
              onRemoveHighlight={handleRemoveHighlight}
              onImageUpload={handleImageUpload}
            />
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-700">Preview</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveCard}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    disabled={isLoading}
                  >
                    Save Card
                  </button>
                  <PDFDownloadLink
                    document={<PDFProfileCard formData={formData} />}
                    fileName={`${formData.name || 'candidate'}-card.pdf`}
                    className="inline-flex items-center px-4 py-2 bg-[#2237f1] text-white rounded-md hover:bg-[#1a2bd8] transition-colors"
                    onError={(error) => {
                      console.error('PDF generation error:', error);
                      alert('Failed to generate PDF. Please try again.');
                    }}
                  >
                    {({ loading, error }) => (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        {loading ? 'Generating...' : error ? 'Error' : 'Export PDF'}
                      </>
                    )}
                  </PDFDownloadLink>
                </div>
              </div>

              {/* Preview Container */}
              <div
                ref={containerRef}
                className="preview-container"
              >
                <div
                  className="preview-content"
                  style={{
                    transform: `scale(${scaleFactor})`,
                    width: `${TEMPLATE_WIDTH}px`,
                    height: `${TEMPLATE_HEIGHT}px`,
                    backgroundColor: 'black'
                  }}
                >
                  <ProfileCard formData={formData} />
                </div>
              </div>
            </div>

            {/* Recent Cards */}
            <RecentCards
              recentCards={recentCards}
              onLoadCard={handleLoadCard}
              onClearHistory={handleClearHistory}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>
            © {new Date().getFullYear()} Candidate Card Generator. 
            Version {import.meta.env.VITE_APP_VERSION || '1.0.0'}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}