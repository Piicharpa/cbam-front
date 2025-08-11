import React, { useState, useEffect, useCallback, useMemo } from "react";
import Section from "../../../components/Section";
import {
  fetchGoodsData,
  getIndustryOptions,
  getGoodsOptions,
  getRoutesOptions,
  OptionType,
  IndustryGroup,
} from "../../../components/dropdown/goods";
import LabeledAutocompleteMap from "../../../components/LabeledAutoCompleteMap";
import LabeledTextField from "../../../components/LabeledTextField";

interface FormValues {
  name: string;
  industry_type: string;
  goods_category: string;
  routes: string[];
  amounts: string[];
}

interface FormErrors {
  industry_type?: string;
  goods_category?: string;
  routes?: string;
  name?: string;
}

interface Props {
  values: FormValues;
  errors: FormErrors;
  onChange: (
    field: string,
    value: string | string[] | { [key: number]: string }
  ) => void;
}

const Section1: React.FC<Props> = ({ values, errors, onChange }) => {
  const [goodsData, setGoodsData] = useState<IndustryGroup[]>([]);
  const [industryOptions, setIndustryOptions] = useState<OptionType[]>([]);
  const [goodsOptions, setGoodsOptions] = useState<OptionType[]>([]);
  const [routesOptions, setRoutesOptions] = useState<OptionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const routeCount = useMemo(() => {
    if (Array.isArray(values.routes)) {
      return Math.min(Math.max(values.routes.length, 1), 6);
    }
    return 1;
  }, [values.routes]);

  const handleAddRoute = () => {
    const currentRoutes = values.routes || [];
    const currentAmounts = values.amounts || [];

    if (currentRoutes.length < 6) {
      const updatedRoutes = [...currentRoutes, ""];
      const updatedAmounts = [...currentAmounts, ""];

      onChange("routes", updatedRoutes);
      onChange("amounts", updatedAmounts);
    }
  };

  const handleDelRoute = () => {
    const currentRoutes = values.routes || [];
    const currentAmounts = values.amounts || [];

    if (currentRoutes.length > 0) {
      const updatedRoutes = currentRoutes.slice(0, -1);
      const updatedAmounts = currentAmounts.slice(0, -1);

      onChange("routes", updatedRoutes);
      onChange("amounts", updatedAmounts);
    }
  };

  
  // With this properly formatted statement inside your saveToLocalStorage function:
const saveToLocalStorage = useCallback(() => {
  if (values.industry_type || values.goods_category) {
    const dataToSave = {
      routes: values.routes || [],
      amounts: values.amounts || [],
      industry_type: values.industry_type,
      goods_category: values.goods_category,
      name: values.name,
    };
    const newData = JSON.stringify(dataToSave);
    localStorage.setItem("goodsFormData", newData);
    localStorage.setItem("selectedIndustry", values.industry_type);
    localStorage.setItem("selectedGoods", values.goods_category);
    
    // Get the goods name from the options based on the selected value
    if (values.goods_category) {
      const selectedGoodsOption = goodsOptions.find(
        opt => String(opt.value) === String(values.goods_category)
      );
      if (selectedGoodsOption) {
        localStorage.setItem("selectedGoodsName", selectedGoodsOption.label || "");
      }
    }
  }
}, [values, goodsOptions]);


  const updateGoodsOptions = useCallback(
    (industryType: string) => {
      if (industryType && goodsData.length > 0) {
        const options = getGoodsOptions(goodsData, +industryType);
        setGoodsOptions(options);

        const currentGoodsCategory = String(values.goods_category);
        const isValidGoodsCategory = options.some(
          (opt) => String(opt.value) === currentGoodsCategory
        );

        if (currentGoodsCategory && !isValidGoodsCategory) {
          console.warn(
            `Clearing goods_category "${currentGoodsCategory}" as it's not valid for industry type`
          );
          onChange("goods_category", "");
          onChange("routes", []);
        }
      } else {
        setGoodsOptions([]);
      }
    },
    [goodsData, values.goods_category, onChange]
  );

  const updateRoutesOptions = useCallback(() => {
    if (values.goods_category && values.industry_type) {
      const options = getRoutesOptions(
        goodsData,
        +values.industry_type,
        +values.goods_category
      );
      setRoutesOptions(options);

      const currentRoutes = Array.isArray(values.routes) ? values.routes : [];

      const hasValidRoutes = currentRoutes.some(
        (route) =>
          route && options.some((opt) => String(opt.value) === String(route))
      );

      if (!hasValidRoutes && currentRoutes.length > 0) {
        onChange("routes", []);
        onChange("amounts", []);
      }

      if (
        options.length === 1 &&
        (!currentRoutes.length || currentRoutes.every((r) => !r))
      ) {
        onChange("routes", [String(options[0].value)]);
      }
    } else {
      setRoutesOptions([]);
    }
  }, [
    values.goods_category,
    values.industry_type,
    values.routes,
    goodsData,
    onChange,
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchGoodsData();
        setGoodsData(data);

        const industryOpts = getIndustryOptions(data);
        setIndustryOptions(industryOpts);

        if (values.industry_type) {
          const industryTypeStr = String(values.industry_type);
          const goodsOpts = getGoodsOptions(data, +industryTypeStr);
          setGoodsOptions(goodsOpts);
        }
      } catch (error) {
        console.error("Failed to load goods data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  

  useEffect(() => {
    if (!isLoading) {
      updateGoodsOptions(values.industry_type);
    }
  }, [values.industry_type, isLoading, updateGoodsOptions]);

  useEffect(() => {
    if (!isLoading) {
      updateRoutesOptions();
    }
  }, [values.goods_category, isLoading, updateRoutesOptions]);

  useEffect(() => {
    saveToLocalStorage();
  }, [saveToLocalStorage]);

  const handleRouteChange = (index: number, value: string) => {
    const updatedRoutes = [...(values.routes || [])];

    while (updatedRoutes.length <= index) {
      updatedRoutes.push("");
    }

    updatedRoutes[index] = value;

    while (
      updatedRoutes.length > 0 &&
      updatedRoutes[updatedRoutes.length - 1] === ""
    ) {
      updatedRoutes.pop();
    }

    onChange("routes", updatedRoutes);
  };

  const handleAmountChange = (index: number, value: string) => {
    const updatedAmounts = [...(values.amounts || [])];

    while (updatedAmounts.length <= index) {
      updatedAmounts.push("");
    }

    updatedAmounts[index] = value;

    while (
      updatedAmounts.length > 0 &&
      updatedAmounts[updatedAmounts.length - 1] === ""
    ) {
      updatedAmounts.pop();
    }

    onChange("amounts", updatedAmounts);
  };

  const renderRouteInputs = () => {
    if (routesOptions.length === 0) {
      return (
        <p
          style={{
            color: "#e74c3c",
            padding: "10px",
            backgroundColor: "#fceae9",
            borderRadius: "4px",
          }}
        >
          ไม่มีตัวเลือกวัตถุดิบที่เกี่ยวข้อง
        </p>
      );
    }

    return (
      <>
        <h2> Production Routes </h2>
        <p style={{ marginTop: "0.25rem", color: "#666", fontSize: "14px" }}>
          ระบุรายละเอียดของเทคโนโลยีการผลิต
        </p>
        {[...Array(routeCount)].map((_, index) => (
          <div key={index} style={{ marginBottom: "12px" }}>
            <div
              style={{
                display: "flex",
                gap: "15px",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 3 }}>
                <LabeledAutocompleteMap
                  caption={`Route ${index + 1}`}
                  defination=" เลือกเทคโนโลยีการผลิต"
                  label=""
                  name={`route_${index}`}
                  options={routesOptions.map((opt) => ({
                    ...opt,
                    value: String(opt.value),
                  }))}
                  value={
                    Array.isArray(values.routes)
                      ? values.routes[index] || ""
                      : values.routes?.[index] || ""
                  }
                  error={
                    index === 0 && errors.routes ? errors.routes : undefined
                  }
                  onChange={(val) => handleRouteChange(index, String(val))}
                />
              </div>
              <div style={{ flex: 1 }}>
                <LabeledTextField
                  type="number"
                  caption="Amount"
                  defination="ระบุปริมาณผลิตภัณฑ์ที่ผลิต"
                  unit="Tonne"
                  label=""
                  name={`amount_${index}`}
                  value={
                    Array.isArray(values.amounts)
                      ? values.amounts[index] || ""
                      : values.amounts?.[index] || ""
                  }
                  onChange={(e) => handleAmountChange(index, e.target.value)}
                  inputProps={{
                    step: "0.01",
                    min: "0",
                    placeholder: "Enter amount",
                    className: "appearance-none",
                  }}
                  readOnly={
                    Array.isArray(values.routes)
                      ? !values.routes[index]
                      : !values.routes?.[index]
                  }
                />
              </div>
            </div>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end", // จัดให้ปุ่มอยู่ชิดขวา
            width: "100%", // ให้ div กินพื้นที่เต็มความกว้าง
            marginBottom: "20px", // เพิ่มระยะห่างด้านล่าง (ตามต้องการ)
          }}
        >
          {routeCount < 6 && (
            <button
              type="button"
              style={{
                backgroundColor: "#2ecc71",
                color: "#fff",
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginTop: "15px",
                marginRight: "10px",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                boxShadow: "0 2px 5px rgba(46, 204, 113, 0.3)",
                transition: "all 0.2s ease",
              }}
              onClick={handleAddRoute}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#27ae60";
                e.currentTarget.style.boxShadow =
                  "0 4px 8px rgba(46, 204, 113, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#2ecc71";
                e.currentTarget.style.boxShadow =
                  "0 2px 5px rgba(46, 204, 113, 0.3)";
              }}
            >
              <span style={{ marginRight: "6px", fontSize: "16px" }}>+</span>
              เพิ่ม Route
            </button>
          )}
          {routeCount > 1 && (
            <button
              type="button"
              style={{
                backgroundColor: "#e74c3c",
                color: "#fff",
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginTop: "15px",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                boxShadow: "0 2px 5px rgba(231, 76, 60, 0.3)",
                transition: "all 0.2s ease",
              }}
              onClick={handleDelRoute}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#c0392b";
                e.currentTarget.style.boxShadow =
                  "0 4px 8px rgba(231, 76, 60, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#e74c3c";
                e.currentTarget.style.boxShadow =
                  "0 2px 5px rgba(231, 76, 60, 0.3)";
              }}
            >
              <span style={{ marginRight: "6px", fontSize: "16px" }}>−</span>
              ลบ Route
            </button>
          )}
        </div>

        {routesOptions.length > 6 && (
          <p
            style={{
              color: "#e67e22",
              fontSize: "0.9rem",
              marginTop: "5px",
            }}
          >
            Note: มีวัตถุดิบมากกว่า 6 รายการ แต่จำกัดให้เลือกได้ไม่เกิน 6
          </p>
        )}
      </>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <Section
        defaultExpanded={true}
        title="List of aggregated goods categories and corresponding production routes"
        subtitle="ชื่อและที่อยู่ผู้ทวนสอบ"
        hasError={false}
      >
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p>Loading...</p>
        </div>
      </Section>
    );
  }

  return (
    <Section
      defaultExpanded={true}
      title="List of aggregated goods categories and corresponding production routes"
      subtitle="ระบุรายละเอียดของกลุ่มผลิตภัณฑ์และกระบวนการผลิต"
      hasError={
        !!(
          errors.industry_type ||
          errors.goods_category ||
          errors.routes ||
          errors.name
        )
      }
    >
      <div style={{ marginBottom: "1rem" }}>
        {/* Industry Type, Goods Category, and Name Input */}
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <LabeledAutocompleteMap
              caption="Industry type"
              defination="เลือกประเภทอุตสาหกรรม"
              label=""
              name="industry_type"
              options={industryOptions.map((opt) => ({
                ...opt,
                value: String(opt.value),
              }))}
              value={values.industry_type}
              error={errors.industry_type}
              onChange={(val) => onChange("industry_type", String(val))}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <LabeledAutocompleteMap
              caption="Aggregated goods category"
              defination="เลือกหมวดหมู่ของผลิตภัณฑ์"
              label=""
              name="goods_category"
              options={goodsOptions.map((opt) => ({
                ...opt,
                value: String(opt.value),
              }))}
              value={values.goods_category}
              error={errors.goods_category}
              onChange={(val) => onChange("goods_category", String(val))}
              required
              disabled={!values.industry_type}
            />
          </div>
          <div style={{ flex: 1 }}>
            <LabeledTextField
              caption="Name"
              defination="ระบุชื่อผลิตภัณฑ์"
              label=""
              name="name"
              type="text"
              value={values.name}
              onChange={(e) => onChange("name", e.target.value)}
              error={errors.name}
              helperText={errors.name}
              required
            />
          </div>
        </div>

        {/* Production Routes Input */}
        <div style={{ marginBottom: "1rem" }}>{renderRouteInputs()}</div>

        
      </div>
    </Section>
  );
};

export default Section1;
