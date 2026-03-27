import React from 'react';
import { pdf } from '@react-pdf/renderer';
import '../fonts';
import PDFProfileCard from '../components/PDFProfileCard';

export const exportProfileCardToPdf = async ({
  formData,
  fileName = 'candidate-card.pdf'
}) => {
  if (!formData) {
    throw new Error('Form data is required for export.');
  }

  const blob = await pdf(
    React.createElement(PDFProfileCard, { formData })
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
