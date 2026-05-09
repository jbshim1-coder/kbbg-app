"use client";

import { useState } from "react";

type IdolId =
  | "v" | "jungkook" | "jimin" | "rm" | "bangchan" | "felix" | "kai" | "gdragon" | "jackson" | "taemin"
  | "jennie" | "lisa" | "rose" | "jisoo" | "iu" | "karina" | "hanni" | "wonyoung" | "nayeon" | "ryujin";

interface Idol {
  id: IdolId;
  name: string;
  group: string;
  title: string;
  desc: string;
  gradient: string;
  textColor: string;
  emoji: string;
  traits: string[];
}

interface QuizOption {
  text: string;
  emoji: string;
  idols: IdolId[];
}

interface Question {
  text: string;
  emoji: string;
  options: QuizOption[];
}

const IDOLS: Idol[] = [
  { id: "v", name: "V (Taehyung)", group: "BTS", title: "The Artist", desc: "Deep, mysterious, and fiercely creative — you see the world through an artist's eye and express yourself in ways others can't quite explain.", gradient: "from-violet-900 via-purple-800 to-indigo-900", textColor: "text-purple-200", emoji: "🎨", traits: ["Mysterious", "Artistic", "Deep", "Unique"] },
  { id: "jungkook", name: "Jungkook", group: "BTS", title: "The Golden One", desc: "Endlessly versatile and driven — you pour your whole heart into everything you do and you're always leveling up.", gradient: "from-amber-900 via-yellow-800 to-orange-900", textColor: "text-amber-200", emoji: "⭐", traits: ["Passionate", "Athletic", "Versatile", "Perfectionist"] },
  { id: "jimin", name: "Jimin", group: "BTS", title: "The Heart", desc: "Warm, expressive, and deeply empathetic — you feel everything intensely and make everyone around you feel truly seen.", gradient: "from-rose-900 via-pink-800 to-red-900", textColor: "text-rose-200", emoji: "💗", traits: ["Emotional", "Charismatic", "Caring", "Expressive"] },
  { id: "rm", name: "RM (Namjoon)", group: "BTS", title: "The Philosopher", desc: "Intellectual and always seeking meaning — you lead with wisdom and aren't afraid to ask the big questions.", gradient: "from-blue-900 via-indigo-800 to-slate-900", textColor: "text-blue-200", emoji: "📚", traits: ["Intellectual", "Philosophical", "Creative", "Leader"] },
  { id: "bangchan", name: "Bang Chan", group: "Stray Kids", title: "The Protector", desc: "Hardworking, reliable, and endlessly caring — you lift everyone around you and never stop grinding toward your goals.", gradient: "from-emerald-900 via-green-800 to-teal-900", textColor: "text-emerald-200", emoji: "🛡️", traits: ["Reliable", "Hardworking", "Warm", "Leader"] },
  { id: "felix", name: "Felix", group: "Stray Kids", title: "The Sunshine", desc: "Bright, warm, and lovably unique — you light up every room and your genuine energy is completely impossible to resist.", gradient: "from-orange-900 via-amber-700 to-yellow-800", textColor: "text-orange-200", emoji: "☀️", traits: ["Bright", "Warm", "Unique", "Lovable"] },
  { id: "kai", name: "Kai", group: "EXO", title: "The Performer", desc: "Magnetic and powerful on stage, deeply sensitive off it — you were born to perform and your presence stops people in their tracks.", gradient: "from-red-900 via-rose-800 to-orange-900", textColor: "text-red-200", emoji: "🔥", traits: ["Charismatic", "Powerful", "Passionate", "Elegant"] },
  { id: "gdragon", name: "G-Dragon", group: "BIGBANG", title: "The Icon", desc: "Ahead of your time and impossible to categorize — you create trends rather than follow them and your vision is unmatched.", gradient: "from-zinc-900 via-neutral-800 to-stone-900", textColor: "text-zinc-300", emoji: "👑", traits: ["Iconic", "Creative", "Independent", "Trendsetter"] },
  { id: "jackson", name: "Jackson Wang", group: "GOT7", title: "The Entertainer", desc: "Energetic, hilarious, and wildly charismatic — you're the life of every party and your ambition to connect with people knows no limits.", gradient: "from-cyan-900 via-sky-800 to-blue-900", textColor: "text-cyan-200", emoji: "🎤", traits: ["Energetic", "Funny", "Ambitious", "Bold"] },
  { id: "taemin", name: "Taemin", group: "SHINee", title: "The Perfectionist", desc: "Ethereal, dedicated, and endlessly refined — you approach everything with an artist's precision and an air of mysterious elegance.", gradient: "from-slate-800 via-purple-900 to-indigo-800", textColor: "text-slate-200", emoji: "🌙", traits: ["Elegant", "Mysterious", "Perfectionist", "Ethereal"] },
  { id: "jennie", name: "Jennie", group: "BLACKPINK", title: "The Queen", desc: "Effortlessly cool and timelessly stylish — you command every room without even trying and your standards are impossibly high.", gradient: "from-stone-900 via-pink-900 to-rose-800", textColor: "text-pink-200", emoji: "💎", traits: ["Charismatic", "Fashionable", "Sharp", "Confident"] },
  { id: "lisa", name: "Lisa", group: "BLACKPINK", title: "The Dancer", desc: "Free-spirited, powerful, and electric — you move through life with unstoppable energy and talent for everything you try.", gradient: "from-yellow-900 via-amber-800 to-neutral-900", textColor: "text-yellow-200", emoji: "💛", traits: ["Free-spirited", "Powerful", "Energetic", "Magnetic"] },
  { id: "rose", name: "Rosé", group: "BLACKPINK", title: "The Romantic", desc: "Artistic, sensitive, and deeply musical — you feel life more intensely than most and channel that depth into beautiful things.", gradient: "from-pink-900 via-rose-800 to-fuchsia-900", textColor: "text-pink-200", emoji: "🌹", traits: ["Artistic", "Romantic", "Sensitive", "Musical"] },
  { id: "jisoo", name: "Jisoo", group: "BLACKPINK", title: "The Classic", desc: "Warm, genuinely charming, and classically beautiful — you make everyone feel at home and your sincerity is your greatest strength.", gradient: "from-red-900 via-rose-900 to-pink-800", textColor: "text-red-200", emoji: "🍎", traits: ["Warm", "Charming", "Natural", "Sincere"] },
  { id: "iu", name: "IU", group: "Solo", title: "The Sweetheart", desc: "Talented beyond measure, intelligent, and deeply relatable — you connect with people on a soul level and your work speaks straight to the heart.", gradient: "from-sky-900 via-blue-800 to-teal-900", textColor: "text-sky-200", emoji: "🎵", traits: ["Talented", "Intelligent", "Relatable", "Versatile"] },
  { id: "karina", name: "Karina", group: "aespa", title: "The Queen of Cool", desc: "Flawlessly composed and laser-focused — you carry yourself like someone who knows exactly who they are, always.", gradient: "from-violet-900 via-purple-900 to-fuchsia-800", textColor: "text-violet-200", emoji: "🤖", traits: ["Perfectionist", "Charismatic", "Futuristic", "Composed"] },
  { id: "hanni", name: "Hanni", group: "NewJeans", title: "The Charmer", desc: "Effortlessly likable, naturally trendy, and genuinely warm — you're the person everyone wants to be around, and it's 100% authentic.", gradient: "from-pink-800 via-rose-700 to-orange-800", textColor: "text-pink-100", emoji: "🌸", traits: ["Charming", "Friendly", "Trendy", "Natural"] },
  { id: "wonyoung", name: "Jang Wonyoung", group: "IVE", title: "The Star", desc: "Radiant, confident, and born to be in the spotlight — you carry yourself with effortless grace that makes every moment feel cinematic.", gradient: "from-rose-800 via-pink-700 to-fuchsia-700", textColor: "text-rose-100", emoji: "✨", traits: ["Radiant", "Confident", "Elegant", "Star Power"] },
  { id: "nayeon", name: "Nayeon", group: "TWICE", title: "The Sunshine", desc: "Bubbly, endlessly bright, and infectiously positive — your energy uplifts everyone and your smile is genuinely impossible to resist.", gradient: "from-orange-800 via-rose-800 to-pink-900", textColor: "text-orange-100", emoji: "🐰", traits: ["Bubbly", "Bright", "Positive", "Energetic"] },
  { id: "ryujin", name: "Ryujin", group: "ITZY", title: "The Cool Girl", desc: "Fiercely confident and quietly intense — you don't chase trends, you set them, and you do it all without breaking a sweat.", gradient: "from-slate-900 via-red-900 to-neutral-900", textColor: "text-slate-200", emoji: "🐍", traits: ["Confident", "Cool", "Fierce", "Intense"] },
];

