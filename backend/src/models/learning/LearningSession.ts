import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILearningSession extends Document {
  userId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  playbackMode: "text_only" | "instrumental" | "full_music";
  tempoMultiplier: number;
  completionStatus: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LearningSessionSchema: Schema<ILearningSession> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    startTime: {
      type: Date,
      default: Date.now
    },

    endTime: {
      type: Date
    },

    playbackMode: {
      type: String,
      enum: ["text_only", "instrumental", "full_music"],
      default: "full_music"
    },

    tempoMultiplier: {
      type: Number,
      default: 1.0
    },

    completionStatus: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const LearningSession: Model<ILearningSession> =
  mongoose.model<ILearningSession>("LearningSession", LearningSessionSchema);

export default LearningSession;