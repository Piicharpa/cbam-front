export interface Goods {
  goods_id: number;
  name: string;
  routes: string[];
  relevant_precursors: string[];
  industry_type_id: number;
}

export interface IndustryGroup {
  industry_type_id: number;
  goods: Goods[];
}

export interface OptionType {
  label: string;
  value: number | string;
}


// ฟังก์ชัน fetch หลัก
export const fetchGoodsData = async (): Promise<IndustryGroup[]> => {
      const apiUrl = process.env.REACT_APP_API_URL;
  try {
    const response = await fetch(`${apiUrl}/api/cbam/goods`);
    if (!response.ok) {
      throw new Error("Failed to fetch goods data");
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching goods data:", err);
    return [];
  }
};

// แปลงเป็น option สำหรับ Industry Type
export const getIndustryOptions = (data: IndustryGroup[]): OptionType[] => {
  return data.map((group) => ({
    label: industryLabel(group.industry_type_id),
    value: group.industry_type_id,
  }));
};

// Label ชั่วคราวสำหรับ industry_type_id (สามารถแก้ตามจริงได้)
export const industryLabel = (id: number) => {
  switch (id) {
    case 1:
      return "Cement";
    case 2:
      return "Aluminium";
    case 3:
      return "Iron and Steel";
    default:
      return `Industry ${id}`;
  }
};

// ดึง goods category ตาม industry
export const getGoodsOptions = (
  data: IndustryGroup[],
  industryId: number
): OptionType[] => {
  const group = data.find((g) => g.industry_type_id === industryId);
  return group
    ? group.goods.map((g) => ({ label: g.name, value: g.goods_id }))
    : [];
};

// ดึง routes จาก goods id

export const getRoutesOptions = (
  data: IndustryGroup[],
  industryId: number,
  goodsId: number
): OptionType[] => {
  const group = data.find((g) => g.industry_type_id === industryId);
  const goods = group?.goods.find((g) => g.goods_id === goodsId);
  return goods?.routes.map((r) => ({ label: r, value: r })) || [];
};

export const getPrecursorsOptionsAsStrings = (
  data: IndustryGroup[],
  industryTypeId: number,
  goodsId: number
): string[] => {
  const industry = data.find((g) => g.industry_type_id === industryTypeId);
  const goods = industry?.goods.find((item) => item.goods_id === goodsId);
  return goods?.relevant_precursors || [];
};

export const getPrecursorsOptions = (
  data: IndustryGroup[],
  industryTypeId: number,
  goodsId: number
): OptionType[] => {
  const industry = data.find((g) => g.industry_type_id === industryTypeId);
  const goods = industry?.goods.find((item) => item.goods_id === goodsId);
  return goods?.relevant_precursors.map((p) => ({
    label: p,
    value: p,
  })) || [];
};


async function debug() {
  const data = await fetchGoodsData();

  const industryOptions = getIndustryOptions(data);

  if (industryOptions.length > 0) {
    const firstIndustryId = industryOptions[0].value as number;
    const goodsOptions = getGoodsOptions(data, firstIndustryId);

    if (goodsOptions.length > 0) {
      const firstGoodsId = goodsOptions[0].value as number;
      const routesOptions = getRoutesOptions(data, firstIndustryId, firstGoodsId);
    }
  }
}

debug();