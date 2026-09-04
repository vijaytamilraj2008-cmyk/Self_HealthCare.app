import { jsPDF } from 'jspdf';
import { User } from '../types';
import { documentService } from './documentService';
import { appointmentService } from './appointmentService';

class PdfService {
  /**
   * Generates a clean medical summary PDF for the user
   */
  async generateHealthSummaryPdf(user: User): Promise<void> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const appointments = await appointmentService.getAppointments();
    const documents = await documentService.getDocuments();

    // Document Header
    doc.setFillColor(14, 20, 36);
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Accessible Healthcare Support', 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Personal Healthcare Command Center — Health Summary Report', 14, 26);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}`, 14, 32);

    let y = 48;

    // 1. Patient Profile Snapshot
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('1. Patient Health Profile', 14, y);
    y += 4;

    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, 196, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    const profileData = [
      `Name: ${user.username}`,
      `Mobile: +91 ${user.mobile}`,
      `Blood Group: ${user.bloodGroup || 'Not specified'}`,
      `Age / Gender: ${user.age || 'N/A'} yrs / ${user.gender || 'Not specified'}`,
      `Location: ${user.location || 'Not specified'}`,
      `Emergency Contact: ${user.emergencyContactName} (${user.emergencyContactNumber})`,
      `Known Allergies: ${user.allergies || 'None reported'}`,
      `Existing Conditions: ${user.existingConditions || 'None reported'}`,
      `Current Medications: ${user.currentMedications || 'None reported'}`
    ];

    profileData.forEach((line) => {
      doc.text(line, 16, y);
      y += 6;
    });

    y += 4;

    // 2. Upcoming Consultations & Appointments (INR Currency)
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('2. Scheduled Consultations & Appointments', 14, y);
    y += 4;
    doc.line(14, y, 196, y);
    y += 7;

    if (appointments.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('No scheduled appointments recorded.', 16, y);
      y += 8;
    } else {
      appointments.slice(0, 3).forEach((apt, idx) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(`${idx + 1}. ${apt.doctorName} — ${apt.hospitalName}`, 16, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(`Department: ${apt.department} | Date: ${apt.date} at ${apt.time} | Fee: INR ${apt.fee.toLocaleString('en-IN')}`, 18, y);
        y += 4.5;
        doc.text(`Purpose: ${apt.purpose}`, 18, y);
        y += 6.5;
      });
    }

    y += 4;

    // 3. Recent Document Findings & Prescriptions
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('3. Recent Medical Records & Extracted Prescriptions', 14, y);
    y += 4;
    doc.line(14, y, 196, y);
    y += 7;

    if (documents.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('No medical documents uploaded yet.', 16, y);
      y += 8;
    } else {
      documents.slice(0, 2).forEach((d) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(`Record: ${d.fileName} (${d.documentType})`, 16, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(`Summary: ${d.simpleSummary}`, 18, y, { maxWidth: 175 });
        y += 9;

        if (d.medicinesDetected && d.medicinesDetected.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.text('Extracted Medications:', 18, y);
          y += 4.5;
          doc.setFont('helvetica', 'normal');
          d.medicinesDetected.forEach((m) => {
            doc.text(`• ${m.name} (${m.strength}) — ${m.instructions} (${m.duration})`, 20, y, { maxWidth: 170 });
            y += 4.5;
          });
        }
        y += 4;
      });
    }

    // Disclaimer Footer
    y = Math.max(y + 6, 268);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y, 196, y);
    y += 5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Disclaimer: This summary is prepared by Accessible Healthcare Support for personal reference and does not replace professional medical advice.',
      14,
      y,
      { maxWidth: 180 }
    );

    // Save and download file
    const safeName = user.username.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Health_Summary_${safeName}.pdf`);
  }
}

export const pdfService = new PdfService();
