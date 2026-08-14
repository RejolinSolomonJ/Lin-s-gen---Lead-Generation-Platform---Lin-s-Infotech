const nodemailer = require('nodemailer');
const axios = require('axios');

// Get credentials from environment
const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  from: process.env.SMTP_FROM || 'Lin\'s Gen <outreach@linsinfotech.in>',
};

const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886', // Twilio sandbox default
};

/**
 * Checks if email configurations are active
 */
function isEmailConfigured() {
  return !!(smtpConfig.host && smtpConfig.auth.user && smtpConfig.auth.pass);
}

/**
 * Checks if WhatsApp configurations are active
 */
function isWhatsAppConfigured() {
  return !!(twilioConfig.accountSid && twilioConfig.authToken);
}

/**
 * Sends email via SMTP (or mock mode if SMTP not configured)
 */
async function sendEmail({ to, subject, html, text }) {
  if (!to) {
    throw new Error('Email recipient (to) is required');
  }

  if (!isEmailConfigured()) {
    console.warn('⚠️ SMTP Email is not configured. Running in MOCK mode.');
    console.log(`[MOCK EMAIL] TO: ${to}`);
    console.log(`[MOCK EMAIL] SUBJECT: ${subject}`);
    console.log(`[MOCK EMAIL] HTML BODY: ${html}`);
    return {
      sent: true,
      method: 'mock',
      info: 'Mock email logged successfully'
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: smtpConfig.auth,
    });

    const info = await transporter.sendMail({
      from: smtpConfig.from,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Fallback plaintext
      html,
    });

    console.log(`✅ Email sent to ${to} (MessageId: ${info.messageId})`);
    return {
      sent: true,
      method: 'smtp',
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(`❌ Failed to send SMTP email to ${to}:`, error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
}

/**
 * Sends WhatsApp message via Twilio (or mock mode if Twilio not configured)
 */
async function sendWhatsApp({ to, message }) {
  if (!to) {
    throw new Error('WhatsApp recipient (to) is required');
  }

  // Clean phone number: remove spaces, parentheses, dashes. Ensure it has a leading '+'
  let cleanPhone = to.replace(/[\s()\-]/g, '');
  if (!cleanPhone.startsWith('+')) {
    // If it starts with a country code without '+', prepended. Otherwise default to India (+91) if 10 digits.
    if (cleanPhone.length === 10) {
      cleanPhone = '+91' + cleanPhone;
    } else {
      cleanPhone = '+' + cleanPhone;
    }
  }

  if (!isWhatsAppConfigured()) {
    console.warn('⚠️ Twilio WhatsApp is not configured. Running in MOCK mode.');
    console.log(`[MOCK WHATSAPP] TO: whatsapp:${cleanPhone}`);
    console.log(`[MOCK WHATSAPP] MESSAGE: ${message}`);
    return {
      sent: true,
      method: 'mock',
      info: 'Mock WhatsApp logged successfully'
    };
  }

  try {
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioConfig.accountSid}/Messages.json`;
    
    // Create Basic Auth Header
    const authHeader = 'Basic ' + Buffer.from(`${twilioConfig.accountSid}:${twilioConfig.authToken}`).toString('base64');
    
    const params = new URLSearchParams();
    params.append('From', twilioConfig.from);
    params.append('To', `whatsapp:${cleanPhone}`);
    params.append('Body', message);

    const response = await axios.post(twilioUrl, params, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    console.log(`✅ WhatsApp message sent to ${cleanPhone} (SID: ${response.data.sid})`);
    return {
      sent: true,
      method: 'twilio',
      sid: response.data.sid,
    };
  } catch (error) {
    const errorDetails = error.response?.data?.message || error.message;
    console.error(`❌ Failed to send Twilio WhatsApp to ${cleanPhone}:`, errorDetails);
    throw new Error(`WhatsApp sending failed: ${errorDetails}`);
  }
}

/**
 * Returns configuration status of outreach channels
 */
function getConfigStatus() {
  return {
    emailConfigured: isEmailConfigured(),
    whatsappConfigured: isWhatsAppConfigured(),
  };
}

module.exports = {
  sendEmail,
  sendWhatsApp,
  getConfigStatus,
};
