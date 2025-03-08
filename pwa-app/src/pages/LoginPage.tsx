import React, { useState } from "react"; /* Импорт React и хука useState для состояния */
import { useNavigate } from "react-router-dom"; /* Импорт хука useNavigate для навигации */
import "../index.css"; /* Импорт глобальных стилей из index.css */

/* Интерфейс пропсов для компонента LoginPage */
interface LoginPageProps {
    darkMode: boolean; /* Пропс для текущей темы (true - тёмная, false - светлая) */
    toggleTheme: () => void; /* Пропс для переключения темы */
}

/* Константа с URL API для проверки пользователей */
const API_URL = "http://127.0.0.1:8000/api/auth/users/";

/* Определение компонента LoginPage с использованием пропсов */
const LoginPage: React.FC<LoginPageProps> = ({ darkMode, toggleTheme }) => {
    const [email, setEmail] = useState(""); /* Состояние для хранения email */
    const [errorMessage, setErrorMessage] = useState<string | null>(null); /* Состояние для сообщения об ошибке */
    const [isChecking, setIsChecking] = useState(false); /* Состояние для отслеживания процесса проверки */
    const [isRegistered, setIsRegistered] = useState<boolean | null>(null); /* Состояние для статуса регистрации */
    const navigate = useNavigate(); /* Хук для программной навигации */

    /* Обработчик изменения поля email */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value); /* Обновление значения email */
    };

    /* Обработчик кнопки "Продолжить" */
    const handleContinue = async () => {
        setErrorMessage(null); /* Сброс сообщения об ошибке */
        if (!email.trim()) { /* Проверка, заполнен ли email */
            setErrorMessage("Введите email"); /* Установка ошибки */
            return; /* Прерывание выполнения */
        }

        setIsChecking(true); /* Установка состояния проверки */
        try {
            const response = await fetch(`${API_URL}${email}/`); /* Запрос к API для проверки пользователя */
            const data = await response.json(); /* Получение ответа сервера */

            if (!response.ok) { /* Если пользователь не найден */
                setIsRegistered(false); /* Установка статуса "не зарегистрирован" */
                return; /* Прерывание выполнения */
            }

            /* Сохранение данных пользователя в localStorage */
            localStorage.setItem("user_id", data.id); /* Сохранение ID */
            localStorage.setItem("user_email", data.email); /* Сохранение email */
            localStorage.setItem("user_first_name", data.first_name); /* Сохранение имени */
            localStorage.setItem("user_family_name", data.family_name); /* Сохранение фамилии */
            localStorage.setItem("user_father_name", data.father_name); /* Сохранение Отчества */
            localStorage.setItem("user_phone", data.phone); /* Сохранение телефона */
            localStorage.setItem("user_name", `${data.first_name} ${data.family_name}`); /* Сохранение полного имени (опционально) */

            navigate("/menu"); /* Перенаправление на страницу меню */
        } catch (error) {
            console.error("Ошибка при проверке пользователя:", error); /* Логирование ошибки */
            setErrorMessage("Ошибка сети. Попробуйте позже."); /* Установка сообщения об ошибке */
        } finally {
            setIsChecking(false); /* Сброс состояния проверки */
        }
    };

    /* Обработчик кнопки "Зарегистрироваться" */
    const handleRegister = () => {
        navigate("/register"); /* Перенаправление на страницу регистрации */
    };

    return ( /* Возврат JSX структуры компонента */
        <div className={`welcome-container ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Главный контейнер с динамическим классом темы */}
            <h1 className="welcome-title">Добро пожаловать в AlpPass</h1> {/* Заголовок страницы */}
            <p className="welcome-text">Введите email, чтобы продолжить, или зарегистрируйтесь</p> {/* Подзаголовок */}
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Сообщение об ошибке */}
            <div className="form-group"> {/* Группа поля ввода */}
                <input
                    type="email"
                    placeholder="Введите email"
                    value={email}
                    onChange={handleChange}
                    className="welcome-input"
                    required /* Обязательное поле */
                /> {/* Поле ввода email */}
            </div>
            <div className="welcome-buttons"> {/* Контейнер для кнопок */}
                {isRegistered === false ? ( /* Условный рендеринг кнопки регистрации */
                    <button onClick={handleRegister} className="welcome-btn register">
                        Зарегистрироваться
                    </button>
                ) : ( /* Условный рендеринг кнопки продолжения */
                    <button
                        onClick={handleContinue}
                        disabled={isChecking}
                        className="welcome-btn continue"
                    >
                        {isChecking ? "Проверка..." : "Продолжить"} {/* Условный текст кнопки */}
                    </button>
                )}
            </div>
            <button onClick={toggleTheme} className="theme-btn"> {/* Кнопка переключения темы */}
                {darkMode ? "Светлая тема" : "Тёмная тема"} {/* Условный текст кнопки */}
            </button> {/* Закрывающий тег кнопки переключения темы */}
        </div> /* Закрывающий тег главного контейнера */
    ); /* Конец возвращаемого JSX */
};

export default LoginPage; /* Экспорт компонента */