export interface AchievementDef {
  key: string
  name: string
  description: string
  emoji: string // use a descriptive text emoji shortname — these are displayed in UI only via text spans
  condition: string // human-readable: when is this unlocked
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    key: "first_blood",
    name: "First Blood",
    description: "Was wrong for the first time.",
    emoji: "🩸",
    condition: "First AI response received",
  },
  {
    key: "triple_threat",
    name: "Triple Threat",
    description: "Wrong 3 times in a single conversation.",
    emoji: "3️⃣",
    condition: "3 AI responses in one session",
  },
  {
    key: "optimist",
    name: "The Optimist",
    description: "Tried to argue the same point twice.",
    emoji: "🌈",
    condition: "Same persona disagreed with you twice",
  },
  {
    key: "wrong_ten",
    name: "Professionally Wrong",
    description: "Reached 10 wrong answers in one conversation.",
    emoji: "📋",
    condition: "10 AI responses in one session",
  },
  {
    key: "wrong_fifty_total",
    name: "True Believer",
    description: "Accumulated 50 total wrong answers.",
    emoji: "🏆",
    condition: "50 lifetime wrong answers",
  },
  {
    key: "all_personas",
    name: "Collector of Shame",
    description: "Chatted with all 7 personas.",
    emoji: "🎭",
    condition: "Used every persona at least once",
  },
  {
    key: "hall_of_shamer",
    name: "Hall of Shamer",
    description: "Had a response submitted to the Hall of Shame.",
    emoji: "🔥",
    condition: "Clicked Share Burn on an AI response",
  },
  {
    key: "certificate_earned",
    name: "Certified Wrong",
    description: "Earned a Certificate of Being Wrong.",
    emoji: "📜",
    condition: "Reached 80% confidence meter",
  },
  {
    key: "unhinged_survivor",
    name: "Unhinged Survivor",
    description: "Survived 5 messages with The Unhinged.",
    emoji: "😤",
    condition: "5 exchanges with the Unhinged persona",
  },
  {
    key: "therapized",
    name: "In Denial",
    description: "The Therapist diagnosed you with 3 cognitive distortions.",
    emoji: "🛋️",
    condition: "3 exchanges with the Therapist persona",
  },
]

export function getAchievement(key: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.key === key)
}
