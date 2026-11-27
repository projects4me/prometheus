/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * A display-only scheduler for the Gantt: works out each issue's planned start and end in working time from its
 * dates, its estimate and the issues blocking it. Nothing it returns is saved.
 *
 * @module GanttSchedule
 */

import {
  addWorkingHours,
  nextWorkingMoment,
  previousWorkingMoment,
  workDayEnd,
  workDayStart,
  workingHoursBetween,
} from 'prometheus/utils/gantt/working-time';

/**
 * The shortest planned duration, in working hours, of an issue without an estimate.
 *
 * @property MIN_DURATION_HOURS
 * @type Number
 */
export const MIN_DURATION_HOURS = 0.5;

/**
 * An issue's working window: its start date 09:00 to its end date 18:00, moved inside working time (a weekend
 * start date starts on Monday, a weekend end date ends on Friday).
 *
 * @function issueWindow
 * @param {Object} issue `{ startDate, endDate }`
 * @returns {Object|null} `{ start, end, hours, key }`, or null when a date is missing
 */
export function issueWindow(issue) {
  let start = workDayStart(issue?.startDate);
  let end = workDayEnd(issue?.endDate);
  if (!start || !end) {
    return null;
  }
  start = nextWorkingMoment(start);
  end = previousWorkingMoment(end);
  return {
    start,
    end,
    hours: workingHoursBetween(start, end),
    key: `${start.getTime()}-${end.getTime()}`,
  };
}

/**
 * Orders the nodes so every blocker comes before what it blocks. A cycle (which Gaia refuses, but bad data can
 * hold) is broken by dropping the links into the first remaining node, and logged.
 *
 * @function topologicalOrder
 * @param {String[]} ids Node ids, in input order
 * @param {Map} incoming id → Set of blocker ids
 * @returns {Object} `{ order, incoming }`: the order and the incoming links that were kept
 * @private
 */
function topologicalOrder(ids, incoming) {
  let kept = new Map(ids.map((id) => [id, new Set(incoming.get(id))]));
  let outgoing = new Map(ids.map((id) => [id, []]));
  kept.forEach((sources, target) =>
    sources.forEach((source) => outgoing.get(source).push(target)),
  );
  let waiting = new Map(ids.map((id) => [id, kept.get(id).size]));
  let done = new Set();
  let order = [];
  let release = (id) => {
    let queue = [id];
    while (queue.length) {
      let next = queue.shift();
      done.add(next);
      order.push(next);
      for (let target of outgoing.get(next)) {
        if (kept.get(target).has(next)) {
          waiting.set(target, waiting.get(target) - 1);
          if (waiting.get(target) === 0 && !done.has(target)) {
            queue.push(target);
          }
        }
      }
    }
  };
  ids
    .filter((id) => waiting.get(id) === 0)
    .forEach((id) => !done.has(id) && release(id));
  while (order.length < ids.length) {
    let stuck = ids.find((id) => !done.has(id));
    let dropped = [...kept.get(stuck)].filter((source) => !done.has(source));
    Logger.warn(
      'GanttSchedule: blocks links form a cycle; ignoring the links into',
      stuck,
      'from',
      dropped,
    );
    dropped.forEach((source) => kept.get(stuck).delete(source));
    waiting.set(stuck, 0);
    release(stuck);
  }
  return { order, incoming: kept };
}

/**
 * Per node, the best (most estimated hours) path for each count of unestimated issues, over the paths that end at
 * the node (walking `order` with the `before` links) and include it.
 *
 * @function bestPaths
 * @param {String[]} order Node ids, each after the nodes in its `before` sets
 * @param {Map} before id → Set of neighbour ids the paths come from
 * @param {Map} nodes id → `{ estimateHours }`
 * @returns {Map} id → Map(unestimated count → estimated hours)
 * @private
 */
function bestPaths(order, before, nodes) {
  let best = new Map();
  for (let id of order) {
    let own = nodes.get(id).estimateHours;
    let unestimated = own === null ? 1 : 0;
    let estimated = own ?? 0;
    let paths = new Map([[unestimated, estimated]]);
    for (let neighbour of before.get(id)) {
      best.get(neighbour).forEach((hours, count) => {
        let key = count + unestimated;
        paths.set(
          key,
          Math.max(paths.get(key) ?? -Infinity, hours + estimated),
        );
      });
    }
    best.set(id, paths);
  }
  return best;
}

