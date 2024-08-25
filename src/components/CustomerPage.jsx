import React, { useState, useEffect, useRef } from "react";
import { Button, Input, Table, Modal, message, Progress, Slider } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import html2canvas from "html2canvas";

const CustomerPage = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [newDebt, setNewDebt] = useState(0);
  const [comments, setComments] = useState("");
  const [repaymentAmount, setRepaymentAmount] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRepaymentModalVisible, setIsRepaymentModalVisible] = useState(false);
  const [hasPaidRequiredAmount, setHasPaidRequiredAmount] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const customerRef = useRef(null); // Ref for the customer element
  const historyRef = useRef(null); // Ref for the history element

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  useEffect(() => {
    // Load customer data from localStorage
    const customerData = JSON.parse(localStorage.getItem("customers"))?.find(
      (c) => c.id === id
    );
    setCustomer(customerData || { debtTotal: 0, history: [] });

    // Check authorization
    const userType = sessionStorage.getItem("userType");
    setIsAdmin(userType === "admin");
  }, [id]);

  useEffect(() => {
    if (isModalVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isModalVisible]);

  const handleAddDebt = () => {
    if (!customer) return;

    const totalDebt = customer.debtTotal + newDebt;

    if (totalDebt > 10000) {
      const repaymentRequired = 0.4 * customer.debtTotal;

      if (repaymentAmount < repaymentRequired) {
        message.error(
          `Для совершения новой покупки необходимо оплатить минимум ${
            repaymentRequired - repaymentAmount
          } рублей.`
        );
        return;
      }

      const newDebtTotal = customer.debtTotal - repaymentAmount;
      const updatedCustomer = {
        ...customer,
        debtTotal: newDebtTotal,
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
            }),
          },
        ],
      };

      const customers = JSON.parse(localStorage.getItem("customers"));
      localStorage.setItem(
        "customers",
        JSON.stringify([
          ...customers.filter((c) => c.id !== id),
          updatedCustomer,
        ])
      );

      setCustomer(updatedCustomer);
      setNewDebt(0);
      setRepaymentAmount(0);
      setComments("");
      setIsModalVisible(false);
      setHasPaidRequiredAmount(false);
    } else {
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
            }),
          },
        ],
      };

      const customers = JSON.parse(localStorage.getItem("customers"));
      localStorage.setItem(
        "customers",
        JSON.stringify([
          ...customers.filter((c) => c.id !== id),
          updatedCustomer,
        ])
      );

      setCustomer(updatedCustomer);
      setNewDebt(0);
      setComments("");
      setIsModalVisible(false);
    }
  };

  const handleRepayment = () => {
    if (!customer) return;

    const repaymentRequired = 0.4 * customer.debtTotal;

    if (repaymentAmount < repaymentRequired) {
      message.error(
        `Необходимо погасить не менее ${repaymentRequired} рублей.`
      );
      return;
    }

    const newDebtTotal = customer.debtTotal - repaymentAmount;
    const updatedCustomer = {
      ...customer,
      debtTotal: newDebtTotal,
      history: [
        ...customer.history,
        {
          amount: -repaymentAmount,
          comment: "Погашение долга",
          date: new Date().toLocaleString("ru-RU", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    };

    const customers = JSON.parse(localStorage.getItem("customers"));
    localStorage.setItem(
      "customers",
      JSON.stringify([...customers.filter((c) => c.id !== id), updatedCustomer])
    );

    setCustomer(updatedCustomer);
    setRepaymentAmount(0);
    setIsRepaymentModalVisible(false);
    setHasPaidRequiredAmount(true);
  };

  const handleDebtChange = (value) => {
    if (customer && customer.debtTotal + value <= 10000) {
      setNewDebt(value);
    } else {
      setNewDebt(10000 - (customer ? customer.debtTotal : 0));
    }
  };

  const captureScreenshot = () => {
    if (!historyRef.current) return;

    html2canvas(historyRef.current).then((canvas) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], `debt_history_${customer.name}.png`, {
          type: "image/png",
        });

        // Share the screenshot if Web Share API is available
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator
            .share({
              files: [file],
              title: `Debt History - ${customer.name}`,
              text: "Here is the debt history screenshot.",
            })
            .then(() => console.log("Shared successfully!"))
            .catch((error) => console.log("Sharing failed:", error));
        } else {
          // Fallback for browsers that do not support Web Share API
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = `debt_history_${customer.name}.png`;
          link.click();
        }
      });
    });
  };

  if (!customer) {
    return <div>Загрузка данных покупателя...</div>;
  }

  const isOverLimit = customer.debtTotal >= 10000;
  const buttonStyle = {
    backgroundColor:
      isOverLimit && !hasPaidRequiredAmount ? "#d3d3d3" : "#52c41a",
    borderColor: isOverLimit && !hasPaidRequiredAmount ? "#d3d3d3" : "#52c41a",
    color: isOverLimit && !hasPaidRequiredAmount ? "#a9a9a9" : "#fff",
  };

  return (
    <div ref={customerRef}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        style={{ marginBottom: "20px" }}
      >
        Назад
      </Button>
      <h2>Страница покупателя</h2>
      <p>Имя: {customer.name}</p>
      <p>Текущий долг: {customer.debtTotal} рублей</p>
      <Progress
        percent={(customer.debtTotal / 10000) * 100}
        format={() => `${customer.debtTotal} рублей`}
        style={{ marginBottom: 20 }}
      />
      {isAdmin && (
        <>
          <Button
            onClick={() => setIsModalVisible(true)}
            disabled={isOverLimit && !hasPaidRequiredAmount}
            style={buttonStyle}
          >
            Новая покупка
          </Button>
          {isOverLimit && (
            <>
              <Button
                onClick={() => setIsRepaymentModalVisible(true)}
                style={{ marginTop: 10 }}
              >
                Погасить долг
              </Button>
              <p style={{ color: "red" }}>
                Долг превышает 10000 рублей. Необходимо оплатить 40% от долга,
                чтобы сделать следующую покупку.
              </p>
            </>
          )}
          <Button
            onClick={captureScreenshot}
            style={{ marginTop: 10, backgroundColor: "#1890ff", color: "#fff" }}
          >
            Скачать скриншот
          </Button>
          <Button
            onClick={captureScreenshot}
            style={{ marginTop: 10, backgroundColor: "#007bff", color: "#fff" }}
          >
            Поделиться скриншотом
          </Button>
        </>
      )}
      <div
        ref={historyRef}
        style={{
          padding: "20px",
          backgroundColor: "#f9f9f9",
          marginBottom: "20px",
        }}
      >
        <Table
          dataSource={customer.history}
          columns={[
            { title: "Сумма", dataIndex: "amount", key: "amount" },
            { title: "Комментарий", dataIndex: "comment", key: "comment" },
            { title: "Дата", dataIndex: "date", key: "date" },
          ]}
          rowKey="date"
        />
        <p>Текущий долг: {customer.debtTotal} рублей</p>
      </div>
      <Modal
        title="Добавить новый долг"
        visible={isModalVisible}
        onOk={handleAddDebt}
        onCancel={() => setIsModalVisible(false)}
        afterClose={() => setNewDebt(0)}
      >
        <Input
          ref={inputRef}
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
      <Modal
        title="Погасить долг"
        visible={isRepaymentModalVisible}
        onOk={handleRepayment}
        onCancel={() => setIsRepaymentModalVisible(false)}
      >
        <Input
          type="number"
          min={0}
          placeholder="Сумма погашения"
          value={repaymentAmount}
          onChange={(e) => setRepaymentAmount(Number(e.target.value))}
        />
        <p>
          Для новой покупки необходимо погасить 40% от текущего долга. Введите
          сумму погашения.
        </p>
      </Modal>
    </div>
  );
};

export default CustomerPage;
