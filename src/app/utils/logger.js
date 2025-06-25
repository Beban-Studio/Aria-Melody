import { createWriteStream, WriteStream } from 'node:fs';
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { useLogger as useCommandKitLoggerInternal } from 'commandkit/logger';
import fs from 'node:fs/promises';
import path from 'node:path';
import util from 'node:util';
import colors from 'colors';
import moment from 'moment';

const ASCII_BANNER_CONSOLE = `
                   ${colors.cyan('█████')}  ${colors.cyan('██████')}  ${colors.cyan('██')}  ${colors.cyan('█████')}
                  ${colors.cyan('██   ██')} ${colors.cyan('██   ██')} ${colors.cyan('██')} ${colors.cyan('██   ██')}
                  ${colors.cyan('███████')} ${colors.cyan('██████')}  ${colors.cyan('██')} ${colors.cyan('███████')}
                  ${colors.cyan('██   ██')} ${colors.cyan('██   ██')} ${colors.cyan('██')} ${colors.cyan('██   ██')}
${colors.grey('┏╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾┓')}
${colors.grey('┃')}          ${colors.yellow('</>')} ${colors.white('All rights reserved to Beban Studio')}             ${colors.grey('┃')}
${colors.grey('┃')}    ${colors.red('*')}${colors.white('Please respect our work by not removing the credits')}      ${colors.grey('┃')}
${colors.grey('┗╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾┛')}
`;

const ASCII_BANNER_FILE = `
                   █████  ██████  ██  █████
                  ██   ██ ██   ██ ██ ██   ██
                  ███████ ██████  ██ ███████
                  ██   ██ ██   ██ ██ ██   ██
┏╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾┓
┃          </> All rights reserved to Beban Studio             ┃
┃    *Please respect our work by not removing the credits      ┃
┗╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾┛
`;

let S_loggerConfig = {};
let S_webhookClient = null;
let S_currentLogStream = null;
let S_currentLogFilePath = null;
let S_currentLogDate = null;
let S_isInitialized = false;
let S_commandKitLoggerPatched = false;

const defaultLoggerOptions = {
  logDirectory: path.join(process.cwd(), 'logs'),
  logFileName: 'app.log',
  maxFileSizeMB: 10,
  maxRotatedFiles: 5,
  dateFormat: 'YYYY-MM-DD',
  timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS',
  consoleLogLevel: 'debug',
  fileLogLevel: 'debug',
  webhookUrl: null,
  webhookLogLevels: ['error', 'fatal'],
  includeCallerInfo: false, 
  replaceCommandKitLogger: true,
  commandKitLogPrefix: '[CK]',
  colors: {
    INFO: 'cyan', WARN: 'yellow', ERROR: 'red',
    DEBUG: 'blue', FATAL: 'magenta', SUCCESS: 'green',
	},
  prefixes: {
    INFO: '[INFO]   :', WARN: '[WARN]   :', ERROR: '[ERROR]  :',
    DEBUG: '[DEBUG]  :', FATAL: '[FATAL]  :', SUCCESS: '[SUCCESS]:',
	},
  logLevels: {
    debug: 0, info: 1, success: 2,
    warn: 3, error: 4, fatal: 5,
  }
};

function _getFormattedTimestamp() { return moment().format(S_loggerConfig.timestampFormat); }
function _getCurrentDateFormatted() { return moment().format(S_loggerConfig.dateFormat); }
function _getDailyLogDirectory() { return path.join(S_loggerConfig.logDirectory, _getCurrentDateFormatted()); }

async function _ensureDirectoryExists(dirPath) {
	try { await fs.mkdir(dirPath, { recursive: true }); }
  catch (error) { if (error.code !== 'EEXIST') { _printToConsole_internal('FATAL', `Failed to create log directory ${dirPath}: ${error.message}`); throw error; } }
}

function _getCallerInfo() {
  const err = new Error();
  const stack = err.stack.split('\n');
  if (stack.length > 4) { 
    const callerLine = stack[4];
    const match = callerLine.match(/at .*?\((.*?):(\d+):\d+\)|at (.*?):(\d+):\d+/);
    if (match) {
      const filePath = match[1] || match[3];
            const lineNumber = match[2] || match[4];
            if (filePath) {
                const relativePath = path.relative(process.cwd(), filePath);
                return `[${relativePath}:${lineNumber}]`;
            }
        }
        return `[${callerLine.trim()}]`; 
    }
    return '[unknown file]';
}


