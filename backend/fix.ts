import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI as string).then(async () => {
  const Song = require('./src/models/music/Song').default;
  const LyricSegment = require('./src/models/music/LyricSegment').default;
  
  const song = await Song.findOne({title: /Tum/i});
  if(!song) {
    console.log('not found');
    process.exit(0);
  }
  
  await LyricSegment.updateMany({songId: song._id}, { $inc: { startTime: 65, endTime: 65 } });
  console.log('Shifted timestamps for Tum Hi Ho by 65 seconds');
  process.exit(0);
});
