/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

const ALLOWED_TAGS = ['A', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DIV', 'EM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'I', 'LI', 'OL', 'P', 'PRE', 'SPAN', 'STRONG', 'U', 'UL'];
const DROPPED_TAGS = ['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE'];

/**
 * Reduces stored html to a safe subset: unknown tags are unwrapped, scripts are dropped, all attributes are
 * removed except a safe href on links.
 *
 * @method sanitizeHtml
 * @param {String} html
 * @returns {String}
 */
export default function sanitizeHtml(html) {
    let doc = new DOMParser().parseFromString(`<body>${html ?? ''}</body>`, 'text/html');
    clean(doc.body);
    return doc.body.innerHTML;
}

function clean(parent) {
    [...parent.childNodes].forEach(node => {
        if (node.nodeType === 8) {
            node.remove();
        } else if (node.nodeType === 1) {
            if (DROPPED_TAGS.includes(node.tagName)) {
                node.remove();
                return;
            }
            clean(node);
            if (!ALLOWED_TAGS.includes(node.tagName)) {
                node.replaceWith(...node.childNodes);
                return;
            }
            let href = node.tagName === 'A' ? node.getAttribute('href') : null;
            [...node.attributes].forEach(attribute => node.removeAttribute(attribute.name));
            if (href && /^(https?:|mailto:|\/|#)/i.test(href.trim())) {
                node.setAttribute('href', href);
                node.setAttribute('rel', 'noopener noreferrer');
            }
        }
    });
}