const QUESTIONS: Question[] = [
  {
    text: "Your energy first thing in the morning?",
    emoji: "🌅",
    options: [
      { text: "Up early — workout, run, or straight to work", emoji: "💪", idols: ["jungkook", "lisa", "nayeon", "bangchan"] },
      { text: "Slow start — art, music, or just daydreaming", emoji: "🎨", idols: ["v", "rose", "iu", "taemin"] },
      { text: "Full skincare routine, mirror time, total preparation", emoji: "✨", idols: ["jennie", "wonyoung", "karina", "jisoo"] },
      { text: "Strategic — already thinking two steps ahead", emoji: "♟️", idols: ["rm", "gdragon", "felix", "kai"] },
    ],
  },
  {
    text: "How would you describe your fashion sense?",
    emoji: "👗",
    options: [
      { text: "Streetwear and urban cool — always ahead of the curve", emoji: "🧢", idols: ["gdragon", "jennie", "jackson", "ryujin"] },
      { text: "Romantic and soft — always flowing and effortless", emoji: "🌸", idols: ["rose", "jisoo", "jimin", "hanni"] },
      { text: "Avant-garde — people stare but can't stop looking", emoji: "🤖", idols: ["karina", "taemin", "v", "wonyoung"] },
      { text: "Clean, athletic, comfortable — cool without trying", emoji: "👟", idols: ["jungkook", "felix", "nayeon", "lisa"] },
    ],
  },
  {
    text: "When you hit a problem, you...",
    emoji: "🧠",
    options: [
      { text: "Analyze it carefully and find the logical path", emoji: "🔍", idols: ["rm", "bangchan", "kai", "iu"] },
      { text: "Face it head-on — full confidence, no overthinking", emoji: "⚡", idols: ["jungkook", "ryujin", "jennie", "wonyoung"] },
      { text: "Talk it through with someone you trust", emoji: "💬", idols: ["jisoo", "hanni", "jimin", "rose"] },
      { text: "Lighten the mood first, then tackle it with a smile", emoji: "😄", idols: ["jackson", "felix", "nayeon", "taemin"] },
    ],
  },
  {
    text: "What do people say about you most often?",
    emoji: "💬",
    options: [
      { text: "\"You're so mysterious and deep\"", emoji: "🌙", idols: ["v", "taemin", "gdragon", "lisa"] },
      { text: "\"You're always so cheerful and bright!\"", emoji: "☀️", idols: ["nayeon", "felix", "hanni", "jisoo"] },
      { text: "\"You just have this magnetic energy\"", emoji: "✨", idols: ["jennie", "karina", "kai", "jackson"] },
      { text: "\"You're so reliable and kind\"", emoji: "🤗", idols: ["bangchan", "jimin", "rose", "iu"] },
    ],
  },
  {
    text: "Your ideal Friday night?",
    emoji: "🌙",
    options: [
      { text: "Creating something — art, writing, music, photography", emoji: "🎭", idols: ["v", "rose", "rm", "iu"] },
      { text: "Practicing your craft until you nail it", emoji: "💃", idols: ["kai", "lisa", "taemin", "jungkook"] },
      { text: "Hosting people, laughing all night", emoji: "🥂", idols: ["jackson", "nayeon", "felix", "jennie"] },
      { text: "Cozy night in — good show, good food, full recharge", emoji: "🛋️", idols: ["jimin", "wonyoung", "hanni", "jisoo"] },
    ],
  },
  {
    text: "How do you feel about the spotlight?",
    emoji: "🎯",
    options: [
      { text: "Born for it — you come alive in front of an audience", emoji: "🌟", idols: ["wonyoung", "kai", "jennie", "nayeon"] },
      { text: "You earn it — every moment of recognition is deserved", emoji: "🏆", idols: ["jungkook", "bangchan", "taemin", "lisa"] },
      { text: "It finds you naturally — you never chase it", emoji: "🌊", idols: ["v", "iu", "rose", "jisoo"] },
      { text: "You can take it or leave it — the work matters more", emoji: "🎯", idols: ["rm", "gdragon", "ryujin", "karina"] },
    ],
  },
  {
    text: "Your dream vacation?",
    emoji: "✈️",
    options: [
      { text: "Museums, galleries, and hidden cultural gems", emoji: "🗿", idols: ["rm", "v", "iu", "rose"] },
      { text: "Beach, adventure, dancing with strangers till sunrise", emoji: "🌊", idols: ["jackson", "lisa", "felix", "nayeon"] },
      { text: "Fashion weeks in Paris, Milan, or NYC", emoji: "👠", idols: ["jennie", "gdragon", "karina", "wonyoung"] },
      { text: "A quiet mountain retreat — nature and total silence", emoji: "🏔️", idols: ["bangchan", "jimin", "hanni", "taemin"] },
    ],
  },
  {
    text: "In your friend group, you're the...",
    emoji: "👥",
    options: [
      { text: "Leader — you set the direction and people trust you", emoji: "🧭", idols: ["rm", "bangchan", "jennie", "karina"] },
      { text: "Wild card — unexpected, hilarious, everyone loves you", emoji: "🎲", idols: ["jackson", "felix", "lisa", "hanni"] },
      { text: "Trendsetter — your taste is impeccable and people copy you", emoji: "💅", idols: ["v", "gdragon", "wonyoung", "taemin"] },
      { text: "Emotional anchor — you make people feel safe and seen", emoji: "💞", idols: ["jisoo", "jimin", "iu", "rose"] },
    ],
  },
  {
    text: "Your main creative outlet?",
    emoji: "🎨",
    options: [
      { text: "Visual art, fashion design, or photography", emoji: "📸", idols: ["v", "gdragon", "karina", "wonyoung"] },
      { text: "Dancing, choreography, or physical performance", emoji: "💃", idols: ["kai", "lisa", "taemin", "ryujin"] },
      { text: "Writing, singing, songwriting, or composing", emoji: "🎵", idols: ["rose", "iu", "rm", "jimin"] },
      { text: "Fitness, sports, or building things with your hands", emoji: "🏋️", idols: ["jungkook", "bangchan", "felix", "jackson"] },
    ],
  },
  {
    text: "If you had a superpower, it would be...",
    emoji: "⚡",
    options: [
      { text: "Deep empathy — feel and understand anyone instantly", emoji: "💗", idols: ["jimin", "iu", "hanni", "rose"] },
      { text: "Infinite talent — master any skill immediately", emoji: "🌟", idols: ["jungkook", "lisa", "jackson", "nayeon"] },
      { text: "Time mastery — flawless execution, zero mistakes", emoji: "⏱️", idols: ["taemin", "karina", "bangchan", "ryujin"] },
      { text: "Boundless freedom — go anywhere, be anything", emoji: "🦋", idols: ["v", "gdragon", "rm", "wonyoung"] },
    ],
  },
];

