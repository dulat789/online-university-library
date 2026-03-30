<template>
  <div>
    <Navbar />

    <UContainer class="py-8">
      <div class="space-y-6">
        <!-- Header -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Room Reservations
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            Reserve a study room within library opening hours
          </p>
        </div>

        <!-- Date picker + library hours -->
        <UCard>
          <div class="flex flex-col sm:flex-row sm:items-center gap-4">
            <div class="flex-1">
              <label
                for="reservation-date"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Select Date
              </label>
              <input
                id="reservation-date"
                v-model="selectedDate"
                type="date"
                :min="today"
                class="block w-full sm:w-64 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div class="shrink-0 sm:text-right">
              <p class="text-xs text-gray-400 uppercase tracking-wide">
                Library hours
              </p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ libraryHoursLabel }}
              </p>
              <p class="text-sm text-gray-500">{{ dayLabel }}</p>
            </div>
          </div>
        </UCard>

        <!-- Guest notice -->
        <UAlert
          v-if="!isLoggedIn"
          icon="i-heroicons-information-circle"
          color="blue"
          variant="subtle"
          title="Log in to reserve a room"
          description="You can view current reservations below. Log in to make or cancel your own bookings."
        />

        <!-- Loading state -->
        <div v-if="pending" class="flex justify-center py-16">
          <UIcon
            name="i-heroicons-arrow-path"
            class="text-4xl text-primary-500 animate-spin"
          />
        </div>

        <!-- Reservation grid -->
        <UCard v-else>
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-table-cells" class="text-primary-500" />
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Room Availability
              </h2>
              <div
                class="ml-auto flex items-center gap-3 text-xs text-gray-500"
              >
                <span class="flex items-center gap-1">
                  <span
                    class="inline-block w-3 h-3 rounded-sm bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700"
                  ></span>
                  Available
                </span>
                <span class="flex items-center gap-1">
                  <span
                    class="inline-block w-3 h-3 rounded-sm bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700"
                  ></span>
                  Reserved
                </span>
                <span class="flex items-center gap-1">
                  <span
                    class="inline-block w-3 h-3 rounded-sm bg-primary-100 dark:bg-primary-900/40 border border-primary-300 dark:border-primary-700"
                  ></span>
                  Your reservation
                </span>
              </div>
            </div>
          </template>

          <div class="overflow-x-auto -mx-4 sm:mx-0">
            <table class="w-full text-sm border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th
                    class="py-3 px-4 text-left font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 w-[130px]"
                  >
                    Time slot
                  </th>
                  <th
                    v-for="room in rooms"
                    :key="room.id"
                    class="py-3 px-4 text-center font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
                  >
                    {{ room.name }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, i) in grid"
                  :key="row.slot.start"
                  :class="[
                    'border-b border-gray-100 dark:border-gray-800 last:border-0',
                    i % 2 === 0
                      ? 'bg-white dark:bg-gray-900'
                      : 'bg-gray-50/60 dark:bg-gray-800/30',
                  ]"
                >
                  <td
                    class="py-3 px-4 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
                  >
                    {{ row.slot.start }} – {{ row.slot.end }}
                  </td>

                  <td
                    v-for="cell in row.cells"
                    :key="cell.room.id"
                    class="py-2 px-4 text-center"
                  >
                    <!-- Reserved by current user -->
                    <template
                      v-if="
                        cell.reservation &&
                        cell.reservation.user_id === currentUserId
                      "
                    >
                      <div
                        class="rounded-lg bg-primary-50 dark:bg-primary-900/20 px-2 py-1.5 space-y-1"
                      >
                        <UBadge
                          color="primary"
                          variant="subtle"
                          class="w-full justify-center"
                        >
                          {{ cell.reservation.user_name }} (you)
                        </UBadge>
                        <UButton
                          size="xs"
                          color="red"
                          variant="ghost"
                          :loading="cancellingId === cell.reservation.id"
                          class="w-full justify-center"
                          @click="cancelReservation(cell.reservation.id)"
                        >
                          Cancel
                        </UButton>
                      </div>
                    </template>

                    <!-- Reserved by someone else -->
                    <template v-else-if="cell.reservation">
                      <UBadge
                        color="red"
                        variant="subtle"
                        class="w-full justify-center max-w-[130px] mx-auto truncate"
                      >
                        {{ cell.reservation.user_name }}
                      </UBadge>
                    </template>

                    <!-- Past slot (same day, already passed) -->
                    <template v-else-if="cell.isPast">
                      <span class="text-xs text-gray-300 dark:text-gray-600"
                        >—</span
                      >
                    </template>

                    <!-- Available — logged in user can reserve -->
                    <template v-else-if="isLoggedIn">
                      <UButton
                        size="xs"
                        color="green"
                        variant="soft"
                        :loading="
                          reservingKey === `${cell.room.id}-${row.slot.start}`
                        "
                        @click="makeReservation(cell.room.id, row.slot)"
                      >
                        Reserve
                      </UButton>
                    </template>

                    <!-- Available — guest view -->
                    <template v-else>
                      <span
                        class="text-xs font-medium text-green-600 dark:text-green-400"
                      >
                        Available
                      </span>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { Room, Reservation } from "~/types/reservation";

