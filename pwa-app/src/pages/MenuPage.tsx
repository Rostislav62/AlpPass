import { Link } from "react-router-dom";

function MenuPage() {
    return (
        <div>
            <h1>Меню</h1>
            <ul>
                <li><Link to="/submit">Новый перевал</Link></li>
                <li><Link to="/my-submits">Мои перевалы</Link></li>
                <li><Link to="/all-passes">Список всех перевалов</Link></li>
                <li><Link to="/profile">Личный кабинет</Link></li>
            </ul>
        </div>
    );
}

export default MenuPage;
