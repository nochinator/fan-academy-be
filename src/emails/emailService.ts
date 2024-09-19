import * as Brevo from '@getbrevo/brevo';
import { BREVO_API_KEY, EMAIL_TEST_ADDRESS } from '../config';
import IGame from '../interfaces/gameInterface';
import { NextFunction } from "express";

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

  async sendGameEndEmail(game: IGame, next: NextFunction): Promise<void> {
    const { player1, player2, winCondition, winner } = game;

    // Create recovery link // TODO:
    const gameLink = `testlink/games/${game._id}`;
    await this.sendEmail({
      templateId: 4,
      email: [player1.email, player2!.email],
      params: {
        player1,
        player2,
        winCondition,
        winner: winner?.username,
        gameLink
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
