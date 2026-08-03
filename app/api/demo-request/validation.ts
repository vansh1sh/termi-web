export type DemoRequest = {
  email: string;
  phone: string;
  details: string;
};

export type DemoRequestValidation =
  | { ok: true; value: DemoRequest }
  | { ok: false; error: string; spam?: boolean };

const EMAIL_MAX = 254;
const PHONE_MAX = 40;
const DETAILS_MAX = 2000;

function field(input: Record<string, unknown>, key: string): string {
  return typeof input[key] === "string" ? input[key].trim() : "";
}

export function validateDemoRequest(input: unknown): DemoRequestValidation {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const record = input as Record<string, unknown>;
  if (field(record, "companyWebsite")) {
    return { ok: false, spam: true, error: "Unable to submit this request." };
  }

  const email = field(record, "email").toLowerCase();
  const phone = field(record, "phone");
  const details = field(record, "details");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || email.length > EMAIL_MAX || !emailPattern.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (phone.length > PHONE_MAX) {
    return { ok: false, error: `Phone number must be ${PHONE_MAX} characters or fewer.` };
  }
  if (details.length > DETAILS_MAX) {
    return { ok: false, error: `Details must be ${DETAILS_MAX.toLocaleString()} characters or fewer.` };
  }

  return { ok: true, value: { email, phone, details } };
}
