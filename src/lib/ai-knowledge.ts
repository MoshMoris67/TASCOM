import { school } from "./school-info";
import { fetchNews, type NewsPost } from "./news";
import { fetchUpcomingEvents, type UpcomingEvent } from "./events";

/**
 * Local knowledge engine for the TASCOM assistant.
 *
 * This answers visitors when no LLM API key is configured, and it grounds the
 * LLM when a key IS configured.
 *
 * It is deliberately score-based rather than a first-match-wins regex chain.
 * The previous implementation used unanchored patterns like /y+o+/i and
 * /h+i+/i, which matched the "yo" inside "your" and the "hi" inside "ships",
 * so "What are your entry requirements?" was answered with "Hello there!".
 *
 * Three rules keep that class of bug from returning:
 *   1. Greetings/thanks/farewells are matched against the WHOLE message, anchored.
 *   2. Topic keywords match on word boundaries only.
 *   3. Every intent is scored in weighted tiers and must clear a minimum.
 */

export type Intent = {
  id: string;
  /** Distinctive multi-word phrases. Substring match. Weight 5. */
  strong?: string[];
  /** Topic-defining nouns — "fees", "boarding", "portal". Weight 3. */
  primary: string[];
  /** Supporting words that only matter alongside others. Weight 1. */
  secondary?: string[];
  /** Follow-up questions offered after this answer. */
  suggestions?: string[];
  answer: (ctx: KnowledgeContext) => string | Promise<string>;
};

export type KnowledgeContext = {
  news: NewsPost[];
  events: UpcomingEvent[];
};

export type LocalMatch = {
  reply: string;
  intent: string;
  score: number;
  suggestions: string[];
};

const KAMPALA = "Africa/Kampala";

const WEIGHT_STRONG = 5;
const WEIGHT_PRIMARY = 3;
const WEIGHT_SECONDARY = 1;

/** A single primary keyword is enough; a lone supporting word is not. */
const MIN_SCORE = 3;

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

function formatEventDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      timeZone: KAMPALA,
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function formatNewsDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      timeZone: KAMPALA,
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

/* ------------------------------------------------------------------ */
/* Normalisation                                                       */
/* ------------------------------------------------------------------ */

