<template>
  <nav class="border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
    <UContainer>
      <div class="flex items-center justify-between h-16">
        <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
          <UIcon name="i-heroicons-book-open" class="text-primary-500" />
          {{ $t("nav.library") }}
        </NuxtLink>

        <!-- Desktop nav -->
        <div class="hidden sm:flex items-center gap-2">
          <LanguageSwitcher />
          <UButton variant="ghost" icon="i-heroicons-calendar-days" to="/reservations">
            {{ $t("nav.reserveRoom") }}
          </UButton>
          <template v-if="isLoggedIn">
            <UButton variant="ghost" icon="i-heroicons-user-circle" to="/profile">
              {{ $t("nav.profile") }}
            </UButton>
            <UButton variant="ghost" color="red" icon="i-heroicons-arrow-right-on-rectangle" :loading="loggingOut" @click="handleLogout">
              {{ $t("nav.logout") }}
            </UButton>
          </template>
          <template v-else>
            <UButton to="/login" variant="ghost">
              {{ $t("nav.login") }}
            </UButton>
            <UButton to="/register" color="primary">
              {{ $t("nav.register") }}
            </UButton>
          </template>
        </div>

        <!-- Mobile hamburger -->
        <UButton class="sm:hidden" variant="ghost" :icon="mobileMenuOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'" aria-label="Toggle menu" @click="mobileMenuOpen = !mobileMenuOpen" />
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="sm:hidden border-t border-gray-100 dark:border-gray-800 py-3 space-y-1">
        <div class="px-1 pb-2">
          <LanguageSwitcher />
        </div>
        <UButton variant="ghost" icon="i-heroicons-calendar-days" to="/reservations" block class="justify-start" @click="mobileMenuOpen = false">
          {{ $t("nav.reserveRoom") }}
        </UButton>
        <template v-if="isLoggedIn">
          <UButton variant="ghost" icon="i-heroicons-user-circle" to="/profile" block class="justify-start" @click="mobileMenuOpen = false">
            {{ $t("nav.profile") }}
          </UButton>
          <UButton variant="ghost" color="red" icon="i-heroicons-arrow-right-on-rectangle" :loading="loggingOut" block class="justify-start" @click="handleLogout">
            {{ $t("nav.logout") }}
          </UButton>
        </template>
        <template v-else>
          <UButton to="/login" variant="ghost" block class="justify-start" @click="mobileMenuOpen = false">
            {{ $t("nav.login") }}
          </UButton>
          <UButton to="/register" color="primary" block class="justify-start" @click="mobileMenuOpen = false">
            {{ $t("nav.register") }}
          </UButton>
        </template>
      </div>
    </UContainer>
  </nav>
</template>

<script setup lang="ts">
const { isLoggedIn, logout } = useAuth();
const loggingOut = ref(false);
const mobileMenuOpen = ref(false);
const route = useRoute();

watch(
  () => route.path,
  () => {
    mobileMenuOpen.value = false;
  }
);

async function handleLogout() {
  loggingOut.value = true;
  try {
    await logout();
  } finally {
    loggingOut.value = false;
    mobileMenuOpen.value = false;
  }
}
</script>