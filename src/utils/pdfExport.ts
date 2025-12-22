import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportOptions {
    title?: string;
    includeStats?: boolean;
    includeJournal?: boolean;
    darkMode?: boolean;
}

export async function exportToPDF(options: ExportOptions = {}): Promise<void> {
    const {
        title = 'RetailBeastFX Trading Report',
        includeStats = true,
        includeJournal = true,
    } = options;

    // Get the dashboard element
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) {
        alert('Dashboard not found. Please try again.');
        return;
    }

    try {
        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'pdf-loading';
        loadingDiv.innerHTML = `
      <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999;">
        <div style="background: white; padding: 2rem; border-radius: 1rem; text-align: center;">
          <div style="width: 40px; height: 40px; border: 4px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
          <p style="color: #1e293b; font-weight: 600;">Generating PDF...</p>
        </div>
      </div>
      <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
    `;
        document.body.appendChild(loadingDiv);

        // Configure canvas options for better quality
        const canvas = await html2canvas(dashboard, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 1200,
        });

        // Calculate PDF dimensions (A4 size)
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Add title
        pdf.setFontSize(24);
        pdf.setTextColor(59, 130, 246); // Blue
        pdf.text(title, 105, 15, { align: 'center' });

        // Add date
        pdf.setFontSize(10);
        pdf.setTextColor(100, 116, 139); // Slate
        pdf.text(`Generated: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });

        // Add dashboard image
        const imgData = canvas.toDataURL('image/png');

        let heightLeft = imgHeight;
        let position = 30; // Start after header

        // Add first page content
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - position);

        // Add more pages if needed
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Add footer on each page
        const pageCount = pdf.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(148, 163, 184); // Light slate
            pdf.text(`Page ${i} of ${pageCount} | RetailBeastFX Journal`, 105, 290, { align: 'center' });
        }

        // Save the PDF
        const dateStr = new Date().toISOString().split('T')[0];
        pdf.save(`RetailBeastFX_Report_${dateStr}.pdf`);

        // Remove loading indicator
        document.body.removeChild(loadingDiv);

    } catch (error) {
        console.error('PDF export failed:', error);
        const loadingEl = document.getElementById('pdf-loading');
        if (loadingEl) document.body.removeChild(loadingEl);
        alert('Failed to generate PDF. Please try again.');
    }
}

// Quick export function for use in components
export const quickExportPDF = () => exportToPDF({ title: 'RetailBeastFX Trading Report' });
