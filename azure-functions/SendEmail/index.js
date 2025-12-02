const { EmailClient } = require("@azure/communication-email");

// Polyfill para crypto en Azure Functions
if (typeof globalThis.crypto === 'undefined') {
    globalThis.crypto = require('crypto').webcrypto;
}

module.exports = async function (context, req) {
    context.log('Función SendEmail ejecutada.');

    // Validar que el request tenga los datos necesarios
    const { to, subject, body, from, attachments } = req.body;

    if (!to || !subject || !body) {
        context.res = {
            status: 400,
            body: {
                success: false,
                message: "Faltan parámetros requeridos: to, subject, body"
            }
        };
        return;
    }

    try {
        // Obtener la connection string de Azure Communication Services desde variables de entorno
        const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
        const defaultSenderAddress = process.env.AZURE_SENDER_EMAIL_ADDRESS;

        if (!connectionString || !defaultSenderAddress) {
            throw new Error("Configuración de Azure Communication Services no encontrada");
        }

        const emailClient = new EmailClient(connectionString);

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 5px 5px; }
                .button { background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; }
                .report-section { background-color: white; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #4F46E5; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Sistema Administrativo</h1>
                </div>
                <div class="content">
                    <div class="report-section">
                        ${body}
                    </div>
                    ${attachments && attachments.length > 0 ? `
                        <p style="margin-top: 20px; padding: 10px; background-color: #EEF2FF; border-radius: 5px;">
                            📎 Este correo incluye ${attachments.length} archivo(s) adjunto(s)
                        </p>
                    ` : ''}
                </div>
                <div class="footer">
                    <p>Este es un correo automático. Por favor no responder.</p>
                    <p>© 2024 Sistema Administrativo - Demo IWA</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Preparar el mensaje
        const emailMessage = {
            senderAddress: from || defaultSenderAddress,
            content: {
                subject: subject,
                plainText: body,
                html: htmlContent
            },
            recipients: {
                to: Array.isArray(to) ? to.map(email => ({ address: email })) : [{ address: to }]
            }
        };

        // Agregar attachments si existen
        if (attachments && attachments.length > 0) {
            emailMessage.attachments = attachments.map(att => ({
                name: att.name,
                contentType: att.contentType || 'application/pdf',
                contentInBase64: att.content
            }));
        }

        // Enviar el correo
        context.log('Enviando correo a:', to);
        const poller = await emailClient.beginSend(emailMessage);
        const result = await poller.pollUntilDone();

        context.log('Correo enviado exitosamente. ID:', result.id);

        context.res = {
            status: 200,
            body: {
                success: true,
                message: "Correo enviado exitosamente",
                messageId: result.id
            }
        };

    } catch (error) {
        context.log.error('Error al enviar correo:', error);

        context.res = {
            status: 500,
            body: {
                success: false,
                message: "Error al enviar el correo",
                error: error.message
            }
        };
    }
};
