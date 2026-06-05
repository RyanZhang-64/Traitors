import { GameModule } from '../services/Scheduler';

export { GameModule };

export const gameRegistry: GameModule[] = [
  // 6A Deduction
  { id: 'knights_knaves', title: 'Knights & Knaves', type: 'deduction', tagline: 'Logic puzzles — who speaks truth?', estMinutes: 8, minPlayers: 4, maxPlayers: 10, energy: 'low' },
  { id: 'mini_einstein', title: 'Mini-Einstein', type: 'deduction', tagline: 'Solve the 4-house grid puzzle', estMinutes: 10, minPlayers: 4, maxPlayers: 10, energy: 'low' },
  { id: 'whodunnit', title: 'Whodunnit', type: 'deduction', tagline: 'Crack the mystery grid', estMinutes: 10, minPlayers: 4, maxPlayers: 10, energy: 'low' },
  { id: 'code_breaker', title: 'Code Breaker', type: 'deduction', tagline: 'Deduce the secret code from clues', estMinutes: 7, minPlayers: 4, maxPlayers: 10, energy: 'medium' },

  // 6B Trivia
  { id: 'lateral_mystery', title: 'Lateral Mystery', type: 'trivia', tagline: 'Solve a mystery by yes/no questions', estMinutes: 8, minPlayers: 4, maxPlayers: 10, energy: 'medium' },
  { id: 'sabotage_trivia', title: 'Sabotage Trivia', type: 'trivia', tagline: '8 questions — beware the poison answers!', estMinutes: 8, minPlayers: 4, maxPlayers: 10, energy: 'high' },
  { id: 'category_roulette', title: 'Category Roulette', type: 'trivia', tagline: 'Spin the wheel, buzz in, score!', estMinutes: 8, minPlayers: 4, maxPlayers: 10, energy: 'high' },
  { id: 'timeline', title: 'Timeline', type: 'trivia', tagline: 'Arrange events in chronological order', estMinutes: 7, minPlayers: 4, maxPlayers: 10, energy: 'medium' },
  { id: 'zoomed_in', title: 'Zoomed-In', type: 'trivia', tagline: 'Identify images from extreme close-ups', estMinutes: 7, minPlayers: 4, maxPlayers: 10, energy: 'medium', requiresMedia: true },
  { id: 'name_that_tune', title: 'Name That Tune', type: 'trivia', tagline: 'Identify songs from short clips', estMinutes: 7, minPlayers: 4, maxPlayers: 10, energy: 'high', requiresMedia: true },

  // 6C Word
  { id: 'anagram_race', title: 'Anagram Race', type: 'word', tagline: 'Unscramble words faster than anyone!', estMinutes: 7, minPlayers: 4, maxPlayers: 10, energy: 'high' },
  { id: 'balderdash', title: 'Balderdash', type: 'word', tagline: 'Bluff your way with fake definitions', estMinutes: 10, minPlayers: 5, maxPlayers: 10, energy: 'medium' },
  { id: 'codenames_lite', title: 'Codenames-Lite', type: 'word', tagline: '5×5 word grid — clues, teams, guesses', estMinutes: 12, minPlayers: 6, maxPlayers: 10, energy: 'high' },
  { id: 'taboo', title: 'Taboo', type: 'word', tagline: "Describe it — without the forbidden words!", estMinutes: 10, minPlayers: 4, maxPlayers: 10, energy: 'high' },
  { id: 'word_chain', title: 'Word Chain', type: 'word', tagline: 'Last letter starts the next word', estMinutes: 6, minPlayers: 4, maxPlayers: 10, energy: 'medium' },

  // 6D Estimation
  { id: 'estimation_challenge', title: 'Estimation Challenge', type: 'estimation', tagline: 'Guess closest to the real number', estMinutes: 8, minPlayers: 4, maxPlayers: 10, energy: 'low' },
  { id: 'higher_lower', title: 'Higher or Lower', type: 'estimation', tagline: 'Beat the chain — higher or lower?', estMinutes: 7, minPlayers: 4, maxPlayers: 10, energy: 'medium' },
  { id: 'price_is_right', title: 'The Price Is Right', type: 'estimation', tagline: "Closest without going over wins", estMinutes: 8, minPlayers: 4, maxPlayers: 10, energy: 'medium' },

  // 6E Creative
  { id: 'gartic_phone', title: 'Gartic Phone', type: 'creative', tagline: 'Draw → describe → laugh at results', estMinutes: 15, minPlayers: 4, maxPlayers: 10, energy: 'high', requiresDevices: true },
  { id: 'quick_draw', title: 'Quick Draw', type: 'creative', tagline: 'One drawer, everyone guesses!', estMinutes: 10, minPlayers: 4, maxPlayers: 10, energy: 'high' },

  // 6F Memory
  { id: 'emoji_story', title: 'Emoji Story', type: 'memory', tagline: 'Build a story in emoji; can they decode?', estMinutes: 8, minPlayers: 4, maxPlayers: 10, energy: 'medium' },
  { id: 'spot_the_change', title: 'Spot the Change', type: 'memory', tagline: 'Find the differences between scenes', estMinutes: 7, minPlayers: 4, maxPlayers: 10, energy: 'medium' },
  { id: 'echo', title: 'Echo', type: 'memory', tagline: 'Simon-style sequence — grow or go!', estMinutes: 8, minPlayers: 4, maxPlayers: 10, energy: 'high' },
  { id: 'eyewitness', title: 'Eyewitness', type: 'memory', tagline: 'Study the scene — answer from memory', estMinutes: 8, minPlayers: 4, maxPlayers: 10, energy: 'low' },

  // 6G Reflex
  { id: 'reaction_duel', title: 'Reaction Duel', type: 'reflex', tagline: 'First to tap when it turns green!', estMinutes: 6, minPlayers: 4, maxPlayers: 10, energy: 'high' },
  { id: 'type_racer', title: 'Type Racer', type: 'reflex', tagline: 'Fastest accurate typist takes the crown', estMinutes: 6, minPlayers: 4, maxPlayers: 10, energy: 'high' },
  { id: 'simon_says', title: 'Simon Says', type: 'reflex', tagline: "Only follow Simon's commands!", estMinutes: 6, minPlayers: 4, maxPlayers: 10, energy: 'high' },

  // 6H Social
  { id: 'two_truths_lie', title: 'Two Truths & a Lie', type: 'social', tagline: 'Which one is the deception?', estMinutes: 10, minPlayers: 4, maxPlayers: 10, energy: 'medium' },
  { id: 'hot_takes', title: 'Hot Takes', type: 'social', tagline: '"Most likely to…" — vote for a player', estMinutes: 8, minPlayers: 5, maxPlayers: 10, energy: 'medium' },
  { id: 'alibi_builder', title: 'Alibi Builder', type: 'social', tagline: 'Build your alibi — survive cross-examination', estMinutes: 12, minPlayers: 4, maxPlayers: 8, energy: 'high' },
];
