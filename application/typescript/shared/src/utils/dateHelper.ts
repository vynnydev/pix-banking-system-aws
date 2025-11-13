/**
 * Format date to ISO string
 */
export const toISOString = (date: Date): string => {
    return date.toISOString();
  };
  
  /**
   * Parse ISO string to Date
   */
  export const fromISOString = (isoString: string): Date => {
    return new Date(isoString);
  };
  
  /**
   * Get current timestamp
   */
  export const now = (): Date => {
    return new Date();
  };
  
  /**
   * Add days to date
   */
  export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
  
  /**
   * Add hours to date
   */
  export const addHours = (date: Date, hours: number): Date => {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  };
  
  /**
   * Subtract days from date
   */
  export const subtractDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  };
  
  /**
   * Check if date is in the past
   */
  export const isPast = (date: Date): boolean => {
    return date < now();
  };
  
  /**
   * Check if date is in the future
   */
  export const isFuture = (date: Date): boolean => {
    return date > now();
  };
  
  /**
   * Check if date is today
   */
  export const isToday = (date: Date): boolean => {
    const today = now();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  /**
   * Get start of day
   */
  export const startOfDay = (date: Date): Date => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  };
  
  /**
   * Get end of day
   */
  export const endOfDay = (date: Date): Date => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  };
  
  /**
   * Format date to Brazilian format
   */
  export const formatDateBR = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };
  
  /**
   * Format date and time to Brazilian format
   */
  export const formatDateTimeBR = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };
  
  /**
   * Get difference in days
   */
  export const diffInDays = (date1: Date, date2: Date): number => {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  /**
   * Get difference in hours
   */
  export const diffInHours = (date1: Date, date2: Date): number => {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60));
  };
  
  /**
   * Get difference in minutes
   */
  export const diffInMinutes = (date1: Date, date2: Date): number => {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60));
  };