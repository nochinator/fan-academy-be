import * as Brevo from '@getbrevo/brevo';
import { EWinConditions } from '../enums/game.enums';
import { IPopulatedPlayerData } from '../interfaces/gameInterface';
import { CustomError } from '../classes/customError';

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

const emailVars = {
  to: [{ email: process.env.EMAIL_ADDRESS }],
  sender: {
    email: process.env.EMAIL_SENDER,
    name: 'Fan Academy'
  },
  replyTo: { email: process.env.EMAIL_ADDRESS }
};

export const EmailService = {
  async sendEmail(emailData: {
    templateId: number,
    email: string | string[],
    params: object,
  }): Promise<void> {
    const sendTo = Array.isArray(emailData.email)
      ? emailData.email.map((mail) => ({ email: mail }))
      : [{ email: emailData.email }];

    console.log("PARAMS =>", emailData.params);

    try {
      const smtpEmail = new Brevo.SendSmtpEmail();
      const sendSmtpEmail = Object.assign(smtpEmail, {
        ...emailVars,
        bcc: sendTo,
        templateId: emailData.templateId,
        params: emailData.params
      });

      console.log('sendSmtpEmail', sendSmtpEmail);

      const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('API called successfully. Returned data: ' + JSON.stringify(result));
    } catch(err) {
      console.log(err);
      throw new CustomError(50, `${err}`);
    };
  },

  // async sendAccountConfirmationEmail(username: string, email: string): Promise<void> {
  //   const confirmationLink = 'confirmation.com';
  //   await this.sendEmail({
  //     templateId: 1,
  //     email,
  //     params: {
  //       username,
  //       confirmationLink
  //     }
  //   })
  // },

  async sendTurnNotificationEmail(email: string, username: string, _gameId: string): Promise<void> {
    await this.sendEmail({
      templateId: 3,
      email,
      params: { username }
    });
  },

  async sendGameOverEmail(winner: IPopulatedPlayerData, loser: IPopulatedPlayerData, winCondition: EWinConditions): Promise<void> {
    await this.sendEmail({
      templateId: 4,
      email: [winner.userData.email!, loser.userData.email!],
      params: {
        user1: winner.userData.username,
        user1Faction: winner.faction,
        user2: loser.userData.username,
        user2Faction: loser.faction,
        winCondition
      }
    });
  },

  async sendAccountDeletionEmail(email: string): Promise<void> {
    const contactLink = 'localhost/contact';
    await this.sendEmail({
      templateId: 5,
      email,
      params: { contactLink }
    });
  }
};