/**
 * The planned duration of each unestimated issue: over the blocks-chains through it whose issues all share its
 * window, the tightest share of the window, i.e. the window's hours minus the chain's estimates, split equally
 * among the chain's unestimated issues. An issue on no such chain keeps its whole window.
 *
 * @function sharedDurations
 * @param {String[]} order Topological order of the scheduled issues
 * @param {Map} incoming id → Set of kept blocker ids
 * @param {Map} nodes id → `{ estimateHours, window }`
 * @returns {Map} id → hours, for the unestimated issues
 * @private
 */
function sharedDurations(order, incoming, nodes) {
  let sameWindow = (a, b) =>
    nodes.get(a).window.key === nodes.get(b).window.key;
  let before = new Map(order.map((id) => [id, new Set()]));
  let after = new Map(order.map((id) => [id, new Set()]));
  incoming.forEach((sources, target) => {
    sources.forEach((source) => {
      if (sameWindow(source, target)) {
        before.get(target).add(source);
        after.get(source).add(target);
      }
    });
  });
  let ending = bestPaths(order, before, nodes);
  let starting = bestPaths([...order].reverse(), after, nodes);
  let durations = new Map();
  for (let id of order) {
    let node = nodes.get(id);
    if (node.estimateHours !== null) {
      continue;
    }
    let share = Infinity;
    ending.get(id).forEach((endHours, endCount) => {
      starting.get(id).forEach((startHours, startCount) => {
        // the issue is on both halves: count it, and its zero estimate, once
        let count = endCount + startCount - 1;
        share = Math.min(
          share,
          (node.window.hours - endHours - startHours) / count,
        );
      });
    });
    durations.set(id, Math.max(MIN_DURATION_HOURS, share));
  }
  return durations;
}

/**
 * Works out each dated issue's planned start and end in working time.
 *
 * - Duration: the estimate when there is one, otherwise the issue's share of its window (see `sharedDurations`),
 *   never below MIN_DURATION_HOURS.
 * - Planned start: the later of the window start and the latest planned end of its blockers on the chart.
 * - Planned end: planned start plus the duration in working time; `pushed` when it falls after the window end.
 *
 * Issues without a start or end date are skipped, and so are links to them.
 *
 * @function schedule
 * @param {Object[]} issues `{ id, startDate, endDate, estimateHours }`, `estimateHours` null when not estimated
 * @param {Object[]} blocksLinks `{ sourceId, targetId }`: the source issue blocks the target issue
 * @returns {Map} issue id (String) → `{ plannedStart, plannedEnd, durationHours, pushed }`
 */
export function schedule(issues = [], blocksLinks = []) {
  let nodes = new Map();
  for (let issue of issues) {
    let window = issueWindow(issue);
    if (window && !nodes.has(String(issue.id))) {
      let estimate = Number(issue.estimateHours);
      let estimateHours =
        issue.estimateHours !== null &&
        issue.estimateHours !== undefined &&
        estimate > 0
          ? estimate
          : null;
      nodes.set(String(issue.id), { window, estimateHours });
    }
  }
  let ids = [...nodes.keys()];
  let incoming = new Map(ids.map((id) => [id, new Set()]));
  for (let link of blocksLinks) {
    let source = String(link?.sourceId);
    let target = String(link?.targetId);
    if (source !== target && nodes.has(source) && nodes.has(target)) {
      incoming.get(target).add(source);
    }
  }
  let sorted = topologicalOrder(ids, incoming);
  let shares = sharedDurations(sorted.order, sorted.incoming, nodes);
  let result = new Map();
  for (let id of sorted.order) {
    let { window, estimateHours } = nodes.get(id);
    let durationHours = estimateHours ?? shares.get(id);
    let start = window.start;
    for (let blocker of sorted.incoming.get(id)) {
      let blockerEnd = result.get(blocker).plannedEnd;
      if (blockerEnd > start) {
        start = blockerEnd;
      }
    }
    let plannedStart = nextWorkingMoment(start);
    let plannedEnd = addWorkingHours(plannedStart, durationHours);
    result.set(id, {
      plannedStart,
      plannedEnd,
      durationHours,
      pushed: plannedEnd > window.end,
    });
  }
  return result;
}
