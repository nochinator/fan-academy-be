import * as Brevo from '@getbrevo/brevo';
import { BREVO_API_KEY, EMAIL_TEST_ADDRESS } from '../config';
import IGame from '../interfaces/gameInterface';
import { NextFunction } from "express";
import UserService from '../services/userService';

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  BREVO_API_KEY!
);

const emailVars = {
  sender: {
    email: EMAIL_TEST_ADDRESS, // TODO: implement domain email addresses
    name: 'Fan Academy'
  },
  replyTo: { email: EMAIL_TEST_ADDRESS }
};

export const EmailService = {
  async sendEmail(emailData: {
    templateId: number,
    email: string | string[],
    params: object,
  }, next: NextFunction): Promise<void> {
    const sendTo = Array.isArray(emailData.email)
      ? emailData.email.map((mail) => ({ email: mail }))
      : [{ email: emailData.email }];

    console.log("PARAMS =>", emailData.params);

    const smtpEmail = new Brevo.SendSmtpEmail();
    const sendSmtpEmail = Object.assign(smtpEmail, {
      ...emailVars,
      to: sendTo,
      templateId: emailData.templateId,
      params: emailData.params
    });

    try {
      const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('API called successfully. Returned data: ' + JSON.stringify(result));
    } catch(err) {
      console.log(err);
      next(err);
    };
  },

  async sendAccountConfirmationEmail(username: string, email: string, next: NextFunction): Promise<void> {
    // Create confirmation link // TODO:
    const confirmationLink = 'confirmation.com';
    await this.sendEmail({
      templateId: 1,
      email,
      params: {
        username,
        confirmationLink
      }
    }, next);
  },

  async sendPasswordResetEmail(email: string, username: string, next: NextFunction): Promise<void> {
    // Create recovery link // TODO:
    const resetLink = 'recovery.com';
    await this.sendEmail({
      templateId: 2,
      email,
      params: {
        username,
        resetLink
      }
    }, next);
  },

  async sendTurnNotificationEmail(email: string, username: string, gameId: string, next: NextFunction): Promise<void> {
    // Create recovery link // TODO:
    const gameLink = `testlink/games/${gameId}`;
    await this.sendEmail({
      templateId: 3,
      email,
      params: {
        username,
        gameLink
      }
    }, next);
  },

  // REVIEW: include link back to the game for a rematch?
  // TODO: refactor
  async sendGameEndEmail(game: IGame, next: NextFunction): Promise<void> {
    const { users, winCondition, winner } = game;

    const userData = await UserService.getUsers([users[0].userData.userId, users[1].userData.userId]);

    const user1 = {
      username: userData[0].username,
      faction: users[0].faction
    };

    const user2 = {
      username: userData[1].username,
      faction: users[1].faction
    };

    const winnerUsername = userData.find(user => {
      user._id.toString() === winner;
    })?.username
    ;
    await this.sendEmail({
      templateId: 4,
      email: [userData[0].email, userData[1].email],
      params: {
        user1,
        user2,
        winCondition,
        winner: winnerUsername
      }
    }, next);
  },

  async sendAccountDeletionEmail(email: string, next: NextFunction): Promise<void> {
    const contactLink = 'localhost/contact';
    await this.sendEmail({
      templateId: 5,
      email,
      params: { contactLink }
    }, next);
  }
};
