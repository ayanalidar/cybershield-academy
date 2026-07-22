import PDFDocument from 'pdfkit';
import type { PerformanceSummary, CertificateData } from '@/lib/types';

export async function generateProgressPDF(summary: PerformanceSummary): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 55, right: 55 },
    });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    doc
      .fontSize(24)
      .fillColor('#0f172a')
      .text('CyberShield Academy', { align: 'center' });
    doc
      .fontSize(13)
      .fillColor('#64748b')
      .text('Student Performance Report', { align: 'center' });
    doc.moveDown(0.3);

    const dividerY = doc.y;
    doc
      .moveTo(doc.page.margins.left, dividerY)
      .lineTo(doc.page.width - doc.page.margins.right, dividerY)
      .strokeColor('#e2e8f0')
      .lineWidth(1)
      .stroke();
    doc.moveDown(0.5);

    doc.fontSize(11).fillColor('#0f172a');
    doc.text(`Student: ${summary.userName}`, doc.page.margins.left, doc.y, { continued: false });
    doc.text(`Course: ${summary.courseName}`);
    doc.text(`Report Generated: ${new Date(summary.recordedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
    doc.moveDown(0.8);

    doc
      .fontSize(14)
      .fillColor('#1e293b')
      .text('Overall Performance', { underline: false });
    doc.moveDown(0.3);

    const metrics = [
      { label: 'Modules Completed', value: `${summary.modulesCompleted} / ${summary.totalModules}`, pct: summary.totalModules > 0 ? summary.modulesCompleted / summary.totalModules : 0 },
      { label: 'Quiz Accuracy', value: `${(summary.overallQuizAccuracy * 100).toFixed(1)}%`, pct: summary.overallQuizAccuracy },
      { label: 'Average Focus Score', value: `${summary.averageFocusScore.toFixed(1)}%`, pct: summary.averageFocusScore / 100 },
      { label: 'Lab Completion Rate', value: `${(summary.labCompletionRate * 100).toFixed(1)}%`, pct: summary.labCompletionRate },
      { label: 'Total Study Time', value: `${summary.totalTimeSpentMinutes.toFixed(0)} minutes`, pct: 0 },
      { label: 'Interactions', value: String(summary.totalInteractionCount), pct: 0 },
    ];

    for (const metric of metrics) {
      const y = doc.y;
      doc.fontSize(10).fillColor('#475569').text(metric.label, doc.page.margins.left, y, { width: pageWidth * 0.45 });
      doc.fontSize(10).fillColor('#0f172a').text(metric.value, doc.page.margins.left + pageWidth * 0.5, y, { width: pageWidth * 0.45, align: 'right' });

      if (metric.pct > 0) {
        const barY = doc.y + 2;
        const barWidth = pageWidth * 0.5;
        const barHeight = 6;
        doc
          .rect(doc.page.margins.left + pageWidth * 0.5, barY, barWidth, barHeight)
          .fillColor('#e2e8f0')
          .fill();
        doc
          .rect(doc.page.margins.left + pageWidth * 0.5, barY, barWidth * metric.pct, barHeight)
          .fillColor(metric.pct >= 0.7 ? '#22c55e' : metric.pct >= 0.4 ? '#f59e0b' : '#ef4444')
          .fill();
        doc.y = barY + barHeight + 4;
      } else {
        doc.moveDown(0.2);
      }
    }

    doc.moveDown(0.6);

    if (summary.moduleBreakdown.length > 0) {
      doc
        .fontSize(14)
        .fillColor('#1e293b')
        .text('Module Breakdown');
      doc.moveDown(0.3);

      for (const mod of summary.moduleBreakdown) {
        if (doc.y > doc.page.height - 150) {
          doc.addPage();
        }

        doc
          .fontSize(11)
          .fillColor('#334155')
          .text(mod.moduleTitle, { continued: false });
        doc.moveDown(0.1);

        const details = [
          `Quiz: ${(mod.quizAccuracy * 100).toFixed(0)}%`,
          `Comprehension: ${(mod.comprehensionScore * 100).toFixed(0)}%`,
          `Focus: ${mod.focusScore.toFixed(0)}%`,
          `Lab: ${mod.labCompleted ? `Completed (${mod.labScore !== null ? (mod.labScore * 100).toFixed(0) + '%' : 'N/A'})` : 'Not completed'}`,
          `Time: ${mod.timeSpentMinutes.toFixed(0)} min`,
        ];
        doc.fontSize(9).fillColor('#64748b').text(details.join('  |  '));
        doc.moveDown(0.4);
      }
    }

    doc.moveDown(0.5);

    if (summary.strengths.length > 0) {
      if (doc.y > doc.page.height - 200) doc.addPage();
      doc.fontSize(14).fillColor('#1e293b').text('Strengths');
      doc.moveDown(0.2);
      for (const s of summary.strengths) {
        doc.fontSize(10).fillColor('#16a34a').text(`  *  ${s}`);
      }
      doc.moveDown(0.4);
    }

    if (summary.weaknesses.length > 0) {
      if (doc.y > doc.page.height - 200) doc.addPage();
      doc.fontSize(14).fillColor('#1e293b').text('Areas for Improvement');
      doc.moveDown(0.2);
      for (const w of summary.weaknesses) {
        doc.fontSize(10).fillColor('#dc2626').text(`  *  ${w}`);
      }
      doc.moveDown(0.4);
    }

    if (summary.recommendations.length > 0) {
      if (doc.y > doc.page.height - 200) doc.addPage();
      doc.fontSize(14).fillColor('#1e293b').text('Recommendations');
      doc.moveDown(0.2);
      for (const r of summary.recommendations) {
        doc.fontSize(10).fillColor('#475569').text(`  ${summary.recommendations.indexOf(r) + 1}. ${r}`);
      }
    }

    doc.moveDown(1);
    const footerY = doc.y;
    doc
      .moveTo(doc.page.margins.left, footerY)
      .lineTo(doc.page.width - doc.page.margins.right, footerY)
      .strokeColor('#e2e8f0')
      .lineWidth(1)
      .stroke();
    doc.moveDown(0.3);
    doc
      .fontSize(8)
      .fillColor('#94a3b8')
      .text(
        'This report was automatically generated by CyberShield Academy AI Professor. All metrics are based on platform interaction data.',
        { align: 'center' }
      );

    doc.end();
  });
}

export async function generateCertificatePDF(cert: CertificateData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const width = doc.page.width;
    const height = doc.page.height;
    const margin = 50;

    doc
      .rect(margin, margin, width - margin * 2, height - margin * 2)
      .lineWidth(3)
      .strokeColor('#0f172a')
      .stroke();

    doc
      .rect(margin + 8, margin + 8, width - margin * 2 - 16, height - margin * 2 - 16)
      .lineWidth(1)
      .strokeColor('#94a3b8')
      .stroke();

    doc
      .moveTo(margin + 20, height / 2 + 10)
      .lineTo(width - margin - 20, height / 2 + 10)
      .strokeColor('#cbd5e1')
      .lineWidth(0.5)
      .stroke();

    doc.y = margin + 40;
    doc
      .fontSize(12)
      .fillColor('#64748b')
      .text('CYBERSHIELD ACADEMY', { align: 'center', characterSpacing: 4 });
    doc.moveDown(0.5);
    doc
      .fontSize(28)
      .fillColor('#0f172a')
      .text('Certificate of Completion', { align: 'center' });
    doc.moveDown(1.5);

    doc
      .fontSize(13)
      .fillColor('#475569')
      .text('This certifies that', { align: 'center' });
    doc.moveDown(0.5);
    doc
      .fontSize(26)
      .fillColor('#0f172a')
      .text(cert.userName, { align: 'center' });
    doc.moveDown(0.5);

    doc
      .fontSize(13)
      .fillColor('#475569')
      .text('has successfully completed the course', { align: 'center' });
    doc.moveDown(0.3);
    doc
      .fontSize(20)
      .fillColor('#1e293b')
      .text(cert.courseName, { align: 'center' });
    doc.moveDown(1.5);

    const issueDate = new Date(cert.issuedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    doc
      .fontSize(11)
      .fillColor('#64748b')
      .text(`Issued: ${issueDate}`, { align: 'center' });
    doc.moveDown(0.3);

    doc.y = height / 2 + 25;
    doc
      .fontSize(9)
      .fillColor('#94a3b8')
      .text(`Verification: ${cert.verificationHash.substring(0, 32)}...`, {
        align: 'center',
      });
    doc.moveDown(0.2);
    doc
      .fontSize(8)
      .fillColor('#94a3b8')
      .text('Verify at: /api/certificates/verify?hash=' + cert.verificationHash, {
        align: 'center',
      });

    doc.moveDown(1);
    doc
      .fontSize(9)
      .fillColor('#0f172a')
      .text('Prof. Shield', width - margin - 200, doc.y, { width: 150, align: 'center' });
    doc
      .moveTo(width - margin - 200, doc.y + 2)
      .lineTo(width - margin - 50, doc.y + 2)
      .strokeColor('#0f172a')
      .lineWidth(0.5)
      .stroke();
    doc
      .fontSize(8)
      .fillColor('#64748b')
      .text('AI Professor, CyberShield Academy', width - margin - 200, doc.y + 4, {
        width: 150,
        align: 'center',
      });

    doc.end();
  });
}