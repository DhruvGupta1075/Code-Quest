import Razorpay from "razorpay";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import User from "../models/auth.js";

// Initialize Razorpay if keys are present
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const razorpay =
  razorpayKeyId && razorpayKeySecret
    ? new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      })
    : null;

// Pricing configurations
const PLANS = {
  Bronze: { price: 99, name: "Bronze Plan" },
  Silver: { price: 299, name: "Silver Plan" },
  Gold: { price: 999, name: "Gold Plan" },
};

// Generate Invoice PDF
const generateInvoicePDF = (user, payment, billingDetails, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // Logo/Header
      doc
        .fillColor("#ef8236")
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("STACK OVERFLOW CLONE", 50, 50);
      doc
        .fillColor("#454545")
        .fontSize(10)
        .font("Helvetica")
        .text("Premium Membership Subscription Invoice (Razorpay)", 50, 80);

      // Invoice info
      doc.fillColor("#333333").fontSize(10);
      doc.text(`Invoice ID: ${payment.invoiceId}`, 380, 50);
      doc.text(`Date: ${new Date(payment.date).toLocaleDateString()}`, 380, 65);
      doc.text(`Status: PAID`, 380, 80);

      doc
        .strokeColor("#cccccc")
        .lineWidth(1)
        .moveTo(50, 105)
        .lineTo(550, 105)
        .stroke();

      // Billed To / Company info
      doc
        .fontSize(11)
        .fillColor("#ef8236")
        .font("Helvetica-Bold")
        .text("Billed To:", 50, 120);
      doc.fontSize(10).fillColor("#333333").font("Helvetica");
      doc.text(`Name: ${billingDetails.name || user.name}`, 50, 140);
      doc.text(`Email: ${billingDetails.email || user.email}`, 50, 155);
      if (billingDetails.phone)
        doc.text(`Phone: ${billingDetails.phone}`, 50, 170);
      if (billingDetails.address)
        doc.text(`Address: ${billingDetails.address}`, 50, 185);

      doc
        .fontSize(11)
        .fillColor("#ef8236")
        .font("Helvetica-Bold")
        .text("Seller Details:", 320, 120);
      doc.fontSize(10).fillColor("#333333").font("Helvetica");
      doc.text("Stack Overflow Clone Private Limited", 320, 140);
      doc.text("456 Hacker Way, Silicon Valley", 320, 155);
      doc.text("Karnataka, India", 320, 170);
      doc.text("billing@stackoverflowclone.com", 320, 185);

      doc
        .strokeColor("#cccccc")
        .lineWidth(1)
        .moveTo(50, 215)
        .lineTo(550, 215)
        .stroke();

      // Table
      const tableTop = 235;
      doc.fontSize(10).font("Helvetica-Bold");
      doc.text("Item / Description", 60, tableTop);
      doc.text("Duration", 260, tableTop);
      doc.text("Qty", 360, tableTop);
      doc.text("Amount", 450, tableTop);

      doc
        .strokeColor("#cccccc")
        .lineWidth(1)
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      doc.font("Helvetica");
      const itemY = tableTop + 25;
      doc.text(`Premium Membership - ${payment.plan} Plan`, 60, itemY);
      doc.text("1 Month", 260, itemY);
      doc.text("1", 360, itemY);
      doc.text(`INR ${payment.amount}.00`, 450, itemY);

      doc
        .strokeColor("#cccccc")
        .lineWidth(1)
        .moveTo(50, itemY + 15)
        .lineTo(550, itemY + 15)
        .stroke();

      // Total
      doc.fontSize(11).font("Helvetica-Bold");
      doc.text("Total Paid:", 300, itemY + 40);
      doc.text(`INR ${payment.amount}.00`, 450, itemY + 40);

      // Notes
      doc.fontSize(8).fillColor("#888888").font("Helvetica-Oblique");
      doc.text(
        "Thank you for choosing StackOverflow Premium! This is a system-generated invoice.",
        50,
        480,
        {
          align: "center",
          width: 500,
        },
      );

      doc.end();

      writeStream.on("finish", () => resolve());
      writeStream.on("error", (err) => reject(err));
    } catch (e) {
      reject(e);
    }
  });
};

