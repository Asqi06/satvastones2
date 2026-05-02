import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Primary API-based service (Bulletproof for Render/Vercel)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Fallback SMTP service
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const BRAND_COLOR = '#000000';

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #fff; }
    .container { max-width: 600px; margin: 40px auto; padding: 40px; border: 1px solid #eee; }
    .header { text-align: center; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: bold; letter-spacing: -1px; text-transform: uppercase; }
    .content { margin-bottom: 40px; }
    .footer { text-align: center; font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 2px; }
    .button { display: inline-block; padding: 16px 32px; background: ${BRAND_COLOR}; color: #fff !important; text-decoration: none; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
    .item { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 12px; }
    .divider { height: 1px; background: #eee; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SATVASTONES.</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="divider"></div>
    <div class="footer">
      © 2024 Satvastones Jewelry • Vapi, Gujarat<br>
      No Refunds • No Returns • No Cancellations
    </div>
  </div>
</body>
</html>
`;

export const sendEmail = async (to, subject, html) => {
  const fromName = (process.env.BRAND_NAME || 'Satvastones').replace(/['"]+/g, '').trim();
  let fromEmail = (process.env.EMAIL_FROM || process.env.EMAIL_USER || 'orders@satvastones.com').replace(/['"]+/g, '').trim();

  const finalFrom = fromEmail.includes('<') ? fromEmail : `${fromName} <${fromEmail}>`;

  console.log(`[EMAIL SERVICE] Attempting to send to: ${to} | From: ${finalFrom} | Mode: ${resend ? 'RESEND API' : 'SMTP FALLBACK'}`);

  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: finalFrom,
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error('RESEND API ERROR:', error);
        throw error;
      }
      return data;
    } catch (err) {
      console.warn('Resend failed, falling back to SMTP...');
    }
  }

  try {
    const info = await transporter.sendMail({
      from: finalFrom,
      to,
      subject,
      html
    });
    return info;
  } catch (err) {
    console.error('CRITICAL EMAIL FAILURE:', err.message);
    throw err;
  }
};

export const emailTemplates = {
  welcome: (name) => baseTemplate(`
    <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 20px;">WELCOME TO THE TRIBE, ${name.toUpperCase()}</h1>
    <p>Thank you for joining Satvastones. You now have exclusive access to our aesthetic collections and priority drops.</p>
    <p style="margin-top: 30px;"><a href="${process.env.FRONTEND_URL || 'https://satvastones.in'}" class="button">Enter The Shop</a></p>
  `),

  orderConfirmation: (order) => {
    const itemsHtml = order.items.map(item => `
      <div class="item">
        <span>${item.title} (x${item.qty || 1})</span>
        <span style="font-weight: bold;">₹${item.price * (item.qty || 1)}</span>
      </div>
    `).join('');

    return baseTemplate(`
      <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 20px;">ORDER CONFIRMED</h1>
      <p>Order ID: <b>#${order.orderId?.slice(-8).toUpperCase()}</b></p>
      <p>Your aesthetic pieces are being prepared at our Vapi hub. Here's a summary of your order:</p>
      <div class="divider"></div>
      ${itemsHtml}
      <div class="divider"></div>
      <div class="item">
        <span style="font-weight: bold;">TOTAL</span>
        <span style="font-weight: bold;">₹${order.amount}</span>
      </div>
    `);
  },

  statusUpdate: (order, status, trackingId) => {
    let message = '';
    let trackingHtml = '';

    switch(status) {
      case 'Confirmed': message = 'Your order has been confirmed and is being packed with love.'; break;
      case 'Packed': message = 'Your aesthetic collection is packed and ready for dispatch.'; break;
      case 'Shipped':
      case 'In Transit': 
        message = 'Great news! Your package has left our hub and is in transit.'; 
        if (trackingId) trackingHtml = `<p style="background: #f9f9f9; padding: 20px; text-align: center; font-size: 14px;">Tracking ID: <b>${trackingId}</b></p>`;
        break;
      case 'Out for Delivery': message = 'Your Satvastones package is out for delivery and will reach you today.'; break;
      case 'Delivered': message = 'Your order has been delivered. We hope you love your new aesthetic vibe!'; break;
      default: message = `Your order status has been updated to: ${status}`;
    }

    return baseTemplate(`
      <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 20px;">ORDER STATUS: ${status.toUpperCase()}</h1>
      <p>Order ID: <b>#${order.orderId?.slice(-8).toUpperCase()}</b></p>
      <p>${message}</p>
      ${trackingHtml}
      <p style="margin-top: 30px;"><a href="${process.env.FRONTEND_URL || 'https://satvastones.in'}/account" class="button">Track Order</a></p>
    `);
  },

  abandonedCart: (name) => baseTemplate(`
    <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 20px;">YOUR AESTHETIC VIBE IS WAITING</h1>
    <p>Hi ${name.toUpperCase()}, we noticed you left some pieces in your bag.</p>
    <p>These pieces are currently in high demand, but we've held them for you as part of our **Exclusive Member Access**. Don't let your curated look slip away.</p>
    <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-left: 4px solid #000;">
      <p style="margin: 0; font-size: 12px; font-weight: bold; letter-spacing: 1px;">LIMITED TIME OFFER: COMPLETE YOUR BAG NOW</p>
    </div>
    <p style="margin-top: 30px;"><a href="${process.env.FRONTEND_URL || 'https://satvastones.in'}/cart" class="button">Complete My Order</a></p>
  `),

  loginNotification: (name, time) => baseTemplate(`
    <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 20px;">NEW LOGIN DETECTED</h1>
    <p>Hi ${name.toUpperCase()}, your Satvastones account was just accessed.</p>
    <p style="font-size: 12px; color: #666;">Time: ${time}</p>
    <p>If this was you, you can safely ignore this email. If not, please contact our support team immediately.</p>
  `)
};
