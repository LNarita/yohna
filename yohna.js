;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory)
    } else if (
        typeof exports === 'object' &&
        typeof exports.nodeName !== 'string'
    ) {
        module.exports = factory()
    } else {
        root.yohna = factory()
    }
})(this, function() {
    /**
     * Utils
     */
    const ENTITY_MAP = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;'
    }
    const REGEX_HTML_ESCAPE = new RegExp(
        `[${Object.keys(ENTITY_MAP).join('')}]`,
        'g'
    )
    const escapeHtml = function(string) {
        return String(string).replace(REGEX_HTML_ESCAPE, function(s) {
            return ENTITY_MAP[s]
        })
    }
    const escapeToUnicode = function(char) {
        return `${char.codePointAt().toString(16).toUpperCase()}`
    }
    const getCharFromCodePoint = function(char) {
        return String.fromCodePoint(char)
    }
    const pad = function(pad, str, padLeft) {
        if (typeof str === 'undefined') return pad
        if (padLeft) {
            return (pad + str).slice(-pad.length)
        } else {
            return (str + pad).substring(0, pad.length)
        }
    }
    const htmlToElement = function(htmlStr) {
        if (htmlStr) {
            let template = document.createElement('TEMPLATE')
            template.innerHTML = htmlStr
            return template.content.childNodes
        }
    }
    /**/
    const $_ = Object.freeze([])
    const $__ = Object.freeze({})
    let REGEX_PATTERN = /(?:\{|\｛)([^\}\｝]+)(?:\}|\｝)(?:\（|\(|\u3010)([^\}\｝\u3011]+)(?:\）|\)|\u3011)/g
    let REGEX_DELIMITERS = /[.、・]/
    const DEFAULT_CONFIGURATION = Object.freeze({
        root: document.body,
        excludeFromSearch: ['SCRIPT', 'STYLE', 'CODE', 'PRE'],
        wordOpeningDelimiters: ['{', '｛'],
        wordClosingDelimiters: ['}', '｝'],
        readingOpeningDelimiters: ['（', '(', '\u3010'],
        readingClosingDelimiters: ['）', ')', '\u3011'],
        readingDelimiters: ['.', '、', '・'],
        enableReadingPerCharacter: true,
        accept: function(node) {
            if (node) {
                return node.data.trim()
            }
            return false
        }
    })
    const REGEX_JAPANESE = /[\uFF5F-\uFF9F\u30A0-\u30FF\u3041-\u3096]+/g

    const sanitizeConfig = function(configuration) {
        let safeConfig = {}
        Object.keys(DEFAULT_CONFIGURATION).forEach(key => {
            let configValue = undefined
            if (configuration) {
                configValue = configuration[key]
            }
            if (typeof configValue === typeof DEFAULT_CONFIGURATION[key]) {
                if (typeof configValue === typeof 'string') {
                    configValue = configValue.trim()
                }
                safeConfig[key] =
                    configValue != null || configValue !== ''
                        ? configValue
                        : DEFAULT_CONFIGURATION[key]
            } else {
                safeConfig[key] = DEFAULT_CONFIGURATION[key]
            }
        })

        REGEX_PATTERN = new RegExp(
            buildRegex(
                safeConfig.wordOpeningDelimiters,
                safeConfig.wordClosingDelimiters,
                safeConfig.readingOpeningDelimiters,
                safeConfig.readingClosingDelimiters
            ),
            'g'
        )
        REGEX_DELIMITERS = new RegExp(
            `[${safeConfig.readingDelimiters.join('')}]`
        )
        return safeConfig
    }

    const buildRegex = function(
        wordOpeningDelimiters,
        wordClosingDelimiters,
        readingOpeningDelimiters,
        readingClosingDelimiters
    ) {
        return (
            '(?:' +
            wordOpeningDelimiters
                .map(char => escapeToUnicode(char))
                .map(char => '\\u' + pad('0000', char, true))
                .join('|') +
            ')([おご]?)([^' +
            wordClosingDelimiters
                .map(char => escapeToUnicode(char))
                .map(char => '\\u' + pad('0000', char, true))
                .join('') +
            ']+)(?:' +
            wordClosingDelimiters
                .map(char => escapeToUnicode(char))
                .map(char => '\\u' + pad('0000', char, true))
                .join('|') +
            ')(?:' +
            readingOpeningDelimiters
                .map(char => escapeToUnicode(char))
                .map(char => '\\u' + pad('0000', char, true))
                .join('|') +
            ')([おご]?)([^' +
            wordClosingDelimiters
                .map(char => escapeToUnicode(char))
                .map(char => '\\u' + pad('0000', char, true))
                .join('') +
            ']+)(?:' +
            readingClosingDelimiters
                .map(char => escapeToUnicode(char))
                .map(char => '\\u' + pad('0000', char, true))
                .join('|') +
            ')'
        )
    }

    const nodes = function(root, accept, excludeFromSearch) {
        let walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    if (
                        accept(node) &&
                        !excludeFromSearch.includes(node.parentNode.nodeName)
                    ) {
                        return NodeFilter.FILTER_ACCEPT
                    }
                }
            },
            false
        )
        let nodes = []
        while (walker.nextNode()) {
            nodes.push(walker.currentNode)
        }
        return nodes
    }

    const filterNodes = function(textNodes) {
        let filteredNodes = []
        if (textNodes) {
            if (Array.isArray(textNodes) && textNodes.length > 0) {
                filteredNodes = textNodes.filter(node => {
                    REGEX_PATTERN.lastIndex = 0
                    return REGEX_PATTERN.test(node.data)
                })
            }
        }
        return filteredNodes
    }

    const rubyfy = function(
        node,
        readingDelimiters,
        enableReadingPerCharacter
    ) {
        let elementStrWithRuby = node.data
        let match
        while ((match = REGEX_PATTERN.exec(node.data))) {
            let word = match[2]
            let reading = match[4]
            let honorific = ''
            if ((match[1] || match[3]) && match[1] !== match[3]) {
                word = match[1] + word
                reading = match[3] + reading
            } else {
                honorific = match[1]
            }
            let wordArr = word.split('')
            let readingArr = reading.split(REGEX_DELIMITERS).filter(r => r)
            if (readingArr.length === 1 && enableReadingPerCharacter) {
                readingArr = readingArr
                    .map(w => w.split(''))
                    .reduce((x, y) => x.concat(y), [])
            }
            if (
                (enableReadingPerCharacter &&
                    !REGEX_JAPANESE.test(word) &&
                    !REGEX_JAPANESE.test(reading) &&
                    word.length === reading.length) ||
                wordArr.length === readingArr.length
            ) {
                for (let i = 0; i < wordArr.length; i++) {
                    if (
                        !REGEX_JAPANESE.test(wordArr[i]) ||
                        (readingArr[i] && wordArr[i] !== readingArr[i])
                    ) {
                        wordArr[i] = `<ruby>${escapeHtml(
                            wordArr[i]
                        )}<rp>(</rp><rt>${escapeHtml(
                            readingArr[i]
                        )}</rt><rp>)</rp></ruby>`
                    }
                }
                elementStrWithRuby = elementStrWithRuby.replace(
                    match[0],
                    `${honorific}${wordArr.join('')}`
                )
            } else {
                elementStrWithRuby = elementStrWithRuby.replace(
                    match[0],
                    `${honorific}<ruby>${escapeHtml(
                        word
                    )}<rp>(</rp><rt>${escapeHtml(
                        reading.replace(REGEX_DELIMITERS, '')
                    )}</rt><rp>)</rp></ruby>`
                )
            }
        }
        return elementStrWithRuby
    }

    const parse = function(
        nodes,
        readingDelimiters,
        enableReadingPerCharacter
    ) {
        if (nodes) {
            if (Array.isArray(nodes) && nodes.length > 0) {
                nodes.forEach(node => {
                    REGEX_PATTERN.lastIndex = 0
                    let elementStrWithRuby = rubyfy(
                        node,
                        readingDelimiters,
                        enableReadingPerCharacter
                    )
                    let elementWithRuby = htmlToElement(elementStrWithRuby)
                    if (
                        node.previousSibling === null &&
                        node.nextSibling === null
                    ) {
                        node.parentNode.innerHTML = elementStrWithRuby
                    } else {
                        Array.from(elementWithRuby).forEach(a => {
                            node.parentNode.insertBefore(a, node)
                        })
                        node.parentNode.removeChild(node)
                    }
                })
            }
        }
    }

    const start = function(configuration) {
        configuration = sanitizeConfig(configuration)
        let textNodes = nodes(
            configuration.root,
            configuration.accept,
            configuration.excludeFromSearch
        )
        textNodes = filterNodes(textNodes)
        parse(
            textNodes,
            configuration.readingDelimiters,
            configuration.enableReadingPerCharacter
        )
    }

    return {
        init: start,
        rubyfy: rubyfy
    }
})
