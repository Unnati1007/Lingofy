import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEngagementAnalytics extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  voluntarySessionLength: number;
  songsSkipped: number;
  segmentsCompleted: number;
  retentionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const EngagementAnalyticsSchema: Schema<IEngagementAnalytics> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "LearningSession",
      required: true
    },

    voluntarySessionLength: {
      type: Number,
      default: 0
    },

    songsSkipped: {
      type: Number,
      default: 0
    },

    segmentsCompleted: {
      type: Number,
      default: 0
    },

    retentionRate: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const EngagementAnalytics: Model<IEngagementAnalytics> =
  mongoose.model<IEngagementAnalytics>(
    "EngagementAnalytics",
    EngagementAnalyticsSchema
  );

export default EngagementAnalytics;