export const geminiVoices = ["Puck", "Charon", "Kore", "Fenrir", "Aoede", "Zephyr", "Orion"];

export const superheroVoices = [
  "Superman", "Batman", "Wonder Woman", "Spider-Man", "Iron Man", 
  "Thor", "Hulk", "Black Widow", "Captain America", "Black Panther", 
  "Flash", "Aquaman", "Doctor Strange", "Scarlet Witch", "Vision", 
  "Wolverine", "Cyclops", "Jean Grey", "Storm", "Gambit"
];

export const getVoiceMapping = (superhero: string) => {
  const index = superheroVoices.indexOf(superhero);
  if (index === -1) return "Zephyr";
  return geminiVoices[index % geminiVoices.length];
};

export const languages = Array.from(new Set([
  "English", "Spanish", "French", "German", "Chinese", "Japanese", "Korean", "Russian", "Portuguese", "Italian",
  "Arabic", "Hindi", "Bengali", "Telugu", "Marathi", "Turkish", "Vietnamese", "Polish", "Ukrainian", "Dutch", "Flemish", "Filipino", "Ilocano", "Cebuano", "Waray", "Hiligaynon", "Kapampangan", "Pangasinan", "Bicolano", "Walloon", "Frisian", "Low German", "Sardinian", "Corsican", "Occitan", "Arpitan",
  "Thai", "Indonesian", "Malay", "Tagalog", "Persian", "Urdu", "Punjabi", "Gujarati", "Kannada",
  "Tamil", "Malayalam", "Odia", "Burmese", "Lao", "Khmer", "Mongolian", "Tibetan",
  "Hebrew", "Greek", "Swedish", "Norwegian", "Danish", "Finnish", "Icelandic", "Czech", "Slovak", "Hungarian",
  "Romanian", "Bulgarian", "Serbian", "Croatian", "Bosnian", "Albanian", "Macedonian", "Slovenian", "Estonian", "Latvian",
  "Lithuanian", "Belarusian", "Georgian", "Armenian", "Azerbaijani", "Kazakh", "Uzbek", "Turkmen", "Kyrgyz", "Tajik",
  "Afrikaans", "Swahili", "Amharic", "Somali", "Hausa", "Igbo", "Yoruba", "Zulu", "Xhosa", "Shona",
  "Malagasy", "Sesotho", "Tswana", "Kinyarwanda", "Luganda", "Wolof", "Bambara", "Fulfulde", "Twi", "Ewe",
  "Irish", "Welsh", "Scottish Gaelic", "Breton", "Basque", "Catalan", "Galician",
  "Maltese", "Luxembourgish", "Cornish", "Manx", "Esperanto", "Interlingua", "Volapük", "Ido",
  "Fijian", "Samoan", "Tongan", "Maori", "Hawaiian", "Tahitian", "Chamorro", "Palauan", "Yapese", "Marshallese",
  "Quechua", "Aymara", "Guarani", "Mapudungun", "Nahuatl", "Mayan", "Zapotec", "Mixtec", "Navajo", "Cherokee",
  "Ojibwe", "Cree", "Inuktitut", "Dakota", "Lakota", "Mohawk", "Choctaw", "Muscogee", "Apache", "Haida",
  "Tlingit", "Salish", "Nez Perce", "Hopi", "Zuni", "Pima", "Yaqui", "Papago", "Mohave", "Yuma",
  "Yavapai", "Walapai", "Havasupai", "Maricopa", "Cocopah", "Quechan", "Diegueño", "Luiseño", "Cahuilla", "Cupeno",
  "Serrano", "Gabrielino", "Juaneño", "Fernandeño", "Nicoleño", "Tataviam", "Kitanemuk", "Vanyume", "Chemehuevi", "Kawaiisu",
  "Panamint", "Shoshone", "Gosiute", "Bannock", "Comanche", "Ute", "Paiute", "Mono", "Tubatulabal",
  "Afar", "Abkhazan", "Avestan", "Avaric", "Bislama", "Chechen", "Chuvash", "Divehi", "Dzongkha",
  "Herero", "Hiri Motu", "Inupiaq", "Javanese", "Kalaallisut", "Kanuri", "Kashmiri",
  "Kikuyu", "Komi", "Kongo", "Kwanyama", "Limburgish", "Lingala", "Luba-Katanga", "Nauru", "Ndonga",
  "Northern Sami", "Nyanja", "Oromo", "Ossetian", "Pali", "Sango", "Sanskrit", "Sichuan Yi", "South Ndebele", "Sundanese",
  "Venda", "Yi", "Zhuang", "Akan", "Aragonese", "Bashkir",
  "Faroese", "Fula", "Ganda", "Interlingue"
])).sort();
