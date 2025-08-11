import { Document, Types } from 'mongoose';


export interface INotificationDelivery extends Document {
    _id: Types.ObjectId;
    notificationId: Types.ObjectId;
    username: string;
    deliveredAt?: Date | null;
    deliveredMessageId?: string;
    attempts: number;
    lastAttemptAt?: Date;
    error?: string;
    claimedAt?: Date | null;
}
