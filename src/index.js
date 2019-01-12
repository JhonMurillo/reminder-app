const schedule = require('node-schedule');
const moment = require('moment');
const repo = require('./repository')
const uuidv4 = require('uuid/v4')

const saveReminder = () => {
    const reminder = {
        uuid: uuidv4(),
        message: 'Reminder... ' + moment().format('MM/DD/YYYY hh:mm:ss')
    }

    repo.saveReminder(reminder)
}
const getSchedule = schedule.scheduleJob('1 * * * * *', async () => {
    try {
        console.log('sending... ' + moment().format('MM/DD/YYYY hh:mm:ss'));
        const reminders = await repo.getReminders();
        console.log('reminders', reminders)
        console.log('send! ' + moment().format('MM/DD/YYYY hh:mm:ss'));
    } catch (error) {
        console.error('error', error)
    }
});

saveReminder();