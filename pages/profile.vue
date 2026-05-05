<template>
  <div>
    

    <UContainer class="py-10">
      <h1
        class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8"
      >
        {{ $t("profile.title") }}
      </h1>

      <!-- Student info card -->
      <UCard v-if="user" class="mb-6">
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon
              name="i-heroicons-user-circle"
              class="text-3xl text-primary-500"
            />
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ user.name }} {{ user.surname }}
              </h2>
              <p class="text-sm text-gray-500">{{ $t("profile.student") }}</p>
            </div>
          </div>
        </template>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">
              {{ $t("profile.email") }}
            </p>
            <p class="font-medium text-gray-800 dark:text-gray-200">
              {{ user.email }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">
              {{ $t("profile.studentId") }}
            </p>
            <p class="font-medium text-gray-800 dark:text-gray-200">
              {{ user.student_id }}
            </p>
          </div>
        </div>
      </UCard>

      <!-- Currently borrowed -->
      <UCard class="mb-6">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-book-open" class="text-primary-500" />
            <h2 class="text-lg font-semibold">
              {{ $t("profile.currentlyBorrowed") }}
            </h2>
            <UBadge
              v-if="myBooks?.current.length"
              color="primary"
              variant="soft"
            >
              {{ myBooks.current.length }}
            </UBadge>
          </div>
        </template>

        <div v-if="myBooks?.current.length" class="overflow-x-auto">
          <UTable :rows="myBooks.current" :columns="currentColumns">
            <template #title-data="{ row }">
              <NuxtLink
                :to="`/books/${row.book_id}`"
                class="font-medium text-primary-500 hover:underline"
              >
                {{ row.title }}
              </NuxtLink>
            </template>
            <template #borrow_date-data="{ row }">
              {{ formatDate(row.borrow_date) }}
            </template>
            <template #due_date-data="{ row }">
              {{ formatDate(row.due_date) }}
            </template>
            <template #is_overdue-data="{ row }">
              <UBadge :color="row.is_overdue ? 'red' : 'green'" variant="soft">
                {{
                  row.is_overdue ? $t("profile.overdue") : $t("profile.active")
                }}
              </UBadge>
            </template>
          </UTable>
        </div>
        <p v-else class="text-gray-400 text-center py-6">
          {{ $t("profile.noBorrowed") }}
        </p>
      </UCard>

      <!-- Borrow history -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-clock" class="text-gray-400" />
            <h2 class="text-lg font-semibold">
              {{ $t("profile.borrowHistory") }}
            </h2>
          </div>
        </template>

        <div v-if="myBooks?.history.length" class="overflow-x-auto">
          <UTable :rows="myBooks.history" :columns="historyColumns">
            <template #title-data="{ row }">
              <NuxtLink
                :to="`/books/${row.book_id}`"
                class="font-medium text-primary-500 hover:underline"
              >
                {{ row.title }}
              </NuxtLink>
            </template>
            <template #borrow_date-data="{ row }">
              {{ formatDate(row.borrow_date) }}
            </template>
            <template #return_date-data="{ row }">
              {{ formatDate(row.return_date) }}
            </template>
          </UTable>
        </div>
        <p v-else class="text-gray-400 text-center py-6">
          {{ $t("profile.noHistory") }}
        </p>
      </UCard>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { MyBooksResponse } from "~/types/borrowing";

definePageMeta({ middleware: "auth" });

const { t } = useI18n();
const { user } = useAuth();
const { data: myBooks } = await useFetch<MyBooksResponse>("/api/my-books");
const { formatDate } = useLocalizedDate();

const currentColumns = computed(() => [
  { key: "title", label: t("profile.bookTitle") },
  { key: "borrow_date", label: t("profile.borrowedOn") },
  { key: "due_date", label: t("profile.dueDate") },
  { key: "is_overdue", label: t("profile.status") },
]);

const historyColumns = computed(() => [
  { key: "title", label: t("profile.bookTitle") },
  { key: "borrow_date", label: t("profile.borrowedOn") },
  { key: "return_date", label: t("profile.returnedOn") },
]);
</script>
