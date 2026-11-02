import { API_BASE_URL } from "./apiConfig.js";

const USER_SESSION_KEY = "onlium_current_user";
const TOKEN_KEY = "onlium_token";

function clearLegacySession() {
  localStorage.removeItem(USER_SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("onlium_admin");
}

function migrateLegacySession() {
  if (sessionStorage.getItem(USER_SESSION_KEY) && sessionStorage.getItem(TOKEN_KEY)) {
    clearLegacySession();
    return;
  }

  const legacyUser = localStorage.getItem(USER_SESSION_KEY);
  const legacyToken = localStorage.getItem(TOKEN_KEY);
  if (!legacyUser && !legacyToken) return;

  try {
    const user = legacyUser ? JSON.parse(legacyUser) : null;
    const token = legacyToken || user?.token;
    if (user && token) {
      user.token = token;
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  } catch (error) {
    console.error("Unable to migrate the previous sign-in session.", error);
  } finally {
    clearLegacySession();
  }
}

export const authService = {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();
    return data;
  },

  async register(firstName, lastName, email, password) {
    const response = await fetch(`${API_BASE_URL}/Auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
        fullName: `${firstName} ${lastName}`,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Registration failed");
    }

    return await response.json();
  },

  async forgotPassword(email) {
    const response = await fetch(`${API_BASE_URL}/Auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to send reset code");
    }

    return await response.json();
  },

  async resetPassword(email, resetCode, newPassword) {
    const response = await fetch(`${API_BASE_URL}/Auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        email,
        resetCode,
        newPassword,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to reset password");
    }

    return await response.json();
  },

  getAuthHeaders() {
    const token = this.getToken();
    return token
      ? {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        }
      : {
          "Content-Type": "application/json",
          Accept: "application/json",
        };
  },

  saveToken(token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  },

  getToken() {
    migrateLegacySession();
    return sessionStorage.getItem(TOKEN_KEY);
  },

  isTokenExpired(token = this.getToken()) {
    if (!token) return true;

    try {
      const payload = token.split(".")[1];
      if (!payload) return true;
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")));
      return typeof decoded.exp !== "number" || decoded.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  },

  saveUserSession(userData) {
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(userData));
    if (userData.token) {
      this.saveToken(userData.token);
    }
    clearLegacySession();
  },

  getUserSession() {
    migrateLegacySession();
    const user = sessionStorage.getItem(USER_SESSION_KEY);
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch (error) {
      console.error("Unable to read the current sign-in session.", error);
      this.clearUserSession();
      return null;
    }
  },

  updateUserSession(updates) {
    const user = this.getUserSession();
    if (user) {
      this.saveUserSession({ ...user, ...updates });
    }
  },

  clearUserSession() {
    sessionStorage.removeItem(USER_SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    clearLegacySession();
  },

  isAuthenticated() {
    const user = this.getUserSession();
    const token = this.getToken();
    if (!user || !token || user.token !== token) return false;
    if (this.isTokenExpired(token)) {
      this.clearUserSession();
      return false;
    }
    return true;
  },

  isAdmin() {
    const user = this.getUserSession();
    return this.isAuthenticated() &&
      user?.role === "Admin" &&
      user.token === this.getToken();
  }
};
