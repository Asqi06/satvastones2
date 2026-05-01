import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: process.env.SMTP_PORT || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
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
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Satvastones" <hello@satvastones.com>',
      to,
      subject,
      html
    });
  } catch (err) {
    console.error('Email failed:', err);
  }
};

export const emailTemplates = {
  welcome: (name) => baseTemplate(`
    <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 20px;">WELCOME TO THE TRIBE, ${name.toUpperCase()}</h1>
    <p>Thank you for joining Satvastones. You now have exclusive access to our aesthetic collections and priority drops.</p>
    <p style="margin-top: 30px;"><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Enter The Shop</a></p>
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
    }

    return baseTemplate(`
      <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 20px;">ORDER STATUS: ${status.toUpperCase()}</h1>
      <p>Order ID: <b>#${order.orderId?.slice(-8).toUpperCase()}</b></p>
      <p>${message}</p>
      ${trackingHtml}
      <p style="margin-top: 30px;"><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth" class="button">Track Order</a></p>
    `);
  }
};
