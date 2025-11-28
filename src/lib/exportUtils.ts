import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export const exportToPDF = (reportName: string, data: any[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.text(reportName, 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);
  
  // Data
  let yPosition = 45;
  doc.setFontSize(10);
  
  data.forEach((item, index) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    
    const text = `${index + 1}. ${JSON.stringify(item)}`;
    doc.text(text.substring(0, 80), 20, yPosition);
    yPosition += 10;
  });
  
  doc.save(`${reportName}_${Date.now()}.pdf`);
};

export const exportToExcel = (reportName: string, data: any[]) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
  
  XLSX.writeFile(workbook, `${reportName}_${Date.now()}.xlsx`);
};
