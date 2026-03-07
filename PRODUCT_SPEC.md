# ContextGuard — Product Spec (Hackathon Demo)

## For: Software Development Team

**Date:** 2026-03-07
**Status:** Hackathon build — hardcoded demo scenario
**Demo Scenario:** COVID-19 Singapore (Feb 2020) — Sheng Siong rice & toilet paper panic-buying

---

## 1. Overview

ContextGuard is a **proactive rumour prediction engine**. A comms officer pastes an announcement draft, and the system predicts what misinformation will emerge, ranked by virality risk, with pre-written counter-narratives in 4 languages.

**For the hackathon demo, everything is hardcoded.** There is no real AI inference pipeline. The goal is a polished, convincing UI flow that demonstrates the concept using a real historical event judges will recognise.

---

## 2. Demo Scenario: The Story

> **February 2020.** Singapore records early COVID-19 cases. The government announces DORSCON Orange. Within hours, rumours spread on WhatsApp that Sheng Siong has run out of rice and toilet paper. Panic-buying empties supermarket shelves across the island within 6 hours. MOH issues a correction at 11pm — 8 hours too late. 300,000 people had already panic-bought.

ContextGuard would have predicted these rumours **before** they spread and armed community leaders with counter-narratives in advance.

---

## 3. Tech Stack

| Layer | Tool | Notes |
|-------|------|-------|
| Frontend | Next.js + Tailwind CSS | App Router, responsive |
| Backend/API | Next.js API Routes | Minimal — mostly serving hardcoded data |
| LLM (simulated) | Hardcoded responses | Fake "typing" animation to simulate AI processing |
| Database | None (hardcoded JSON) | All data lives in static files |
| Deployment | Vercel | Push to deploy |
| Package Manager | Bun | Use `bun` for all install/run commands |

---

## 4. Pages & Routes

### 4.1 Landing Page — `/`

Simple hero page with:
- ContextGuard logo/name
- Tagline: "Predict the rumour. Close the window. Protect the community."
- Two buttons:
  - **"Comms Officer Dashboard"** → `/dashboard` (institutional side)
  - **"Community Leader Portal"** → `/community` (community side)

### 4.2 Comms Officer Dashboard — `/dashboard`

This is the **primary demo screen**. Flow:

#### Step 1: Input Area
- Large text area with placeholder: *"Paste your announcement draft here..."*
- Pre-loaded with a **"Load Sample"** button that auto-fills the following hardcoded announcement:

```
MINISTRY OF HEALTH ADVISORY

Singapore raises Disease Outbreak Response System Condition (DORSCON) level from Yellow to Orange. This reflects the increased risk of community spread of COVID-19.

Key measures effective immediately:
- Temperature screening at all public buildings
- Business continuity plans activated for essential services
- Public advised to maintain good hygiene practices
- No need for panic buying — supply chains remain stable
- Supermarkets and essential services will continue to operate normally

The public is advised to remain calm and rely on official channels for updates.
```

- **"Analyse"** button (prominent, primary CTA)

#### Step 2: Processing Animation
- When "Analyse" is clicked, show a **simulated AI processing sequence** (2-3 seconds total):
  - "Classifying announcement topic..." (0.5s)
  - "Identifying affected communities..." (0.5s)
  - "Mapping emotional risk vectors..." (0.5s)
  - "Matching against historical rumour patterns..." (0.5s)
  - "Generating counter-narratives in 4 languages..." (0.5s)
- Use a progress bar or step indicator with checkmarks appearing sequentially

#### Step 3: Results — Rumour Forecast Cards

Display **3 predicted rumour cards**, each as an expandable card component:

---

**RUMOUR 1 — Risk: HIGH (92%)**

