import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const Register = ({ customer }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (customer) {
      navigate("/home", { replace: true });
    }
  }, [customer, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/customers/register", formData);
      if (res.data.success) {
        navigate("/login");
      }
    } catch (err) {
      const responseMessage = err.response?.data?.message;
      if (responseMessage) {
        setError(responseMessage);
      } else if (err.response) {
        setError(
          `Registration failed (HTTP ${err.response.status}). Check the backend response and API URL.`
        );
      } else {
        setError(
          "Could not reach the ShopKart API. Start the backend with `npm run dev`, or set VITE_API_URL to your deployed backend URL. For deployment, ensure CLIENT_URL matches this frontend's exact origin."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-panel">
        <div className="auth-copy">
          <p className="eyebrow">Start your journey</p>
          <h2>Create new account<span className="accent-dot">.</span></h2>
          <p className="auth-subtitle">
            Already have an account?{" "}
            <Link to="/login" className="text-link">
              Sign in
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
            <label>Full Name</label>
            <input
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="text-input"
              placeholder="John Doe"
            />
          </div>

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

          <div className="field">
            <label>Phone Number</label>
            <input
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              className="text-input"
              placeholder="9876543210"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <div className="auth-footnote"><span /> Secure shopping starts here <span /></div>
      </div>
      <div className="auth-art" aria-hidden="true">
        <span className="art-number">01</span>
        <div className="art-circle"><span>SK</span></div>
        <p>Make room for<br /><strong>better finds.</strong></p>
        <span className="art-line" />
      </div>
    </main>
  );
};

export default Register;