import mongoose, { Schema, Document } from "mongoose";

export interface ISyncState extends Document {
  accountId: string;
  initialSyncDone: boolean;
  lastFetchedUID?: number;
  lastSyncedAt?: Date;
  folders?: {
    [folderName: string]: {
      lastFetchedUID: number;
      lastSyncedAt: Date;
    };
  };
}

const SyncStateSchema = new Schema<ISyncState>(
  {
    accountId: { type: String, required: true, unique: true },
    initialSyncDone: { type: Boolean, default: false },
    lastFetchedUID: { type: Number },
    lastSyncedAt: { type: Date },
    folders: {
      type: Map,
      of: new Schema(
        {
          lastFetchedUID: { type: Number },
          lastSyncedAt: { type: Date },
        },
        { _id: false }
      ),
    },
  },
  { timestamps: true }
);

export const SyncState = mongoose.model<ISyncState>("SyncState", SyncStateSchema);
