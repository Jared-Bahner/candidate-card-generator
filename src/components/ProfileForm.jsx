import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Upload, User, Star, FileText, Loader, Wrench, Briefcase } from 'lucide-react';
import { extractTextFromPDF, generateHighlightsFromResume } from '../services/aiService';

// Memoized form components for better performance
const FormSection = React.memo(({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
));

const FormLabel = React.memo(({ children, icon: Icon }) => (
  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
    {Icon && <Icon className="mr-2" size={16} />}
    {children}
  </label>
));

const FormInput = React.memo(({ type = 'text', value, onChange, placeholder, className = '' }) => (
  <input
    type={type}
    value={value || ''}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2237f1] ${className}`}
    placeholder={placeholder}
  />
));

const FormTextArea = React.memo(({ value, onChange, placeholder, rows = 2 }) => (
  <textarea
    value={value || ''}
    onChange={onChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2237f1]"
    rows={rows}
    placeholder={placeholder}
  />
));

const HighlightInput = React.memo(({ value, onChange, onRemove, canRemove }) => (
  <div className="flex gap-2 mb-2">
    <FormTextArea
      value={value}
      onChange={onChange}
      placeholder="Enter a key highlight"
      className="flex-1"
      rows={3}
    />
    {canRemove && (
      <button
        onClick={onRemove}
        className="px-2 py-1 text-red-500 hover:bg-red-50 rounded-md transition-colors h-fit"
        title="Remove highlight"
        type="button"
      >
        ×
      </button>
    )}
  </div>
));

const SuggestedHighlight = React.memo(({ highlight, onAdd }) => (
  <div className="flex items-center justify-between p-2 bg-[#e8ecff] rounded-md mb-2">
    <span className="text-sm text-gray-700">{highlight}</span>
    <button
      onClick={() => onAdd(highlight)}
      className="text-[#2237f1] hover:text-[#1a2bd8] text-sm font-medium"
      type="button"
    >
      Add
    </button>
  </div>
));

const ResumeUploader = React.memo(({ onUpload, isProcessing, error }) => (
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#2237f1] transition-colors">
    <input
      type="file"
      accept=".pdf"
      onChange={onUpload}
      className="hidden"
      id="resume-upload"
      disabled={isProcessing}
      data-testid="resume-upload"
    />
    <label htmlFor="resume-upload" className="cursor-pointer">
      <FileText className="mx-auto mb-3 text-gray-400" size={48} />
      <p className="text-sm text-gray-500">
        {isProcessing ? (
          <span className="flex items-center justify-center" data-testid="processing-status">
            <Loader className="animate-spin mr-2" size={20} />
            Processing resume...
          </span>
        ) : (
          'Click to upload PDF resume'
        )}
      </p>
    </label>
    {error && <p className="text-red-500 text-sm mt-2" data-testid="upload-error">{error}</p>}
  </div>
));

const PlacementTypeToggle = React.memo(({ value, onChange }) => (
  <div className="flex gap-4 items-center">
    {['Contractor', 'Direct Placement', 'Contract to Hire'].map((type) => (
      <button
        key={type}
        onClick={() => onChange(type)}
        className={`px-4 py-2 rounded-full transition-colors ${
          value === type
            ? 'bg-[#2237f1] text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        type="button"
      >
        {type}
      </button>
    ))}
  </div>
));

