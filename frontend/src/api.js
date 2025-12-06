export const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function verifyExternalTx(externalTx) {
  const res = await fetch(`${BASE_URL}/api/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ externalTx }),
  });

  if (!res.ok) {
    throw new Error("Backend request failed");
  }

  return await res.json();
}
