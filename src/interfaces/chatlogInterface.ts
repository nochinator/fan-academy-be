interface IChatMessage {
  userId: string;
  message: string;
  createdAt: Date;
}

export interface IChatLog {
  gameId: string;
  chatlog: IChatMessage[];
}