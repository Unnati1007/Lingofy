import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlaylist extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlaylistSchema: Schema<IPlaylist> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: [true, "Playlist title is required"],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Playlist: Model<IPlaylist> =
  mongoose.model<IPlaylist>("Playlist", PlaylistSchema);

export default Playlist;