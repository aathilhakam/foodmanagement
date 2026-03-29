import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UtensilsCrossed, AlertCircle, Building2 } from "lucide-react";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    const success = login(email, password);
    if (success) {
      if (email === "admin@sliit.lk") navigate("/admin");
      else if (email.endsWith("@sliit.lk") && email !== "student@sliit.lk") navigate("/dashboard");
      else navigate("/");
    } else {
      setError("Invalid credentials.");
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-[80vh] items-center justify-center px-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm animate-fade-in", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8 text-center", children: [
      /* @__PURE__ */ jsx(UtensilsCrossed, { className: "mx-auto mb-3 h-10 w-10 text-primary" }),
      /* @__PURE__ */ jsx("h1", { className: "font-display text-2xl font-bold", children: "Welcome Back" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Sign in to SLIIT Eats" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      error && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "mt-0.5 h-4 w-4 shrink-0" }),
        " ",
        error
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsx(Input, { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@sliit.lk", className: "mt-1 bg-card/40" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
        /* @__PURE__ */ jsx(Input, { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "mt-1 bg-card/40" })
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "hero", className: "w-full", type: "submit", children: "Sign In" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 rounded-lg border border-border/50 bg-card/40 p-3 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsx("p", { className: "mb-1 font-medium text-foreground", children: "Demo Accounts:" }),
      /* @__PURE__ */ jsx("p", { children: "P&S Canteen: pscanteen@sliit.lk / PNS123456" }),
      /* @__PURE__ */ jsx("p", { children: "Annona Canteen: annonacanteen@sliit.lk / ANN123456" }),
      /* @__PURE__ */ jsx("p", { children: "New Building Canteen: newbuildingcanteen@sliit.lk / NEW123456" }),
      /* @__PURE__ */ jsx("p", { children: "Juice Bar: juicebar@sliit.lk / JUI123456" }),
      /* @__PURE__ */ jsx("p", { children: "E-Faculty Canteen: efacultycanteen@sliit.lk / EFA123456" }),
      /* @__PURE__ */ jsx("p", { children: "Student: student@sliit.lk / STD123456" }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 pt-3 border-t border-border/50", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Canteen Management?" }),
        /* @__PURE__ */ jsx("button", { onClick: () => navigate("/canteen-admin/login"), className: "flex items-center gap-1 text-xs text-primary hover:underline", children: [
          /* @__PURE__ */ jsx(Building2, { className: "h-3 w-3" }),
          " Admin Login"
        ] })
      ] }) })
    ] })
  ] }) });
};
var stdin_default = Login;
export {
  stdin_default as default
};
