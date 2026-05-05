// server/api/chat.post.ts
import { GoogleGenAI } from '@google/genai';

export default defineEventHandler(async (event) => {
  const { message } = await readBody(event);
  const apiKey = process.env.GEMINI_API_KEY; // Переменная из .env

  // Проверяем, есть ли ключ
  if (!apiKey) {
    throw createError({ statusCode: 500, message: 'GEMINI_API_KEY not set in .env' });
  }

  // Инициализируем клиент
  const ai = new GoogleGenAI({ apiKey: apiKey });

  // Системный промпт, который ограничивает тему разговора
  const systemInstruction = `
Ты — полезный ассистент университетской библиотеки. Отвечай на вопросы пользователей **только** на тему библиотеки: график работы, правила выдачи книг, поиск литературы, описание сервисов, штрафы, бронирование залов, чтение книг онлайн.
Если вопрос не по теме библиотеки, вежливо ответь: "Извините, я могу помочь только с вопросами о библиотеке. Пожалуйста, спросите о книгах, расписании или правилах."
`;

  try {
    // Отправляем запрос к Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite', // Используйте самую быструю бесплатную модель[reference:3]
      contents: [{ role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 500,     // Ограничение длины ответа
        temperature: 0.7,        // Контролирует "креативность" (0.0-1.0)
      },
    });

    // Извлекаем ответ из результата
    const reply = response.text?.trim() ?? 'Произошла ошибка: модель вернула пустой ответ.';

    return { reply };
  } catch (error: any) {
    // Расширенная обработка ошибок
    console.error('Gemini API Error:', error);
    // Показываем более понятное сообщение об ошибке
    const errorMessage = error.message || error.statusMessage || 'Неизвестная ошибка при обращении к Gemini';
    throw createError({ statusCode: 500, message: `Ошибка при обращении к ИИ: ${errorMessage}` });
  }
});