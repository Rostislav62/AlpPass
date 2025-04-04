import React, { useEffect, useState } from "react"; // Импорт React и хуков
import "../index.css"; // Импорт стилей

// Интерфейс пропсов для Profile
interface ProfileProps {
    darkMode: boolean; // Пропс для тёмной темы
    toggleTheme: () => void; // Пропс для переключения темы
}

// Интерфейс данных пользователя
interface UserData {
    id: string; // ID пользователя
    email: string; // Email
    first_name: string; // Имя
    family_name: string; // Фамилия
    father_name: string; // Отчество
    phone: string; // Телефон
}

// Компонент Profile
const Profile: React.FC<ProfileProps> = ({ darkMode, toggleTheme }) => {
    const [userData, setUserData] = useState<UserData | null>(null); // Состояние для данных пользователя
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Состояние для ошибки
    const userEmail = localStorage.getItem("user_email"); // Получаем email из localStorage
    const API_URL = process.env.REACT_APP_API_URL || "https://rostislav62.pythonanywhere.com"; // Базовый URL API

    useEffect(() => { // Хук для загрузки данных при монтировании
        if (!userEmail) { // Если email нет
            console.log("No user logged in, skipping profile fetch"); // Логируем отсутствие авторизации
            return; // Прерываем эффект
        }

        fetch(`${API_URL}/api/auth/users/${userEmail}/`) // Запрос к API
            .then(response => { // Обрабатываем ответ
                if (!response.ok) { // Если не 200
                    throw new Error(`HTTP error! Status: ${response.status}`); // Бросаем ошибку
                }
                return response.json(); // Парсим JSON
            })
            .then(data => { // Обрабатываем данные
                console.log("Profile data:", data); // Логируем для отладки
                setUserData(data); // Устанавливаем данные в состояние
            })
            .catch(error => { // Обрабатываем ошибки
                console.error("Error fetching profile:", error); // Логируем ошибку
                setErrorMessage("Ошибка загрузки данных профиля"); // Устанавливаем сообщение
            });
    }, [userEmail, API_URL]); // Зависимости useEffect

    if (!userEmail) { // Если email нет
        return <div>Пожалуйста, войдите в систему</div>; // Показываем сообщение
    }

    return ( // JSX для рендеринга
        <div className={`profile-container ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Контейнер с темой */}
            <h1 className="profile-title">Личный кабинет</h1> {/* Заголовок */}
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Сообщение об ошибке */}
            {userData ? ( // Если данные загружены
                <div className="profile-info"> {/* Бокс с информацией */}
                    <div className="profile-item"> {/* Элемент профиля */}
                        <span className="profile-label">Email:</span> {/* Метка */}
                        <span>{userData.email}</span> {/* Значение */}
                    </div>
                    <div className="profile-item"> {/* Элемент профиля */}
                        <span className="profile-label">Имя:</span> {/* Метка */}
                        <span>{userData.first_name}</span> {/* Значение */}
                    </div>
                    <div className="profile-item"> {/* Элемент профиля */}
                        <span className="profile-label">Фамилия:</span> {/* Метка */}
                        <span>{userData.family_name}</span> {/* Значение */}
                    </div>
                    <div className="profile-item"> {/* Элемент профиля */}
                        <span className="profile-label">Отчество:</span> {/* Метка */}
                        <span>{userData.father_name}</span> {/* Значение */}
                    </div>
                    <div className="profile-item"> {/* Элемент профиля */}
                        <span className="profile-label">Телефон:</span> {/* Метка */}
                        <span>{userData.phone}</span> {/* Значение */}
                    </div>
                </div>
            ) : (
                <p>Загрузка...</p> // Показываем "Загрузка"
            )}
            <button onClick={toggleTheme} className="theme-btn"> {/* Кнопка смены темы */}
                {darkMode ? "Светлая тема" : "Тёмная тема"} {/* Текст кнопки */}
            </button>
        </div>
    );
};

export default Profile; // Экспорт компонента