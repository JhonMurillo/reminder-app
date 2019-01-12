
const schedule = require('node-schedule');
const moment = require('moment');
const repo = require('./repository')
const uuidv4 = require('uuid/v4')

let ruleMain =  {};
ruleMain.minute = 01;

const saveReminder = () => {
    const reminder = {
        uuid: uuidv4(),
        message: 'Reminder... ' + moment().format('MM/DD/YYYY HH:mm:ss'),
        scheduled: false,
        dateSchedule: moment().add(5, 'minutes').format('MM/DD/YYYY HH:mm:ss')
    }

    repo.saveReminder(reminder)
}

const mainSchedule = schedule.scheduleJob(`${ruleMain.minute} * * * * *`, async () => {
    console.log('Start Main Schedule... ' + moment().format('MM/DD/YYYY HH:mm:ss'));
    const reminders = await repo.getReminderByScheduled(false);

    reminders.forEach(reminder => {
        let ruleReminder =  {};
        ruleReminder.second = moment(reminder.dateSchedule, 'MM/DD/YYYY HH:mm:ss').format('s') //(0-59)
        ruleReminder.minute = moment(reminder.dateSchedule, 'MM/DD/YYYY HH:mm:ss').format('m')//(0-59)
        ruleReminder.hour   = moment(reminder.dateSchedule, 'MM/DD/YYYY HH:mm:ss').format('H')//(0-23)
        ruleReminder.date   = moment(reminder.dateSchedule, 'MM/DD/YYYY HH:mm:ss').format('D')//(1-31)
        ruleReminder.month  = moment(reminder.dateSchedule, 'MM/DD/YYYY HH:mm:ss').format('M') - 1//(0-11)
        ruleReminder.year   = moment(reminder.dateSchedule, 'MM/DD/YYYY HH:mm:ss').format('YYYY')

        console.log('ruleReminder', ruleReminder)
        

        /*const reminderSchedule = schedule.scheduleJob(ruleReminder, async () => {
            try {
                console.log('Send message => ' +reminder.messge +' - '+ moment().format('MM/DD/YYYY HH:mm:ss'));
            } catch (error) {
                console.error('error', error)
            }
        });*/
    })

    console.log('End Main Schedule... ' + moment().format('MM/DD/YYYY HH:mm:ss'));
});

saveReminder()