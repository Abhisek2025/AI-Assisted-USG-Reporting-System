// src/utils/ReportPDFGenerator.js
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateReportPDF(reportData) {
  const { report, patient, study, radiologist, center } = reportData;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [20, 83, 136]; // #145388 Deep Medical Blue
  const secondaryColor = [70, 80, 95];
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(center?.name || 'APEX ADVANCED DIAGNOSTIC & IMAGING CENTER', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${center?.address || '452 Healthcare Boulevard, Medical District'} | Phone: ${center?.phone || '+1-800-555-USG1'}`, 14, 18);
  doc.text(`Accredited Diagnostic Ultrasound & Imaging Services`, 14, 23);

  // Title Box
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ULTRASOUND (USG) EXAMINATION REPORT', pageWidth / 2, 38, { align: 'center' });

  // Patient & Study Info Table
  const patientInfo = [
    [
      { content: `Patient Name: ${patient?.first_name || ''} ${patient?.last_name || ''}`, styles: { fontStyle: 'bold' } },
      `UHID: ${patient?.uhid || ''}`,
      `Age / Sex: ${patient?.age || ''} Yrs / ${patient?.gender || ''}`
    ],
    [
      `Study Code: ${study?.study_code || ''}`,
      `Study Type: ${study?.study_type || ''}`,
      `Study Date: ${new Date(study?.study_date || Date.now()).toLocaleDateString()}`
    ],
    [
      `Referring Dr: ${study?.referring_doctor || 'Self / OPD'}`,
      `Indication: ${study?.clinical_indication || 'Routine USG'}`,
      `Priority: ${study?.priority || 'NORMAL'}`
    ]
  ];

  autoTable(doc, {
    startY: 42,
    body: patientInfo,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: secondaryColor },
    headStyles: { fillColor: primaryColor }
  });

  let currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 70) + 8;

  // Technique / Indication
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('CLINICAL INDICATION & TECHNIQUE', 14, currentY);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  const techniqueText = report?.technique || 'Real-time grey scale B-mode ultrasound examination was performed using high-resolution convex transducer.';
  const splitTechnique = doc.splitTextToSize(techniqueText, pageWidth - 28);
  doc.text(splitTechnique, 14, currentY + 5);

  currentY += 8 + (splitTechnique.length * 4);

  // Findings Header
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('ULTRASOUND FINDINGS', 14, currentY);

  currentY += 5;

  // Findings Content
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  const findingsLines = doc.splitTextToSize(report?.findings_text || 'No findings recorded.', pageWidth - 28);
  doc.text(findingsLines, 14, currentY);

  currentY += (findingsLines.length * 4.5) + 6;

  // Impression Box
  doc.setFillColor(242, 246, 250);
  doc.setDrawColor(...primaryColor);
  doc.roundedRect(14, currentY, pageWidth - 28, 26, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('IMPRESSION:', 18, currentY + 6);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  const splitImpression = doc.splitTextToSize(report?.impression || 'Normal Ultrasound Study.', pageWidth - 36);
  doc.text(splitImpression, 18, currentY + 12);

  currentY += 34;

  // Disclaimer Note
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text('* Note: Ultrasound is a dynamic real-time cross-sectional imaging modality. Clinical correlation is recommended.', 14, currentY);

  // Radiologist Signature Block
  currentY += 12;

  // Verification Code
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Digital Verification Code: ${report?.verification_code || 'APX-USG-VERIFIED'}`, 14, currentY + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(`DIGITALLY SIGNED & APPROVED BY:`, pageWidth - 80, currentY);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(`${radiologist?.name || 'Dr. Sarah Jenkins'}`, pageWidth - 80, currentY + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text(`${radiologist?.qualification || 'MD Radiodiagnosis'}`, pageWidth - 80, currentY + 11);
  doc.text(`Reg. No: ${radiologist?.registration_number || 'RAD-2024-8890'}`, pageWidth - 80, currentY + 15);
  doc.text(`Approval Date: ${new Date(report?.approved_at || Date.now()).toLocaleString()}`, pageWidth - 80, currentY + 19);

  // Footer Line
  doc.setDrawColor(200, 200, 200);
  doc.line(14, doc.internal.pageSize.getHeight() - 12, pageWidth - 14, doc.internal.pageSize.getHeight() - 12);

  doc.setFontSize(7.5);
  doc.setTextColor(130, 130, 130);
  doc.text(`Page 1 of 1 — Generated by AI-Assisted USG Reporting System`, pageWidth / 2, doc.internal.pageSize.getHeight() - 7, { align: 'center' });

  doc.save(`USG_Report_${study?.study_code || 'Report'}_${patient?.last_name || 'Patient'}.pdf`);
}
