import { Schema, model } from 'mongoose';
import { INotification } from '../interfaces/notificationInterface';

import { NotificationType } from '../enums/notification.enums';

const notificationSchema = new Schema<INotification>({
  type: { type: String },
  title: {
    type: String,
    required: true 
  },
  summary: {
    type: String,
    required: true 
  },
  createdAt: {
    type: Date,
    default: () => new Date() 
  }
});

export const Notification = model<INotification>('Notification', notificationSchema);

// Notification definitions to ensure exist on startup
export const notificationDefinitions: Array<Partial<INotification>> = [
  {
    type: NotificationType.GAME_FINISHED,
    title: 'Game Finished',
    summary: 'A game you participated in has finished.'
  },
  {
    type: NotificationType.NEW_CHALLENGE,
    title: 'New Challenge',
    summary: 'You have received a new challenge!'
  },
  {
    type: NotificationType.GAME_DELETED,
    title: 'Game Deleted',
    summary: 'A game you were part of has been deleted.'
  },
  {
    type: NotificationType.YOUR_TURN,
    title: "It's Your Turn!",
    summary: 'It is your turn to play.'
  }
];

// Function to ensure notification definitions exist in the database
export async function ensureNotificationDefinitionsExist() {
  for (const def of notificationDefinitions) {
    const exists = await Notification.findOne({ type: def.type });
    if (!exists) {
      await Notification.create({
        ...def,
        createdAt: new Date() 
      });
    }
  }
}
