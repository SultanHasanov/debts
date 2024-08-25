// src/components/AddCustomer.js
import React from "react";
import { Form, Input, Button, message } from "antd";

const AddCustomer = () => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    const { firstName, lastName, id } = values;
    // Формируем ключ для хранения в localStorage
    const customerKey = `customer-${id}`;
    // Проверяем, существует ли уже такой покупатель
    if (localStorage.getItem(customerKey)) {
      message.error("Покупатель с таким ID уже существует.");
      return;
    }
    // Сохраняем данные покупателя в localStorage
    localStorage.setItem(customerKey, JSON.stringify({ firstName, lastName }));
    message.success("Покупатель добавлен успешно!");
    form.resetFields();
  };

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <Form
        form={form}
        onFinish={handleFinish}
        style={{ maxWidth: 400, margin: "0 auto" }}
      >
        <Form.Item
          name="id"
          rules={[
            { required: true, message: "Пожалуйста, введите ID покупателя!" },
          ]}
        >
          <Input placeholder="ID покупателя" />
        </Form.Item>
        <Form.Item
          name="firstName"
          rules={[
            { required: true, message: "Пожалуйста, введите имя покупателя!" },
          ]}
        >
          <Input placeholder="Имя покупателя" />
        </Form.Item>
        <Form.Item
          name="lastName"
          rules={[
            {
              required: true,
              message: "Пожалуйста, введите фамилию покупателя!",
            },
          ]}
        >
          <Input placeholder="Фамилия покупателя" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Добавить покупателя
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddCustomer;
