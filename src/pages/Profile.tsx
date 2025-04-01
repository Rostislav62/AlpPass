import React, { useEffect, useState } from "react"; // Импорт React и хуков для эффектов и состояния

// Интерфейс пропсов для компонента Profile
interface ProfileProps {
    darkMode: boolean; // Пропс для тёмной темы
    toggleTheme: () => void; // Пропс для переключения темы
}

// Компонент Profile
const Profile: React.FC<ProfileProps> = ({ darkMode, toggleTheme }) => {
    const [userData, setUserData] = useState(null); // Состояние для хранения данных пользователя, изначально null
    const userEmail = localStorage.getItem("user_email"); // Получаем email из localStorage
    const API_URL = process.env.REACT_APP_API_URL || "https://rostislav62.pythonanywhere.com"; // Базовый URL API, из окружения или дефолтный

    useEffect(() => { // Хук для выполнения запроса при монтировании или изменении userEmail
        if (!userEmail) { // Если email отсутствует
            console.log("No user logged in, skipping profile fetch"); // Логируем, что пользователь не авторизован
            return; // Прерываем выполнение эффекта
        }

        fetch(`${API_URL}/api/auth/users/${userEmail}/`) // Выполняем GET-запрос к API
            .then(response => { // Обрабатываем ответ
                if (!response.ok) { // Если ответ не успешный (не 200)
                    throw new Error(`HTTP error! Status: ${response.status}`); // Бросаем ошибку с кодом статуса
                }
                return response.json(); // Парсим JSON из ответа
            })
            .then(data => { // Обрабатываем полученные данные
                console.log("Profile data:", data); // Логируем данные для отладки
                setUserData(data); // Сохраняем данные в состояние
            })
            .catch(error => console.error("Error fetching profile:", error)); // Логируем ошибку, если что-то пошло не так
    }, [userEmail]); // Зависимость от userEmail — эффект срабатывает при его изменении

    if (!userEmail) { // Если email нет (пользователь не авторизован)
        return <div>Пожалуйста, войдите в систему</div>; // Показываем сообщение вместо профиля
    }

    return ( // JSX для рендеринга компонента
        <div className={`profile ${darkMode ? "dark-mode" : "light-mode"}`}> // Контейнер с динамической темой
            <h1>Профиль</h1> // Заголовок страницы
            {userData ? ( // Если данные пользователя загружены
                <div>
                    <p>Email: {userEmail}</p> // Отображаем email
                    {/* Добавь другие поля из userData, если они есть */}
                </div>
            ) : (
                <p>Загрузка...</p> // Показываем "Загрузка", пока данные не пришли
            )}
        </div>
    );
};

export default Profile; // Экспортируем компонент