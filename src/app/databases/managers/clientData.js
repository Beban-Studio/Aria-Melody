import ClientInfoModel from '../schemas/clientSchema'; 
import * as logger from '../../utils/logger'; 

const dataId = 'global_bot_stats'; 

/**
 * Fetches the global client statistics document from the database.
 * If it doesn't exist, it creates a new one with default values.
 * @returns {Promise<import('mongoose').Document & YourClientInfoSchemaType | null>} The client stats document or null on error.
 */
export async function getClientStatsDocument() {
    try {
        let statsDoc = await ClientInfoModel.findById(dataId);

        if (!statsDoc) {
            logger.info(`No global stats document found. Creating new one with ID: ${dataId}.`);
            statsDoc = new ClientInfoModel({ _id: dataId });
            await statsDoc.save();
        }
        return statsDoc;
    } catch (error) {
        logger.error('Error fetching or creating client stats document:', error);
        return null;
    }
}

/**
 * Increments a specific count in the global client statistics.
 * @param {'messageCount' | 'commandCount' | 'trackCount' | 'playTime'} statName The name of the stat to increment.
 * @param {number} [incrementBy=1] The value to increment by. For playTime, this is milliseconds.
 */
export async function incrementClientStat(statName, incrementBy = 1) {
    if (!['messageCount', 'commandCount', 'trackCount', 'playTime'].includes(statName)) {
        logger.warn(`Attempted to increment invalid stat: ${statName}`);
        return;
    }

    try {
        const statsDoc = await getClientStatsDocument();
        if (statsDoc && statsDoc.counts) {
            statsDoc.counts[statName] = (statsDoc.counts[statName] || 0) + incrementBy;
            await statsDoc.save();
            logger.debug(`Incremented ${statName} by ${incrementBy}. New value: ${statsDoc.counts[statName]}`);
        } else if (statsDoc && !statsDoc.counts) { 
            logger.warn(`'counts' object missing on stats document. Re-initializing.`);
            statsDoc.counts = { messageCount: 0, commandCount: 0, trackCount: 0, playTime: 0 };
            statsDoc.counts[statName] = incrementBy;
            await statsDoc.save();
        } else {
            logger.error(`Could not retrieve stats document to increment ${statName}.`);
        }
    } catch (error) {
        logger.error(`Error incrementing client stat ${statName}:`, error);
    }
}

export function incrementMessageCount(count = 1) {
    return incrementClientStat('messageCount', count);
}

export function incrementCommandCount(count = 1) {
    return incrementClientStat('commandCount', count);
}

export function incrementTrackCount(count = 1) {
    return incrementClientStat('trackCount', count);
}

export function addPlayTime(durationMs) {
    if (typeof durationMs !== 'number' || durationMs <= 0) {
        logger.warn(`Invalid play time duration provided: ${durationMs}`);
        return;
    }
    return incrementClientStat('playTime', durationMs);
}