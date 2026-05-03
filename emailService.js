import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';
import axios from 'axios';
dotenv.config();

const SELLER_DETAILS = {
  name: "SATVASTONES JEWELRY STUDIO",
  address: "Gunjan Road, Vapi, Gujarat - 396191",
  gstin: "24XXXXX0000X1Z5", 
  pan: "XXXXX0000X",
  state: "Gujarat",
  stateCode: "24"
};

// Primary API-based service
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
const ACCENT_COLOR = '#3D2B24';
const BG_COLOR = '#F9F6F1';

const fetchImageBuffer = async (url) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
  } catch (err) {
    console.error(`Failed to fetch image: ${url}`, err.message);
    return null;
  }
};

const baseTemplate = (content, previewText = "Your Satvastones Order Update") => `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&display=swap');
    body { font-family: 'Inter', Helvetica, Arial, sans-serif; line-height: 1.8; color: #1a1a1a; margin: 0; padding: 0; background-color: ${BG_COLOR}; }
    .wrapper { width: 100%; table-layout: fixed; background-color: ${BG_COLOR}; padding-bottom: 60px; }
    .main { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 4px; overflow: hidden; margin-top: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.03); }
    .header { padding: 50px 40px; text-align: center; border-bottom: 1px solid #f0f0f0; }
    .logo { font-size: 28px; font-weight: 700; letter-spacing: -1.5px; text-transform: uppercase; color: ${BRAND_COLOR}; text-decoration: none; }
    .content { padding: 50px 50px; }
    .footer { padding: 40px; text-align: center; background-color: #ffffff; border-top: 1px solid #f0f0f0; }
    .footer p { font-size: 10px; color: #a0a0a0; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0; }
    .button { display: inline-block; padding: 18px 40px; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; border-radius: 2px; transition: all 0.3s ease; }
    .item-row { display: flex; align-items: center; justify-content: space-between; padding: 20px 0; border-bottom: 1px solid #f9f9f9; }
    .item-info { display: flex; align-items: center; gap: 15px; }
    .item-img { width: 50px; height: 65px; background: #f5f5f5; border-radius: 2px; object-contain: cover; }
    .divider { height: 1px; background-color: #f0f0f0; margin: 30px 0; }
    .status-badge { display: inline-block; padding: 6px 15px; background: #f0f0f0; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 50px; color: #666; }
    .next-steps { background: #fafafa; padding: 30px; border-radius: 4px; margin-top: 40px; }
    .next-steps h4 { margin: 0 0 15px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${ACCENT_COLOR}; }
    .next-steps p { margin: 0; font-size: 12px; color: #777; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Hidden Preview Text -->
    <div style="display: none; max-height: 0px; overflow: hidden;">${previewText}</div>
    
    <div class="main">
      <div class="header">
        <a href="https://satvastones.in" class="logo">SATVASTONES.</a>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>© 2024 Satvastones Creative Studio • Vapi, Gujarat</p>
        <p>Aesthetic Curation for the Modern Individual</p>
        <div style="margin-top: 20px;">
          <a href="#" style="margin: 0 10px; color: #999; text-decoration: none; font-size: 10px;">Instagram</a>
          <a href="#" style="margin: 0 10px; color: #999; text-decoration: none; font-size: 10px;">Facebook</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const generateInvoice = async (order, sellerSettings = {}) => {
  const seller = {
    name: sellerSettings.businessName || SELLER_DETAILS.name,
    address: sellerSettings.businessAddress || SELLER_DETAILS.address,
    gstin: sellerSettings.gstin || SELLER_DETAILS.gstin,
    pan: sellerSettings.businessPan || SELLER_DETAILS.pan
  };

  const logoUrl = "https://res.cloudinary.com/djx98xyz/image/upload/v1777711744/logo_black.png"; // Use your actual logo URL here
  const logoBuffer = await fetchImageBuffer(logoUrl);

  return new Promise(async (resolve) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // Background Graphic
    doc.rect(0, 0, 600, 5).fill('#000000');

    // Logo
    if (logoBuffer) {
      doc.image(logoBuffer, 50, 50, { width: 120 });
    } else {
      doc.fontSize(20).font('Helvetica-Bold').text('SATVASTONES.', 50, 50);
    }

    doc.fontSize(20).font('Helvetica-Bold').text('TAX INVOICE', 350, 55, { align: 'right' });
    doc.fontSize(8).font('Helvetica').text(`Invoice No: ${order.orderNumber || order._id.slice(-8).toUpperCase()}`, 350, 80, { align: 'right' });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 350, 92, { align: 'right' });
    doc.moveDown(4);

    // Business Details Table
    const detailsTop = 150;
    doc.fontSize(9).font('Helvetica-Bold').text('SOLD BY:', 50, detailsTop);
    doc.fontSize(10).font('Helvetica').text(seller.name, 50, detailsTop + 15);
    doc.fontSize(9).text(seller.address, 50, detailsTop + 30, { width: 200 });
    doc.font('Helvetica-Bold').text(`GSTIN: `, 50, detailsTop + 60).font('Helvetica').text(seller.gstin, 85, detailsTop + 60);
    doc.font('Helvetica-Bold').text(`PAN: `, 50, detailsTop + 72).font('Helvetica').text(seller.pan, 80, detailsTop + 72);

    doc.font('Helvetica-Bold').text('BILL TO:', 350, detailsTop);
    doc.fontSize(10).font('Helvetica').text(order.customer.name, 350, detailsTop + 15);
    doc.fontSize(9).text(order.customer.address || 'N/A', 350, detailsTop + 30, { width: 200 });
    doc.text(`${order.customer.city || ''} - ${order.customer.pincode || ''}`, 350, detailsTop + 55);
    doc.text(`Contact: ${order.customer.phone}`, 350, detailsTop + 68);

    doc.moveDown(5);

    // Table Header
    const tableTop = doc.y;
    doc.rect(50, tableTop - 5, 500, 20).fill('#f9f9f9');
    doc.fillColor('#999999').fontSize(8).font('Helvetica-Bold');
    doc.text('ITEM', 60, tableTop);
    doc.text('HSN', 240, tableTop);
    doc.text('QTY', 280, tableTop, { width: 30, align: 'center' });
    doc.text('UNIT PRICE', 320, tableTop, { width: 70, align: 'right' });
    doc.text('TAXABLE', 410, tableTop, { width: 60, align: 'right' });
    doc.text('TOTAL', 480, tableTop, { width: 60, align: 'right' });
    
    doc.fillColor('#000000');
    doc.font('Helvetica');

    // Items with Images
    let currentY = tableTop + 25;
    for (const item of order.items) {
      const taxable = Math.round((item.price / 1.18) * 100) / 100;
      
      // Item Image
      const itemImgBuffer = await fetchImageBuffer(item.image);
      if (itemImgBuffer) {
        doc.image(itemImgBuffer, 50, currentY, { width: 25, height: 35 });
      }

      doc.fontSize(9).font('Helvetica-Bold').text(item.title.substring(0, 30), 85, currentY + 5);
      doc.fontSize(8).font('Helvetica').text(item.variant || 'Standard', 85, currentY + 15);
      
      doc.text('7117', 240, currentY + 10);
      doc.text(item.qty.toString(), 280, currentY + 10, { width: 30, align: 'center' });
      doc.text(`₹${taxable.toFixed(2)}`, 320, currentY + 10, { width: 70, align: 'right' });
      doc.text(`₹${(taxable * item.qty).toFixed(2)}`, 410, currentY + 10, { width: 60, align: 'right' });
      doc.font('Helvetica-Bold').text(`₹${(item.price * item.qty).toFixed(2)}`, 480, currentY + 10, { width: 60, align: 'right' });
      
      currentY += 50;
      
      // Page break check
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
    }

    doc.moveTo(50, currentY).lineTo(550, currentY).stroke('#f0f0f0');
    currentY += 20;

    // Totals logic
    const totalAmount = order.amount;
    const totalTaxable = Math.round((totalAmount / 1.18) * 100) / 100;
    const totalTax = Math.round((totalAmount - totalTaxable) * 100) / 100;
    const isLocal = order.customer.pincode?.startsWith('3');

    const renderTotalRow = (label, value, isBold = false) => {
      doc.fontSize(9).font(isBold ? 'Helvetica-Bold' : 'Helvetica').text(label, 350, currentY);
      doc.text(value, 480, currentY, { width: 60, align: 'right' });
      currentY += 18;
    };

    renderTotalRow('Sub-Total (Taxable):', `₹${totalTaxable.toFixed(2)}`);
    if (isLocal) {
      renderTotalRow('CGST (9.0%):', `₹${(totalTax / 2).toFixed(2)}`);
      renderTotalRow('SGST (9.0%):', `₹${(totalTax / 2).toFixed(2)}`);
    } else {
      renderTotalRow('IGST (18.0%):', `₹${totalTax.toFixed(2)}`);
    }
    
    doc.moveDown();
    doc.rect(340, currentY - 5, 220, 30).fill('#000000');
    doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold');
    doc.text('TOTAL PAYABLE:', 350, currentY + 5);
    doc.text(`₹${totalAmount.toFixed(2)}`, 480, currentY + 5, { width: 60, align: 'right' });

    // Footer & Signature
    doc.fillColor('#999999').fontSize(8).font('Helvetica-Oblique').text('This is a computer generated invoice and does not require a physical signature. Goods once sold cannot be returned.', 50, 760, { align: 'center' });
    
    doc.end();
  });
};

export const sendEmail = async (to, subject, html, attachments = []) => {
  const fromName = (process.env.BRAND_NAME || 'Satvastones').replace(/['"]+/g, '').trim();
  let fromEmail = (process.env.EMAIL_FROM || process.env.EMAIL_USER || 'orders@satvastones.com').replace(/['"]+/g, '').trim();
  const finalFrom = fromEmail.includes('<') ? fromEmail : `${fromName} <${fromEmail}>`;

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
      if (!error) return data;
    } catch (err) { console.warn('Resend fallback...'); }
  }

  try {
    const info = await transporter.sendMail({ from: finalFrom, to, subject, html, attachments });
    return info;
  } catch (err) { console.error('Email failure:', err.message); throw err; }
};

export const emailTemplates = {
  welcome: (name) => baseTemplate(`
    <div style="text-align: center;">
      <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 25px; letter-spacing: -1px;">WELCOME TO THE STUDIO, ${name.toUpperCase()}</h1>
      <p style="font-size: 15px; color: #555; margin-bottom: 35px;">At Satvastones, we believe jewelry is more than an accessory—it's an extension of your aesthetic vibe. Thank you for joining our curated community of modern individuals.</p>
      <p><a href="${process.env.FRONTEND_URL || 'https://satvastones.in'}" class="button">EXPLORE THE COLLECTION</a></p>
      
      <div class="next-steps">
        <h4>WHAT'S NEXT?</h4>
        <p>Start exploring our latest drops or visit the Journal to learn about the curation behind our pieces. You'll receive early access to all upcoming "Studio Drops" directly in your inbox.</p>
      </div>
    </div>
  `, "Welcome to Satvastones Creative Studio"),

  orderConfirmation: (order) => {
    const itemsHtml = order.items.map(item => `
      <div class="item-row">
        <div class="item-info">
          <img src="${item.image}" class="item-img" />
          <div style="text-align: left;">
            <p style="margin: 0; font-size: 11px; font-weight: 700; text-transform: uppercase;">${item.title}</p>
            <p style="margin: 0; font-size: 9px; color: #999; text-transform: uppercase;">${item.variant || 'Standard'} • QTY: ${item.qty || 1}</p>
            ${item.customText ? `<p style="margin: 5px 0 0 0; font-size: 9px; color: #ff0000; font-weight: 700;">NAME: ${item.customText}</p>` : ''}
          </div>
        </div>
        <span style="font-size: 12px; font-weight: 700;">₹${item.price * (item.qty || 1)}</span>
      </div>
    `).join('');

    return baseTemplate(`
      <div style="text-align: center; margin-bottom: 40px;">
        <div class="status-badge">Payment Received</div>
        <h1 style="font-size: 28px; font-weight: 700; margin-top: 20px; letter-spacing: -1px;">YOUR VIBE IS SECURED</h1>
        <p style="font-size: 14px; color: #666;">Order #${order.orderNumber || order.orderId?.slice(-8).toUpperCase()}</p>
      </div>

      <p style="font-size: 14px; color: #444; margin-bottom: 30px;">Thank you for your purchase. Our artisans at the Vapi hub are now carefully preparing your aesthetic selection for dispatch.</p>
      
      <div class="divider"></div>
      ${itemsHtml}
      <div class="divider"></div>
      
      <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 16px; margin-top: 20px;">
        <span>TOTAL AMOUNT</span>
        <span>₹${order.amount}</span>
      </div>

      <div class="next-steps">
        <h4>THE JOURNEY BEGINS</h4>
        <p>We've attached your official <b>GST Tax Invoice</b> to this email for your records. You'll receive another update the moment your package leaves our studio hub.</p>
      </div>
      
      <div style="text-align: center; margin-top: 40px;">
        <a href="${process.env.FRONTEND_URL || 'https://satvastones.in'}/account" class="button">TRACK MY ORDER</a>
      </div>
    `, "Order Confirmed - Your Satvastones Vibe is Secured");
  },

  statusUpdate: (order, status, trackingId) => {
    let title = '';
    let description = '';
    let nextStep = '';

    switch(status) {
      case 'Packed': 
        title = 'READY FOR DISPATCH';
        description = 'Your aesthetic collection has been hand-inspected, packed, and is waiting for our delivery partner.';
        nextStep = 'You will receive a tracking link within the next few hours.';
        break;
      case 'Shipped':
      case 'In Transit': 
        title = 'IN TRANSIT';
        description = `Great news! Your package has left our hub and is officially on its way to you via our premium delivery network.`;
        nextStep = trackingId ? `You can track your package using ID: <b>${trackingId}</b>.` : 'Use the button below to see the live status.';
        break;
      case 'Delivered': 
        title = 'ARRIVED';
        description = 'Your Satvastones pieces have been delivered. Welcome to the new era of your aesthetic.';
        nextStep = 'We would love to see how you style them! Tag us @satvastones for a chance to be featured.';
        break;
      default: 
        title = status.toUpperCase();
        description = `Your order status has been updated to ${status}.`;
        nextStep = 'Check your account dashboard for full details.';
    }

    return baseTemplate(`
      <div style="text-align: center; margin-bottom: 40px;">
        <div class="status-badge">${status}</div>
        <h1 style="font-size: 28px; font-weight: 700; margin-top: 20px; letter-spacing: -1px;">${title}</h1>
        <p style="font-size: 14px; color: #666;">Order #${order.orderNumber || order.orderId?.slice(-8).toUpperCase()}</p>
      </div>

      <p style="font-size: 15px; color: #444; text-align: center;">${description}</p>
      
      <div class="next-steps">
        <h4>WHAT'S NEXT?</h4>
        <p>${nextStep}</p>
      </div>
      
      <div style="text-align: center; margin-top: 40px;">
        <a href="${process.env.FRONTEND_URL || 'https://satvastones.in'}/account" class="button">SEE LIVE STATUS</a>
      </div>
    `, `Order Update: ${status}`);
  },

  abandonedCart: (name) => baseTemplate(`
    <div style="text-align: center;">
      <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 25px; letter-spacing: -1px;">YOUR AESTHETIC VIBE IS WAITING</h1>
      <p style="font-size: 15px; color: #555; margin-bottom: 35px;">Hi ${name.toUpperCase()}, we noticed you left some curated pieces in your bag. These pieces are currently in high demand, but we've held them for you as part of our **Exclusive Member Access**.</p>
      
      <div style="background: #fafafa; padding: 30px; border-left: 4px solid #000; margin-bottom: 40px;">
        <p style="margin: 0; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Limited Time Priority Access</p>
      </div>

      <p><a href="${process.env.FRONTEND_URL || 'https://satvastones.in'}/cart" class="button">COMPLETE MY SELECTION</a></p>
      
      <div class="next-steps">
        <h4>WHY WAIT?</h4>
        <p>Our "Studio Drops" are limited in quantity. Completing your order now ensures these unique pieces become part of your aesthetic journey before they are gone.</p>
      </div>
    </div>
  `, "Your Satvastones Bag is Waiting"),

  loginNotification: (name, time) => baseTemplate(`
    <div style="text-align: center;">
      <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 20px; letter-spacing: -1px;">NEW STUDIO LOGIN</h1>
      <p style="font-size: 14px; color: #666; margin-bottom: 30px;">Hi ${name.toUpperCase()}, your Satvastones account was just accessed from a new device.</p>
      
      <div style="background: #f9f9f9; padding: 25px; border-radius: 4px; display: inline-block; min-width: 200px;">
        <p style="margin: 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #999;">TIMESTAMP</p>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #333;">${time}</p>
      </div>

      <div class="next-steps" style="margin-top: 40px;">
        <h4>SECURE YOUR ACCOUNT</h4>
        <p>If this was you, no further action is required. If you do not recognize this login, please contact our Studio Support immediately to secure your vibelist and account data.</p>
      </div>
    </div>
  `, "Security Alert: New Login Detected")
};
