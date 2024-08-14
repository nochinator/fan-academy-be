import * as Brevo from '@getbrevo/brevo';
import { BREVO_API_KEY, EMAIL_TEST_ADDRESS } from '../config';

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  BREVO_API_KEY!
);

const emailVars = {
  sender: {
    email: EMAIL_TEST_ADDRESS,
    name: 'Fan Academy'
  },
  to: [
    { "email": EMAIL_TEST_ADDRESS! }
  ],
  replyTo: { email: EMAIL_TEST_ADDRESS! }
};

export const EmailService = {
  async sendAccountConfirmationEmail(username: string) {
    const smtpEmail = new Brevo.SendSmtpEmail();
    const sendSmtpEmail = Object.assign(smtpEmail, {
      ...emailVars,
      templateId: 1,
      params: {
        username,
        confirmationLink: 'test123'
      }
    });

    try {
      const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('API called successfully. Returned data: ' + JSON.stringify(result));
    } catch(err) { console.log(err);}
  }
};
