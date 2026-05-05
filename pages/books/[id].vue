<template>
  <div>
    

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
          :title="$t('book.notFound')"
          :description="$t('book.notFoundDesc')"
        />
        <UButton
          class="mt-4"
          variant="ghost"
          icon="i-heroicons-arrow-left"
          to="/"
        >
          {{ $t("book.backToCatalog") }}
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
          {{ $t("book.backToCatalog") }}
        </UButton>

        <UCard>
          <template #header>
            <img
              v-if="coverSrc"
              :src="coverSrc"
              :alt="book.title"
              class="w-full h-64 object-cover rounded-t mb-4"
            />
            <div class="space-y-1">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ localizedTitle }}
              </h1>
              <p class="text-gray-500 text-sm">
                {{ $t("book.by", { author: book.author }) }}
              </p>
            </div>
          </template>

          <div class="space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  {{ $t("book.published") }}
                </p>
                <p class="font-medium">{{ book.year ?? "—" }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  {{ $t("book.copies") }}
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
                    / {{ book.total_copies }} {{ $t("book.totalLabel") }}</span
                  >
                </p>
              </div>
            </div>

            <div v-if="localizedDescription || book.description">
              <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">
                {{ $t("book.description") }}
              </p>
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                {{ localizedDescription ?? book.description }}
              </p>
            </div>
          </div>

          <template #footer>
            <div class="flex flex-wrap items-center gap-3">
              <!-- НОВАЯ КНОПКА "ЧИТАТЬ ОНЛАЙН" (видна всем) -->
              <UButton
                icon="i-heroicons-book-open"
                color="green"
                @click="handleReadClick"
              >
                {{ $t('book.readOnline') }}
              </UButton>

              <!-- Not logged in → Borrow redirects to login -->
              <UButton
                v-if="!isLoggedIn"
                icon="i-heroicons-arrow-down-tray"
                @click="navigateTo(`/login?redirect=/books/${book.id}`)"
              >
                {{ $t("book.borrow") }}
              </UButton>

              <!-- Logged in, has active borrowing → Return -->
              <UButton
                v-else-if="hasBorrowed"
                color="orange"
                icon="i-heroicons-arrow-uturn-left"
                :loading="actionLoading"
                @click="handleReturn"
              >
                {{ $t("book.returnBook") }}
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
                  book.available_copies <= 0
                    ? $t("book.notAvailable")
                    : $t("book.borrowBook")
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

const route = useRoute();
const { isLoggedIn } = useAuth(); // только один раз!
const { t } = useI18n();
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

const coverSrc = computed(() =>
  book.value ? (COVER_MAP[book.value.title] ?? null) : null,
);

// Функция для кнопки "Читать онлайн"
function handleReadClick() {
  if (!isLoggedIn.value) {
    return navigateTo(`/login?redirect=/books/read/${bookId}`);
  }
  return navigateTo(`/books/read/${bookId}`);
}

const { localizedTitle, localizedDescription } = useBookLocale(
  computed(() => book.value?.title ?? ""),
);

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
      title: t("book.borrowed"),
      description: t("book.borrowedDesc", { title: book.value?.title }),
      color: "green",
    });
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } };
    toast.add({
      title: t("book.error"),
      description: e.data?.statusMessage || t("book.failedToBorrow"),
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
      title: t("book.returned"),
      description: t("book.returnedDesc", { title: book.value?.title }),
      color: "green",
    });
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } };
    toast.add({
      title: t("book.error"),
      description: e.data?.statusMessage || t("book.failedToReturn"),
      color: "red",
    });
  } finally {
    actionLoading.value = false;
  }
}
</script>