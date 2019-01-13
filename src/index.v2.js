
const schedule = require('node-schedule');
const moment = require('moment');
const repo = require('./repository')
const uuidv4 = require('uuid/v4')
const Slack = require('slack-node');
const { WebClient } = require('@slack/client');

const token = "xoxb-523503548023-522302167060-j8yC8xfKKvr8i1knbexyGX6b";
const web = new WebClient(token);

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

    console.info(`# Of reminders sheduled: ${reminders.length}`)

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
                console.log('Send message => ' + rem.message + ' - ' + moment().format('MM/DD/YYYY HH:mm:ss'));
                sendSlackMessage(rem)
            } catch (error) {
                console.error('error', error)
            }
        }.bind(null, reminder));

        reminder.scheduled = true
        repo.updateReminder(reminder)
    })

    console.log('End Main Schedule... ' + moment().format('MM/DD/YYYY HH:mm:ss'));
});

const sendSlackMessage = reminder => {
    webhookUri = "https://hooks.slack.com/services/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";
    slack = new Slack(token);

    slack.api("users.list", function (err, response) {
        if (err) {
            console.log(err);
            throw new Error(err)
        }
        const members = response.members
        const member = members.filter(memb => memb.profile.email === reminder.email).shift()

        slack.setWebhook(webhookUri);
        message = `<@${member.id}> ${reminder.message}`

        //Send Message to Channel
        /*slack.webhook({
            channel: "#remindernotifications",
            username: "reminderapp",
            text: message
        }, function (err, response) {
            if (err) {
                console.log(err);
                throw new Error(err)
            }
        });*/
        web.chat.postMessage({ channel: member.id, text: message })
            .then((res) => {
                console.log('Message sent: ', res.ts);
            })
            .catch(console.error);
    });


}
//saveReminder()