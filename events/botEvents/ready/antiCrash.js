const { logger } = require("../../../utils/logger");

module.exports = async () => {
    process.on("unhandledRejection", async (reason, promise) => {
        console.log("[AntiCrash] | [UnhandledRejection_Logs] | [START] :");
        console.log("Unhandled Rejection at:", promise);
        console.log("reason:", reason);
        console.log("[AntiCrash] | [UnhandledRejection_Logs] | [END] :");
    });

    process.on("uncaughtException", async (err, origin) => {
        console.log("[AntiCrash] | [UncaughtException_Logs] | [START] :");
        console.log(`Uncaught exception: ${err}`);
        console.log(`Exception origin: ${origin}`);
        console.log("[AntiCrash] | [UncaughtException_Logs] | [END] :");
    });

    process.on("uncaughtExceptionMonitor", async (err, origin) => {
        console.log("[AntiCrash] | [UncaughtExceptionMonitor_Logs] | [START] :");
        console.log(`Uncaught exception monitor: ${err}`);
        console.log(`Exception origin: ${origin}`);
        console.log("[AntiCrash] | [UncaughtExceptionMonitor_Logs] | [END] :");
    });

    logger("Successfully loadded Anticrash");
};