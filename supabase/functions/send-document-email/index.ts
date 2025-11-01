import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface EmailRequest {
  recipients: Array<{
    name: string;
    email: string;
  }>;
  subject: string;
  message: string;
  shareLink: string;
  documentType: string;
  documentNumber: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY n'est pas configur\u00e9e");
    }

    const body: EmailRequest = await req.json();
    const { recipients, subject, message, shareLink, documentType, documentNumber } = body;

    if (!recipients || recipients.length === 0) {
      throw new Error("Aucun destinataire sp\u00e9cifi\u00e9");
    }

    const documentTypeLabel = documentType === 'quote' ? 'Devis' : 
                              documentType === 'invoice' ? 'Facture' : 'Avoir';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #2563eb;
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .content {
            background-color: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
          }
          .message {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            white-space: pre-wrap;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${documentTypeLabel} ${documentNumber}</h1>
        </div>
        <div class="content">
          <p>Bonjour,</p>
          
          <div class="message">${message}</div>
          
          <div style="text-align: center;">
            <a href="${shareLink}" class="button">Consulter le document</a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Vous pouvez \u00e9galement copier ce lien dans votre navigateur:<br>
            <a href="${shareLink}" style="color: #2563eb;">${shareLink}</a>
          </p>
        </div>
        <div class="footer">
          <p>Cet email a \u00e9t\u00e9 envoy\u00e9 automatiquement, merci de ne pas y r\u00e9pondre.</p>
        </div>
      </body>
      </html>
    `;

    const emailText = `
${documentTypeLabel} ${documentNumber}

${message}

Lien vers le document: ${shareLink}

Cordialement
    `;

    const results = [];
    const errors = [];

    for (const recipient of recipients) {
      try {
        const emailData = {
          from: "delivered@resend.dev",
          to: [recipient.email],
          reply_to: "contact@dusaule-a-larbre.fr",
          subject: subject,
          html: emailHtml,
          text: emailText,
        };

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify(emailData),
        });

        const result = await response.json();

        if (!response.ok) {
          errors.push({
            recipient: recipient.email,
            error: result.message || "Erreur inconnue",
          });
        } else {
          results.push({
            recipient: recipient.email,
            success: true,
            id: result.id,
          });
        }
      } catch (error) {
        errors.push({
          recipient: recipient.email,
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        sent: results.length,
        failed: errors.length,
        results,
        errors,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in send-document-email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});