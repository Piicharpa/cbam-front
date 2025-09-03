import React, { useMemo } from "react";
import Section from "../../../components/Section";
import LabeledTextField from "../../../components/LabeledTextField";

interface Props {
  values: {
    total_production_amounts: string;
    total_consumed_within_installation: string;
    consumed_in_others_amounts: string;
    produced_for_market_amount: string;
    condumed_non_cbam_goods_amounts: string;
    control: string;
    total_amount?: string;
  };
  errors: {
    total_production_amounts?: string;
    total_consumed_within_installation: string;
    produced_for_market_amount?: string;
    consumed_in_others_amounts?: string;
    condumed_non_cbam_goods_amounts?: string;
    control?: string;
    total_amount?: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // onNext: () => void;
}

const Section2: React.FC<Props> = ({ values, errors, onChange }) => {
  const calculatedValues = useMemo(() => {
    // Convert values to numbers for calculations
    const totalAmount = parseFloat(values.total_production_amounts) || 0;
    const marketAmount = parseFloat(values.produced_for_market_amount) || 0;
    const amountC = parseFloat(values.consumed_in_others_amounts) || 0;
    const amountD = parseFloat(values.condumed_non_cbam_goods_amounts) || 0;

    // Calculate percentage (b/a) as a percentage
    let sharePercentage = 0;
    if (totalAmount > 0) {
      sharePercentage = (marketAmount / totalAmount) * 100;
    }

    // Check if it's 100% (use approximate value to avoid decimal issues)
    const isOnlyForMarket = Math.abs(sharePercentage - 100) < 0.01;

    // Calculate the control amount
    const controlAmount = totalAmount - (marketAmount + amountC + amountD);

    return {
      sharePercentage: sharePercentage.toFixed(2), // Convert to string with 2 decimal places
      isOnlyForMarket,
      controlAmount: controlAmount.toFixed(2), // Format control amount
    };
  }, [
    values.total_production_amounts,
    values.produced_for_market_amount,
    values.condumed_non_cbam_goods_amounts,
    values.consumed_in_others_amounts,
  ]);

  return (
    <Section
      title="Amount of aggregated goods"
      subtitle="ปริมาณการผลิต"
      hasError={
        !!(
          errors.total_consumed_within_installation ||
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
           ประมาณการผลิตทั้งหมด
        </p>
      </div>

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
          <span style={{ fontWeight: 500 }}>Total production levels:</span>
          <span style={{ fontWeight: 600, color: "#0190c3" }}>
            {values.total_production_amounts} t
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
        unit="t"
        name="produced_for_market_amount"
        value={values.produced_for_market_amount}
        onChange={onChange}
        error={errors.produced_for_market_amount}
        helperText={errors.produced_for_market_amount}
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
        unit="t"
        onChange={onChange}
        error={errors.consumed_in_others_amounts}
        helperText={errors.consumed_in_others_amounts}
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
        unit="t"
        onChange={onChange}
        error={errors.condumed_non_cbam_goods_amounts}
        helperText={errors.condumed_non_cbam_goods_amounts}
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
            <span style={{ fontWeight: 500 }}>Total production levels:</span>
            <span style={{ fontWeight: 600, color: "#0190c3" }}>
              {calculatedValues.controlAmount} t
            </span>
          </p>
        </div>
      </div>
      {/* <LabeledTextField
        type="number"
        caption="Control"
        defination="ควบคุม"
        label=""
        name="control"
        value={calculatedValues.controlAmount}
        unit="t"
        onChange={onChange}
        error={errors.control}
        helperText={errors.control} 
        inputProps={{
          step: "any",
          placeholder: "Enter amount",
          className: "appearance-none",
        }}
        required
        disabled
      /> */}
    </Section>
  );
};

export default Section2;
