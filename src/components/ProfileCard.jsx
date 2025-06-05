import React from 'react';
import { User } from 'lucide-react';
import PropTypes from 'prop-types';
import { ensureHttps } from '../utils/common';

const StatusPill = ({ type }) => {
  const getStatusImage = () => {
    switch(type?.toLowerCase()) {
      case 'contractor':
        return '/assets/Contractor-Status-Pill.png';
      case 'direct placement':
        return '/assets/Direct-Placement-Status-Pill.png';
      case 'contract to hire':
        return '/assets/Contract-to-Hire-Status-Pill.png';
      default:
        return null;
    }
  };

  const imageSrc = getStatusImage();
  if (!imageSrc) return null;

  return (
    <div className="absolute top-[85px] right-[2%] z-10">
      <img 
        src={imageSrc} 
        alt={type}
        className="h-[48px] w-auto"
      />
    </div>
  );
};

const ProfileImage = ({ src }) => (
  <div className="absolute top-0 left-0 w-[31.6%] h-[67.8%]">
    {src ? (
      <img
        src={src}
        alt="Profile"
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
        <User className="text-gray-400 w-[40%] h-[40%]" />
      </div>
    )}
  </div>
);

const CoreSkills = ({ skills = ['', '', ''] }) => (
  <div className="w-[31.6%] bg-[#e1e1e1] px-[2%] py-[1%] flex flex-col">
    <h4 className="text-[38px] font-semibold text-black mb-[1%] font-termina">Core Skills</h4>
    <div className="space-y-[3%] flex-grow flex flex-col justify-center">
      {skills.map((skill, index) => (
        <div key={index} className="text-[32px] text-black">
          {skill || `Skill ${index + 1}`}
        </div>
      ))}
    </div>
  </div>
);

const KeyHighlights = ({ highlights }) => {
  if (!highlights.some(h => h.trim())) return null;

  return (
    <div className="flex-1 bg-white px-[2%] py-[1%]">
      <h4 className="text-[38px] font-semibold mb-[1%] font-termina" style={{ color: '#2237F1' }}>Highlights</h4>
      <ul className="space-y-[1%]">
        {highlights
          .filter(highlight => highlight.trim())
          .map((highlight, index) => (
            <li key={index} className="text-[24px] text-black flex items-start">
              <span className="text-blue-400 mr-[1%] flex-shrink-0 text-[24px]">•</span>
              <span>{highlight}</span>
            </li>
          ))}
      </ul>
    </div>
  );
};

const ContactInfo = ({ formData }) => (
  <div className="space-y-[1.75%]">
    {formData.position && (
      <div className="flex items-center text-[32px] text-white">
        <span className="text-white font-bold font-space-grotesk mr-[2%]">Position:</span>
        <span>{formData.position}</span>
      </div>
    )}
    {formData.address && (
      <div className="flex items-center text-[32px] text-white">
        <span className="text-white font-bold font-space-grotesk mr-[2%]">Location:</span>
        <span>{formData.address}</span>
      </div>
    )}
    {formData.phone && (
      <div className="text-[32px] text-white flex items-center">
        <span className="text-white font-bold font-space-grotesk mr-[2%]">Phone Number:</span>
        <span>{formData.phone}</span>
      </div>
    )}
    {formData.email && (
      <div className="text-[32px] text-white flex items-center">
        <span className="text-white font-bold font-space-grotesk mr-[2%]">Email:</span>
        <span>{formData.email}</span>
      </div>
    )}
    {formData.linkedin && (
      <div className="text-[32px] text-white flex items-center" data-pdf-link>
        <span className="text-white font-bold font-space-grotesk mr-[2%]">LinkedIn Profile:</span>
        <a 
          href={ensureHttps(formData.linkedin)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#2DD4BF',
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
          className="hover:bg-teal-500/10 transition-colors rounded px-1"
          data-pdf-link-url={ensureHttps(formData.linkedin)}
        >
          Visit Here
        </a>
      </div>
    )}
  </div>
);

const ResumeLink = ({ url }) => {
  if (!url) return null;
  const secureUrl = ensureHttps(url);

  return (
    <a 
      href={secureUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block hover:opacity-80 transition-opacity"
    >
      <div className="h-16 w-[160px] rounded-[30px] border-2 border-white flex items-center justify-center">
        <span className="text-white text-2xl font-medium">RESUME</span>
      </div>
    </a>
  );
};

const PortfolioLink = ({ url }) => {
  if (!url) return null;
  const secureUrl = ensureHttps(url);

  return (
    <a 
      href={secureUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block hover:opacity-80 transition-opacity"
    >
      <div className="h-16 w-[160px] rounded-[30px] border-2 border-white flex items-center justify-center">
        <span className="text-white text-2xl font-medium">PORTFOLIO</span>
      </div>
    </a>
  );
};

const EmptyState = () => (
  <div className="text-center text-gray-400 py-[3%]">
    <p className="text-[32px]">Start filling out the form to see the candidate template come to life!</p>
  </div>
);

export default function ProfileCard({ formData }) {
  const isEmpty = !formData.name && !formData.address && !formData.phone && 
                 !formData.email && !formData.highlights.some(h => h.trim()) &&
                 !formData.position && !formData.linkedin;

  return (
    <div className="w-full h-full bg-black relative font-primary">
      <StatusPill type={formData.placementType} />
      <ProfileImage src={formData.profileImage} />

      {/* Bottom Container for Skills and Highlights */}
      <div className="absolute top-[67.8%] bottom-0 left-0 right-0 flex">
        <CoreSkills skills={formData.coreSkills} />
        <KeyHighlights highlights={formData.highlights} />
      </div>

      {/* Content Container */}
      <div className="absolute left-[31.6%] pl-[85px] pt-[85px] top-0 right-[2%]">
        {/* MWI Logo */}
        <div className="mb-[2%]">
          <img 
            src="/assets/mwilogo.png" 
            alt="MWI Logo"
            className="w-[24.7%] h-auto"
          />
        </div>

        {/* Name */}
        <h3 className="font-termina text-[76px] font-bold text-white mb-[4%] leading-none">
          {formData.name || 'Candidate Name'}
        </h3>

        <ContactInfo formData={formData} />
        
        {/* Action Buttons */}
        <div className="mt-[4%] flex gap-4">
          <ResumeLink url={formData.resumeLink} />
          <PortfolioLink url={formData.portfolioLink} />
        </div>

        {isEmpty && <EmptyState />}
      </div>
    </div>
  );
}

ProfileCard.propTypes = {
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
  }).isRequired
};

StatusPill.propTypes = {
  type: PropTypes.string
};

ProfileImage.propTypes = {
  src: PropTypes.string
};

CoreSkills.propTypes = {
  skills: PropTypes.arrayOf(PropTypes.string)
};

KeyHighlights.propTypes = {
  highlights: PropTypes.arrayOf(PropTypes.string).isRequired
};

ContactInfo.propTypes = {
  formData: PropTypes.shape({
    position: PropTypes.string,
    address: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    linkedin: PropTypes.string
  }).isRequired
};

ResumeLink.propTypes = {
  url: PropTypes.string
};

PortfolioLink.propTypes = {
  url: PropTypes.string
}; 