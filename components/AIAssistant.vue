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
          <h3 class="font-bold text-lg">{{ t('chat.title') }}</h3>
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
            {{ t('chat.typing') }}
          </div>
        </div>
      </div>

      <template #footer>
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <UInput
            v-model="inputMessage"
            :placeholder="t('chat.placeholder')"
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
import { ref, computed, watch } from 'vue'
import { useI18n } from '#imports'

const { t, locale } = useI18n()
const currentLocale = computed(() => locale.value)

const isOpen = ref(false)
const inputMessage = ref('')
const loading = ref(false)

// Начальное сообщение (будет переведено при смене языка)
const messages = ref([
  { role: 'assistant', content: t('chat.greeting') }
])

// При смене языка обновляем приветствие (если это единственное сообщение)
watch(locale, () => {
  if (messages.value.length === 1 && messages.value[0].role === 'assistant') {
    messages.value[0].content = t('chat.greeting')
  }
})

async function sendMessage() {
  const text = inputMessage.value.trim()
  if (!text) return

  messages.value.push({ role: 'user', content: text })
  inputMessage.value = ''
  loading.value = true

  try {
    const response = await $fetch('/api/chat', {
      method: 'POST',
      body: {
        message: text,
        locale: currentLocale.value
      }
    })
    messages.value.push({ role: 'assistant', content: response.reply })
  } catch (error) {
    console.error(error)
    messages.value.push({ role: 'assistant', content: t('chat.error') })
  } finally {
    loading.value = false
    setTimeout(() => {
      const container = document.querySelector('.overflow-y-auto')
      if (container) container.scrollTop = container.scrollHeight
    }, 50)
  }
}
</script>