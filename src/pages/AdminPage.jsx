import React, { useState, useRef, useEffect } from "react";
import { Button, Input, Table, Modal, message } from "antd";
import { useNavigate } from "react-router-dom";
import { CopyOutlined, CheckOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import "../App.css";

const API_URL = "https://649853cd515dd1de.mokky.dev/items";

const AdminPage = () => {
  const [customers, setCustomers] = useState([]);
  const [isAddCustomerModalVisible, setIsAddCustomerModalVisible] =
    useState(false);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  console.log({customers})

  const fetchCustomers = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        throw new Error("Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      message.error("Ошибка при загрузке данных покупателей");
    }
  };

  const handleAddCustomer = async () => {
    // Generate a random 4-digit code
    const uniqueCode = Math.floor(1000 + Math.random() * 9000); // Random number between 1000 and 9999
  
    const newCustomer = {
      name: newCustomerName,
      debtTotal: 0,
      history: [],
      code: uniqueCode, // Add the generated code to the new customer object
    };
  
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });
  
      if (response.ok) {
        const createdCustomer = await response.json();
        setCustomers([...customers, createdCustomer]);
        message.success("Покупатель успешно добавлен!");
      } else {
        throw new Error("Failed to add customer");
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      message.error("Ошибка при добавлении покупателя");
    } finally {
      setNewCustomerName("");
      setIsAddCustomerModalVisible(false);
    }
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
    fetchCustomers();
  }, []);

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
      render: (_, record) => (
        <div>
          <Button onClick={() => navigate(`/customer/${record.id}`)}>
            Просмотр
          </Button>
        </div>
      ),
    },
    {
      title: "Не погашал долг",
      dataIndex: "lastPayment",
      key: "lastPayment",
      render: (_, record) => {
        if (!record.history || record.history.length === 0) {
          // Если истории нет, считаем, что покупатель не погашал долг
          return
        }
    
        const currentDate = new Date();
    
        // Сортируем историю по дате в порядке возрастания
        const sortedHistory = [...record.history].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
    
        // Находим первый долг
        const firstDebt = sortedHistory.find((payment) => payment.amount > 0);
        if (!firstDebt) {
          return <span>Нет данных о долгах</span>;
        }
    
        // Находим последнее погашение
        const lastPayment = sortedHistory
          .reverse()
          .find((payment) => payment.comment.includes("Погашение долга"));
    
        if (!lastPayment) {
          const firstDebtDate = new Date(firstDebt.date);
          const diffInTime = currentDate - firstDebtDate;
          const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24)); // Разница в днях
          return (
            <span>
            <span style={{ color: diffInDays > 30 ? "red" : "black" }}>
              {diffInDays} дн. &nbsp;
            <span style={{ color: "green" }}>Долг: <b>{record.debtTotal}₽</b></span>
            </span>
          </span>
          );
        }
    
        // Если есть погашение, проверяем, прошло ли больше месяца с последнего погашения
        const lastPaymentDate = new Date(lastPayment.date);
        const diffInTime = currentDate - lastPaymentDate;
        const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24)); // Разница в днях
    
        return (
          <span>
            <span style={{ color: diffInDays > 30 ? "red" : "black" }}>
              {diffInDays} дн. &nbsp;
            <span style={{ color: "green" }}>Долг: <b>{record.debtTotal}₽</b></span>
            </span>
          </span>
        );
      },
    }
    
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
          marginBottom: 20,
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
              <strong>Код:</strong> {selectedCustomer.code}
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