// Custom hook for form state management
const useFormState = (initialFormData, onInputChange) => {
  const [localState, setLocalState] = useState({
    isProcessing: false,
    suggestedHighlights: [],
    error: '',
    highlightContext: '',
    uploadedResumeText: ''
  });

  const updateLocalState = useCallback((updates) => {
    setLocalState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleInputChange = useCallback((field, value) => {
    onInputChange(field, value);
  }, [onInputChange]);

  return {
    ...localState,
    updateLocalState,
    handleInputChange
  };
};

export default function ProfileForm({ 
  formData, 
  onInputChange, 
  onHighlightChange, 
  onAddHighlight, 
  onRemoveHighlight, 
  onImageUpload
}) {
  const {
    isProcessing,
    suggestedHighlights,
    error,
    highlightContext,
    uploadedResumeText,
    updateLocalState,
    handleInputChange
  } = useFormState(formData, onInputChange);

  // Memoized values for better performance
  const coreSkills = useMemo(() => {
    return formData.coreSkills || ['', '', ''];
  }, [formData.coreSkills]);

  const highlights = useMemo(() => {
    return formData.highlights || [''];
  }, [formData.highlights]);

  const handleCoreSkillChange = useCallback((index, value) => {
    const newCoreSkills = [...coreSkills];
    newCoreSkills[index] = value;
    handleInputChange('coreSkills', newCoreSkills);
  }, [coreSkills, handleInputChange]);

  const handleResumeUpload = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      updateLocalState({ error: 'Please upload a PDF file' });
      return;
    }

    updateLocalState({ isProcessing: true, error: '' });

    try {
      const buffer = await file.arrayBuffer();
      const result = await extractTextFromPDF(buffer);
      
      // Extract parsed data and full text
      const { fullText, ...parsedData } = result;
      
      // Debug logging for resume upload
      console.log('Resume upload parsed data:', {
        name: parsedData.name,
        position: parsedData.position,
        address: parsedData.address,
        email: parsedData.email,
        phone: parsedData.phone,
        linkedin: parsedData.linkedin,
        fullParsedData: parsedData
      });
      
      // Batch update form data for better performance
      // Only update fields that have meaningful data from AI parsing
      const updates = {};
      
      // Only update fields if they have non-empty values from AI
      if (parsedData.name && parsedData.name.trim()) {
        updates.name = parsedData.name.trim();
      }
      if (parsedData.position && parsedData.position.trim()) {
        updates.position = parsedData.position.trim();
      }
      if (parsedData.email && parsedData.email.trim()) {
        updates.email = parsedData.email.trim();
      }
      if (parsedData.phone && parsedData.phone.trim()) {
        updates.phone = parsedData.phone.trim();
      }
      if (parsedData.address && parsedData.address.trim()) {
        updates.address = parsedData.address.trim();
      }
      if (parsedData.linkedin && parsedData.linkedin.trim()) {
        updates.linkedin = parsedData.linkedin.trim();
      }
      if (parsedData.resumeLink && parsedData.resumeLink.trim()) {
        updates.resumeLink = parsedData.resumeLink.trim();
      }
      if (parsedData.portfolioLink && parsedData.portfolioLink.trim()) {
        updates.portfolioLink = parsedData.portfolioLink.trim();
      }

      // Debug logging for updates being applied
      console.log('Resume upload updates to apply:', updates);
      
      // Apply only meaningful updates
      Object.entries(updates).forEach(([field, value]) => {
        handleInputChange(field, value);
      });
      
      // Update core skills if available
      if (parsedData.coreSkills?.length > 0) {
        const skills = [...parsedData.coreSkills];
        while (skills.length < 3) skills.push('');
        handleInputChange('coreSkills', skills);
      }

      // Update highlights if available
      if (parsedData.highlights?.length > 0) {
        handleInputChange('highlights', parsedData.highlights);
      }

      updateLocalState({ 
        suggestedHighlights: [], // Clear suggested highlights
        uploadedResumeText: fullText 
      });
    } catch (err) {
      console.error('Detailed error in handleResumeUpload:', err);
      updateLocalState({ 
        error: `Failed to process resume: ${err.message}` 
      });
    } finally {
      updateLocalState({ isProcessing: false });
    }
  }, [updateLocalState, handleInputChange]);

  const addSuggestedHighlight = useCallback((highlight) => {
    onAddHighlight();
    onHighlightChange(highlights.length, highlight);
    updateLocalState({
      suggestedHighlights: suggestedHighlights.filter(h => h !== highlight)
    });
  }, [onAddHighlight, onHighlightChange, highlights.length, suggestedHighlights, updateLocalState]);

  const generateContextHighlights = useCallback(async () => {
    if (!highlightContext.trim()) {
      updateLocalState({ error: 'Please enter a context focus area first' });
      return;
    }
    
    if (!uploadedResumeText) {
      updateLocalState({ error: 'Please upload a resume first before generating context highlights' });
      return;
    }
    
    updateLocalState({ isProcessing: true, error: '' });
    
    try {
      const contextHighlights = await generateHighlightsFromResume(uploadedResumeText, highlightContext);
      updateLocalState({ suggestedHighlights: contextHighlights });
    } catch (error) {
      console.error('Error generating context highlights:', error);
      updateLocalState({ 
        error: 'Failed to generate context highlights. Please try again.' 
      });
    } finally {
      updateLocalState({ isProcessing: false });
    }
  }, [highlightContext, uploadedResumeText, updateLocalState]);

  const handleContextChange = useCallback((e) => {
    updateLocalState({ highlightContext: e.target.value });
  }, [updateLocalState]);

  const handleQuickExampleClick = useCallback((example) => {
    updateLocalState({ highlightContext: example });
  }, [updateLocalState]);

  // Memoized quick examples
  const quickExamples = useMemo(() => [
    'React development', 'Next.js projects', 'AWS cloud', 'Leadership', 
    'Python', 'DevOps', 'UI/UX design', 'Data analysis'
  ], []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6" data-testid="profile-form">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Candidate Information
      </h2>

      {/* Resume Upload for AI Analysis */}
      <FormSection className="mb-6">
        <FormLabel icon={FileText}>Upload Resume for AI Analysis</FormLabel>
        <div className="mb-2 text-sm text-gray-600">
          Upload a PDF resume to automatically fill out the form
        </div>
        <ResumeUploader
          onUpload={handleResumeUpload}
          isProcessing={isProcessing}
          error={error}
        />
      </FormSection>

      {/* Placement Type Toggle */}
      <FormSection className="mb-6">
        <FormLabel icon={Briefcase}>Placement Type</FormLabel>
        <PlacementTypeToggle
          value={formData.placementType}
          onChange={(value) => handleInputChange('placementType', value)}
        />
      </FormSection>

      {/* Profile Image Upload */}
      <FormSection className="mb-6">
        <FormLabel icon={Upload}>Profile Image</FormLabel>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#2237f1] transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
            id="image-upload"
            data-testid="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <User className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-sm text-gray-500">Click to upload profile image</p>
          </label>
        </div>
      </FormSection>

      {/* Basic Information */}
      <FormSection>
        <FormLabel icon={User}>Full Name</FormLabel>
        <FormInput
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter candidate name"
          data-testid="name-input"
        />
      </FormSection>

      <FormSection>
        <FormLabel>Position</FormLabel>
        <FormInput
          value={formData.position}
          onChange={(e) => handleInputChange('position', e.target.value)}
          placeholder="Enter candidate position"
          data-testid="position-input"
        />
      </FormSection>

      <FormSection>
        <FormLabel>LinkedIn Profile</FormLabel>
        <FormInput
          type="url"
          value={(formData.linkedin || '').replace(/^https?:\/\//, '')}
          onChange={(e) => handleInputChange('linkedin', e.target.value)}
          placeholder="Enter LinkedIn URL"
        />
      </FormSection>

      <FormSection>
        <FormLabel>Resume Link</FormLabel>
        <FormInput
          type="url"
          value={(formData.resumeLink || '').replace(/^https?:\/\//, '')}
          onChange={(e) => handleInputChange('resumeLink', e.target.value)}
          placeholder="Enter resume URL"
        />
      </FormSection>

      <FormSection>
        <FormLabel>Portfolio Link</FormLabel>
        <FormInput
          type="url"
          value={(formData.portfolioLink || '').replace(/^https?:\/\//, '')}
          onChange={(e) => handleInputChange('portfolioLink', e.target.value)}
          placeholder="Enter portfolio URL"
        />
      </FormSection>

      <FormSection>
        <FormLabel>Location</FormLabel>
        <FormInput
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Enter candidate location"
        />
      </FormSection>

      <FormSection>
        <FormLabel>Email Address</FormLabel>
        <FormInput
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Enter candidate email address"
          data-testid="email-input"
        />
      </FormSection>

      <FormSection>
        <FormLabel>Phone Number</FormLabel>
        <FormInput
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="Enter candidate phone number"
          data-testid="phone-input"
        />
      </FormSection>

      {/* Core Skills */}
      <FormSection className="mb-6">
        <FormLabel icon={Wrench}>Core Skills</FormLabel>
        <div className="space-y-2">
          {[0, 1, 2].map((index) => (
            <FormInput
              key={index}
              value={coreSkills[index]}
              onChange={(e) => handleCoreSkillChange(index, e.target.value)}
              placeholder={`Core Skill ${index + 1}`}
            />
          ))}
        </div>
      </FormSection>

      {/* Highlight Context Input */}
      <FormSection className="mb-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <FormLabel>Highlight Focus Context (Optional)</FormLabel>
          <div className="mb-2 text-sm text-gray-600">
            Specify what type of highlights you want to focus on (e.g., "React development", "Next.js projects", "leadership experience", "AWS cloud infrastructure")
          </div>
          <div className="flex gap-2">
            <FormInput
              value={highlightContext}
              onChange={handleContextChange}
              placeholder="e.g., React development, Next.js, AWS, leadership, etc."
              className="flex-1"
              data-testid="context-input"
            />
            <button
              onClick={generateContextHighlights}
              disabled={!highlightContext.trim() || !uploadedResumeText || isProcessing}
              className="px-4 py-2 bg-[#2237f1] text-white rounded-md hover:bg-[#1a2bd8] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm whitespace-nowrap"
              title={!uploadedResumeText ? 'Upload a resume first' : 'Generate context-based highlights'}
              type="button"
              data-testid="generate-button"
            >
              {isProcessing ? (
                <span className="flex items-center" data-testid="generating-status">
                  <Loader className="animate-spin mr-1" size={14} />
                  Generating...
                </span>
              ) : (
                'Generate'
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Upload a resume first, then fill in the context and click Generate to create targeted highlights
          </p>
          {uploadedResumeText && (
            <p className="text-xs text-green-600 mt-1">
              ✓ Resume uploaded and ready for context-based highlight generation
            </p>
          )}
          <div className="mt-2">
            <p className="text-xs text-gray-600 mb-1">Quick examples:</p>
            <div className="flex flex-wrap gap-1">
              {quickExamples.map((example) => (
                <button
                  key={example}
                  onClick={() => handleQuickExampleClick(example)}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  type="button"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </FormSection>

      {/* Key Highlights */}
      <FormSection>
        <div className="flex items-center justify-between mb-2">
          <FormLabel icon={Star}>Key Highlights</FormLabel>
          <button
            onClick={onAddHighlight}
            className="text-[#2237f1] hover:text-[#1a2bd8] text-sm font-medium"
            type="button"
            data-testid="add-highlight"
          >
            Add Highlight
          </button>
        </div>
        
        {highlights.map((highlight, index) => (
          <HighlightInput
            key={index}
            value={highlight}
            onChange={(e) => onHighlightChange(index, e.target.value)}
            onRemove={() => onRemoveHighlight(index)}
            canRemove={highlights.length > 1}
          />
        ))}

        {suggestedHighlights.length > 0 && (
          <div className="mt-4" data-testid="suggested-highlights">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Suggested Highlights
            </h4>
            {suggestedHighlights.map((highlight, index) => (
              <SuggestedHighlight
                key={index}
                highlight={highlight}
                onAdd={addSuggestedHighlight}
              />
            ))}
          </div>
        )}
      </FormSection>
    </div>
  );
}

// PropTypes
ProfileForm.propTypes = {
  formData: PropTypes.shape({
    name: PropTypes.string,
    position: PropTypes.string,
    linkedin: PropTypes.string,
    resumeLink: PropTypes.string,
    portfolioLink: PropTypes.string,
    address: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    highlights: PropTypes.arrayOf(PropTypes.string).isRequired,
    profileImage: PropTypes.string,
    coreSkills: PropTypes.arrayOf(PropTypes.string),
    placementType: PropTypes.oneOf(['Contractor', 'Direct Placement', 'Contract to Hire'])
  }).isRequired,
  onInputChange: PropTypes.func.isRequired,
  onHighlightChange: PropTypes.func.isRequired,
  onAddHighlight: PropTypes.func.isRequired,
  onRemoveHighlight: PropTypes.func.isRequired,
  onImageUpload: PropTypes.func.isRequired
};

// PropTypes for sub-components
FormSection.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

FormLabel.propTypes = {
  children: PropTypes.node.isRequired,
  icon: PropTypes.elementType
};

FormInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string
};

FormTextArea.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  rows: PropTypes.number
};

HighlightInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  canRemove: PropTypes.bool.isRequired
};

SuggestedHighlight.propTypes = {
  highlight: PropTypes.string.isRequired,
  onAdd: PropTypes.func.isRequired
};

ResumeUploader.propTypes = {
  onUpload: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool.isRequired,
  error: PropTypes.string
};

PlacementTypeToggle.propTypes = {
  value: PropTypes.oneOf(['Contractor', 'Direct Placement', 'Contract to Hire']).isRequired,
  onChange: PropTypes.func.isRequired
}; 