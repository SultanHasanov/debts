import React, { useEffect, useRef } from "react";
import { Button, Input, Table, Modal, message, Progress, Slider } from "antd";
import { ArrowLeftOutlined, ShareAltOutlined } from "@ant-design/icons";
import html2canvas from "html2canvas";
import { observer } from "mobx-react";
import { useNavigate, useParams } from "react-router-dom";
import customerStore from "../stores/CustomerStore";

const CustomerPage = observer(() => {
  const { id } = useParams();
  const inputRef = useRef(null);
  const historyRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    customerStore.fetchCustomerData(id);
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddDebt = () => {
    if (!customerStore.customer) return; // Если клиент не загружен, не делаем ничего

    // Проверим, если введенная сумма долга не меньше или равна нулю
    if (customerStore.newDebt <= 0) {
      message.error("Сумма долга должна быть больше нуля.");
      return;
    }

    // Проверка на превышение лимита (если долг клиента уже больше 10,000)
    const totalDebt = customerStore.customer.debtTotal + customerStore.newDebt;
    if (totalDebt > 10000) {
      message.error("Сумма долга превышает лимит 10,000 рублей.");
      return;
    }

    // Обновление данных клиента с новым долгом и историей
    const updatedCustomer = {
      ...customerStore.customer,
      debtTotal: totalDebt, // Новый долг
      history: [
        ...customerStore.customer.history, // История покупок
        {
          amount: customerStore.newDebt,
          comment: customerStore.comments, // Комментарий
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

    // Отправка обновленных данных клиента на сервер
    customerStore.updateCustomerData(updatedCustomer);

    // Сброс состояния после добавления долга
    customerStore.resetDebtState();
  };

  const handleRepayment = () => {
    if (!customerStore.customer) return;

    // Проверка, чтобы сумма погашения не превышала текущий долг
    if (customerStore.repaymentAmount > customerStore.customer.debtTotal) {
      message.error(
        `Вы не можете погасить больше, чем текущий долг: ${customerStore.customer.debtTotal} рублей.`
      );
      return;
    }

    // Логика погашения долга
    const updatedCustomer = {
      ...customerStore.customer,
      debtTotal:
        customerStore.customer.debtTotal - customerStore.repaymentAmount,
      history: [
        ...customerStore.customer.history,
        {
          amount: -customerStore.repaymentAmount, // Погашение долга
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

    // Обновляем данные клиента
    const customerId = customerStore.customer?.id;
    if (customerId) {
      customerStore.updateCustomerData(updatedCustomer, customerId);
    }

    // Сбрасываем состояние
    customerStore.resetRepaymentState();
    customerStore.isRepaymentModalVisible = false;
  };

  const captureScreenshot = () => {
    if (!historyRef.current) return;

    html2canvas(historyRef.current).then((canvas) => {
      canvas.toBlob((blob) => {
        const file = new File(
          [blob],
          `debt_history_${customerStore.customer.name}.png`,
          {
            type: "image/png",
          }
        );

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator
            .share({
              files: [file],
              title: `Долг - ${customerStore.customer.name}`,
              text: "Просим оплатить долг",
            })
            .then(() => console.log("Shared successfully!"))
            .catch((error) => console.log("Sharing failed:", error));
        } else {
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = `debt_history_${customerStore.customer.name}.png`;
          link.click();
        }
      });
    });
  };

  const buttonStyle = {
    backgroundColor:
      customerStore.isOverLimit && !customerStore.hasPaidRequiredAmount
        ? "#d3d3d3"
        : "#52c41a",
    borderColor:
      customerStore.isOverLimit && !customerStore.hasPaidRequiredAmount
        ? "#d3d3d3"
        : "#52c41a",
    color:
      customerStore.isOverLimit && !customerStore.hasPaidRequiredAmount
        ? "#a9a9a9"
        : "#fff",
  };

  if (!customerStore.customer) {
    return <div>Загрузка данных покупателя...</div>;
  }

  const onChange = (e) => {
    const { value } = e.target;
    customerStore.setComments(value); // Здесь вызывается метод для обновления комментария
  };

  return (
    <div>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        style={{ marginBottom: "20px" }}
      >
        Назад
      </Button>
      <h2>Страница покупателя</h2>
      <p>Имя: {customerStore.customer.name}</p>
      <p>Текущий долг: {customerStore.customer.debtTotal} рублей</p>
      <Progress
        percent={(customerStore.customer.debtTotal / 10000) * 100}
        format={() => `${customerStore.customer.debtTotal} рублей`}
        style={{ marginBottom: 20 }}
      />
      {!customerStore.isAdmin && (
        <>
          {customerStore.isOverLimit && (
            <p style={{ color: "red" }}>
              Долг превышает 10000 рублей. Необходимо оплатить 40% от долга,
              чтобы сделать следующую покупку.
            </p>
          )}
        </>
      )}
      {customerStore.isAdmin && (
        <>
          <Button
            onClick={() => (customerStore.isModalVisible = true)}
            disabled={customerStore.isFinalPurchaseMade} // Блокируем кнопку, если лимит уже был превышен
            style={{
              backgroundColor: customerStore.isFinalPurchaseMade
                ? "#d3d3d3"
                : "#52c41a",
              borderColor: customerStore.isFinalPurchaseMade
                ? "#d3d3d3"
                : "#52c41a",
              color: customerStore.isFinalPurchaseMade ? "#a9a9a9" : "#fff",
            }}
          >
            Новая покупка
          </Button>

          <Button
            onClick={() => (customerStore.isRepaymentModalVisible = true)}
            style={{ marginTop: 10 }}
          >
            Погасить долг
          </Button>
          {customerStore.isOverLimit && (
            <p style={{ color: "red" }}>
              Долг превышает 10000 рублей. Необходимо оплатить 40% от долга,
              чтобы сделать следующую покупку.
            </p>
          )}

          <Button
            onClick={captureScreenshot}
            icon={<ShareAltOutlined />}
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
          pagination={{ pageSize: 10 }}
          dataSource={customerStore.customer.history}
          columns={[
            { title: "Сумма", dataIndex: "amount", key: "amount" },
            { title: "Комментарий", dataIndex: "comment", key: "comment" },
            { title: "Дата", dataIndex: "date", key: "date" },
          ]}
          rowKey={(record, index) => `${record.date}-${index}`}
        />
        <p>Текущий долг: {customerStore.customer.debtTotal} рублей</p>
      </div>

      {/* Модальное окно добавления долга */}
      <Modal
        title="Добавить новый долг"
        visible={customerStore.isModalVisible}
        onOk={() => customerStore.handleAddDebt()} // Обработчик добавления долга
        onCancel={() => (customerStore.isModalVisible = false)}
        afterClose={() => customerStore.resetDebtState()}
      >
        {/* Поле ввода суммы долга */}
        <Input
          ref={inputRef}
          type="number"
          min={0}
          placeholder="Сумма долга"
          value={customerStore.newDebt}
          onChange={(e) =>
            customerStore.handleDebtChange(Number(e.target.value))
          }
        />

        <Slider
          min={0}
          max={20000} // Позволяем установить большое значение
          step={1}
          value={customerStore.newDebt}
          onChange={(value) => customerStore.handleDebtChange(value)}
          style={{ marginTop: 20 }}
        />

        {/* Поле для ввода комментария */}
        <Input.TextArea
          placeholder="Комментарий"
          value={customerStore.comments}
          onChange={(e) => customerStore.setComments(e.target.value)}
          style={{ marginTop: 20 }}
        />
      </Modal>

      {/* Модальное окно погашения долга */}
      <Modal
        title="Погасить долг"
        visible={customerStore.isRepaymentModalVisible}
        onOk={handleRepayment}
        onCancel={() => (customerStore.isRepaymentModalVisible = false)}
      >
        <Input
          type="number"
          min={0}
          max={customerStore.customer.debtTotal} // Ограничиваем максимальное значение полем текущего долга
          placeholder="Сумма погашения"
          value={customerStore.repaymentAmount}
          onChange={(e) =>
            customerStore.setRepaymentAmount(Number(e.target.value))
          }
        />

        <p>
          Введите сумму погашения долга. Вы можете погасить любой размер суммы.
        </p>
      </Modal>
    </div>
  );
});

export default CustomerPage;
