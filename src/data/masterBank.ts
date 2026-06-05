export const masterBank = {
  knights_knaves: [
    { difficulty:"easy", statements:{A:"B is a knave.",B:"C is a knight.",C:"A and C are the same type."}, solution:{A:"Knight",B:"Knave",C:"Knave"} },
    { difficulty:"easy", statements:{A:"B is a knave.",B:"C is a knave.",C:"A and C are the same type."}, solution:{A:"Knight",B:"Knave",C:"Knight"} },
    { difficulty:"medium", statements:{A:"B is a knave.",B:"Exactly one of the three of us is a knight.",C:"A and C are the same type."}, solution:{A:"Knight",B:"Knave",C:"Knight"} },
    { difficulty:"medium", statements:{A:"B is a knave.",B:"C is a knave.",C:"All three of us are knaves."}, solution:{A:"Knave",B:"Knight",C:"Knave"} },
    { difficulty:"hard", statements:{A:"B and C are both knaves.",B:"A is a knight.",C:"At least one of A and B is a knave."}, solution:{A:"Knave",B:"Knave",C:"Knight"} }
  ],
  mini_einstein: {
    clues:["The cat's owner drinks Cola.","Tea is drunk in the Red house.","The bird lives in the Red house.","The fish lives in the Blue house.","Coffee is drunk in the Green house.","The Blue and Green houses are next to each other.","The Blue and Yellow houses are next to each other.","The Red house is somewhere left of the Green house.","The Yellow house is somewhere left of the Blue house."],
    solution:[{house:1,color:"Red",pet:"Bird",drink:"Tea"},{house:2,color:"Yellow",pet:"Cat",drink:"Cola"},{house:3,color:"Blue",pet:"Fish",drink:"Milk"},{house:4,color:"Green",pet:"Dog",drink:"Coffee"}]
  },
  whodunnit: [
    { clues:["The Candlestick was used in the Lounge.","The Dagger was used in the Study.","Professor Plum held the Dagger.","Colonel Mustard held the Rope.","Mr Green was in the Hall."], solution:{Green:{weapon:"Wrench",room:"Hall"},Scarlet:{weapon:"Candlestick",room:"Lounge"},Mustard:{weapon:"Rope",room:"Kitchen"},Plum:{weapon:"Dagger",room:"Study"}}, culprit_rule:"The murderer held the Dagger.", culprit:"Plum" },
    { clues:["The scarf was used in the Garden.","The letter-opener was used in the Library.","The poison was used in the Cellar.","Cara did not have the poison.","Ava was found with the scarf.","Dan was found with the statue."], solution:{Ava:{weapon:"Scarf",room:"Garden"},Ben:{weapon:"Poison",room:"Cellar"},Cara:{weapon:"Letter-opener",room:"Library"},Dan:{weapon:"Statue",room:"Attic"}}, culprit_rule:"The murderer used the Poison.", culprit:"Ben" }
  ],
  code_breaking: {
    easy:{solution:[3,9,2],rows:[{guess:[3,1,4],correct_placed:1,correct_unplaced:0,hint:"1 digit correct and correctly placed"},{guess:[5,9,8],correct_placed:1,correct_unplaced:0,hint:"1 digit correct and correctly placed"},{guess:[3,9,0],correct_placed:2,correct_unplaced:0,hint:"2 digits correct and correctly placed"},{guess:[1,2,7],correct_placed:0,correct_unplaced:1,hint:"1 digit correct but wrongly placed"}]},
    medium:{solution:[4,7,1],rows:[{guess:[2,8,1],correct_placed:1,correct_unplaced:0,hint:"1 digit correct and correctly placed"},{guess:[4,2,9],correct_placed:1,correct_unplaced:0,hint:"1 digit correct and correctly placed"},{guess:[1,5,7],correct_placed:0,correct_unplaced:2,hint:"2 digits correct but wrongly placed"}]},
    hard:{solution:[8,3,5,1],rows:[{guess:[1,2,3,4],correct_placed:0,correct_unplaced:2,hint:"2 digits correct but wrongly placed"},{guess:[8,5,6,7],correct_placed:1,correct_unplaced:1,hint:"1 digit correct and correctly placed; 1 digit correct but wrongly placed"},{guess:[9,3,1,0],correct_placed:1,correct_unplaced:1,hint:"1 digit correct and correctly placed; 1 digit correct but wrongly placed"},{guess:[4,8,5,2],correct_placed:1,correct_unplaced:1,hint:"1 digit correct and correctly placed; 1 digit correct but wrongly placed"}]}
  },
  anagram_race: [
    {difficulty:"easy",scramble:"LATENP",answer:"PLANET"},{difficulty:"easy",scramble:"DENRGA",answer:"GARDEN"},{difficulty:"easy",scramble:"SIVERL",answer:"SILVER"},{difficulty:"easy",scramble:"ACSTEL",answer:"CASTLE"},{difficulty:"easy",scramble:"LNIPDHO",answer:"DOLPHIN"},
    {difficulty:"medium",scramble:"NORYJUE",answer:"JOURNEY"},{difficulty:"medium",scramble:"TAAICPN",answer:"CAPTAIN"},{difficulty:"medium",scramble:"DIAMDON",answer:"DIAMOND"},{difficulty:"medium",scramble:"HORYNMA",answer:"HARMONY"},{difficulty:"medium",scramble:"AGNEIRTL",answer:"TRIANGLE"},
    {difficulty:"hard",scramble:"YSTEYMR",answer:"MYSTERY"},{difficulty:"hard",scramble:"ITLNBYRAH",answer:"LABYRINTH"},{difficulty:"hard",scramble:"HIATMGRLO",answer:"ALGORITHM"},{difficulty:"hard",scramble:"EAERTYHCR",answer:"TREACHERY"},{difficulty:"hard",scramble:"WRHEPSI",answer:"WHISPER"}
  ],
  timeline: [
    {theme:"World history",items_shuffled:["Great Pyramid of Giza completed","Founding of Rome (traditional)","Fall of the Western Roman Empire","Gutenberg prints his Bible","American Declaration of Independence","First Moon landing"],correct_order:["Great Pyramid of Giza completed","Founding of Rome (traditional)","Fall of the Western Roman Empire","Gutenberg prints his Bible","American Declaration of Independence","First Moon landing"],years:{"Great Pyramid of Giza completed":-2560,"Founding of Rome (traditional)":-753,"Fall of the Western Roman Empire":476,"Gutenberg prints his Bible":1455,"American Declaration of Independence":1776,"First Moon landing":1969}},
    {theme:"Science & invention",items_shuffled:["Newton publishes Principia","Darwin publishes On the Origin of Species","Edison demonstrates a practical light bulb","Wright brothers' first powered flight","Discovery of the structure of DNA","Launch of the World Wide Web to the public"],correct_order:["Newton publishes Principia","Darwin publishes On the Origin of Species","Edison demonstrates a practical light bulb","Wright brothers' first powered flight","Discovery of the structure of DNA","Launch of the World Wide Web to the public"],years:{"Newton publishes Principia":1687,"Darwin publishes On the Origin of Species":1859,"Edison demonstrates a practical light bulb":1879,"Wright brothers' first powered flight":1903,"Discovery of the structure of DNA":1953,"Launch of the World Wide Web to the public":1991}},
    {theme:"Inventions in tech",items_shuffled:["First transistor built at Bell Labs","First commercial microprocessor (Intel 4004)","Apple II released","First text message sent","First iPhone released","ChatGPT publicly launched"],correct_order:["First transistor built at Bell Labs","First commercial microprocessor (Intel 4004)","Apple II released","First text message sent","First iPhone released","ChatGPT publicly launched"],years:{"First transistor built at Bell Labs":1947,"First commercial microprocessor (Intel 4004)":1971,"Apple II released":1977,"First text message sent":1992,"First iPhone released":2007,"ChatGPT publicly launched":2022}}
  ],
  estimation: [
    {q:"How tall is the Eiffel Tower, to its tip? (metres)",answer:330,unit:"m",tol_pct:15},
    {q:"How many bones are in the adult human body?",answer:206,unit:"bones",tol_pct:10},
    {q:"How long is the Great Wall of China, all branches combined? (km)",answer:21196,unit:"km",tol_pct:20},
    {q:"What is the boiling point of water at sea level? (°C)",answer:100,unit:"°C",tol_pct:5},
    {q:"How many keys are on a standard piano?",answer:88,unit:"keys",tol_pct:10},
    {q:"How tall is Mount Everest above sea level? (metres)",answer:8849,unit:"m",tol_pct:10},
    {q:"How many hearts does an octopus have?",answer:3,unit:"hearts",tol_pct:0},
    {q:"At what speed does light travel? (km per second)",answer:299792,unit:"km/s",tol_pct:10},
    {q:"How many time zones does Russia span?",answer:11,unit:"zones",tol_pct:0},
    {q:"How many moons does Jupiter have (confirmed, approx.)?",answer:95,unit:"moons",tol_pct:25}
  ],
  higher_lower: {
    metric:"approximate mass (kg)",
    chain:[{item:"A housecat",display:"≈ 4 kg",value:4},{item:"A bald eagle",display:"≈ 5 kg",value:5},{item:"A bowling ball (max)",display:"≈ 7 kg",value:7},{item:"A car tyre",display:"≈ 9 kg",value:9},{item:"A male bulldog",display:"≈ 23 kg",value:23},{item:"A giant panda (adult)",display:"≈ 100 kg",value:100},{item:"A grand piano",display:"≈ 480 kg",value:480},{item:"A dairy cow",display:"≈ 700 kg",value:700},{item:"A small car",display:"≈ 1200 kg",value:1200},{item:"An African elephant",display:"≈ 6000 kg",value:6000}]
  },
  balderdash: {
    words:[{word:"PETRICHOR",definition:"the pleasant earthy smell after rain falls on dry soil"},{word:"DEFENESTRATION",definition:"the act of throwing someone or something out of a window"},{word:"BORBORYGMUS",definition:"the rumbling noise made by gas moving through the intestines"},{word:"GRAWLIX",definition:"the string of typographic symbols (@#$%!) used to represent swearing in comics"},{word:"SNOLLYGOSTER",definition:"a shrewd, unprincipled person, especially a politician"},{word:"MONDEGREEN",definition:"a misheard word or phrase, especially a misheard song lyric"},{word:"AGLET",definition:"the small plastic or metal sheath on the end of a shoelace"},{word:"COLLYWOBBLES",definition:"a feeling of nervousness or an upset stomach"}]
  }
};
