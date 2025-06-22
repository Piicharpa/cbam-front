import React from "react";
import Section from "../../components/Section";
import LabeledTextField from "../../components/LabeledTextField";
import SectionButton from "../../components/SectionButton";

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
  // const Section2: React.FC<Props> = ({ values, errors, onChange, onNext }) => {

  const handleSectionSubmit = () => {
    const validationErrors: { [key: string]: string } = {};

    // Validation logic
    if (!values.total_production_amounts) {
      validationErrors.total_production_amounts = "กรุณากรอกปริมาณการผลิตทั้งหมด"; 
    }
    if (!values.consumed_in_others_amounts) {
      validationErrors.consumed_in_others_amounts = "กรุณากรอกปริมาณการใช้ในกระบวนการผลิตอื่น"; 
    } else if (isNaN(Number(values.consumed_in_others_amounts)) || Number(values.consumed_in_others_amounts) < 0) {
      validationErrors.consumed_in_others_amounts = "กรุณากรอกจำนวนที่ถูกต้อง"; // Must be a valid number
    }
    if (!values.produced_for_market_amount) {
      validationErrors.produced_for_market_amount = "กรุณากรอกปริมาณการผลิตเพื่อจำหน่าย";
    } else if (isNaN(Number(values.produced_for_market_amount)) || Number(values.produced_for_market_amount) < 0) {
      validationErrors.produced_for_market_amount = "กรุณากรอกจำนวนที่ถูกต้อง";
    }
    if (!values.condumed_non_cbam_goods_amounts) {
      validationErrors.condumed_non_cbam_goods_amounts = "กรุณากรอกปริมาณการใช้ของสินค้าที่ไม่อยู่ภายใต้ CBAM"; 
    } else if (isNaN(Number(values.condumed_non_cbam_goods_amounts)) || Number(values.condumed_non_cbam_goods_amounts) < 0) {
      validationErrors.condumed_non_cbam_goods_amounts = "กรุณากรอกจำนวนที่ถูกต้อง";
    }

    // If errors are present, set state and exit
    if (Object.keys(validationErrors).length > 0) {
      // You may want to set errors in state here if needed
      return false;
    }

    return true;
  };

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
          />
        </div>
      </div>
      {/* <div style={{ display: "flex", justifyContent: "right" }}>
        <SectionButton onValidate={handleSectionSubmit} onSuccess={onNext} />
      </div> */}
    </Section>
  );
};

export default Section2;