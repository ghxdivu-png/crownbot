import mongoose, { Schema, Document } from "mongoose";

export type SuggestionStatus = "pending" | "approved" | "rejected" | "considering";

export interface ISuggestion extends Document {
  guildId: string;
  channelId: string;
  messageId: string;
  userId: string;
  anonymous: boolean;
  content: string;
  status: SuggestionStatus;
  reviewedBy?: string;
  reviewNote?: string;
  upvotes: string[];
  downvotes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SuggestionSchema = new Schema<ISuggestion>({
  guildId: { type: String, required: true, index: true },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  anonymous: { type: Boolean, default: false },
  content: { type: String, required: true, maxlength: 1000 },
  status: { type: String, default: "pending", enum: ["pending", "approved", "rejected", "considering"] },
  reviewedBy: String,
  reviewNote: String,
  upvotes: { type: [String], default: [] },
  downvotes: { type: [String], default: [] },
}, { timestamps: true });

export const Suggestion = mongoose.model<ISuggestion>("Suggestion", SuggestionSchema);
