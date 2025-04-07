const { logger } = require("../../../utils/logger");

module.exports = async () => {
    process.on("unhandledRejection", (reason, promise) => {
        logger(`[AntiCrash] | [UnhandledRejection_Logs] | [START] :`, "error");
        logger(`Unhandled Rejection at: ${promise}`, "error");
        logger(`Reason: ${reason}`, "error");
        logger(`[AntiCrash] | [UnhandledRejection_Logs] | [END] :`, "error");
        
        // Optionally exit the process
        // process.exit(1);
    });

    process.on("uncaughtException", (err, origin) => {
        logger(`[AntiCrash] | [UncaughtException_Logs] | [START] :`, "error");
        logger(`Uncaught exception: ${err}`, "error");
        logger(`Exception origin: ${origin}`, "error");
        logger(`[AntiCrash] | [UncaughtException_Logs] | [END] :`, "error");
        
        // Optionally exit the process
        // process.exit(1);
    });

    process.on("uncaughtExceptionMonitor", (err, origin) => {
        logger(`[AntiCrash] | [UncaughtExceptionMonitor_Logs] | [START] :`, "error");
        logger(`Uncaught exception monitor: ${err}`, "error");
        logger(`Exception origin: ${origin}`, "error");
        logger(`[AntiCrash] | [UncaughtExceptionMonitor_Logs] | [END] :`, "error");
    });

    logger("Successfully loaded AntiCrash", "debug");
};