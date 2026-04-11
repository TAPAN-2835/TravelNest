import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tripsApi } from "@/api/trips";
import { toast } from "sonner";

export const useTrips = () => {
  return useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const response = await tripsApi.getTrips();
      const data = response.data as any;
      return Array.isArray(data) ? data : (data?.data || []);
    },
  });
};

export const useTrip = (id: string) => {
  return useQuery({
    queryKey: ["trips", id],
    queryFn: () => tripsApi.getTripById(id),
    enabled: !!id,
  });
};

export const useSaveTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tripData: any) => tripsApi.saveGeneratedTrip(tripData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Trip saved successfully! ✨");
    },
    onError: (error: any) => {
      console.error("Save Trip Error:", error);
      toast.error(error.response?.data?.message || "Failed to save trip");
    },
  });
};
