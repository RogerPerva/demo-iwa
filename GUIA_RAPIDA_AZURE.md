# Guía Rápida: Obtener Credenciales de Azure

## 3. Configuración Final

### Para desarrollo local:

Edita `azure-functions/local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AZURE_COMMUNICATION_CONNECTION_STRING": "endpoint=https://acs-demo-iwa-2024.communication.azure.com/;accesskey=TU_KEY_AQUI",
    "AZURE_SENDER_EMAIL_ADDRESS": "DoNotReply@xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.azurecomm.net"
  },
  "Host": {
    "CORS": "*",
    "CORSCredentials": false
  }
}
```

## 4. Probar que funciona

### Instalar dependencias
```bash
cd azure-functions
npm install
```

### Ejecutar localmente
```bash
npm start
```

Deberías ver:
```
Azure Functions Core Tools
...
Functions:
  SendEmail: [POST] http://localhost:7071/api/send-email
```

### Probar con curl
```bash
curl -X POST http://localhost:7071/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "tu-email@gmail.com",
    "subject": "Prueba desde Azure",
    "body": "Este es un correo de prueba!"
  }'
```

Si todo está bien, recibirás:
```json
{
  "success": true,
  "message": "Correo enviado exitosamente",
  "messageId": "xxxxxxxxx"
}
```

Y deberías recibir el correo en unos segundos (revisa spam si no llega).

## Troubleshooting Rápido

### Error: "Connection string no encontrada"
- Verifica que copiaste TODO el connection string (empieza con `endpoint=` y termina con el accesskey)
- No debe tener espacios al inicio o final

### Error: "Domain not verified"
- Asegúrate de haber agregado y verificado un dominio en Email Communication Services
- Para testing, usa el dominio gratuito de Azure (Opción A)

### Error: "Invalid sender address"
- El correo del remitente DEBE pertenecer al dominio verificado
- Si usas el dominio gratuito de Azure, usa exactamente: `DoNotReply@xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.azurecomm.net`

## Costos

- **Azure Communication Services**: 500 correos GRATIS al mes
- **Azure Functions**: 1 millón de ejecuciones GRATIS al mes
- **Dominio Azure Managed**: GRATIS

Total para desarrollo/testing: **$0.00** ✅
