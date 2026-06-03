<template>
  <UCard
    class="cursor-pointer hover:shadow-md transition-shadow h-full"
    @click="navigateTo(`/books/${book.id}`)"
  >
    <template #header>
      <img
        v-if="book.cover_url"
        :src="book.cover_url"
        :alt="book.title"
        class="w-full h-48 object-cover rounded-t"
      />
      <h3 class="font-semibold text-base line-clamp-2 leading-snug mt-2">
        {{ book.title }}
      </h3>
    </template>

    <div class="space-y-2 text-sm">
      <p class="text-gray-500 dark:text-gray-400 flex items-center gap-1">
        <UIcon name="i-heroicons-user" class="shrink-0" />
        {{ book.author }}
      </p>
      <p
        v-if="book.year"
        class="text-gray-400 dark:text-gray-500 flex items-center gap-1"
      >
        <UIcon name="i-heroicons-calendar" class="shrink-0" />
        {{ book.year }}
      </p>
    </div>

    <template #footer>
      <UBadge
        :color="book.available_copies > 0 ? 'green' : 'red'"
        variant="soft"
      >
        {{
          book.available_copies > 0
            ? $t("book.available", { count: book.available_copies })
            : $t("book.notAvailable")
        }}
      </UBadge>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { Book } from "~/types/book";

const props = defineProps<{ book: Book }>();
</script>