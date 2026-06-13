import sgMail from "@sendgrid/mail";

let _sgInitialized = false;

function ensureSgInit() {
  if (!_sgInitialized) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    _sgInitialized = true;
  }
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    ensureSgInit();
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}
