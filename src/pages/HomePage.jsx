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
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <Link to="/admin-login">
        <Button type="primary" onClick={handleAdminLogin}>
          Войти как администратор
        </Button>
      </Link>
      <br />
      <br />
      {!showForm ? (
        <Button type="default" onClick={handleCustomerLogin}>
          Войти как покупатель
        </Button>
      ) : (
        <CustomerIdForm />
      )}
    </div>
  );
};

export default HomePage;
