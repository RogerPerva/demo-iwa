// Servicio para enviar correos electrónicos usando Azure Functions

interface SendEmailRequest {
  to: string | string[];
  subject: string;
  body: string;
  from?: string;
  attachments?: Array<{
    name: string;
    contentType: string;
    content: string; // Base64 encoded
  }>;
}

interface SendEmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
  error?: string;
}

class EmailService {
  private azureFunctionUrl: string;

  constructor() {
    // URL de tu Azure Function
    // En desarrollo local: http://localhost:7071/api/send-email
    // En producción: https://your-function-app.azurewebsites.net/api/send-email
    this.azureFunctionUrl = import.meta.env.VITE_AZURE_FUNCTION_URL || 'http://localhost:7071/api/send-email';
  }

  /**
   * Envía un correo electrónico usando Azure Communication Services
   */
  async sendEmail(params: SendEmailRequest): Promise<SendEmailResponse> {
    try {
      const response = await fetch(this.azureFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar el correo');
      }

      const data: SendEmailResponse = await response.json();
      return data;

    } catch (error) {
      console.error('Error en sendEmail:', error);
      return {
        success: false,
        message: 'Error al enviar el correo',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Envía un correo de bienvenida a un usuario nuevo
   */
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<SendEmailResponse> {
    return this.sendEmail({
      to: userEmail,
      subject: 'Bienvenido al Sistema Administrativo',
      body: `Hola ${userName},\n\n¡Bienvenido al sistema administrativo! Tu cuenta ha sido creada exitosamente.\n\nSaludos,\nEl equipo de administración`
    });
  }

  /**
   * Envía notificaciones de bajo stock
   */
  async sendLowStockAlert(userEmail: string, productName: string, currentStock: number): Promise<SendEmailResponse> {
    return this.sendEmail({
      to: userEmail,
      subject: `Alerta: Stock Bajo - ${productName}`,
      body: `Alerta de inventario:\n\nEl producto "${productName}" tiene un stock bajo.\nCantidad actual: ${currentStock} unidades.\n\nPor favor, considera reabastecer este producto.`
    });
  }

  /**
   * Envía un reporte por correo con PDF adjunto
   */
  async sendReport(userEmail: string, reportName: string, reportSummary: { title: string; items: Array<{label: string; value: string}> }, pdfBase64?: string): Promise<SendEmailResponse> {
    // Generar tabla HTML con los datos del resumen
    const itemsHtml = reportSummary.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #4b5563;">${item.label}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${item.value}</td>
      </tr>
    `).join('');

    const emailBody = `
      <h2 style="color: #4F46E5; margin-bottom: 10px;">📊 ${reportSummary.title}</h2>
      <p style="color: #6b7280; margin-bottom: 20px;">Estimado usuario,</p>
      <p style="color: #374151; margin-bottom: 25px;">A continuación encontrarás el resumen del reporte que solicitaste.</p>

      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 15px; font-size: 16px;">Información del Reporte</h3>
        <table style="width: 100%; border-collapse: collapse; background-color: white; border-radius: 6px; overflow: hidden;">
          ${itemsHtml}
        </table>
      </div>

      ${pdfBase64 ? `
        <div style="background-color: #EEF2FF; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #4F46E5; font-weight: 500;">
            📎 El reporte completo está disponible en el archivo PDF adjunto
          </p>
        </div>
      ` : ''}

      <p style="color: #6b7280; margin-top: 25px;">Saludos,<br><strong>El equipo de administración</strong></p>
    `;

    const emailRequest: SendEmailRequest = {
      to: userEmail,
      subject: `📊 ${reportSummary.title}`,
      body: emailBody
    };

    // Si hay PDF, agregarlo como adjunto
    if (pdfBase64) {
      emailRequest.attachments = [{
        name: `${reportName.replace(/\s+/g, '_')}.pdf`,
        contentType: 'application/pdf',
        content: pdfBase64
      }];
    }

    return this.sendEmail(emailRequest);
  }

  /**
   * Genera un PDF de ejemplo con jsPDF y lo envía por correo
   */
  async sendReportWithPDF(userEmail: string, reportName: string, reportData: any): Promise<SendEmailResponse> {
    try {
      // Importar jsPDF dinámicamente
      const { jsPDF } = await import('jspdf');

      // Crear un PDF con datos de ejemplo
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(79, 70, 229); // Color primario
      doc.text(reportName, 20, 20);

      // Fecha
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, 30);

      // Línea separadora
      doc.setDrawColor(79, 70, 229);
      doc.line(20, 35, 190, 35);

      // Contenido
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Resumen Ejecutivo:', 20, 45);

      // Si reportData es un string, usarlo directamente
      if (typeof reportData === 'string') {
        const lines = doc.splitTextToSize(reportData, 170);
        doc.text(lines, 20, 55);
      } else {
        // Si es un objeto, mostrar sus propiedades
        let yPos = 55;
        Object.entries(reportData).forEach(([key, value]) => {
          doc.text(`${key}: ${value}`, 20, yPos);
          yPos += 10;
        });
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Sistema Administrativo - Demo IWA', 20, 280);
      doc.text('Este es un documento generado automáticamente', 20, 285);

      // Convertir a Base64
      const pdfBase64 = doc.output('datauristring').split(',')[1];

      // Preparar el resumen estructurado
      const reportSummary = {
        title: `Reporte: ${reportName}`,
        items: typeof reportData === 'object' && !Array.isArray(reportData)
          ? Object.entries(reportData).map(([key, value]) => ({
              label: key,
              value: String(value)
            }))
          : [{ label: 'Contenido', value: String(reportData) }]
      };

      // Enviar el correo con el PDF
      return await this.sendReport(
        userEmail,
        reportName,
        reportSummary,
        pdfBase64
      );

    } catch (error) {
      console.error('Error al generar PDF:', error);
      return {
        success: false,
        message: 'Error al generar el PDF',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

// Exportar una instancia única del servicio
export const emailService = new EmailService();
export type { SendEmailRequest, SendEmailResponse };
