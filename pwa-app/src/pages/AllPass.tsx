import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/submitData/list/";

interface Pereval {
    id: number;
    beautyTitle: string;
    title: string;
    user?: {
        email: string;
    };
    status: number;
}

function AllPass() {
    const [perevals, setPerevals] = useState<Pereval[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        fetch(API_URL)
            .then(response => response.json())
            .then((data: Pereval[]) => {
                console.log("📥 API ответ:", data); // Логируем API-ответ
                if (!Array.isArray(data)) {
                    setErrorMessage("Ошибка загрузки данных");
                    return;
                }
                setPerevals(data);
            })
            .catch(error => {
                console.error("Ошибка загрузки перевалов:", error);
                setErrorMessage("Ошибка сети. Попробуйте позже.");
            });
    }, []);

    return (
        <div>
            <h1>Все перевалы</h1>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <table style={{ border: "1px solid black" }}>
                <thead>
                    <tr>
                        <th>Горный масив</th>
                        <th>Перевал</th>
                        <th>Email</th>
                        <th>Статус</th>
                    </tr>
                </thead>
                <tbody>
                    {perevals.map((p, index) => (
                        <tr key={`${p.id}-${index}`}>
                            <td>{p.beautyTitle}</td>
                            <td>{p.title}</td>
                            <td>{p.user?.email || "Нет данных"}</td>
                            <td>{p.status === 1 ? "new" : "Обработан"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AllPass;
