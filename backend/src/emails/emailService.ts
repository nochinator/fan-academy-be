import * as Brevo from '@getbrevo/brevo';
import { BREVO_API_KEY, EMAIL_TEST_ADDRESS } from '../config';

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  BREVO_API_KEY!
);

const emailVars = {
  sender: {
    email: EMAIL_TEST_ADDRESS, // TODO: implement actual email addresses
    name: 'Fan Academy'
  },
  // to: [
  //   { "email": EMAIL_TEST_ADDRESS }
  // ],
  replyTo: { email: EMAIL_TEST_ADDRESS }
};

export const EmailService = {
  async sendEmail(emailData: {
    templateId: number,
    email: string,
    params: object
  }): Promise<void> {
    const smtpEmail = new Brevo.SendSmtpEmail();
    const sendSmtpEmail = Object.assign(smtpEmail, {
      ...emailVars,
      to: [{ email: emailData.email }],
      templateId: emailData.templateId,
      params: emailData.params
    });

    try {
      const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('API called successfully. Returned data: ' + JSON.stringify(result));
    } catch(err) { err; };
  },

  async sendAccountConfirmationEmail(username: string, email: string): Promise<void> {
    // Create confirmation link // TODO:
    const confirmationLink = 'confirmation.com';
    await this.sendEmail({
      templateId: 1,
      email,
      params: {
        username,
        confirmationLink
      }
    });
  },

  async sendPasswordResetEmail(email: string, username: string): Promise<void> {
    // Create recovery link // TODO:
    const resetLink = 'recovery.com';
    await this.sendEmail({
      templateId: 2,
      email,
      params: {
        username,
        resetLink
      }
    });
  },

  async sendTurnNotificationEmail(email: string, username: string, gameId: string): Promise<void> {
    // Create recovery link // TODO:
    const gameLink = `testlink/games/${gameId}`;
    await this.sendEmail({
      templateId: 3,
      email,
      params: {
        username,
        gameLink
      }
    });
  }
};
