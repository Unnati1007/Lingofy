import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISegmentInteraction extends Document {
  sessionId: mongoose.Types.ObjectId;
  segmentId: mongoose.Types.ObjectId;
  timeSpentSeconds: number;
  tapsCount: number;
  reorderAttempts: number;
  fillBlankAttempts: number;
  mistakes: number;
  createdAt: Date;
  updatedAt: Date;
}

const SegmentInteractionSchema: Schema<ISegmentInteraction> = new Schema(
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

    timeSpentSeconds: {
      type: Number,
      default: 0
    },

    tapsCount: {
      type: Number,
      default: 0
    },

    reorderAttempts: {
      type: Number,
      default: 0
    },

    fillBlankAttempts: {
      type: Number,
      default: 0
    },

    mistakes: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const SegmentInteraction: Model<ISegmentInteraction> =
  mongoose.model<ISegmentInteraction>(
    "SegmentInteraction",
    SegmentInteractionSchema
  );

export default SegmentInteraction;