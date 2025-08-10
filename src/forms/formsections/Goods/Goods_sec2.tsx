import React, { useMemo } from "react";
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
  const calculatedValues = useMemo(() => {
    // แปลงค่าเป็นตัวเลขเพื่อคำนวณ
    const totalAmount = parseFloat(values.total_production_amounts) || 0;
    const marketAmount = parseFloat(values.produced_for_market_amount) || 0;

    // คำนวณสัดส่วน (b/a) เป็นเปอร์เซ็นต์
    let sharePercentage = 0;
    if (totalAmount > 0) {
      sharePercentage = (marketAmount / totalAmount) * 100;
    }

    // ตรวจสอบว่าเป็น 100% หรือไม่ (ใช้ค่าใกล้เคียงเพื่อหลีกเลี่ยงปัญหาทศนิยม)
    const isOnlyForMarket = Math.abs(sharePercentage - 100) < 0.01;

    return {
      sharePercentage: sharePercentage.toFixed(2), // แปลงเป็นสตริงทศนิยม 2 ตำแหน่ง
      isOnlyForMarket,
    };
  }, [values.total_production_amounts, values.produced_for_market_amount]);

  return (
    <Section
      title="Amount of aggregated goods"
      subtitle="ปริมาณการผลิต"
      hasError={
        !!(
          errors.total_production_amounts ||
          errors.consumed_in_others_amounts ||
          errors.produced_for_market_amount ||
          errors.condumed_non_cbam_goods_amounts
        )
      }
    >
      <div
        style={{
          textAlign: "left",
          marginBottom: "1.5rem",
          fontSize: "18px",
        }}
      >
        <strong>(a) Total production levels:</strong>
        <p
          style={{
            marginTop: "0.25rem",
            color: "#666",
            fontSize: "14px",
          }}
        >
          ปริมาณการสั่งซื้อทั้งหมด
        </p>
      </div>
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
        <div style={{ flex: 1 }}>
          <LabeledTextField
            type="number"
            caption="Amount production levels"
            defination="ระบุปริมาณการผลิตทั้งหมด"
            unit="Tonne"
            label=""
            name="total_production_amounts"
            value={values.total_production_amounts}
            onChange={onChange}
            error={errors.total_production_amounts} // Pass the error for the helper text
            helperText={errors.total_production_amounts} // Show error as helper text
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
            caption="Total production levels"
            defination="ระบุปริมาณการผลิตทั้งหมด"
            unit="Tonne"
            label=""
            name="total_production_amounts"
            value={values.total_production_amounts}
            onChange={onChange}
            error={errors.total_production_amounts} // Pass the error for the helper text
            helperText={errors.total_production_amounts} // Show error as helper text
            inputProps={{
              step: "any",
              placeholder: "",
              className: "appearance-none",
            }}
            readOnly
            disabled
          />
        </div>
      </div>

      <div
        style={{
          textAlign: "left",
          marginBottom: "1.5rem",
          fontSize: "18px",
        }}
      >
        <strong>(b) Production detail:</strong>
        <p
          style={{
            marginTop: "0.25rem",
            color: "#666",
            fontSize: "14px",
          }}
        >
          รายละเอียดผลิตภัณฑ์
        </p>
      </div>

      <LabeledTextField
        type="number"
        caption="Produced for the market"
        defination="ระบุปริมาณการผลิตเพื่อจำหน่าย"
        label=""
        unit="Tonne"
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
      <div
        style={{
          textAlign: "left",
          marginBottom: "2rem",
          fontSize: "14px",
          backgroundColor: "#f5f5f5",
          padding: "12px 16px",
          borderRadius: "6px",
          border: "1px solid #e0e0e0",
        }}
      >
        <p
          style={{
            margin: "4px 0",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontWeight: 500 }}>
            Share of total under (a) produced for the market:
          </span>
          <span style={{ fontWeight: 600, color: "#0190c3" }}>
            {calculatedValues.sharePercentage}%
          </span>
        </p>
        <p
          style={{
            margin: "4px 0",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontWeight: 500 }}>
            Total production only for the market:
          </span>
          <span
            style={{
              fontWeight: 600,
              color: calculatedValues.isOnlyForMarket ? "#4caf50" : "#f44336",
            }}
          >
            {calculatedValues.isOnlyForMarket ? "True" : "False"}
          </span>
        </p>
      </div>

      <div
        style={{
          textAlign: "left",
          marginBottom: "1.5rem",
          fontSize: "18px",
        }}
      >
        <strong>(c) Consumed in other production processes:</strong>
        <p
          style={{
            marginTop: "0.25rem",
            color: "#666",
            fontSize: "14px",
          }}
        >
          ระบุปริมาณการผลิตเพื่อใช้ในโรงงาน
        </p>
      </div>

      <LabeledTextField
        type="number"
        caption="Consumed in other production processes"
        defination="ระบุปริมาณการผลิตเพื่อใช้ในโรงงาน"
        label=""
        name="consumed_in_others_amounts"
        value={values.consumed_in_others_amounts}
        unit="Tonne"
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

      <div
        style={{
          textAlign: "left",
          marginBottom: "1.5rem",
          fontSize: "18px",
        }}
      >
        <strong>(d) Consumed for non-CBAM goods:</strong>
        <p
          style={{
            marginTop: "0.25rem",
            color: "#666",
            fontSize: "14px",
          }}
        >
          ระบุปริมาณการผลิตเพื่อใช้ในโรงงานสำหรับสินค้าที่ไม่อยู่ภายใต้ขอบเขตของ
          CBAM
        </p>
      </div>

      <LabeledTextField
        type="number"
        caption="Consumed for non-CBAM goods"
        defination="ระบุปริมาณการผลิตเพื่อใช้ในโรงงานสำหรับสินค้าที่ไม่อยู่ภายใต้ขอบเขตของ CBAM"
        label=""
        name="condumed_non_cbam_goods_amounts"
        value={values.condumed_non_cbam_goods_amounts}
        unit="Tonne"
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

      <div
        style={{
          textAlign: "left",
          marginBottom: "1.5rem",
          fontSize: "18px",
        }}
      >
        <strong>(e) Control:</strong>
        <p
          style={{
            marginTop: "0.25rem",
            color: "#666",
            fontSize: "14px",
          }}
        >
          ควบคุม
        </p>
      </div>

      <LabeledTextField
        type="number"
        caption="Control"
        defination="ควบคุม"
        label=""
        name="condumed_non_cbam_goods_amounts"
        value={values.condumed_non_cbam_goods_amounts}
        unit="Tonne"
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
    </Section>
  );
};

export default Section2;
