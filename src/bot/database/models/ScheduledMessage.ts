import mongoose, { Schema, Document } from "mongoose";

export interface IScheduledMessage extends Document {
  guildId: string;
  channelId: string;
  content?: string;
  embedTitle?: string;
  embedDescription?: string;
  embedColor?: number;
  embedFooter?: string;
  embedImage?: string;
  cron?: string;
  intervalMs?: number;
  nextRunAt: Date;
  lastRunAt?: Date;
  paused: boolean;
  recurring: boolean;
  runCount: number;
  label: string;
  createdBy: string;
  createdAt: Date;
}

const ScheduledMessageSchema = new Schema<IScheduledMessage>({
  guildId: { type: String, required: true, index: true },
  channelId: { type: String, required: true },
  content: String,
  embedTitle: String,
  embedDescription: String,
  embedColor: Number,
  embedFooter: String,
  embedImage: String,
  intervalMs: Number,
  nextRunAt: { type: Date, required: true },
  lastRunAt: Date,
  paused: { type: Boolean, default: false },
  recurring: { type: Boolean, default: false },
  runCount: { type: Number, default: 0 },
  label: { type: String, required: true },
  createdBy: { type: String, required: true },
}, { timestamps: true });

export const ScheduledMessage = mongoose.model<IScheduledMessage>("ScheduledMessage", ScheduledMessageSchema);
