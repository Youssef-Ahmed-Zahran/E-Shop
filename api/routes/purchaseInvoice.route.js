import express from "express";
import {
  createPurchaseInvoice,
  getAllPurchaseInvoices,
  getPurchaseInvoiceById,
  getInvoicesBySupplier,
  deletePurchaseInvoice,
  cancelPurchaseInvoice,
  validateProductsForInvoice,
} from "../controllers/purchaseInvoice.controller.js";
import { verifyTokenAndAdmin } from "../middlewares/verifyToken.middleware.js";

const router = express.Router();

// All routes require admin access
router.use(verifyTokenAndAdmin);

// Validate products before creating invoice
router.post("/validate-products", validateProductsForInvoice);

// Create purchase invoice
router.post("/", createPurchaseInvoice);

// Get all purchase invoices
router.get("/", getAllPurchaseInvoices);

// Get invoices by supplier
router.get("/supplier/:supplierId", getInvoicesBySupplier);

// Get single purchase invoice
router.get("/:id", getPurchaseInvoiceById);

// Cancel purchase invoice (restores stock)
router.patch("/:id/cancel", cancelPurchaseInvoice);

// Delete purchase invoice (does NOT restore stock)
router.delete("/:id", deletePurchaseInvoice);

export default router;
