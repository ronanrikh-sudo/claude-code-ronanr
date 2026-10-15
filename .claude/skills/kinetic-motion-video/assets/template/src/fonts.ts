// Font loading. Import the @fontsource weights the theme uses (and add the package to
// package.json). Static imports only: Remotion bundles them, so renders never depend on
// system fonts or a font CDN. For brand fonts not on fontsource, put .woff2 files in
// public/fonts and declare @font-face with staticFile() instead.
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/700.css";
// Examples for other directions (install the package first):
// import "@fontsource/instrument-serif/400.css";          // Editorial Light display
// import "@fontsource/fraunces/600.css";                   // Warm Organic display
// import "@fontsource/space-grotesk/700.css";              // Swiss Bold display
// import "@fontsource/cormorant-garamond/500.css";         // Luxury Noir display
