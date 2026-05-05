<template>
  <div class="fixed bottom-5 right-5 z-50">
    <UButton
      v-if="!isOpen"
      @click="isOpen = true"
      color="primary"
      class="rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
      icon="i-heroicons-chat-bubble-left-right"
      size="xl"
    />

    <UCard v-else class="w-80 sm:w-96 shadow-xl">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="font-bold text-lg">Библиотечный помощник</h3>
          <UButton variant="ghost" icon="i-heroicons-x-mark" @click="isOpen = false" />
        </div>
      </template>

      <div class="h-80 overflow-y-auto space-y-3 px-1">
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[80%] rounded-lg px-3 py-2 text-sm"
            :class="msg.role === 'user' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 dark:bg-gray-800'"
          >
            {{ msg.content }}
          </div>
        </div>
        <div v-if="loading" class="flex justify-start">
          <div class="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
            Печатает...
          </div>
        </div>
      </div>

      <template #footer>
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <UInput
            v-model="inputMessage"
            placeholder="Задайте вопрос..."
            class="flex-1"
            autocomplete="off"
          />
          <UButton type="submit" icon="i-heroicons-paper-airplane" :loading="loading" />
        </form>
      </template>
    </UCard>
  </div>
</template>

<script setup>
const isOpen = ref(false)
const inputMessage = ref('')
const loading = ref(false)
const messages = ref([
  { role: 'assistant', content: 'Здравствуйте! Я библиотечный помощник. Чем могу помочь?' }
])

async function sendMessage() {
  const text = inputMessage.value.trim()
  if (!text) return

  messages.value.push({ role: 'user', content: text })
  inputMessage.value = ''
  loading.value = true

  try {
    const response = await $fetch('/api/chat', { method: 'POST', body: { message: text } })
    messages.value.push({ role: 'assistant', content: response.reply })
  } catch (error) {
    console.error(error)
    messages.value.push({ role: 'assistant', content: 'Извините, произошла ошибка. Попробуйте позже.' })
  } finally {
    loading.value = false
    setTimeout(() => {
      const container = document.querySelector('.overflow-y-auto')
      if (container) container.scrollTop = container.scrollHeight
    }, 50)
  }
}
</script>