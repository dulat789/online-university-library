<template>
  <div>
    <Navbar />

    <UContainer class="py-16">
      <div class="max-w-md mx-auto">
        <UCard :ui="{ body: { padding: 'px-6 py-8' } }">
          <template #header>
            <div class="text-center pt-6 pb-2">
              <UIcon
                name="i-heroicons-book-open"
                class="text-4xl text-primary-500 mb-2"
              />
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                Student Login
              </h2>
              <p class="text-sm text-gray-500 mt-1">
                Sign in with your university credentials
              </p>
            </div>
          </template>

          <form class="space-y-5" @submit.prevent="handleLogin">
            <UFormGroup label="Email" name="email">
              <UInput
                v-model="form.email"
                type="email"
                placeholder="student@university.edu"
                autocomplete="email"
                size="lg"
                required
              />
            </UFormGroup>

            <UFormGroup label="Password" name="password">
              <UInput
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                autocomplete="current-password"
                size="lg"
                required
              />
            </UFormGroup>

            <UAlert
              v-if="errorMessage"
              color="red"
              variant="soft"
              icon="i-heroicons-exclamation-circle"
              :description="errorMessage"
            />

            <UButton type="submit" block size="lg" :loading="loading">
              Sign in
            </UButton>
          </form>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "guest" });

const { login } = useAuth();
const route = useRoute();

const form = reactive({ email: "", password: "" });
const loading = ref(false);
const errorMessage = ref("");

async function handleLogin() {
  loading.value = true;
  errorMessage.value = "";
  try {
    await login(form.email, form.password);
    const redirect = (route.query.redirect as string) || "/";
    await navigateTo(redirect);
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } };
    errorMessage.value =
      e.data?.statusMessage || "Login failed. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>