const { isLoggedIn, user } = useAuth();
const toast = useToast();

// ── Date helpers ────────────────────────────────────────────────
const today = new Date().toISOString().split("T")[0];
const selectedDate = ref(today);

const dayLabel = computed(() => {
  const d = new Date(selectedDate.value + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
});

// ── Library hours ───────────────────────────────────────────────
const libraryHours = computed(() => {
  const day = new Date(selectedDate.value + "T12:00:00").getDay();
  if (day >= 1 && day <= 5) return { open: "08:30", close: "20:30" };
  if (day === 6) return { open: "08:30", close: "17:30" };
  return { open: "09:30", close: "13:30" }; // Sunday
});

const libraryHoursLabel = computed(
  () => `${libraryHours.value.open} – ${libraryHours.value.close}`,
);

// ── Time slots (1-hour intervals within library hours) ──────────
const timeSlots = computed(() => {
  const [openH, openM] = libraryHours.value.open.split(":").map(Number);
  const [closeH, closeM] = libraryHours.value.close.split(":").map(Number);
  const closeTotal = closeH * 60 + closeM;

  const slots: { start: string; end: string }[] = [];
  let h = openH;
  let m = openM;

  while (h * 60 + m + 60 <= closeTotal) {
    const start = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const total = h * 60 + m + 60;
    const endH = Math.floor(total / 60);
    const endM = total % 60;
    const end = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
    slots.push({ start, end });
    h = endH;
    m = endM;
  }
  return slots;
});

// Whether a slot's start time has already passed today
function isPastSlot(startTime: string): boolean {
  if (selectedDate.value !== today) return false;
  const now = new Date();
  const [slotH, slotM] = startTime.split(":").map(Number);
  return now.getHours() * 60 + now.getMinutes() >= slotH * 60 + slotM;
}

// ── Data fetching ───────────────────────────────────────────────
const { data: rooms } = await useFetch<Room[]>("/api/rooms");

const {
  data: reservations,
  pending,
  refresh,
} = await useFetch<Reservation[]>(
  () => `/api/reservations?date=${selectedDate.value}`,
  { watch: [selectedDate] },
);

const currentUserId = computed(() => user.value?.id ?? null);

// ── Grid computation ────────────────────────────────────────────
const grid = computed(() => {
  const resMap = new Map<string, Reservation>();
  for (const r of reservations.value ?? []) {
    resMap.set(`${r.room_id}-${r.start_time}`, r);
  }

  return timeSlots.value.map((slot) => ({
    slot,
    cells: (rooms.value ?? []).map((room) => ({
      room,
      reservation: resMap.get(`${room.id}-${slot.start}`) ?? null,
      isPast: isPastSlot(slot.start),
    })),
  }));
});

// ── Reserve action ──────────────────────────────────────────────
const reservingKey = ref<string | null>(null);

async function makeReservation(
  roomId: number,
  slot: { start: string; end: string },
) {
  reservingKey.value = `${roomId}-${slot.start}`;
  try {
    await $fetch("/api/reservations", {
      method: "POST",
      body: {
        roomId,
        date: selectedDate.value,
        startTime: slot.start,
        endTime: slot.end,
      },
    });
    toast.add({
      title: "Room reserved!",
      description: `${slot.start} – ${slot.end} on ${selectedDate.value}`,
      color: "green",
      icon: "i-heroicons-check-circle",
    });
    await refresh();
  } catch (err: any) {
    toast.add({
      title: "Reservation failed",
      description: err.data?.statusMessage ?? "Please try again",
      color: "red",
      icon: "i-heroicons-x-circle",
    });
  } finally {
    reservingKey.value = null;
  }
}

// ── Cancel action ───────────────────────────────────────────────
const cancellingId = ref<number | null>(null);

async function cancelReservation(id: number) {
  if (!confirm("Are you sure you want to cancel this reservation?")) return;
  cancellingId.value = id;
  try {
    await $fetch(`/api/reservations/${id}`, { method: "DELETE" });
    toast.add({
      title: "Reservation cancelled",
      color: "green",
      icon: "i-heroicons-check-circle",
    });
    await refresh();
  } catch (err: any) {
    toast.add({
      title: "Failed to cancel",
      description: err.data?.statusMessage ?? "Please try again",
      color: "red",
      icon: "i-heroicons-x-circle",
    });
  } finally {
    cancellingId.value = null;
  }
}
</script>
