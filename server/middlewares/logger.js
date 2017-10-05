const auditLog = require('audit-log');
const moment = require('moment');

auditLog.addTransport('console');
const log = (logType, text, traceData) => {
  auditLog.log({ logType, text, traceData, dateTime: moment().format('YYYY-DD-MM hh:mm:ss') });
};

const logInfo = (text, obj) => log('info', text, obj);
const logWarning = (text, traceData) => log('warning', text, traceData);
const logError = (text, traceData) => log('error', text, traceData);
module.exports = {
  logInfo,
  logWarning,
  logError,
};