| Field | Value |
|-------|-------|
| Predicted False Narrative | "Sheng Siong and NTUC FairPrice have run out of rice. All rice stocks in Singapore are finished." |
| Likely Channels | WhatsApp groups (Mandarin-speaking), Facebook (Chinese community pages) |
| Target Community | Mandarin-speaking elderly, heartland residents |
| Emotional Trigger | Survival anxiety — fear of food shortage during lockdown |
| Historical Pattern Match | "Matches panic-buying patterns from 2003 SARS outbreak. Rice and essentials were first targets of hoarding behaviour." |
| Time to Spread | Estimated 2-4 hours from announcement |
| Counter-Narratives | *(see Section 5 below)* |

---

**RUMOUR 2 — Risk: HIGH (87%)**

| Field | Value |
|-------|-------|
| Predicted False Narrative | "Toilet paper and household essentials will be unavailable for weeks. Singapore imports are being cut off." |
| Likely Channels | WhatsApp (cross-language), Telegram groups, Facebook |
| Target Community | General population, especially heartland HDB residents |
| Emotional Trigger | Scarcity anxiety — fear of supply chain disruption |
| Historical Pattern Match | "Toilet paper panic is a documented global crisis response. Occurred in Hong Kong, Australia, and Japan during prior health scares." |
| Time to Spread | Estimated 3-6 hours from announcement |
| Counter-Narratives | *(see Section 5 below)* |

---

**RUMOUR 3 — Risk: MEDIUM (68%)**

| Field | Value |
|-------|-------|
| Predicted False Narrative | "The government is hiding the real number of COVID cases. DORSCON Orange means a lockdown is coming and they're not telling us." |
| Likely Channels | Twitter/X (English), Reddit r/singapore, Telegram |
| Target Community | English-speaking younger demographic, online-first users |
| Emotional Trigger | Institutional distrust — suspicion that authorities are withholding information |
| Historical Pattern Match | "Government transparency rumours surface in every escalation of public health measures. Seen in H1N1 2009, Zika 2016." |
| Time to Spread | Estimated 4-8 hours from announcement |
| Counter-Narratives | *(see Section 5 below)* |

---

#### Step 4: Action Panel

Below the rumour cards, show an action bar:
- **"Push to Community Leaders"** button → triggers a confirmation modal: *"Counter-narratives will be sent to 847 registered community leaders in 4 languages."* → On confirm, show success toast.
- **"Export Report (PDF)"** button → (can be non-functional for demo, just show the button)
- **"Edit Counter-Narratives"** button → (can be non-functional, just show the button)

---

### 4.3 Community Leader Portal — `/community`

Simpler page showing what a community leader (RC Chairman, mosque admin, etc.) would see on their end.

#### Layout:
- Header: "ContextGuard — Community Alert"
- Alert badge: "3 New Alerts"
- List of alert cards (simplified version of the rumour cards):

**Alert Card Format:**

```
[HIGH RISK] Potential misinformation about rice shortages
Received: 7 Feb 2020, 3:42 PM
Topic: COVID-19 DORSCON Orange

False claim likely to spread:
"Sheng Siong and NTUC have run out of rice."

What you can share with your community:
[Toggle language: EN | 中文 | BM | Tamil]

[Counter-narrative text displayed in selected language]

[Button: "Copy Message"]  [Button: "Share via WhatsApp"]
```

- Repeat for all 3 rumours
- Language toggle on each card switches the counter-narrative text

---

## 5. Hardcoded Counter-Narratives (All 4 Languages)

### Rumour 1: Rice Shortage

**English:**
> This is not true. Singapore's rice supply remains stable. The government maintains national stockpiles of essential items including rice, and supply chains from our trading partners are operating normally. Sheng Siong, NTUC FairPrice, and other major supermarkets have confirmed they are restocking shelves continuously. There is no need to panic-buy. Buying more than you need creates the very shortage you fear. For official updates, visit gov.sg/dorscon.

