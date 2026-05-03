import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';
import axios from 'axios';
import { toWords } from 'number-to-words';
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

// THEME COLORS (Exact Match)
const THEME = {
  NAVY: '#0D1B2A',
  NAVY_LIGHT: '#243447',
  GOLD: '#C9A84C',
  GOLD_LIGHT: '#E8C96D',
  GOLD_PALE: '#F5EDD4',
  CREAM: '#FDFAF4',
  TEXT_DARK: '#0D1B2A',
  TEXT_MID: '#3A4F63',
  TEXT_MUTED: '#6E8098',
  BORDER: '#D9CBA8',
  BORDER_LIGHT: '#EDE6D0',
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
    .header { padding: 50px 40px; text-align: center; border-bottom: 1px solid #f0f0f0; background: #000; }
    .logo { font-size: 28px; font-weight: 700; letter-spacing: -1.5px; text-transform: uppercase; color: #fff; text-decoration: none; }
    .content { padding: 50px 50px; }
    .footer { padding: 40px; text-align: center; background-color: #ffffff; border-top: 1px solid #f0f0f0; }
    .footer p { font-size: 10px; color: #a0a0a0; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0; }
    .button { display: inline-block; padding: 18px 40px; background-color: #000; color: #ffffff !important; text-decoration: none; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; border-radius: 2px; }
    .divider { height: 1px; background-color: #f0f0f0; margin: 30px 0; }
    .item-row { display: flex; align-items: center; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f9f9f9; }
    .status-badge { display: inline-block; padding: 6px 15px; background: #f0f0f0; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 50px; }
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

  const logoUrl = "https://res.cloudinary.com/djx98xyz/image/upload/v1777711744/logo_black.png";
  const logoBuffer = await fetchImageBuffer(logoUrl);

  return new Promise(async (resolve) => {
    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // PAGE SETUP
    doc.rect(0, 0, 595.28, 841.89).fill(THEME.CREAM);

    // ── HEADER (NAVY) ──
    doc.rect(0, 0, 595.28, 140).fill(THEME.NAVY);
    
    // Logo Mark
    doc.rect(40, 40, 42, 42).lineWidth(2).stroke(THEME.GOLD);
    doc.fillColor(THEME.GOLD).fontSize(16).font('Helvetica-Bold').text('SR', 48, 52); // SR for Satvastones/Studio
    
    // Brand Name
    doc.fillColor(THEME.WHITE).fontSize(18).text(seller.name, 95, 45);
    doc.fillColor(THEME.GOLD_LIGHT).fontSize(8).font('Helvetica').text('PREMIUM E-COMMERCE STORE', 95, 68, { characterSpacing: 2 });
    
    // Brand Details
    doc.fillColor('rgba(255,255,255,0.6)').fontSize(8).font('Helvetica').text(seller.address, 40, 90, { width: 250, lineGap: 2 });
    doc.fillColor('rgba(255,255,255,0.85)').font('Helvetica-Bold').text(`GSTIN: `, 40, 110).font('Helvetica').text(seller.gstin, 75, 110);
    doc.font('Helvetica-Bold').text(`PAN: `, 180, 110).font('Helvetica').text(seller.pan, 210, 110);

    // Title Block
    doc.fillColor(THEME.GOLD).fontSize(28).font('Helvetica-Bold').text('INVOICE', 350, 40, { align: 'right', width: 205 });
    doc.fillColor(THEME.GOLD_LIGHT).fontSize(8).font('Helvetica').text('Tax Invoice · GST Compliant', 350, 72, { align: 'right', width: 205, characterSpacing: 1 });

    // Meta Grid
    const metaY = 95;
    const renderMeta = (label, value, x, y) => {
      doc.fillColor(THEME.GOLD_LIGHT).fontSize(7).text(label.toUpperCase(), x, y, { characterSpacing: 1 });
      doc.fillColor(THEME.WHITE).fontSize(10).font('Helvetica-Bold').text(value, x, y + 10);
    };
    renderMeta('Invoice No.', order.orderNumber || order._id.slice(-8).toUpperCase(), 350, metaY);
    renderMeta('Date', new Date(order.createdAt).toLocaleDateString(), 480, metaY);

    // GOLD STRIPE
    doc.rect(0, 140, 595.28, 4).fill(THEME.GOLD);

    // ── BODY ──
    let currentY = 165;

    // PARTIES
    const partyY = currentY;
    const renderParty = (label, name, detail, x) => {
      doc.fillColor(THEME.GOLD).fontSize(8).font('Helvetica-Bold').text(label.toUpperCase(), x, partyY, { characterSpacing: 2 });
      doc.moveTo(x, partyY + 12).lineTo(x + 230, partyY + 12).lineWidth(0.5).stroke(THEME.BORDER_LIGHT);
      
      doc.fillColor(THEME.TEXT_DARK).fontSize(14).font('Helvetica-Bold').text(name, x, partyY + 25);
      doc.fillColor(THEME.TEXT_MID).fontSize(9).font('Helvetica').text(detail, x, partyY + 45, { width: 230, lineGap: 3 });
    };

    const buyerDetail = `${order.customer.address || 'N/A'}\n${order.customer.city || ''} - ${order.customer.pincode || ''}\nPhone: ${order.customer.phone}\nEmail: ${order.customer.email}`;
    renderParty('Billed To', order.customer.name, buyerDetail, 50);
    renderParty('Shipped To', order.customer.name, buyerDetail, 315);

    currentY += 100;

    // SUPPLY BAR
    doc.rect(0, currentY, 595.28, 30).fill(THEME.NAVY_LIGHT);
    doc.fillColor('rgba(255,255,255,0.45)').fontSize(8).text('PLACE OF SUPPLY', 50, currentY + 11);
    doc.fillColor(THEME.GOLD_LIGHT).fontSize(10).font('Helvetica-Bold').text('Gujarat (24)', 130, currentY + 10);
    
    doc.fillColor('rgba(255,255,255,0.45)').fontSize(8).text('TAX TYPE', 250, currentY + 11);
    const isLocal = order.customer.pincode?.startsWith('3');
    doc.fillColor(THEME.GOLD_LIGHT).fontSize(10).font('Helvetica-Bold').text(isLocal ? 'CGST + SGST (Intrastate)' : 'IGST (Interstate)', 300, currentY + 10);

    currentY += 50;

    // ITEMS TABLE
    doc.fillColor(THEME.GOLD).fontSize(8).font('Helvetica-Bold').text('ITEM DETAILS', 50, currentY, { characterSpacing: 2 });
    doc.moveTo(50, currentY + 12).lineTo(545, currentY + 12).lineWidth(0.5).stroke(THEME.BORDER_LIGHT);
    currentY += 25;

    // Table Header
    doc.rect(50, currentY - 5, 495, 20).fill(THEME.NAVY);
    doc.fillColor(THEME.GOLD_LIGHT).fontSize(7).font('Helvetica-Bold');
    doc.text('#', 60, currentY);
    doc.text('DESCRIPTION OF GOODS', 85, currentY);
    doc.text('HSN', 260, currentY);
    doc.text('QTY', 300, currentY);
    doc.text('TAXABLE', 350, currentY, { width: 80, align: 'right' });
    doc.text('TAX AMT', 440, currentY, { width: 50, align: 'right' });
    doc.text('TOTAL', 500, currentY, { width: 45, align: 'right' });

    currentY += 25;
    doc.fillColor(THEME.TEXT_DARK);
    
    let totalTaxable = 0;
    let totalTaxAmt = 0;

    order.items.forEach((item, idx) => {
      const taxable = Math.round((item.price / 1.18) * 100) / 100;
      const taxAmt = (item.price - taxable) * item.qty;
      const rowTotal = item.price * item.qty;
      
      totalTaxable += taxable * item.qty;
      totalTaxAmt += taxAmt;

      doc.fillColor(THEME.GOLD).fontSize(9).font('Helvetica-Bold').text((idx + 1).toString().padStart(2, '0'), 60, currentY);
      doc.fillColor(THEME.TEXT_DARK).fontSize(10).text(item.title, 85, currentY);
      doc.fillColor(THEME.TEXT_MUTED).fontSize(8).font('Helvetica').text(item.variant || 'Standard', 85, currentY + 12);
      
      doc.rect(85, currentY + 22, 40, 12).fill(THEME.GOLD_PALE);
      doc.fillColor(THEME.NAVY).fontSize(7).font('Helvetica-Bold').text('HSN: 7117', 89, currentY + 25);

      doc.fillColor(THEME.TEXT_DARK).fontSize(9).text('7117', 260, currentY + 5);
      doc.text(item.qty.toString(), 300, currentY + 5);
      doc.text(`₹${(taxable * item.qty).toFixed(2)}`, 350, currentY + 5, { width: 80, align: 'right' });
      doc.text(`₹${taxAmt.toFixed(2)}`, 440, currentY + 5, { width: 50, align: 'right' });
      doc.font('Helvetica-Bold').text(`₹${rowTotal.toFixed(2)}`, 500, currentY + 5, { width: 45, align: 'right' });

      currentY += 45;
      doc.moveTo(50, currentY - 5).lineTo(545, currentY - 5).lineWidth(0.2).stroke(THEME.BORDER_LIGHT);
    });

    // BOTTOM SECTION
    currentY += 10;
    
    // Tax Summary
    doc.fillColor(THEME.GOLD).fontSize(8).font('Helvetica-Bold').text('GST SUMMARY', 50, currentY, { characterSpacing: 2 });
    currentY += 15;
    doc.rect(50, currentY, 250, 70).fill(THEME.WHITE).stroke(THEME.BORDER_LIGHT);
    doc.fillColor(THEME.TEXT_DARK).fontSize(8).font('Helvetica-Bold').text('HSN/SAC', 60, currentY + 10);
    doc.text('TAXABLE', 120, currentY + 10);
    doc.text('CGST', 170, currentY + 10);
    doc.text('SGST', 210, currentY + 10);
    doc.text('IGST', 250, currentY + 10);
    
    doc.font('Helvetica').fontSize(8).text('7117', 60, currentY + 25);
    doc.text(totalTaxable.toFixed(2), 115, currentY + 25);
    if (isLocal) {
      doc.text((totalTaxAmt/2).toFixed(2), 170, currentY + 25);
      doc.text((totalTaxAmt/2).toFixed(2), 210, currentY + 25);
      doc.text('0.00', 250, currentY + 25);
    } else {
      doc.text('0.00', 170, currentY + 25);
      doc.text('0.00', 210, currentY + 25);
      doc.text(totalTaxAmt.toFixed(2), 250, currentY + 25);
    }

    // TOTALS BLOCK
    const totalsX = 320;
    const totalsY = currentY;
    doc.rect(totalsX, totalsY, 225, 110).fill(THEME.NAVY);
    
    const renderTotalRow = (label, value, y, isGrand = false) => {
      doc.fillColor(isGrand ? THEME.GOLD_LIGHT : 'rgba(255,255,255,0.55)').fontSize(isGrand ? 12 : 9).font(isGrand ? 'Helvetica-Bold' : 'Helvetica').text(label, totalsX + 15, y);
      doc.fillColor(isGrand ? THEME.GOLD : THEME.WHITE).fontSize(isGrand ? 16 : 10).text(value, totalsX + 120, y, { width: 90, align: 'right' });
    };

    renderTotalRow('Subtotal (Taxable)', `₹${totalTaxable.toFixed(2)}`, totalsY + 15);
    renderTotalRow(isLocal ? 'CGST (9%)' : 'IGST (18%)', `₹${isLocal ? (totalTaxAmt/2).toFixed(2) : totalTaxAmt.toFixed(2)}`, totalsY + 32);
    if (isLocal) renderTotalRow('SGST (9%)', `₹${(totalTaxAmt/2).toFixed(2)}`, totalsY + 49);
    
    doc.moveTo(totalsX + 15, totalsY + 75).lineTo(totalsX + 210, totalsY + 75).lineWidth(1).stroke(THEME.GOLD);
    renderTotalRow('GRAND TOTAL', `₹${order.amount.toFixed(2)}`, totalsY + 85, true);

    // AMOUNT IN WORDS
    currentY += 120;
    doc.rect(50, currentY, 495, 40).fill(THEME.GOLD_PALE);
    doc.fillColor(THEME.GOLD).fontSize(7).font('Helvetica-Bold').text('AMOUNT IN WORDS', 60, currentY + 10, { characterSpacing: 1 });
    const words = toWords(order.amount).toUpperCase() + ' RUPEES ONLY';
    doc.fillColor(THEME.NAVY).fontSize(10).text(words, 60, currentY + 20);

    // FOOTER
    doc.rect(0, 780, 595.28, 62).fill(THEME.NAVY);
    doc.fillColor('rgba(255,255,255,0.35)').fontSize(7).text(`This is a legally valid GST Tax Invoice under Section 31 of the CGST Act, 2017. GSTIN: ${seller.gstin}. All prices are inclusive of applicable taxes as stated above.`, 40, 800, { width: 350, lineGap: 2 });
    
    doc.fillColor(THEME.GOLD_LIGHT).fontSize(10).font('Helvetica-Bold').text(seller.name, 400, 810, { align: 'right', width: 155 });
    doc.fillColor('rgba(255,255,255,0.35)').fontSize(7).text('Authorised Signatory', 400, 822, { align: 'right', width: 155 });

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
        <div class="status-badge">Order Confirmed</div>
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
        <p style="margin: 0; font-size: 12px; color: #777;">We've attached your official <b>Navy & Gold GST Tax Invoice</b> to this email. Our artisans are now preparing your selection.</p>
      </div>
      
      <div style="text-align: center; margin-top: 40px;">
        <a href="${process.env.FRONTEND_URL || 'https://satvastones.in'}/account" class="button">TRACK MY ORDER</a>
      </div>
    `, "Order Confirmed - Your Satvastones Vibe is Secured");
  },

  statusUpdate: (order, status, trackingId) => {
    return baseTemplate(`
      <div style="text-align: center; margin-bottom: 40px;">
        <div class="status-badge">${status}</div>
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
