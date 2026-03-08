import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILyricSegment extends Document {
  songId: mongoose.Types.ObjectId;
  segmentOrder: number;
  text: string;
  startTime: number;
  endTime: number;
  vocabularyDifficulty: "beginner" | "intermediate" | "advanced";
  grammarTag: string;
  createdAt: Date;
  updatedAt: Date;
}

const LyricSegmentSchema: Schema<ILyricSegment> = new Schema(
  {
    songId: {
      type: Schema.Types.ObjectId,
      ref: "Song",
      required: true
    },

    segmentOrder: {
      type: Number,
      required: true
    },

    text: {
      type: String,
      required: true
    },

    startTime: {
      type: Number,
      required: true
    },

    endTime: {
      type: Number,
      required: true
    },

    vocabularyDifficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },

    grammarTag: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const LyricSegment: Model<ILyricSegment> =
  mongoose.model<ILyricSegment>("LyricSegment", LyricSegmentSchema);

export default LyricSegment;