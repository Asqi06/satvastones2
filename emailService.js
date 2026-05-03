import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';
import axios from 'axios';
import converter from 'number-to-words';
dotenv.config();

const SELLER_DETAILS = {
  name: "SATVASTONES JEWELRY STUDIO",
  address: "Gunjan Road, Vapi, Gujarat - 396191",
  gstin: "24XXXXX0000X1Z5", 
  pan: "XXXXX0000X",
  email: "hello@satvastones.in",
  phone: "+91 XXXXX XXXXX",
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

// MINIMALIST THEME
const THEME = {
  BLACK: '#000000',
  STONE: '#F9F6F1',
  TEXT_MID: '#4A4A4A',
  TEXT_LIGHT: '#8E8E8E',
  BORDER: '#E5E5E5',
  WHITE: '#FFFFFF'
};

const fetchImageBuffer = async (url) => {
  if (!url) return null;
  try {
    let finalUrl = url;
    if (url.startsWith('/')) {
      const baseUrl = process.env.FRONTEND_URL || 'https://satvastones.in';
      finalUrl = `${baseUrl}${url}`;
    }
    const response = await axios.get(finalUrl, { responseType: 'arraybuffer', timeout: 5000 });
    return Buffer.from(response.data, 'binary');
  } catch (err) {
    return null;
  }
};

const baseTemplate = (content, previewText = "Your Satvastones Order Update") => `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&display=swap');
    body { font-family: 'Inter', Helvetica, Arial, sans-serif; line-height: 1.8; color: #1a1a1a; margin: 0; padding: 0; background-color: #F9F6F1; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #F9F6F1; padding-bottom: 60px; }
    .main { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 4px; overflow: hidden; margin-top: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.03); }
    .header { padding: 50px 40px; text-align: center; border-bottom: 1px solid #f0f0f0; background: #fff; }
    .logo { font-size: 28px; font-weight: 700; letter-spacing: -1.5px; text-transform: uppercase; color: #000; text-decoration: none; }
    .content { padding: 50px 50px; }
    .footer { padding: 40px; text-align: center; background-color: #ffffff; border-top: 1px solid #f0f0f0; }
    .footer p { font-size: 10px; color: #a0a0a0; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0; }
    .button { display: inline-block; padding: 18px 40px; background-color: #000; color: #ffffff !important; text-decoration: none; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; border-radius: 2px; }
    .divider { height: 1px; background-color: #f0f0f0; margin: 30px 0; }
    .item-row { display: flex; align-items: center; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f9f9f9; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div style="display: none; max-height: 0px; overflow: hidden;">${previewText}</div>
    <div class="main">
      <div class="header"><a href="https://satvastones.in" class="logo">SATVASTONES.</a></div>
      <div class="content">${content}</div>
      <div class="footer">
        <p>© 2024 Satvastones Creative Studio • Vapi, Gujarat</p>
        <p>Aesthetic Curation for the Modern Individual</p>
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
    pan: sellerSettings.businessPan || SELLER_DETAILS.pan,
    email: SELLER_DETAILS.email,
    phone: SELLER_DETAILS.phone
  };

  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // LOGO & HEADER
    doc.fillColor(THEME.BLACK).fontSize(22).font('Helvetica-Bold').text('SATVASTONES.', { letterSpacing: 1 });
    doc.fontSize(8).font('Helvetica').text('Aesthetic Jewelry Studio', { characterSpacing: 2 });
    
    doc.moveDown(2);
    
    // TWO COLUMN HEADER
    const startY = doc.y;
    doc.fontSize(8).fillColor(THEME.TEXT_LIGHT).text('FROM', 40, startY, { characterSpacing: 1 });
    doc.fillColor(THEME.BLACK).fontSize(10).font('Helvetica-Bold').text(seller.name, 40, startY + 12);
    doc.font('Helvetica').fontSize(9).fillColor(THEME.TEXT_MID).text(seller.address, 40, startY + 25, { width: 200 });
    doc.text(`GSTIN: ${seller.gstin}`, 40, startY + 50);

    doc.fillColor(THEME.TEXT_LIGHT).fontSize(8).text('INVOICE TO', 350, startY, { characterSpacing: 1 });
    doc.fillColor(THEME.BLACK).fontSize(10).font('Helvetica-Bold').text(order.customer.name, 350, startY + 12);
    doc.font('Helvetica').fontSize(9).fillColor(THEME.TEXT_MID).text(`${order.customer.address}\n${order.customer.city || ''} ${order.customer.pincode || ''}`, 350, startY + 25, { width: 200 });
    
    doc.moveDown(4);
    
    // INVOICE META
    const metaY = doc.y;
    doc.rect(40, metaY, 515, 40).fill(THEME.STONE);
    doc.fillColor(THEME.BLACK).fontSize(8).font('Helvetica-Bold').text('INVOICE NO', 60, metaY + 10);
    doc.text('DATE', 180, metaY + 10);
    doc.text('ORDER ID', 300, metaY + 10);
    doc.text('PAYMENT', 420, metaY + 10);
    
    doc.font('Helvetica').fontSize(9).text(order.orderNumber || order._id.slice(-8).toUpperCase(), 60, metaY + 22);
    doc.text(new Date(order.createdAt).toLocaleDateString(), 180, metaY + 22);
    doc.text(`#${order._id.slice(-8).toUpperCase()}`, 300, metaY + 22);
    doc.text(order.paymentMethod || 'UPI', 420, metaY + 22);

    doc.moveDown(4);

    // TABLE HEADER
    const tableTop = doc.y + 20;
    doc.fillColor(THEME.BLACK).fontSize(8).font('Helvetica-Bold');
    doc.text('DESCRIPTION', 40, tableTop);
    doc.text('HSN', 250, tableTop);
    doc.text('QTY', 320, tableTop);
    doc.text('RATE', 380, tableTop, { width: 60, align: 'right' });
    doc.text('TOTAL', 480, tableTop, { width: 60, align: 'right' });
    
    doc.moveTo(40, tableTop + 15).lineTo(555, tableTop + 15).lineWidth(0.5).stroke(THEME.BORDER);

    let currentY = tableTop + 25;
    let totalTaxable = 0;
    
    // Tax Rate 3% (1.5% + 1.5%)
    const TAX_RATE = 0.03;

    order.items.forEach((item) => {
      const itemTotal = item.price * (item.qty || 1);
      const itemTaxable = itemTotal / (1 + TAX_RATE);
      totalTaxable += itemTaxable;

      doc.fillColor(THEME.BLACK).fontSize(10).font('Helvetica-Bold').text(item.title, 40, currentY);
      doc.fillColor(THEME.TEXT_LIGHT).fontSize(8).font('Helvetica').text(item.variant || 'Standard Piece', 40, currentY + 12);
      
      doc.fillColor(THEME.TEXT_MID).fontSize(9).text('7117', 250, currentY);
      doc.text((item.qty || 1).toString(), 320, currentY);
      doc.text(`₹${(item.price / (1 + TAX_RATE)).toFixed(2)}`, 380, currentY, { width: 60, align: 'right' });
      doc.font('Helvetica-Bold').text(`₹${itemTotal.toFixed(2)}`, 480, currentY, { width: 60, align: 'right' });

      currentY += 40;
    });

    const totalTax = order.amount - totalTaxable;
    const isLocal = order.customer.pincode?.startsWith('3');

    // TOTALS
    currentY += 20;
    doc.moveTo(350, currentY).lineTo(555, currentY).lineWidth(0.5).stroke(THEME.BLACK);
    currentY += 15;

    const renderRow = (label, value, bold = false) => {
      doc.fillColor(bold ? THEME.BLACK : THEME.TEXT_MID).fontSize(9).font(bold ? 'Helvetica-Bold' : 'Helvetica').text(label, 350, currentY);
      doc.text(value, 480, currentY, { width: 60, align: 'right' });
      currentY += 20;
    };

    renderRow('Subtotal (Taxable)', `₹${totalTaxable.toFixed(2)}`);
    if (isLocal) {
      renderRow('CGST (1.5%)', `₹${(totalTax/2).toFixed(2)}`);
      renderRow('SGST (1.5%)', `₹${(totalTax/2).toFixed(2)}`);
    } else {
      renderRow('IGST (3%)', `₹${totalTax.toFixed(2)}`);
    }
    
    doc.rect(350, currentY, 205, 30).fill(THEME.BLACK);
    doc.fillColor(THEME.WHITE).fontSize(10).font('Helvetica-Bold').text('GRAND TOTAL', 365, currentY + 10);
    doc.text(`₹${order.amount.toFixed(2)}`, 480, currentY + 10, { width: 60, align: 'right' });

    // AMOUNT IN WORDS
    doc.moveDown(8);
    doc.fillColor(THEME.TEXT_LIGHT).fontSize(7).font('Helvetica-Bold').text('TOTAL IN WORDS', { characterSpacing: 1 });
    const words = converter.toWords(Math.round(order.amount)).toUpperCase() + ' RUPEES ONLY';
    doc.fillColor(THEME.BLACK).fontSize(9).font('Helvetica').text(words);

    // FOOTER
    doc.fontSize(7).fillColor(THEME.TEXT_LIGHT).text('This is a computer-generated invoice. No physical signature is required.', 40, 780, { align: 'center', width: 515 });
    doc.text(`GST Tax Invoice · HSN 7117 · Tax Rate 3% · Satvastones Jewelry Studio`, 40, 790, { align: 'center', width: 515 });

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
    </div>
  `, "Welcome to Satvastones Creative Studio"),

  orderConfirmation: (order) => {
    const itemsHtml = order.items.map(item => `
      <div class="item-row">
        <div style="text-align: left;">
          <p style="margin: 0; font-size: 11px; font-weight: 700; text-transform: uppercase;">${item.title}</p>
          <p style="margin: 0; font-size: 9px; color: #999; text-transform: uppercase;">${item.variant || 'Standard'} • QTY: ${item.qty || 1}</p>
        </div>
        <span style="font-size: 12px; font-weight: 700;">₹${item.price * (item.qty || 1)}</span>
      </div>
    `).join('');

    return baseTemplate(`
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 28px; font-weight: 700; margin-top: 20px; letter-spacing: -1px;">YOUR VIBE IS SECURED</h1>
        <p style="font-size: 14px; color: #666;">Order #${order.orderNumber || order.orderId?.slice(-8).toUpperCase()}</p>
      </div>

      <div class="divider"></div>
      ${itemsHtml}
      <div class="divider"></div>
      
      <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 16px; margin-top: 20px;">
        <span>TOTAL AMOUNT</span>
        <span>₹${order.amount}</span>
      </div>

      <div style="background: #fafafa; padding: 20px; border-left: 4px solid #000; margin-top: 40px;">
        <p style="margin: 0; font-size: 12px; color: #777;">We've attached your official **Minimalist Tax Invoice** (3% GST) to this email. Our artisans are now preparing your selection.</p>
      </div>
      
      <div style="text-align: center; margin-top: 40px;">
        <a href="${process.env.FRONTEND_URL || 'https://satvastones.in'}/account" class="button">TRACK MY ORDER</a>
      </div>
    `, "Order Confirmed - Your Satvastones Vibe is Secured");
  },

  statusUpdate: (order, status, trackingId) => {
    return baseTemplate(`
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 28px; font-weight: 700; margin-top: 20px; letter-spacing: -1px;">${status.toUpperCase()}</h1>
        <p style="font-size: 14px; color: #666;">Order #${order.orderNumber || order.orderId?.slice(-8).toUpperCase()}</p>
      </div>
      <p style="font-size: 15px; color: #444; text-align: center;">Your aesthetic selection has been updated to: <b>${status}</b></p>
      <div style="text-align: center; margin-top: 40px;">
        <a href="${process.env.FRONTEND_URL || 'https://satvastones.in'}/account" class="button">SEE LIVE STATUS</a>
      </div>
    `, `Order Update: ${status}`);
  }
};
