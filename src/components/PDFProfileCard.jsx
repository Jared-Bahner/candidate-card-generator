import React from 'react';
import PropTypes from 'prop-types';
import { Document, Page, View, Text, Image, Link, StyleSheet, Svg, Path, Circle, Rect } from '@react-pdf/renderer';
import { ensureHttps } from '../utils/common';

const TEMPLATE_WIDTH = 1920;
const TEMPLATE_HEIGHT = 1080;

const LocationIcon = ({ size = 24, color = "#6B7280" }) => (
  <Svg viewBox="0 0 24 24" width={size} height={size}>
    <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="10" r="3" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EmailIcon = ({ size = 24, color = "#6B7280" }) => (
  <Svg viewBox="0 0 24 24" width={size} height={size}>
    <Rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="m3 7 9 6 9-6" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PhoneIcon = ({ size = 24, color = "#6B7280" }) => (
  <Svg viewBox="0 0 24 24" width={size} height={size}>
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.09 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.62a2 2 0 0 1-.45 2.11L9.1 10.6a16 16 0 0 0 4.3 4.3l1.15-1.15a2 2 0 0 1 2.11-.45c.84.29 1.72.5 2.62.62A2 2 0 0 1 22 16.92z" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LinkedinIcon = ({ size = 24, color = "#6B7280" }) => (
  <Svg viewBox="0 0 24 24" width={size} height={size}>
    <Rect x="2" y="2" width="20" height="20" rx="2" fill="none" stroke="#9CA3AF" strokeWidth={1.8} />
    <Path d="M8 10v8" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Circle cx="8" cy="7" r="1.2" fill={color} />
    <Path d="M12 18v-4.2c0-1.2 1-2.2 2.2-2.2 1.2 0 2.2 1 2.2 2.2V18" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const MwiLogo = ({ width = 220 }) => {
  const height = Math.round(width * (127 / 810));
  return (
    <Svg viewBox="0 0 810 127" width={width} height={height}>
      <Path d="M268.821 70.6744H281.152L282.236 76.0504H282.766C283.623 74.8642 284.707 73.8041 285.994 72.8198C288.137 71.2045 291.365 69.5891 295.652 69.5891C301.124 69.5891 304.654 71.5326 307.125 73.3498C308.512 74.536 309.697 75.7223 310.656 77.1105H311.185C312.244 75.7223 313.556 74.536 315.043 73.3498C317.616 71.5326 321.575 69.5891 327.274 69.5891C338.546 69.5891 347.649 79.2558 347.649 91.5978V125.418H334.234V92.6579C334.234 85.6918 330.577 81.9312 325.105 81.9312C319.103 81.9312 314.917 86.6509 314.917 92.6579V125.418H301.502V92.6579C301.502 85.6918 297.846 81.9312 292.373 81.9312C286.372 81.9312 282.186 86.6509 282.186 92.6579V125.418H268.821V70.6744Z" fill="#010313" />
      <Path d="M356.248 49.1958H370.722V62.0678H356.248V49.1958ZM356.777 70.6744H370.193V125.444H356.777V70.6744Z" fill="#010313" />
      <Path d="M418.988 119.512H418.458C417.374 120.901 416.088 122.087 414.6 123.046C412.028 124.762 407.943 126.479 402.37 126.479C388.425 126.479 377.153 115.197 377.153 98.0338C377.153 80.8711 388.425 69.5891 402.37 69.5891C407.842 69.5891 411.599 71.4064 414.171 73.1226C415.659 74.0817 416.97 75.268 417.929 76.5552H418.458V50.2559H431.874V125.418H420.072L418.988 119.512ZM418.458 98.0591C418.458 87.7614 412.658 81.9564 404.513 81.9564C396.368 81.9564 390.568 87.7614 390.568 98.0591C390.568 108.357 396.368 114.162 404.513 114.162C412.658 114.162 418.458 108.357 418.458 98.0591Z" fill="#010313" />
      <Path d="M435.606 70.6744H449.551L458.679 106.64H460.823L469.951 70.6744H484.98L494.109 106.64H496.252L505.381 70.6744H519.326L505.381 125.444H487.679L478.55 90.0077H476.407L467.278 125.444H449.576L435.631 70.6744H435.606Z" fill="#010313" />
      <Path d="M571.828 109.316C570.642 113.606 563.884 126.504 546.611 126.504C530.522 126.504 518.721 114.692 518.721 98.0591C518.721 81.4264 530.522 69.6144 546.611 69.6144C561.64 69.6144 573.416 81.4264 573.416 96.999C573.416 98.6143 573.215 99.9015 573.088 100.861L572.887 102.375H532.111C533.296 109.997 538.97 115.272 546.585 115.272C552.915 115.272 556.773 111.613 557.857 109.366H571.802L571.828 109.316ZM560.026 93.2131C558.841 86.2471 554.226 80.8711 546.611 80.8711C538.466 80.8711 533.725 86.2471 532.136 93.2131H560.026Z" fill="#010313" />
      <Path d="M589.53 108.786C589.53 111.461 592.858 115.752 600.247 115.752C607.636 115.752 610.435 113.177 610.435 109.846C610.435 106.514 608.922 104.697 602.92 103.738L594.346 102.35C583.074 100.533 576.644 95.9137 576.644 86.7771C576.644 77.6405 584.688 69.5891 599.718 69.5891C615.705 69.5891 622.791 80.8711 622.791 87.3071H609.905C609.905 83.9755 606.148 80.3411 599.718 80.3411C593.287 80.3411 590.059 83.4455 590.059 86.7771C590.059 89.3515 592.531 91.0678 597.574 91.825L606.703 93.2131C617.975 94.9294 623.875 100.078 623.875 109.846C623.875 118.856 616.26 126.479 600.272 126.479C579.897 126.479 576.669 112.521 576.669 108.761H589.53V108.786Z" fill="#010313" />
      <Path d="M632.424 83.5465H623.85V70.6492H632.424V55.1018H645.839V70.6744H658.17V83.5717H645.839V109.871C645.839 112.345 647.125 113.632 649.597 113.632H658.17V125.444H646.369C637.24 125.444 632.424 120.724 632.424 112.546V83.5465Z" fill="#010313" />
      <Path d="M713.95 109.316C712.765 113.606 706.007 126.504 688.733 126.504C672.645 126.504 660.843 114.692 660.843 98.0591C660.843 81.4264 672.645 69.6144 688.733 69.6144C703.763 69.6144 715.539 81.4264 715.539 96.999C715.539 98.6143 715.337 99.9015 715.211 100.861L715.009 102.375H674.234C675.419 109.997 681.093 115.272 688.708 115.272C695.038 115.272 698.896 111.613 699.98 109.366H713.925L713.95 109.316ZM702.149 93.2131C700.964 86.2471 696.349 80.8711 688.733 80.8711C680.588 80.8711 675.847 86.2471 674.259 93.2131H702.149Z" fill="#010313" />
      <Path d="M733.796 70.6744L734.855 75.4951H735.385C736.015 74.637 736.772 73.8798 737.755 73.1226C739.369 71.9364 741.714 70.6492 745.043 70.6492H755.76V83.5465H746.102C739.344 83.5465 735.914 86.979 735.914 93.7431V125.418H722.499V70.6744H733.796Z" fill="#010313" />
      <Path d="M759.543 70.6744H771.874L772.958 76.0504H773.487C774.446 74.8642 775.732 73.8041 777.144 72.8198C779.615 71.2045 783.372 69.5891 788.517 69.5891C800.848 69.5891 809.976 78.7258 809.976 92.6831V125.444H796.561V93.7684C796.561 86.8023 791.719 81.9564 784.759 81.9564C777.8 81.9564 772.958 86.8023 772.958 93.7684V125.444H759.543V70.6744Z" fill="#010313" />
      <Path d="M184.69 0.112315L94.4023 89.6646V126.504H131.506L184.69 73.7534V126.504H237.195V14.7881L222.398 0.112315H184.69Z" fill="#010313" />
      <Path d="M135.289 0H90.2503L0 89.5149V126.354H37.1042L150.223 14.7881L135.289 0Z" fill="#010313" />
    </Svg>
  );
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
    paddingBottom: 20,
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
    marginBottom: 5,
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
    marginTop: 24,
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
                  <Text style={styles.primaryActionLink}>View Resume</Text>
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
              <View style={[styles.statusPill, { backgroundColor: '#0055FF' }]}>
                <Text style={[styles.statusPillText, { color: '#FFFFFF' }]}>{formData.placementType}</Text>
              </View>
            )}
            <MwiLogo width={220} />
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
          <View style={styles.contactIcon}>
            <LocationIcon size={24} />
          </View>
          <Text style={styles.contactText}>{formData.address}</Text>
        </View>
      )}
      {formData.email && formData.email.trim() && (
        <View style={styles.contactRow}>
          <View style={styles.contactIcon}>
            <EmailIcon size={24} />
          </View>
          <Text style={styles.contactText}>{formData.email}</Text>
        </View>
      )}
      {formData.phone && formData.phone.trim() && (
        <View style={styles.contactRow}>
          <View style={styles.contactIcon}>
            <PhoneIcon size={24} />
          </View>
          <Text style={styles.contactText}>{formData.phone}</Text>
        </View>
      )}
      {formData.linkedin && formData.linkedin.trim() && (
        <View style={styles.contactRow}>
          <View style={styles.contactIcon}>
            <LinkedinIcon size={24} />
          </View>
          <Link src={formatUrl(formData.linkedin)}>
            <Text style={styles.linkedinText}>LinkedIn Profile</Text>
          </Link>
        </View>
      )}
    </View>
);

export default PDFProfileCard; 