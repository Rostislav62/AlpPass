import React, { useState, useEffect } from "react"; // Импорт React и хуков
import { BrowserRouter as Router, Route, Routes, Link, useLocation, Navigate } from "react-router-dom"; // Импорт маршрутизации и Navigate
import MySubmits from "./pages/MySubmits"; // Импорт MySubmits
import AllPass from "./pages/AllPass"; // Импорт AllPass
import Submit from "./pages/Submit"; // Импорт Submit
import EditPereval from "./pages/EditPereval"; // Импорт EditPereval
import UserRegister from "./pages/UserRegister"; // Импорт UserRegister
import HomePage from "./pages/HomePage"; // Импорт HomePage
import Profile from "./pages/Profile"; // Импорт Profile
import MenuPage from "./pages/MenuPage"; // Импорт MenuPage
import LoginPage from "./pages/LoginPage"; // Импорт LoginPage
import UploadPhotos from "./pages/UploadPhotos"; // Импорт UploadPhotos
import PerevalDetail from "./pages/PerevalDetail"; // Импорт PerevalDetail
import EditPhotos from "./pages/EditPhotos"; // Импорт EditPhotos
import "./index.css"; // Импорт стилей

// Компонент MenuButton
function MenuButton() {
    const location = useLocation(); // Хук для текущего маршрута
    if (location.pathname === "/" || location.pathname === "/menu") { // Если на главной или меню
        return null; // Скрываем кнопку
    }
    return (
        <Link to="/menu" className="menu-btn"> {/* Ссылка на меню */}
            Меню
        </Link>
    );
}

// Главный компонент App
function App() {
    const [darkMode, setDarkMode] = useState(false); // Состояние для тёмной темы
    const [userName, setUserName] = useState(localStorage.getItem("user_name") || "Гость"); // Состояние для имени
    const [userEmail, setUserEmail] = useState(localStorage.getItem("user_email") || "Нет email"); // Состояние для email

    useEffect(() => { // Хук для инициализации темы
        const savedTheme = localStorage.getItem("theme"); // Читаем сохранённую тему
        if (savedTheme === "dark") { // Если тёмная
            setDarkMode(true); // Устанавливаем тёмную тему
        }

        // Слушаем изменения localStorage
        const handleStorageChange = () => {
            setUserName(localStorage.getItem("user_name") || "Гость"); // Обновляем имя
            setUserEmail(localStorage.getItem("user_email") || "Нет email"); // Обновляем email
        };

        window.addEventListener("storage", handleStorageChange); // Добавляем слушатель изменений localStorage
        return () => window.removeEventListener("storage", handleStorageChange); // Убираем слушатель при размонтировании
    }, []); // Пустой массив — эффект только при монтировании

    const toggleTheme = () => { // Функция переключения темы
        const newTheme = darkMode ? "light" : "dark"; // Новая тема
        setDarkMode(!darkMode); // Переключаем состояние
        localStorage.setItem("theme", newTheme); // Сохраняем в localStorage
    };

    return ( // JSX структура приложения
        <Router> {/* Обёртка маршрутизации */}
            <div className={`App ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Контейнер с темой */}
                <header className="App-header"> {/* Заголовок */}
                    <div className="user-info"> {/* Информация о пользователе */}
                        <span>{userName}</span> {/* Отображаем имя */}
                        <span>{userEmail}</span> {/* Отображаем email */}
                    </div>
                    <MenuButton /> {/* Кнопка меню */}
                </header>
                <Routes> {/* Маршруты */}
                    <Route path="/" element={<HomePage darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/login" element={<LoginPage darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/register" element={<UserRegister darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/menu" element={<MenuPage darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/my-submits" element={userEmail !== "Нет email" ? <MySubmits darkMode={darkMode} toggleTheme={toggleTheme} /> : <Navigate to="/" />} />
                    <Route path="/all-passes" element={<AllPass darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/submit" element={<Submit darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/edit/:id" element={<EditPereval darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/profile" element={userEmail !== "Нет email" ? <Profile darkMode={darkMode} toggleTheme={toggleTheme} /> : <Navigate to="/" />} />
                    <Route path="/add-images/:perevalId" element={<UploadPhotos darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/edit-photos/:id" element={<EditPhotos darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/pereval/:id" element={<PerevalDetail darkMode={darkMode} toggleTheme={toggleTheme} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App; // Экспорт компонента