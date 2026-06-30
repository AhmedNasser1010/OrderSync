// Mock user credentials for development/demo
export const MOCK_USERS = [
  {
    id: "1",
    email: "admin@restaurant.com",
    password: "admin123",
    name: "Admin User",
  },
  {
    id: "2",
    email: "user@restaurant.com",
    password: "user123",
    name: "Regular User",
  },
];

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthSession {
  user: User;
  token: string;
  createdAt: number;
}

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password (minimum 6 characters)
export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

// Check if email already exists in mock users
export const emailExists = (email: string): boolean => {
  return MOCK_USERS.some(
    (user) => user.email.toLowerCase() === email.toLowerCase(),
  );
};

// Find user by email and password
export const authenticateUser = (
  email: string,
  password: string,
): User | null => {
  const user = MOCK_USERS.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  );
  return user ? { id: user.id, email: user.email, name: user.name } : null;
};

// Generate mock session token
export const generateToken = (): string => {
  return "mock_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
};

// Store session in localStorage
export const saveSession = (session: AuthSession): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_session", JSON.stringify(session));
  }
};

// Get session from localStorage
export const getSession = (): AuthSession | null => {
  if (typeof window === "undefined") return null;
  const sessionStr = localStorage.getItem("auth_session");
  if (!sessionStr) return null;
  try {
    return JSON.parse(sessionStr);
  } catch {
    return null;
  }
};

// Clear session from localStorage
export const clearSession = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_session");
  }
};
