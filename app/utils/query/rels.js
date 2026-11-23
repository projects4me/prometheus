/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The relations a search request must join: Gaia joins a hasOne relation only when it is in `rels`, so a filter
 * on `issuemilestone.name` needs `issuemilestone` there.
 *
 * @module utils/query
 */

/**
 * The relation prefixes of the schema fields a query uses, plus the `always` ones, without duplicates.
 * A field of the schema's own module (`Issue.status`) has no relation. Quoted values are not read as fields.
 *
 * @method relsForQuery
 * @param {Object} schema An ezSearch schema (see utils/query/schema)
 * @param {String} query The composed query
 * @param {String[]} [always] Relations sent whatever the query
 * @return {String} The relations, comma separated
 */
export function relsForQuery(schema, query, always = []) {
    let relations = new Set();

    for (let field of schema?.fields || []) {
        let dot = field.id.indexOf('.');
        if (dot > 0 && field.id.slice(0, dot) !== schema.module) {
            relations.add(field.id.slice(0, dot));
        }
    }

    let text = String(query ?? '').replace(/'[^']*'|"[^"]*"/g, '');
    let used = [...relations].filter((relation) => new RegExp(`(^|[^\\w.])${relation}\\.`).test(text));

    return [...new Set([...always, ...used])].join(',');
}
