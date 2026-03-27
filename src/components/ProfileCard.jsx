import React from 'react';
import { User, MapPin, Mail, Phone, Linkedin } from 'lucide-react';
import PropTypes from 'prop-types';
import { ensureHttps } from '../utils/common';
import { MWI_LOGO_FALLBACK_DATA_URI, MWI_LOGO_PRIMARY_SRC } from '../utils/mwiLogo';

const PILL_SVGS = {
  contractor: '/assets/contractor-pill.svg',
  'direct placement': '/assets/direct-placement-pill.svg',
  'contract to hire': '/assets/contract-to-hire-pill.svg'
};

const StatusPill = ({ type }) => {
  if (!type) return null;

  const normalizedType = type.toLowerCase();
  const src = PILL_SVGS[normalizedType];
  if (!src) return null;

  return (
    <img
      src={src}
      alt={type}
      style={{ height: '52px', width: 'auto' }}
    />
  );
};

const ProfileImage = ({ src }) => (
  <div className="w-full h-[52%]">
    {src ? (
      <img
        src={src}
        alt="Profile"
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <User className="text-gray-400 w-[40%] h-[40%]" />
      </div>
    )}
  </div>
);

const CoreSkills = ({ skills = ['', '', ''] }) => (
  <div className="px-[8%] pt-[8%] pb-[6%] flex-1">
    <h4 className="text-[52px] font-semibold mb-[4%] font-termina" style={{ color: '#2237F1' }}>Core Skills</h4>
    <div className="space-y-[2.5%]">
      {skills.map((skill, index) => (
        <div key={index} className="text-[44px] text-[#111827] leading-[1.2]">
          {skill?.trim() ? `• ${skill}` : `• Skill ${index + 1}`}
        </div>
      ))}
    </div>
  </div>
);

const KeyHighlights = ({ highlights }) => {
  if (!highlights.some(h => h.trim())) return null;

  return (
    <div>
      <h4 className="text-[44px] font-semibold mb-[1.8%] font-termina" style={{ color: '#2237F1' }}>Highlights</h4>
      <div className="space-y-[1.4%]">
        {highlights
          .filter(highlight => highlight.trim())
          .map((highlight, index) => (
            <div key={index} className="flex items-start text-[32px] text-[#111827] leading-[1.2]">
              <span className="mr-[1%]">•</span>
              <p className="flex-1">{highlight}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

const buttonBaseStyle = {
  flex: 1,
  height: '52px',
  lineHeight: '52px',
  textAlign: 'center',
  borderRadius: '2px',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

const ActionButtons = ({ resumeLink, portfolioLink, linkedin }) => (
  <div style={{ display: 'flex', gap: '16px' }}>
    {resumeLink && (
      <a
        href={ensureHttps(resumeLink)}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          ...buttonBaseStyle,
          backgroundColor: '#2237F1',
          color: '#ffffff',
          fontSize: '17px',
        }}
      >
        View Resume
      </a>
    )}
    {portfolioLink && (
      <a
        href={ensureHttps(portfolioLink)}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          ...buttonBaseStyle,
          backgroundColor: '#ffffff',
          color: '#111827',
          fontSize: '15px',
          border: '1px solid #9ca3af',
        }}
      >
        Visit Portfolio
      </a>
    )}
    {!portfolioLink && linkedin && (
      <a
        href={ensureHttps(linkedin)}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          ...buttonBaseStyle,
          backgroundColor: '#ffffff',
          color: '#111827',
          fontSize: '17px',
          border: '1px solid #9ca3af',
        }}
      >
        LinkedIn Profile
      </a>
    )}
  </div>
);

const contactRowStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  fontSize: '34px',
  lineHeight: '40px',
  color: '#111827',
};

const contactIconStyle = {
  width: '30px',
  height: '30px',
  marginRight: '18px',
  flexShrink: 0,
  color: '#6b7280',
};

const ContactInfo = ({ formData }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
    {formData.position && (
      <div style={{ fontSize: '40px', lineHeight: '44px', color: '#2237F1', marginBottom: '5px' }}>
        {formData.position}
      </div>
    )}
    {formData.address && (
      <div style={contactRowStyle}>
        <MapPin style={contactIconStyle} />
        <span style={{ whiteSpace: 'nowrap' }}>{formData.address}</span>
      </div>
    )}
    {formData.email && (
      <div style={contactRowStyle}>
        <Mail style={contactIconStyle} />
        <span>{formData.email}</span>
      </div>
    )}
    {formData.phone && (
      <div style={contactRowStyle}>
        <Phone style={contactIconStyle} />
        <span>{formData.phone}</span>
      </div>
    )}
    {formData.linkedin && (
      <div style={contactRowStyle} data-pdf-link>
        <Linkedin style={contactIconStyle} />
        <a
          href={ensureHttps(formData.linkedin)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#2237F1',
            textDecoration: 'underline',
            textDecorationThickness: '2px',
            textUnderlineOffset: '2px',
          }}
          data-pdf-link-url={ensureHttps(formData.linkedin)}
        >
          LinkedIn Profile
        </a>
      </div>
    )}
  </div>
);



const EmptyState = () => (
  <div className="text-center text-gray-400 py-[3%]">
    <p className="text-[32px]">Start filling out the form to see the candidate template come to life!</p>
  </div>
);

export default function ProfileCard({ formData }) {
  const isEmpty = !formData.name && !formData.address && !formData.phone && 
                 !formData.email && !formData.highlights.some(h => h.trim()) &&
                 !formData.position && !formData.linkedin;

  // Simple fallback if there are layout issues
  if (!formData) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-[#111827] text-center">
          <h3 className="text-2xl mb-2">No Data</h3>
          <p>Please fill out the form to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white relative font-primary text-[#111827]" style={{ width: '1920px', height: '1080px' }}>
      <div className="absolute top-0 bottom-0 left-0 w-[31.6%] border-r border-[#e5e7eb] flex flex-col">
        <ProfileImage src={formData.profileImage} />
        <div className="px-[8%] py-[4%]">
          <ActionButtons
            resumeLink={formData.resumeLink}
            portfolioLink={formData.portfolioLink}
            linkedin={formData.linkedin}
          />
        </div>
        <CoreSkills skills={formData.coreSkills} />
      </div>

      {/* Content Container */}
      <div className="absolute left-[31.6%] top-0 right-0 bottom-0 px-[3.5%] pt-[4%] pb-[1.5%]">
        <div className="flex items-start justify-between mb-[2.2%]">
          <StatusPill type={formData.placementType} />
          <img 
            src={MWI_LOGO_PRIMARY_SRC}
            alt="MWI Logo"
            className="w-[220px] h-auto"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = MWI_LOGO_FALLBACK_DATA_URI;
            }}
          />
        </div>

        {/* Name */}
        <h3 className="font-termina text-[82px] font-bold text-[#111827] mb-[2%] leading-none">
          {formData.name || 'Candidate Name'}
        </h3>

        <ContactInfo formData={formData} />

        <div className="mt-[3.5%] pt-[2%] border-t border-[#e5e7eb]">
          <KeyHighlights highlights={formData.highlights} />
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

ActionButtons.propTypes = {
  resumeLink: PropTypes.string,
  portfolioLink: PropTypes.string,
  linkedin: PropTypes.string
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

