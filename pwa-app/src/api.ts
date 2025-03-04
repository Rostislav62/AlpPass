export const API_URL = "http://127.0.0.1:8000/api";

export async function getPerevals() {
    try {
        const response = await fetch(`${API_URL}/submitData/list/`);
        if (!response.ok) throw new Error("Ошибка запроса");
        return await response.json();
    } catch (error) {
        console.error("Ошибка загрузки перевалов:", error);
        return null;
    }
}
