export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface RumourPrediction {
  id: number;
  risk: RiskLevel;
  riskScore: number;
  title: string;
  channel: string;
  trigger: string;
  historicalMatch: string;
  timeToSpread: string;
  demographicRisk: string;
  counterNarratives: {
    en: string;
    zh: string;
    ms: string;
    ta: string;
  };
  sources: { label: string; url: string }[];
  policyRecommendations: string[];
}

export interface HistoricalPattern {
  event: string;
  similarity: number;
}

export interface AnalyzeStep {
  label: string;
  icon: string;
}

export interface DemoScenario {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  announcementText: string;
  analyzeSteps: AnalyzeStep[];
  predictions: RumourPrediction[];
  historicalPatterns: HistoricalPattern[];
  communityLeadersCount: number;
  constituencies: number;
}

export type Language = "en" | "zh" | "ms" | "ta";

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  zh: "中文",
  ms: "Bahasa Melayu",
  ta: "தமிழ்",
};

export const LANGUAGE_FLAGS: Record<Language, string> = {
  en: "\u{1F1EC}\u{1F1E7}",
  zh: "\u{1F1E8}\u{1F1F3}",
  ms: "\u{1F1F2}\u{1F1FE}",
  ta: "\u{1F1EE}\u{1F1F3}",
};

// Deduplicated flat array of all sources across predictions
export const DEMO_SOURCES: { label: string; url: string }[] = (() => {
  const seen = new Set<string>();
  const sources: { label: string; url: string }[] = [];
  for (const p of [
    {
      sources: [
        { label: "Gov.sg — No need to panic buy", url: "https://www.gov.sg/article/no-need-to-panic-buy-singapore-has-sufficient-supply-of-food-and-essential-items" },
        { label: "SFA — Food Supply Assurance", url: "https://www.sfa.gov.sg/food-farming/singapore-food-supply/food-supply-sources" },
        { label: "CNA — Supermarkets restock shelves", url: "https://www.channelnewsasia.com/singapore/covid-19-supermarkets-restock-shelves-panic-buying-dorscon-orange-941711" },
      ]
    },
    {
      sources: [
        { label: "MOH — COVID-19 Situation Update", url: "https://www.moh.gov.sg/covid-19" },
        { label: "MOH — Daily Case Reports", url: "https://www.moh.gov.sg/covid-19/past-updates" },
        { label: "WHO — Singapore Transparency Commendation", url: "https://www.who.int/singapore" },
      ]
    },
    {
      sources: [
        { label: "MOH — COVID-19 Situation Report", url: "https://www.moh.gov.sg/covid-19" },
        { label: "MOM — Advisory on Migrant Workers", url: "https://www.mom.gov.sg/covid-19/advisory-on-safe-distancing-measures" },
        { label: "POFMA Office — Correction Directions", url: "https://www.pofmaoffice.gov.sg/regulations/protection-from-online-falsehoods-and-manipulation-act/" },
      ]
    },
    {
      sources: [
        { label: "MOH — Official Medical Guidance", url: "https://www.moh.gov.sg/covid-19/vaccination" },
        { label: "HSA — Safety Alerts on Unproven Remedies", url: "https://www.hsa.gov.sg/consumer-safety/articles/covid19_unproven_claims" },
        { label: "POFMA — Correction on False Cure Claims", url: "https://www.pofmaoffice.gov.sg/regulations/protection-from-online-falsehoods-and-manipulation-act/" },
      ]
    },
  ]) {
    for (const s of p.sources) {
      if (!seen.has(s.url)) {
        seen.add(s.url);
        sources.push(s);
      }
    }
  }
  return sources;
})();

