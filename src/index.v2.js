
const schedule = require('node-schedule');
const moment = require('moment');
const repo = require('./repository')
const uuidv4 = require('uuid/v4')
const nodemailer = require("nodemailer");
const sendmail = require('sendmail')();

let ruleMain = {};
ruleMain.minute = 01;

const saveReminder = () => {
    const reminder = {
        uuid: uuidv4(),
        message: 'Reminder... ' + moment().format('MM/DD/YYYY HH:mm:ss'),
        scheduled: false,
        dateSchedule: moment().add(2, 'minutes').format('MM/DD/YYYY HH:mm:ss')
    }

    repo.saveReminder(reminder)
}

const mainSchedule = schedule.scheduleJob(`${ruleMain.minute} * * * * *`, async (fireDate) => {
    console.log('Start Main Schedule... ' + moment().format('MM/DD/YYYY HH:mm:ss'));
    const reminders = await repo.getReminderByScheduled(false);


    reminders.forEach(reminder => {
        let ruleReminder = {};
        ruleReminder.second = moment(reminder.dateSchedule, 'MM/DD/YYYY HH:mm:ss').format('s') //(0-59)
        ruleReminder.minute = moment(reminder.dateSchedule, 'MM/DD/YYYY HH:mm:ss').format('m')//(0-59)
        ruleReminder.hour = moment(reminder.dateSchedule, 'MM/DD/YYYY HH:mm:ss').format('H')//(0-23)
        ruleReminder.date = moment(reminder.dateSchedule, 'MM/DD/YYYY HH:mm:ss').format('D')//(1-31)
        ruleReminder.month = moment(reminder.dateSchedule, 'MM/DD/YYYY HH:mm:ss').format('M') - 1//(0-11)
        ruleReminder.year = moment(reminder.dateSchedule, 'MM/DD/YYYY HH:mm:ss').format('YYYY')

        const rule = new Date(ruleReminder.year, ruleReminder.month, ruleReminder.date, ruleReminder.hour, ruleReminder.minute, ruleReminder.second);
        const reminderSchedule = schedule.scheduleJob(rule, function (rem) {
            try {
                console.log(rem)
                console.log(rem.message)
                console.log('Send message => ' + rem.message + ' - ' + moment().format('MM/DD/YYYY HH:mm:ss'));
               // sendEmailV2(rem.message)
            } catch (error) {
                console.error('error', error)
            }
        }.bind(null, reminder));

        /*reminder.scheduled = true
        repo.updateReminder(reminder)*/
    })

    console.log('End Main Schedule... ' + moment().format('MM/DD/YYYY HH:mm:ss'));
});
const sendEmailV2 = async (message) => {
    sendmail({
        from: 'jhonmurillo2014@gmail.com',
        to: 'jhonma16@hotmail.com',
        subject: 'test sendmail',
        html: message,
    }, function (err, reply) {
        console.log(err && err.stack);
        console.dir(reply);
    });
}
const sendEmail = async (message) => {

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'jhonmurillo2014@gmail.com',
            pass: 'murillo18'
        }
    });


    let mailOptions = {
        from: '"Jhon Murillo 👻" <jhonmurillo2014@gmail.com>', // sender address
        to: "jhonma16@hotmail.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world? " + message + " </b>" // html body
    };

    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions)

    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

//saveReminder()