// https://github.com/kelektiv/node-cron
const CronJob = require('cron').CronJob;
const moment = require('moment');
const to = require('await-to-js').default;

const TimeZoneVN = 'Asia/Ho_Chi_Minh';
const TAG = '[cronjob/cron.js]';
const defaultFormatDate = 'YYYY-MM-DD HH:mm:ss';

module.exports = {
  async start() {
    // abc
    try {
      // job('0 */15 * * * *', testJob);
    } catch (e) {
      console.log(`${TAG} run error:`, e);
    }
  }
}; // module.exports

function job(time, cb) {
  return new CronJob(time, () => cb(), null, true, TimeZoneVN);
}

async function testJob() {
  const funcName = "testJob";
  console.log(`${TAG} ${funcName} start at ${moment().format(defaultFormatDate)}`);
  // handle jobs
  console.log(`${TAG} ${funcName} end at ${moment().format(defaultFormatDate)}`);
}
