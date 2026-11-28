// The confirmed Rival Gym order (Nov 2026). Single source of truth for the invoice and the catalogue,
// so a size change only has to be made once.
export const ORDER_NO = 'CC2026032';
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
export const MAJOR = new Set(['M', 'L', 'XL']); // Rival asked for mostly M, L and XL
export const ORDER = {
  rashguard: { qty: 51, sizes: [3, 4, 11, 13, 12, 6, 2] },
  shorts: { qty: 51, sizes: [3, 4, 11, 13, 12, 6, 2] },
  tee: { qty: 100, sizes: [4, 12, 21, 22, 21, 13, 7] },
};
for (const [k, o] of Object.entries(ORDER)) {
  const n = o.sizes.reduce((a, b) => a + b, 0);
  if (n !== o.qty) throw new Error(`${k}: sizes add to ${n}, qty is ${o.qty}`);
}
