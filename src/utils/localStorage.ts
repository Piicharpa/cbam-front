import { useMemo } from "react";
import type { UserLoginInfo } from "../auth/auth.provider";
export const clearToken = async () => {
  return localStorage.removeItem("user_account");
};

export const useToken = () => {
  return useMemo(() => {
    return JSON.parse(
      localStorage.getItem("user_account") ?? "{}"
    ) as UserLoginInfo;
  }, []);
};
