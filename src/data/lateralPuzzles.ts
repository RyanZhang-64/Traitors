export interface LateralPuzzle {
  scenario: string;
  solution: string;
  yesAnswers: string[];
  noAnswers: string[];
}

export const lateralPuzzles: LateralPuzzle[] = [
  {
    scenario: "A man walks into a restaurant and orders albatross soup. After one sip, he goes home and kills himself. Why?",
    solution: "The man was a sailor who had been stranded on a deserted island with his wife. Another shipwrecked man told him they were eating albatross soup to survive, but they were actually eating his wife's flesh. When he tastes real albatross soup at the restaurant, he realizes what he had really eaten, and is consumed by guilt.",
    yesAnswers: ["Was he a sailor?", "Did his wife die?", "Was he on an island?", "Did he eat something disturbing before?"],
    noAnswers: ["Was he allergic?", "Was he poisoned?", "Did the waiter do something?", "Was the soup bad?"]
  },
  {
    scenario: "A woman shoots her husband, then has dinner with him. How?",
    solution: "She is a photographer. She shot his photograph, then they had dinner.",
    yesAnswers: ["Was this peaceful?", "Was she a photographer?", "Did they eat together?"],
    noAnswers: ["Did she use a gun?", "Was he injured?", "Was there a crime committed?"]
  },
  {
    scenario: "A man lives on the 10th floor of a building. Every morning he takes the elevator down to the ground floor and goes to work. When he returns, he takes the elevator to the 6th floor and walks up the stairs. Why?",
    solution: "The man is too short to reach the button for the 10th floor. He can only reach the 6th floor button. However, when it's raining he uses an umbrella to push the 10th floor button.",
    yesAnswers: ["Is his height relevant?", "Does he sometimes take the elevator all the way up?", "Does weather affect his behavior?"],
    noAnswers: ["Does he enjoy exercise?", "Is there something wrong with the elevator?", "Does he have a friend on floor 6?"]
  },
  {
    scenario: "A man is found dead in a field. Next to him is an unopened package. What happened?",
    solution: "The man was a parachutist whose parachute failed to open. The unopened package is his parachute.",
    yesAnswers: ["Did he fall from a height?", "Was he in the air?", "Did the package have something safety-related?"],
    noAnswers: ["Was he murdered?", "Was it a medical emergency?", "Was someone else involved?"]
  },
  {
    scenario: "A woman enters a room and flicks a light switch. The lights don't turn on, but she smiles. Why?",
    solution: "She is blind and has just learned that the power is out in the building - which means others are now experiencing what she experiences every day. She smiles because she feels understood for once.",
    yesAnswers: ["Is her disability relevant?", "Is she blind?", "Does the darkness affect others in the building?"],
    noAnswers: ["Is she happy about an inconvenience to others?", "Is the power out everywhere?", "Did she cause the outage?"]
  },
];
