import React from "react";
import Section from "../../components/Section";
import LabeledTextField from "../../components/LabeledTextField";
import SectionButton from "../../components/SectionButton";

interface Props {
  values: {
    total_consumed_within_installation: string;
    consumed_in_others_amounts: string;
    produced_for_market: string;
    consumed_non_cbam_goods: string;
  };
  errors: {
    total_consumed_within_installation?: string;
    consumed_in_others_amounts?: string;
    produced_for_market?: string;
    consumed_non_cbam_goods?: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // onNext: () => void;
}
const Section2: React.FC<Props> = ({ values, errors, onChange }) => {
  // const Section2: React.FC<Props> = ({ values, errors, onChange, onNext }) => {

  const handleSectionSubmit = () => {
    const validationErrors: { [key: string]: string } = {};

    // Validation logic
    if (!values.total_consumed_within_installation) {
      validationErrors.total_consumed_within_installation = "กรุณากรอกปริมาณการผลิตทั้งหมด"; // Required
    }
    if (!values.consumed_in_others_amounts) {
      validationErrors.consumed_in_others_amounts = "กรุณากรอกปริมาณการใช้ในกระบวนการผลิตอื่น"; // Required
    } else if (isNaN(Number(values.consumed_in_others_amounts)) || Number(values.consumed_in_others_amounts) < 0) {
      validationErrors.consumed_in_others_amounts = "กรุณากรอกจำนวนที่ถูกต้อง"; // Must be a valid number
    }
    if (!values.produced_for_market) {
      validationErrors.produced_for_market = "กรุณากรอกปริมาณการผลิตเพื่อจำหน่าย"; // Required
    } else if (isNaN(Number(values.produced_for_market)) || Number(values.produced_for_market) < 0) {
      validationErrors.produced_for_market = "กรุณากรอกจำนวนที่ถูกต้อง";
    }
    if (!values.consumed_non_cbam_goods) {
      validationErrors.consumed_non_cbam_goods = "กรุณากรอกปริมาณการใช้ของสินค้าที่ไม่อยู่ภายใต้ CBAM"; // Required
    } else if (isNaN(Number(values.consumed_non_cbam_goods)) || Number(values.consumed_non_cbam_goods) < 0) {
      validationErrors.consumed_non_cbam_goods = "กรุณากรอกจำนวนที่ถูกต้อง";
    }

    // If errors are present, set state and exit
    if (Object.keys(validationErrors).length > 0) {
      console.log("Validation errors:", validationErrors);
      // You may want to set errors in state here if needed
      return false;
    }

    return true;
  };

  return (
    <Section
      title="(b) Amount of aggregated goods"
      subtitle="ปริมาณการผลิต"
      hasError={!!(errors.total_consumed_within_installation || errors.consumed_in_others_amounts || errors.produced_for_market || errors.consumed_non_cbam_goods)}
    >
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
        <div style={{ flex: 1 }}>
          <LabeledTextField
            type="text"
            caption="Total production levels"
            defination="กรอกปริมาณการผลิตทั้งหมด"
            label=""
            name="total_consumed_within_installation"
            value={values.total_consumed_within_installation}
            onChange={onChange}
            error={errors.total_consumed_within_installation}  // Pass the error for the helper text
            helperText={errors.total_consumed_within_installation} // Show error as helper text
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
            name="produced_for_market"
            value={values.produced_for_market}
            onChange={onChange}
            error={errors.produced_for_market} // Pass the error for the helper text
            helperText={errors.produced_for_market} // Show error as helper text
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
            name="consumed_non_cbam_goods"
            value={values.consumed_non_cbam_goods}
            onChange={onChange}
            error={errors.consumed_non_cbam_goods} // Pass the error for the helper text
            helperText={errors.consumed_non_cbam_goods} // Show error as helper text
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