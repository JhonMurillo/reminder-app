const schedule = require('node-schedule');
const moment = require('moment');
const repo = require('./repository');
const uuidv4 = require('uuid/v4');
const path = require('path');
require('dotenv').config({ path: `${path.dirname(__dirname)}/.env` });
const axios = require('axios');

const recipents = [
  {
    name: 'Yasmira Puentes Isaza',
    phone: '+573233461933',
  },
  {
    name: 'Jhon Mario Murillo Cordoba',
    phone: '+573145202474',
  },
];

// Twilio Credentials
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  URL_EXPIRES,
  CRON_EXPRESSION,
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
      body += '\n No hay ninguna cuenta cerca a expirar!\n';
    }

    body = body + `\nEstas Cuentas Estan Expiradas:\n`;
    for (const field of data.accounts_expire) {
      hasBody = true;
      hasExpired = true;
      body += `- Perfil: ${field.profile.profile_name}, Cuenta: ${field.account.email}\n`;
    }
    if (!hasExpired) {
      body += '\n No hay ninguna expirada!\n';
    }

    if (hasBody) {
      await sendWSMessage(body);
    }

    console.log(body);
  } catch (error) {
    console.error(error);
  }
};
