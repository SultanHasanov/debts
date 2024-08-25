import React, { useState, useRef, useEffect } from "react";
import { Button, Input, Table, Modal, message } from "antd";
import { useNavigate } from "react-router-dom";
import {
  CopyOutlined,
  CheckOutlined,
  ShareAltOutlined,
} from "@ant-design/icons"; // Импортируем иконки
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
      message.success("Код скопирован в буфер обмена!");

      // Возвращаем иконку через 4 секунды
      setTimeout(() => {
        setCopiedId(null);
      }, 4000);
    });
  };

  // Обработчик создания и поделиться PDF
  const handleShare = (customer) => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["ID", "Имя", "Долг"]],
      body: [[customer.id, customer.name, customer.debtTotal]],
      theme: "striped",
    });

    // Генерация PDF в формате Blob
    const pdfBlob = doc.output("blob");

    // Создание URL для Blob
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Использование интерфейса Share API для открытия диалогового окна
    if (navigator.share) {
      navigator
        .share({
          title: `${customer.name} - Долг`,
          url: pdfUrl,
        })
        .then(() => {
          message.success("Файл успешно отправлен!");
        })
        .catch((error) => {
          message.error("Ошибка при отправке файла.");
          console.error("Share failed:", error);
        });
    } else {
      // Если Share API не поддерживается, скачиваем файл
      doc.save(`${customer.name}-debt.pdf`);
    }

    // Освобождение ресурсов после использования URL
    URL.revokeObjectURL(pdfUrl);
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
      title: "",
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
    {
      title: "",
      key: "share",
      render: (text, record) =>
        record.debtTotal >= 10000 ? (
          <Button
            onClick={() => handleShare(record)}
            icon={<ShareAltOutlined />}
          >
            Поделиться
          </Button>
        ) : null,
    },
  ];

  // Эффект для установки фокуса на поле ввода при открытии модального окна
  useEffect(() => {
    if (isModalVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isModalVisible]);

  const handleLogout = () => {
    // Очистить данные авторизации из sessionStorage
    sessionStorage.removeItem("userType");
    // Перенаправить на главную страницу
    navigate("/");
  };

  return (
    <div style={{ position: "relative" }}>
      <h2>Административная панель</h2>
      <Button
        type="primary"
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
        }}
      >
        Выйти
      </Button>
      <Button onClick={() => setIsModalVisible(true)}>
        Добавить покупателя
      </Button>
      <Table
        dataSource={customers}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
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
