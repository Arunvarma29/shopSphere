// Vite embeds VITE_ variables at build time. Configure this in Vercel and redeploy.
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

if (import.meta.env.PROD && !configuredApiUrl) {
  console.error(
    "VITE_API_URL is missing. Set it in Vercel and redeploy the frontend.",
  );
}

export const API_URL = (
  configuredApiUrl || "http://localhost:5000/api"
).replace(/\/$/, "");
export const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
export const getErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again.",
) => error?.response?.data?.message || error?.message || fallback;
