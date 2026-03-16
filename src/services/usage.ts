export interface UserUsage {
  email: string;
  count: number;
  max_limit: number;
}

export const usageService = {
  async getUsage(email: string): Promise<UserUsage> {
    const response = await fetch(`/api/usage?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error("Failed to fetch usage");
    return response.json();
  },

  async incrementUsage(email: string): Promise<UserUsage> {
    const response = await fetch("/api/usage/increment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to increment usage");
    }
    return response.json();
  }
};
