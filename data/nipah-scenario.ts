import type { DemoScenario, RumourPrediction } from "@/data/demo-scenario";

export const NIPAH_ANNOUNCEMENT_TEXT = `MINISTRY OF HEALTH — PARLIAMENTARY STATEMENT

Senior Minister of State for Health Koh Poh Koon addressed Parliament on Singapore's response to Nipah virus cases detected in West Bengal, India. Two confirmed cases — both healthcare workers (25-year-old nurses) — were identified, with no deaths reported.

Singapore implemented precautionary measures including temperature screening at checkpoints, health declarations for travellers from affected regions, and enhanced surveillance of migrant worker dormitories. The WHO assessed risk as moderate at the sub-national level and low at the global level. No cases have been detected in Singapore.

Measures were eased from 23 February 2026 following stabilisation of the situation in India.

— Ministry of Health, Singapore`;

export const NIPAH_SOURCES: { label: string; url: string }[] = [
  { label: "MOH — Singapore's Response to Nipah Virus Infections", url: "https://www.moh.gov.sg/newsroom/singapore-s-response-to-nipah-virus-infections/" },
  { label: "WHO — Nipah virus infection India (DON-593)", url: "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON593" },
  { label: "Singapore CDA — Precautionary measures for Nipah", url: "https://www.cda.gov.sg/news-and-events/cda-taking-first-steps-in-response-to-nipah-virus-infections--closely-monitoring-situation-in-west-bengal/" },
  { label: "MOH — Operational protocols for Nipah", url: "https://www.moh.gov.sg/newsroom/operational-protocols-to-safeguard-local-healthcare-workers-in-light-of-overseas-nipah-virus-infections/" },
  { label: "Singapore CDA — Nipah Virus Infection", url: "https://www.cda.gov.sg/professionals/diseases/nipah-virus-infection/" },
  { label: "Africa Check — False Nipah outbreak claims debunked", url: "https://africacheck.org/fact-checks/meta-programme-fact-checks/claims-nipah-virus-outbreak-uganda-are-false" },
  { label: "Rappler Fact Check — No confirmed Nipah case in Philippines", url: "https://www.rappler.com/newsbreak/fact-check/no-confirmed-nipah-virus-case-philippines-doh/" },
  { label: "ISEAS — Coronavirus infodemic in Southeast Asia", url: "https://www.iseas.edu.sg/media/commentaries/the-coronavirus-infodemic-in-southeast-asia-panic-buying-and-mis-dis-information/" },
  { label: "POFMA Office — Correction Directions", url: "https://www.pofmaoffice.gov.sg/regulations/protection-from-online-falsehoods-and-manipulation-act/" },
  { label: "MOM — Safe Management Measures", url: "https://www.mom.gov.sg/covid-19/requirements-for-safe-management-measures" },
  { label: "Doherty Institute — Nipah facts not fiction", url: "https://www.doherty.edu.au/articles/nipah-in-the-news-follow-facts-not-fiction/" },
];

