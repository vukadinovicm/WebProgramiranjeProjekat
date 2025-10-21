export function formatRSD(value = 0) {
  try {
    return new Intl.NumberFormat("sr-RS", { style: "currency", currency: "RSD", maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${Math.round(value)} RSD`;
  }
}