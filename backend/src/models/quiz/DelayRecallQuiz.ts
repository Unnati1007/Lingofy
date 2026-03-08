import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDelayedRecallQuiz extends Document {
  userId: mongoose.Types.ObjectId;
  segmentId: mongoose.Types.ObjectId;
  scheduledTime: Date;
  attemptTime?: Date;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

const DelayedRecallQuizSchema: Schema<IDelayedRecallQuiz> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    segmentId: {
      type: Schema.Types.ObjectId,
      ref: "LyricSegment",
      required: true
    },

    scheduledTime: {
      type: Date,
      required: true
    },

    attemptTime: {
      type: Date
    },

    score: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const DelayedRecallQuiz: Model<IDelayedRecallQuiz> =
  mongoose.model<IDelayedRecallQuiz>(
    "DelayedRecallQuiz",
    DelayedRecallQuizSchema
  );

export default DelayedRecallQuiz;