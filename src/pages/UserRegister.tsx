import React, { useState } from "react"; /* Импорт React и хуков для состояния и эффектов (useEffect убран, так как больше не нужен) */
import { useNavigate, Link } from "react-router-dom"; /* Импорт хуков для навигации и ссылок */
import "../index.css"; /* Импорт глобальных стилей из index.css */

/* Интерфейс пропсов для компонента UserRegister */
interface UserRegisterProps {
    darkMode: boolean; /* Пропс для текущей темы (true - тёмная, false - светлая) */
    toggleTheme: () => void; /* Пропс для переключения темы */
}

/* Интерфейс данных формы регистрации */
interface FormData {
    family_name: string; /* Фамилия */
    first_name: string; /* Имя */
    father_name: string; /* Отчество */
    phone: string; /* Телефон */
    email: string; /* Email */
}

/* Константа с URL API для регистрации */
const API_URL = "https://rostislav62.pythonanywhere.com/api/auth/register/"; //"http://127.0.0.1:8000/api/auth/register/";

/* Определение компонента UserRegister с использованием пропсов */
const UserRegister: React.FC<UserRegisterProps> = ({ darkMode, toggleTheme }) => {
    const navigate = useNavigate(); /* Хук для программной навигации */
    const [formData, setFormData] = useState<FormData>({ /* Состояние формы */
        family_name: "", /* Изначально пустая фамилия */
        first_name: "", /* Изначально пустое имя */
        father_name: "", /* Изначально пустое отчество */
        phone: "", /* Изначально пустой телефон */
        email: "" /* Изначально пустой email */
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null); /* Состояние для сообщения об ошибке */
    const [successMessage, setSuccessMessage] = useState<string | null>(null); /* Состояние для сообщения об успехе */
    const [isSubmitting, setIsSubmitting] = useState(false); /* Состояние для отслеживания отправки формы */

    /* Убран useEffect, который перенаправлял на /menu при наличии user_email в localStorage */
    /* Теперь страница регистрации доступна всем пользователям, независимо от авторизации */
    /* Перенаправление на /menu оставлено только после успешной регистрации в handleSubmit */

    /* Обработчик изменения полей формы */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target; /* Извлечение имени и значения из события */
        setFormData(prev => ({
            ...prev, /* Копирование предыдущих данных */
            [name]: value /* Обновление изменённого поля */
        }));
    };

    /* Обработчик отправки формы */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); /* Предотвращение стандартной отправки формы */
        setErrorMessage(null); /* Сброс ошибки */
        setSuccessMessage(null); /* Сброс сообщения об успехе */

        /* Проверка заполненности обязательных полей */
        if (!formData.family_name.trim() || !formData.first_name.trim() ||
            !formData.phone.trim() || !formData.email.trim()) {
            setErrorMessage("❌ Все обязательные поля должны быть заполнены!"); /* Установка ошибки */
            return; /* Прерывание выполнения */
        }

        setIsSubmitting(true); /* Установка состояния отправки */
        const userData: any = { /* Подготовка данных для отправки */
            family_name: formData.family_name.trim(), /* Обрезка пробелов */
            first_name: formData.first_name.trim(), /* Обрезка пробелов */
            phone: formData.phone.trim(), /* Обрезка пробелов */
            email: formData.email.trim() /* Обрезка пробелов */
        };

        if (formData.father_name.trim()) { /* Добавление отчества, если оно заполнено */
            userData.father_name = formData.father_name.trim(); /* Обрезка пробелов */
        }

        try {
            const response = await fetch(API_URL, { /* Отправка POST-запроса */
                method: "POST", /* Метод запроса */
                headers: { "Content-Type": "application/json" }, /* Заголовок типа данных */
                body: JSON.stringify(userData) /* Преобразование данных в JSON */
            });

            const data = await response.json(); /* Получение ответа сервера */
            if (!response.ok) { /* Проверка на ошибки */
                setErrorMessage(`❌ Ошибка: ${data.message || "Неизвестная ошибка"}`); /* Установка сообщения об ошибке */
                return; /* Прерывание выполнения */
            }

            setSuccessMessage("✅ Пользователь успешно зарегистрирован!"); /* Установка сообщения об успехе */
            localStorage.setItem("user_id", data.user_id); /* Сохранение ID пользователя */
            localStorage.setItem("user_email", formData.email); /* Сохранение email */
            localStorage.setItem("user_name", `${formData.first_name} ${formData.family_name}`); /* Сохранение имени */
            navigate("/menu"); /* Перенаправление на страницу меню */
        } catch (error) {
            setErrorMessage("Ошибка сети. Проверьте подключение."); /* Установка ошибки сети */
        } finally {
            setIsSubmitting(false); /* Сброс состояния отправки */
        }
    };

    return ( /* Возврат JSX структуры компонента */
        <div className={`register-container ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Главный контейнер с динамическим классом темы */}
            <nav className="register-nav"> {/* Навигация */}
                <Link to="/menu" className="register-link">На главную</Link> {/* Ссылка на главную страницу */}
            </nav>
            <h1 className="register-title">Регистрация пользователя</h1> {/* Заголовок страницы */}
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Сообщение об ошибке */}
            {successMessage && <p className="success-message">{successMessage}</p>} {/* Сообщение об успехе */}
            <form onSubmit={handleSubmit} className="register-form"> {/* Форма с обработчиком отправки */}
                <div className="form-group"> {/* Группа поля ввода */}
                    <label htmlFor="family_name">Фамилия:</label> {/* Метка поля */}
                    <input
                        type="text"
                        id="family_name"
                        name="family_name"
                        value={formData.family_name}
                        onChange={handleChange}
                        className="register-input"
                        required /* Обязательное поле */
                    /> {/* Поле ввода фамилии */}
                </div>
                <div className="form-group"> {/* Группа поля ввода */}
                    <label htmlFor="first_name">Имя:</label> {/* Метка поля */}
                    <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="register-input"
                        required /* Обязательное поле */
                    /> {/* Поле ввода имени */}
                </div>
                <div className="form-group"> {/* Группа поля ввода */}
                    <label htmlFor="father_name">Отчество:</label> {/* Метка поля */}
                    <input
                        type="text"
                        id="father_name"
                        name="father_name"
                        value={formData.father_name}
                        onChange={handleChange}
                        className="register-input"
                    /> {/* Поле ввода отчества */}
                </div>
                <div className="form-group"> {/* Группа поля ввода */}
                    <label htmlFor="phone">Телефон:</label> {/* Метка поля */}
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="register-input"
                        required /* Обязательное поле */
                    /> {/* Поле ввода телефона */}
                </div>
                <div className="form-group"> {/* Группа поля ввода */}
                    <label htmlFor="email">Email:</label> {/* Метка поля */}
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="register-input"
                        required /* Обязательное поле */
                    /> {/* Поле ввода email */}
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="register-btn"
                > {/* Кнопка отправки формы */}
                    {isSubmitting ? "Сохранение..." : "Сохранить"} {/* Условный текст кнопки */}
                </button>
            </form> {/* Закрывающий тег формы */}
            <button onClick={toggleTheme} className="theme-btn"> {/* Кнопка переключения темы */}
                {darkMode ? "Светлая тема" : "Тёмная тема"} {/* Условный текст кнопки */}
            </button> {/* Закрывающий тег кнопки переключения темы */}
        </div> /* Закрывающий тег главного контейнера */
    ); /* Конец возвращаемого JSX */
};

export default UserRegister; /* Экспорт компонента */