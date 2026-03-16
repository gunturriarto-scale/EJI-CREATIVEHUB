
const USAGE_KEY = 'konten_kilat_usage_v4';
const DATE_KEY = 'konten_kilat_last_reset_v4';
const MAX_LIMIT = 50;

export const usageService = {
  checkAndReset: () => {
    const today = new Date().toLocaleDateString();
    const lastReset = localStorage.getItem(DATE_KEY);

    if (lastReset !== today) {
      localStorage.setItem(USAGE_KEY, '0');
      localStorage.setItem(DATE_KEY, today);
      window.dispatchEvent(new Event('usage-updated'));
    }
  },

  getUsage: (): number => {
    usageService.checkAndReset();
    const stored = localStorage.getItem(USAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  },

  incrementUsage: (): number => {
    usageService.checkAndReset();
    const current = usageService.getUsage();
    const next = current + 1;
    localStorage.setItem(USAGE_KEY, next.toString());
    window.dispatchEvent(new Event('usage-updated'));
    return next;
  },

  getMaxLimit: (): number => {
    return MAX_LIMIT;
  },

  hasReachedLimit: (): boolean => {
    return usageService.getUsage() >= MAX_LIMIT;
  }
};
