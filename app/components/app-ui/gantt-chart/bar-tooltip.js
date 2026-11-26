/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';
import {
  conflictingBlockers,
  blockerName,
} from 'prometheus/utils/gantt/conflicts';
import { issueTypeRecordLabel } from 'prometheus/utils/issue-status/label';
import { format, diff, parse } from 'prometheus/utils/date';
import { issueLinkGroups } from 'prometheus/utils/gantt/issue-links';

/**
 * The most rows a link group shows before "and N more".
 *
 * @property MAX_ROWS
 * @type Number
 */
export const MAX_ROWS = 3;

/**
 * The content of the shared Gantt bar tooltip for the hovered or focused issue: a header (#number link, status,
 * priority, type and subject), facts (assignee, dates, milestone, time from `@timeTotals`), the issue's links from
 * `@links` (conflict line, blocked by, blocks, split from/into, relates, parent and children from `@issues`) and
 * who modified it and when. The chart renders one of these and the bars point it at their issue.
 *
 * @class BarTooltip
 * @namespace Prometheus.Components.AppUi.GanttChart
 * @extends Glimmer.Component
 *
 * @example
 * <AppUi::GanttChart::BarTooltip @issue={{this.issue}} @timeTotals={{this.timeTotals}} @links={{this.links}}
 *   @issues={{this.allIssues}} />
 */
export default class BarTooltipComponent extends Component {
  /**
   * @property intl
   * @type {Prometheus.Services.intl}
   */
  @service intl;

  /**
   * The issue type's label, or null when the type is not loaded.
   *
   * @property typeLabel
   * @type String|null
   */
  get typeLabel() {
    let type = this.args.issue?.issuetype;
    return type?.name ? issueTypeRecordLabel(this.intl, type) : null;
  }

  /**
   * The issue's dates, "2 Dec – 4 Dec · 3 days", or "No dates".
   *
   * @property dates
   * @type String
   */
  get dates() {
    let { startDate, endDate } = this.args.issue ?? {};
    if (!startDate || !endDate) {
      return this.intl.t('components.gantt.tooltip.noDates');
    }
    let start = parse(String(startDate).slice(0, 10));
    let end = parse(String(endDate).slice(0, 10));
    return this.intl.t('components.gantt.tooltip.dateRange', {
      start: format(start, 'D MMM'),
      end: format(end, 'D MMM'),
      days: diff(end, start, 'days') + 1,
    });
  }

  /**
   * The issue's logged time, "2h spent of 6h · 33%", "2h spent" without an estimate, or "No time logged".
   *
   * @property time
   * @type String
   */
  get time() {
    let total = this.args.issue
      ? this.args.timeTotals?.get(this.args.issue.id)
      : null;
    let spent = total?.spent ?? 0;
    let estimated = total?.estimated ?? 0;
    if (estimated > 0) {
      return this.intl.t('components.gantt.tooltip.timeOf', {
        spent: this.duration(spent),
        estimated: this.duration(estimated),
        percent: Math.round((spent / estimated) * 100),
      });
    }
    if (spent > 0) {
      return this.intl.t('components.gantt.tooltip.timeSpent', {
        spent: this.duration(spent),
      });
    }
    return this.intl.t('components.gantt.tooltip.noTime');
  }

  /**
   * The schedule-conflict line ("Starts before #12 ends (5 Dec)"), or null when the issue does not start before an
   * open blocker ends.
   *
   * @property conflict
   * @type String|null
   */
  get conflict() {
    let lookup = this.args.links;
    let blockers = conflictingBlockers(this.args.issue, lookup);
    if (!blockers.length) {
      return null;
    }
    return this.intl.t('components.gantt.tooltip.conflict', {
      blocker: blockerName(blockers[0], lookup.projectId),
      date: format(parse(String(blockers[0].endDate).slice(0, 10)), 'D MMM'),
      others: blockers.length - 1,
    });
  }

  /**
   * The issue's link groups that have rows: `{ key, label, rows, more }`, each row `{ issue, name, withStatus }`,
   * at most `MAX_ROWS` rows per group and `more` the rest.
   *
   * @property linkGroups
   * @type Array
   */
  get linkGroups() {
    return issueLinkGroups(
      this.args.issue,
      this.args.links,
      this.args.issues,
    ).map((group) => ({
      key: group.key,
      label: this.intl.t(`components.gantt.tooltip.links.${group.key}`),
      rows: group.issues
        .slice(0, MAX_ROWS)
        .map((other) => ({
          issue: other,
          name: this.issueName(other),
          withStatus: group.withStatus,
        })),
      more: Math.max(0, group.issues.length - MAX_ROWS),
    }));
  }

  /**
   * Whether the Links section shows: the issue has a conflict or any link.
   *
   * @property hasLinks
   * @type Boolean
   */
  get hasLinks() {
    return Boolean(this.conflict) || this.linkGroups.length > 0;
  }

  /**
   * How a linked issue is named: `#number` in the chart's project, the project code otherwise.
   *
   * @method issueName
   * @param {Issue} other
   * @return {String}
   * @private
   */
  issueName(other) {
    let projectId = this.args.links?.projectId ?? this.args.issue?.projectId;
    return blockerName(other, projectId);
  }

  /**
   * Minutes as "2h", "1h 30m" or "45m".
   *
   * @method duration
   * @param {Number} minutes
   * @return {String}
   * @private
   */
  duration(minutes) {
    return this.intl.t('components.gantt.tooltip.duration', {
      hours: Math.floor(minutes / 60),
      minutes: minutes % 60,
    });
  }
}
