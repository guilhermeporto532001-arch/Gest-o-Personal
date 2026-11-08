/**
 * Formats a numeric value into Brazilian Real (R$ 1.234,56)
 */
export function formatBRL(value: number): string {
  if (isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formats ISO date YYYY-MM-DD into dd/mm/aaaa
 */
export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  return dateStr;
}

/**
 * Returns today's date in YYYY-MM-DD format based on local time
 */
export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns current month key in YYYY-MM format
 */
export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Returns human-readable Month and Year in Brazilian Portuguese
 * e.g. "2026-11" -> "Novembro/2026"
 */
export function formatMonthYearLabel(monthKey: string): string {
  if (!monthKey) return '';
  const [year, monthStr] = monthKey.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const mIndex = parseInt(monthStr, 10) - 1;
  const name = monthNames[mIndex] || monthStr;
  return `${name} de ${year}`;
}

/**
 * Short month label for quick selector
 */
export function formatShortMonthYear(monthKey: string): string {
  if (!monthKey) return '';
  const [year, monthStr] = monthKey.split('-');
  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  const mIndex = parseInt(monthStr, 10) - 1;
  const name = monthNames[mIndex] || monthStr;
  return `${name}/${year}`;
}

/**
 * Navigates monthKey by delta (-1 or +1)
 */
export function changeMonth(monthKey: string, delta: number): string {
  const [yearStr, monthStr] = monthKey.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) + delta;

  if (month < 1) {
    month = 12;
    year -= 1;
  } else if (month > 12) {
    month = 1;
    year += 1;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Checks if the client's birthday is in the specified month
 * birthDate: YYYY-MM-DD
 * targetMonthKey: YYYY-MM or undefined (defaults to current calendar month)
 */
export function isBirthdayInMonth(birthDate: string, targetMonthKey?: string): boolean {
  if (!birthDate) return false;
  const parts = birthDate.split('-');
  if (parts.length < 2) return false;
  const birthMonth = parseInt(parts[1], 10);

  let targetMonth: number;
  if (targetMonthKey) {
    targetMonth = parseInt(targetMonthKey.split('-')[1], 10);
  } else {
    targetMonth = new Date().getMonth() + 1;
  }

  return birthMonth === targetMonth;
}

/**
 * Extracts first name from full name
 */
export function getFirstName(fullName: string): string {
  if (!fullName) return '';
  return fullName.trim().split(/\s+/)[0];
}

/**
 * Cleans phone number for wa.me link
 * Handles Brazilian DDD and prepends country code 55 if needed
 */
export function cleanWhatsAppNumber(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  // If already starts with 55 and has 12 or 13 digits, keep
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }

  // Brazilian numbers usually have 10 (fixed) or 11 (mobile) digits with DDD
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
}
