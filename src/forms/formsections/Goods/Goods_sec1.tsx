import React, { useState, useEffect } from "react";
import Section from "../../../components/Section";
import SectionButton from "../../../components/SectionButton";
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
  routes: { [key: number]: string };
  amounts: { [key: number]: string };
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
  // onNext: () => void;
}

// const Section1: React.FC<Props> = ({ values, errors, onChange, onNext }) => {
const Section1: React.FC<Props> = ({ values, errors, onChange }) => {
  const [goodsData, setGoodsData] = useState<IndustryGroup[]>([]);
  const [industryOptions, setIndustryOptions] = useState<OptionType[]>([]);
  const [goodsOptions, setGoodsOptions] = useState<OptionType[]>([]);
  const [routesOptions, setRoutesOptions] = useState<OptionType[]>([]);
  const [routeCount, setRouteCount] = useState(
    Math.min(Object.keys(values.routes || {}).length || 1, 6)
  );

  // Fetch goods data and set industry options on mount
  useEffect(() => {
    fetchGoodsData().then((data) => {
      setGoodsData(data);
      const options = getIndustryOptions(data);
      setIndustryOptions(options);
    });
  }, []);

  // Update goods options when industry type changes
  useEffect(() => {
    if (values.industry_type) {
      const options = getGoodsOptions(goodsData, +values.industry_type);
      setGoodsOptions(options);
      if (!options.some((opt) => opt.value === values.goods_category)) {
        onChange("goods_category", "");
        onChange("routes", []);
      }
    } else {
      setGoodsOptions([]);
      setRoutesOptions([]);
    }
  }, [values.industry_type, goodsData]);

  // Update routes options when goods category changes
  useEffect(() => {
    if (values.goods_category && values.industry_type) {
      const options = getRoutesOptions(
        goodsData,
        +values.industry_type,
        +values.goods_category
      );
      setRoutesOptions(options);
      const routeValues = Object.values(values.routes || {});
      if (!options.some((opt) => routeValues.includes(String(opt.value)))) {
        onChange("routes", []);
      }
      if (options.length === 1) {
        onChange("routes", [String(options[0].value)]);
      }
    } else {
      setRoutesOptions([]);
    }
  }, [values.goods_category, values.industry_type, goodsData]);

  // Update count of routes when they change
  useEffect(() => {
    setRouteCount(Math.min(Object.keys(values.routes || {}).length || 1, 6));
  }, [values.routes]);


  // Save data to local storage
  localStorage.setItem(
    "precursorData",
    JSON.stringify({
      routes: values.routes || [],
      amounts: values.amounts || [],
      industry_type: values.industry_type,
      goods_category: values.goods_category,
      precursors: Object.values(values.routes).map((r) => {
        const found = routesOptions.find((opt) => String(opt.value) === r);
        return found?.label || r;
      }),
    })
  );
  console.log(localStorage)

  return (
    <Section
      defaultExpanded={true}
      title="(a) List of aggregated goods categories and corresponding production routes"
      subtitle="ชื่อและที่อยู่ผู้ทวนสอบ"
      hasError={
        !!(errors.industry_type || errors.goods_category || errors.routes)
      }
    >
      <div style={{ marginBottom: "1rem" }}>
        {/* Industry Type and Goods Category Input */}
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
              onChange={(val) => {
                onChange("industry_type", String(val));
              }}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <LabeledAutocompleteMap
              caption="Aggregated goods category"
              defination="เลือกหมวดหมู่สินค้า"
              label=""
              name="goods_category"
              options={goodsOptions.map((opt) => ({
                ...opt,
                value: String(opt.value),
              }))}
              value={values.goods_category}
              error={errors.goods_category}
              onChange={(val) => {
                onChange("goods_category", String(val));
              }}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <LabeledTextField
              caption="Name"
              defination="ชื่อ"
              label=""
              name="ืname"
              type="text"
              value={values.name}
              onChange={(e) => onChange("name", e.target.value)}
              error={errors.name} // Pass the error for the helper text
              helperText={errors.name}
              required
            />
          </div>
        </div>

        {/* Production Routes Input */}
        <div style={{ marginBottom: "1rem" }}>
          {routesOptions.length > 0 ? (
            <>
              <h4>Production Routes</h4>
              <p
                style={{
                  color: "#666",
                  fontSize: "0.9rem",
                  marginBottom: "10px",
                }}
              >
                Please select up to 6 routes that apply
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
                        defination="เลือกวัตถุดิบที่เกี่ยวข้อง"
                        label=""
                        name={`route_${index}`}
                        options={routesOptions.map((opt) => ({
                          ...opt,
                          value: String(opt.value),
                        }))}
                        value={values.routes?.[index] || ""}
                        error={
                          index === 0 && errors.routes
                            ? errors.routes
                            : undefined
                        }
                        onChange={(val) => {
                          const updatedRoutes = {
                            ...values.routes,
                            [index]: String(val),
                          };
                          onChange("routes", updatedRoutes);
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <LabeledTextField
                        type="number"
                        caption="Amount"
                        defination="ปริมาณวัตถุดิบที่เกี่ยวข้อง"
                        label=""
                        name={`amount_${index}`}
                        value={values.amounts?.[index] || ""}
                        onChange={(e) => {
                          const updatedAmounts = {
                            ...values.amounts,
                            [index]: e.target.value,
                          };
                          onChange("amounts", updatedAmounts);
                        }}
                        inputProps={{
                          step: "0.01",
                          min: "0",
                          placeholder: "Enter amount",
                          className: "appearance-none",
                        }}
                        readOnly={!values.routes[index]}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {routeCount < 6 && (
                <button
                  type="button"
                  style={{
                    backgroundColor: "#2ecc71",
                    color: "#fff",
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginTop: "10px",
                  }}
                  onClick={() => setRouteCount((prev) => Math.min(prev + 1, 6))}
                >
                  + เพิ่ม Route
                </button>
              )}
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
          ) : (
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
          )}
        </div>

        {/* Section Button for transitioning to the next step */}
        <div style={{ display: "flex", justifyContent: "right" }}></div>
      </div>
    </Section>
  );
};

export default Section1;
