import { ImageData } from "../pages/EditPereval";

const MEDIA_URL = "https://rostislav62.pythonanywhere.com/media/";

export const loadImages = (serverImages: any[]): (ImageData | null)[] => {
  const images: (ImageData | null)[] = [null, null, null];

  serverImages.slice(0, 3).forEach((img: any) => {
    const title = img.title || `${img.id}_image`;
    let slotIndex: number | null = null;

    // 📌 Распределяем по префиксу в title
    if (title.startsWith("1_")) {
      slotIndex = 0; // Подъём
    } else if (title.startsWith("2_")) {
      slotIndex = 1; // Седловина
    } else if (title.startsWith("3_")) {
      slotIndex = 2; // Спуск
    }

    if (slotIndex !== null) {
      images[slotIndex] = {
        id: img.id,
        preview: `${MEDIA_URL}${img.data.replace("\\", "/")}`,
        title,
        data: img.data,
        isModified: false,
      };
    }
  });

  console.log("📸 Загруженные изображения:", images);
  return images;
};