**Chinese (Mandarin):**
> 这不是事实。新加坡的大米供应保持稳定。政府维持着包括大米在内的必需品国家储备，我们贸易伙伴的供应链运作正常。昇菘超市、职总平价超市及其他主要超市已确认会持续补货。无需恐慌抢购。过度购买反而会造成您所担心的短缺。如需官方信息，请访问 gov.sg/dorscon。

**Bahasa Melayu:**
> Ini tidak benar. Bekalan beras Singapura kekal stabil. Kerajaan mengekalkan stok simpanan negara untuk barangan keperluan termasuk beras, dan rantaian bekalan daripada rakan dagangan kita beroperasi seperti biasa. Sheng Siong, NTUC FairPrice, dan pasar raya utama lain telah mengesahkan bahawa mereka terus mengisi semula rak. Tidak perlu membeli secara panik. Membeli lebih daripada yang anda perlukan akan mewujudkan kekurangan yang anda bimbangkan. Untuk kemas kini rasmi, layari gov.sg/dorscon.

**Tamil:**
> இது உண்மையல்ல. சிங்கப்பூரின் அரிசி விநியோகம் நிலையாக உள்ளது. அரிசி உள்ளிட்ட அத்தியாவசியப் பொருட்களின் தேசிய இருப்புகளை அரசாங்கம் பராமரித்து வருகிறது, மேலும் நமது வர்த்தக பங்காளிகளின் விநியோகச் சங்கிலிகள் இயல்பாகச் செயல்படுகின்றன. ஷெங் சியோங், NTUC FairPrice மற்றும் பிற முக்கிய சூப்பர்மார்க்கெட்டுகள் தொடர்ந்து அலமாரிகளை நிரப்பி வருவதாக உறுதிப்படுத்தியுள்ளன. பீதியில் வாங்க வேண்டிய அவசியமில்லை. அதிகாரப்பூர்வ தகவல்களுக்கு gov.sg/dorscon ஐ பார்வையிடவும்.

---

### Rumour 2: Toilet Paper Shortage

**English:**
> Singapore's supply of household essentials, including toilet paper, remains fully stocked. Singapore does not rely on a single source for these products — we import from multiple countries and maintain buffer stocks. Major retailers have confirmed normal supply operations. Panic-buying only creates temporary, artificial shortages. Please buy only what you need. For official updates, visit gov.sg/dorscon.

**Chinese (Mandarin):**
> 新加坡的日用品供应充足，包括卫生纸在内。新加坡的日用品来源多元化，我们从多个国家进口并维持缓冲库存。各大零售商已确认供应运作正常。恐慌抢购只会造成暂时性的人为短缺。请仅购买您所需要的量。如需官方信息，请访问 gov.sg/dorscon。

**Bahasa Melayu:**
> Bekalan barangan keperluan harian Singapura, termasuk kertas tandas, kekal mencukupi sepenuhnya. Singapura tidak bergantung kepada satu sumber sahaja untuk produk ini — kita mengimport dari pelbagai negara dan mengekalkan stok penampan. Peruncit utama telah mengesahkan operasi bekalan berjalan seperti biasa. Pembelian panik hanya mewujudkan kekurangan sementara dan buatan. Sila beli hanya apa yang anda perlukan. Untuk kemas kini rasmi, layari gov.sg/dorscon.

**Tamil:**
> கழிவறைத் தாள் உள்ளிட்ட சிங்கப்பூரின் வீட்டு அத்தியாவசியப் பொருட்களின் விநியோகம் முழுமையாக இருப்பில் உள்ளது. இந்தப் பொருட்களுக்கு சிங்கப்பூர் ஒரே ஒரு மூலத்தை நம்பவில்லை — நாம் பல நாடுகளிலிருந்து இறக்குமதி செய்கிறோம், இடையக இருப்புகளையும் பராமரிக்கிறோம். முக்கிய சில்லறை விற்பனையாளர்கள் இயல்பான விநியோக நடவடிக்கைகளை உறுதிப்படுத்தியுள்ளனர். பீதி கொள்முதல் தற்காலிக, செயற்கை பற்றாக்குறையை மட்டுமே உருவாக்குகிறது. உங்களுக்குத் தேவையானதை மட்டும் வாங்கவும். அதிகாரப்பூர்வ தகவல்களுக்கு gov.sg/dorscon ஐ பார்வையிடவும்.

