import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/auth/users/";
const userEmail = localStorage.getItem("user_email");

interface Pereval {
    id: number;
    title: string;
    status: number;
}

function MySubmits() {
    const [perevals, setPerevals] = useState<Pereval[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!userEmail) {
            setErrorMessage("Ошибка: Email не найден. Авторизуйтесь заново.");
            return;
        }

        fetch(`${API_URL}${userEmail}/submits/?nocache=${new Date().getTime()}`)
            .then(async response => {
                const data = await response.json();
                console.log("📥 Ответ API:", data);

                if (!response.ok) {
                    throw new Error(data.message || "Ошибка сервера");
                }

                if (!data || typeof data !== "object" || !Array.isArray(data.data)) {
                    setErrorMessage("Ошибка: Сервер вернул некорректные данные.");
                    return;
                }
                setPerevals(data.data);
            })
            .catch(error => {
                console.error("Ошибка загрузки перевалов:", error);
                setErrorMessage("Ошибка сети. Проверьте подключение.");
            });
    }, []);

    return (
        <div>
            <h1>Мои перевалы</h1>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <table style={{ border: "1px solid black" }}>
                <thead>
                    <tr>
                        <th>Название</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {perevals.map((p) => (
                        <tr key={p.id}>
                            <td>{p.title}</td>
                            <td>{p.status === 1 ? "new" : "Обработан"}</td>
                            <td>
                                {p.status === 1 && (
                                    <a href={`/edit/${p.id}`} style={{ color: "blue" }}>Редактировать</a>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default MySubmits;
