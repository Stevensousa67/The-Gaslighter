export interface DailyChallenge {
  id: string
  claim: string
  date: string
}

export const DAILY_CLAIMS = [
  "The Earth orbits the Sun.",
  "Vaccines are safe and effective.",
  "Gravity exists.",
  "The ocean is wet.",
  "Fire is hot.",
  "Dogs are mammals.",
  "Time moves forward.",
  "Light is faster than sound.",
  "Plants use photosynthesis.",
  "The moon causes tides.",
  "Water boils at 100°C at sea level.",
  "The Great Wall of China is visible from space.",
  "Humans only use 10% of their brains.",
  "Glass is a slow-moving liquid.",
  "Lightning never strikes the same place twice.",
  "Napoleon Bonaparte was very short.",
  "Goldfish have a 3-second memory.",
  "We have only five senses.",
  "The tongue has taste zones for different flavors.",
  "Shaving makes hair grow back thicker.",
  "You should wait 30 minutes after eating before swimming.",
  "We swallow 8 spiders a year in our sleep.",
  "Carrots improve your night vision.",
  "Reading in dim light damages your eyes.",
  "Cold weather causes colds.",
  "Blood in the body is blue before it hits oxygen.",
  "Hair and nails continue to grow after death.",
  "Humans and dinosaurs never coexisted.",
  "Ostriches bury their heads in the sand.",
  "Penguins only live in cold climates.",
  "Bats are completely blind.",
  "Eating chocolate causes acne.",
  "Mount Everest is the tallest mountain on Earth.",
  "The universe is approximately 13.8 billion years old.",
] as const

export function getDailyChallenge(): DailyChallenge {
  const now = new Date()
  const epochMs = now.getTime()
  const daysSinceEpoch = Math.floor(epochMs / (1000 * 60 * 60 * 24))
  const index = Math.floor(daysSinceEpoch % DAILY_CLAIMS.length)
  const claim = DAILY_CLAIMS[index]

  const dateStr = now.toISOString().split("T")[0] // YYYY-MM-DD

  return {
    id: `daily-${dateStr}`,
    claim,
    date: dateStr,
  }
}
