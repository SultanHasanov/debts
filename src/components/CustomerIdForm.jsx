// src/components/CustomerIdForm.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, message } from "antd";

const CustomerIdForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleFinish = (values) => {
    const { customerId } = values;
    // Извлекаем массив покупателей из localStorage
    const customers = JSON.parse(localStorage.getItem("customers")) || [];

    // Ищем покупателя по ID в массиве
    const customerExists = customers.some(
      (customer) => customer.id === customerId
    );

    if (customerExists) {
      navigate(`/customer/${customerId}`);
    } else {
      message.error("Покупатель не найден. Проверьте ID и попробуйте снова.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <Form
        form={form}
        onFinish={handleFinish}
        style={{ maxWidth: 400, margin: "0 auto" }}
      >
        <Form.Item
          name="customerId"
          rules={[
            { required: true, message: "Пожалуйста, введите Код покупателя!" },
          ]}
        >
          <Input placeholder="Введите ID покупателя" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Перейти
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CustomerIdForm;
