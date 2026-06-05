export interface EmojiPrompt {
  phrase: string;
  hint: string;
  emojiSuggestion: string;
}

export const emojiPrompts: EmojiPrompt[] = [
  { phrase: "A stormy night at sea", hint: "Weather + water + darkness", emojiSuggestion: "⛈️🌊🌙🚢😱" },
  { phrase: "Going on a first date", hint: "Nervousness + romance + meeting", emojiSuggestion: "😅❤️🌹🍽️💫" },
  { phrase: "The dog ate my homework", hint: "Dog + food + school + panic", emojiSuggestion: "🐕📚😋😱🏫" },
  { phrase: "Winning the lottery", hint: "Money + shock + celebration", emojiSuggestion: "🎰💰😲🎉🏆" },
  { phrase: "Being stuck in a traffic jam", hint: "Cars + frustration + time", emojiSuggestion: "🚗😤⏰🛑🤦" },
  { phrase: "Falling in love", hint: "Hearts + butterflies + happiness", emojiSuggestion: "💕😍🦋✨💑" },
  { phrase: "A surprise birthday party", hint: "Surprise + birthday + friends", emojiSuggestion: "😮🎂🎈👥🎁" },
  { phrase: "Getting lost in a forest", hint: "Trees + confusion + adventure", emojiSuggestion: "🌲😕🗺️🔦🐺" },
  { phrase: "The cat knocked over the vase", hint: "Cat + fragile + mess", emojiSuggestion: "🐈🏺💥😱🧹" },
  { phrase: "Learning to ride a bike", hint: "Bike + effort + falling + success", emojiSuggestion: "🚲😤🤕💪🎉" },
  { phrase: "Cooking a holiday feast", hint: "Food + kitchen + family + effort", emojiSuggestion: "🍗🧑‍🍳👨‍👩‍👧‍👦🥘✨" },
  { phrase: "Watching a scary movie alone", hint: "Fear + movie + dark + alone", emojiSuggestion: "🎬😨🌑👁️🙈" },
  { phrase: "Building a sandcastle", hint: "Beach + construction + creativity", emojiSuggestion: "🏖️🏰🪣🌊😊" },
  { phrase: "Missing the last train home", hint: "Train + late + panic + night", emojiSuggestion: "🚆😱🌙⏰😭" },
  { phrase: "Finding a secret room", hint: "Discovery + hidden + mystery", emojiSuggestion: "🚪✨🔍🗝️😮" },
];
