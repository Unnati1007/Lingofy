import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVocabulary extends Document {
  segmentId: mongoose.Types.ObjectId;
  word: string;
  translation: string;
  partOfSpeech: string;
  phonetic: string;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  createdAt: Date;
  updatedAt: Date;
}

const VocabularySchema: Schema<IVocabulary> = new Schema(
  {
    segmentId: {
      type: Schema.Types.ObjectId,
      ref: "LyricSegment",
      required: true
    },

    word: {
      type: String,
      required: true,
      trim: true
    },

    translation: {
      type: String,
      required: true
    },

    partOfSpeech: {
      type: String
    },

    phonetic: {
      type: String
    },

    difficultyLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    }
  },
  {
    timestamps: true
  }
);

const Vocabulary: Model<IVocabulary> =
  mongoose.model<IVocabulary>("Vocabulary", VocabularySchema);

export default Vocabulary;