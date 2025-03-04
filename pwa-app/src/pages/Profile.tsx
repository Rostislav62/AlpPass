import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/auth/users/";
const userEmail = localStorage.getItem("user_email");

function Profile() {
    const [userData, setUserData] = useState({
        family_name: "",
        first_name: "",
        father_name: "",
        phone: "",
        email: ""
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!userEmail) {
            setErrorMessage("Email пользователя не найден. Авторизуйтесь заново.");
            return;
        }

        fetch(`${API_URL}${userEmail}/`)
            .then(response => response.json())
            .then(data => {
                if (data.email) {
                    setUserData(data);
                } else {
                    setErrorMessage("Ошибка загрузки данных пользователя.");
                }
            })
            .catch(error => {
                console.error("Ошибка загрузки пользователя:", error);
                setErrorMessage("Ошибка сети. Попробуйте позже.");
            });
    }, []);

    return (
        <div>
            <h1>Личный кабинет</h1>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <p><strong>Фамилия:</strong> {userData.family_name}</p>
            <p><strong>Имя:</strong> {userData.first_name}</p>
            <p><strong>Отчество:</strong> {userData.father_name}</p>
            <p><strong>Телефон:</strong> {userData.phone}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <button disabled>Редактировать</button>
        </div>
    );
}

export default Profile;
