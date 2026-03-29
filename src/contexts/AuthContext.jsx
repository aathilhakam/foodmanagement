import { jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
import { users } from "@/data/mockData";
const AuthContext = createContext(void 0);
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const login = (email, password) => {
    const found = users.find((u) => u.email === email && u.password === password);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };
  const logout = () => setUser(null);
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value: { user, login, logout, isAuthenticated: !!user }, children });
};
const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
export {
  AuthProvider,
  useAuth
};
