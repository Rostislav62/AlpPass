import React, { useEffect, useState } from "react"; /* Импорт React и хуков useState, useEffect для управления состоянием и эффектами */
import "../index.css"; /* Импорт глобальных стилей из файла index.css */

/* Определение интерфейса пропсов для компонента Profile */
interface ProfileProps {
    darkMode: boolean; /* Пропс darkMode для указания текущей темы (true - тёмная, false - светлая) */
    toggleTheme: () => void; /* Пропс toggleTheme для переключения темы */
}

/* Определение интерфейса данных пользователя */
interface UserData {
    family_name: string; /* Фамилия пользователя */
    first_name: string; /* Имя пользователя */
    father_name: string; /* Отчество пользователя */
    phone: string; /* Телефон пользователя */
    email: string; /* Email пользователя */
}

/* Получение email пользователя из localStorage */
const userEmail = localStorage.getItem("user_email");

/* Константа с URL API для получения данных пользователя */
// const API_URL = "http://127.0.0.1:8000/api/auth/users/";
const API_URL = process.env.REACT_APP_API_URL || "https://rostislav62.pythonanywhere.com"; //"http://127.0.0.1:8000";
fetch(`${API_URL}/api/auth/users/${userEmail}/`);



/* Определение компонента Profile как функционального компонента с использованием интерфейса пропсов */
const Profile: React.FC<ProfileProps> = ({ darkMode, toggleTheme }) => {
    const [userData, setUserData] = useState<UserData>({ /* Состояние для хранения данных пользователя */
        family_name: "", /* Изначально пустая фамилия */
        first_name: "", /* Изначально пустое имя */
        father_name: "", /* Изначально пустое отчество */
        phone: "", /* Изначально пустой телефон */
        email: "" /* Изначально пустой email */
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null); /* Состояние для хранения сообщения об ошибке, изначально null */

    useEffect(() => { /* Использование хука useEffect для выполнения запроса к API при монтировании компонента */
        if (!userEmail) { /* Проверка наличия email в localStorage */
            setErrorMessage("Email пользователя не найден. Авторизуйтесь заново."); /* Установка сообщения об ошибке, если email отсутствует */
            return; /* Прерывание выполнения */
        }

        fetch(`${API_URL}${userEmail}/`) /* Выполнение GET-запроса к API с email пользователя */
            .then(response => response.json()) /* Преобразование ответа в JSON */
            .then(data => { /* Обработка полученных данных */
                if (data.email) { /* Проверка наличия email в ответе */
                    setUserData(data); /* Установка данных пользователя в состояние */
                } else {
                    setErrorMessage("Ошибка загрузки данных пользователя."); /* Установка сообщения об ошибке, если данные некорректны */
                }
            })
            .catch(error => { /* Обработка ошибок запроса */
                console.error("Ошибка загрузки пользователя:", error); /* Логирование ошибки в консоль */
                setErrorMessage("Ошибка сети. Попробуйте позже."); /* Установка сообщения об ошибке для пользователя */
            });
    }, []); /* Пустой массив зависимостей, чтобы эффект сработал только при монтировании */

    return ( /* Возврат JSX структуры компонента */
        <div className={`profile-container ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Главный контейнер с динамическим классом темы */}
            <h1 className="profile-title">Личный кабинет</h1> {/* Заголовок страницы с классом для стилизации */}
            {errorMessage && ( /* Условный рендеринг сообщения об ошибке, если оно есть */
                <p className="error-message">{errorMessage}</p> /* Текст ошибки с классом для стилизации */
            )}
            <div className="profile-info"> {/* Контейнер для информации о пользователе */}
                <p className="profile-item"><span className="profile-label">Фамилия:</span> {userData.family_name}</p> {/* Пункт с фамилией */}
                <p className="profile-item"><span className="profile-label">Имя:</span> {userData.first_name}</p> {/* Пункт с именем */}
                <p className="profile-item"><span className="profile-label">Отчество:</span> {userData.father_name}</p> {/* Пункт с отчеством */}
                <p className="profile-item"><span className="profile-label">Телефон:</span> {userData.phone}</p> {/* Пункт с телефоном */}
                <p className="profile-item"><span className="profile-label">Email:</span> {userData.email}</p> {/* Пункт с email */}
            </div> {/* Закрывающий тег контейнера информации */}
            <button disabled className="edit-btn">Редактировать</button> {/* Кнопка редактирования, пока отключена */}
            <button onClick={toggleTheme} className="theme-btn"> {/* Кнопка переключения темы с обработчиком onClick */}
                {darkMode ? "Светлая тема" : "Тёмная тема"} {/* Условный текст кнопки в зависимости от darkMode */}
            </button> {/* Закрывающий тег кнопки переключения темы */}
        </div> /* Закрывающий тег главного контейнера */
    ); /* Конец возвращаемого JSX */
};

export default Profile; /* Экспорт компонента Profile как основного */