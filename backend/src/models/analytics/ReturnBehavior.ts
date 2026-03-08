import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReturnBehavior extends Document {
  userId: mongoose.Types.ObjectId;
  daysBetweenSessions: number;
  weeklySessions: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnBehaviorSchema: Schema<IReturnBehavior> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    daysBetweenSessions: {
      type: Number,
      default: 0
    },

    weeklySessions: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const ReturnBehavior: Model<IReturnBehavior> =
  mongoose.model<IReturnBehavior>("ReturnBehavior", ReturnBehaviorSchema);

export default ReturnBehavior;