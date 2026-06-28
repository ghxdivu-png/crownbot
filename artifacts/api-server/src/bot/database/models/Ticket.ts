import mongoose, { Schema, Document } from "mongoose";

export type TicketStatus = "open" | "claimed" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface ITicketPanel extends Document {
  guildId: string;
  channelId: string;
  messageId: string;
  title: string;
  description: string;
  color: number;
  categoryId?: string;
  supportRoles: string[];
  ticketCount: number;
  createdAt: Date;
}

export interface ITicket extends Document {
  guildId: string;
  channelId: string;
  panelId: string;
  ticketNumber: number;
  userId: string;
  claimedBy?: string;
  status: TicketStatus;
  priority: TicketPriority;
  topic?: string;
  createdAt: Date;
  closedAt?: Date;
  closedBy?: string;
  closeReason?: string;
}

const TicketPanelSchema = new Schema<ITicketPanel>({
  guildId: { type: String, required: true, index: true },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  color: { type: Number, default: 0x5865F2 },
  categoryId: String,
  supportRoles: { type: [String], default: [] },
  ticketCount: { type: Number, default: 0 },
}, { timestamps: true });

const TicketSchema = new Schema<ITicket>({
  guildId: { type: String, required: true, index: true },
  channelId: { type: String, required: true, unique: true },
  panelId: { type: String, required: true },
  ticketNumber: { type: Number, required: true },
  userId: { type: String, required: true, index: true },
  claimedBy: String,
  status: { type: String, default: "open", enum: ["open", "claimed", "closed"] },
  priority: { type: String, default: "medium", enum: ["low", "medium", "high", "urgent"] },
  topic: String,
  closedAt: Date,
  closedBy: String,
  closeReason: String,
}, { timestamps: true });

export const TicketPanel = mongoose.model<ITicketPanel>("TicketPanel", TicketPanelSchema);
export const Ticket = mongoose.model<ITicket>("Ticket", TicketSchema);
