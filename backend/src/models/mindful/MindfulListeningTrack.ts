import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMindfulPhrase {
  text: string;
  translation: string;
  startTime: number;
  endTime: number;
}

export interface IMindfulListeningTrack extends Document {
  language: 'hindi' | 'spanish' | 'korean';
  title: string;
  theme: string;
  audioUrl: string;
  ambientType?: string;
  durationSeconds: number;
  phrases: IMindfulPhrase[];
  createdAt: Date;
  updatedAt: Date;
}

const PhraseSchema = new Schema<IMindfulPhrase>({
  text: { type: String, required: true },
  translation: { type: String, required: true },
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true }
});

const MindfulListeningTrackSchema = new Schema<IMindfulListeningTrack>({
  language: { 
    type: String, 
    enum: ['hindi', 'spanish', 'korean'], 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  theme: { 
    type: String, 
    required: true 
  },
  audioUrl: { 
    type: String, 
    required: true 
  },
  ambientType: { 
    type: String, 
    default: 'none' 
  },
  durationSeconds: { 
    type: Number, 
    required: true 
  },
  phrases: { 
    type: [PhraseSchema], 
    default: [] 
  }
}, { timestamps: true });

const MindfulListeningTrack: Model<IMindfulListeningTrack> = mongoose.model<IMindfulListeningTrack>('MindfulListeningTrack', MindfulListeningTrackSchema);

export default MindfulListeningTrack;
