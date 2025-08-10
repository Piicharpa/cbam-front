import { createContext, useState } from "react";

interface AuthContextType {
  user: UserLoginInfo | null;
  setCredential: (user: UserLoginInfo) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserLoginInfo | null>(
    JSON.parse(JSON.stringify(localStorage.getItem("user_account")))
  );

  function setCredential(user: UserLoginInfo) {
    setUser(user);
    localStorage.setItem("user_account", JSON.stringify(user));
  }

  return (
    <AuthContext.Provider value={{ user, setCredential }}>
      {children}
    </AuthContext.Provider>
  );
};
export type UserLoginInfo = {
  message: string;
  token: string;
  expires_at: string;
  user: {
    company_id: number;
    user_id: number;
    email: string;
    role_id: number;
    name: string;
    status: string;
    created_date: string;
    updated_date: string;
  };
  role: {
    role_id: number;
    role_name: string;
    role_description: string;
  };
  company: {
    company_id: number;
    user_id: number;
    name: string;
    address: string;
    province_id: number;
    contact_no: string;
    industrial_id: number;
    created_date: string;
    updated_date: string;
  }[];
};
