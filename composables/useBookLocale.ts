/**
 * Maps the canonical English book title (as stored in the DB) to an i18n slug,
 * then returns reactive localized title and description via the `bookData.*` namespace.
 */
const TITLE_TO_SLUG: Record<string, string> = {
  "1984": "1984",
  "Brave New World": "brave_new_world",
  "Crime and Punishment": "crime_and_punishment",
  "Pride and Prejudice": "pride_and_prejudice",
  "The Catcher in the Rye": "the_catcher_in_the_rye",
  "The Great Gatsby": "the_great_gatsby",
  "The Hobbit": "the_hobbit",
  "To Kill a Mockingbird": "to_kill_a_mockingbird",
};

export function useBookLocale(title: MaybeRef<string>) {
  const { t, te } = useI18n();

  const localizedTitle = computed(() => {
    const raw = unref(title);
    const slug = TITLE_TO_SLUG[raw];
    const key = `bookData.${slug}.title`;
    return slug && te(key) ? t(key) : raw;
  });

  const localizedDescription = computed(() => {
    const raw = unref(title);
    const slug = TITLE_TO_SLUG[raw];
    const key = `bookData.${slug}.desc`;
    return slug && te(key) ? t(key) : null;
  });

  return { localizedTitle, localizedDescription };
}
