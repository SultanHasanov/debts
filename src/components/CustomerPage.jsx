import React, { useState, useEffect, useRef } from "react";
import { Button, Input, Table, Modal, message, Progress, Slider } from "antd";
import { useParams } from "react-router-dom";

const CustomerPage = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [newDebt, setNewDebt] = useState(0);
  const [comments, setComments] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const inputRef = useRef(null); // Создаем реф для Input

  useEffect(() => {
    // Загрузка данных покупателя из localStorage
    const customerData = JSON.parse(localStorage.getItem("customers"))?.find(
      (c) => c.id === id
    );
    setCustomer(customerData || { debtTotal: 0, history: [] });
  }, [id]);

  useEffect(() => {
    if (isModalVisible && inputRef.current) {
      inputRef.current.focus(); // Фокусируемся на поле ввода при открытии модального окна
    }
  }, [isModalVisible]);

  const handleAddDebt = () => {
    if (!customer) return; // Добавляем проверку на существование customer

    const totalDebt = customer.debtTotal + newDebt;

    // Проверяем, если новая покупка больше 10 000 рублей
    if (totalDebt > 10000) {
      message.error(
        "Вы достигли лимита в 10000 рублей. Оплатите 40% от долга, чтобы сделать следующую покупку."
      );
      return;
    }

    const updatedCustomer = {
      ...customer,
      debtTotal: totalDebt,
      history: [
        ...customer.history,
        {
          amount: newDebt,
          comment: comments,
          date: new Date().toLocaleString("ru-RU", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }), // Форматирование даты
        },
      ],
    };

    const customers = JSON.parse(localStorage.getItem("customers"));
    localStorage.setItem(
      "customers",
      JSON.stringify([...customers.filter((c) => c.id !== id), updatedCustomer])
    );

    setCustomer(updatedCustomer);
    setNewDebt(0);
    setComments("");
    setIsModalVisible(false);
  };

  const handleDebtChange = (value) => {
    if (customer && customer.debtTotal + value <= 10000) {
      setNewDebt(value);
    } else {
      setNewDebt(10000 - (customer ? customer.debtTotal : 0)); // Ограничиваем долг до 10000 рублей
    }
  };

  if (!customer) {
    return <div>Загрузка данных покупателя...</div>;
  }

  const isOverLimit = customer.debtTotal >= 10000;
  const buttonStyle = {
    backgroundColor: isOverLimit ? "#d3d3d3" : "#52c41a", // Замените на желаемый цвет
    borderColor: isOverLimit ? "#d3d3d3" : "#52c41a", // Замените на желаемый цвет
    color: isOverLimit ? "#a9a9a9" : "#fff", // Цвет текста при деактивации
  };

  return (
    <div>
      <h2>Страница покупателя</h2>
      <p>Имя: {customer.name}</p>
      <p>Текущий долг: {customer.debtTotal} рублей</p>
      <Progress
        percent={(customer.debtTotal / 10000) * 100}
        format={() => `${customer.debtTotal} рублей`}
        style={{ marginBottom: 20 }}
      />
      <Button
        onClick={() => setIsModalVisible(true)}
        disabled={isOverLimit}
        style={buttonStyle}
      >
        Новая покупка
      </Button>
      {isOverLimit && (
        <p style={{ color: "red" }}>
          Долг превышает 10000 рублей. Необходимо оплатить 40% от долга, чтобы
          сделать следующую покупку.
        </p>
      )}
      <Table
        dataSource={customer.history}
        columns={[
          { title: "Сумма", dataIndex: "amount", key: "amount" },
          { title: "Комментарий", dataIndex: "comment", key: "comment" },
          { title: "Дата", dataIndex: "date", key: "date" },
        ]}
        rowKey="date"
      />
      <Modal
        title="Добавить новый долг"
        visible={isModalVisible}
        onOk={handleAddDebt}
        onCancel={() => setIsModalVisible(false)}
        afterClose={() => setNewDebt(0)} // Сброс значения после закрытия модалки
      >
        <Input
          ref={inputRef} // Устанавливаем реф для Input
          type="number"
          min={0}
          placeholder="Сумма долга"
          value={newDebt}
          onChange={(e) => handleDebtChange(Number(e.target.value))}
        />
        <Slider
          min={0}
          max={10000 - (customer ? customer.debtTotal : 0)}
          step={1}
          value={newDebt}
          onChange={handleDebtChange}
          style={{ marginTop: 20 }}
        />
        <Input.TextArea
          placeholder="Комментарий"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          style={{ marginTop: 20 }}
        />
      </Modal>
    </div>
  );
};

export default CustomerPage;
