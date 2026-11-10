import { useQuery } from "@tanstack/react-query";
import { getStatistics } from "../../api/features/analytics/get-statistics";
export const useStatistics = () =>
  useQuery({ queryKey: ["admin", "statistics"], queryFn: getStatistics });