---

### Rumour 3: Government Hiding Cases / Secret Lockdown

**English:**
> The DORSCON Orange level is a transparent, pre-established national framework — not a sign of hidden information. All confirmed COVID-19 case counts are published daily on MOH's official website. DORSCON Orange does not mean a lockdown is imminent. It means precautionary measures are being activated. Singapore's outbreak response framework has been public since 2003. For real-time case updates, visit moh.gov.sg.

**Chinese (Mandarin):**
> DORSCON橙色级别是一个透明的、预先建立的国家框架，并非隐瞒信息的信号。所有已确认的新冠病例数据每天都在卫生部官方网站上公布。DORSCON橙色并不意味着即将封锁，而是启动预防措施。新加坡的疫情应对框架自2003年起就已公开。如需实时病例更新，请访问 moh.gov.sg。

**Bahasa Melayu:**
> Tahap DORSCON Oren adalah rangka kerja kebangsaan yang telus dan telah ditetapkan sebelumnya — bukan tanda maklumat disembunyikan. Semua jumlah kes COVID-19 yang disahkan diterbitkan setiap hari di laman web rasmi MOH. DORSCON Oren tidak bermakna penutupan akan berlaku. Ia bermakna langkah-langkah berjaga-jaga sedang diaktifkan. Rangka kerja tindak balas wabak Singapura telah diumumkan secara terbuka sejak 2003. Untuk kemas kini kes terkini, layari moh.gov.sg.

**Tamil:**
> DORSCON ஆரஞ்சு நிலை என்பது வெளிப்படையான, முன்கூட்டியே நிறுவப்பட்ட தேசிய கட்டமைப்பாகும் — இது மறைக்கப்பட்ட தகவலின் அறிகுறி அல்ல. உறுதிப்படுத்தப்பட்ட அனைத்து கோவிட்-19 வழக்கு எண்ணிக்கைகளும் MOH இன் அதிகாரப்பூர்வ இணையதளத்தில் தினமும் வெளியிடப்படுகின்றன. DORSCON ஆரஞ்சு என்பது ஊரடங்கு வரப்போகிறது என்று அர்த்தமல்ல. முன்னெச்சரிக்கை நடவடிக்கைகள் செயல்படுத்தப்படுகின்றன என்று அர்த்தம். நிகழ்நேர வழக்கு புதுப்பிப்புகளுக்கு moh.gov.sg ஐ பார்வையிடவும்.

---

## 6. UI/UX Requirements

