import { useQuery } from "@tanstack/react-query";
import { budgetApi } from "@/api/budget";

export const useBudget = (tripId: string) => {
  return useQuery({
    queryKey: ["budget", tripId],
    queryFn: async () => {
      const response = await budgetApi.getBudget(tripId);
      return response.data;
    },
    enabled: !!tripId,
  });
};
