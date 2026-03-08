import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAlbum extends Document {
  artistId: mongoose.Types.ObjectId;
  title: string;
  releaseDate: Date;
  coverImageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const AlbumSchema: Schema<IAlbum> = new Schema(
  {
    artistId: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
      required: true
    },

    title: {
      type: String,
      required: [true, "Album title is required"],
      trim: true
    },

    releaseDate: {
      type: Date
    },

    coverImageUrl: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Album: Model<IAlbum> = mongoose.model<IAlbum>("Album", AlbumSchema);

export default Album;