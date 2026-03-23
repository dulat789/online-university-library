<template>
  <div>
    <Navbar />

    <UContainer class="py-10">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          Library Catalog
        </h1>
        <p class="text-gray-500">Browse and search our collection of books</p>
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
          No books found{{ searchQuery ? ` for "${searchQuery}"` : "" }}
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
