<template>
  <div>
    
    <UContainer class="py-8 sm:py-16">
      <div class="max-w-md mx-auto">
        <UCard :ui="{ body: { padding: 'px-6 py-8' } }">
          <template #header>
            <div class="text-center pt-6 pb-2">
              <UIcon name="i-heroicons-book-open" class="text-4xl text-primary-500 mb-2" />
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ $t('register.title') }}
              </h2>
              <p class="text-sm text-gray-500 mt-1">
                {{ $t('register.subtitle') }}
              </p>
            </div>
          </template>

          <form @submit.prevent="register">
            <UFormGroup :label="$t('register.name')" class="mb-4">
              <UInput v-model="form.name" placeholder="Ваше имя" size="lg" required />
            </UFormGroup>

            <UFormGroup :label="$t('register.email')" class="mb-4">
              <UInput v-model="form.email" type="email" placeholder="student@university.edu" size="lg" required />
            </UFormGroup>

            <UFormGroup :label="$t('register.password')" class="mb-4">
              <UInput v-model="form.password" type="password" placeholder="••••••••" size="lg" required />
            </UFormGroup>

            <UAlert v-if="error" color="red" variant="soft" :description="error" class="mb-4" />

            <UButton type="submit" block size="lg" :loading="loading">
              {{ $t('register.submit') }}
            </UButton>
          </form>
        </UCard>

        <p class="text-center text-sm text-gray-500 mt-6">
          {{ $t('register.haveAccount') }}
          <NuxtLink to="/login" class="text-primary-600 hover:underline">
            {{ $t('register.loginLink') }}
          </NuxtLink>
        </p>
      </div>
    </UContainer>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'guest' })

const form = reactive({ name: '', email: '', password: '' })
const loading = ref(false)
const error = ref('')

const register = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: form
    })
    const token = useCookie('token')
    token.value = response.token
    const userCookie = useCookie('user')
    userCookie.value = response.user
    const { user } = useAuth()
    user.value = response.user
    await navigateTo('/')
  } catch (err) {
    error.value = err.data?.message || 'Ошибка регистрации'
  } finally {
    loading.value = false
  }
}
</script>