// src/pages/HomePage.js
import React, { useState } from "react";
import { Button } from "antd";
import CustomerIdForm from "../components/CustomerIdForm";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [showForm, setShowForm] = useState(false);

  const handleCustomerLogin = () => {
    // Устанавливаем информацию о входе как покупатель
    sessionStorage.setItem("userType", "customer");
    setShowForm(true);
  };

  const handleAdminLogin = () => {
    // Устанавливаем информацию о входе как администратор
    sessionStorage.setItem("userType", "admin");
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Link to="/admin-login">
        <Button
          type="primary"
          onClick={handleAdminLogin}
          style={{ fontSize: "25px", padding: "20px 20px" }}
        >
          Войти как администратор
        </Button>
      </Link>
      <br />
      <br />
      {!showForm ? (
        <Button
          type="default"
          onClick={handleCustomerLogin}
          style={{ fontSize: "25px", padding: "20px 20px" }}
        >
          Войти как покупатель
        </Button>
      ) : (
        <CustomerIdForm />
      )}
    </div>
  );
};

export default HomePage;