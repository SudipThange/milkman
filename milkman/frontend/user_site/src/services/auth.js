const TOKEN_KEY = "punemilkman_user_token";
const AUTH_EVENT = "punemilkman-auth-changed";

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export async function loginRequest(api, payload) {
  const { data } = await api.post("/user/login/", payload);
  return data;
}

export async function registerRequest(api, payload) {
  const { data } = await api.post("/user/", payload);
  return data;
}

export async function logoutRequest(api) {
  try {
    await api.post("/user/logout/");
  } catch {
    // Ignore backend logout errors and clear local auth state anyway.
  }
}

export function getAuthEventName() {
  return AUTH_EVENT;
}
