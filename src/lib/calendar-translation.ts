
export const ECONOMIC_DICTIONARY: Record<string, string> = {
    // Inflation
    "CPI": "CPI 消費者物價指數",
    "Core CPI": "核心 CPI 消費者物價指數",
    "PPI": "PPI 生產者物價指數",
    "Core PPI": "核心 PPI 生產者物價指數",
    "PCE": "PCE 個人消費支出物價指數",
    "Core PCE": "核心 PCE 個人消費支出物價指數",

    // Labor
    "Nonfarm Payrolls": "非農就業人數",
    "Non-Farm Employment Change": "非農就業人數變化",
    "Unemployment Rate": "失業率",
    "Initial Jobless Claims": "初領失業金人數",
    "Continuing Jobless Claims": "續領失業金人數",
    "ADP Nonfarm Employment Change": "ADP 小非農就業人數",
    "JOLTs Job Openings": "JOLTs 職缺數",
    "Average Hourly Earnings": "平均每小時薪資",

    // Central Bank
    "Fed Interest Rate Decision": "聯準會利率決議",
    "FOMC Minutes": "FOMC 會議紀要",
    "FOMC Statement": "FOMC 政策聲明",
    "Fed Chair Powell Speaks": "鮑爾主席談話",
    "Interest Rate Decision": "利率決議",

    // Economy
    "GDP": "GDP 國內生產毛額",
    "Retail Sales": "零售銷售",
    "Core Retail Sales": "核心零售銷售",
    "ISM Manufacturing PMI": "ISM 製造業採購經理人指數",
    "ISM Non-Manufacturing PMI": "ISM 非製造業採購經理人指數",
    "Services PMI": "服務業 PMI",
    "Manufacturing PMI": "製造業 PMI",
    "CB Consumer Confidence": "諮商會消費者信心指數",
    "Michigan Consumer Sentiment": "密西根大學消費者信心指數",
    "Building Permits": "建築許可",
    "New Home Sales": "新屋銷售",
    "Existing Home Sales": "成屋銷售",
    "Durable Goods Orders": "耐久財訂單",
    "Factory Orders": "工廠訂單",
    "Trade Balance": "貿易收支",
    "Current Account": "經常帳",
    "Crude Oil Inventories": "原油庫存",

    // Taiwan Specific & Others
    "Export orders": "外銷訂單",
    "Export Orders": "外銷訂單",
    "Current account": "經常帳",
    // "Current Account": "經常帳", // Removed duplicate
    "Seasonally adjusted unemployment rate": "經季調失業率",
    "M2 Currency Total": "M2 貨幣總計",
    "Foreign exchange reserves": "外匯存底",
    "Merchandise export": "商品出口",
    "Merchandise import": "商品進口",
    "Merchandise": "商品貿易", // Fallback
    "Trade account": "貿易帳",
    "Trade balance": "貿易收支",
    "Industrial production": "工業生產",
    "Manufacturing purchasing managers 'index": "製造業採購經理人指數", // handling specific typo/formatting from source if needed
    "Manufacturing purchasing managers": "製造業採購經理人指數",
    "Consumer Price Index": "消費者物價指數",

    // Units/Descriptions cleanup (optional, handled by keys)
    "(Year on Year)": "(年增率)",
    "(YoY)": "(年增率)",
    "(MoM)": "(月增率)",
    "(QoQ)": "(季增率)",
};

export const TIME_PERIOD_MAP: Record<string, string> = {
    "(YoY)": "(年增率)",
    "(MoM)": "(月增率)",
    "(QoQ)": "(季增率)",
    "Preliminary": "初值",
    "Final": "終值",
    "Revised": "修正值",
};

export function translateEventName(englishName: string): string {
    let name = englishName;

    // 1. Keyword Mapping (Longest match first to avoid partial replacements like CPI inside Core CPI if not ordered)
    // Actually the logic below iterates through keys. 
    // We should try to find the "Main Subject" and replace it.

    for (const [key, value] of Object.entries(ECONOMIC_DICTIONARY)) {
        if (name.includes(key)) {
            name = name.replace(key, value);
            break; // Stop after primary match to avoid double translation if possible, or maybe continue for modifiers? 
            // Usually "Core CPI (MoM)" -> "核心 CPI (MoM)" is good.
        }
    }

    // 2. Modifiers Mapping
    for (const [key, value] of Object.entries(TIME_PERIOD_MAP)) {
        name = name.replace(key, value);
    }

    return name;
}
