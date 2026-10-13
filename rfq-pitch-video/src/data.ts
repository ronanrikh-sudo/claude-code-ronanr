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

export const PREVIEWS = [
  "Hi team, please find our pricing attached…",
  "Prices below, valid 30 days. Lead time…",
  "See attached quote. Note substitute on line 3…",
  "Apologies for the delay, updated pricing…",
  "Pricing per your request, UOM per metre…",
  "Quote attached. Please confirm quantities…",
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

// Excel template columns. Letters drive the column header row.
export const SHEET_COLUMNS = [
  { key: "code", letter: "A", label: "Part code", w: 200, input: false },
  { key: "desc", letter: "B", label: "Description", w: 300, input: false },
  { key: "cost", letter: "C", label: "Cost (ex GST)", w: 170, input: true },
  { key: "uom", letter: "D", label: "UOM", w: 100, input: true },
  { key: "quote", letter: "E", label: "Quote ID", w: 160, input: true },
  { key: "expiry", letter: "F", label: "Expiry", w: 160, input: true },
  { key: "lead", letter: "G", label: "Lead time", w: 140, input: true },
  { key: "flag", letter: "H", label: "Flags", w: 170, input: false },
] as const;

export type SheetKey = (typeof SHEET_COLUMNS)[number]["key"];

export const SHEET_ROWS: Record<Exclude<SheetKey, "flag">, string>[] = [
  { code: "NL-CT300-3", desc: "Cable tray 300 mm, 3 m", cost: "48.20", uom: "EA", quote: "NQ-24117", expiry: "15/11/2026", lead: "5 days" },
  { code: "NL-CND25-4", desc: "Rigid conduit 25 mm, 4 m", cost: "6.85", uom: "EA", quote: "NQ-24117", expiry: "15/11/2026", lead: "3 days" },
  { code: "NL-TPS25-100", desc: "TPS cable 2.5 mm², 100 m", cost: "189.00", uom: "ROLL", quote: "NQ-24117", expiry: "15/11/2026", lead: "7 days" },
  { code: "NL-SW2G-WH", desc: "Switch 2-gang, white", cost: "9.40", uom: "EA", quote: "NQ-24117", expiry: "15/11/2026", lead: "2 days" },
  { code: "NL-JB66-S", desc: "Junction box IP66, small", cost: "", uom: "EA", quote: "NQ-24117", expiry: "15/11/2026", lead: "10 days" },
];

// Flags written into column H in the "flags any notes or errors" beat.
export const SHEET_FLAGS = [
  { row: 0, kind: "ok", label: "OK" },
  { row: 1, kind: "ok", label: "OK" },
  { row: 2, kind: "note", label: "Note", comment: "Supplier note: 100 m rolls only" },
  { row: 3, kind: "ok", label: "OK" },
  { row: 4, kind: "error", label: "Error", comment: "No price quoted for this line" },
] as const;

export const CHECKS = [
  { label: "UOM from approved list", col: "uom" },
  { label: "Dates and prices formatted", col: "cost" },
  { label: "No stray sheets", col: "tabs" },
  { label: "Matches CM import layout", col: "all" },
] as const;

export const REPORT_ROWS = [
  { status: "ok", supplier: "Apex Controls", note: "All clear" },
  { status: "warn", supplier: "Northline Electrical", note: "Line 5 has no price, confirm" },
  { status: "warn", supplier: "Coastal Cable Co", note: "Price down 78%, check" },
  { status: "bad", supplier: "Summit Lighting", note: "Template missing" },
] as const;
