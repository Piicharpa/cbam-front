// Define the CountryOption type if not imported from elsewhere
export type CountryOption = {
  label: string;
  value: string | number;
  abbreviation?: string;
};

export const fetchCountries = async (): Promise<{
  countries: CountryOption[];
  defaultCountry: CountryOption | null;
}> => {
 const user_account = localStorage.getItem("user_account");
if (!user_account) {
  return { countries: [], defaultCountry: null };
}

const token = JSON.parse(user_account).token;

  const apiUrl = process.env.REACT_APP_API_URL;
  try {
    const res = await fetch(`${apiUrl}/api/cbam/countries`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();

    const mappedCountries: CountryOption[] = data.map((item: any) => ({
      label: item.name,
      value: item.id,
      abbreviation: item.abbreviation,
    }));

    const defaultCountry = mappedCountries.find(
      (c) => c.label.toLowerCase() === "thailand"
    ) || null;

    return {
      countries: mappedCountries,
      defaultCountry,
    };
  } catch (error) {
    console.error("❌ Failed to fetch countries:", error);
    return {
      countries: [],
      defaultCountry: null,
    };
  }
};
