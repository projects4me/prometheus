import Service from "@ember/service";

/* global Messenger */

/**
 * Route-scoped persistent reload prompts for live events that cannot be safely
 * merged into the currently loaded collection (e.g. a new issue on a filtered
 * board). One prompt is kept per owner; a second `show` for the same owner is
 * ignored until `clear` runs.
 *
 * @class LiveReloadPromptService
 * @namespace Prometheus.Services
 * @extends Ember.Service
 * @public
 */
export default class LiveReloadPromptService extends Service {
  /**
   * Active Messenger instances keyed by owner (controller / service).
   *
   * @property prompts
   * @type Map
   * @for LiveReloadPromptService
   * @private
   */
  prompts = new Map();

  /**
   * Show a persistent "Reload" / "Dismiss" Messenger for this owner. No-ops
   * when a prompt is already open for the same owner.
   *
   * @method show
   * @param {Object} owner Controller or service that owns the prompt
   * @param {Function} refresh Async callback invoked when the user clicks Reload
   * @param {String} [message] Messenger body text
   * @returns {Object|undefined} The Messenger instance, or the existing one
   * @public
   */
  show(owner, refresh, message = "New data is available. Reload this view?") {
    if (!owner || typeof refresh !== "function" || this.prompts.has(owner)) {
      return this.prompts.get(owner);
    }

    let messenger = new Messenger().post({
      message,
      type: "info",
      showCloseButton: false,
      hideAfter: false,
      actions: {
        reload: {
          label: "Reload",
          action: async () => {
            try {
              await refresh();
              this.clear(owner);
            } catch (error) {
              messenger.update({
                message: "Reload failed. Please try again.",
                type: "error",
              });
              console.error("Live reload failed", error);
            }
          },
        },
        dismiss: {
          label: "Dismiss",
          action: () => {
            this.clear(owner);
          },
        },
      },
    });

    this.prompts.set(owner, messenger);
    return messenger;
  }

  /**
   * Cancel and remove the prompt for the given owner, if any.
   *
   * @method clear
   * @param {Object} owner Controller or service that owns the prompt
   * @returns {void}
   * @public
   */
  clear(owner) {
    let messenger = this.prompts.get(owner);
    if (!messenger) {
      return;
    }
    this.prompts.delete(owner);
    messenger.cancel();
  }

  /**
   * Cancel every open prompt when the service is destroyed.
   *
   * @method willDestroy
   * @returns {void}
   * @public
   */
  willDestroy() {
    super.willDestroy(...arguments);
    this.prompts.forEach((messenger) => messenger.cancel());
    this.prompts.clear();
  }
}
