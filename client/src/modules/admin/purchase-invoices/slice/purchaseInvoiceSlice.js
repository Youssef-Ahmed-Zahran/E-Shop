import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

// Query Keys
export const PURCHASE_INVOICES_QUERY_KEY = ["purchaseInvoices"];
export const PURCHASE_INVOICE_QUERY_KEY = ["purchaseInvoice"];
export const SUPPLIER_INVOICES_QUERY_KEY = ["supplierInvoices"];

// *********************************** ((API Functions)) **************************************** //

//Validate products before creating invoice
const validateProductsForInvoice = async (data) => {
  const response = await axiosInstance.post(
    "/purchaseInvoices/validate-products",
    data
  );
  return response.data;
};

const createPurchaseInvoice = async (data) => {
  const response = await axiosInstance.post("/purchaseInvoices", data);
  return response.data;
};

const getAllPurchaseInvoices = async ({ page = 1, limit = 10 }) => {
  const params = new URLSearchParams();
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);

  const response = await axiosInstance.get(
    `/purchaseInvoices?${params.toString()}`
  );
  return response.data;
};

const getPurchaseInvoiceById = async (id) => {
  const response = await axiosInstance.get(`/purchaseInvoices/${id}`);
  return response.data;
};

const getInvoicesBySupplier = async (supplierId) => {
  const response = await axiosInstance.get(
    `/purchaseInvoices/supplier/${supplierId}`
  );
  return response.data;
};

const cancelPurchaseInvoice = async (id) => {
  const response = await axiosInstance.patch(`/purchaseInvoices/${id}/cancel`);
  return response.data;
};

const deletePurchaseInvoice = async (id) => {
  const response = await axiosInstance.delete(`/purchaseInvoices/${id}`);
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

export const useValidateProductsForInvoice = () => {
  return useMutation({
    mutationFn: validateProductsForInvoice,
  });
};

export const useCreatePurchaseInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPurchaseInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SUPPLIER_INVOICES_QUERY_KEY });
      // Also invalidate products since stock is updated
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useGetAllPurchaseInvoices = (filters = {}) => {
  return useQuery({
    queryKey: [...PURCHASE_INVOICES_QUERY_KEY, filters],
    queryFn: () => getAllPurchaseInvoices(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useGetPurchaseInvoiceById = (id) => {
  return useQuery({
    queryKey: [...PURCHASE_INVOICE_QUERY_KEY, id],
    queryFn: () => getPurchaseInvoiceById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useGetInvoicesBySupplier = (supplierId) => {
  return useQuery({
    queryKey: [...SUPPLIER_INVOICES_QUERY_KEY, supplierId],
    queryFn: () => getInvoicesBySupplier(supplierId),
    enabled: !!supplierId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCancelPurchaseInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelPurchaseInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SUPPLIER_INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeletePurchaseInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePurchaseInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SUPPLIER_INVOICES_QUERY_KEY });
    },
  });
};
