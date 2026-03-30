import dayjs from "dayjs";
import "dayjs/locale/ru";
import "dayjs/locale/kk";
// English is dayjs's default locale

export function useLocalizedDate() {
  const { locale } = useI18n();

  function formatDate(date: string | Date): string {
    return dayjs(date).locale(locale.value).format("D MMMM YYYY");
  }

  // Formats a YYYY-MM-DD date string as a human-readable day label.
  // dayjs is used instead of Intl.DateTimeFormat to avoid kk-KZ support gaps
  // in server-side environments.
  function formatDayLabel(dateStr: string): string {
    const d = dayjs(dateStr + "T12:00:00").locale(locale.value);
    return locale.value === "en"
      ? d.format("dddd, MMMM D")
      : d.format("dddd, D MMMM");
  }

  return { formatDate, formatDayLabel };
}
