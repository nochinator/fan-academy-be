import * as Brevo from '@getbrevo/brevo';
import { NextFunction } from "express";
import IGame from '../interfaces/gameInterface';

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

const emailVars = {
  sender: {
    email: process.env.EMAIL_SENDER,
    name: 'Fan Academy'
  },
  replyTo: { email: process.env.EMAIL_TEST_ADDRESS }
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
  // TODO: refactor FIXME:
  async sendGameEndEmail(_game: IGame, _next: NextFunction): Promise<void> {
    // const { players, winCondition, winner } = game;

    // const userData = await UserService.getUsers([players[0].userData, players[1].userData]);

    // const user1 = {
    //   username: userData[0].username,
    //   faction: players[0].faction
    // };

    // const user2 = {
    //   username: userData[1].username,
    //   faction: players[1].faction
    // };

    // const winnerUsername = userData.find(user => {
    //   user._id.toString() === winner;
    // })?.username
    // ;
    // await this.sendEmail({
    //   templateId: 4,
    //   email: [userData[0].email, userData[1].email],
    //   params: {
    //     user1,
    //     user2,
    //     winCondition,
    //     winner: winnerUsername
    //   }
    // }, next);
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
