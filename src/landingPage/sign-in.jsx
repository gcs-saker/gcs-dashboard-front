import React, { useState, useEffect } from "react";
import "../Login.scss";
import { useNavigate } from "react-router-dom";
import { storeAuthSession } from "../features/auth/authStorage";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = form.username || "operator01";
    storeAuthSession({
      accessToken: "mock-access-token",
      expiresAt: new Date(Date.now() + 240 * 60_000).toISOString(),
      user: { username, role: "operator" },
    });
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
        <div className="input-group">
        <span className="icon">👤</span>
        <input
        type="text"
        name="username"
        placeholder="아이디"
        value={form.username}
        onChange={handleChange}
        required
        />
        {form.username && <span className="status success">✔</span>}
        </div>

        <div className="input-group">
        <span className="icon">🔑</span>
        <input
            type="password"
            name="password"
            placeholder="패스워드"
            value={form.password}
            onChange={handleChange}
            required
        />
        {form.password && <span className="status success">✔</span>}
        </div>

        <button type="submit" className="btn-continue">
        접속하기
        </button>
    </form>
  );
}
