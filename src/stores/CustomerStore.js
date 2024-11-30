import { makeAutoObservable } from "mobx";

class CustomerStore {
    customer = null;
    newDebt = 0;
    comments = "";
    repaymentAmount = 0;
    isModalVisible = false;
    isRepaymentModalVisible = false;
    hasPaidRequiredAmount = false;
    isAdmin = true;
    isFinalPurchaseMade = false;
    
    
  
    constructor() {
      makeAutoObservable(this);
      this.comments = "";
    }
  
    // Метод для изменения суммы погашения
    setRepaymentAmount(value) {
      this.repaymentAmount = value;
    }

    // В customerStore.js
setComments(newComments) {
    this.comments = newComments;
  }

  // Метод для обновления комментариев
  setComments(newComments) {
    this.comments = newComments;
  }

    // Метод для сброса состояния долга
  resetDebtState() {
    this.newDebt = 0;
    this.comments = "";
    this.isModalVisible = false;
  }

    // Метод для сброса состояния после погашения долга
  resetRepaymentState() {
    this.repaymentAmount = 0;  // Сбросить сумму погашения
    this.isRepaymentModalVisible = false;  // Закрыть модальное окно
    this.hasPaidRequiredAmount = false;  // Сбросить статус оплаты
  }

  // Метод для обработки изменения значения долга
  handleDebtChange(value) {
    if (value >= 0) {
      this.newDebt = value; // Устанавливаем значение без проверки лимита
    }
  }

  

  async fetchCustomerData(id) {
    try {
      const response = await fetch(`https://649853cd515dd1de.mokky.dev/items/${id}`);
      if (response.ok) {
        const data = await response.json();
        this.customer = data;
      } else {
        console.error("Ошибка при получении данных клиента");
      }
    } catch (error) {
      console.error("Ошибка при запросе данных:", error);
    }
  }

  async updateCustomerData(updatedCustomer) {
    try {
      const response = await fetch(`https://649853cd515dd1de.mokky.dev/items/${this.customer.id}`, {
        method: "PATCH", // Используем PATCH для частичного обновления
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCustomer), // Отправляем обновленные данные
      });
  
      if (response.ok) {
        const data = await response.json();
        this.customer = data; // Обновляем локальные данные клиента
      } else {
        console.error("Ошибка при обновлении данных клиента", response.status);
        message.error("Не удалось обновить данные клиента. Попробуйте снова.");
      }
    } catch (error) {
      console.error("Ошибка при запросе:", error);
      message.error("Произошла ошибка при обновлении данных.");
    }
  }
  
  
  

  setNewDebt(value) {
    if (this.customer && this.customer.debtTotal + value <= 10000) {
      this.newDebt = value;
    } else {
      this.newDebt = 10000 - (this.customer ? this.customer.debtTotal : 0);
    }
  }

  handleAddDebt() {
    if (!this.customer) return;
  
    const totalDebt = this.customer.debtTotal + this.newDebt;
  
    // Если долг превышает лимит впервые, позволяем добавить покупку
    if (totalDebt > 10000 && this.isFinalPurchaseMade) {
      message.error("Вы уже достигли максимального лимита долга.");
      return;
    }
  
    if (totalDebt > 10000 && !this.isFinalPurchaseMade) {
      this.isFinalPurchaseMade = true; // Устанавливаем флаг
    }
  
    // Обновляем данные клиента
    const updatedCustomer = {
      ...this.customer,
      debtTotal: totalDebt,
      history: [
        ...this.customer.history,
        {
          amount: this.newDebt,
          comment: this.comments,
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
  
    this.updateCustomerData(updatedCustomer);
  
    // Сбрасываем состояние
    this.resetDebtState();
  }
  
  

  handleRepayment() {
    if (!this.customer) return;
  
    const newDebtTotal = this.customer.debtTotal - this.repaymentAmount;
  
    if (newDebtTotal < 0) {
      message.error("Сумма погашения не может превышать текущий долг.");
      return;
    }
  
    const updatedCustomer = {
      ...this.customer,
      debtTotal: newDebtTotal,
      history: [
        ...this.customer.history,
        {
          amount: -this.repaymentAmount,
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
  
    this.updateCustomerData(updatedCustomer);
    this.repaymentAmount = 0;
    this.isRepaymentModalVisible = false;
  
    if (newDebtTotal <= 10000) {
      // Сбрасываем флаг, если долг стал меньше или равен лимиту
      this.isFinalPurchaseMade = false;
    }
  
    message.success("Долг успешно погашен.");
  }
  
  
  
}

const customerStore = new CustomerStore();
export default customerStore;
