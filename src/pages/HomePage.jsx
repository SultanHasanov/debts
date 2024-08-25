// src/pages/HomePage.js
import React, { useState } from "react";
import { Button } from "antd";
import CustomerIdForm from "../components/CustomerIdForm";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <Link to="/admin">
        <Button type="primary">Войти как администратор</Button>
      </Link>
      <br />
      <br />
      {!showForm ? (
        <Button type="default" onClick={() => setShowForm(true)}>
          Войти как покупатель
        </Button>
      ) : (
        <CustomerIdForm />
      )}
    </div>
  );
};

export default HomePage;
