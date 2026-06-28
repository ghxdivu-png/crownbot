import mongoose, { Schema, Document } from "mongoose";

export interface IReactionRoleEntry {
  roleId: string;
  label: string;
  emoji?: string;
  description?: string;
  style: "Primary" | "Secondary" | "Success" | "Danger";
}

export interface IReactionRolePanel extends Document {
  guildId: string;
  channelId: string;
  messageId: string;
  title: string;
  description?: string;
  color: number;
  entries: IReactionRoleEntry[];
  exclusive: boolean;
  createdAt: Date;
}

const ReactionRolePanelSchema = new Schema<IReactionRolePanel>({
  guildId: { type: String, required: true, index: true },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  color: { type: Number, default: 0x5865F2 },
  entries: [{
    roleId: { type: String, required: true },
    label: { type: String, required: true },
    emoji: String,
    description: String,
    style: { type: String, default: "Primary", enum: ["Primary", "Secondary", "Success", "Danger"] },
  }],
  exclusive: { type: Boolean, default: false },
}, { timestamps: true });

export const ReactionRolePanel = mongoose.model<IReactionRolePanel>("ReactionRolePanel", ReactionRolePanelSchema);
