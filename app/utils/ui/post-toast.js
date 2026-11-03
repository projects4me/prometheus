/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Posts a translated notification via Messenger.
 *
 * @function postToast
 * @namespace Prometheus.Utils
 * @module Ui
 * @param {import('@ember/service').default} intl
 * @param {string} messageKey
 * @param {'success'|'error'|'info'} [type='success']
 * @param {Object} [values] Interpolation values for the message (escaped: they may hold user names)
 */
export function postToast(intl, messageKey, type = 'success', values = {}) {
	new Messenger().post({
		message: intl.t(messageKey, values),
		type,
		showCloseButton: true,
		escapeText: true,
	});
}
