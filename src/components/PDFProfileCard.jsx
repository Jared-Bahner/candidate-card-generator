import React from 'react';
import PropTypes from 'prop-types';
import { Document, Page, View, Text, Image, Link, StyleSheet } from '@react-pdf/renderer';
import { ensureHttps } from '../utils/common';

// Constants for layout dimensions
const TEMPLATE_WIDTH = 1920;
const TEMPLATE_HEIGHT = 1080;

// Asset paths
const ASSETS = {
  logo: '/assets/mwilogo.png',
  statusPills: {
  'Contractor': '/assets/Contractor-Status-Pill.png',
  'Direct Placement': '/assets/Direct-Placement-Status-Pill.png',
  'Contract to Hire': '/assets/Contract-to-Hire-Status-Pill.png'
  },
  buttons: {
    resume: '/assets/Resume-Button.png',
    portfolio: '/assets/Portfolio-Button.png'
  }
};

// Helper function to get absolute URL for assets
const getAssetUrl = (path) => {
  if (!path) return '';
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Get the base URL from the window location
  const baseUrl = window.location.origin;
  // For PDF rendering, we need to ensure the URL is absolute
  return `${baseUrl}/${cleanPath}`;
};

// Helper function to get asset path for PDF
const getPdfAssetPath = (path) => {
  if (!path) return '';
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return cleanPath;
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
    objectPosition: 'center',
    width: '100%',
    height: '100%',
    imageResolution: '300dpi',
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
  linkWrapper: {
    position: 'relative',
  },
  linkText: {
    fontSize: 32,
    color: '#2DD4BF',
    fontFamily: 'Space Grotesk',
    fontWeight: 400,
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#2DD4BF',
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
    color: '#2237f1',
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
    flexDirection: 'row',
    gap: 16,
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

const PDFProfileCard = ({ formData }) => {
  // Clean and format URLs at the component level
  const resumeUrl = formData.resumeLink ? ensureHttps(formData.resumeLink) : '';
  const portfolioUrl = formData.portfolioLink ? ensureHttps(formData.portfolioLink) : '';
  const linkedinUrl = formData.linkedin ? ensureHttps(formData.linkedin) : '';

  // Determine which buttons to render
  const shouldRenderResumeButton = Boolean(formData.resumeLink && resumeUrl);
  const shouldRenderPortfolioButton = Boolean(formData.portfolioLink && portfolioUrl);

  // Create buttons array
  const buttons = [];
  if (shouldRenderResumeButton) {
    buttons.push(
      <Link key="resume" src={resumeUrl}>
        <Image
          src={getPdfAssetPath(ASSETS.buttons.resume)}
          style={{ width: 160, height: 64 }}
        />
      </Link>
    );
  }
  if (shouldRenderPortfolioButton) {
    buttons.push(
      <Link key="portfolio" src={portfolioUrl}>
        <Image
          src={getPdfAssetPath(ASSETS.buttons.portfolio)}
          style={{ width: 160, height: 64 }}
        />
      </Link>
    );
  }

  // Debug URL and asset handling
  console.log('PDF Card Debug:', {
    urls: {
      original: {
        resumeLink: formData.resumeLink,
        portfolioLink: formData.portfolioLink,
        linkedin: formData.linkedin
      },
      formatted: {
        resumeUrl,
        portfolioUrl,
        linkedinUrl
      }
    },
    buttonConditions: {
      resumeButton: {
        hasResumeLink: !!formData.resumeLink,
        hasResumeUrl: !!resumeUrl,
        shouldRender: shouldRenderResumeButton
      },
      portfolioButton: {
        hasPortfolioLink: !!formData.portfolioLink,
        hasPortfolioUrl: !!portfolioUrl,
        shouldRender: shouldRenderPortfolioButton
      }
    },
    assets: {
      resumeButton: {
        path: ASSETS.buttons.resume,
        url: getAssetUrl(ASSETS.buttons.resume),
        pdfPath: getPdfAssetPath(ASSETS.buttons.resume)
      },
      portfolioButton: {
        path: ASSETS.buttons.portfolio,
        url: getAssetUrl(ASSETS.buttons.portfolio),
        pdfPath: getPdfAssetPath(ASSETS.buttons.portfolio)
      }
    }
  });

  return (
    <Document>
      <Page 
        size={[TEMPLATE_WIDTH, TEMPLATE_HEIGHT]} 
        style={styles.page}
        key={`${formData.resumeLink}-${formData.portfolioLink}`}
      >
        {/* Status Pill */}
        {formData.placementType && ASSETS.statusPills[formData.placementType] && (
          <Image
            src={getPdfAssetPath(ASSETS.statusPills[formData.placementType])}
            style={styles.statusPill}
          />
        )}

        {/* Profile Image */}
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

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Logo */}
          <Image
            src={getPdfAssetPath(ASSETS.logo)}
            style={styles.logo}
          />

          {/* Name */}
          <Text style={styles.name}>
            {formData.name && formData.name.trim() ? formData.name : 'Candidate Name'}
          </Text>

          {/* Contact Info */}
          <ContactInfo formData={formData} />

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {buttons}
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
                  {skill && skill.trim() ? skill : `Skill ${index + 1}`}
                </Text>
              ))}
            </View>
          </View>

          {/* Key Highlights */}
          {formData.highlights && formData.highlights.some(h => h && h.trim()) && (
            <View style={styles.highlights}>
              <Text style={styles.highlightsTitle}>Key Highlights</Text>
              {formData.highlights
                .filter(highlight => highlight && highlight.trim())
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

const ContactInfo = ({ formData }) => (
    <View style={styles.contactInfo}>
      {formData.position && formData.position.trim() && (
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Position:</Text>
          <Text style={styles.contactValue}>{formData.position}</Text>
        </View>
      )}
      {formData.address && formData.address.trim() && (
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Location:</Text>
          <Text style={styles.contactValue}>{formData.address}</Text>
        </View>
      )}
      {formData.phone && formData.phone.trim() && (
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Phone Number:</Text>
          <Text style={styles.contactValue}>{formData.phone}</Text>
        </View>
      )}
      {formData.email && formData.email.trim() && (
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Email:</Text>
          <Text style={styles.contactValue}>{formData.email}</Text>
        </View>
      )}
      {formData.linkedin && formData.linkedin.trim() && (
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>LinkedIn Profile:</Text>
          <Link src={formatUrl(formData.linkedin)}>
            <View style={styles.linkWrapper}>
              <Text style={styles.linkText}>Visit Here</Text>
              <View style={styles.underline} />
            </View>
          </Link>
        </View>
      )}
    </View>
);

export default PDFProfileCard; 