import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, message } from "antd";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Проверка наличия авторизационных данных в sessionStorage при загрузке компонента
    const savedUsername = sessionStorage.getItem("username");
    const savedPassword = sessionStorage.getItem("password");

    if (savedUsername && savedPassword) {
      navigate("/admin"); // Перенаправление, если пользователь уже авторизован
    }
  }, [navigate]);

  const handleLogin = () => {
    // Простой процесс логина, можно заменить на реальную авторизацию
    if (username === "1111" && password === "2222") {
      // Сохранение логина и пароля в sessionStorage
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("password", password);
      navigate("/admin");
    } else {
      message.error("Неверное имя пользователя или пароль");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        height: "100vh",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Вход администратора</h2>
      <Input
        placeholder="Имя пользователя"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          marginBottom: "10px",
          width: "300px",
          fontSize: "16px",
          padding: "10px",
        }}
      />
      <Input.Password
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          marginBottom: "20px",
          width: "300px",
          fontSize: "16px",
          padding: "10px",
        }}
      />
      <Button
        type="primary"
        onClick={handleLogin}
        style={{
          fontSize: "30px",
          padding: "25px 25px",
        }}
      >
        Войти
      </Button>
    </div>
  );
};

export default AdminLogin;
