<template>
  <UCard
    class="cursor-pointer hover:shadow-md transition-shadow h-full"
    @click="navigateTo(`/books/${book.id}`)"
  >
    <template #header>
      <img
        v-if="COVER_MAP[book.title]"
        :src="COVER_MAP[book.title]"
        :alt="localizedTitle"
        class="w-full h-48 object-cover rounded-t"
      />
      <h3 class="font-semibold text-base line-clamp-2 leading-snug mt-2">
        {{ localizedTitle }}
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

const { localizedTitle } = useBookLocale(computed(() => props.book.title));

const COVER_MAP: Record<string, string> = {
  "1984": "/covers/1984.webp",
  "Brave New World": "/covers/brave_new_world.jpeg",
  "The Catcher in the Rye": "/covers/catcher_in_the_rye.jpeg",
  "Crime and Punishment": "/covers/crime_and_punishment.jpeg",
  "The Hobbit": "/covers/hobbit.jpeg",
  "Pride and Prejudice": "/covers/pride_and_prejudice.jpeg",
  "The Great Gatsby": "/covers/the_great_gatsby.jpeg",
  "To Kill a Mockingbird": "/covers/to_kill_mockingbird.jpeg",
};
</script>
