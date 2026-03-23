<template>
  <UCard
    class="cursor-pointer hover:shadow-md transition-shadow h-full"
    @click="navigateTo(`/books/${book.id}`)"
  >
    <template #header>
      <h3 class="font-semibold text-base line-clamp-2 leading-snug">
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
            ? `${book.available_copies} available`
            : "Not available"
        }}
      </UBadge>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { Book } from "~/types/book";

defineProps<{ book: Book }>();
</script>