async function _openLogFile() {
    if (!S_isInitialized) return;
    const dailyDir = _getDailyLogDirectory();
    await _ensureDirectoryExists(dailyDir);
    S_currentLogFilePath = path.join(dailyDir, S_loggerConfig.logFileName);
    S_currentLogDate = _getCurrentDateFormatted();
    if (S_currentLogStream) { S_currentLogStream.end(); S_currentLogStream = null; }
    try {
        S_currentLogStream = createWriteStream(S_currentLogFilePath, { flags: 'a' });
        S_currentLogStream.on('error', (err) => { _printToConsole_internal('FATAL', `Log file stream error for ${S_currentLogFilePath}: ${err.message}`); S_currentLogStream = null; });
        if (S_currentLogStream && !S_currentLogStream.destroyed) {
            S_currentLogStream.write(ASCII_BANNER_FILE + '\n\n', (err) => { if (err) { _printToConsole_internal('ERROR', `Failed to write banner to log file ${S_currentLogFilePath}: ${err.message}`); } });
        }
    } catch (error) { _printToConsole_internal('FATAL', `Failed to open log file ${S_currentLogFilePath}: ${error.message}`); S_currentLogStream = null; }
}

async function _checkAndRotateLogFile() {
    if (!S_isInitialized || !S_currentLogFilePath || !S_currentLogStream) { await _openLogFile(); if (!S_currentLogStream) return; }
    if (S_currentLogDate !== _getCurrentDateFormatted()) { _printToConsole_internal('INFO', `Date changed. Switching to new log file for ${_getCurrentDateFormatted()}.`); await _openLogFile(); if (S_currentLogFilePath) { _printToConsole_internal('INFO', `Logging to file: ${S_currentLogFilePath}`); } return; }
    try {
        const stats = await fs.stat(S_currentLogFilePath);
        const fileSizeMB = stats.size / (1024 * 1024);
        if (fileSizeMB >= S_loggerConfig.maxFileSizeMB) {
            _printToConsole_internal('INFO', `Log file ${S_currentLogFilePath} (${fileSizeMB.toFixed(2)}MB) reached max size. Rotating...`);
            if (S_currentLogStream) { S_currentLogStream.end(); S_currentLogStream = null; }
            const dailyDir = _getDailyLogDirectory();
            for (let i = S_loggerConfig.maxRotatedFiles - 1; i >= 0; i--) {
                const baseName = S_loggerConfig.logFileName.replace(/\.log$/, '');
                const currentRotatedPath = path.join(dailyDir, `${baseName}.${i || ''}.log`.replace('..log', '.log'));
                const nextRotatedPath = path.join(dailyDir, `${baseName}.${i + 1}.log`);
                try { await fs.access(currentRotatedPath); if (i === S_loggerConfig.maxRotatedFiles - 1) { await fs.unlink(currentRotatedPath); _printToConsole_internal('DEBUG', `Deleted oldest rotated log: ${currentRotatedPath}`); } else { await fs.rename(currentRotatedPath, nextRotatedPath); _printToConsole_internal('DEBUG', `Renamed ${currentRotatedPath} to ${nextRotatedPath}`); } }
                catch (err) { if (err.code !== 'ENOENT') { _printToConsole_internal('WARN', `Error during log rotation for ${currentRotatedPath}: ${err.message}`); } }
            }
            const firstRotatedPath = path.join(dailyDir, `${S_loggerConfig.logFileName.replace(/\.log$/, '')}.1.log`);
            await fs.rename(S_currentLogFilePath, firstRotatedPath);
            _printToConsole_internal('INFO', `Rotated ${S_currentLogFilePath} to ${firstRotatedPath}`);
            await _openLogFile(); if (S_currentLogFilePath) { _printToConsole_internal('INFO', `Logging to file: ${S_currentLogFilePath}`); }
        }
    } catch (error) {
        if (error.code === 'ENOENT') { await _openLogFile(); if (S_currentLogFilePath) { _printToConsole_internal('INFO', `Logging to file: ${S_currentLogFilePath}`); } }
        else { _printToConsole_internal('ERROR', `Error checking/rotating log file ${S_currentLogFilePath}: ${error.message} \n${error.stack}`); }
    }
}

function _formatArgs(args) { return args.map(arg => { if (arg instanceof Error) { return arg.stack || arg.message; } return arg; }).map(arg => typeof arg === 'string' ? arg : util.inspect(arg, { depth: null, colors: false })).join(' '); }

