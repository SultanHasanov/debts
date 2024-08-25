// NewPurchaseModal.js
import React, { useState } from "react";
import { Modal, Input, Form, Button } from "antd";

const NewPurchaseModal = ({ visible, onCancel, onSubmit }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSubmit(values.amount, values.comment);
      form.resetFields();
      onCancel();
    });
  };

  return (
    <Modal
      visible={visible}
      title="Добавить новую покупку"
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Отмена
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Добавить
        </Button>,
      ]}
    >
      <Form form={form}>
        <Form.Item
          name="amount"
          rules={[{ required: true, message: "Введите сумму!" }]}
        >
          <Input type="number" placeholder="Сумма" />
        </Form.Item>
        <Form.Item name="comment">
          <Input.TextArea placeholder="Комментарий" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewPurchaseModal;
