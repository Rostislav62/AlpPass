import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api/submitData/";

interface PerevalData {
    beautyTitle: string;
    title: string;
    other_titles: string;
    coord: {
        latitude: number;
        longitude: number;
        height: number;
    };
    user: {
        email: string;
        phone: string;
    };
    status: number;
}

function EditPereval() {
    const { id } = useParams();
    const [formData, setFormData] = useState<PerevalData | null>(null);
    const userEmail = localStorage.getItem("user_email") || "";
    const userPhone = localStorage.getItem("user_phone") || "";

    useEffect(() => {
        console.log("🔍 Проверяем ID перевала:", id);  // ← Покажет, что передаётся в `id`
        if (!id) {
            console.error("❌ Ошибка: ID перевала отсутствует!");
            alert("Ошибка: невозможно загрузить перевал без ID.");
            return;
        }

        fetch(`${API_URL}${id}/info/`)
            .then(async response => {
                const text = await response.text();
                console.log("📥 Ответ от сервера:", text);
                try {
                    return JSON.parse(text);
                } catch (error) {
                    console.error("❌ Ошибка парсинга JSON:", text);
                    throw new Error("Сервер вернул не JSON-ответ");
                }
            })
            .then((data: PerevalData) => {
                if (
                    data.status === 1 &&
                    data.user.email.trim().toLowerCase() === userEmail.trim().toLowerCase() &&
                    data.user.phone.replace(/\s+/g, '') === userPhone.replace(/\s+/g, '')
                ) {
                    setFormData({ ...data });
                } else {
                    alert("Редактирование запрещено! Либо статус не new, либо данные пользователя не совпадают.");
                }
            })
            .catch(error => console.error("Ошибка загрузки перевала:", error));
    }, [id, userEmail, userPhone]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formData) return;
        const { name, value } = e.target;

        setFormData(prev => ({
            ...(prev as PerevalData),
            [name]: value
        }));
    };

    const handleCoordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formData) return;
        const { name, value } = e.target;

        setFormData(prev => {
            if (!prev) return prev; // Проверка на null

            return {
                ...prev,
                coord: {
                    ...prev.coord,
                    [name]: Number(value)
                }
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        try {
            const response = await fetch(`${API_URL}${id}/update/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.ok) {
                alert("✅ Перевал успешно обновлён!");
            } else {
                alert(`Ошибка: ${JSON.stringify(data)}`);
            }
        } catch (error) {
            console.error("❌ Ошибка при редактировании:", error);
            alert("Ошибка при редактировании перевала.");
        }
    };

    if (!formData) return <p>Загрузка...</p>;

    return (
        <div>
            <h1>Редактировать перевал</h1>
            <form onSubmit={handleSubmit}>
                <label>Название перевала:</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required />

                <label>Красивое название:</label>
                <input type="text" name="beautyTitle" value={formData.beautyTitle} onChange={handleChange} required />

                <h2>Координаты</h2>
                <label>Широта:</label>
                <input type="number" name="latitude" value={formData.coord.latitude} onChange={handleCoordChange} required />

                <label>Долгота:</label>
                <input type="number" name="longitude" value={formData.coord.longitude} onChange={handleCoordChange} required />

                <label>Высота:</label>
                <input type="number" name="height" value={formData.coord.height} onChange={handleCoordChange} required />

                <h2>Информация о пользователе</h2>
                <label>Телефон:</label>
                <input type="tel" name="phone" value={formData.user.phone} disabled />

                <label>Email:</label>
                <input type="email" name="email" value={formData.user.email} disabled />

                <button type="submit">Сохранить изменения</button>
            </form>
        </div>
    );
}

export default EditPereval;
