import axios from "axios";
import { useToken } from "./localStorage";
export type CompanyType = {
  company_id: number;
  user_id: number;
  name: string;
  address: string;
  province_name: string;
  district_name: string;
  subdistrict_name: string;
  zipcode: number;
  province_id: number;
  district_id: number;
  subdistrict_id: number;
  contact_no: string;
  industrial_id: string;
  industrial_name: string;
  created_date: Date | string;
  updated_date: Date | string;
};
export const company_data = async (): Promise<CompanyType> => {
  const token = useToken();

  if (!token?.company?.[0]?.company_id) {
    throw new Error("Company ID not found in token");
  }

  try {
    const response = await axios.get(`/company/${token.company[0].company_id}`);
    const { data } = response;
    return data;
  } catch (error) {
    console.error("Error fetching company data:", error);
    throw error;
  }
};