export function normalise(message: string): string {
  return message
    .toLowerCase()
    .replace(/[\u2018\u2019']/g, "'")
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Word-boundary containment. "hi" will NOT match inside "ships". */
function hasWord(text: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`).test(text);
}

/* ------------------------------------------------------------------ */
/* Pleasantries — anchored to the whole message                        */
/* ------------------------------------------------------------------ */

const GREETING_RE =
  /^(?:hey+|hi+|hello+|helo+|yo|hiya|howdy|greetings|good\s*(?:morning|afternoon|evening|day)|how\s*(?:are|r)\s*(?:you|u)(?:\s*doing)?|what'?s\s*up|sup|hi\s*there|hello\s*there|hey\s*there)[\s!?.]*$/;

const THANKS_RE =
  /^(?:thanks?|thank\s*you|thanx|thx|cheers|much\s*appreciated|appreciate\s*it|i\s*appreciate\s*(?:it|that)|grateful|asante)(?:\s*(?:so|very|a\s*lot|very\s*much|so\s*much|much))?[\s!?.]*$/;

const BYE_RE =
  /^(?:bye+|goodbye|good\s*bye|see\s*(?:you|ya)(?:\s*later)?|later|ok(?:ay)?\s*bye|bye\s*bye)[\s!?.]*$/;

export function matchPleasantry(text: string): LocalMatch | null {
  if (GREETING_RE.test(text)) {
    return {
      reply:
        "Hello! I'm the TASCOM assistant for Talents College Mukono. I can help with admissions, fees, subjects, term dates, events, the student portal and contacts. What would you like to know?",
      intent: "greeting",
      score: 100,
      suggestions: [
        "How do I apply?",
        "What subjects do you offer?",
        "When is the next event?",
        "Where are you located?",
      ],
    };
  }

  if (THANKS_RE.test(text)) {
    return {
      reply: "You're very welcome. Ask me anything else you need — I'm here to help.",
      intent: "thanks",
      score: 100,
      suggestions: ["How do I apply?", "What are the school contacts?"],
    };
  }

  if (BYE_RE.test(text)) {
    return {
      reply: `Goodbye, and thank you for visiting Talents College Mukono. If you need us later: ${school.contacts.office1} or ${school.contacts.email}.`,
      intent: "farewell",
      score: 100,
      suggestions: [],
    };
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Intents                                                             */
/* ------------------------------------------------------------------ */

export const INTENTS: Intent[] = [
  {
    id: "location",
    strong: ["where are you", "where is the school", "how do i get there", "how do i find you"],
    primary: ["location", "located", "address", "directions", "map"],
    secondary: ["where", "situated", "find", "place"],
    suggestions: ["What are your contacts?", "Can I visit the school?"],
    answer: () =>
      [
        "Talents College Mukono is at:",
        `• ${school.address.physical}`,
        `• Postal address: ${school.address.postal}`,
        "",
        "We're roughly 1km from Mukono Town Council, so a boda or taxi from the town centre is a short ride. Directions and a map are on /contact.",
      ].join("\n"),
  },
  {
    id: "contact",
    strong: ["contact you", "phone number", "get in touch", "how do i reach"],
    primary: ["contact", "contacts", "phone", "whatsapp", "email", "telephone"],
    secondary: ["call", "number", "reach", "speak", "talk"],
    suggestions: ["Where are you located?", "Can I visit the school?"],
    answer: () =>
      [
        "Here's how to reach Talents College Mukono:",
        `• Head Teacher: ${school.contacts.headTeacher}`,
        `• Office: ${school.contacts.office1}`,
        `• Alternative office: ${school.contacts.office2}`,
        `• WhatsApp: ${school.contacts.whatsapp}`,
        `• Email: ${school.contacts.email}`,
        "",
        "Full details and a message form are on /contact.",
      ].join("\n"),
  },
  {
    id: "fees",
    strong: ["school fees", "fees structure", "how much are the fees", "cost per term", "how much do you charge"],
    primary: ["fees", "fee", "tuition", "charges"],
    secondary: ["payment", "pay", "cost", "price", "balance", "afford", "expensive"],
    suggestions: ["Are there scholarships?", "How do I apply?", "What are your contacts?"],
    answer: () =>
      [
        "Fees depend on the level ('O' or 'A' Level) and whether the student is a day scholar or boarder, and they're reviewed each year — so I don't quote figures myself, to avoid giving you a stale number.",
        "",
        "For the current fees structure and payment plans:",
        `• Bursar's office: ${school.contacts.office1}`,
        `• Email: ${school.contacts.email}`,
        "• Admissions details: /admissions",
      ].join("\n"),
  },
  {
    id: "boarding",
    strong: ["day or boarding", "boarding section", "is it boarding", "day scholar"],
    primary: ["boarding", "boarder", "boarders", "dormitory", "dorm", "hostel", "accommodation"],
    secondary: ["residential", "sleep", "stay", "scholar", "day"],
    suggestions: ["What should a boarder bring?", "What are the fees?"],
    answer: () =>
      [
        `Talents College Mukono is a ${school.type.toLowerCase()} — so we run both a day section and a boarding section, for boys and girls.`,
        "",
        `Boarding places are limited and fill up early in the term, so it's worth confirming availability before you apply. Call the office on ${school.contacts.office1} to check current space, or see /admissions.`,
      ].join("\n"),
  },
  {
    id: "apply",
    strong: ["how do i apply", "how to apply", "want to join", "application form", "can i join", "apply online"],
    primary: ["apply", "application", "admission", "admissions", "enrol", "enroll", "enrolment", "intake", "vacancies"],
    secondary: ["admit", "join", "register", "registration", "vacancy", "form"],
    suggestions: ["What documents do I need?", "How do I check my status?", "What are the fees?"],
    answer: () =>
      [
        "Applications for Senior 1 and Senior 5 are open.",
        "",
        "You can apply in two ways:",
        "1. Online — fill in the form at /apply (fastest, and you get a reference number straight away).",
        `2. In person or by phone — call ${school.contacts.office1} and the office will guide you.`,
        "",
        "Once you've applied, track your progress at /admissions/check-status using your reference number.",
      ].join("\n"),
  },
  {
    id: "requirements",
    strong: ["what do i need", "entry requirements", "what documents", "do i qualify", "am i eligible"],
    primary: ["requirements", "requirement", "documents", "qualifications", "eligibility", "criteria", "ple", "uce"],
    secondary: ["need", "qualify", "eligible", "bring", "document", "slip"],
    suggestions: ["How do I apply?", "What are the fees?"],
    answer: () =>
      [
        "For a Senior 1 place you'll generally need the pupil's PLE results slip (or a school testimonial if results are pending), a birth certificate or age proof, and a passport photo.",
        "",
        "For Senior 5 you'll need the UCE results slip and your preferred subject combination.",
        "",
        `Requirements can vary by intake, so please confirm the current list with the office on ${school.contacts.office1} before you travel. Start the application at /apply.`,
      ].join("\n"),
  },
  {
    id: "status",
    strong: ["check my application", "application status", "have i been admitted", "reference number", "was i accepted"],
    primary: ["status", "reference", "shortlisted"],
    secondary: ["track", "tracking", "progress", "outcome", "decision", "accepted", "admitted"],
    suggestions: ["How do I apply?", "What are your contacts?"],
    answer: () =>
      [
        "Check your application status at /admissions/check-status — you'll need the reference number you received when you applied.",
        "",
        `If you've lost the reference number, call the admissions office on ${school.contacts.office1} with the applicant's full name and they'll look it up.`,
      ].join("\n"),
  },
  {
    id: "scholarship",
    strong: ["financial aid", "can i get a scholarship", "help with fees", "sponsor a child"],
    primary: ["scholarship", "scholarships", "bursary", "bursaries", "sponsorship", "sponsor"],
    secondary: ["financial", "aid", "assistance", "discount", "needy", "support"],
    suggestions: ["How do I apply?", "What are the fees?"],
    answer: () =>
      [
        "A limited number of scholarships and bursaries are available, usually on academic merit, sports or talent, and demonstrated need. Places are competitive and decided case by case.",
        "",
        `Speak to the Head Teacher's office directly: ${school.contacts.headTeacher}. Applying early in the intake gives you the best chance.`,
      ].join("\n"),
  },
  {
    id: "academics",
    strong: ["what subjects", "subject combinations", "what do you teach", "o level", "a level", "which courses"],
    primary: ["subjects", "subject", "curriculum", "syllabus", "combination", "combinations", "academics", "courses"],
    secondary: ["sciences", "arts", "humanities", "languages", "streams", "taught", "teach"],
    suggestions: ["How do you perform in UNEB?", "Do you have science labs?", "How do I apply?"],
    answer: () =>
      [
        `We teach the Ugandan national curriculum at both ${school.levels}.`,
        "",
        "• 'O' Level (S.1–S.4): the full UNEB core — Maths, English, the Sciences, Geography, History, CRE/IRE, plus practical and vocational options, leading to UCE.",
        "• 'A' Level (S.5–S.6): sciences, humanities and languages offered in combinations such as PCM, PCB, BCM, HEG and HEL, leading to UACE.",
        "",
        "Exact combinations offered in a given year depend on numbers and staffing. Full details are on /academics.",
      ].join("\n"),
  },
  {
    id: "facilities",
    strong: ["what facilities", "do you have a library", "science labs", "computer lab", "is there internet"],
    primary: ["facilities", "lab", "labs", "laboratory", "laboratories", "library", "ict", "computers", "computer"],
    secondary: ["science", "classroom", "classrooms", "infrastructure", "campus", "internet"],
    suggestions: ["What clubs and sports do you have?", "Can I see photos?"],
    answer: () =>
      [
        "Our campus at Nabuti includes science laboratories, an ICT/computer lab, a library, classroom blocks, boarding facilities and a sports field.",
        "",
        `You can see the campus for yourself in the photo gallery at /gallery, or arrange a visit by calling ${school.contacts.office1}.`,
      ].join("\n"),
  },
  {
    id: "sports",
    strong: ["what clubs", "do you have sports", "extra curricular", "co curricular", "music dance and drama"],
    primary: ["sports", "games", "football", "netball", "athletics", "clubs", "club", "mdd", "drama", "debate", "scouts"],
    secondary: ["music", "talent", "talents", "extracurricular", "activities", "sport"],
    suggestions: ["What facilities do you have?", "When is the next event?"],
    answer: () =>
      [
        `Talent development is in our name and our motto is "${school.motto}", so co-curricular life matters here.`,
        "",
        "Students take part in football, netball, athletics and inter-house competitions, plus music, dance and drama (MDD), debating, science and ICT clubs, and other talent activities.",
        "",
        "See /student-life for more, and /gallery for photos.",
      ].join("\n"),
  },
  {
    id: "about",
    strong: ["about the school", "when was it founded", "tell me about", "school history", "who owns"],
    primary: ["history", "founded", "established", "motto", "mission", "vision", "registration", "registered"],
    secondary: ["about", "background", "story", "government", "started"],
    suggestions: ["What subjects do you offer?", "Who are the staff?"],
    answer: () =>
      [
        `${school.fullName} was founded in ${school.founded} and is a ${school.type.toLowerCase()} registered with the Ministry of Education under ${school.registration}.`,
        "",
        `Our motto is "${school.motto}". We teach ${school.levels} and sit in ${school.address.physical}.`,
        "",
        "More on our story, leadership and values at /about.",
      ].join("\n"),
  },
  {
    id: "staff",
    strong: ["who are the teachers", "head teacher", "who runs the school", "teaching staff"],
    primary: ["staff", "teachers", "teacher", "headteacher", "director", "directors", "faculty", "administration"],
    secondary: ["management", "head", "leadership"],
    suggestions: ["Tell me about the school", "What are your contacts?"],
    answer: () =>
      [
        "Our teaching team and school leadership are profiled on /staff, including the administration and heads of department.",
        "",
        `To speak to the Head Teacher directly, call ${school.contacts.headTeacher}.`,
      ].join("\n"),
  },
  {
    id: "alumni",
    strong: ["old students", "alumni association", "former students", "past students"],
    primary: ["alumni", "alumnus", "graduates", "graduate"],
    secondary: ["former", "old", "reunion"],
    suggestions: ["What events are coming up?", "Tell me about the school"],
    answer: () =>
      [
        "Our alumni community stays closely involved — through the alumni association, mentorship, tree-planting and the annual Alumni vs Students sports gala.",
        "",
        "See /alumni to read more or to reconnect with the school.",
      ].join("\n"),
  },
  {
    id: "portal",
    strong: ["student portal", "check my results", "forgot my password", "report card", "log in", "sign in"],
    primary: ["portal", "password", "login", "marks", "grades", "assignment", "assignments", "transcript", "dashboard"],
    secondary: ["account", "report", "reports", "results", "sign"],
    suggestions: ["I forgot my password", "What are your contacts?"],
    answer: () =>
      [
        "Students can sign in to the Student Portal at /portal to view published results, assignments and printable academic reports.",
        "",
        "Sign in with the Student ID issued by the school (for example TCM-2024-001) and your portal password.",
        "",
        `If you've forgotten your password or your ID isn't working, the office can reset it for you: ${school.contacts.office1}.`,
      ].join("\n"),
  },
  {
    id: "next_event",
    strong: ["next event", "upcoming events", "what's happening", "whats happening", "visiting day", "parents day", "parents meeting", "any events"],
    primary: ["event", "events", "calendar", "gala", "expo", "consultation"],
    secondary: ["upcoming", "next", "happening", "visiting", "meeting", "when"],
    suggestions: ["What's the latest news?", "When does the term start?"],
    answer: ({ events }) => {
      if (!events.length) {
        return `I don't have any upcoming events listed right now. The school calendar and announcements are posted on /media, or call the office on ${school.contacts.office1}.`;
      }

      const lines = events.slice(0, 4).map((e) => {
        const days = daysUntil(e.starts_at);
        const when = days <= 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;
        return `• ${e.title} — ${formatEventDate(e.starts_at)} (${when})${e.location ? `, at ${e.location}` : ""}`;
      });

      return [
        "Here's what's coming up at school:",
        "",
        ...lines,
        "",
        "The full calendar is on /media.",
      ].join("\n");
    },
  },
  {
    id: "news",
    strong: ["latest news", "any news", "what's new", "whats new", "recent announcements"],
    primary: ["news", "announcement", "announcements", "notice", "updates"],
    secondary: ["latest", "update", "recent", "happened"],
    suggestions: ["When is the next event?", "Tell me about the school"],
    answer: ({ news }) => {
      if (!news.length) {
        return "I don't have any news posts to show right now — please check /news or /media.";
      }

      const lines = news
        .slice(0, 3)
        .map((n) => `• ${n.title} (${formatNewsDate(n.published_at)})\n  ${n.excerpt}`);

      return ["Here's the latest from school:", "", ...lines, "", "Read the full stories at /news."].join("\n");
    },
  },
  {
    id: "term_dates",
    strong: ["when does term start", "term dates", "reporting date", "when do you open", "school calendar", "when does school open", "when do we report"],
    primary: ["term", "terms", "reporting", "holidays", "holiday", "semester"],
    secondary: ["start", "starts", "opening", "open", "break", "close", "closing", "resume", "report"],
    suggestions: ["When is the next event?", "What's the latest news?"],
    answer: ({ news, events }) => {
      const termPost = news.find((n) => /term|opening|report/i.test(n.title));
      const termEvent = events.find((e) => /term|opening|report|resum/i.test(e.title));

      const parts: string[] = [];

      if (termPost) {
        parts.push(`From our announcements: ${termPost.title}`, "", termPost.excerpt, "");
      } else if (termEvent) {
        parts.push(`Next on the calendar: ${termEvent.title} — ${formatEventDate(termEvent.starts_at)}.`, "");
      }

      parts.push(
        "Term dates follow the Ministry of Education calendar and are confirmed each term.",
        `For the exact reporting date and arrangements, see /media or call the office on ${school.contacts.office1}.`,
      );

      return parts.join("\n");
    },
  },
  {
    id: "uniform",
    strong: ["school uniform", "shopping list", "what to bring", "what should i bring"],
    primary: ["uniform", "uniforms", "beddings", "mattress", "scholastic"],
    secondary: ["dress", "clothes", "kit", "list", "shopping"],
    suggestions: ["What are the fees?", "Do you offer boarding?"],
    answer: () =>
      [
        "Uniform and the boarding shopping list (beddings, personal effects and scholastic materials) are issued by the school when a place is confirmed, and the list is updated each intake.",
        "",
        `Ask the office for the current list before you buy anything: ${school.contacts.office1}.`,
      ].join("\n"),
  },
  {
    id: "transport",
    strong: ["school bus", "do you have transport", "school van"],
    primary: ["transport", "bus", "van", "shuttle"],
    secondary: ["pickup", "drop", "commute", "travel"],
    suggestions: ["Where are you located?", "Do you offer boarding?"],
    answer: () =>
      [
        "For transport arrangements for day scholars, please talk to the office directly — routes and availability change with demand each term.",
        "",
        `Call ${school.contacts.office1}. Our location and directions are on /contact.`,
      ].join("\n"),
  },
  {
    id: "visit",
    strong: ["can i visit", "school tour", "come and see", "visit the school", "book a visit"],
    primary: ["visit", "tour", "appointment"],
    secondary: ["come", "see", "viewing"],
    suggestions: ["Where are you located?", "What facilities do you have?"],
    answer: () =>
      [
        "Yes — prospective parents and students are welcome to visit the campus. It's best to call ahead so someone is free to show you around.",
        "",
        `Book a visit on ${school.contacts.office1}, and find directions on /contact. You can also preview the campus at /gallery.`,
      ].join("\n"),
  },
  {
    id: "results_performance",
    strong: ["uneb results", "how do you perform", "pass rate", "academic performance", "are you a good school"],
    primary: ["uneb", "uace", "performance", "ranking"],
    secondary: ["pass", "passed", "rate", "best", "good", "academic", "grades", "perform"],
    suggestions: ["What subjects do you offer?", "Tell me about the school"],
    answer: () =>
      [
        "We're proud of our UNEB record at both UCE and UACE, alongside strong co-curricular results. I don't quote specific figures here because I'd rather you get verified numbers than an approximation.",
        "",
        `For our most recent published performance, see /about and /news, or ask the Head Teacher's office on ${school.contacts.headTeacher}.`,
      ].join("\n"),
  },
  {
    id: "social",
    strong: ["social media", "facebook page", "follow you", "youtube channel"],
    primary: ["facebook", "instagram", "youtube", "tiktok", "socials"],
    secondary: ["social", "follow", "page", "channel", "handle"],
    suggestions: ["What's the latest news?", "Can I see photos?"],
    answer: () =>
      [
        "You can follow Talents College Mukono here:",
        `• Facebook: ${school.social.facebook}`,
        `• Instagram: ${school.social.instagram}`,
        `• YouTube: ${school.social.youtube}`,
        `• TikTok: ${school.social.tiktok}`,
      ].join("\n"),
  },
  {
    id: "gallery",
    strong: ["see photos", "photo gallery", "pictures of the school", "show me photos"],
    primary: ["photos", "photo", "pictures", "picture", "images", "gallery", "video", "videos"],
    secondary: ["look", "see", "show"],
    suggestions: ["What facilities do you have?", "Can I visit the school?"],
    answer: () =>
      "Photos of the campus, classrooms, laboratories, sports and school events are in the gallery at /gallery, with more in /media.",
  },
  {
    id: "identity",
    strong: ["who are you", "are you a bot", "are you human", "what are you", "are you real", "are you a robot"],
    primary: ["bot", "robot", "chatbot", "assistant"],
    secondary: ["ai", "human", "real"],
    suggestions: ["How do I apply?", "What are your contacts?"],
    answer: () =>
      [
        "I'm the TASCOM assistant — an automated helper on the Talents College Mukono website.",
        "",
        "I can answer questions about admissions, fees, subjects, term dates, events, the student portal and how to reach us. For anything that needs a person — an admissions decision, an exact fee, a specific student's records — I'll point you to the right office.",
      ].join("\n"),
  },
  {
    id: "help",
    strong: ["what can you do", "help me", "what can you help with", "how can you help", "what do you know"],
    primary: ["help"],
    secondary: ["assist", "options", "topics"],
    suggestions: ["How do I apply?", "What are the fees?", "When is the next event?"],
    answer: () =>
      [
        "Happy to help. I can tell you about:",
        "",
        "• Admissions — how to apply, requirements, checking your status",
        "• Fees, scholarships and bursaries",
        "• Subjects at 'O' and 'A' Level",
        "• Boarding and day options",
        "• Term dates, events and school news",
        "• The student portal (results, assignments, reports)",
        "• Our location and contacts",
        "",
        "Just ask in your own words.",
      ].join("\n"),
  },
];

/* ------------------------------------------------------------------ */
/* Scoring                                                             */
/* ------------------------------------------------------------------ */

export function scoreIntent(text: string, intent: Intent): number {
  let score = 0;

  for (const phrase of intent.strong ?? []) {
    if (text.includes(phrase)) score += WEIGHT_STRONG;
  }
  for (const kw of intent.primary) {
    if (hasWord(text, kw)) score += WEIGHT_PRIMARY;
  }
  for (const kw of intent.secondary ?? []) {
    if (hasWord(text, kw)) score += WEIGHT_SECONDARY;
  }

  return score;
}

/**
 * Best local answer for a message, or null if nothing scored high enough.
 * Context (news/events) is passed in so the caller controls fetching.
 */
export async function matchLocal(
  message: string,
  ctx: KnowledgeContext,
): Promise<LocalMatch | null> {
  const text = normalise(message);
  if (!text) return null;

  const pleasantry = matchPleasantry(text);
  if (pleasantry) return pleasantry;

  let best: Intent | null = null;
  let bestScore = 0;

  for (const intent of INTENTS) {
    const score = scoreIntent(text, intent);
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  if (!best || bestScore < MIN_SCORE) return null;

  return {
    reply: await best.answer(ctx),
    intent: best.id,
    score: bestScore,
    suggestions: best.suggestions ?? [],
  };
}

/** Loads the live data the knowledge engine can reference. Never throws. */
export async function loadContext(): Promise<KnowledgeContext> {
  const [news, events] = await Promise.all([
    fetchNews(5).catch(() => [] as NewsPost[]),
    fetchUpcomingEvents(5).catch(() => [] as UpcomingEvent[]),
  ]);
  return { news, events };
}
