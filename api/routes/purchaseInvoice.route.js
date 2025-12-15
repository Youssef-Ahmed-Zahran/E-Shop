import express from "express";
import {
  createPurchaseInvoice,
  getAllPurchaseInvoices,
  getPurchaseInvoiceById,
  getInvoicesBySupplier,
  deletePurchaseInvoice,
} from "../controllers/purchaseInvoice.controller.js";
import { verifyTokenAndAdmin } from "../middlewares/verifyToken.middleware.js";

const router = express.Router();

// All routes require admin access
router.use(verifyTokenAndAdmin);

// Create purchase invoice
router.post("/", createPurchaseInvoice);

// Get all purchase invoices
router.get("/", getAllPurchaseInvoices);

// Get invoices by supplier
router.get("/supplier/:supplierId", getInvoicesBySupplier);

// Get single purchase invoice
router.get("/:id", getPurchaseInvoiceById);

// Delete purchase invoice
router.delete("/:id", deletePurchaseInvoice);

export default router;
