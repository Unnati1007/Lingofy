import { generateSongLesson } from "./src/services/lessonService";
import dotenv from "dotenv";
dotenv.config();

const test = async () => {
  const lyrics = [
    { english: "Hello, how are you?", translation: "Hola, ¿cómo estás?" },
    { english: "I am fine, thank you.", translation: "Estoy bien, gracias." },
    { english: "What is your name?", translation: "¿Cómo te llamas?" },
    { english: "My name is John.", translation: "Me llamo John." },
    { english: "Where are you from?", translation: "¿De dónde eres?" },
    { english: "I am from Spain.", translation: "Soy de España." }
  ];
  
  try {
    console.log("Generating lesson...");
    const res = await generateSongLesson("spanish", "Test Song", "Test Artist", lyrics);
    console.log("Total questions:", res.questions?.length);
    console.log("Listen translate count:", res.questions?.filter((q: any) => q.type === 'listen_translate').length);
    console.log(JSON.stringify(res.questions?.filter((q: any) => q.type === 'listen_translate'), null, 2));
  } catch (err) {
    console.error(err);
  }
};

test();
