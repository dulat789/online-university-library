<template>
  <nav
    class="border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800"
  >
    <UContainer>
      <div class="flex items-center justify-between h-16">
        <NuxtLink
          to="/"
          class="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white"
        >
          <UIcon name="i-heroicons-book-open" class="text-primary-500" />
          University Library
        </NuxtLink>

        <div class="flex items-center gap-2">
          <template v-if="isLoggedIn">
            <UButton
              variant="ghost"
              icon="i-heroicons-user-circle"
              to="/profile"
            >
              Profile
            </UButton>
            <UButton
              variant="ghost"
              color="red"
              icon="i-heroicons-arrow-right-on-rectangle"
              :loading="loggingOut"
              @click="handleLogout"
            >
              Logout
            </UButton>
          </template>
          <template v-else>
            <UButton to="/login" icon="i-heroicons-arrow-right-on-rectangle">
              Login
            </UButton>
          </template>
        </div>
      </div>
    </UContainer>
  </nav>
</template>

<script setup lang="ts">
const { isLoggedIn, logout } = useAuth();
const loggingOut = ref(false);

async function handleLogout() {
  loggingOut.value = true;
  try {
    await logout();
  } finally {
    loggingOut.value = false;
  }
}
</script>