export default function KpopQuiz() {
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState<Partial<Record<IdolId, number>>>({});
  const [result, setResult] = useState<Idol | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  function pickAnswer(option: QuizOption, idx: number) {
    if (selected !== null) return;
    setSelected(idx);

    const newScores = { ...scores };
    for (const id of option.idols) {
      newScores[id] = (newScores[id] ?? 0) + 1;
    }

    setTimeout(() => {
      if (current + 1 >= QUESTIONS.length) {
        const winnerId = Object.entries(newScores).sort((a, b) => b[1] - a[1])[0][0] as IdolId;
        setResult(IDOLS.find((i) => i.id === winnerId) ?? IDOLS[0]);
        setScores(newScores);
        setPhase("result");
      } else {
        setScores(newScores);
        setCurrent((c) => c + 1);
        setSelected(null);
      }
    }, 550);
  }

  function restart() {
    setPhase("intro");
    setCurrent(0);
    setScores({});
    setResult(null);
    setSelected(null);
    setCopied(false);
  }

  function shareTwitter() {
    if (!result) return;
    const text = `I got ${result.name} — "${result.title}" on the K-Pop Idol Quiz! 🎵 Which idol are you?`;
    const url = "https://kbeautybuyersguide.com/en/quiz";
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text + "\n" + url)}`, "_blank");
  }

  function copyLink() {
    navigator.clipboard.writeText("https://kbeautybuyersguide.com/en/quiz");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Intro ─────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full text-center">
          <div className="text-7xl mb-6">🎵</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ letterSpacing: "-0.5px", lineHeight: 1.1 }}>
            Which K-Pop Idol<br />Are You?
          </h1>
          <p className="text-lg text-zinc-400 mb-2">
            BTS · BLACKPINK · IVE · aespa · NewJeans · ITZY & more
          </p>
          <p className="text-sm text-zinc-600 mb-10">10 questions · 20 idols · ~2 minutes</p>
          <button
            onClick={() => setPhase("quiz")}
            className="bg-[#0071e3] hover:bg-[#0077ed] text-white text-lg font-medium px-10 py-4 rounded-full transition-all duration-200 active:scale-95"
          >
            Start the Quiz →
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────
  if (phase === "quiz") {
    const q = QUESTIONS[current];
    const progress = (current / QUESTIONS.length) * 100;

    return (
      <div className="min-h-screen bg-black flex flex-col items-center px-4 py-12">
        <div className="max-w-2xl w-full">
          <div className="mb-8">
            <div className="flex justify-between text-sm text-zinc-500 mb-2">
              <span>Question {current + 1} of {QUESTIONS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0071e3] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-8 text-center">
            <div className="text-4xl mb-4">{q.emoji}</div>
            <h2 className="text-2xl md:text-3xl font-semibold text-white" style={{ lineHeight: 1.2 }}>
              {q.text}
            </h2>
          </div>

          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              const isSelected = selected === idx;
              return (
                <button
                  key={idx}
                  onClick={() => pickAnswer(opt, idx)}
                  disabled={selected !== null}
                  className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200 flex items-center gap-4 ${
                    selected === null
                      ? "bg-[#1c1c1e] border-zinc-700 hover:border-[#0071e3] hover:bg-[#272729] active:scale-[0.98]"
                      : isSelected
                      ? "bg-[#0071e3] border-[#0071e3]"
                      : "bg-[#1c1c1e] border-zinc-800 opacity-40"
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                  <span className={`text-base font-medium ${isSelected ? "text-white" : "text-zinc-200"}`}>
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────
  if (!result) return null;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <p className="text-zinc-400 text-base mb-2">Your K-Pop match is...</p>
          <h2 className="text-3xl font-bold text-white">You&apos;re {result.name}! {result.emoji}</h2>
        </div>

        <div className={`rounded-3xl bg-gradient-to-br ${result.gradient} p-8 mb-6 text-center`}>
          <div className="text-6xl mb-4">{result.emoji}</div>
          <p className="text-sm font-medium text-white/60 uppercase tracking-widest mb-1">{result.group}</p>
          <h3 className="text-3xl font-bold text-white mb-2">{result.name}</h3>
          <p className={`text-lg font-medium mb-4 ${result.textColor}`}>&ldquo;{result.title}&rdquo;</p>
          <p className="text-white/80 text-base leading-relaxed">{result.desc}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {result.traits.map((t) => (
              <span key={t} className="bg-white/10 text-white/90 text-sm px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>

        <p className="text-center text-zinc-400 text-sm mb-4">Share your result!</p>
        <div className="flex gap-3 justify-center flex-wrap mb-8">
          <button
            onClick={shareTwitter}
            className="bg-[#1a1a2e] border border-zinc-700 hover:border-[#1da1f2] text-[#1da1f2] px-5 py-3 rounded-xl flex items-center gap-2 transition-colors text-sm"
          >
            <span className="font-bold">𝕏</span> Tweet Result
          </button>
          <button
            onClick={copyLink}
            className="bg-[#1c1c1e] border border-zinc-700 hover:border-zinc-400 text-zinc-300 px-5 py-3 rounded-xl flex items-center gap-2 transition-colors text-sm"
          >
            <span>{copied ? "✅" : "🔗"}</span>
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>

        <div className="text-center space-y-4">
          <button
            onClick={restart}
            className="bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium px-8 py-3 rounded-full transition-colors"
          >
            Take Quiz Again
          </button>
          <div>
            <a href="/en/blog" className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors">
              Read our K-Beauty blog →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
