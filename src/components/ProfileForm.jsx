import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Upload, User, Star, FileText, Loader, Wrench } from 'lucide-react';
import { extractTextFromPDF, generateHighlightsFromResume } from '../services/aiService';

const FormSection = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

const FormLabel = ({ children, icon: Icon }) => (
  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
    {Icon && <Icon className="mr-2" size={16} />}
    {children}
  </label>
);

const FormInput = ({ type = 'text', value, onChange, placeholder, className = '' }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    placeholder={placeholder}
  />
);

const FormTextArea = ({ value, onChange, placeholder, rows = 2 }) => (
  <textarea
    value={value}
    onChange={onChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    rows={rows}
    placeholder={placeholder}
  />
);

const HighlightInput = ({ value, onChange, onRemove, canRemove }) => (
  <div className="flex gap-2 mb-2">
    <FormInput
      value={value}
      onChange={onChange}
      placeholder="Enter a key highlight"
      className="flex-1"
    />
    {canRemove && (
      <button
        onClick={onRemove}
        className="px-2 py-1 text-red-500 hover:bg-red-50 rounded-md transition-colors"
        title="Remove highlight"
      >
        ×
      </button>
    )}
  </div>
);

const SuggestedHighlight = ({ highlight, onAdd }) => (
  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-md mb-2">
    <span className="text-sm text-gray-700">{highlight}</span>
    <button
      onClick={() => onAdd(highlight)}
      className="text-blue-500 hover:text-blue-600 text-sm font-medium"
    >
      Add
    </button>
  </div>
);

const ResumeUploader = ({ onUpload, isProcessing, error }) => (
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
    <input
      type="file"
      accept=".pdf"
      onChange={onUpload}
      className="hidden"
      id="resume-upload"
      disabled={isProcessing}
    />
    <label htmlFor="resume-upload" className="cursor-pointer">
      <FileText className="mx-auto mb-2 text-gray-400" size={32} />
      <p className="text-sm text-gray-500">
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <Loader className="animate-spin mr-2" size={16} />
            Processing resume...
          </span>
        ) : (
          'Click to upload PDF resume'
        )}
      </p>
    </label>
    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
  </div>
);

export default function ProfileForm({ 
  formData, 
  onInputChange, 
  onHighlightChange, 
  onAddHighlight, 
  onRemoveHighlight, 
  onImageUpload 
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestedHighlights, setSuggestedHighlights] = useState([]);
  const [error, setError] = useState('');

  const handleCoreSkillChange = (index, value) => {
    const newCoreSkills = [...(formData.coreSkills || ['', '', ''])];
    newCoreSkills[index] = value;
    onInputChange('coreSkills', newCoreSkills);
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const buffer = await file.arrayBuffer();
      const text = await extractTextFromPDF(buffer);
      
      if (!text?.trim()) {
        throw new Error('No text could be extracted from the PDF');
      }

      const highlights = await generateHighlightsFromResume(text);
      setSuggestedHighlights(highlights);
    } catch (err) {
      console.error('Detailed error in handleResumeUpload:', err);
      setError(`Failed to process resume: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const addSuggestedHighlight = (highlight) => {
    onAddHighlight();
    onHighlightChange(formData.highlights.length, highlight);
    setSuggestedHighlights(prev => prev.filter(h => h !== highlight));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Candidate Information
      </h2>

      {/* Profile Image Upload */}
      <FormSection className="mb-6">
        <FormLabel icon={Upload}>Profile Image</FormLabel>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <User className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-sm text-gray-500">Click to upload profile image</p>
          </label>
        </div>
      </FormSection>

      {/* Basic Information */}
      <FormSection>
        <FormLabel>Full Name</FormLabel>
        <FormInput
          value={formData.name || ''}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="Enter candidate name"
        />
      </FormSection>

      <FormSection>
        <FormLabel>Position</FormLabel>
        <FormInput
          value={formData.position || ''}
          onChange={(e) => onInputChange('position', e.target.value)}
          placeholder="Enter candidate position"
        />
      </FormSection>

      <FormSection>
        <FormLabel>LinkedIn Profile Link</FormLabel>
        <FormInput
          type="url"
          value={formData.linkedin || ''}
          onChange={(e) => onInputChange('linkedin', e.target.value)}
          placeholder="Enter LinkedIn profile URL"
        />
      </FormSection>

      <FormSection>
        <FormLabel>Resume Link</FormLabel>
        <FormInput
          type="url"
          value={formData.resumeLink || ''}
          onChange={(e) => onInputChange('resumeLink', e.target.value)}
          placeholder="Enter resume URL"
        />
      </FormSection>

      <FormSection>
        <FormLabel>Address</FormLabel>
        <FormTextArea
          value={formData.address}
          onChange={(e) => onInputChange('address', e.target.value)}
          placeholder="Enter candidate address"
        />
      </FormSection>

      <FormSection>
        <FormLabel>Email Address</FormLabel>
        <FormInput
          type="email"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          placeholder="Enter candidate email address"
        />
      </FormSection>

      <FormSection>
        <FormLabel>Phone Number</FormLabel>
        <FormInput
          type="tel"
          value={formData.phone}
          onChange={(e) => onInputChange('phone', e.target.value)}
          placeholder="Enter candidate phone number"
        />
      </FormSection>

      {/* Core Skills */}
      <FormSection className="mb-6">
        <FormLabel icon={Wrench}>Core Skills</FormLabel>
        <div className="space-y-2">
          {[0, 1, 2].map((index) => (
            <FormInput
              key={index}
              value={(formData.coreSkills || ['', '', ''])[index]}
              onChange={(e) => handleCoreSkillChange(index, e.target.value)}
              placeholder={`Core Skill ${index + 1}`}
            />
          ))}
        </div>
      </FormSection>

      {/* Resume Upload for AI Analysis */}
      <FormSection className="mb-6">
        <FormLabel>Upload Resume for AI Analysis</FormLabel>
        <ResumeUploader
          onUpload={handleResumeUpload}
          isProcessing={isProcessing}
          error={error}
        />
      </FormSection>

      {/* Key Highlights */}
      <FormSection>
        <div className="flex items-center justify-between mb-2">
          <FormLabel icon={Star}>Key Highlights</FormLabel>
          <button
            onClick={onAddHighlight}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            Add Highlight
          </button>
        </div>
        
        {formData.highlights.map((highlight, index) => (
          <HighlightInput
            key={index}
            value={highlight}
            onChange={(e) => onHighlightChange(index, e.target.value)}
            onRemove={() => onRemoveHighlight(index)}
            canRemove={formData.highlights.length > 1}
          />
        ))}

        {suggestedHighlights.length > 0 && (
          <div className="mt-4">
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

ProfileForm.propTypes = {
  formData: PropTypes.shape({
    name: PropTypes.string,
    position: PropTypes.string,
    linkedin: PropTypes.string,
    resumeLink: PropTypes.string,
    address: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    highlights: PropTypes.arrayOf(PropTypes.string).isRequired,
    profileImage: PropTypes.string,
    coreSkills: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onInputChange: PropTypes.func.isRequired,
  onHighlightChange: PropTypes.func.isRequired,
  onAddHighlight: PropTypes.func.isRequired,
  onRemoveHighlight: PropTypes.func.isRequired,
  onImageUpload: PropTypes.func.isRequired
};

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