// api.js
import axios from "axios";

const API_URL = "http://localhost:5000"; // Замените на ваш API URL

export const getCustomers = async () => {
  const response = await axios.get(`${API_URL}/customers`);
  return response.data;
};

export const getCustomerById = async (id) => {
  const response = await axios.get(`${API_URL}/customers/${id}`);
  return response.data;
};

export const addCustomer = async (customer) => {
  const response = await axios.post(`${API_URL}/customers`, customer);
  return response.data;
};

export const addDebt = async (customerId, debt) => {
  const response = await axios.post(
    `${API_URL}/customers/${customerId}/debts`,
    debt
  );
  return response.data;
};

export const payDebt = async (customerId, amount) => {
  const response = await axios.post(`${API_URL}/customers/${customerId}/pay`, {
    amount,
  });
  return response.data;
};


export const deleteCustomer = async (id) => {
  try {
    const response = await fetch(`/api/customers/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete customer");
    }
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
};