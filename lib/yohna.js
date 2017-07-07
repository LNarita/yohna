'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof exports.nodeName !== 'string') {
        module.exports = factory();
    } else {
        root.yohna = factory();
    }
})(this, function () {
    var ENTITY_MAP = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;'
    };
    var REGEX_HTML_ESCAPE = new RegExp('[' + Object.keys(ENTITY_MAP).join('') + ']', 'g');
    var escapeHtml = function escapeHtml(string) {
        return String(string).replace(REGEX_HTML_ESCAPE, function (s) {
            return ENTITY_MAP[s];
        });
    };
    var escapeToUnicode = function escapeToUnicode(char) {
        return '' + char.codePointAt().toString(16).toUpperCase();
    };
    var getCharFromCodePoint = function getCharFromCodePoint(char) {
        return String.fromCodePoint(char);
    };
    var pad = function pad(_pad, str, padLeft) {
        if (typeof str === 'undefined') return _pad;
        if (padLeft) {
            return (_pad + str).slice(-_pad.length);
        } else {
            return (str + _pad).substring(0, _pad.length);
        }
    };
    var strToElement = function strToElement(htmlStr) {
        if (htmlStr) {
            var template = document.createElement('TEMPLATE');
            template.innerHTML = htmlStr;
            return template.content.childNodes;
        }
    };
    var $_ = Object.freeze([]);
    var $__ = Object.freeze({});
    var DEFAULT_CONFIGURATION = Object.freeze({
        root: document.body,

        excludeFromSearch: ['SCRIPT', 'STYLE', 'CODE', 'PRE'],

        wordOpeningDelimiters: ['{', '｛'],

        wordClosingDelimiters: ['}', '｝'],

        readingOpeningDelimiters: ['（', '(', '\u3010'],

        readingClosingDelimiters: ['）', ')', '\u3011'],

        readingDelimiters: ['.', '、', '・'],
        enableReadingPerCharacter: true,
        accept: function accept(node) {
            if (node) {
                return node.data.trim();
            }
            return false;
        }
    });
    var REGEX_JAPANESE = /[\uFF5F-\uFF9F\u30A0-\u30FF\u3041-\u3096]+/g;
    var buildRegex = function buildRegex(wordOpeningDelimiters, wordClosingDelimiters, readingOpeningDelimiters, readingClosingDelimiters) {
        return '(?:' + wordOpeningDelimiters.map(function (char) {
            return escapeToUnicode(char);
        }).map(function (char) {
            return '\\u' + pad('0000', char, true);
        }).join('|') + ')([おご]?)([^' + wordClosingDelimiters.map(function (char) {
            return escapeToUnicode(char);
        }).map(function (char) {
            return '\\u' + pad('0000', char, true);
        }).join('') + ']+)(?:' + wordClosingDelimiters.map(function (char) {
            return escapeToUnicode(char);
        }).map(function (char) {
            return '\\u' + pad('0000', char, true);
        }).join('|') + ')(?:' + readingOpeningDelimiters.map(function (char) {
            return escapeToUnicode(char);
        }).map(function (char) {
            return '\\u' + pad('0000', char, true);
        }).join('|') + ')([おご]?)([^' + wordClosingDelimiters.map(function (char) {
            return escapeToUnicode(char);
        }).map(function (char) {
            return '\\u' + pad('0000', char, true);
        }).join('') + ']+)(?:' + readingClosingDelimiters.map(function (char) {
            return escapeToUnicode(char);
        }).map(function (char) {
            return '\\u' + pad('0000', char, true);
        }).join('|') + ')';
    };
    var sanitizeConfig = function sanitizeConfig(configuration) {
        var safeConfig = {};
        Object.keys(DEFAULT_CONFIGURATION).forEach(function (key) {
            var configValue = undefined;
            if (configuration) {
                configValue = configuration[key];
            }
            if ((typeof configValue === 'undefined' ? 'undefined' : _typeof(configValue)) === _typeof(DEFAULT_CONFIGURATION[key])) {
                if ((typeof configValue === 'undefined' ? 'undefined' : _typeof(configValue)) === _typeof('string')) {
                    configValue = configValue.trim();
                }
                safeConfig[key] = configValue != null || configValue !== '' ? configValue : DEFAULT_CONFIGURATION[key];
            } else {
                safeConfig[key] = DEFAULT_CONFIGURATION[key];
            }
        });

        safeConfig.regexPattern = new RegExp(buildRegex(safeConfig.wordOpeningDelimiters, safeConfig.wordClosingDelimiters, safeConfig.readingOpeningDelimiters, safeConfig.readingClosingDelimiters), 'g');
        safeConfig.regexDelimiters = new RegExp('[' + safeConfig.readingDelimiters.join('') + ']');
        return safeConfig;
    };

    function Yohna(options) {
        this.configuration = sanitizeConfig(options);
    }
    Yohna.prototype._findTextNodes = function () {
        var accept = this.configuration.accept;
        var excludeFromSearch = this.configuration.excludeFromSearch;
        var root = this.configuration.root;
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: function acceptNode(node) {
                if (accept(node) && !excludeFromSearch.includes(node.parentNode.nodeName)) {
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        }, false);
        var nodes = [];
        while (walker.nextNode()) {
            nodes.push(walker.currentNode);
        }
        return nodes;
    };
    Yohna.prototype._filterTextNodes = function (textNodes) {
        var _this = this;

        var filteredNodes = [];
        if (textNodes) {
            if (Array.isArray(textNodes) && textNodes.length > 0) {
                filteredNodes = textNodes.filter(function (node) {
                    _this.configuration.regexPattern.lastIndex = 0;
                    return _this.configuration.regexPattern.test(node.data);
                });
            }
        }
        return filteredNodes;
    };
    Yohna.prototype._parseNodes = function (nodes) {
        var _this2 = this;

        if (nodes) {
            if (Array.isArray(nodes) && nodes.length > 0) {
                nodes.forEach(function (node) {
                    _this2.configuration.regexPattern.lastIndex = 0;
                    var elementStrWithRuby = _this2.rubyfy(node.data);
                    var elementWithRuby = strToElement(elementStrWithRuby);
                    if (node.previousSibling === null && node.nextSibling === null) {
                        node.parentNode.innerHTML = elementStrWithRuby;
                    } else {
                        Array.from(elementWithRuby).forEach(function (a) {
                            node.parentNode.insertBefore(a, node);
                        });
                        node.parentNode.removeChild(node);
                    }
                });
            }
        }
    };
    Yohna.prototype.rubyfy = function (txt) {
        var elementStrWithRuby = txt;
        var match = undefined;
        while (match = this.configuration.regexPattern.exec(txt)) {
            var word = match[2];
            var reading = match[4];
            var honorific = '';
            if ((match[1] || match[3]) && match[1] !== match[3]) {
                word = match[1] + word;
                reading = match[3] + reading;
            } else {
                honorific = match[1];
            }
            var wordArr = word.split('');
            var readingArr = reading.split(this.configuration.regexDelimiters).filter(function (r) {
                return r;
            });
            if (readingArr.length === 1 && this.configuration.enableReadingPerCharacter) {
                readingArr = readingArr.map(function (w) {
                    return w.split('');
                }).reduce(function (x, y) {
                    return x.concat(y);
                }, []);
            }
            if (this.configuration.enableReadingPerCharacter && !REGEX_JAPANESE.test(word) && !REGEX_JAPANESE.test(reading) && word.length === reading.length || wordArr.length === readingArr.length) {
                for (var i = 0; i < wordArr.length; i++) {
                    if (!REGEX_JAPANESE.test(wordArr[i]) || readingArr[i] && wordArr[i] !== readingArr[i]) {
                        wordArr[i] = '<ruby>' + escapeHtml(wordArr[i]) + '<rp>(</rp><rt>' + escapeHtml(readingArr[i]) + '</rt><rp>)</rp></ruby>';
                    }
                }
                elementStrWithRuby = elementStrWithRuby.replace(match[0], '' + honorific + wordArr.join(''));
            } else {
                elementStrWithRuby = elementStrWithRuby.replace(match[0], honorific + '<ruby>' + escapeHtml(word) + '<rp>(</rp><rt>' + escapeHtml(reading.replace(this.configuration.regexDelimiters, '')) + '</rt><rp>)</rp></ruby>');
            }
        }
        return elementStrWithRuby;
    };
    Yohna.prototype.parseDocument = function () {
        var textNodes = this._findTextNodes();
        textNodes = this._filterTextNodes(textNodes);
        this._parseNodes(textNodes);
    };
    return {
        init: function init(c) {
            return new Yohna(c);
        }
    };
});