export const DEMO_SCENARIO: DemoScenario = {
  id: "dorscon-orange-2020",
  title: "ContextGuard",
  subtitle: "Rumour Pre-Mortem Engine \u2014 Singapore",
  date: "7 Feb 2020",
  communityLeadersCount: 847,
  constituencies: 23,
  announcementText: `MINISTRY OF HEALTH \u2014 PRESS RELEASE

Singapore confirms 3 new clusters of COVID-19 cases linked to community transmission. Total confirmed cases now at 98. The Multi-Ministry Taskforce is closely monitoring the situation.

The Disease Outbreak Response System Condition (DORSCON) level has been raised from Yellow to Orange. This means the virus is severe and spreads easily from person to person, but has not spread widely in Singapore and is being contained.

Members of the public are advised to continue practising good personal hygiene. There is no need to panic-buy essential supplies. Singapore has sufficient national stockpiles.

\u2014 Ministry of Health, Singapore`,
  analyzeSteps: [
    { label: "Classifying announcement topic & context", icon: "\u{1F50D}" },
    { label: "Identifying affected language communities", icon: "\u{1F30F}" },
    { label: "Scanning emotional risk vectors", icon: "\u26A1" },
    {
      label: "Matching against SG rumour corpus (1,247 historical patterns)",
      icon: "\u{1F9E0}",
    },
    { label: "Generating multilingual counter-narratives", icon: "\u{1F4DD}" },
    { label: "Calibrating virality risk scores", icon: "\u{1F4CA}" },
  ],
  historicalPatterns: [
    { event: "DORSCON Orange Upgrade (Feb 2020)", similarity: 94 },
    { event: "Circuit Breaker Announcement (Apr 2020)", similarity: 87 },
    { event: "Phase 2 Heightened Alert (Jul 2021)", similarity: 72 },
    { event: "CPF Adjustment Notice (2019)", similarity: 41 },
  ],
  predictions: [
    {
      id: 1,
      risk: "CRITICAL",
      riskScore: 94,
      title: "Supermarkets running out of rice and essential supplies",
      channel: "Mandarin & dialect WhatsApp groups",
      trigger: "Supply scarcity anxiety",
      historicalMatch:
        "DORSCON Orange (Feb 2020) \u2014 identical panic-buying rumour spread via forwarded voice notes in Hokkien/Mandarin",
      timeToSpread: "~4-6 hours",
      demographicRisk: "Elderly Chinese-speaking households (60+)",
      counterNarratives: {
        en: "Singapore maintains strategic national stockpiles of essential goods including rice. Current supply levels are stable and being replenished daily. All major supermarkets confirm normal restocking operations. There is no need to purchase more than your usual amount.",
        zh: "\u65B0\u52A0\u5761\u4FDD\u6301\u5145\u8DB3\u7684\u56FD\u5BB6\u6218\u7565\u50A8\u5907\uFF0C\u5305\u62EC\u5927\u7C73\u7B49\u5FC5\u9700\u54C1\u3002\u76EE\u524D\u4F9B\u5E94\u6C34\u5E73\u7A33\u5B9A\uFF0C\u6BCF\u65E5\u6B63\u5E38\u8865\u8D27\u3002\u5404\u5927\u8D85\u5E02\u5747\u786E\u8BA4\u8865\u8D27\u8FD0\u4F5C\u6B63\u5E38\u3002\u65E0\u9700\u62A2\u8D2D\u8D85\u8FC7\u65E5\u5E38\u6240\u9700\u7684\u6570\u91CF\u3002",
        ms: "Singapura mengekalkan stok simpanan strategik negara bagi barangan keperluan termasuk beras. Tahap bekalan semasa stabil dan diisi semula setiap hari. Semua pasar raya utama mengesahkan operasi pengisian stok berjalan seperti biasa. Tidak perlu membeli lebih daripada jumlah biasa anda.",
        ta: "\u0B85\u0BB0\u0BBF\u0B9A\u0BBF \u0B89\u0BB3\u0BCD\u0BB3\u0BBF\u0B9F\u0BCD\u0B9F \u0B85\u0BA4\u0BCD\u0BA4\u0BBF\u0BAF\u0BBE\u0BB5\u0B9A\u0BBF\u0BAF\u0BAA\u0BCD \u0BAA\u0BCA\u0BB0\u0BC1\u0B9F\u0BCD\u0B95\u0BB3\u0BBF\u0BA9\u0BCD \u0BA4\u0BC7\u0B9A\u0BBF\u0BAF \u0BAE\u0BC2\u0BB2\u0BCB\u0BAA\u0BBE\u0BAF \u0B87\u0BB0\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BC8 \u0B9A\u0BBF\u0B99\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0BC2\u0BB0\u0BCD \u0BAA\u0BB0\u0BBE\u0BAE\u0BB0\u0BBF\u0BA4\u0BCD\u0BA4\u0BC1 \u0BB5\u0BB0\u0BC1\u0B95\u0BBF\u0BB1\u0BA4\u0BC1. \u0BA4\u0BB1\u0BCD\u0BAA\u0BCB\u0BA4\u0BC8\u0BAF \u0BB5\u0BBF\u0BA8\u0BBF\u0BAF\u0BCB\u0B95 \u0BA8\u0BBF\u0BB2\u0BC8 \u0BA8\u0BBF\u0BB2\u0BC8\u0BAF\u0BBE\u0B95\u0BB5\u0BC1\u0BAE\u0BCD, \u0BA4\u0BBF\u0BA9\u0BAE\u0BC1\u0BAE\u0BCD \u0BA8\u0BBF\u0BB0\u0BAA\u0BCD\u0BAA\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD \u0BB5\u0BB0\u0BC1\u0B95\u0BBF\u0BB1\u0BA4\u0BC1. \u0BAA\u0BA4\u0B9F\u0BCD\u0B9F\u0BAE\u0BCD \u0B85\u0B9F\u0BC8\u0BAF \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BBE\u0BAE\u0BCD.",
      },
      sources: [
        { label: "Gov.sg — No need to panic buy", url: "https://www.gov.sg/article/no-need-to-panic-buy-singapore-has-sufficient-supply-of-food-and-essential-items" },
        { label: "SFA — Food Supply Assurance", url: "https://www.sfa.gov.sg/food-farming/singapore-food-supply/food-supply-sources" },
        { label: "CNA — Supermarkets restock shelves", url: "https://www.channelnewsasia.com/singapore/covid-19-supermarkets-restock-shelves-panic-buying-dorscon-orange-941711" },
      ],
      policyRecommendations: [
        "Impose temporary per-customer purchase limits on rice and essential staples at major supermarkets and deploy real-time inventory dashboards on gov.sg showing stock levels",
      ],
    },
    {
      id: 2,
      risk: "HIGH",
      riskScore: 82,
      title: "Government hiding true number of COVID cases",
      channel: "English Twitter/X & Reddit r/singapore",
      trigger: "Institutional distrust",
      historicalMatch:
        "Multiple POFMA cases (2020-2021) \u2014 recurring claims of suppressed case counts, especially during cluster discoveries",
      timeToSpread: "~8-12 hours",
      demographicRisk: "Young adults (25-40), English-speaking, digitally active",
      counterNarratives: {
        en: "MOH publishes daily case counts verified by hospital laboratories and PCR testing facilities. All data is audited independently. Singapore\u2019s COVID reporting has been recognised internationally for its transparency. Full breakdown available at moh.gov.sg.",
        zh: "\u536B\u751F\u90E8\u6BCF\u65E5\u516C\u5E03\u7ECF\u533B\u9662\u5B9E\u9A8C\u5BA4\u548CPCR\u68C0\u6D4B\u673A\u6784\u6838\u5B9E\u7684\u75C5\u4F8B\u6570\u636E\u3002\u6240\u6709\u6570\u636E\u5747\u7ECF\u72EC\u7ACB\u5BA1\u8BA1\u3002\u65B0\u52A0\u5761\u7684\u65B0\u51A0\u75AB\u60C5\u62A5\u544A\u56E0\u5176\u900F\u660E\u5EA6\u83B7\u5F97\u56FD\u9645\u8BA4\u53EF\u3002\u8BE6\u60C5\u8BF7\u8BBF\u95EE moh.gov.sg\u3002",
        ms: "KKM menerbitkan jumlah kes harian yang disahkan oleh makmal hospital dan kemudahan ujian PCR. Semua data diaudit secara bebas. Pelaporan COVID Singapura diiktiraf di peringkat antarabangsa. Maklumat lanjut di moh.gov.sg.",
        ta: "MOH \u0B86\u0BB2\u0BCD \u0BA4\u0BBF\u0BA9\u0B9A\u0BB0\u0BBF \u0BB5\u0BB4\u0B95\u0BCD\u0B95\u0BC1 \u0B8E\u0BA3\u0BCD\u0BA3\u0BBF\u0B95\u0BCD\u0B95\u0BC8\u0B95\u0BB3\u0BCD \u0BAE\u0BB0\u0BC1\u0BA4\u0BCD\u0BA4\u0BC1\u0BB5\u0BAE\u0BA9\u0BC8 \u0B86\u0BAF\u0BCD\u0BB5\u0B95\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0BAE\u0BC2\u0BB2\u0BAE\u0BCD \u0B9A\u0BB0\u0BBF\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BC1\u0B95\u0BBF\u0BA9\u0BCD\u0BB1\u0BA9. \u0B9A\u0BBF\u0B99\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0BC2\u0BB0\u0BBF\u0BA9\u0BCD \u0BB5\u0BC6\u0BB3\u0BBF\u0BAA\u0BCD\u0BAA\u0B9F\u0BC8\u0BA4\u0BCD\u0BA4\u0BA9\u0BCD\u0BAE\u0BC8 \u0B9A\u0BB0\u0BCD\u0BB5\u0BA4\u0BC7\u0B9A \u0B85\u0BB3\u0BB5\u0BBF\u0BB2\u0BCD \u0B85\u0B99\u0BCD\u0B95\u0BC0\u0B95\u0BB0\u0BBF\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BC1\u0BB3\u0BCD\u0BB3\u0BA4\u0BC1.",
      },
      sources: [
        { label: "MOH — COVID-19 Situation Update", url: "https://www.moh.gov.sg/covid-19" },
        { label: "MOH — Daily Case Reports", url: "https://www.moh.gov.sg/covid-19/past-updates" },
        { label: "WHO — Singapore Transparency Commendation", url: "https://www.who.int/singapore" },
      ],
      policyRecommendations: [
        "Pre-publish daily case data with methodology notes and launch a dedicated moh.gov.sg/transparency page before media briefings to eliminate the information vacuum",
      ],
    },
    {
      id: 3,
      risk: "HIGH",
      riskScore: 76,
      title:
        "Specific ethnic or migrant worker communities blamed as source of spread",
      channel: "Malay & Tamil community Telegram groups",
      trigger: "Racial scapegoating & in-group fear",
      historicalMatch:
        "Dormitory cluster coverage (Apr 2020) \u2014 xenophobic narratives blaming migrant workers circulated widely across all language communities",
      timeToSpread: "~6-10 hours",
      demographicRisk:
        "Cross-community, amplified by sensationalist framing",
      counterNarratives: {
        en: "COVID-19 spreads through human contact regardless of race, nationality or community. Attributing spread to specific groups is medically inaccurate and socially harmful. All communities in Singapore are working together under the same public health measures.",
        zh: "\u65B0\u51A0\u75C5\u6BD2\u901A\u8FC7\u4EBA\u9645\u63A5\u89E6\u4F20\u64AD\uFF0C\u4E0E\u79CD\u65CF\u3001\u56FD\u7C4D\u6216\u793E\u533A\u65E0\u5173\u3002\u5C06\u4F20\u64AD\u5F52\u549A\u4E8E\u7279\u5B9A\u7FA4\u4F53\u5728\u533B\u5B66\u4E0A\u4E0D\u51C6\u786E\uFF0C\u5728\u793E\u4F1A\u4E0A\u6709\u5BB3\u3002\u65B0\u52A0\u5761\u6240\u6709\u793E\u533A\u90FD\u5728\u540C\u4E00\u516C\u5171\u536B\u751F\u63AA\u65BD\u4E0B\u5171\u540C\u52AA\u529B\u3002",
        ms: "COVID-19 merebak melalui hubungan manusia tanpa mengira kaum, kewarganegaraan atau komuniti. Menyalahkan kumpulan tertentu adalah tidak tepat dari segi perubatan dan berbahaya dari segi sosial.",
        ta: "COVID-19 \u0B87\u0BA9\u0BAE\u0BCD, \u0BA4\u0BC7\u0B9A\u0BBF\u0BAF\u0BAE\u0BCD \u0B85\u0BB2\u0BCD\u0BB2\u0BA4\u0BC1 \u0B9A\u0BAE\u0BC2\u0B95\u0BA4\u0BCD\u0BA4\u0BC8\u0BAA\u0BCD \u0BAA\u0BCA\u0BB0\u0BC1\u0B9F\u0BCD\u0BAA\u0B9F\u0BC1\u0BA4\u0BCD\u0BA4\u0BBE\u0BAE\u0BB2\u0BCD \u0BAE\u0BA9\u0BBF\u0BA4 \u0BA4\u0BCA\u0B9F\u0BB0\u0BCD\u0BAA\u0BC1 \u0BAE\u0BC2\u0BB2\u0BAE\u0BCD \u0BAA\u0BB0\u0BB5\u0BC1\u0B95\u0BBF\u0BB1\u0BA4\u0BC1. \u0B95\u0BC1\u0BB1\u0BBF\u0BAA\u0BCD\u0BAA\u0BBF\u0B9F\u0BCD\u0B9F \u0B95\u0BC1\u0BB4\u0BC1\u0B95\u0BCD\u0B95\u0BB3\u0BC8\u0B95\u0BCD \u0B95\u0BC1\u0BB1\u0BCD\u0BB1\u0BAE\u0BCD \u0B9A\u0BBE\u0B9F\u0BCD\u0B9F\u0BC1\u0BB5\u0BA4\u0BC1 \u0BAE\u0BB0\u0BC1\u0BA4\u0BCD\u0BA4\u0BC1\u0BB5 \u0BB0\u0BC0\u0BA4\u0BBF\u0BAF\u0BBE\u0B95 \u0BA4\u0BB5\u0BB1\u0BBE\u0BA9\u0BA4\u0BC1.",
      },
      sources: [
        { label: "MOH — COVID-19 Situation Report", url: "https://www.moh.gov.sg/covid-19" },
        { label: "MOM — Advisory on Migrant Workers", url: "https://www.mom.gov.sg/covid-19/advisory-on-safe-distancing-measures" },
        { label: "POFMA Office — Correction Directions", url: "https://www.pofmaoffice.gov.sg/regulations/protection-from-online-falsehoods-and-manipulation-act/" },
      ],
      policyRecommendations: [
        "Issue joint MOM-MOH statement emphasizing virus transmission is not linked to any nationality or ethnicity, and fast-track POFMA corrections for posts attributing spread to specific racial groups",
      ],
    },
    {
      id: 4,
      risk: "MEDIUM",
      riskScore: 58,
      title:
        "Traditional remedies or specific foods can prevent/cure COVID",
      channel: "Mandarin Facebook groups & family WhatsApp",
      trigger: "Health anxiety & folk-medicine trust",
      historicalMatch:
        "POFMA correction (Jan 2020) \u2014 viral claims about garlic, warm water, and TCM cures circulated across Chinese-language platforms",
      timeToSpread: "~12-24 hours",
      demographicRisk: "Elderly Chinese-speaking, TCM-adjacent communities",
      counterNarratives: {
        en: "There is currently no scientifically proven food or traditional remedy that prevents or cures COVID-19. Please rely on MOH\u2019s official medical guidance. Vaccination remains the most effective protection.",
        zh: "\u76EE\u524D\u6CA1\u6709\u7ECF\u79D1\u5B66\u8BC1\u660E\u53EF\u9884\u9632\u6216\u6CBB\u6108\u65B0\u51A0\u7684\u98DF\u7269\u6216\u4F20\u7EDF\u7597\u6CD5\u3002\u8BF7\u9075\u5FAA\u536B\u751F\u90E8\u7684\u5B98\u65B9\u533B\u7597\u6307\u5BFC\u3002\u63A5\u79CD\u75AB\u82D7\u4ECD\u7136\u662F\u6700\u6709\u6548\u7684\u4FDD\u62A4\u63AA\u65BD\u3002",
        ms: "Tiada makanan atau ubat tradisional yang terbukti secara saintifik dapat mencegah atau menyembuhkan COVID-19. Sila ikut panduan perubatan rasmi KKM.",
        ta: "COVID-19 \u0B90\u0BA4\u0BCD \u0BA4\u0B9F\u0BC1\u0B95\u0BCD\u0B95\u0BC1\u0BAE\u0BCD \u0B85\u0BB2\u0BCD\u0BB2\u0BA4\u0BC1 \u0B95\u0BC1\u0BA3\u0BAA\u0BCD\u0BAA\u0B9F\u0BC1\u0BA4\u0BCD\u0BA4\u0BC1\u0BAE\u0BCD \u0B89\u0BA3\u0BB5\u0BC1 \u0B85\u0BB2\u0BCD\u0BB2\u0BA4\u0BC1 \u0BAA\u0BBE\u0BB0\u0BAE\u0BCD\u0BAA\u0BB0\u0BBF\u0BAF \u0BAE\u0BB0\u0BC1\u0BA8\u0BCD\u0BA4\u0BC1 \u0B8E\u0BA4\u0BC1\u0BB5\u0BC1\u0BAE\u0BCD \u0B85\u0BB1\u0BBF\u0BB5\u0BBF\u0BAF\u0BB2\u0BCD \u0BB0\u0BC0\u0BA4\u0BBF\u0BAF\u0BBE\u0B95 \u0BA8\u0BBF\u0BB0\u0BC2\u0BAA\u0BBF\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BB5\u0BBF\u0BB2\u0BCD\u0BB2\u0BC8. MOH \u0B87\u0BA9\u0BCD \u0B85\u0BA4\u0BBF\u0B95\u0BBE\u0BB0\u0BAA\u0BC2\u0BB0\u0BCD\u0BB5 \u0BAE\u0BB0\u0BC1\u0BA4\u0BCD\u0BA4\u0BC1\u0BB5 \u0BB5\u0BB4\u0BBF\u0B95\u0BBE\u0B9F\u0BCD\u0B9F\u0BC1\u0BA4\u0BB2\u0BC8\u0BAA\u0BCD \u0BAA\u0BBF\u0BA9\u0BCD\u0BAA\u0BB1\u0BCD\u0BB1\u0BC1\u0B99\u0BCD\u0B95\u0BB3\u0BCD.",
      },
      sources: [
        { label: "MOH — Official Medical Guidance", url: "https://www.moh.gov.sg/covid-19/vaccination" },
        { label: "HSA — Safety Alerts on Unproven Remedies", url: "https://www.hsa.gov.sg/consumer-safety/articles/covid19_unproven_claims" },
        { label: "POFMA — Correction on False Cure Claims", url: "https://www.pofmaoffice.gov.sg/regulations/protection-from-online-falsehoods-and-manipulation-act/" },
      ],
      policyRecommendations: [
        "Direct HSA and TCM Practitioners Board to issue a joint public advisory debunking specific viral remedy claims with scientific evidence",
      ],
    },
  ],
};
