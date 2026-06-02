import OpenAI from 'openai'

const openai = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY
})

export default defineEventHandler(async (event) => {
  const { message, locale } = await readBody(event)

  if (!message || typeof message !== 'string') {
    throw createError({ statusCode: 400, message: 'Сообщение не предоставлено' })
  }

  // === ОПРЕДЕЛЯЕМ РЕАЛЬНЫЙ ЯЗЫК ПО ТЕКСТУ ===
  function detectLanguage(text: string): string {
    const hasCyrillic = /[а-яА-ЯёЁ]/.test(text)
    const hasKazakh = /[құғәіңүөһҚҰҒӘІҢҮӨҺ]/.test(text)
    const hasEnglish = /[a-zA-Z]/.test(text)
    
    if (hasKazakh) return 'kk'
    if (hasCyrillic) return 'ru'
    if (hasEnglish) return 'en'
    return 'ru' // fallback
  }

  const realLocale = detectLanguage(message)
  
  const languageMap: Record<string, string> = {
    ru: 'русском',
    kk: 'казахском',
    en: 'английском'
  }
  const targetLanguage = languageMap[realLocale] || 'русском'

  // === ВАШИ КНИГИ (без изменений) ===
  const booksList = [
    { title: "1984", author: "George Orwell", year: 1949, available: 2 },
    { title: "О дивный новый мир", author: "Aldous Huxley", year: 1932, available: 2 },
    { title: "Преступление и наказание", author: "Fyodor Dostoevsky", year: 1866, available: 2 },
    { title: "Гордость и предубеждение", author: "Jane Austen", year: 1813, available: 2 },
    { title: "Над пропастью во ржи", author: "J.D. Salinger", year: 1951, available: 3 },
    { title: "Великий Гэтсби", author: "F. Scott Fitzgerald", year: 1925, available: 3 },
    { title: "Хоббит", author: "J.R.R. Tolkien", year: 1937, available: 3 },
    { title: "Убить пересмешника", author: "Harper Lee", year: 1960, available: 3 }
  ]

  const booksDescription = booksList.map(book => 
    `- "${book.title}", Автор: ${book.author}, Год: ${book.year}, Доступно: ${book.available}`
  ).join('\n')

  // ЖЁСТКИЙ ПРОМПТ С ТРЕБОВАНИЕМ ЯЗЫКА
  const systemPrompt = `Ты — помощник библиотеки. Отвечай строго на ${targetLanguage} языке.
Никогда не используй казахский, если вопрос на русском. Никогда не используй русский, если вопрос на казахском.
Не выводи <think>, не ссылайся на сайты, не выдумывай книги.
Отвечай кратко и по фактам из списка ниже.

Список книг:
${booksDescription}

Часы работы: Пн-Пт 9-20, Сб 10-18, Вс выходной.
Правила: 5 книг на 30 дней, штраф 50 тг/день, регистрация на сайте.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // Более послушная модель
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.3, // снижаем вариативность
      max_tokens: 500
    })

    let reply = completion.choices[0].message.content || ''
    reply = reply.replace(/https?:\/\/[^\s]+/g, '')
    reply = reply.replace(/www\.[^\s]+/g, '')
    reply = reply.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
    return { reply }
  } catch (error: any) {
    console.error('AI API Error:', error)
    return { reply: 'Сервис временно недоступен. Попробуйте позже.' }
  }
})