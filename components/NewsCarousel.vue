<template>
  <section
    class="py-8 sm:py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900"
  >
    <UContainer>
      <!-- Section Header -->
      <div class="text-center mb-6 sm:mb-10">
        <p
          class="text-sm font-semibold uppercase tracking-widest text-primary-500 mb-2"
        >
          {{ $t("news.eyebrow") }}
        </p>
        <h2
          class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white"
        >
          {{ $t("news.title") }}
        </h2>
        <p class="mt-2 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          {{ $t("news.subtitle") }}
        </p>
      </div>

      <!-- Carousel Wrapper -->
      <div
        class="relative rounded-2xl overflow-hidden shadow-2xl"
        @mouseenter="pauseAuto"
        @mouseleave="resumeAuto"
      >
        <!-- Slides -->
        <div class="relative h-[280px] sm:h-[480px] md:h-[520px]">
          <Transition :name="transitionName" mode="out-in">
            <div :key="current" class="absolute inset-0">
              <!-- Background Image -->
              <img
                :src="news[current].image"
                :alt="$t(news[current].titleKey)"
                class="w-full h-full object-cover"
              />
              <!-- Gradient overlay -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
              />

              <!-- Content -->
              <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-10">
                <UBadge
                  :label="$t(news[current].categoryKey)"
                  color="primary"
                  variant="solid"
                  class="mb-3"
                />
                <h3
                  class="text-lg sm:text-2xl md:text-3xl font-bold text-white leading-snug mb-2 sm:mb-3 drop-shadow"
                >
                  {{ $t(news[current].titleKey) }}
                </h3>
                <p
                  class="hidden sm:block text-gray-200 text-sm sm:text-base leading-relaxed max-w-2xl"
                >
                  {{ $t(news[current].descKey) }}
                </p>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Prev Button -->
        <button
          class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition flex items-center justify-center text-white shadow-lg"
          :aria-label="$t('news.prev')"
          @click="go(-1)"
        >
          <UIcon name="i-heroicons-chevron-left" class="text-xl" />
        </button>

        <!-- Next Button -->
        <button
          class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition flex items-center justify-center text-white shadow-lg"
          :aria-label="$t('news.next')"
          @click="go(1)"
        >
          <UIcon name="i-heroicons-chevron-right" class="text-xl" />
        </button>

        <!-- Progress bar -->
        <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            class="h-full bg-primary-400 transition-all duration-300 ease-linear"
            :style="{ width: progressWidth }"
          />
        </div>
      </div>

      <!-- Dots -->
      <div class="flex items-center justify-center gap-2 mt-5">
        <button
          v-for="(item, i) in news"
          :key="i"
          class="rounded-full transition-all duration-300"
          :class="
            i === current
              ? 'w-7 h-2.5 bg-primary-500'
              : 'w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 hover:bg-primary-300'
          "
          :aria-label="`${$t('news.goTo')} ${i + 1}`"
          @click="jumpTo(i)"
        />
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
const AUTO_PLAY_MS = 5000;
const PROGRESS_INTERVAL_MS = 50;

const news = [
  {
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1400&q=80",
    categoryKey: "news.item1.category",
    titleKey: "news.item1.title",
    descKey: "news.item1.desc",
  },
  {
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1400&q=80",
    categoryKey: "news.item2.category",
    titleKey: "news.item2.title",
    descKey: "news.item2.desc",
  },
  {
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1400&q=80",
    categoryKey: "news.item3.category",
    titleKey: "news.item3.title",
    descKey: "news.item3.desc",
  },
  {
    image:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1400&q=80",
    categoryKey: "news.item4.category",
    titleKey: "news.item4.title",
    descKey: "news.item4.desc",
  },
  {
    image:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1400&q=80",
    categoryKey: "news.item5.category",
    titleKey: "news.item5.title",
    descKey: "news.item5.desc",
  },
];

const current = ref(0);
const transitionName = ref("slide-left");
const paused = ref(false);
const progress = ref(0);

let autoTimer: ReturnType<typeof setInterval> | null = null;
let progressTimer: ReturnType<typeof setInterval> | null = null;

const progressWidth = computed(() => `${progress.value}%`);

function go(dir: 1 | -1) {
  transitionName.value = dir === 1 ? "slide-left" : "slide-right";
  current.value = (current.value + dir + news.length) % news.length;
  resetProgress();
}

function jumpTo(i: number) {
  transitionName.value = i > current.value ? "slide-left" : "slide-right";
  current.value = i;
  resetProgress();
}

function resetProgress() {
  progress.value = 0;
  if (progressTimer) clearInterval(progressTimer);
  if (!paused.value) startProgress();
}

function startProgress() {
  progressTimer = setInterval(() => {
    progress.value += 100 / (AUTO_PLAY_MS / PROGRESS_INTERVAL_MS);
  }, PROGRESS_INTERVAL_MS);
}

function startAuto() {
  stopAuto();
  autoTimer = setInterval(() => {
    if (!paused.value) go(1);
  }, AUTO_PLAY_MS);
}

function stopAuto() {
  if (autoTimer) clearInterval(autoTimer);
  if (progressTimer) clearInterval(progressTimer);
}

function pauseAuto() {
  paused.value = true;
  stopAuto();
}

function resumeAuto() {
  paused.value = false;
  startAuto();
  startProgress();
}

onMounted(() => {
  startAuto();
  startProgress();
});

onUnmounted(() => {
  stopAuto();
});
</script>

<style scoped>
/* Slide left (forward) */
.slide-left-enter-active,
.slide-left-leave-active {
  transition:
    transform 0.55s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.4s ease;
  position: absolute;
  inset: 0;
}
.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Slide right (backward) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    transform 0.55s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.4s ease;
  position: absolute;
  inset: 0;
}
.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
