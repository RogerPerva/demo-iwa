// Servicio para enviar correos electrónicos usando Azure Functions

interface SendEmailRequest {
  to: string | string[];
  subject: string;
  body: string;
  from?: string;
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
   * Envía un reporte por correo
   */
  async sendReport(userEmail: string, reportName: string, reportData: string): Promise<SendEmailResponse> {
    return this.sendEmail({
      to: userEmail,
      subject: `Reporte: ${reportName}`,
      body: `Adjunto encontrarás el reporte solicitado:\n\n${reportData}`
    });
  }
}

// Exportar una instancia única del servicio
export const emailService = new EmailService();
export type { SendEmailRequest, SendEmailResponse };
