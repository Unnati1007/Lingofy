import mongoose, { Schema, Document } from "mongoose";

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'vocabulary' | 'note';
  word?: string;
  meaning?: string;
  language: string;
  contextSentence?: string;
  source: 'quiz' | 'lesson' | 'song' | 'manual';
  title?: string;
  content?: string;
  tags: string[];
  mastered: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema<INote> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["vocabulary", "note"],
      default: "vocabulary"
    },
    word: {
      type: String,
      trim: true
    },
    meaning: {
      type: String,
      trim: true
    },
    language: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: "spanish"
    },
    contextSentence: {
      type: String,
      trim: true
    },
    source: {
      type: String,
      enum: ["quiz", "lesson", "song", "manual"],
      default: "manual"
    },
    title: {
      type: String,
      trim: true
    },
    content: {
      type: String,
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    mastered: {
      type: Boolean,
      default: false
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "hard"
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<INote>("Note", NoteSchema);
