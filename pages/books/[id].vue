<template>
  <div>
    <Navbar />

    <UContainer class="py-8">
      <!-- Loading state -->
      <div v-if="bookPending" class="flex justify-center py-16">
        <UIcon
          name="i-heroicons-arrow-path"
          class="animate-spin text-4xl text-primary-500"
        />
      </div>

      <!-- Error state -->
      <div v-else-if="bookError" class="max-w-2xl mx-auto py-8">
        <UAlert
          color="red"
          icon="i-heroicons-exclamation-circle"
          title="Book not found"
          description="This book does not exist or has been removed."
        />
        <UButton
          class="mt-4"
          variant="ghost"
          icon="i-heroicons-arrow-left"
          to="/"
        >
          Back to catalog
        </UButton>
      </div>

      <!-- Book detail -->
      <div v-else-if="book" class="max-w-2xl mx-auto">
        <UButton
          class="mb-5"
          variant="ghost"
          color="gray"
          icon="i-heroicons-arrow-left"
          to="/"
        >
          Back to catalog
        </UButton>

        <UCard>
          <template #header>
            <div class="space-y-1">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ book.title }}
              </h1>
              <p class="text-gray-500 text-sm">by {{ book.author }}</p>
            </div>
          </template>

          <div class="space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  Published
                </p>
                <p class="font-medium">{{ book.year ?? "—" }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  Copies
                </p>
                <p class="font-medium">
                  <span
                    :class="
                      book.available_copies > 0
                        ? 'text-green-600'
                        : 'text-red-500'
                    "
                  >
                    {{ book.available_copies }}
                  </span>
                  <span class="text-gray-400">
                    / {{ book.total_copies }} available</span
                  >
                </p>
              </div>
            </div>

            <div v-if="book.description">
              <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">
                Description
              </p>
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                {{ book.description }}
              </p>
            </div>
          </div>

          <template #footer>
            <div class="flex items-center gap-3">
              <!-- Not logged in → Borrow redirects to login -->
              <UButton
                v-if="!isLoggedIn"
                icon="i-heroicons-arrow-down-tray"
                @click="navigateTo(`/login?redirect=/books/${book.id}`)"
              >
                Borrow
              </UButton>

              <!-- Logged in, has active borrowing → Return -->
              <UButton
                v-else-if="hasBorrowed"
                color="orange"
                icon="i-heroicons-arrow-uturn-left"
                :loading="actionLoading"
                @click="handleReturn"
              >
                Return Book
              </UButton>

              <!-- Logged in, no active borrowing → Borrow (or disabled) -->
              <UButton
                v-else
                icon="i-heroicons-arrow-down-tray"
                :loading="actionLoading"
                :disabled="book.available_copies <= 0"
                @click="handleBorrow"
              >
                {{
                  book.available_copies <= 0 ? "Not Available" : "Borrow Book"
                }}
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { Book } from "~/types/book";
import type { MyBooksResponse } from "~/types/borrowing";

const route = useRoute();
const { isLoggedIn } = useAuth();
const toast = useToast();

const bookId = route.params.id as string;

const {
  data: book,
  pending: bookPending,
  error: bookError,
  refresh: refreshBook,
} = await useFetch<Book>(`/api/books/${bookId}`);

// Only fetch borrowing state when the user is logged in (client-side only)
const { data: myBooks, refresh: refreshMyBooks } =
  await useFetch<MyBooksResponse>("/api/my-books", {
    server: false,
    immediate: isLoggedIn.value,
  });

const hasBorrowed = computed(() => {
  if (!isLoggedIn.value || !myBooks.value) return false;
  return myBooks.value.current.some((b) => b.book_id === parseInt(bookId));
});

const actionLoading = ref(false);

async function handleBorrow() {
  actionLoading.value = true;
  try {
    await $fetch(`/api/borrow/${bookId}`, { method: "POST" });
    await Promise.all([refreshBook(), refreshMyBooks()]);
    toast.add({
      title: "Borrowed!",
      description: `You have borrowed "${book.value?.title}".`,
      color: "green",
    });
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } };
    toast.add({
      title: "Error",
      description: e.data?.statusMessage || "Failed to borrow book.",
      color: "red",
    });
  } finally {
    actionLoading.value = false;
  }
}

async function handleReturn() {
  actionLoading.value = true;
  try {
    await $fetch(`/api/return/${bookId}`, { method: "POST" });
    await Promise.all([refreshBook(), refreshMyBooks()]);
    toast.add({
      title: "Returned!",
      description: `You have returned "${book.value?.title}".`,
      color: "green",
    });
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } };
    toast.add({
      title: "Error",
      description: e.data?.statusMessage || "Failed to return book.",
      color: "red",
    });
  } finally {
    actionLoading.value = false;
  }
}
</script>
