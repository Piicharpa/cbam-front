// PrecursorFields.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import LabeledTextField from '../../components/LabeledTextField';
import LabeledAutocomplete from '../../components/LabeledAutoComplete';
import LabeledAutocompleteMap from '../../components/LabeledAutoCompleteMap';
import { CountryOption } from '../../components/dropdown/contriesmap';
import { fetchGoodsData, getRoutesOptions, OptionType } from '../../components/dropdown/goods';
import { justification } from '../../components/dropdown/justification';
import Box from '@mui/material/Box';
import type { PrecursorSubmitData } from '../PrecursorsForm'; // Import the shared type

interface PrecursorFieldsProps {
  index: number;
  formValues: { [key: string]: string | number | undefined };
  formErrors: { [key: string]: string | undefined };
  countries: CountryOption[];
  onChange: (name: string, value: string | number | (string | number)[]) => void;
  precursorValue?: string;
  routeValue?: string;
  industryTypeId?: number;
  goodsId?: number;
  onSave?: (data: PrecursorSubmitData) => void;
  isSaved?: boolean;
}

// PrecursorFields.tsx (continued)
const PrecursorFields: React.FC<PrecursorFieldsProps> = ({
  index,
  formValues,
  formErrors,
  countries,
  onChange,
  precursorValue = '',
  routeValue = '',
  industryTypeId,
  goodsId,
  onSave,
  isSaved = false,
}) => {
  const [routeOptions, setRouteOptions] = useState<OptionType[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(false);
  const [routeCount, setRouteCount] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Load route options based on industryTypeId and goodsId
  useEffect(() => {
    const loadRouteOptions = async () => {
      if (industryTypeId && goodsId) {
        setIsLoadingRoutes(true);
        try {
          const data = await fetchGoodsData();
          const routesOptions = getRoutesOptions(data, industryTypeId, goodsId);
          setRouteOptions(routesOptions);
        } catch (error) {
          console.error('Error loading route options:', error);
          setRouteOptions([]);
        } finally {
          setIsLoadingRoutes(false);
        }
      }
    };
    loadRouteOptions();
  }, [industryTypeId, goodsId]);
  
  // Set default values and handle initial setup
  useEffect(() => {
    if (!formValues[`country_code_${index}`] && countries.length > 0) {
      const thailandOption = countries.find(
        (country) => country.label === 'Thailand' || country.abbreviation === 'TH'
      );
      if (thailandOption && thailandOption.abbreviation !== undefined) {
        onChange(`country_code_${index}`, thailandOption.abbreviation);
      }
    }
    
    if (precursorValue) {
      onChange(`purchased_precursors_${index}`, precursorValue);
    }
    
    if (routeValue) {
      onChange(`route_${index}`, routeValue);
    }
  }, [countries, index, onChange, precursorValue, routeValue, formValues]);
  
  // Handle input value changes
  const handleInputChange = (name: string, value: string | number | (string | number)[]) => {
    onChange(name, value);
  };
  
  // Handle save button click
  const handleSave = () => {
    if (!onSave) return;

    setIsSaving(true);

    // Construct the precursor data from form values
    const precursorData: PrecursorSubmitData = {
      route: formValues[`purchased_precursors_${index}`] as string,
      amount: parseFloat(formValues[`amount_${index}`]?.toString() || '0'),
      country_code: formValues[`country_code_${index}`] as string,
      embedded_direct_emissions_value: parseFloat(formValues[`embedded_direct_emissions_value_${index}`]?.toString() || '0'),
      source_embedded_direct_emissions: formValues[`source_embedded_direct_emissions_${index}`] as string,
      embedded_indirect_emissions_value: parseFloat(formValues[`embedded_indirection_emissions_value_${index}`]?.toString() || '0'),
      source_embedded_indirect_emissions: formValues[`source_embedded_indirect_emissions_${index}`] as string,
      justification_for_use_default_values: formValues[`justification_for_use_default_values_${index}`] as string,
    };

    // Call the save function provided by parent
    const result = onSave(precursorData) as Promise<unknown> | void;
    if (typeof result !== 'undefined' && typeof result === 'object' && typeof (result as Promise<unknown>).finally === 'function') {
      (result as Promise<unknown>).finally(() => {
        setIsSaving(false);
      });
    } else {
      setIsSaving(false);
    }
  };
  
  return (
    <div
      className="precursor-field-group"
      style={{
        marginBottom: '20px',
        padding: '15px',
        border: '1px solid #e0e0e0',
        borderColor: isSaved ? '#2ecc71' : '#e0e0e0',
        borderRadius: '4px',
        position: 'relative',
      }}
    >
      {/* Saved indicator */}
      {isSaved && (
        <div 
          style={{ 
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: '#2ecc71',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          Saved
        </div>
      )}
      
      <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Precursor {index}</h4>
      
      <LabeledTextField
        caption="Purchased precursor"
        defination="รายการวัตถุดิบ"
        label=""
        name={`purchased_precursors_${index}`}
        value={formValues[`purchased_precursors_${index}`] || ''}
        onChange={(e) => handleInputChange(e.target.name, e.target.value)}
        error={formErrors[`purchased_precursors_${index}`]}
        readOnly
      />
      
      <LabeledAutocomplete
        caption="Country code"
        defination="เลือกรหัสประเทศที่นำเข้าวัตถุดิบ"
        label=""
        name={`country_code_${index}`}
        error={formErrors[`country_code_${index}`]}
        options={countries.map((c) => c.label)}
        value={String(formValues[`country_code_${index}`] || 'TH')}
        onChange={(val) => handleInputChange(`country_code_${index}`, val)}
      />
      {/* Dynamic Routes Section */}
      <Box mb={3}>
        {Array.from({ length: routeCount }).map((_, routeIndex) => (
          <Box key={routeIndex} display="flex" gap={3} mb={3}>
            <Box flex={1}>
              <LabeledAutocomplete
                caption={`Production Route ${routeIndex + 1}`}
                defination="เลือกเทคโนโลยีการผลิตที่ใช้วัตถุดิบนี้"
                label=""
                name={`route_${routeIndex}_${index}`}
                error={formErrors[`route_${routeIndex}_${index}`]}
                options={routeOptions.map((option) => option.label)}
                value={String(formValues[`route_${routeIndex}_${index}`] ?? '')}
                onChange={(val) => handleInputChange(`route_${routeIndex}_${index}`, val)}
                disabled={isLoadingRoutes || routeOptions.length === 0}
                helperText={
                  isLoadingRoutes
                    ? 'Loading routes...'
                    : routeOptions.length === 0
                    ? 'No routes available'
                    : ''
                }
              />
            </Box>
            <Box flex={1}>
              <LabeledTextField
                caption={`Amount for Route ${routeIndex + 1}`}
                defination="จำนวน"
                label=""
                type="number"
                name={`amount_${routeIndex}_${index}`}
                value={formValues[`amount_${routeIndex}_${index}`] || ''}
                onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                error={formErrors[`amount_${routeIndex}_${index}`]}
              />
            </Box>
          </Box>
        ))}
        
        {/* Route Buttons Container */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '10px',
          }}
        >
          <div> {/* Left side container */}
            {routeCount < 6 && (
              <button
                type="button"
                style={{
                  backgroundColor: '#2ecc71',
                  color: '#fff',
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px',
                }}
                onClick={() => setRouteCount((prev) => Math.min(prev + 1, 6))}
              >
                + เพิ่ม Route
              </button>
            )}
            
            {routeCount > 1 && (
              <button
                type="button"
                style={{
                  backgroundColor: '#e74c3c',
                  color: '#fff',
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onClick={() => setRouteCount((prev) => prev - 1)}
              >
                - ลบ Route
              </button>
            )}
          </div>
          </div>
          </Box>

      <Box mb={3}>
        <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
          <strong>Specific embedded direct emissions (SEE (direct)) Unit: tCO2e/t</strong>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <LabeledTextField
              type="number"
              caption=""
              defination="กรอกเป็นตัวเลขของค่า SEE direct ของวัตถุดิบตั้งต้น"
              label=""
              name={`embedded_direct_emissions_value_${index}`}
              value={formValues[`embedded_direct_emissions_value_${index}`]}
              onChange={(e) => handleInputChange(e.target.name, e.target.value)}
              error={formErrors[`embedded_direct_emissions_value_${index}`]}
            />
          </div>
          <div style={{ flex: 1 }}>
            <LabeledAutocompleteMap
              caption=""
              defination="ระบุแหล่งที่มาของข้อมูล"
              label=""
              name={`source_embedded_direct_emissions_${index}`}
              options={[
                { label: '', value: 'Source' },
                { label: 'Measured', value: 'Measured' },
                { label: 'Default', value: 'Default' },
                { label: 'Unknown', value: 'Unknown' },
              ]}
              value={formValues[`source_embedded_direct_emissions_${index}`] ?? ''}
              error={formErrors[`source_embedded_direct_emissions_${index}`]}
              onChange={(val) => handleInputChange(`source_embedded_direct_emissions_${index}`, val)}
            />
          </div>
        </div>
      </Box>
      <Box mb={3}>
        <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
          <strong>Specific electricity consumption (for SEE (indirect)) Unit: MWh/t</strong>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <LabeledTextField
              type="number"
              caption=""
              defination="กรอกเป็นค่าตัวเลขของ SEE indirect ของวัตถุดิบตั้งต้น"
              label=""
              name={`embedded_indirection_emissions_value_${index}`}
              value={formValues[`embedded_indirection_emissions_value_${index}`]}
              onChange={(e) => handleInputChange(e.target.name, e.target.value)}
              error={formErrors[`embedded_indirection_emissions_value_${index}`]}
            />
          </div>
          <div style={{ flex: 1 }}>
            <LabeledAutocompleteMap
              caption=""
              defination="ระบุแหล่งที่มาของข้อมูล"
              label=""
              name={`source_embedded_indirect_emissions_${index}`}
              options={[
                { label: '', value: 'Source' },
                { label: 'Measured', value: 'Measured' },
                { label: 'Default', value: 'Default' },
                { label: 'Unknown', value: 'Unknown' },
              ]}
              value={formValues[`source_embedded_indirect_emissions_${index}`] ?? ''}
              error={formErrors[`source_embedded_indirect_emissions_${index}`]}
              onChange={(val) => handleInputChange(`source_embedded_indirect_emissions_${index}`, val)}
            />
          </div>
        </div>
      </Box>
      
      <Box mb={3}>
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <LabeledAutocomplete
              caption="Justification for use of default values (if relevant)"
              defination="กรอกเหตุผลในการใช้ค่ากลาง (ถ้าเกี่ยวข้อง)"
              label=""
              name={`justification_for_use_default_values_${index}`}
              options={justification.map(j => j.name)} // Map to string array for options
              value={String(formValues[`justification_for_use_default_values_${index}`] ?? '')}
              error={formErrors[`justification_for_use_default_values_${index}`]}
              onChange={(val) => handleInputChange(`justification_for_use_default_values_${index}`, val)}
            />
          </div>
        </div>
      </Box>
          
          {/* Save Button - Right aligned */}
          <button
            type="button"
            style={{
              backgroundColor: isSaved ? '#3498db' : '#f39c12',
              color: '#fff',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={handleSave}
            disabled={isSaving || !onSave}
          >
            {isSaving ? 'Saving...' : isSaved ? 'Update' : 'Save Precursor'}
            {isSaved && (
              <span style={{ marginLeft: '5px', fontSize: '16px' }}>✓</span>
            )}
          </button>
        </div>
      // </Box>
    // </div>
  );
};

export default PrecursorFields;