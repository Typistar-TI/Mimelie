import { apiRequest } from "../../client";

export type WhatsAppValidation = { ok: boolean; message?: string };
export const validateWhatsApp = () =>
  apiRequest<WhatsAppValidation>("/admin/integrations/whatsapp/validate", {
    method: "POST",
  });