### Design Language
- Clean, professional, **government-grade** aesthetic — think gov.sg meets modern SaaS
- Colour palette: Navy (#1a2332), White, Accent Red for HIGH risk, Amber for MEDIUM, Green for LOW
- Font: Inter or system sans-serif
- Cards with subtle shadows, clear hierarchy
- Responsive but optimise for **laptop/desktop demo** (judges will see it on a screen)

### Key Interactions
1. **Typing animation** on the processing step — text should appear character by character for "AI" feel
2. **Risk level badges** — colour-coded pills (RED = HIGH, AMBER = MEDIUM, GREEN = LOW)
3. **Language toggle** — tabs or segmented control switching counter-narrative language
4. **Expand/collapse** on rumour cards to show full detail vs summary
5. **Copy to clipboard** button on each counter-narrative
6. **Smooth transitions** — fade-in for results, slide-down for card expansion

### Loading/Processing UX
- The "AI analysis" step should feel deliberate, not instant
- Show each processing step sequentially with a small delay
- Use a subtle pulsing animation or progress indicator
- Total processing time: ~3 seconds (feels real without being slow)

---

## 7. Data Structure (Hardcoded JSON)

All demo data should live in a single file: `src/data/demo-scenario.ts`

```typescript
export interface RumourPrediction {
  id: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  riskScore: number; // 0-100
  predictedNarrative: string;
  likelyChannels: string[];
  targetCommunity: string;
  emotionalTrigger: string;
  historicalPatternMatch: string;
  timeToSpread: string;
  counterNarratives: {
    en: string;
    zh: string;
    ms: string;
    ta: string;
  };
}

export interface DemoScenario {
  id: string;
  title: string;
  date: string;
  announcementText: string;
  processingSteps: string[];
  predictions: RumourPrediction[];
  communityLeadersCount: number;
}
```

---

## 8. Component Breakdown

```
src/
  app/
    page.tsx                    # Landing page
    dashboard/
      page.tsx                  # Comms officer dashboard
    community/
      page.tsx                  # Community leader portal
    layout.tsx                  # Root layout with nav
  components/
    Navbar.tsx                  # Top nav with logo
    HeroSection.tsx             # Landing page hero
    AnnouncementInput.tsx       # Text area + "Load Sample" + "Analyse" buttons
    ProcessingAnimation.tsx     # Step-by-step AI simulation
    RumourCard.tsx              # Expandable rumour prediction card
    RiskBadge.tsx               # HIGH/MEDIUM/LOW pill badge
    LanguageToggle.tsx          # EN/中文/BM/Tamil tab switcher
    CounterNarrativeDisplay.tsx # Shows counter-narrative in selected language
    ActionPanel.tsx             # Push/Export/Edit buttons
    CommunityAlertCard.tsx      # Simplified card for community portal
    CopyButton.tsx              # Copy-to-clipboard utility
  data/
    demo-scenario.ts            # All hardcoded demo data
```

---

## 9. State Management

No external state library needed. Use React `useState` for:

- `currentStep`: `"input" | "processing" | "results"` — controls dashboard flow
- `expandedCard`: `string | null` — which rumour card is expanded
- `selectedLanguage`: `Record<string, "en" | "zh" | "ms" | "ta">` — per-card language selection
- `pushSent`: `boolean` — whether "Push to Community Leaders" has been clicked

---

## 10. Build & Run

```bash
bun create next-app contextguard --typescript --tailwind --app --src-dir
cd contextguard
bun install
bun dev
```

Deploy: `vercel --prod`

---

## 11. What Does NOT Need to Work

- Real AI/LLM calls (everything is hardcoded)
- Real WhatsApp integration (buttons can be non-functional)
- PDF export (button shown but non-functional)
- User authentication
- Database / persistence
- Real push notifications to community leaders (just show a success toast)

---

## 12. What MUST Work Perfectly

- PDF upload and a nice viewer
- Pasting/loading the sample announcement
- The processing animation sequence (this is the "wow" moment)
- All 3 rumour cards rendering with correct data
- Language toggle switching counter-narrative text across all 4 languages
- Copy-to-clipboard on counter-narratives
- Community leader portal showing the alerts
- Responsive, polished, professional appearance
- Fast page loads, smooth animations

---

## 13. Demo Script (Developer Reference)

The judges will see this flow:

1. Open ContextGuard landing page
2. Click "News Outlet Dashboard"
3. Click "Load News article" (DORSCON Orange announcement fills in)
4. Click "Analyse"
5. Watch the AI processing animation (3 seconds)
6. See 3 rumour predictions appear — judges will recognise the Sheng Siong rice rumour
7. Expand Rumour 1 — show the detail, toggle languages
8. Click "Push to Community Leaders" — show confirmation
9. Switch to Community Leader Portal — show what they'd receive
10. Close with the pitch

**The critical "wow" moment:** When judges see that the system predicted the exact Sheng Siong rice shortage rumour that actually happened — that's the moment they believe in the product.

---

*ContextGuard — Predict the rumour. Close the window. Protect the community.*
