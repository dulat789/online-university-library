<template>
  <div class="flex items-center gap-1">
    <UButton
      v-for="loc in locales"
      :key="loc.code"
      size="xs"
      :variant="currentLocale === loc.code ? 'solid' : 'ghost'"
      color="gray"
      @click="setLocale(loc.code)"
    >
      {{ loc.label }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
const { locale: currentLocale, setLocale } = useI18n();

const locales = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "kk", label: "ҚАЗ" },
];
</script>