function _printToConsole_internal(level, messageContent, callerInfo = '') {
    const effectiveConfig = S_isInitialized ? S_loggerConfig : defaultLoggerOptions;
    const upperLevel = level.toUpperCase();
    const colorFn = colors[effectiveConfig.colors[upperLevel] || 'white'] || colors.white;
    const prefix = effectiveConfig.prefixes[upperLevel] || `[${upperLevel}]`;
    const timestamp = moment().format(effectiveConfig.timestampFormat);
    const callerInfoString = callerInfo && S_loggerConfig.includeCallerInfo ? `${colors.magenta(callerInfo)} ` : ''; 
    const consoleOutput = `${colors.gray(timestamp)} ${callerInfoString}${colorFn(prefix)} ${colorFn(messageContent)}`;
    if (effectiveConfig.logLevels[level.toLowerCase()] >= effectiveConfig.logLevels[effectiveConfig.consoleLogLevel.toLowerCase()]) {
        if (upperLevel === 'ERROR' || upperLevel === 'FATAL') console.error(consoleOutput);
        else if (upperLevel === 'WARN') console.warn(consoleOutput);
        else console.log(consoleOutput);
    }
}

async function _writeToFile(level, fileMessageContent, callerInfo = '') {
    if (!S_isInitialized || S_loggerConfig.logLevels[level.toLowerCase()] < S_loggerConfig.logLevels[S_loggerConfig.fileLogLevel.toLowerCase()]) { return; }
    await _checkAndRotateLogFile();
    if (S_currentLogStream && !S_currentLogStream.destroyed) {
        const timestamp = _getFormattedTimestamp();
        const upperLevel = level.toUpperCase();
        const prefix = S_loggerConfig.prefixes[upperLevel] || `[${upperLevel}]`;
        const callerInfoString = callerInfo && S_loggerConfig.includeCallerInfo ? `${callerInfo.replace(/\x1b\[[0-9;]*m/g, '')} ` : ''; 
        const logEntry = `${timestamp} ${callerInfoString}${prefix} ${fileMessageContent}\n`;
        S_currentLogStream.write(logEntry, (err) => {
            if (err) { _printToConsole_internal('FATAL', `Failed to write to log file ${S_currentLogFilePath}: ${err.message}. Log content: ${fileMessageContent}`); S_currentLogStream = null; _openLogFile().catch(e => _printToConsole_internal('FATAL', `Failed to re-open log file after write error: ${e.message}`)); }
        });
    } else { _printToConsole_internal('ERROR', `Log stream not available for ${S_currentLogFilePath}. Attempting to reopen. Log content lost: ${fileMessageContent}`); await _openLogFile(); }
}

async function _sendWebhook(level, title, description) {
    if (!S_isInitialized || !S_webhookClient || !S_loggerConfig.webhookLogLevels.includes(level.toLowerCase())) { return; }
    const upperLevel = level.toUpperCase();
    const colorMap = { INFO: 0x2B2D31, WARN: 0xFFFF00, ERROR: 0xFF0000, DEBUG: 0x5865F2, FATAL: 0xFF00FF, SUCCESS: 0x00FF00, };
    try {
        const embed = new EmbedBuilder().setColor(colorMap[upperLevel] || 0x808080).setTitle(title || `${upperLevel} Log`).setTimestamp();
        if (description.length > 1950) {
            const timestamp = _getFormattedTimestamp(); const fullMessage = `${timestamp} ${description}`; const buffer = Buffer.from(fullMessage, 'utf-8');
            await S_webhookClient.send({ content: `${title || upperLevel + ' Log'} (Log exceeds Discord embed character limit. See attached file.)`, files: [{ name: `log-${moment().format('YYYY-MM-DD_HH-mm-ss')}.txt`, attachment: buffer }], });
        } else { embed.setDescription(`\`\`\`\n${description.substring(0, 1950)}\n\`\`\``); await S_webhookClient.send({ embeds: [embed] }); }
    } catch (error) { _printToConsole_internal('ERROR', `Failed to send webhook message: ${error.message}`); }
}

async function _internalLog(level, ...args) {
    const callerInfoForUninitialized = defaultLoggerOptions.includeCallerInfo ? _getCallerInfo() : ''; 
    if (!S_isInitialized) {
        const tsFormat = (S_loggerConfig && S_loggerConfig.timestampFormat) ? S_loggerConfig.timestampFormat : defaultLoggerOptions.timestampFormat;
        const callerStr = callerInfoForUninitialized ? `${colors.magenta(callerInfoForUninitialized)} ` : '';
        console.warn(`${colors.yellow(`[${moment().format(tsFormat)}]:`)} ${callerStr}${colors.yellow('Logger not initialized. Call initializeLogger() first. Message:')}`, ...args);
        return;
    }
    const messageContent = _formatArgs(args);
    const callerInfo = S_loggerConfig.includeCallerInfo ? _getCallerInfo() : '';
    _printToConsole_internal(level, messageContent, callerInfo);
    await _writeToFile(level, messageContent, callerInfo);
    await _sendWebhook(level, null, messageContent);
}

