import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import MindfulListeningTrack from '../models/mindful/MindfulListeningTrack';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lingofy';

const seedTracks = [
  // HINDI
  {
    language: 'hindi',
    title: 'Morning Calm',
    theme: 'Morning',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Gentle ambient placeholder
    ambientType: 'birds',
    durationSeconds: 30,
    phrases: [
      { text: 'सुप्रभात, आज का दिन सुंदर है।', translation: 'Good morning, today is a beautiful day.', startTime: 2, endTime: 6 },
      { text: 'एक गहरी सांस लें।', translation: 'Take a deep breath.', startTime: 8, endTime: 11 },
      { text: 'अपने विचारों को शांत होने दें।', translation: 'Let your thoughts become calm.', startTime: 14, endTime: 18 },
      { text: 'आज आप सकारात्मक ऊर्जा महसूस करेंगे।', translation: 'Today you will feel positive energy.', startTime: 21, endTime: 26 }
    ]
  },
  {
    language: 'hindi',
    title: 'Evening Gratitude',
    theme: 'Evening',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Rain/waves placeholder
    ambientType: 'rain',
    durationSeconds: 30,
    phrases: [
      { text: 'आज के दिन के लिए धन्यवाद।', translation: 'Thank you for today.', startTime: 3, endTime: 7 },
      { text: 'मैंने आज बहुत कुछ सीखा।', translation: 'I learned a lot today.', startTime: 10, endTime: 14 },
      { text: 'अब आराम करने का समय है।', translation: 'Now it is time to rest.', startTime: 17, endTime: 21 },
      { text: 'शुभ रात्रि।', translation: 'Good night.', startTime: 24, endTime: 27 }
    ]
  },
  // SPANISH
  {
    language: 'spanish',
    title: 'Morning Calm',
    theme: 'Morning',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    ambientType: 'birds',
    durationSeconds: 30,
    phrases: [
      { text: 'Buenos días, hoy es un hermoso día.', translation: 'Good morning, today is a beautiful day.', startTime: 2, endTime: 6 },
      { text: 'Respira profundamente.', translation: 'Take a deep breath.', startTime: 8, endTime: 11 },
      { text: 'Deja que tus pensamientos se calmen.', translation: 'Let your thoughts become calm.', startTime: 14, endTime: 18 },
      { text: 'Hoy sentirás energía positiva.', translation: 'Today you will feel positive energy.', startTime: 21, endTime: 26 }
    ]
  },
  {
    language: 'spanish',
    title: 'Evening Gratitude',
    theme: 'Evening',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    ambientType: 'rain',
    durationSeconds: 30,
    phrases: [
      { text: 'Gracias por el día de hoy.', translation: 'Thank you for today.', startTime: 3, endTime: 7 },
      { text: 'He aprendido mucho hoy.', translation: 'I have learned a lot today.', startTime: 10, endTime: 14 },
      { text: 'Ahora es tiempo de descansar.', translation: 'Now it is time to rest.', startTime: 17, endTime: 21 },
      { text: 'Buenas noches.', translation: 'Good night.', startTime: 24, endTime: 27 }
    ]
  },
  // KOREAN
  {
    language: 'korean',
    title: 'Morning Calm',
    theme: 'Morning',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    ambientType: 'birds',
    durationSeconds: 30,
    phrases: [
      { text: '좋은 아침입니다. 오늘은 아름다운 날입니다.', translation: 'Good morning. Today is a beautiful day.', startTime: 2, endTime: 6 },
      { text: '심호흡을 하세요.', translation: 'Take a deep breath.', startTime: 8, endTime: 11 },
      { text: '생각을 차분하게 정리하세요.', translation: 'Calm your thoughts.', startTime: 14, endTime: 18 },
      { text: '오늘 당신은 긍정적인 에너지를 느낄 것입니다.', translation: 'Today you will feel positive energy.', startTime: 21, endTime: 26 }
    ]
  },
  {
    language: 'korean',
    title: 'Evening Gratitude',
    theme: 'Evening',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    ambientType: 'rain',
    durationSeconds: 30,
    phrases: [
      { text: '오늘 하루에 감사합니다.', translation: 'Thank you for today.', startTime: 3, endTime: 7 },
      { text: '오늘 많은 것을 배웠습니다.', translation: 'I learned a lot today.', startTime: 10, endTime: 14 },
      { text: '이제 쉴 시간입니다.', translation: 'Now it is time to rest.', startTime: 17, endTime: 21 },
      { text: '안녕히 주무세요.', translation: 'Good night.', startTime: 24, endTime: 27 }
    ]
  }
];

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing mindful tracks before seeding
    await MindfulListeningTrack.deleteMany({});
    
    await MindfulListeningTrack.insertMany(seedTracks);
    console.log('Successfully seeded Mindful Listening Tracks!');

  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

seed();
