import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import CustomerPage from "./components/CustomerPage";
import AddCustomer from "./components/AddCustomer";
import AdminLogin from "./components/AdminLogin";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/customer/:id" element={<CustomerPage />} />
        <Route path="/add-customer" element={<AddCustomer />} />
        <Route path="/admin-login" element={<AdminLogin />} />
      </Routes>
    </Router>
  );
};

export default App;
