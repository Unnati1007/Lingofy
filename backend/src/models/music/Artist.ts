import mongoose, { Schema, Document, Model } from "mongoose";

export interface IArtist extends Document {
  name: string;
  genre: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

const ArtistSchema: Schema<IArtist> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Artist name is required"],
      trim: true
    },

    genre: {
      type: String,
      required: [true, "Genre is required"],
      trim: true
    },

    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Artist: Model<IArtist> = mongoose.model<IArtist>("Artist", ArtistSchema);

export default Artist;