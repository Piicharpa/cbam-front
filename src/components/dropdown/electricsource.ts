// components/dropdown/electricitySources.ts
// File name should be consistent with imports

import { OptionType } from "./goods"; // Reusing the OptionType interface

export interface ElectricitySource {
  id: number;
  name: string;
  region?: string;
  emission_factor?: number;
  year?: number;
  source?: string;
}

/**
 * Fetches electricity sources from the API
 * @returns Array of electricity source objects
 */
export const ElectricitySources = async (): Promise<ElectricitySource[]> => {
const user_account = localStorage.getItem("user_account");
const token = user_account ? JSON.parse(user_account).token : null;
  const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ต้องอยู่ใน headers
      };

  const apiUrl = process.env.REACT_APP_API_URL;
  try {
    const response = await fetch(`${apiUrl}/ api/cbam/srcefelectricitys`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch electricity sources");
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching electricity sources:", err);
    return [];
  }
};

/**
 * Converts electricity sources to dropdown options
 * @param sources Array of electricity source objects
 * @returns Array of options formatted for dropdown
 */
export const getElectricitySourceOptions = (
  sources: ElectricitySource[]
): OptionType[] => {
  return sources.map((source) => ({
    label: formatElectricitySourceLabel(source),
    value: source.id,
  }));
};

/**
 * Formats electricity source label with emission factor when available
 * @param source Electricity source object
 * @returns Formatted label string
 */
const formatElectricitySourceLabel = (source: ElectricitySource): string => {
  let label = source.name;
  if (source.region) {
    label += ` (${source.region})`;
  }
  if (source.emission_factor !== undefined) {
    label += ` - ${source.emission_factor} tCO2/MWh`;
  }
  if (source.year) {
    label += ` (${source.year})`;
  }
  return label;
};

/**
 * Gets the emission factor for a selected electricity source
 * @param sources All electricity sources
 * @param selectedId ID of the selected source
 * @returns The emission factor value or undefined if not found
 */
export const getEmissionFactorForSource = (
  sources: ElectricitySource[],
  selectedId: number | string
): number | undefined => {
  const source = sources.find((s) => s.id === Number(selectedId));
  return source?.emission_factor;
};