// Send Confirmation Email
const sendConfirmationEmail = async (
  user,
  payment,
  billingDetails,
  pdfPath,
) => {
  const mailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="text-align: center; border-bottom: 2px solid #ef8236; padding-bottom: 15px;">
        <h2 style="color: #ef8236; margin: 0;">StackOverflow Clone Premium</h2>
        <p style="color: #666; margin: 5px 0 0 0;">Subscription Confirmed!</p>
      </div>
      
      <div style="padding: 20px 0;">
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Thank you for upgrading! Your subscription to the <strong>${payment.plan} Plan</strong> has been successfully activated via Razorpay.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Plan</td>
            <td style="padding: 10px; border: 1px solid #eee;">${payment.plan}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Amount Paid</td>
            <td style="padding: 10px; border: 1px solid #eee;">INR ${payment.amount}.00</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Invoice ID</td>
            <td style="padding: 10px; border: 1px solid #eee;">${payment.invoiceId}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Renewal Date</td>
            <td style="padding: 10px; border: 1px solid #eee;">${new Date(user.renewalDate).toLocaleDateString()}</td>
          </tr>
        </table>
        
        <p>Your premium features are now unlocked. You can view your invoice and download it anytime from your profile dashboard.</p>
        <p>A copy of your PDF invoice is attached to this email.</p>
      </div>
      
      <div style="text-align: center; border-top: 1px solid #eee; padding-top: 15px; font-size: 12px; color: #888;">
        <p>If you have any questions, reply to this email or contact support.</p>
        <p>&copy; 2026 StackOverflow Clone Inc.</p>
      </div>
    </div>
  `;

  // Always write HTML copy of email locally for verification
  const emailsDir = path.join(process.cwd(), "sent_emails");
  if (!fs.existsSync(emailsDir)) {
    fs.mkdirSync(emailsDir, { recursive: true });
  }
  const emailLogPath = path.join(emailsDir, `email-${payment.invoiceId}.html`);
  fs.writeFileSync(emailLogPath, mailHtml);
  console.log(`[Email Mock] Sent email preview written to: ${emailLogPath}`);

  // Transporter config - fallback to ethereal email
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "mock_smtp_user",
      pass: process.env.SMTP_PASS || "mock_smtp_pass",
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"StackOverflow Clone Support" <billing@stackoverflowclone.com>',
      to: billingDetails.email || user.email,
      subject: `[StackOverflow Clone] Subscription Activated - ${payment.plan} Plan`,
      html: mailHtml,
      attachments: [
        {
          filename: `Invoice-${payment.invoiceId}.pdf`,
          path: pdfPath,
        },
      ],
    });
    console.log(
      `[Email Transporter] Mail sent successfully: ${info.messageId}`,
    );
    return info;
  } catch (error) {
    console.warn(
      "[Email WARNING] SMTP delivery failed. Using saved local file preview instead. Error detail:",
      error.message,
    );
    return null;
  }
};

// Create Razorpay Order
export const createRazorpayOrder = async (req, res) => {
  const { planName, billingDetails } = req.body;

  if (!PLANS[planName]) {
    return res.status(400).json({ message: "Invalid plan selected" });
  }

  try {
    const activeUser = await User.findById(req.userid);
    if (!activeUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const priceDetails = PLANS[planName];
    const isRazorpayActive =
      razorpay &&
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET;

    if (isRazorpayActive) {
      const options = {
        amount: priceDetails.price * 100, // in paise
        currency: "INR",
        receipt: `receipt_order_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
        notes: {
          userId: req.userid,
          planName: planName,
          billingDetails: JSON.stringify(billingDetails || {}),
        },
      };

      const order = await razorpay.orders.create(options);
      return res.status(200).json({
        order,
        keyId: process.env.RAZORPAY_KEY_ID,
        planName,
        billingDetails,
      });
    } else {
      // Offline/Mock mode
      const mockOrderId = `order_mock_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      return res.status(200).json({
        mock: true,
        order: {
          id: mockOrderId,
          amount: priceDetails.price * 100,
          currency: "INR",
        },
        planName,
        billingDetails,
      });
    }
  } catch (error) {
    console.error("Error in createRazorpayOrder:", error);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};

// Verify Razorpay Payment Signature
export const verifyRazorpaySignature = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    planName,
    billingDetails,
    mock,
  } = req.body;

  try {
    const activeUser = await User.findById(req.userid);
    if (!activeUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if subscription for this payment has already been activated to prevent duplicates
    const alreadyProcessed = activeUser.paymentHistory.some(
      (p) =>
        p.paymentId === razorpay_payment_id ||
        p.paymentId === razorpay_order_id,
    );
    if (alreadyProcessed) {
      return res
        .status(200)
        .json({ data: activeUser, message: "Subscription already activated" });
    }

    const isRazorpayActive =
      razorpay &&
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET;

    if (mock !== true && isRazorpayActive) {
      // Verify signature using HMAC-SHA256
      const signString = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(signString.toString())
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res
          .status(400)
          .json({
            message: "Signature verification failed! Payment is invalid.",
          });
      }
    } else {
      console.log(
        `[Mock Sandbox Verify] Verifying mock order: ${razorpay_order_id}`,
      );
    }

    const priceDetails = PLANS[planName];
    const paymentAmount = priceDetails?.price || 99;

    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + 30);

    const invoiceId = `INV-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const newPaymentRecord = {
      paymentId: razorpay_payment_id || `MOCK-PAY-${Date.now()}`,
      amount: paymentAmount,
      currency: "INR",
      status: "completed",
      date: new Date(),
      invoiceId: invoiceId,
      plan: planName,
    };

    // Update User Document
    activeUser.plan = planName;
    activeUser.subscriptionStatus = "active";
    activeUser.subscriptionId = razorpay_order_id;
    activeUser.renewalDate = renewalDate;
    activeUser.billingDetails = {
      name: billingDetails?.name || activeUser.name,
      email: billingDetails?.email || activeUser.email,
      phone: billingDetails?.phone || "",
      address: billingDetails?.address || "",
    };
    activeUser.paymentHistory.push(newPaymentRecord);

    await activeUser.save();

    // Ensure local invoices directory exists
    const invoicesDir = path.join(process.cwd(), "invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }
    const invoicePdfPath = path.join(invoicesDir, `${invoiceId}.pdf`);

    // Generate Invoice PDF
    await generateInvoicePDF(
      activeUser,
      newPaymentRecord,
      activeUser.billingDetails,
      invoicePdfPath,
    );

    // Send email with PDF attachment
    await sendConfirmationEmail(
      activeUser,
      newPaymentRecord,
      activeUser.billingDetails,
      invoicePdfPath,
    );

    res
      .status(200)
      .json({
        data: activeUser,
        message: "Subscription activated successfully",
      });
  } catch (error) {
    console.error("Error in verifyRazorpaySignature:", error);
    res.status(500).json({ message: "Failed to verify payment signature" });
  }
};

