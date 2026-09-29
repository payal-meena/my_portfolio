const BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

// Uploaded files are saved as "/api/files/..." so add the server address in front
export const assetUrl = (u) => (u && u.startsWith("/") ? BASE + u : u || "");

export async function api(path, { method = "GET", body, form } = {}) {
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: form || (body ? JSON.stringify(body) : undefined),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token) {
    localStorage.removeItem("token");
    location.reload();
  }
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}
