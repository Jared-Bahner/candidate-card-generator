import React from 'react';
import PropTypes from 'prop-types';
import { Document, Page, View, Text, Image, Link, StyleSheet } from '@react-pdf/renderer';
import { ensureHttps } from '../utils/common';
import { MWI_LOGO_FALLBACK_DATA_URI, MWI_LOGO_PRIMARY_SRC } from '../utils/mwiLogo';

// Constants for layout dimensions
const TEMPLATE_WIDTH = 1920;
const TEMPLATE_HEIGHT = 1080;

// Asset paths
const ASSETS = {
  logo: MWI_LOGO_PRIMARY_SRC
};

const createSvgDataUri = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const ICONS = {
  location: createSvgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>`
  ),
  email: createSvgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`
  ),
  phone: createSvgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.09 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.62a2 2 0 0 1-.45 2.11L9.1 10.6a16 16 0 0 0 4.3 4.3l1.15-1.15a2 2 0 0 1 2.11-.45c.84.29 1.72.5 2.62.62A2 2 0 0 1 22 16.92z"/></svg>`
  ),
  linkedin: createSvgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="2" stroke="#9CA3AF" stroke-width="1.8"/><path d="M8 10v8" stroke="#6B7280" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="7" r="1.2" fill="#6B7280"/><path d="M12 18v-4.2c0-1.2 1-2.2 2.2-2.2 1.2 0 2.2 1 2.2 2.2V18" stroke="#6B7280" stroke-width="1.8" stroke-linecap="round"/></svg>`
  )
};

// Helper function to get asset path for PDF
const getPdfAssetPath = (path) => {
  if (!path) return '';
  return path;
};

// Create styles
const styles = StyleSheet.create({
  page: {
    width: TEMPLATE_WIDTH,
    height: TEMPLATE_HEIGHT,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    fontFamily: 'Space Grotesk',
    fontWeight: 400,
    color: '#111827',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '31.6%',
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    flexDirection: 'column',
  },
  profileImageContainer: {
    width: '100%',
    height: '52%',
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  profileImage: {
    objectFit: 'cover',
    objectPosition: 'center',
    width: '100%',
    height: '100%',
    imageResolution: '300dpi',
  },
  statusPill: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillText: {
    fontSize: 24,
    fontFamily: 'Space Grotesk',
    fontWeight: 500,
    color: '#111827',
    textAlign: 'center',
  },
  contentContainer: {
    position: 'absolute',
    left: '31.6%',
    top: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 68,
    paddingTop: 46,
    paddingBottom: 36,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  logo: {
    width: 220,
  },
  name: {
    fontSize: 82,
    fontFamily: 'Termina',
    fontWeight: 400,
    color: '#111827',
    marginBottom: 12,
  },
  contactInfo: {
    marginBottom: 16,
    flexDirection: 'column',
    gap: 7,
  },
  contactText: {
    fontSize: 34,
    color: '#111827',
    fontFamily: 'Space Grotesk',
    fontWeight: 400,
    lineHeight: 1.2,
  },
  positionText: {
    fontSize: 40,
    color: '#2237F1',
    fontFamily: 'Space Grotesk',
    fontWeight: 400,
    lineHeight: 1.2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  linkedinText: {
    fontSize: 34,
    color: '#2237F1',
    fontFamily: 'Space Grotesk',
    fontWeight: 400,
    textDecoration: 'underline',
  },
  highlightContainer: {
    marginTop: 14,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  coreSkills: {
    paddingHorizontal: 30,
    paddingTop: 26,
    paddingBottom: 24,
    flex: 1,
  },
  coreSkillsTitle: {
    fontSize: 52,
    fontFamily: 'Termina',
    fontWeight: 400,
    color: '#2237F1',
    marginBottom: 20,
  },
  skillsContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  skillText: {
    fontSize: 44,
    color: '#111827',
    fontFamily: 'Space Grotesk',
    fontWeight: 400,
    lineHeight: 1.2,
  },
  highlightsTitle: {
    fontSize: 44,
    fontFamily: 'Termina',
    fontWeight: 400,
    color: '#2237F1',
    marginBottom: 14,
  },
  highlightText: {
    fontSize: 32,
    color: '#111827',
    marginBottom: 10,
    lineHeight: 1.2,
    fontFamily: 'Space Grotesk',
    fontWeight: 400,
  },
  actionsContainer: {
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryActionLink: {
    width: 252,
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Space Grotesk',
    fontWeight: 500,
    backgroundColor: '#2237F1',
    paddingVertical: 14,
    textAlign: 'center',
  },
  secondaryActionLink: {
    width: 252,
    fontSize: 20,
    color: '#111827',
    fontFamily: 'Space Grotesk',
    fontWeight: 500,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    paddingVertical: 14,
    textAlign: 'center',
  },

});

// Helper function to clean and format URLs
const formatUrl = (url) => {
  if (!url) return '';
  let cleanUrl = url.trim();
  
  // Remove any trailing slashes
  cleanUrl = cleanUrl.replace(/\/+$/, '');
  
  // Ensure URL starts with https://
  cleanUrl = ensureHttps(cleanUrl);
  
  return cleanUrl;
};

const PDFProfileCard = ({ formData, pdfVersion = 'redesign-v2' }) => {
  // Clean and format URLs at the component level
  const resumeUrl = formData.resumeLink ? ensureHttps(formData.resumeLink) : '';
  const portfolioUrl = formData.portfolioLink ? ensureHttps(formData.portfolioLink) : '';

  return (
    <Document>
      <Page 
        size={[TEMPLATE_WIDTH, TEMPLATE_HEIGHT]} 
        style={styles.page}
        key={`${pdfVersion}-${formData.name}-${formData.resumeLink}-${formData.portfolioLink}`}
      >
        <View style={styles.sidebar}>
          <View style={styles.profileImageContainer}>
            {formData.profileImage && (
              <Image
                src={formData.profileImage}
                style={styles.profileImage}
                quality={100}
                cache={false}
              />
            )}
          </View>
          <View style={styles.actionsContainer}>
            <View style={styles.buttonContainer}>
              {resumeUrl && (
                <Link src={resumeUrl}>
                  <Text style={styles.primaryActionLink}>Download Resume</Text>
                </Link>
              )}
              {portfolioUrl && (
                <Link src={portfolioUrl}>
                  <Text style={styles.secondaryActionLink}>Visit Portfolio</Text>
                </Link>
              )}
              {!portfolioUrl && formData.linkedin && formData.linkedin.trim() && (
                <Link src={formatUrl(formData.linkedin)}>
                  <Text style={styles.secondaryActionLink}>LinkedIn Profile</Text>
                </Link>
              )}
            </View>
          </View>
          <View style={styles.coreSkills}>
            <Text style={styles.coreSkillsTitle}>Core Skills</Text>
            <View style={styles.skillsContainer}>
              {(formData.coreSkills || ['', '', '']).map((skill, index) => (
                <Text key={index} style={styles.skillText}>
                  {skill && skill.trim() ? `• ${skill}` : `• Skill ${index + 1}`}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          <View style={styles.topRow}>
            {formData.placementType && (
              <View style={[styles.statusPill, { backgroundColor: '#F3F4F6' }]}>
                <Text style={styles.statusPillText}>{formData.placementType}</Text>
              </View>
            )}
            <Image
              src={getPdfAssetPath(ASSETS.logo) || MWI_LOGO_FALLBACK_DATA_URI}
              style={styles.logo}
            />
          </View>

          {/* Name */}
          <Text style={styles.name}>
            {formData.name && formData.name.trim() ? formData.name : 'Candidate Name'}
          </Text>

          {/* Contact Info */}
          <ContactInfo formData={formData} />

          {/* Highlights */}
          {formData.highlights && formData.highlights.some(h => h && h.trim()) && (
            <View style={styles.highlightContainer}>
              <Text style={styles.highlightsTitle}>Highlights</Text>
              {formData.highlights
                .filter(highlight => highlight && highlight.trim())
                .map((highlight, index) => (
                  <Text key={index} style={styles.highlightText}>• {highlight}</Text>
                ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

PDFProfileCard.propTypes = {
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
  pdfVersion: PropTypes.string
};

const ContactInfo = ({ formData }) => (
    <View style={styles.contactInfo}>
      {formData.position && formData.position.trim() && (
        <Text style={styles.positionText}>{formData.position}</Text>
      )}
      {formData.address && formData.address.trim() && (
        <View style={styles.contactRow}>
          <Image src={ICONS.location} style={styles.contactIcon} />
          <Text style={styles.contactText}>{formData.address}</Text>
        </View>
      )}
      {formData.email && formData.email.trim() && (
        <View style={styles.contactRow}>
          <Image src={ICONS.email} style={styles.contactIcon} />
          <Text style={styles.contactText}>{formData.email}</Text>
        </View>
      )}
      {formData.phone && formData.phone.trim() && (
        <View style={styles.contactRow}>
          <Image src={ICONS.phone} style={styles.contactIcon} />
          <Text style={styles.contactText}>{formData.phone}</Text>
        </View>
      )}
      {formData.linkedin && formData.linkedin.trim() && (
        <View style={styles.contactRow}>
          <Image src={ICONS.linkedin} style={styles.contactIcon} />
          <Link src={formatUrl(formData.linkedin)}>
            <Text style={styles.linkedinText}>LinkedIn Profile</Text>
          </Link>
        </View>
      )}
    </View>
);

export default PDFProfileCard; 