// Stream downloadable PDF invoice
export const downloadInvoice = async (req, res) => {
  const { invoiceId } = req.params;

  try {
    const activeUser = await User.findById(req.userid);
    if (!activeUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify invoice belongs to the requesting user
    const hasInvoice = activeUser.paymentHistory.some(
      (p) => p.invoiceId === invoiceId,
    );
    if (!hasInvoice) {
      return res
        .status(403)
        .json({ message: "Access Denied: Invoice not found for this user" });
    }

    const invoiceFilePath = path.join(
      process.cwd(),
      "invoices",
      `${invoiceId}.pdf`,
    );

    if (!fs.existsSync(invoiceFilePath)) {
      // Re-generate if invoice file was deleted or missing
      const payment = activeUser.paymentHistory.find(
        (p) => p.invoiceId === invoiceId,
      );
      if (!payment) {
        return res.status(404).json({ message: "Invoice data missing" });
      }
      const invoicesDir = path.join(process.cwd(), "invoices");
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }
      await generateInvoicePDF(
        activeUser,
        payment,
        activeUser.billingDetails || {},
        invoiceFilePath,
      );
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice-${invoiceId}.pdf`,
    );

    const fileStream = fs.createReadStream(invoiceFilePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error in downloadInvoice:", error);
    res.status(500).json({ message: "Failed to download invoice" });
  }
};

