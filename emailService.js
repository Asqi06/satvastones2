import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';
dotenv.config();

const SELLER_DETAILS = {
  name: "SATVASTONES JEWELRY STUDIO",
  address: "Gunjan Road, Vapi, Gujarat - 396191",
  gstin: "24XXXXX0000X1Z5", // USER: Replace with your actual GSTIN
  pan: "XXXXX0000X",
  state: "Gujarat",
  stateCode: "24"
};

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

export const generateInvoice = (order, sellerSettings = {}) => {
  const seller = {
    name: sellerSettings.businessName || SELLER_DETAILS.name,
    address: sellerSettings.businessAddress || SELLER_DETAILS.address,
    gstin: sellerSettings.gstin || SELLER_DETAILS.gstin,
    pan: sellerSettings.businessPan || SELLER_DETAILS.pan
  };

  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('TAX INVOICE', { align: 'right' });
    doc.fontSize(10).font('Helvetica').text(`Invoice No: ${order.orderNumber || order._id.slice(-8).toUpperCase()}`, { align: 'right' });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();

    // Seller & Buyer
    const startY = doc.y;
    doc.font('Helvetica-Bold').text('SOLD BY:', 50, startY);
    doc.font('Helvetica').text(seller.name);
    doc.text(seller.address);
    doc.text(`GSTIN: ${seller.gstin}`);
    doc.text(`PAN: ${seller.pan}`);

    doc.font('Helvetica-Bold').text('BILL TO:', 350, startY);
    doc.font('Helvetica').text(order.customer.name, 350);
    doc.text(order.customer.address || 'N/A', 350);
    doc.text(`${order.customer.city || ''} - ${order.customer.pincode || ''}`, 350);
    doc.text(`Phone: ${order.customer.phone}`, 350);

    doc.moveDown(2);

    // Table Header
    const tableTop = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Item Description', 50, tableTop);
    doc.text('HSN', 250, tableTop);
    doc.text('Qty', 300, tableTop);
    doc.text('Rate', 350, tableTop);
    doc.text('Taxable', 420, tableTop);
    doc.text('Total', 500, tableTop);
    
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    doc.font('Helvetica');

    // Items
    let currentY = tableTop + 25;
    order.items.forEach(item => {
      const taxable = Math.round((item.price / 1.18) * 100) / 100;
      doc.text(item.title.substring(0, 30), 50, currentY);
      doc.text('7117', 250, currentY);
      doc.text(item.qty.toString(), 300, currentY);
      doc.text(taxable.toString(), 350, currentY);
      doc.text((taxable * item.qty).toFixed(2), 420, currentY);
      doc.text((item.price * item.qty).toFixed(2), 500, currentY);
      currentY += 20;
    });

    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 15;

    // Totals & Tax Logic
    const totalAmount = order.amount;
    const totalTaxable = Math.round((totalAmount / 1.18) * 100) / 100;
    const totalTax = Math.round((totalAmount - totalTaxable) * 100) / 100;
    
    const isLocal = order.customer.pincode?.startsWith('3'); // Gujarat
    
    doc.font('Helvetica-Bold');
    doc.text('Total Taxable Value:', 350, currentY);
    doc.text(`₹${totalTaxable.toFixed(2)}`, 500, currentY);
    currentY += 15;

    if (isLocal) {
      doc.text('CGST (9%):', 350, currentY);
      doc.text(`₹${(totalTax / 2).toFixed(2)}`, 500, currentY);
      currentY += 15;
      doc.text('SGST (9%):', 350, currentY);
      doc.text(`₹${(totalTax / 2).toFixed(2)}`, 500, currentY);
    } else {
      doc.text('IGST (18%):', 350, currentY);
      doc.text(`₹${totalTax.toFixed(2)}`, 500, currentY);
    }
    currentY += 20;

    doc.fontSize(14).text('GRAND TOTAL:', 350, currentY);
    doc.text(`₹${totalAmount.toFixed(2)}`, 500, currentY);

    // Footer
    doc.fontSize(8).font('Helvetica-Oblique').text('This is a computer generated invoice and does not require a physical signature.', 50, 750, { align: 'center' });
    
    doc.end();
  });
};

export const sendEmail = async (to, subject, html, attachments = []) => {
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
        attachments: attachments.map(a => ({
          filename: a.filename,
          content: a.content.toString('base64'),
        }))
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
      html,
      attachments
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
