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
 * @param {'success'|'error'} [type='success']
 */
export function postToast(intl, messageKey, type = 'success') {
	new Messenger().post({
		message: intl.t(messageKey),
		type,
		showCloseButton: true,
	});
}
