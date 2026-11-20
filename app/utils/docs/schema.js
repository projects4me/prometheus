/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { Mark, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

/**
 * The attributes shared by both suggestion marks.
 *
 * @property SUGGESTION_ATTRIBUTES
 * @type Array
 * @final
 */
export const SUGGESTION_ATTRIBUTES = [
  'id',
  'source',
  'authorId',
  'actedFor',
  'requestId',
  'reason',
  'createdAt',
];

/**
 * Builds a suggestion mark rendered as the given tag with data-suggestion-* attributes.
 *
 * @method buildSuggestionMark
 * @param {String} name the mark name
 * @param {String} tag the HTML tag (ins or del)
 * @returns {Mark}
 * @private
 */
function buildSuggestionMark(name, tag) {
  return Mark.create({
    name,
    inclusive: false,
    priority: 101, // above Strike, which also parses <del>

    addAttributes() {
      const attributes = {};
      SUGGESTION_ATTRIBUTES.forEach((attribute) => {
        const dataName =
          attribute === 'id'
            ? 'data-suggestion-id'
            : `data-suggestion-${attribute.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
        attributes[attribute] = {
          default: null,
          parseHTML: (element) => element.getAttribute(dataName),
          renderHTML: (attrs) =>
            attrs[attribute] == null ? {} : { [dataName]: attrs[attribute] },
        };
      });
      return attributes;
    },

    parseHTML() {
      return [{ tag: `${tag}[data-suggestion-id]` }];
    },

    renderHTML({ HTMLAttributes }) {
      return [
        tag,
        mergeAttributes({ class: 'doc-suggestion' }, HTMLAttributes),
        0,
      ];
    },
  });
}

/**
 * A suggested insertion, rendered as <ins data-suggestion-id>.
 *
 * @property SuggestionInsert
 * @type Mark
 */
export const SuggestionInsert = buildSuggestionMark('suggestionInsert', 'ins');

/**
 * A suggested deletion, rendered as <del data-suggestion-id>.
 *
 * @property SuggestionDelete
 * @type Mark
 */
export const SuggestionDelete = buildSuggestionMark('suggestionDelete', 'del');

/**
 * The single list of editor extensions. The collab server builds the stored HTML from the same list
 * (hermes/collab/schema.js): a change here needs the same change there.
 *
 * @method docsExtensions
 * @returns {Array} the extensions, a fresh array on every call
 * @public
 */
export function docsExtensions() {
  return [
    StarterKit.configure({ underline: false, link: false }),
    Underline,
    Link.configure({ openOnClick: false }),
    Table,
    TableRow,
    TableHeader,
    TableCell,
    TaskList,
    TaskItem.configure({ nested: true }),
    SuggestionInsert,
    SuggestionDelete,
  ];
}
