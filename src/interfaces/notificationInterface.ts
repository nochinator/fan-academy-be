import { Document, Types } from 'mongoose';


// Note: This should be in sync with the discord bot that sends notifications

export interface INotification extends Document {
    _id: Types.ObjectId;
    type?: string;
    title: string;
    summary: string;
    createdAt: Date;
}
