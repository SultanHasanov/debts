// CustomerView.js
import React from "react";
import { useParams } from "react-router-dom";
import CustomerPage from "../components/CustomerPage";

const CustomerView = () => {
  const { id } = useParams();
  return <CustomerPage id={id} />;
};

export default CustomerView;
