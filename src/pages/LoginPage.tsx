import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

interface LoginPageProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ darkMode, toggleTheme }) => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleContinue = async () => {
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage("Введите email");
      return;
    }

    setIsChecking(true);
    const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
    try {
      const response = await fetch(`${API_URL}/api/auth/users/${email}/`);
      const data = await response.json();

      if (!response.ok) {
        setIsRegistered(false);
        return;
      }

      localStorage.setItem("user_id", data.id);
      localStorage.setItem("user_email", data.email);
      localStorage.setItem("user_first_name", data.first_name);
      localStorage.setItem("user_family_name", data.family_name);
      localStorage.setItem("user_father_name", data.father_name);
      localStorage.setItem("user_phone", data.phone);
      localStorage.setItem("user_name", `${data.first_name} ${data.family_name}`);

      navigate("/menu");
    } catch (error) {
      console.error("Ошибка при проверке пользователя:", error);
      setErrorMessage("Ошибка сети. Попробуйте позже.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className={`welcome-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      <h1 className="welcome-title">Добро пожаловать в AlpPass</h1>
      <p className="welcome-text">Введите email, чтобы продолжить, или зарегистрируйтесь</p>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div className="form-group">
        <input
          type="email"
          placeholder="Введите email"
          value={email}
          onChange={handleChange}
          className="welcome-input"
          required
        />
      </div>
      <div className="welcome-buttons">
        {isRegistered === false ? (
          <button onClick={handleRegister} className="welcome-btn register">
            Зарегистрироваться
          </button>
        ) : (
          <button
            onClick={handleContinue}
            disabled={isChecking}
            className="welcome-btn continue"
          >
            {isChecking ? "Проверка..." : "Продолжить"}
          </button>
        )}
      </div>
      <button onClick={toggleTheme} className="theme-btn">
        {darkMode ? "Светлая тема" : "Тёмная тема"}
      </button>
    </div>
  );
};

export default LoginPage;