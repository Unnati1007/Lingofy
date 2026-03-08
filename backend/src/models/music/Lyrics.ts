import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILyrics extends Document {
  songId: mongoose.Types.ObjectId;
  fullLyrics: string;
  createdAt: Date;
  updatedAt: Date;
}

const LyricsSchema: Schema<ILyrics> = new Schema(
  {
    songId: {
      type: Schema.Types.ObjectId,
      ref: "Song",
      required: true,
      unique: true
    },

    fullLyrics: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Lyrics: Model<ILyrics> = mongoose.model<ILyrics>("Lyrics", LyricsSchema);

export default Lyrics;