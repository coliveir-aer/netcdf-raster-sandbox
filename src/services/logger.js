// /src/services/logger.js

const LOG_LEVEL = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
};

// Set the current log level. For development, DEBUG shows everything.
const CURRENT_LOG_LEVEL = LOG_LEVEL.DEBUG;

const log = (level, context, ...args) => {
    if (level < CURRENT_LOG_LEVEL) {
        return;
    }

    const time = new Date().toLocaleTimeString();
    const prefix = `%c[${time}] [${context}]`;
    let style = 'color: white; border-radius: 3px; padding: 2px 4px;';

    switch (level) {
        case LOG_LEVEL.DEBUG:
            style += 'background-color: #6c757d;'; // Gray
            console.debug(prefix, style, ...args);
            break;
        case LOG_LEVEL.INFO:
            style += 'background-color: #007bff;'; // Blue
            console.info(prefix, style, ...args);
            break;
        case LOG_LEVEL.WARN:
            style += 'background-color: #ffc107; color: black;'; // Yellow
            console.warn(prefix, style, ...args);
            break;
        case LOG_LEVEL.ERROR:
            style += 'background-color: #dc3545;'; // Red
            console.error(prefix, style, ...args);
            break;
        default:
            console.log(prefix, style, ...args);
    }
};

const createLogger = (context) => ({
    debug: (...args) => log(LOG_LEVEL.DEBUG, context, ...args),
    info: (...args) => log(LOG_LEVEL.INFO, context, ...args),
    warn: (...args) => log(LOG_LEVEL.WARN, context, ...args),
    error: (...args) => log(LOG_LEVEL.ERROR, context, ...args),
});

export default createLogger;