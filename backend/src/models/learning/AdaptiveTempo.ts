import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdaptiveTempo extends Document {
  sessionId: mongoose.Types.ObjectId;
  segmentId: mongoose.Types.ObjectId;
  previousTempo: number;
  newTempo: number;
  triggerReason: "low_accuracy" | "hesitation" | "smooth_progress";
  createdAt: Date;
  updatedAt: Date;
}

const AdaptiveTempoSchema: Schema<IAdaptiveTempo> = new Schema(
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

    previousTempo: {
      type: Number,
      required: true
    },

    newTempo: {
      type: Number,
      required: true
    },

    triggerReason: {
      type: String,
      enum: ["low_accuracy", "hesitation", "smooth_progress"],
      required: true
    }
  },
  {
    timestamps: true
  }
);

const AdaptiveTempo: Model<IAdaptiveTempo> =
  mongoose.model<IAdaptiveTempo>("AdaptiveTempo", AdaptiveTempoSchema);

export default AdaptiveTempo;