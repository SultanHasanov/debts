import React, { useState, useRef, useEffect } from "react";
import { Button, Input, Table, Modal, message } from "antd";
import { useNavigate } from "react-router-dom";
import { CopyOutlined, CheckOutlined } from "@ant-design/icons"; // Импортируем иконки

const AdminPage = () => {
  const [customers, setCustomers] = useState(
    JSON.parse(localStorage.getItem("customers")) || []
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [copiedId, setCopiedId] = useState(null); // Состояние для отслеживания скопированного ID
  const navigate = useNavigate();
  const inputRef = useRef(null); // Создаем реф для поля ввода

  // Функция для генерации уникального четырехзначного ID
  const generateUniqueId = (existingIds) => {
    let newId;
    do {
      newId = Math.floor(Math.random() * 9000) + 1000; // Генерируем случайное число от 1000 до 9999
    } while (existingIds.includes(newId)); // Проверяем, не занят ли ID
    return newId.toString();
  };

  // Обработчик добавления покупателя
  const handleAddCustomer = () => {
    const existingIds = customers.map((customer) => customer.id);
    const newCustomerId = generateUniqueId(existingIds);

    const newCustomer = {
      id: newCustomerId,
      name: newCustomerName,
      debtTotal: 0,
      history: [],
    };

    const updatedCustomers = [...customers, newCustomer];
    localStorage.setItem("customers", JSON.stringify(updatedCustomers));
    setCustomers(updatedCustomers);
    setNewCustomerName("");
    setIsModalVisible(false);
  };

  // Обработчик копирования ID
  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id); // Устанавливаем скопированный ID
      message.success("ID скопирован в буфер обмена!");

      // Возвращаем иконку через 4 секунды
      setTimeout(() => {
        setCopiedId(null);
      }, 4000);
    });
  };

  // Колонки таблицы
  const columns = [
    {
      title: "№",
      key: "index",
      render: (_, __, index) => <span>{index + 1}</span>, // Порядковый номер
    },
    { title: "Имя", dataIndex: "name", key: "name" },
    {
      title: "Действия",
      key: "actions",
      render: (text, record) => (
        <div>
          <Button onClick={() => navigate(`/customer/${record.id}`)}>
            Просмотр
          </Button>
        </div>
      ),
    },
    {
      title: "Код",
      dataIndex: "id",
      key: "id",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Копировать ID",
      key: "copy",
      render: (text, record) => (
        <Button
          onClick={() => handleCopyId(record.id)}
          icon={
            copiedId === record.id ? (
              <CheckOutlined style={{ color: "green" }} /> // Зеленая галочка
            ) : (
              <CopyOutlined />
            )
          }
        />
      ),
    },
  ];

  // Эффект для установки фокуса на поле ввода при открытии модального окна
  useEffect(() => {
    if (isModalVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isModalVisible]);

  return (
    <div>
      <h2>Административная панель</h2>
      <Button onClick={() => setIsModalVisible(true)}>
        Добавить покупателя
      </Button>
      <Table dataSource={customers} columns={columns} rowKey="id" />
      <Modal
        title="Добавить покупателя"
        visible={isModalVisible}
        onOk={handleAddCustomer}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          ref={inputRef} // Устанавливаем реф
          placeholder="Имя покупателя"
          value={newCustomerName}
          onChange={(e) => setNewCustomerName(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default AdminPage;
