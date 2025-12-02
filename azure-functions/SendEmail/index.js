const { EmailClient } = require("@azure/communication-email");

// Polyfill para crypto en Azure Functions
if (typeof globalThis.crypto === 'undefined') {
    globalThis.crypto = require('crypto').webcrypto;
}

module.exports = async function (context, req) {
    context.log('Función SendEmail ejecutada.');

    // Validar que el request tenga los datos necesarios
    const { to, subject, body, from } = req.body;

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

        // Crear el cliente de email
        const emailClient = new EmailClient(connectionString);

        // Preparar el mensaje
        const emailMessage = {
            senderAddress: from || defaultSenderAddress,
            content: {
                subject: subject,
                plainText: body,
                html: `<html><body><p>${body}</p></body></html>`
            },
            recipients: {
                to: Array.isArray(to) ? to.map(email => ({ address: email })) : [{ address: to }]
            }
        };

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
