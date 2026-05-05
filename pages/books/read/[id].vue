<template>
  <div>
    
    <UContainer class="py-8">
      <!-- Если не авторизован -->
      <div v-if="!isLoggedIn" class="text-center py-16">
        <UCard class="max-w-md mx-auto">
          <h2 class="text-xl font-bold mb-4">Требуется авторизация</h2>
          <p class="mb-4">Для чтения книг необходимо войти в аккаунт.</p>
          <UButton to="/login">Войти</UButton>
        </UCard>
      </div>

      <!-- Читалка PDF -->
      <div v-else>
        <h1 class="text-2xl font-bold mb-4">{{ bookTitle }}</h1>
        <div class="bg-white rounded-lg shadow-lg p-4">
          <iframe
            :src="pdfUrl"
            width="100%"
            height="700px"
            class="border-0"
            frameborder="0"
          ></iframe>
          <p class="text-center text-gray-500 mt-4">
            Если книга не отображается,
            <a :href="pdfUrl" target="_blank" class="text-blue-600">откройте PDF в новой вкладке</a>.
          </p>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup>
const route = useRoute()
const { id } = route.params
const { isLoggedIn } = useAuth()

// Получаем данные книги
const { data: book } = await useFetch(`/api/books/${id}`)
const bookTitle = ref(book.value?.title || 'Книга')

// Путь к PDF: public/books/1.pdf
const pdfUrl = `/books/${id}.pdf`
</script>