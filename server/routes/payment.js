import express from "express";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  downloadInvoice,
} from "../controller/payment.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Create Razorpay Order
router.post("/razorpay-order", auth, createRazorpayOrder);

// Verify Razorpay Payment Signature
router.post("/razorpay-verify", auth, verifyRazorpaySignature);

// Download Invoice PDF
router.get("/invoice/:invoiceId", auth, downloadInvoice);

export default router;
