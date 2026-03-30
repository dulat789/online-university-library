<template>
  <UInput
    v-model="model"
    icon="i-heroicons-magnifying-glass"
    :placeholder="$t('search.placeholder')"
    size="lg"
    class="w-full max-w-xl"
    :ui="{ icon: { trailing: { pointer: '' } } }"
  >
    <template v-if="model" #trailing>
      <UButton
        color="gray"
        variant="link"
        icon="i-heroicons-x-mark"
        :padded="false"
        @click="model = ''"
      />
    </template>
  </UInput>
</template>

<script setup lang="ts">
const model = defineModel<string>({ default: "" });
</script>
