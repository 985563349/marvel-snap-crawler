const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.align(),
    format.printf((info) => `${info.level}: ${[info.timestamp]}: ${info.message}`)
  ),
  transports: [
    new transports.DailyRotateFile({
      level: 'info',
      filename: 'logs/%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
    }),
  ],
});

module.exports = logger;