const nipahPredictions: RumourPrediction[] = [
  {
    id: 1,
    risk: "HIGH",
    riskScore: 92,
    title: "Nipah cases already in Singapore, government is hiding it",
    channel: "WhatsApp family groups, Telegram channels, Facebook community pages",
    trigger: "Fear of government cover-up; distrust rooted in early COVID communication gaps",
    historicalMatch: "Mirrors COVID-era 'hidden cases' rumours — precautionary measures paradoxically fuel suspicion",
    timeToSpread: "~4-8 hours",
    demographicRisk: "Elderly Singaporeans reliant on WhatsApp forwarding chains; Mandarin-speaking chat groups",
    counterNarratives: {
      en: "Singapore has zero confirmed Nipah cases. MOH and CDA have been transparently communicating all measures taken, including the specific trigger (2 cases in West Bengal) and the easing of measures on 23 Feb when the situation stabilised. Singapore's disease surveillance system is among the most rigorous globally — the same system that detected and reported every COVID case in real time. If a case were detected, public notification would be immediate under the Infectious Diseases Act.",
      zh: "新加坡目前没有确认的尼帕病毒病例。卫生部和疾控局已透明地公布了所有措施，包括具体触发事件（西孟加拉邦2例确诊）以及2月23日局势稳定后放宽措施。新加坡的疾病监测系统是全球最严格的之一。如发现病例，将根据《传染病法》立即通知公众。",
      ms: "Singapura tidak mempunyai kes Nipah yang disahkan. KKM dan CDA telah berkomunikasi secara telus mengenai semua langkah yang diambil. Sistem pengawasan penyakit Singapura adalah antara yang paling ketat di dunia. Jika kes dikesan, pemberitahuan awam akan segera dibuat di bawah Akta Penyakit Berjangkit.",
      ta: "சிங்கப்பூரில் நிபா வைரஸ் உறுதிசெய்யப்பட்ட நோயாளிகள் எவரும் இல்லை. சுகாதார அமைச்சு அனைத்து நடவடிக்கைகளையும் வெளிப்படையாக தெரிவித்துள்ளது. நோய் கண்காணிப்பு அமைப்பு உலகளவில் மிகவும் கடுமையானது.",
    },
    sources: [
      { label: "MOH — Singapore's Response to Nipah Virus Infections", url: "https://www.moh.gov.sg/newsroom/singapore-s-response-to-nipah-virus-infections/" },
      { label: "Singapore CDA — Precautionary measures for Nipah", url: "https://www.cda.gov.sg/news-and-events/cda-taking-first-steps-in-response-to-nipah-virus-infections--closely-monitoring-situation-in-west-bengal/" },
      { label: "Singapore CDA — Nipah Virus Infection", url: "https://www.cda.gov.sg/professionals/diseases/nipah-virus-infection/" },
    ],
    policyRecommendations: [
      "Publish brief 'Nipah situation: no cases in Singapore' updates weekly during monitoring periods — silence feeds conspiracy",
      "Pre-draft POFMA correction directions for 'hidden cases' claims to enable rapid issuance within hours",
      "Use Gov.sg WhatsApp channel to push status updates in English, Mandarin, Malay, and Tamil simultaneously",
    ],
  },
  {
    id: 2,
    risk: "HIGH",
    riskScore: 89,
    title: "Indian/South Asian workers are bringing Nipah into dormitories",
    channel: "Facebook comments, HardwareZone forums, Twitter/X, WhatsApp",
    trigger: "Xenophobia; COVID dormitory outbreak trauma; 'Indian variant' travel ban memory",
    historicalMatch: "Direct replay of COVID-era scapegoating — during the 'Indian variant' wave, an Indian-descent woman was physically assaulted",
    timeToSpread: "~6-10 hours",
    demographicRisk: "General Singaporean public; anti-immigration sentiment groups; employers of migrant workers",
    counterNarratives: {
      en: "Nipah is not spread through casual contact or proximity like COVID. It requires direct contact with infected animal secretions or bodily fluids of a symptomatic person. The two cases in India were healthcare workers infected during patient care — not community spread. Singapore's migrant worker dormitories are not at elevated risk for Nipah. Blaming specific nationalities or ethnic groups is factually wrong, socially harmful, and potentially illegal under Singapore's laws.",
      zh: "尼帕病毒不像新冠那样通过随意接触传播。它需要直接接触受感染动物的分泌物或有症状患者的体液。印度的两例确诊是在患者护理期间感染的医护人员——不是社区传播。将特定国籍或族群作为替罪羊在事实上是错误的，在社会上是有害的。",
      ms: "Nipah tidak merebak melalui hubungan kasual seperti COVID. Ia memerlukan hubungan langsung dengan rembesan haiwan yang dijangkiti. Dua kes di India adalah pekerja kesihatan — bukan penularan komuniti. Menyalahkan kumpulan tertentu adalah salah dari segi fakta dan berbahaya dari segi sosial.",
      ta: "நிபா வைரஸ் கோவிட் போல் சாதாரண தொடர்பு மூலம் பரவாது. இது நேரடி தொடர்பு தேவைப்படுகிறது. இந்தியாவில் இரண்டு நோயாளிகளும் சுகாதார பணியாளர்கள் — சமூக பரவல் இல்லை. குறிப்பிட்ட இனக்குழுக்களை குற்றம்சாட்டுவது தவறானது.",
    },
    sources: [
      { label: "WHO — Nipah virus infection India (DON-593)", url: "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON593" },
      { label: "MOM — Safe Management Measures", url: "https://www.mom.gov.sg/covid-19/requirements-for-safe-management-measures" },
      { label: "POFMA Office — Correction Directions", url: "https://www.pofmaoffice.gov.sg/regulations/protection-from-online-falsehoods-and-manipulation-act/" },
    ],
    policyRecommendations: [
      "MHA/MOM joint advisory — discrimination against workers based on nationality will be treated seriously under the Maintenance of Racial Harmony Act",
      "Provide factual Nipah briefing to dormitory operators to prevent unauthorised restrictions on workers from specific nationalities",
      "Brief Indian community organisations (SINDA, Indian Heritage Centre) with talking points",
      "Flag and escalate xenophobic content linking Nipah to specific ethnic groups for potential POFMA action",
    ],
  },
  {
    id: 3,
    risk: "HIGH",
    riskScore: 86,
    title: "Nipah is airborne like COVID — another pandemic is coming",
    channel: "TikTok, Instagram Reels, YouTube Shorts, Twitter/X, WhatsApp forwards",
    trigger: "Pandemic fatigue; fear of repeat lockdowns; 'new virus 2026' framing",
    historicalMatch: "Nipah's high mortality rate provides a kernel of truth combined with false airborne claims — AI-modified videos repurposing old Ebola footage detected",
    timeToSpread: "~2-6 hours",
    demographicRisk: "Younger demographics (TikTok/IG); parents; anyone with COVID PTSD",
    counterNarratives: {
      en: "Nipah virus is NOT airborne. It spreads through direct contact with infected animals (primarily fruit bats or pigs) or their bodily fluids, contaminated food (e.g., raw date palm sap), or close contact with an infected person's secretions. This is fundamentally different from COVID's respiratory spread. Nipah has been known since 1998 — it is not new. While its mortality rate is high, its low transmissibility means it does not spread easily between people. The WHO assesses global risk as LOW.",
      zh: "尼帕病毒不通过空气传播。它通过直接接触受感染动物或其体液、受污染食物传播。这与新冠的呼吸道传播根本不同。尼帕自1998年以来就已为人知——它不是新病毒。虽然死亡率高，但传播性低。世卫组织评估全球风险为低。",
      ms: "Virus Nipah TIDAK berjangkit melalui udara. Ia merebak melalui hubungan langsung dengan haiwan yang dijangkiti. Ini berbeza dengan COVID. Nipah telah dikenali sejak 1998 — ia bukan virus baru. WHO menilai risiko global sebagai RENDAH.",
      ta: "நிபா வைரஸ் காற்றில் பரவாது. இது நேரடி தொடர்பு மூலம் மட்டுமே பரவுகிறது. இது 1998 முதல் அறியப்பட்டது — புதிய வைரஸ் அல்ல. உலக சுகாதார நிறுவனம் உலகளாவிய ஆபத்தை குறைவாக மதிப்பிடுகிறது.",
    },
    sources: [
      { label: "WHO — Nipah virus infection India (DON-593)", url: "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON593" },
      { label: "Doherty Institute — Nipah facts not fiction", url: "https://www.doherty.edu.au/articles/nipah-in-the-news-follow-facts-not-fiction/" },
      { label: "Rappler Fact Check — No confirmed Nipah case in Philippines", url: "https://www.rappler.com/newsbreak/fact-check/no-confirmed-nipah-virus-case-philippines-doh/" },
    ],
    policyRecommendations: [
      "Partner with local content creators and fact-checkers to produce short-form video debunks matching the format of viral misinformation",
      "MOH infographic series: 'Nipah vs COVID: Key Differences' distributed through Gov.sg channels, schools, and community centres",
      "Monitor for early signs of panic-buying narratives and pre-coordinate with NTUC FairPrice on stock reassurance messaging",
      "MOE circular to schools with age-appropriate fact sheets — students are primary vectors for TikTok-originated misinformation",
    ],
  },
  {
    id: 4,
    risk: "MEDIUM",
    riskScore: 65,
    title: "Government not doing enough / reacting too slowly",
    channel: "Facebook, Reddit (r/singapore), Twitter/X, opposition-leaning blogs",
    trigger: "Institutional distrust; COVID early-response criticism; anxiety seeking action",
    historicalMatch: "People confuse precautionary proportionality with inaction — draws on memories of perceived slow COVID response",
    timeToSpread: "~12-24 hours",
    demographicRisk: "Politically engaged Singaporeans; parents; healthcare workers",
    counterNarratives: {
      en: "Singapore's response is proportionate to the WHO-assessed LOW global risk. Measures implemented include: temperature screening at all checkpoints, mandatory health declarations for travellers from affected Indian states, enhanced surveillance in migrant worker dormitories, hospital preparedness protocols, and coordination with WHO and Indian health authorities. An overly aggressive response would be disproportionate and cause unnecessary disruption. Measures were calibrated and have since been eased as the situation stabilised.",
      zh: "新加坡的应对措施与世卫组织评估的低全球风险相称。已实施的措施包括：所有关卡的体温检查、来自印度受影响邦的旅客健康申报、加强外劳宿舍监测等。过度激进的反应将不成比例，造成不必要的干扰。",
      ms: "Tindak balas Singapura adalah setimpal dengan risiko global RENDAH yang dinilai oleh WHO. Langkah yang dilaksanakan termasuk pemeriksaan suhu, pengisytiharan kesihatan wajib, dan pengawasan dipertingkat. Tindak balas yang terlalu agresif akan tidak seimbang.",
      ta: "சிங்கப்பூரின் நடவடிக்கை WHO மதிப்பீடான குறைந்த உலகளாவிய ஆபத்துக்கு விகிதாச்சாரமானது. வெப்பநிலை பரிசோதனை, சுகாதார அறிக்கைகள், மேம்படுத்தப்பட்ட கண்காணிப்பு உள்ளிட்ட நடவடிக்கைகள் செயல்படுத்தப்பட்டுள்ளன.",
    },
    sources: [
      { label: "MOH — Singapore's Response to Nipah Virus Infections", url: "https://www.moh.gov.sg/newsroom/singapore-s-response-to-nipah-virus-infections/" },
      { label: "MOH — Operational protocols for Nipah", url: "https://www.moh.gov.sg/newsroom/operational-protocols-to-safeguard-local-healthcare-workers-in-light-of-overseas-nipah-virus-infections/" },
    ],
    policyRecommendations: [
      "Publish simplified risk assessment framework: 'Here's what would trigger escalation of measures'",
      "Schedule follow-up parliamentary oral answers to maintain visibility",
      "Brief frontline healthcare workers first so they can respond confidently to patient queries",
    ],
  },
  {
    id: 5,
    risk: "MEDIUM",
    riskScore: 62,
    title: "Eating certain fruits / drinking water can spread Nipah",
    channel: "WhatsApp family groups, Facebook, Weibo (Chinese community)",
    trigger: "Food safety anxiety; maternal protective instinct; difficulty understanding zoonotic transmission",
    historicalMatch: "Kernel of truth — Nipah can spread via contaminated raw date palm sap — gets distorted into broad food-safety panic",
    timeToSpread: "~12-24 hours",
    demographicRisk: "Parents, elderly, food handlers, wet market vendors",
    counterNarratives: {
      en: "Nipah transmission through food is limited to a very specific pathway: raw date palm sap contaminated by fruit bat secretions in endemic areas. This product is not commercially available in Singapore. Imported fruits are safe to eat. Singapore's water supply is not at risk — Nipah does not survive in treated water. Standard food hygiene (washing produce, cooking meat thoroughly) remains good practice.",
      zh: "尼帕通过食物传播仅限于一个非常特定的途径：受果蝠分泌物污染的生椰枣汁。此产品在新加坡无商业销售。进口水果可以安全食用。新加坡的水供应没有风险——尼帕病毒在经处理的水中无法存活。",
      ms: "Penularan Nipah melalui makanan terhad kepada laluan yang sangat khusus: air nira kurma mentah yang dicemari rembesan kelawar buah. Produk ini tidak dijual secara komersial di Singapura. Buah-buahan import selamat dimakan. Bekalan air Singapura tidak berisiko.",
      ta: "நிபா உணவு மூலம் பரவுவது மிகவும் குறிப்பிட்ட வழியில் மட்டுமே: பழவாவல் சுரப்புகளால் மாசுபட்ட பச்சை பேரீச்ச சாறு. இது சிங்கப்பூரில் விற்கப்படுவதில்லை. இறக்குமதி பழங்கள் பாதுகாப்பானவை.",
    },
    sources: [
      { label: "Doherty Institute — Nipah facts not fiction", url: "https://www.doherty.edu.au/articles/nipah-in-the-news-follow-facts-not-fiction/" },
      { label: "Africa Check — False Nipah outbreak claims debunked", url: "https://africacheck.org/fact-checks/meta-programme-fact-checks/claims-nipah-virus-outbreak-uganda-are-false" },
    ],
    policyRecommendations: [
      "Singapore Food Agency proactive statement on safety of imported food, specifically addressing fruits and pork",
      "Multilingual posters in wet markets and hawker centres addressing food safety concerns",
      "Tamil and Bengali language materials for communities most connected to Indian food supply chains",
    ],
  },
  {
    id: 6,
    risk: "MEDIUM",
    riskScore: 58,
    title: "Nipah is a bioweapon / lab-leaked virus",
    channel: "Telegram conspiracy channels, Twitter/X, YouTube, fringe blogs",
    trigger: "Generalised distrust of institutions; COVID lab-leak debate spillover",
    historicalMatch: "COVID lab-leak theory normalised bioweapon narratives — conspiracy community has pre-built templates easily adapted",
    timeToSpread: "~24-48 hours",
    demographicRisk: "Conspiracy-adjacent communities; anti-vaxxer networks; global audience with Singapore-specific nodes",
    counterNarratives: {
      en: "Nipah virus was first identified in 1998 in Sungai Nipah, Malaysia — it is a naturally occurring zoonotic virus carried by fruit bats (Pteropus genus). Outbreaks have occurred regularly in Bangladesh and India since 2001, well before COVID. The virus's natural reservoir, transmission pathways, and evolutionary history are well-documented. Vaccine research exists because Nipah is on the WHO R&D Blueprint priority list — standard pandemic preparedness, not evidence of manufacture.",
      zh: "尼帕病毒于1998年在马来西亚双溪尼帕首次被发现——它是由果蝠携带的自然发生的人畜共患病毒。自2001年以来在孟加拉国和印度定期爆发。病毒的自然宿主和传播途径都有充分记录。疫苗研究是标准的大流行病防备工作。",
      ms: "Virus Nipah pertama kali dikenal pasti pada 1998 di Sungai Nipah, Malaysia — ia adalah virus zoonotik semula jadi yang dibawa oleh kelawar buah. Wabak berlaku secara berkala di Bangladesh dan India sejak 2001. Penyelidikan vaksin wujud kerana Nipah dalam senarai keutamaan WHO.",
      ta: "நிபா வைரஸ் 1998 இல் மலேசியாவில் முதலில் கண்டறியப்பட்டது — இது பழவாவல்களால் கொண்டு செல்லப்படும் இயற்கையான வைரஸ். 2001 முதல் வங்காளதேசம் மற்றும் இந்தியாவில் தொடர்ச்சியாக பரவல்கள் நடந்துள்ளன.",
    },
    sources: [
      { label: "WHO — Nipah virus infection India (DON-593)", url: "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON593" },
      { label: "Doherty Institute — Nipah facts not fiction", url: "https://www.doherty.edu.au/articles/nipah-in-the-news-follow-facts-not-fiction/" },
    ],
    policyRecommendations: [
      "Do not over-engage — bioweapon narratives thrive on official denials. Prefer factual backgrounders over direct rebuttals",
      "Engage local science communicators (NUS, NTU, Duke-NUS faculty) to produce accessible explainers",
      "Flag bioweapon misinformation to platform trust & safety teams under health misinformation policies",
    ],
  },
  {
    id: 7,
    risk: "LOW",
    riskScore: 42,
    title: "Temperature screening is useless security theatre",
    channel: "Reddit, Twitter/X, opinion columns",
    trigger: "Policy cynicism; COVID fatigue; inconvenience frustration",
    historicalMatch: "Legitimate debate about temperature screening effectiveness — COVID showed many asymptomatic carriers passed screening",
    timeToSpread: "~24-48 hours",
    demographicRisk: "Frequent travellers, policy commentators, general public",
    counterNarratives: {
      en: "Temperature screening is one layer in a multi-layered approach, not a standalone solution. It works alongside health declarations, traveller advisories, hospital surveillance, and laboratory testing capacity. Nipah typically presents with fever before progressing to encephalitis, making temperature screening more relevant than for COVID. No single measure is 100% effective; the system works through redundancy.",
      zh: "体温检测是多层防护措施中的一层，而非独立解决方案。它与健康申报、旅客咨询、医院监测和实验室检测能力协同运作。尼帕通常在发展为脑炎前先出现发热，使体温检测比对新冠更为相关。",
      ms: "Pemeriksaan suhu adalah satu lapisan dalam pendekatan berbilang lapisan. Ia berfungsi bersama pengisytiharan kesihatan, nasihat perjalanan, dan pengawasan hospital. Nipah biasanya menunjukkan demam sebelum berkembang menjadi ensefalitis.",
      ta: "வெப்பநிலை பரிசோதனை பல அடுக்கு அணுகுமுறையில் ஒரு அடுக்கு மட்டுமே. இது சுகாதார அறிக்கைகள், மருத்துவமனை கண்காணிப்புடன் இணைந்து செயல்படுகிறது.",
    },
    sources: [
      { label: "Singapore CDA — Nipah Virus Infection", url: "https://www.cda.gov.sg/professionals/diseases/nipah-virus-infection/" },
      { label: "MOH — Singapore's Response to Nipah Virus Infections", url: "https://www.moh.gov.sg/newsroom/singapore-s-response-to-nipah-virus-infections/" },
    ],
    policyRecommendations: [
      "Government communications should always present screening as part of a system, never as a standalone solution",
      "Acknowledge limitations honestly — credibility is maintained by admitting no measure is perfect",
    ],
  },
  {
    id: 8,
    risk: "LOW",
    riskScore: 35,
    title: "Nipah vaccine is being secretly tested on migrant workers",
    channel: "Migrant worker WhatsApp groups, Telegram, community word-of-mouth",
    trigger: "Exploitation fear; historical distrust of medical institutions; COVID dormitory trauma",
    historicalMatch: "Workers experienced severe COVID restrictions — language barriers mean health procedures often not well-explained",
    timeToSpread: "~48-72 hours",
    demographicRisk: "Migrant workers in dormitories; advocacy groups",
    counterNarratives: {
      en: "There is no approved Nipah vaccine anywhere in the world — no vaccine exists to be 'tested.' Health checks for dormitory workers are routine and transparent. All medical procedures require informed consent under Singapore law, regardless of nationality or residency status. Workers can verify any health procedure with their dormitory medical staff, MOM's migrant worker helpline, or NGOs like TWC2 and HealthServe.",
      zh: "世界上任何地方都没有批准的尼帕疫苗——没有疫苗可以被'测试'。宿舍工人的健康检查是常规和透明的。根据新加坡法律，所有医疗程序都需要知情同意，无论国籍或居住状态。",
      ms: "Tiada vaksin Nipah yang diluluskan di mana-mana di dunia. Pemeriksaan kesihatan untuk pekerja asrama adalah rutin dan telus. Semua prosedur perubatan memerlukan persetujuan termaklum di bawah undang-undang Singapura.",
      ta: "உலகில் எங்கும் அங்கீகரிக்கப்பட்ட நிபா தடுப்பூசி இல்லை. விடுதி தொழிலாளர்களுக்கான சுகாதார பரிசோதனைகள் வழக்கமானவை. சிங்கப்பூர் சட்டத்தின் கீழ் அனைத்து மருத்துவ நடைமுறைகளுக்கும் தகவலறிந்த ஒப்புதல் தேவை.",
    },
    sources: [
      { label: "MOM — Safe Management Measures", url: "https://www.mom.gov.sg/covid-19/requirements-for-safe-management-measures" },
      { label: "Singapore CDA — Nipah Virus Infection", url: "https://www.cda.gov.sg/professionals/diseases/nipah-virus-infection/" },
    ],
    policyRecommendations: [
      "All health procedures in dormitories must include explanation materials in workers' native languages (Tamil, Bengali, Mandarin, Burmese, Thai)",
      "Brief migrant worker NGOs (TWC2, HealthServe, HOME) as trusted information intermediaries",
      "Increase visibility of MOM helpline specifically for health-related queries during monitoring periods",
      "Train peer health ambassadors within dormitories to relay accurate information",
    ],
  },
];

export const NIPAH_SCENARIO: DemoScenario = {
  id: "nipah-virus-2026",
  title: "ContextGuard",
  subtitle: "Rumour Pre-Mortem Engine — Singapore",
  date: "8 Mar 2026",
  communityLeadersCount: 1243,
  constituencies: 31,
  announcementText: NIPAH_ANNOUNCEMENT_TEXT,
  predictions: nipahPredictions,
  historicalPatterns: [
    { event: "Nipah Malaysia Outbreak (1998-1999)", similarity: 89, source: "https://www.who.int/news-room/fact-sheets/detail/nipah-virus" },
    { event: "COVID DORSCON Orange (Feb 2020)", similarity: 82, source: "https://www.gov.sg/article/additional-measures-introduced-with-dorscon-orange" },
    { event: "COVID India Travel Ban (Apr 2021)", similarity: 76, source: "https://www.moh.gov.sg/newsroom/updates-on-border-measures-for-travellers-from-india-hong-kong-united-kingdom-and-south-africa/" },
    { event: "COVID Dormitory Cluster (Apr 2020)", similarity: 71, source: "https://www.mom.gov.sg/covid-19/requirements-for-safe-management-measures" },
  ],
};
