import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExperimentAssignment extends Document {
  userId: mongoose.Types.ObjectId;
  experimentGroup: "control" | "ai_adaptive";
  assignedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExperimentAssignmentSchema: Schema<IExperimentAssignment> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    experimentGroup: {
      type: String,
      enum: ["control", "ai_adaptive"],
      required: true
    },

    assignedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const ExperimentAssignment: Model<IExperimentAssignment> =
  mongoose.model<IExperimentAssignment>(
    "ExperimentAssignment",
    ExperimentAssignmentSchema
  );

export default ExperimentAssignment;