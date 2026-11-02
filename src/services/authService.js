import { API_BASE_URL } from "./apiConfig.js";

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
    localStorage.setItem("onlium_token", token);
  },

  getToken() {
    return localStorage.getItem("onlium_token");
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
    localStorage.setItem("onlium_current_user", JSON.stringify(userData));
    localStorage.removeItem("onlium_admin");
    if (userData.token) {
      this.saveToken(userData.token);
    }
  },

  getUserSession() {
    const user = localStorage.getItem("onlium_current_user");
    return user ? JSON.parse(user) : null;
  },

  clearUserSession() {
    localStorage.removeItem("onlium_current_user");
    localStorage.removeItem("onlium_token");
    localStorage.removeItem("onlium_admin");
  },

  isAuthenticated() {
    const user = this.getUserSession();
    const token = this.getToken();
    if (!user || !token) return false;
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
