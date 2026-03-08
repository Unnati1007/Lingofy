import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICognitiveLoad extends Document {
  sessionId: mongoose.Types.ObjectId;
  effortScore: number;
  difficultyRating: number;
  distractionRating: number;
  createdAt: Date;
  updatedAt: Date;
}

const CognitiveLoadSchema: Schema<ICognitiveLoad> = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "LearningSession",
      required: true
    },

    effortScore: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    },

    difficultyRating: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    },

    distractionRating: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const CognitiveLoad: Model<ICognitiveLoad> =
  mongoose.model<ICognitiveLoad>("CognitiveLoad", CognitiveLoadSchema);

export default CognitiveLoad;