/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

const WORKING_SUFFIX = 'is working on it.';

/**
 * Whether an idea message tells that the agent is working. The agent posts it as the kind working, older
 * threads have it as a system message ending with the same words. Shared by the message item and the
 * conversation box so both agree on what a working message is.
 *
 * @method isWorkingMessage
 * @param {Object} message
 * @return {Boolean}
 */
export function isWorkingMessage(message) {
    return message.kind === 'working'
        || (message.kind === 'system' && String(message.body ?? '').trim().endsWith(WORKING_SUFFIX));
}
