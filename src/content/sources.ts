// Curated knowledge base.
//
// IMPORTANT (licensing): ontario.ca content may be reproduced for non-commercial
// use only with credit and WITHOUT changes. So `summary` below is written in our
// own words, and every answer links back to the original page. Do not paste
// text from the source pages into this file. See SOURCES.md.
//
// Last checked: 2026-11-24. Re-check each URL before publishing updates.

export type Source = {
  id: string;
  title: string;
  title_ar: string;
  url: string;
  publisher: string;
  summary: string;
  keywords: string[]; // English + Arabic (normalized forms are fine)
};

export const SOURCES: Source[] = [
  {
    id: "ohip-apply",
    title: "Apply for OHIP and get a health card",
    title_ar: "التقديم على OHIP واستخراج كارت الصحة",
    url: "https://www.ontario.ca/page/apply-ohip-and-get-health-card",
    publisher: "Government of Ontario",
    summary:
      "OHIP is Ontario's public health insurance plan; it pays for many health services. " +
      "There is no longer a waiting period for OHIP: if you are eligible, coverage starts " +
      "right away. " +
      "You apply in person at a ServiceOntario centre. Bring a completed Registration for " +
      "Ontario Health Insurance Coverage form and three separate original documents from the " +
      "government's list of qualifying documents (photocopies are not accepted): they prove " +
      "your eligible status, your Ontario residency and your identity. Eligibility depends on " +
      "your immigration status and residency, so check the official page for your situation. " +
      "If you were outside Ontario for more than 212 days in a 12-month period, you may need to " +
      "reapply. ServiceOntario phone: 1-800-268-1154 (toll-free in Ontario) or 416-314-5518 " +
      "(Toronto/GTA). You may be able to book a ServiceOntario appointment ahead of your visit.",
    keywords: [
      "ohip", "health card", "apply", "insurance", "coverage", "serviceontario", "documents",
      "newcomer", "eligible", "eligibility", "register", "card", "pr", "work permit",
      "waiting period", "3 months", "three months", "new to", "just arrived",
      "كارت", "كارت الصحه", "بطاقه", "تامين", "تامين صحي", "اوهيب", "اطلع", "استخرج", "اقدم",
      "اوراق", "مستندات", "سيرفس اونتاريو", "جديد", "مهاجر", "فتره انتظار", "3 شهور", "تلات شهور", "لسه واصل", "لسه جاي",
    ],
  },
  {
    id: "health811",
    title: "Health811 — free health advice 24/7",
    title_ar: "Health811 — نصيحة صحية مجانية 24 ساعة",
    url: "https://health811.ontario.ca",
    publisher: "Government of Ontario",
    summary:
      "Health811 is a free, secure and confidential Ontario service available 24 hours a day, " +
      "7 days a week. Call 811 (TTY 1-866-797-0007) or chat online to talk to a registered " +
      "nurse, get health advice, and find local health services. A nurse can help you decide " +
      "where to go for care. On the phone line, interpretation is " +
      "available on request in more than 200 languages. Health811 is not for emergencies: for an emergency call 911.",
    keywords: [
      "811", "health811", "nurse", "advice", "where to go", "not sure", "unsure", "chat",
      "telehealth", "symptom", "symptoms", "help", "night", "weekend", "interpreter", "arabic",
      "ممرضه", "نصيحه", "اروح فين", "مش عارف", "مش عارفه", "اسال", "اعراض", "بالليل",
      "مترجم", "عربي", "اتصل",
    ],
  },
  {
    id: "family-doctor",
    title: "Health Care Connect: find a family doctor or nurse practitioner",
    title_ar: "Health Care Connect: إزاي تلاقي دكتور عائلة",
    url: "https://www.ontario.ca/page/find-family-doctor-or-nurse-practitioner",
    publisher: "Government of Ontario",
    summary:
      "Health Care Connect is Ontario's free program that helps people without a regular " +
      "family doctor. After you register, a Care Connector searches for a family doctor, nurse " +
      "practitioner or primary care team accepting new patients in your community. To register " +
      "you need a valid Ontario health card number and an up-to-date mailing address linked to " +
      "your health card. Register online at ontario.ca/healthcareconnect or by phone (811 or " +
      "1-800-445-1822). You can register your whole family. A match is not guaranteed, so keep " +
      "looking on your own too. Visits to a family doctor are covered by OHIP.",
    keywords: [
      "family doctor", "doctor", "gp", "nurse practitioner", "primary care", "health care connect",
      "find a doctor", "waitlist", "register", "physician",
      "دكتور", "دكتور عائله", "فاميلي دكتور", "طبيب", "طبيب عائله", "الاقي دكتور", "قائمه انتظار",
    ],
  },
  {
    id: "walk-in",
    title: "Walk-in clinics",
    title_ar: "عيادات الـ walk-in",
    url: "https://www.ontario.ca/page/walk-clinics",
    publisher: "Government of Ontario",
    summary:
      "Walk-in clinics see patients for non-emergency health concerns, useful when you don't " +
      "have a family doctor or can't get an appointment. You usually don't need an appointment, " +
      "but phone the clinic first to confirm hours and whether they are still registering " +
      "patients that day. There is no fee with OHIP; bring your health card.",
    keywords: [
      "walk-in", "walk in", "clinic", "no doctor", "appointment", "same day", "minor",
      "عياده", "ووك ان", "واك ان", "كلينك", "معاد", "ميعاد", "من غير معاد",
    ],
  },
  {
    id: "urgent-care",
    title: "Urgent care centres",
    title_ar: "مراكز الرعاية العاجلة (Urgent Care)",
    url: "https://www.ontario.ca/page/urgent-care-centres",
    publisher: "Government of Ontario",
    summary:
      "Urgent care centres treat illnesses and injuries that need care soon but are not " +
      "life-threatening. You don't need a referral or an appointment, and there is no fee with " +
      "OHIP; bring your health card. Hours vary by location, so check before you go. If you are " +
      "unsure whether to use urgent care or the emergency department, call Health811 (811).",
    keywords: [
      "urgent care", "urgent", "same day", "injury", "sprain", "stitches", "after hours",
      "عاجل", "رعايه عاجله", "ارجنت كير", "اصابه", "التواء", "غرز",
    ],
  },
  {
    id: "emergency",
    title: "Emergency rooms",
    title_ar: "الطوارئ",
    url: "https://www.ontario.ca/page/emergency-rooms",
    publisher: "Government of Ontario",
    summary:
      "Emergency departments treat severe illness and life-threatening injuries 24 hours a day, " +
      "every day. The Ontario government lists these as reasons to call 911: loss of " +
      "consciousness, pain that pain medication doesn't relieve, confusion, persistent severe " +
      "chest pain, and difficulty breathing. For concerns that are not emergencies, other " +
      "options include a family doctor, walk-in clinic, urgent care centre, pharmacist, or " +
      "Health811.",
    keywords: [
      "emergency", "er", "ed", "emergency room", "hospital", "911", "ambulance", "crowded",
      "wait", "wait time",
      "طوارئ", "الطوارئ", "مستشفي", "اسعاف", "زحمه", "انتظار",
    ],
  },
  {
    id: "pharmacist",
    title: "Pharmacies: prescriptions for common ailments",
    title_ar: "الصيدليات: علاج بعض المشاكل الشائعة",
    url: "https://www.ontario.ca/page/pharmacies",
    publisher: "Government of Ontario",
    summary:
      "In Ontario, pharmacists can assess and prescribe medication for a list of common, minor " +
      "ailments, for example pink eye, uncomplicated urinary tract infections, hay fever, insect " +
      "bites, cold sores and mild acne (see the official page for the full current list). There " +
      "is no extra cost; you only need your OHIP card. Prescribing is optional for pharmacists, " +
      "so call your local pharmacy first to confirm they offer it. Pharmacies also give free " +
      "publicly funded flu and COVID-19 vaccines to eligible people.",
    keywords: [
      "pharmacy", "pharmacist", "prescription", "common ailments", "minor ailments", "pink eye",
      "uti", "urinary", "hay fever", "allergy", "insect bite", "cold sore", "acne", "vaccine",
      "flu shot", "medication",
      "صيدليه", "صيدلي", "روشته", "دوا", "علاج", "رمد", "حساسيه", "التهاب بول", "مسالك",
      "قرصه", "حبوب", "تطعيم", "انفلونزا",
    ],
  },
  {
    id: "find-services",
    title: "Find health services near you",
    title_ar: "دوّر على خدمات صحية قريبة منك",
    url: "https://www.ontario.ca/locations/health",
    publisher: "Government of Ontario",
    summary:
      "The Ontario government's online search tool lets you look up doctors, clinics, mental " +
      "health services, pharmacies and other health services near you and your family. You can " +
      "also call 811 for help finding a service.",
    keywords: [
      "near me", "nearby", "find", "search", "location", "closest", "mental health", "services",
      "قريب", "قريبه", "اقرب", "ادور", "مكان", "صحه نفسيه", "خدمات",
    ],
  },
  {
    id: "community-health-centres",
    title: "Community Health Centres (CHCs)",
    title_ar: "المراكز الصحية المجتمعية (Community Health Centres)",
    url: "https://www.ontario.ca/page/community-health-centres",
    publisher: "Government of Ontario",
    summary:
      "Ontario has 75 Community Health Centres (CHCs). They are non-profit agencies that give " +
      "primary health care, health promotion and community programs. CHCs are a good option for " +
      "newcomers and people without a family doctor, and they are funded to serve some Ontario " +
      "residents who do not have OHIP, so you may be able to get care there before you have a " +
      "health card. Each CHC serves its own area or community, so call first and ask whether " +
      "they can take you. The official list of all CHCs with addresses and phone numbers is on " +
      "the linked ontario.ca page. You can also call Ontario 211 or Health811 (811) to find the " +
      "CHC closest to you.",
    keywords: [
      "community health centre", "community health center", "chc", "no ohip", "without ohip",
      "don't have ohip", "dont have ohip", "uninsured", "no insurance", "no health card",
      "free clinic", "nearest", "closest", "near me", "newcomer", "new to",
      "مركز صحي", "مراكز صحيه", "مركز مجتمعي", "من غير اوهيب", "معنديش اوهيب", "مفيش اوهيب",
      "مش معايا اوهيب", "معنديش ohip", "مفيش ohip", "من غير ohip", "مش معايا ohip",
      "ملوش ohip", "لسه مطلعتش", "من غير تامين", "مركز صحه", "مجاني", "ببلاش", "اقرب", "قريب مني",
    ],
  },
  {
    id: "no-ohip-pregnancy",
    title: "Pregnancy care without OHIP: midwives",
    title_ar: "متابعة الحمل من غير OHIP: القابلات (midwives)",
    url: "https://www.ontariomidwives.ca/uninsured-clients-faq",
    publisher: "Association of Ontario Midwives",
    summary:
      "In Ontario, midwives are funded by the Ministry of Health to care for pregnant people who " +
      "live in their area, even if they do not have OHIP, so midwifery care can be free for " +
      "people who are not yet covered. It is based on living in Ontario, not on immigration " +
      "status; it does not cover people who come to Canada only to give birth, or people whose " +
      "private insurance already covers pregnancy care. Ask the midwifery practice about your " +
      "situation. Midwives also work with Community Health Centres to support people " +
      "without insurance. Without OHIP or other insurance, a hospital can bill you for care, so " +
      "it is worth sorting out coverage early. A baby born in Canada may be eligible for OHIP " +
      "even if the parent is not. To find a midwife or other prenatal care near you, call " +
      "Health811 (811).",
    keywords: [
      "pregnant", "pregnancy", "prenatal", "midwife", "midwives", "baby", "birth", "delivery",
      "expecting", "obstetrician", "ob",
      "حامل", "حمل", "متابعه حمل", "دايه", "قابله", "ولاده", "بيبي", "نونو", "هولد",
    ],
  },
  {
    id: "ontario-211",
    title: "Ontario 211: find community and social services",
    title_ar: "Ontario 211: دوّر على خدمات المجتمع",
    url: "https://211ontario.ca",
    publisher: "211 Ontario",
    summary:
      "Ontario 211 is a free helpline and website that connects people to community, social and " +
      "health-related services near them, including Community Health Centres, walk-in clinics " +
      "and settlement services for newcomers. Call 211 any time, 24/7, with interpreters in more " +
      "than 150 languages; text and online chat are also available at 211ontario.ca.",
    keywords: [
      "211", "settlement", "community services", "social services", "near me", "nearest",
      "find", "newcomer", "help",
      "211", "خدمات", "مساعده", "قريب مني", "اقرب", "مهاجرين جداد",
    ],
  },
  {
    id: "crisis-988",
    title: "9-8-8: Suicide Crisis Helpline",
    title_ar: "9-8-8: خط أزمات الانتحار",
    url: "https://988.ca",
    publisher: "9-8-8 Suicide Crisis Helpline (funded by the Government of Canada)",
    summary:
      "If you are thinking about suicide, or are worried about someone else, you can call or " +
      "text 988 any time, day or night, anywhere in Canada. It is free and available in English " +
      "and French. If someone is in immediate danger, call 911.",
    keywords: [
      "988", "crisis", "mental health crisis", "suicide", "distress", "worried about someone",
      "ازمه", "ازمه نفسيه", "قلقان علي حد", "انتحار",
    ],
  },
];
