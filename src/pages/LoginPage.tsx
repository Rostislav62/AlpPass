import React, { useState } from "react"; // Импорт React и хука useState
import { useNavigate } from "react-router-dom"; // Импорт useNavigate для перенаправления
import "../index.css"; // Импорт стилей

// Интерфейс пропсов для LoginPage
interface LoginPageProps {
    darkMode: boolean; // Пропс для тёмной темы
    toggleTheme: () => void; // Пропс для переключения темы
    onLogin: (email: string, name: string) => void; // Новый пропс для обновления состояния в App
}

// Компонент LoginPage
const LoginPage: React.FC<LoginPageProps> = ({ darkMode, toggleTheme, onLogin }) => {
    const [email, setEmail] = useState(""); // Состояние для ввода email
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Состояние для ошибки
    const [isChecking, setIsChecking] = useState(false); // Состояние для индикации проверки
    const navigate = useNavigate(); // Хук для навигации

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { // Обработчик изменения email
        setEmail(e.target.value); // Обновляем email в состоянии
    };

    const handleContinue = async () => { // Обработчик кнопки "Продолжить"
        setErrorMessage(null); // Сбрасываем сообщение об ошибке
        if (!email.trim()) { // Проверяем, введён ли email
            setErrorMessage("Введите email"); // Устанавливаем ошибку, если email пустой
            return;
        }

        setIsChecking(true); // Показываем, что идёт проверка
        const API_URL = process.env.REACT_APP_API_URL || "https://rostislav62.pythonanywhere.com"; // Базовый URL API
        try {
            const response = await fetch(`${API_URL}/api/auth/users/${email}/`); // Запрос к API
            const data = await response.json(); // Парсим ответ
            console.log("Login response:", data); // Логируем для отладки

            if (!response.ok) { // Если пользователь не найден
                setErrorMessage("Пользователь не найден. Зарегистрируйтесь."); // Устанавливаем ошибку
                return;
            }

            // Сохраняем данные в localStorage
            localStorage.setItem("user_id", data.id);
            localStorage.setItem("user_email", data.email);
            localStorage.setItem("user_first_name", data.first_name);
            localStorage.setItem("user_family_name", data.family_name);
            localStorage.setItem("user_father_name", data.father_name);
            localStorage.setItem("user_phone", data.phone);
            const fullName = `${data.first_name} ${data.family_name}`;
            localStorage.setItem("user_name", fullName);

            // Обновляем состояние в App через onLogin
            onLogin(data.email, fullName);

            navigate("/menu"); // Перенаправляем на страницу меню
        } catch (error) { // Обрабатываем ошибки сети
            console.error("Ошибка при проверке пользователя:", error); // Логируем ошибку
            setErrorMessage("Ошибка сети. Попробуйте позже."); // Устанавливаем сообщение
        } finally {
            setIsChecking(false); // Сбрасываем индикатор проверки
        }
    };

    const handleRegister = () => { // Обработчик кнопки "Зарегистрироваться"
        navigate("/register"); // Перенаправляем на страницу регистрации
    };

    return ( // JSX для рендеринга
        <div className={`welcome-container ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Контейнер с темой */}
            <h1 className="welcome-title">Добро пожаловать в AlpPass</h1> {/* Заголовок */}
            <p className="welcome-text">Введите email, чтобы продолжить, или зарегистрируйтесь</p> {/* Текст */}
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Сообщение об ошибке */}
            <div className="form-group"> {/* Группа формы */}
                <input
                    type="email" // Тип поля — email
                    placeholder="Введите email" // Подсказка
                    value={email} // Значение из состояния
                    onChange={handleChange} // Обработчик изменения
                    className="welcome-input" // Класс для стилей
                    required // Обязательное поле
                />
            </div>
            <div className="welcome-buttons"> {/* Контейнер кнопок */}
                <button
                    onClick={handleContinue} // Обработчик "Продолжить"
                    disabled={isChecking} // Блокируем кнопку во время проверки
                    className="welcome-btn continue" // Класс для стилей
                >
                    {isChecking ? "Проверка..." : "Продолжить"} {/* Текст кнопки */}
                </button>
                <button onClick={handleRegister} className="welcome-btn register"> {/* Кнопка регистрации */}
                    Зарегистрироваться
                </button>
            </div>
            <button onClick={toggleTheme} className="theme-btn"> {/* Кнопка смены темы */}
                {darkMode ? "Светлая тема" : "Тёмная тема"} {/* Текст кнопки */}
            </button>
        </div>
    );
};

export default LoginPage; // Экспорт компонента