/**
 * @typedef {object} LoggerInitializationOptions
 * @property {string} [logDirectory]
 * @property {string} [logFileName]
 * @property {number} [maxFileSizeMB]
 * @property {number} [maxRotatedFiles]
 * @property {string} [dateFormat]
 * @property {string} [timestampFormat]
 * @property {'debug'|'info'|'success'|'warn'|'error'|'fatal'} [consoleLogLevel]
 * @property {'debug'|'info'|'success'|'warn'|'error'|'fatal'} [fileLogLevel]
 * @property {string|null} [webhookUrl]
 * @property {Array<'debug'|'info'|'success'|'warn'|'error'|'fatal'>} [webhookLogLevels]
 * @property {boolean} [includeCallerInfo=false] - Whether to include caller file and line number in logs.
 * @property {boolean} [replaceCommandKitLogger=true] - Whether to replace CommandKit's internal logger.
 * @property {string} [commandKitLogPrefix='[CK]'] - Prefix for logs originating from CommandKit.
 * @property {object} [colors]
 * @property {object} [prefixes]
 */

export async function initializeLogger(options = {}) {
    if (S_isInitialized) { _printToConsole_internal('WARN', 'Logger already initialized. Re-initialization attempt ignored.'); return; }
    console.log(ASCII_BANNER_CONSOLE);
    const mergedOptions = {
        ...defaultLoggerOptions, ...options,
        colors: { ...defaultLoggerOptions.colors, ...(options.colors || {}) },
        prefixes: { ...defaultLoggerOptions.prefixes, ...(options.prefixes || {}) },
        logLevels: { ...defaultLoggerOptions.logLevels, ...(options.logLevels || {}) },
    };
    S_loggerConfig = mergedOptions; 

    if (S_loggerConfig.webhookUrl) {
        try { S_webhookClient = new WebhookClient({ url: S_loggerConfig.webhookUrl }); _printToConsole_internal('INFO', 'WebhookClient initialized.'); }
        catch (error) { _printToConsole_internal('FATAL', `Failed to initialize WebhookClient: ${error.message}`); S_webhookClient = null; }
    }

    S_isInitialized = true; 
    try {
        await _ensureDirectoryExists(S_loggerConfig.logDirectory);
        await _openLogFile();
        if (S_currentLogFilePath) { _printToConsole_internal('INFO', `Logging to file: ${S_currentLogFilePath}`); }
        if (S_loggerConfig.replaceCommandKitLogger && !S_commandKitLoggerPatched) {
            try {
                const prefix = S_loggerConfig.commandKitLogPrefix;
                const commandKitLoggerAdapter = {
                    log: (...args) => { info(prefix, ...args); }, error: (...args) => { error(prefix, ...args); },
                    warn: (...args) => { warn(prefix, ...args); }, info: (...args) => { info(prefix, ...args); },
                    debug: (...args) => { debug(prefix, ...args); }
                };
                useCommandKitLoggerInternal(commandKitLoggerAdapter);
                _printToConsole_internal('INFO', "CommandKit logger has been replaced successfully.");
                S_commandKitLoggerPatched = true;
            } catch (ckError) { _printToConsole_internal('ERROR', `Failed to replace CommandKit logger: ${ckError.message}. CommandKit logs will not be handled by this logger.`); }
        }
        _printToConsole_internal('SUCCESS', 'Logger initialized successfully.');
    } catch (error) { _printToConsole_internal('FATAL', `Critical error during logger initialization: ${error.message}`); S_isInitialized = false; }
}

export function log(level, ...args) { const normalizedLevel = String(level).toLowerCase(); const logLevels = (S_loggerConfig && S_loggerConfig.logLevels) ? S_loggerConfig.logLevels : defaultLoggerOptions.logLevels; if (!logLevels.hasOwnProperty(normalizedLevel)) { _internalLog('warn', `Unknown log level: ${level}. Original message:`, ...args); return; } _internalLog(normalizedLevel, ...args); }
export function info(...args) { _internalLog('info', ...args); }
export function warn(...args) { _internalLog('warn', ...args); }
export function error(...args) { _internalLog('error', ...args); }
export function debug(...args) { _internalLog('debug', ...args); }
export function fatal(...args) { _internalLog('fatal', ...args); }
export function success(...args) { _internalLog('success', ...args); }

export async function closeLogger() {
    if (!S_isInitialized) return; _printToConsole_internal('INFO', 'Closing logger...');
    if (S_currentLogStream) { await new Promise(resolve => { S_currentLogStream.end(() => { _printToConsole_internal('INFO', 'Log stream closed.'); resolve(); }); }); S_currentLogStream = null; }
    if (S_webhookClient) { S_webhookClient.destroy(); _printToConsole_internal('INFO', 'Webhook client destroyed.'); }
    S_isInitialized = false; _printToConsole_internal('INFO', 'Logger closed.');
}