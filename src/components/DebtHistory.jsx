// DebtHistory.js
import React from "react";
import { List, Card } from "antd";

const DebtHistory = ({ debts }) => (
  <List
    grid={{ gutter: 16, column: 1 }}
    dataSource={debts}
    renderItem={(item) => (
      <List.Item>
        <Card title={item.date}>
          <p>Сумма: {item.amount} рублей</p>
          <p>Комментарий: {item.comment}</p>
        </Card>
      </List.Item>
    )}
  />
);

export default DebtHistory;
