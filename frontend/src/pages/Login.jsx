import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const Login = ({ customer, setCustomer }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };
  useEffect(() => {
    if (customer) {
      navigate("/home", { replace: true });
    }
  }, [customer, navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/customers/login", formData);
      if (res.data.success) {
        // Fetch current user details right after successful login
        const profileRes = await API.get("/customers/me");
        setCustomer(profileRes.data);
        navigate("/products", { replace: true });
      }
    } catch (err) {
      setError("Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <main className="auth-page">
      <div className="auth-panel">
        <div className="auth-copy">
          <p className="eyebrow">Your everyday marketplace</p>
          <h2>Welcome back<span className="accent-dot">.</span></h2>
          <p className="auth-subtitle">
            Don't have an account?{" "}
            <Link to="/register" className="text-link">
              Register here
            </Link>
          </p>
        </div>

        {error && (
          <div className="form-alert">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Email Address</label>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="text-input"
              placeholder="john@gmail.com"
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="text-input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        <div className="auth-footnote"><span /> Secure shopping starts here <span /></div>
      </div>
      <div className="auth-art" aria-hidden="true">
        <span className="art-number">01</span>
        <div className="art-circle"><span>SK</span></div>
        <p>Find pieces<br /><strong>worth keeping.</strong></p>
        <span className="art-line" />
      </div>
    </main>
  );
};

export default Login;