export async function getSession() {
  const res = await fetch("/api/auth/session");
  if (!res.ok) return null;
  return res.json();
}

export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
}
