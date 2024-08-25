import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, message } from "antd";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Простой процесс логина, можно заменить на реальную авторизацию
    if (username === "admin" && password === "admin") {
      navigate("/admin");
    } else {
      message.error("Неверное имя пользователя или пароль");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Вход администратора</h2>
      <Input
        placeholder="Имя пользователя"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ marginBottom: "10px" }}
      />
      <Input.Password
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: "20px" }}
      />
      <Button type="primary" onClick={handleLogin}>
        Войти
      </Button>
    </div>
  );
};

export default AdminLogin;
