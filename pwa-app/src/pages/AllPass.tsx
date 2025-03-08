import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

interface Pereval {
    id?: number; // Делаем id опциональным, если его нет
    pk?: number; // Добавляем pk как альтернативу
    beautyTitle: string;
    title: string;
    other_titles: string;
    connect: boolean;
    add_time: string;
    user: {
        id: number;
        family_name: string;
        first_name: string;
        father_name: string;
        phone: string;
        email: string;
    };
    coord: {
        id: number;
        latitude: number;
        longitude: number;
        height: number;
    };
    status: number;
    difficulties: { season: number; difficulty: number }[];
    images: { id: number; data: string; title: string }[];
}

interface AllPassProps {
    darkMode: boolean;
    toggleTheme: () => void;
}

const API_URL = "http://127.0.0.1:8000/api/submitData/list/";

const AllPass: React.FC<AllPassProps> = ({ darkMode, toggleTheme }) => {
    const [perevals, setPerevals] = useState<Pereval[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(API_URL)
            .then(response => response.json())
            .then((data: Pereval[]) => {
                console.log("📥 Полный ответ от /api/submitData/list/:", data);
                if (!Array.isArray(data)) {
                    setErrorMessage("Ошибка загрузки данных");
                    return;
                }
                // Выводим все поля первого объекта для отладки
                if (data.length > 0) {
                    console.log("Первый перевал:", data[0]);
                }
                setPerevals(data);
            })
            .catch(error => {
                console.error("Ошибка загрузки перевалов:", error);
                setErrorMessage("Ошибка сети. Попробуйте позже.");
            });
    }, []);

    const handleRowClick = (pereval: Pereval) => {
        const perevalId = pereval.id ?? pereval.pk; // Используем id или pk
        console.log("Клик по перевалу:", pereval.title, "ID:", perevalId);
        if (perevalId === undefined) {
            console.error("ID перевала не определён!");
            setErrorMessage("Ошибка: ID перевала отсутствует в данных");
            return;
        }
        navigate(`/pereval/${perevalId}`);
    };

    return (
        <div className={`allpass-container ${darkMode ? "dark-mode" : "light-mode"}`}>
            <h1 className="allpass-title">Все перевалы</h1>
            {errorMessage && (
                <p className="error-message">{errorMessage}</p>
            )}
            <div className="table-wrapper">
                <table className="pereval-table">
                    <thead>
                        <tr>
                            <th>Горный массив</th>
                            <th>Перевал</th>
                        </tr>
                    </thead>
                    <tbody>
                        {perevals.map((p, index) => (
                            <tr
                                key={`${(p.id ?? p.pk ?? index)}-${index}`} // Используем id, pk или index
                                className="pereval-row"
                                onClick={() => handleRowClick(p)}
                                style={{ cursor: "pointer" }}
                            >
                                <td>{p.beautyTitle}</td>
                                <td>{p.title}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={toggleTheme} className="theme-btn">
                {darkMode ? "Светлая тема" : "Тёмная тема"}
            </button>
        </div>
    );
};

export default AllPass;