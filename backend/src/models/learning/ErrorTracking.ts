import mongoose, { Schema, Document, Model } from "mongoose";

export interface IErrorTracking extends Document {
  interactionId: mongoose.Types.ObjectId;
  wordId: mongoose.Types.ObjectId;
  errorType: "semantic" | "phonetic" | "spelling";
  correctionTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const ErrorTrackingSchema: Schema<IErrorTracking> = new Schema(
  {
    interactionId: {
      type: Schema.Types.ObjectId,
      ref: "SegmentInteraction",
      required: true
    },

    wordId: {
      type: Schema.Types.ObjectId,
      ref: "Vocabulary",
      required: true
    },

    errorType: {
      type: String,
      enum: ["semantic", "phonetic", "spelling"],
      required: true
    },

    correctionTime: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const ErrorTracking: Model<IErrorTracking> =
  mongoose.model<IErrorTracking>("ErrorTracking", ErrorTrackingSchema);

export default ErrorTracking;