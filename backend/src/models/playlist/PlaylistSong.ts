import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlaylistSong extends Document {
  playlistId: mongoose.Types.ObjectId;
  songId: mongoose.Types.ObjectId;
  addedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PlaylistSongSchema: Schema<IPlaylistSong> = new Schema(
  {
    playlistId: {
      type: Schema.Types.ObjectId,
      ref: "Playlist",
      required: true
    },

    songId: {
      type: Schema.Types.ObjectId,
      ref: "Song",
      required: true
    },

    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const PlaylistSong: Model<IPlaylistSong> =
  mongoose.model<IPlaylistSong>("PlaylistSong", PlaylistSongSchema);

export default PlaylistSong;