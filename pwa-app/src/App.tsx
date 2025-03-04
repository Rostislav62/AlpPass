import React from "react";
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from "react-router-dom";
import MySubmits from "./pages/MySubmits"; // Страница с перевалами пользователя
import AllPass from "./pages/AllPass"; // Страница со всеми перевалами
import Submit from "./pages/Submit"; // Страница добавления перевала
import EditPereval from "./pages/EditPereval"; // Страница редактирования перевала
import UserRegister from "./pages/UserRegister"; // Страница регистрации
import WelcomePage from "./pages/WelcomePage"; // Главная страница
import Profile from "./pages/Profile"; // Страница личного кабинета
import MenuPage from "./pages/MenuPage"; // Страница меню

function MenuButton() {
    const location = useLocation(); // Получаем текущий маршрут
    if (location.pathname === "/") {
        return null; // Не рендерим кнопку на главной странице
    }
    return (
        <Link to="/menu" style={{ position: "absolute", top: 10, right: 10 }}>Меню</Link>
    );
}

function App() {
    const userName = localStorage.getItem("user_name") || "Гость";
    const userEmail = localStorage.getItem("user_email") || "Нет email";

    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <h1>{userName}</h1>
                    <p>{userEmail}</p>
                </header>
                <MenuButton /> {/* Кнопка "Меню" теперь корректно рендерится */}
                <Routes>
                    <Route path="/" element={<WelcomePage />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/my-submits" element={<MySubmits />} />
                    <Route path="/all-passes" element={<AllPass />} />
                    <Route path="/submit" element={<Submit />} />
                    <Route path="/edit/:id" element={<EditPereval />} />
                    <Route path="/register" element={<UserRegister />} />
                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
