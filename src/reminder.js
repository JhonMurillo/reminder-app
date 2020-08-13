const schedule = require('node-schedule');
const moment = require('moment');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: `${path.dirname(__dirname)}/.env` });
const axios = require('axios');

const recipents = [
  {
    name: 'Yasmira Puentes Isaza',
    phone: '+573233461933',
    email: 'yasmira.isaza@gmail.com',
  },
  {
    name: 'Yasmira Puentes Isaza',
    phone: '+573233461933',
    email: 'yasmira-isaza@hotmail.com',
  },
  {
    name: 'Jhon Mario Murillo Cordoba',
    phone: '+573145202474',
    email: 'jhonmurillo2014@gmail.com',
  },
];

// Twilio Credentials
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  URL_EXPIRES,
  CRON_EXPRESSION,
  ACCOUNT_EMAIL_SENDER,
  PASSWORD_EMAIL_SENDER,
} = process.env;

// require the Twilio module and create a REST client
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const mainSchedule = schedule.scheduleJob(CRON_EXPRESSION, async (fireDate) => {
  console.log(
    'Start Main Schedule... ' + moment().format('MM/DD/YYYY HH:mm:ss')
  );
  await getAccountNearToExpire();
});

const sendWSMessage = async (msg) => {
  try {
    for (const recipent of recipents) {
      const resultMessage = await client.messages.create({
        to: `whatsapp:${recipent.phone}`,
        from: 'whatsapp:+14155238886',
        body: msg,
      });
      console.log(`Message Sent to  ${recipent.name}, ${resultMessage.sid}!`);
    }
  } catch (error) {
    console.log(error);
  }
};

const sendEmail = async (body) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: ACCOUNT_EMAIL_SENDER,
        pass: PASSWORD_EMAIL_SENDER,
      },
    });

    const emails = recipents.map((r) => r.email).join(',');
    console.log(emails);
    const mailOptions = {
      from: PASSWORD_EMAIL_SENDER,
      to: emails,
      subject: 'Notificacion Admin Netflix',
      text: body,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

const getAccountNearToExpire = async () => {
  try {
    const result = await axios.get(URL_EXPIRES);

    const { data } = result;

    let body = '';
    let hasBody = false;
    body += `\nEstas Cuentas expiran Hoy:\n`;
    let hasExpired = false,
      hasNearToExpired = false;
    for (const field of data.accounts_near_to_expire) {
      hasBody = true;
      hasNearToExpired = true;
      body += `- Perfil: ${field.profile.profile_name}, Cuenta: ${field.account.email}\n`;
    }
    if (!hasNearToExpired) {
      body += '\nNo hay ninguna cuenta que expire hoy!\n';
    }

    body = body + `\nEstas Cuentas Estan Expiradas:\n`;
    for (const field of data.accounts_expire) {
      hasBody = true;
      hasExpired = true;
      body += `- Perfil: ${field.profile.profile_name}, Cuenta: ${field.account.email}\n`;
    }
    if (!hasExpired) {
      body += '\nNo hay ninguna expirada!\n';
    }

    if (hasBody) {
      const accountLink =
        'https://admin-netflix.herokuapp.com/cuentas/dashboard';
      body = `Hola, Solo quiero recordarte que tienes cuentas que expiran hoy/cuentas expiradas!\n${body}\nPara mayor información, revisa este link ${accountLink}\nGracias\nAdmin Netflix.`;
      // await sendWSMessage(`Your {{1}} code is {{2}}, ${body}`);
      await sendEmail(body);
    }

    console.log(body);
  } catch (error) {
    console.error(error);
  }
};
