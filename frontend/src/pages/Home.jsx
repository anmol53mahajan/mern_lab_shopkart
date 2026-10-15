import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const Home = ({ customer, setCustomer }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!customer);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/customers/me");
        setCustomer(res.data);
      } catch (err) {
        setCustomer(null);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    if (!customer) {
      fetchUser();
    }
  }, [customer, navigate, setCustomer]);

  if (loading) {
    return (
      <div className="loading-screen page-loading">
        <span className="loading-mark">S</span>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <main className="home-page">
      <section className="welcome-banner">
        <div>
          <p className="eyebrow">ShopKart / Personal space</p>
          <h1>
            Welcome back, <span>{customer.fullName}</span>.
          </h1>
          <p className="banner-copy">
            You are successfully authenticated to the ShopKart platform.
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <Link
              to="/products"
              className="nav-button nav-button-primary"
              style={{
                display: "inline-block",
                padding: "0.75rem 1.5rem",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Explore Product Catalog &rarr;
            </Link>
          </div>
        </div>
        <div className="banner-badge">
          Member
          <br />
          <strong>001</strong>
        </div>
      </section>

      <section className="profile-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Account overview</p>
            <h2>Your details</h2>
          </div>
          <span>Profile / 01</span>
        </div>

        <div className="profile-grid">
          <div className="profile-item">
            <span>Full Name</span>
            <p>{customer.fullName}</p>
          </div>

          <div className="profile-item">
            <span>Email Address</span>
            <p>{customer.email}</p>
          </div>

          <div className="profile-item">
            <span>Phone Number</span>
            <p>{customer.phone}</p>
          </div>

          <div className="profile-item">
            <span>Account ID</span>
            <p className="profile-id">{customer._id}</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;