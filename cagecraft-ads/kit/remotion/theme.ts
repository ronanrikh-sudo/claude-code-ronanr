// CAGECRAFT brand tokens for Remotion ads (mirror of kit/brand.css).
export const CC = {
  black: "#050506", ink: "#0E0F11", graphite: "#1B1D21", steel: "#6E737C", silver: "#A7ABB3", bone: "#F2F3F5", white: "#FFFFFF",
  teal: "#16B3B7", tealSoft: "#8EDFDF", pink: "#F09EC0", pinkSoft: "#F8CFE0", concrete: "#B4B1AB", navy: "#1E2F5C", studio: "#C9C9C9",
  display: "'Archivo Variable', 'Inter Tight', system-ui, sans-serif",
  body: "'Inter Tight', 'Inter', system-ui, sans-serif",
  condensed: "'Barlow Condensed', 'Anton', sans-serif",
  url: "cagecraftco.com",
};
// the wordmark voice: extended heavy italic caps
export const displayStyle = { fontFamily: CC.display, fontWeight: 900, fontStretch: "125%", fontStyle: "italic", letterSpacing: "-0.01em", lineHeight: 0.92, textTransform: "uppercase" } as const;
