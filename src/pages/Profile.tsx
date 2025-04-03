import React, { useEffect, useState } from "react"; // Импорт React и хуков для эффектов и состояния

// Интерфейс пропсов для компонента Profile
interface ProfileProps {
    darkMode: boolean; // Пропс для тёмной темы
    toggleTheme: () => void; // Пропс для переключения темы
}

// Компонент Profile
const Profile: React.FC<ProfileProps> = ({ darkMode, toggleTheme }) => {
    const [userData, setUserData] = useState(null); // Состояние для данных пользователя, изначально null
    const userEmail = localStorage.getItem("user_email"); // Получаем email из localStorage
    const API_URL = process.env.REACT_APP_API_URL || "https://rostislav62.pythonanywhere.com"; // Базовый URL API

    useEffect(() => { // Хук для выполнения запроса при монтировании или изменении userEmail
        if (!userEmail) { // Если email нет
            console.log("No user logged in, skipping profile fetch"); // Логируем отсутствие авторизации
            return; // Прерываем эффект
        }

        fetch(`${API_URL}/api/auth/users/${userEmail}/`) // Выполняем GET-запрос
            .then(response => { // Обрабатываем ответ
                if (!response.ok) { // Если ответ не 200
                    throw new Error(`HTTP error! Status: ${response.status}`); // Бросаем ошибку
                }
                return response.json(); // Парсим JSON
            })
            .then(data => { // Обрабатываем данные
                console.log("Profile data:", data); // Логируем данные
                setUserData(data); // Сохраняем в состояние
            })
            .catch(error => console.error("Error fetching profile:", error)); // Логируем ошибку
    }, [userEmail, API_URL]); // Добавили API_URL в зависимости

    if (!userEmail) { // Если email нет
        return <div>Пожалуйста, войдите в систему</div>; // Показываем сообщение
    }

    return ( // JSX для рендеринга
        <div className={`profile ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Контейнер с темой */}
            <h1>Профиль</h1> {/* Заголовок */}
            {userData ? ( // Если данные загружены
                <div>
                    <p>Email: {userEmail}</p> {/* Показываем email */}
                    {/* Другие поля из userData */}
                </div>
            ) : (
                <p>Загрузка...</p> // Показываем "Загрузка"
            )}
        </div>
    );
};

export default Profile; // Экспорт компонента