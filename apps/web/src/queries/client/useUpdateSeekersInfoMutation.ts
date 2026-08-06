import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { getApiErrorMessage, httpClient } from "../../api/httpClient";
import { supabase } from "../../supabase/supabase";
import { ClientAuthApiError } from "./errors";
import { CLIENT_UPDATE_SEEKERS_INFO_MUTATION } from "./keys";

const UPDATE_SEEKERS_INFO_PATH = "/seeker/info" as const;

export type UpdateSeekersInfoPayload =
  | {
      section: "about_you";
      age: number;
      ethnicBackground: string;
      location: string;
      languagesSpoken: string[];
      livingSituation: string;
      needsHelpBesidesHousehold?: "yes" | "no" | "";
      preferredCaregiverGender: string;
      preferredCaregiverLanguage: string;
      culturalConsiderationsChoice?: "share" | "prefer_not_to_say" | "";
      culturalConsiderationsNotes?: string;
      scheduleVibe: string;
      homeAccessibility: string[];
      careUrgency: string;
    }
  | {
      section: "care_health";
      needsMedicalHelp: "yes" | "no";
      healthNotesChoice?: "share" | "prefer_not_to_say" | "";
      healthNotes?: string;
      medicationsChoice?: "share" | "prefer_not_to_say" | "";
      medicationsNotes?: string;
      basicCareNeeds: string[];
      otherCareNeedDetails?: string;
    };

export const updateSeekersInfo = async (
  payload: UpdateSeekersInfoPayload,
): Promise<void> => {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new ClientAuthApiError(
      "Your session expired. Please sign in again.",
      "UNKNOWN_ERROR",
    );
  }

  try {
    await httpClient.patch(UPDATE_SEEKERS_INFO_PATH, payload, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    throw new ClientAuthApiError(
      getApiErrorMessage(
        error,
        "Could not save your details. Please try again.",
      ),
    );
  }
};

export const useUpdateSeekersInfoMutation = (
  options?: Omit<
    UseMutationOptions<void, ClientAuthApiError, UpdateSeekersInfoPayload>,
    "mutationFn" | "mutationKey"
  >,
) =>
  useMutation({
    mutationKey: CLIENT_UPDATE_SEEKERS_INFO_MUTATION,
    mutationFn: updateSeekersInfo,
    ...options,
  });
