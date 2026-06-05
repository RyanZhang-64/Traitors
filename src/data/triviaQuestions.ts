export interface TriviaQuestion {
  question: string;
  options: string[];
  correct: number;
  category: string;
}

export const triviaQuestions: TriviaQuestion[] = [
  { question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], correct: 2, category: "Geography" },
  { question: "How many strings does a standard violin have?", options: ["3", "4", "5", "6"], correct: 1, category: "Music" },
  { question: "Which element has the chemical symbol Au?", options: ["Silver", "Copper", "Gold", "Aluminum"], correct: 2, category: "Science" },
  { question: "In what year did World War II end?", options: ["1943", "1944", "1945", "1946"], correct: 2, category: "History" },
  { question: "What is the largest planet in our solar system?", options: ["Saturn", "Neptune", "Uranus", "Jupiter"], correct: 3, category: "Science" },
  { question: "Who painted the Mona Lisa?", options: ["Michelangelo", "Raphael", "Leonardo da Vinci", "Donatello"], correct: 2, category: "Art" },
  { question: "What language is spoken in Brazil?", options: ["Spanish", "Portuguese", "French", "English"], correct: 1, category: "Geography" },
  { question: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], correct: 1, category: "Math" },
  { question: "Which ocean is the largest?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3, category: "Geography" },
  { question: "What is the square root of 144?", options: ["11", "12", "13", "14"], correct: 1, category: "Math" },
  { question: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], correct: 1, category: "Literature" },
  { question: "What is the chemical formula for water?", options: ["CO2", "H2O", "NaCl", "O2"], correct: 1, category: "Science" },
  { question: "Which country is known as the Land of the Rising Sun?", options: ["China", "South Korea", "Japan", "Thailand"], correct: 2, category: "Geography" },
  { question: "How many bones are in the adult human body?", options: ["186", "196", "206", "216"], correct: 2, category: "Science" },
  { question: "What is the currency of Japan?", options: ["Won", "Yuan", "Yen", "Ringgit"], correct: 2, category: "Geography" },
  { question: "Which planet is closest to the sun?", options: ["Venus", "Earth", "Mars", "Mercury"], correct: 3, category: "Science" },
  { question: "Who is known as the father of modern physics?", options: ["Newton", "Einstein", "Bohr", "Hawking"], correct: 1, category: "Science" },
  { question: "What is the tallest mountain in the world?", options: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"], correct: 2, category: "Geography" },
  { question: "How many players are on a basketball team?", options: ["4", "5", "6", "7"], correct: 1, category: "Sports" },
  { question: "What year was the Eiffel Tower built?", options: ["1879", "1889", "1899", "1909"], correct: 1, category: "History" },
  { question: "Which gas do plants absorb from the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"], correct: 2, category: "Science" },
  { question: "What is the fastest land animal?", options: ["Lion", "Leopard", "Cheetah", "Gazelle"], correct: 2, category: "Nature" },
  { question: "How many continents are there on Earth?", options: ["5", "6", "7", "8"], correct: 2, category: "Geography" },
  { question: "Who invented the telephone?", options: ["Edison", "Tesla", "Bell", "Marconi"], correct: 2, category: "History" },
  { question: "What is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correct: 1, category: "Geography" },
  { question: "In which city is the Colosseum located?", options: ["Athens", "Rome", "Paris", "Madrid"], correct: 1, category: "Geography" },
  { question: "What is the hardest natural substance on Earth?", options: ["Platinum", "Quartz", "Diamond", "Corundum"], correct: 2, category: "Science" },
  { question: "How many keys are on a standard piano?", options: ["76", "80", "84", "88"], correct: 3, category: "Music" },
  { question: "Which Shakespeare play features the character Hamlet?", options: ["Macbeth", "Hamlet", "Othello", "King Lear"], correct: 1, category: "Literature" },
  { question: "What is the capital of Canada?", options: ["Toronto", "Vancouver", "Montreal", "Ottawa"], correct: 3, category: "Geography" },
];

export const categoryRouletteCategories = [
  { name: "Animals", questions: ["Name 3 types of big cats", "What do you call a group of lions?", "Which is the only mammal that can fly?", "What is the largest land animal?"] },
  { name: "Food & Drink", questions: ["Name the main ingredient in guacamole", "Which country invented pizza?", "What is the most consumed beverage in the world after water?", "What cheese is used in a traditional Greek salad?"] },
  { name: "Pop Culture", questions: ["Name the lead singer of The Beatles", "What superhero lives in Gotham City?", "Which TV show features dragons in Westeros?", "What is the highest-grossing film of all time?"] },
  { name: "Science", questions: ["How far is Earth from the Sun in km?", "What does DNA stand for?", "Which planet has the most moons?", "What is the speed of light in km/s?"] },
  { name: "History", questions: ["In which year did WW1 begin?", "Who was the first president of the US?", "Which empire was ruled by Julius Caesar?", "When did the Berlin Wall fall?"] },
  { name: "Sports", questions: ["How many players are in a soccer team?", "What sport is played at Wimbledon?", "Which country hosts the Tour de France?", "How many points is a touchdown worth in American football?"] },
];
