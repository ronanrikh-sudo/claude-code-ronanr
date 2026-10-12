// All names, part codes, prices and references below are fictional.

export const FOLIO = "CM-00XXXX";

export const SUPPLIERS = [
  "Northline Electrical", "Apex Controls", "Coastal Cable Co", "Summit Lighting",
  "Brolga Switchgear", "Redgum Conduit", "Wattle Bay Electrical", "Larkspur Lighting",
  "Corella Controls", "Tamarind Cable", "Quoll Industrial", "Pelican Power Parts",
  "Kestrel Automation", "Ironleaf Fittings", "Bluestone Electrical", "Marlin Cabling",
  "Harbourline Supply", "Galah Switch & Co", "Tidewater Lighting", "Saltbush Electrical",
];

export const SUBJECTS = [
  "RE: RFQ 53082 – Customer Reprice",
  "RE: RFQ 53117 – pricing attached",
  "RE: RFQ 53140 – see below",
  "RE: RE: RFQ 53082",
  "RE: RFQ 53161 – quote",
  "FW: RFQ 53117 – updated",
];

export const ATTACHMENTS = [
  { label: "quote.pdf", kind: "pdf" },
  { label: "rfq.xlsx", kind: "sheet" },
  { label: "prices in email body", kind: "mail" },
  { label: "Quote_v2_FINAL.pdf", kind: "pdf" },
  { label: "pricing (2).xlsx", kind: "sheet" },
  { label: "scan_0412.pdf", kind: "pdf" },
  { label: "see prices below", kind: "mail" },
  { label: "RFQ_reply.xlsx", kind: "sheet" },
] as const;

export const MATCHES = [
  { supplier: "Northline Electrical", ref: "53082" },
  { supplier: "Apex Controls", ref: "53117" },
  { supplier: "Coastal Cable Co", ref: "53140" },
];

export const SHEET_COLUMNS = [
  { key: "code", label: "Part code", w: 210, input: false },
  { key: "desc", label: "Description", w: 330, input: false },
  { key: "cost", label: "Cost (ex GST)", w: 190, input: true },
  { key: "uom", label: "UOM", w: 110, input: true },
  { key: "quote", label: "Quote ID", w: 180, input: true },
  { key: "expiry", label: "Expiry", w: 180, input: true },
  { key: "lead", label: "Lead time", w: 160, input: true },
] as const;

export const SHEET_ROWS: Record<(typeof SHEET_COLUMNS)[number]["key"], string>[] = [
  { code: "NL-CT300-3", desc: "Cable tray 300 mm, 3 m", cost: "48.20", uom: "EA", quote: "NQ-24117", expiry: "15/11/2026", lead: "5 days" },
  { code: "NL-CND25-4", desc: "Rigid conduit 25 mm, 4 m", cost: "6.85", uom: "EA", quote: "NQ-24117", expiry: "15/11/2026", lead: "3 days" },
  { code: "NL-TPS25-100", desc: "TPS cable 2.5 mm², 100 m", cost: "189.00", uom: "ROLL", quote: "NQ-24117", expiry: "15/11/2026", lead: "7 days" },
  { code: "NL-SW2G-WH", desc: "Switch 2-gang, white", cost: "9.40", uom: "EA", quote: "NQ-24117", expiry: "15/11/2026", lead: "2 days" },
  { code: "NL-JB66-S", desc: "Junction box IP66, small", cost: "14.75", uom: "EA", quote: "NQ-24117", expiry: "15/11/2026", lead: "10 days" },
];

export const CHECKS = [
  { label: "Expiry is a real date", col: "expiry" },
  { label: "UOM from approved list", col: "uom" },
  { label: "Numbers, not text", col: "cost" },
  { label: "No stray sheets", col: "tabs" },
] as const;

export const REPORT_ROWS = [
  { status: "ok", supplier: "Apex Controls", note: "All clear" },
  { status: "warn", supplier: "Northline Electrical", note: "Substitute part quoted, confirm" },
  { status: "warn", supplier: "Coastal Cable Co", note: "Price down 78%, check" },
  { status: "bad", supplier: "Summit Lighting", note: "Template missing" },
] as const;
