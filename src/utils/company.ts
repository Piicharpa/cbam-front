import axios from "axios";

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
export const fetchCompanyData = async (companyId: number): Promise<CompanyType> => {
  const response = await axios.get(`/company/${companyId}`);
  return response.data;
};