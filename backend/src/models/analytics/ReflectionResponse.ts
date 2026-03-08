import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReflectionResponse extends Document {
  sessionId: mongoose.Types.ObjectId;
  helpedMemory: string;
  distractions: string;
  musicEffect: "helped" | "neutral" | "hindered";
  additionalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReflectionResponseSchema: Schema<IReflectionResponse> = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "LearningSession",
      required: true
    },

    helpedMemory: {
      type: String
    },

    distractions: {
      type: String
    },

    musicEffect: {
      type: String,
      enum: ["helped", "neutral", "hindered"],
      required: true
    },

    additionalNotes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const ReflectionResponse: Model<IReflectionResponse> =
  mongoose.model<IReflectionResponse>("ReflectionResponse", ReflectionResponseSchema);

export default ReflectionResponse;