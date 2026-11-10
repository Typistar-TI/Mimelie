import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRoutine,
  type CreateRoutineInput,
} from "../../api/features/automation/create-routine";
import { getAutomationControl } from "../../api/features/automation/get-automation-control";
import { listRoutines } from "../../api/features/automation/list-routines";
import { runRoutine } from "../../api/features/automation/run-routine";
import {
  updateAutomationControl,
  type UpdateAutomationControlInput,
} from "../../api/features/automation/update-automation-control";
import {
  updateRoutine,
  type UpdateRoutineInput,
} from "../../api/features/automation/update-routine";

const routinesKey = ["admin", "routines"] as const;
const automationKey = ["admin", "automation"] as const;
const invalidate = (client: ReturnType<typeof useQueryClient>) =>
  Promise.all([
    client.invalidateQueries({ queryKey: routinesKey }),
    client.invalidateQueries({ queryKey: automationKey }),
  ]);
export const useRoutines = () =>
  useQuery({ queryKey: routinesKey, queryFn: listRoutines });
export const useAutomationControl = () =>
  useQuery({ queryKey: automationKey, queryFn: getAutomationControl });
export const useCreateRoutine = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoutineInput) => createRoutine(input),
    onSuccess: () => invalidate(client),
  });
};
export const useUpdateRoutine = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRoutineInput }) =>
      updateRoutine(id, input),
    onSuccess: () => invalidate(client),
  });
};
export const useRunRoutine = () => useMutation({ mutationFn: runRoutine });
export const useUpdateAutomationControl = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAutomationControlInput) =>
      updateAutomationControl(input),
    onSuccess: () => invalidate(client),
  });
};
