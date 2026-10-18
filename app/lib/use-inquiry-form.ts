"use client";

import { useCallback, useState } from "react";
import { validateInquiry } from "./inquiry";

export type InquiryStatus = "idle" | "submitting" | "success" | "error";

type InquiryFields = {
  name: string;
  email: string;
  message: string;
  /** Honeypot field; stays empty for people. */
  company: string;
};

const EMPTY: InquiryFields = { name: "", email: "", message: "", company: "" };

/** Contact-form state and submission, shared by the canvas and scroll layouts. */
export function useInquiryForm() {
  const [values, setValues] = useState<InquiryFields>(EMPTY);
  const [status, setStatus] = useState<InquiryStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const setField = (field: keyof InquiryFields, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (status === "error" || status === "success") {
      setStatus("idle");
      setError(null);
    }
  };

  const submit = async () => {
    if (status === "submitting") return;
    const payload = {
      name: values.name,
      email: values.email,
      description: values.message,
      company: values.company,
    };
    const check = validateInquiry(payload);
    if (!check.ok) {
      setStatus("error");
      setError(check.error);
      return;
    }

    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Something went wrong. Please email me directly.");
        return;
      }
      setValues(EMPTY);
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Couldn't send your message. Check your connection, or email me directly.");
    }
  };

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return { values, setField, status, error, submit, reset };
}
