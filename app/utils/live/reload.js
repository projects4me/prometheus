/**
 * Returns true when an error represents Ember's TransitionAborted, which can
 * occur when router.refresh() is superseded even though the model updated.
 *
 * @method isTransitionAborted
 * @param {Object} error
 * @returns {Boolean}
 * @public
 */
export function isTransitionAborted(error) {
  if (!error) {
    return false;
  }

  return (
    error.name === "TransitionAborted"
    || error.message === "TransitionAborted"
    || (typeof error.message === "string" && error.message.includes("TransitionAborted"))
  );
}

/**
 * Refreshes the current route, treating TransitionAborted as success when the
 * underlying model refresh completed before navigation was superseded.
 *
 * @method refreshView
 * @param {Object} router Ember router service
 * @returns {Promise<void>}
 * @public
 */
export async function refreshView(router) {
  try {
    await router.refresh();
  } catch (error) {
    if (isTransitionAborted(error)) {
      console.info("Live reload: transition aborted; treating as successful refresh");
      return;
    }
    throw error;
  }
}
