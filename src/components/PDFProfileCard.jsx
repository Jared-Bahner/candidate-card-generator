import React from 'react';
import PropTypes from 'prop-types';
import { Document, Page, View, Text, Image, Link, StyleSheet } from '@react-pdf/renderer';
import { ensureHttps } from '../utils/common';

// Constants for layout dimensions
const TEMPLATE_WIDTH = 1920;
const TEMPLATE_HEIGHT = 1080;

// Status pill image mapping
const STATUS_PILLS = {
  'Contractor': '/assets/Contractor-Status-Pill.png',
  'Direct Placement': '/assets/Direct-Placement-Status-Pill.png',
  'Contract to Hire': '/assets/Contract-to-Hire-Status-Pill.png'
};

// Create styles
const styles = StyleSheet.create({
  page: {
    width: TEMPLATE_WIDTH,
    height: TEMPLATE_HEIGHT,
    backgroundColor: '#000000',
    position: 'relative',
    fontFamily: 'Space Grotesk',
    fontWeight: 400,
  },
  profileImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '31.6%',
    height: '67.8%',
    backgroundColor: '#1F2937',
    overflow: 'hidden',
  },
  profileImage: {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
  },
  statusPill: {
    position: 'absolute',
    top: 85,
    right: '2%',
    width: 'auto',
    height: 48,
  },
  contentContainer: {
    position: 'absolute',
    left: '31.6%',
    top: 0,
    right: '2%',
    paddingLeft: 85,
    paddingTop: 85,
  },
  logo: {
    width: '24.7%',
    marginBottom: '2%',
  },
  name: {
    fontSize: 76,
    fontFamily: 'Termina',
    fontWeight: 400,
    color: '#FFFFFF',
    marginBottom: '4%',
  },
  contactInfo: {
    marginBottom: 20,
    flexDirection: 'column',
    gap: 14,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactLabel: {
    fontSize: 32,
    color: '#FFFFFF',
    fontFamily: 'Space Grotesk',
    fontWeight: 700,
    marginRight: 16,
  },
  contactValue: {
    fontSize: 32,
    color: '#FFFFFF',
    fontFamily: 'Space Grotesk',
    fontWeight: 400,
  },
  link: {
    fontSize: 32,
    color: '#2DD4BF',
    textDecoration: 'underline',
    fontFamily: 'Space Grotesk',
    fontWeight: 400,
  },
  bottomContainer: {
    position: 'absolute',
    top: '67.8%',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  coreSkills: {
    width: '31.6%',
    backgroundColor: '#e1e1e1',
    paddingHorizontal: 38,
    paddingVertical: 38,
    display: 'flex',
    flexDirection: 'column',
  },
  coreSkillsTitle: {
    fontSize: 38,
    fontFamily: 'Termina',
    fontWeight: 400,
    color: '#000000',
    marginBottom: 20,
  },
  skillsContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  skillText: {
    fontSize: 32,
    color: '#000000',
    marginBottom: 20,
    fontFamily: 'Space Grotesk',
    fontWeight: 400,
  },
  highlights: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 38,
    paddingVertical: 38,
  },
  highlightsTitle: {
    fontSize: 38,
    fontFamily: 'Termina',
    fontWeight: 400,
    color: '#2237F1',
    marginBottom: 20,
  },
  highlightRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  bulletPoint: {
    fontSize: 24,
    color: '#60A5FA',
    marginRight: '2%',
    fontFamily: 'Space Grotesk',
    fontWeight: 400,
  },
  highlightText: {
    fontSize: 24,
    color: '#000000',
    flex: 1,
    fontFamily: 'Space Grotesk',
    fontWeight: 400,
  },
  buttonContainer: {
    marginTop: '4%',
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    height: 64,
    width: 160,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Space Grotesk',
    fontWeight: 500,
  },
});

// Helper function to get asset URLs
const getAssetUrl = (path) => {
  if (path.startsWith('http')) return path;
  return path.startsWith('/') ? path.slice(1) : path;
};

const ActionButton = ({ text, url }) => {
  if (!url) return null;
  
  const secureUrl = ensureHttps(url);

  return (
    <Link src={secureUrl} style={styles.actionButton}>
      <Text style={styles.buttonText}>{text}</Text>
    </Link>
  );
};

const ContactInfo = ({ formData }) => (
  <View style={styles.contactInfo}>
    <View style={styles.contactRow}>
      <Text style={styles.contactLabel}>Position:</Text>
      <Text style={styles.contactValue}>{formData.position || ''}</Text>
    </View>
    <View style={styles.contactRow}>
      <Text style={styles.contactLabel}>Location:</Text>
      <Text style={styles.contactValue}>{formData.address || ''}</Text>
    </View>
    <View style={styles.contactRow}>
      <Text style={styles.contactLabel}>Phone Number:</Text>
      <Text style={styles.contactValue}>{formData.phone || ''}</Text>
    </View>
    <View style={styles.contactRow}>
      <Text style={styles.contactLabel}>Email:</Text>
      <Text style={styles.contactValue}>{formData.email || ''}</Text>
    </View>
    {formData.linkedin && (
      <View style={styles.contactRow}>
        <Text style={styles.contactLabel}>LinkedIn Profile:</Text>
        <Link src={ensureHttps(formData.linkedin)}>
          <Text style={styles.link}>Visit Here</Text>
        </Link>
      </View>
    )}
  </View>
);

const PDFProfileCard = ({ formData }) => {
  return (
    <Document>
      <Page size={[TEMPLATE_WIDTH, TEMPLATE_HEIGHT]} style={styles.page}>
        {/* Status Pill */}
        {formData.placementType && STATUS_PILLS[formData.placementType] && (
          <Image
            src={getAssetUrl(STATUS_PILLS[formData.placementType])}
            style={styles.statusPill}
          />
        )}

        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          {formData.profileImage && (
            <Image
              src={formData.profileImage}
              style={styles.profileImage}
            />
          )}
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Logo */}
          <Image
            src={getAssetUrl('assets/mwilogo.png')}
            style={styles.logo}
          />

          {/* Name */}
          <Text style={styles.name}>
            {formData.name || 'Candidate Name'}
          </Text>

          {/* Contact Info */}
          <ContactInfo formData={formData} />

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {formData.resumeLink && <ActionButton text="RESUME" url={ensureHttps(formData.resumeLink)} />}
            {formData.portfolioLink && <ActionButton text="PORTFOLIO" url={ensureHttps(formData.portfolioLink)} />}
          </View>
        </View>

        {/* Bottom Container */}
        <View style={styles.bottomContainer}>
          {/* Core Skills */}
          <View style={styles.coreSkills}>
            <Text style={styles.coreSkillsTitle}>Core Skills</Text>
            <View style={styles.skillsContainer}>
              {(formData.coreSkills || ['', '', '']).map((skill, index) => (
                <Text key={index} style={styles.skillText}>
                  {skill || `Skill ${index + 1}`}
                </Text>
              ))}
            </View>
          </View>

          {/* Key Highlights */}
          {formData.highlights.some(h => h.trim()) && (
            <View style={styles.highlights}>
              <Text style={styles.highlightsTitle}>Key Highlights</Text>
              {formData.highlights
                .filter(highlight => highlight.trim())
                .map((highlight, index) => (
                  <View key={index} style={styles.highlightRow}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
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
  }).isRequired
};

ActionButton.propTypes = {
  text: PropTypes.string.isRequired,
  url: PropTypes.string
};

export default PDFProfileCard; 