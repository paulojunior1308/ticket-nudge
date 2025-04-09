export const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            background-color: #f3f4f6;
            border-radius: 8px 8px 0 0;
            margin: -20px -20px 20px -20px;
        }
        .header h2 {
            color: #2563eb;
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 0 20px;
        }
        .details {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            border: 1px solid #e5e7eb;
        }
        .details-item {
            margin: 12px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .details-item:last-child {
            border-bottom: none;
        }
        .details-label {
            font-weight: bold;
            color: #4b5563;
            display: inline-block;
            width: 140px;
        }
        .message {
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #0369a1;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            margin-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 0.9em;
        }
        .signature {
            margin-top: 15px;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Olá, {{name}}! 👋</h2>
        </div>
        
        <div class="content">
            <p>Esperamos que esteja tendo um ótimo dia! Passando para compartilhar os detalhes do atendimento que <span style="font-weight: bold; font-size: 1.1em; color: #2563eb;">{{analyst}}</span> realizou recentemente.</p>
            
            <div class="details">
                <div class="details-item">
                    <span class="details-label">Data:</span>
                    <span>{{service_date}}</span>
                </div>
                <div class="details-item">
                    <span class="details-label">Departamento:</span>
                    <span>{{department}}</span>
                </div>
                <div class="details-item">
                    <span class="details-label">Solução Realizada:</span>
                    <span>{{problem}}</span>
                </div>
            </div>

            <div class="message">
                <p>💡 Para mantermos nosso histórico atualizado, quando possível, pedimos gentilmente que você registre este atendimento em nosso sistema de chamados.</p>
                <p>Caso você já tenha registrado o chamado, ficaríamos muito gratos se pudesse nos responder este email com o número do chamado! 🙏</p>
            </div>

            <div class="footer">
                <p>Agradecemos sua parceria!</p>
                <div class="signature">
                    <p>Atenciosamente,<br>
                    Equipe de Suporte TI - SESC Pompeia</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;

export const replaceTemplateVariables = (template: string, variables: Record<string, string>) => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}; 