import OpenAI from 'openai'

const openai = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY
})

export default defineEventHandler(async (event) => {
  const { message, locale = 'ru' } = await readBody(event)

  if (!message || typeof message !== 'string') {
    throw createError({ statusCode: 400, message: 'Сообщение не предоставлено' })
  }

  // === ВАШИ РЕАЛЬНЫЕ КНИГИ ===
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

  // Формируем текстовое описание книг для промпта
  const booksDescription = booksList.map(book => 
    `- "${book.title}", Автор: ${book.author}, Год: ${book.year}, Доступно экземпляров: ${book.available}`
  ).join('\n')

  const languageMap: Record<string, string> = {
    ru: 'русском',
    kk: 'казахском',
    en: 'английском'
  }
  const targetLanguage = languageMap[locale] || 'русском'

  const systemPrompt = `You are a university library assistant.
Answer only questions related to the library, university, or books.
Politely refuse off-topic questions.

**Output rules:**
- Do NOT output any <think> or <thinking> tags. Never show your internal reasoning.
- Respond directly and concisely, without preambles like "Of course!" or "Certainly!".
- You MUST respond in ${targetLanguage} language (the user's language: Kazakh, Russian, or English).
- **ABSOLUTELY DO NOT include any URLs, links, domain names, or website addresses.**
- Do not tell users to visit a specific website.

**Library facts:**
- Hours: Mon–Fri 9:00–20:00, Sat 10:00–18:00, Sun closed.
- Registration: there is a "Register" button on the website.
- Book limit: 5 books for up to 30 days.
- Renewal/return: at the library or in personal account.
- Fine for overdue: 50 tenge per day.
- E-books: "Read online" button on the book page.
- Room booking: there is a "Book a room" section.

**List of ALL books in the library (exactly 8 books) with availability:**
${booksDescription}

**Instructions for book questions:**
- Answer based ONLY on the book list above. Do not invent books not in this list.
- If user asks for recommendations by genre, author, or topic, select matching books from the list.
- If user asks about availability, tell the number of copies available.
- If nothing matches, say: "Sorry, we don't have that book in our collection. You can suggest a purchase."
- Keep answers short and helpful.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'qwen/qwen3-32b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.6,
      max_tokens: 500
    })

    let reply = completion.choices[0].message.content || ''
    reply = reply.replace(/https?:\/\/[^\s]+/g, '')
    reply = reply.replace(/www\.[^\s]+/g, '')
    reply = reply.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
    reply = reply.replace(/^\s+/, '')
    return { reply }
  } catch (error: any) {
    console.error('AI API Error:', error)
    return {
      reply: 'Извините, сервис временно недоступен. Пожалуйста, попробуйте позже.'
    }
  }
})