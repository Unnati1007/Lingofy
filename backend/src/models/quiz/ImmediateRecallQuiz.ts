import mongoose, { Schema, Document, Model } from "mongoose";

export interface IImmediateRecallQuiz extends Document {
  sessionId: mongoose.Types.ObjectId;
  segmentId: mongoose.Types.ObjectId;
  questionType: "fill_blank" | "translation" | "reorder";
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  responseTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const ImmediateRecallQuizSchema: Schema<IImmediateRecallQuiz> = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "LearningSession",
      required: true
    },

    segmentId: {
      type: Schema.Types.ObjectId,
      ref: "LyricSegment",
      required: true
    },

    questionType: {
      type: String,
      enum: ["fill_blank", "translation", "reorder"],
      required: true
    },

    userAnswer: {
      type: String,
      required: true
    },

    correctAnswer: {
      type: String,
      required: true
    },

    isCorrect: {
      type: Boolean,
      required: true
    },

    responseTime: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const ImmediateRecallQuiz: Model<IImmediateRecallQuiz> =
  mongoose.model<IImmediateRecallQuiz>(
    "ImmediateRecallQuiz",
    ImmediateRecallQuizSchema
  );

export default ImmediateRecallQuiz;