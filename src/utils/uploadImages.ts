import { ImageData, PerevalFormData } from "../pages/EditPereval";
import { generateFileName } from "./generateFileName";

const IMAGE_API_URL = "https://rostislav62.pythonanywhere.com/api/uploadImage/";

export const uploadImages = async (
  formData: PerevalFormData,
  initialFormData: PerevalFormData,
  perevalId: string,
  slotLabels: string[]
): Promise<void> => {
  // 📌 Шаг 1: Удаляем только фотографии, которые были заменены или удалены
  for (let index = 0; index < 3; index++) {
    const currentImage = formData.images[index];
    const initialImage = initialFormData.images[index];

    // 📌 Удаляем, если слот очищен (была фотография, а теперь null)
    if (initialImage && !currentImage) {
      console.log(`🗑️ Отправлен запрос на удаление изображения ID ${initialImage.id}: ${initialImage.title}`);
      try {
        const response = await fetch(`${IMAGE_API_URL}delete/${initialImage.id}/`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.user.email }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Изображение ID ${initialImage.id} удалено:`, data.message);
        } else {
          const errorData = await response.json();
          console.error(`⚠️ Ошибка удаления изображения ID ${initialImage.id}:`, errorData.message || response.statusText);
        }
      } catch (error) {
        console.error(`⚠️ Ошибка при запросе удаления ID ${initialImage.id}:`, error);
      }
    }

    // 📌 Удаляем старую фотографию, если она заменена новой
    if (currentImage && currentImage.isModified && initialImage && initialImage.id) {
      console.log(`🗑️ Отправлен запрос на удаление старого изображения ID ${initialImage.id}: ${initialImage.title}`);
      try {
        const response = await fetch(`${IMAGE_API_URL}delete/${initialImage.id}/`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.user.email }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Изображение ID ${initialImage.id} удалено:`, data.message);
        } else {
          const errorData = await response.json();
          console.error(`⚠️ Ошибка удаления изображения ID ${initialImage.id}:`, errorData.message || response.statusText);
        }
      } catch (error) {
        console.error(`⚠️ Ошибка при запросе удаления ID ${initialImage.id}:`, error);
      }
    }
  }

  // 📌 Шаг 2: Загружаем новые фотографии с префиксами, соответствующими слотам
  for (let index = 0; index < 3; index++) {
    const image = formData.images[index];
    if (image && image.isModified && image.file) {
      const fileName = generateFileName(index, formData.title, image.file);
      const formDataUpload = new FormData();
      formDataUpload.append("image", image.file);
      formDataUpload.append("title", fileName);
      formDataUpload.append("file_name", fileName);
      formDataUpload.append("pereval_id", perevalId);

      console.log(`📷 Отправлен запрос на загрузку изображения в слот ${index} (${slotLabels[index]}): ${fileName}`);

      try {
        const response = await fetch(IMAGE_API_URL, {
          method: "POST",
          body: formDataUpload,
        });

        const uploadData = await response.json();
        if (!response.ok) {
          console.error(`⚠️ Ошибка загрузки изображения ${fileName}:`, uploadData.message || response.statusText);
        } else {
          console.log(`✅ Изображение ${fileName} загружено: image_id=${uploadData.image_id}`);
        }
      } catch (error) {
        console.error(`⚠️ Ошибка при запросе загрузки ${fileName}:`, error);
      }
    }
  }
};