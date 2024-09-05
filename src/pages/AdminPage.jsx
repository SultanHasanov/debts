import React, { useState, useRef, useEffect } from "react";
import { Button, Input, Table, Modal, message } from "antd";
import { useNavigate } from "react-router-dom";
import { CopyOutlined, CheckOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import cash from "./cash.png";

const AdminPage = () => {
  const [customers, setCustomers] = useState(
    JSON.parse(localStorage.getItem("customers")) || []
  );
  const [isAddCustomerModalVisible, setIsAddCustomerModalVisible] =
    useState(false);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const generateUniqueId = (existingIds) => {
    let newId;
    do {
      newId = Math.floor(Math.random() * 9000) + 1000;
    } while (existingIds.includes(newId));
    return newId.toString();
  };

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
    setIsAddCustomerModalVisible(false);
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      message.success("Код скопирован в буфер обмена!");
      setTimeout(() => {
        setCopiedId(null);
      }, 4000);
    });
  };

  const handleCustomerNameClick = (record) => {
    setSelectedCustomer(record);
    setIsInfoModalVisible(true);
  };

  const generateExcelFile = (data) => {
    const wsData = [
      ["ID", "Имя", "Текущий долг"],
      ...data.map((customer) => [
        customer.id,
        customer.name,
        customer.debtTotal,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");

    const fileName = "customers.xlsx";
    const file = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

    return new Blob([s2ab(file)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  };

  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  };

  const sendFileToTelegram = async (file) => {
    const token = "6199714726:AAEX2ajO1qyM4E8_ShQ9cMNJvn12HPFcZrg"; // Замените на ваш токен бота
    const chatId = "-1001811930704"; // Замените на ваш chat ID
    const url = `https://api.telegram.org/bot${token}/sendDocument`;

    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("document", file, "customers.xlsx"); // Укажите имя файла

    try {
      await fetch(url, {
        method: "POST",
        body: formData,
      });
      message.success("Файл отправлен в Telegram!");
    } catch (error) {
      console.error("Ошибка при отправке файла в Telegram:", error);
      message.error("Ошибка при отправке файла в Telegram");
    }
  };

  const handleSendAllData = () => {
    const file = generateExcelFile(customers);
    sendFileToTelegram(file);
  };

  useEffect(() => {
    if (isAddCustomerModalVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddCustomerModalVisible]);

  const handleLogout = () => {
    sessionStorage.removeItem("userType");
    navigate("/");
  };

  const columns = [
    {
      title: "№",
      key: "index",
      render: (_, __, index) => <span>{index + 1}</span>,
    },
    {
      title: "Имя",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Button type="link" onClick={() => handleCustomerNameClick(record)}>
          {text}
        </Button>
      ),
    },
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
      title: "",
      key: "money",
      render: (text, record) =>
        record.debtTotal >= 10000 ? (
          <img src={cash} style={{ height: 50 }} />
        ) : null,
    },
  ];

  return (
    <div style={{ position: "relative" }}>
      <h2>Административная панель</h2>
      <Button
        type="primary"
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: 44,
          right: 20,
        }}
      >
        Выйти
      </Button>
      <Button onClick={() => setIsAddCustomerModalVisible(true)}>
        Добавить покупателя
      </Button>
      <Button
        onClick={handleSendAllData}
        style={{
          marginLeft: "10px",
          backgroundColor: "#007bff",
          color: "#fff",
        }}
      >
        Отправить все данные в Telegram
      </Button>
      <Table
        dataSource={customers}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title="Добавить покупателя"
        visible={isAddCustomerModalVisible}
        onOk={handleAddCustomer}
        onCancel={() => setIsAddCustomerModalVisible(false)}
      >
        <Input
          ref={inputRef}
          placeholder="Имя покупателя"
          value={newCustomerName}
          onChange={(e) => setNewCustomerName(e.target.value)}
        />
      </Modal>

      <Modal
        title="Информация о покупателе"
        visible={isInfoModalVisible}
        onCancel={() => setIsInfoModalVisible(false)}
        footer={null}
      >
        {selectedCustomer && (
          <div>
            <p>
              <strong>Имя:</strong> {selectedCustomer.name}
            </p>
            <p>
              <strong>Код:</strong> {selectedCustomer.id}
            </p>
            <Button
              onClick={() => handleCopyId(selectedCustomer.id)}
              icon={
                copiedId === selectedCustomer.id ? (
                  <CheckOutlined style={{ color: "green" }} />
                ) : (
                  <CopyOutlined />
                )
              }
            >
              Копировать код
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPage;
