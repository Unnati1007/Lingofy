import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  id: number;
  type: 'multiple_choice' | 'fill_blank' | 'translate_word' | 'match_meaning';
  questionText: string;
  targetWord: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface IUserAnswer {
  questionId: number;
  answer: string;
  isCorrect: boolean;
  timeSpentSeconds?: number;
}

export interface ILessonAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  language: 'hindi' | 'spanish';
  level: 'easy' | 'intermediate' | 'hard' | 'beginner' | 'dynamic';
  questions: IQuestion[];
  userAnswers: IUserAnswer[];
  score: number;
  xpEarned: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  cognitiveLoad?: number;
  reflectionText?: string;
  startedAt: Date;
  completedAt?: Date;
  totalTimeSpentSeconds?: number;
  avgTimePerTextQuestionSeconds?: number;
}

const QuestionSchema: Schema = new Schema({
  id: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['multiple_choice', 'fill_blank', 'translate_word', 'match_meaning', 'listen_translate'],
    required: true 
  },
  questionText: { type: String, required: true },
  targetWord: { type: String, default: '' },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
  explanation: { type: String, required: true }
});

const UserAnswerSchema: Schema = new Schema({
  questionId: { type: Number, required: true },
  answer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  timeSpentSeconds: { type: Number, default: 0 }
});

const LessonAttemptSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  language: { type: String, enum: ['hindi', 'spanish'], required: true },
  level: { type: String, enum: ['easy', 'beginner', 'intermediate', 'hard', 'dynamic'], required: true },
  questions: { type: [QuestionSchema], required: true },
  userAnswers: { type: [UserAnswerSchema], default: [] },
  score: { type: Number, default: 0 },
  xpEarned: { type: Number, default: 0 },
  status: { type: String, enum: ['in_progress', 'completed', 'abandoned'], default: 'in_progress' },
  cognitiveLoad: { type: Number, min: 1, max: 5 },
  reflectionText: { type: String },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  totalTimeSpentSeconds: { type: Number, default: 0 },
  avgTimePerTextQuestionSeconds: { type: Number, default: 0 }
});

export default mongoose.model<ILessonAttempt>('LessonAttempt', LessonAttemptSchema);
