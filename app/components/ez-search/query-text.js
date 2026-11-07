/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { lex } from 'prometheus/utils/query/lexer';

/**
 * The formatted query, shown when the search bar is not focused. The lexer's tokens give fields,
 * operators and and/or keywords their colour; everything is rendered as plain text.
 *
 * Arguments: `@text` and `@schema`.
 *
 * @class QueryText
 * @namespace Prometheus.Components.EzSearch
 * @extends Component
 */
export default class EzSearchQueryTextComponent extends Component {
    /**
     * The text cut into `{text, kind}` parts that cover all of it, gaps included.
     *
     * @property parts
     * @type Array
     */
    get parts() {
        let text = String(this.args.text ?? '');
        let parts = [];
        let at = 0;

        lex(text, this.args.schema).forEach((token) => {
            if (token.start > at) {
                parts.push({ text: text.slice(at, token.start), kind: 'gap' });
            }
            parts.push({ text: text.slice(token.start, token.end), kind: token.kind });
            at = token.end;
        });

        if (at < text.length) {
            parts.push({ text: text.slice(at), kind: 'gap' });
        }

        return parts;
    }
}
