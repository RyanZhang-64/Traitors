export interface AlibiScenario {
  crime: string;
  time: string;
  location: string;
  questions: string[];
}

export const alibiScenarios: AlibiScenario[] = [
  {
    crime: "The Stolen Necklace",
    time: "8:00 PM last Saturday",
    location: "The Grand Hotel ballroom",
    questions: [
      "What were you wearing that evening?",
      "Who else was with you?",
      "What did you eat or drink?",
      "What did the room look like?",
      "Did anything unusual happen?",
      "When did you arrive and leave?",
      "Did you see anyone acting suspiciously?",
      "What music was playing?",
      "Did you take any photos?",
      "Who can confirm your whereabouts?",
    ]
  },
  {
    crime: "The Missing Painting",
    time: "2:00 PM last Tuesday",
    location: "The city art gallery",
    questions: [
      "What brought you to the gallery that day?",
      "Which exhibits did you visit?",
      "How long did you stay?",
      "Did you speak to any gallery staff?",
      "Was it crowded or quiet?",
      "What did you do after leaving?",
      "Did you go anywhere else in the gallery?",
      "Did you notice anything out of the ordinary?",
      "Were you with anyone?",
      "Do you have your entry ticket?",
    ]
  },
  {
    crime: "The Deleted Files",
    time: "11:30 PM last Friday",
    location: "The office building, third floor",
    questions: [
      "Why were you in the office so late?",
      "Which computer did you use?",
      "Who else was in the building?",
      "Did you encounter any security personnel?",
      "What files were you working on?",
      "Did anything go wrong with your computer?",
      "Did you leave your desk at any point?",
      "What time did you arrive and leave?",
      "Did you meet anyone in the elevator or hallway?",
      "Can the building's security cameras confirm your story?",
    ]
  },
];
