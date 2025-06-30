import React from "react";
import Section from "../../../components/Section";
import LabeledTextField from "../../../components/LabeledTextField";

interface Props {
  values: {
    total_production_amounts: string;
    consumed_in_others_amounts: string;
    produced_for_market_amount: string;
    condumed_non_cbam_goods_amounts: string;
  };
  errors: {
    total_production_amounts?: string;
    consumed_in_others_amounts?: string;
    produced_for_market_amount?: string;
    condumed_non_cbam_goods_amounts?: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // onNext: () => void;
}
const Section2: React.FC<Props> = ({ values, errors, onChange }) => {
  return (
    <Section
      title="(b) Amount of aggregated goods"
      subtitle="ปริมาณการผลิต"
      hasError={!!(errors.total_production_amounts || errors.consumed_in_others_amounts || errors.produced_for_market_amount || errors.condumed_non_cbam_goods_amounts)}
    >
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
        <div style={{ flex: 1 }}>
          <LabeledTextField
            type="number"
            caption="Total production levels"
            defination="กรอกปริมาณการผลิตทั้งหมด"
            label=""
            name="total_production_amounts"
            value={values.total_production_amounts}
            onChange={onChange}
            error={errors.total_production_amounts}  // Pass the error for the helper text
            helperText={errors.total_production_amounts} // Show error as helper text
            inputProps={{
              step: "any",
              placeholder: "Enter amount",
              className: "appearance-none",
            }}
            required
          />
          <LabeledTextField
            type="number"
            caption="Consumed in other production processes"
            defination="กรอกปริมาณการผลิตเพื่อใช้ในโรงงาน"
            label=""
            name="consumed_in_others_amounts"
            value={values.consumed_in_others_amounts}
            onChange={onChange}
            error={errors.consumed_in_others_amounts} // Pass the error for the helper text
            helperText={errors.consumed_in_others_amounts} // Show error as helper text
            inputProps={{
              step: "any",
              placeholder: "Enter amount",
              className: "appearance-none",
            }}
            required
          />
        </div>
        <div style={{ flex: 1 }}>
          <LabeledTextField
            type="number"
            caption="Produced for the market"
            defination="กรอกปริมาณการผลิตเพื่อจำหน่าย"
            label=""
            name="produced_for_market_amount"
            value={values.produced_for_market_amount}
            onChange={onChange}
            error={errors.produced_for_market_amount} // Pass the error for the helper text
            helperText={errors.produced_for_market_amount} // Show error as helper text
            inputProps={{
              step: "any",
              placeholder: "Enter amount",
              className: "appearance-none",
            }}
            required
          />
          
          <LabeledTextField
            type="number"
            caption="Consumed for non-CBAM goods"
            defination="กรอกปริมาณการผลิตเพื่อใช้ในโรงงานสำหรับสินค้าที่ไม่อยู่ภายใต้ขอบเขตของ CBAM"
            label=""
            name="condumed_non_cbam_goods_amounts"
            value={values.condumed_non_cbam_goods_amounts}
            onChange={onChange}
            error={errors.condumed_non_cbam_goods_amounts} // Pass the error for the helper text
            helperText={errors.condumed_non_cbam_goods_amounts} // Show error as helper text
            inputProps={{
              step: "any",
              placeholder: "Enter amount",
              className: "appearance-none",
            }}
            required
          />
        </div>
      </div>
    </Section>
  );
};

export default Section2;