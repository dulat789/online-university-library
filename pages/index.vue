<template>
  <div>
    

    <NewsCarousel />

    <UContainer class="py-6 sm:py-10">
      <div class="mb-6 sm:mb-8">
        <h1
          class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1"
        >
          {{ $t("catalog.title") }}
        </h1>
        <p class="text-gray-500">{{ $t("catalog.subtitle") }}</p>
      </div>

      <SearchBar v-model="searchQuery" class="mb-6" />

      <div v-if="pending" class="flex justify-center py-16">
        <UIcon
          name="i-heroicons-arrow-path"
          class="animate-spin text-4xl text-primary-500"
        />
      </div>

      <div
        v-else-if="books && books.length"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      >
        <BookCard v-for="book in books" :key="book.id" :book="book" />
      </div>

      <div v-else class="flex flex-col items-center py-16 text-gray-400 gap-3">
        <UIcon name="i-heroicons-magnifying-glass" class="text-5xl" />
        <p class="text-lg">
          {{
            searchQuery
              ? $t("catalog.noBooksFor", { query: searchQuery })
              : $t("catalog.noBooks")
          }}
        </p>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { Book } from "~/types/book";

const searchQuery = ref("");
const debouncedSearch = ref("");

let debounceTimer: ReturnType<typeof setTimeout>;

watch(searchQuery, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = val;
  }, 300);
});

const { data: books, pending } = await useFetch<Book[]>("/api/books", {
  query: computed(() => ({
    search: debouncedSearch.value || undefined,
  })),
});
</script>
