(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, function () { 'use strict';

    var hookCallback;

    function utils_hooks__hooks () {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback (callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function create_utc__createUTC (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty           : false,
            unusedTokens    : [],
            unusedInput     : [],
            overflow        : -2,
            charsLeftOver   : 0,
            nullInput       : false,
            invalidMonth    : null,
            invalidFormat   : false,
            userInvalidated : false,
            iso             : false
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    function valid__isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            m._isValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }
        }
        return m._isValid;
    }

    function valid__createInvalid (flags) {
        var m = create_utc__createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    var momentProperties = utils_hooks__hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (typeof from._isAMomentObject !== 'undefined') {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (typeof from._i !== 'undefined') {
            to._i = from._i;
        }
        if (typeof from._f !== 'undefined') {
            to._f = from._f;
        }
        if (typeof from._l !== 'undefined') {
            to._l = from._l;
        }
        if (typeof from._strict !== 'undefined') {
            to._strict = from._strict;
        }
        if (typeof from._tzm !== 'undefined') {
            to._tzm = from._tzm;
        }
        if (typeof from._isUTC !== 'undefined') {
            to._isUTC = from._isUTC;
        }
        if (typeof from._offset !== 'undefined') {
            to._offset = from._offset;
        }
        if (typeof from._pf !== 'undefined') {
            to._pf = getParsingFlags(from);
        }
        if (typeof from._locale !== 'undefined') {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (typeof val !== 'undefined') {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    var updateInProgress = false;

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            utils_hooks__hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment (obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor (number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function Locale() {
    }

    var locales = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && typeof module !== 'undefined' &&
                module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we
                // want to undo that for lazy loaded locales
                locale_locales__getSetGlobalLocale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function locale_locales__getSetGlobalLocale (key, values) {
        var data;
        if (key) {
            if (typeof values === 'undefined') {
                data = locale_locales__getLocale(key);
            }
            else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale (name, values) {
        if (values !== null) {
            values.abbr = name;
            locales[name] = locales[name] || new Locale();
            locales[name].set(values);

            // backwards compat for now: also set the locale
            locale_locales__getSetGlobalLocale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    // returns locale data
    function locale_locales__getLocale (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    var aliases = {};

    function addUnitAlias (unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function makeGetSet (unit, keepTime) {
        return function (value) {
            if (value != null) {
                get_set__set(this, unit, value);
                utils_hooks__hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get_set__get(this, unit);
            }
        };
    }

    function get_set__get (mom, unit) {
        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
    }

    function get_set__set (mom, unit, value) {
        return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
    }

    // MOMENTS

    function getSet (units, value) {
        var unit;
        if (typeof units === 'object') {
            for (unit in units) {
                this.set(unit, units[unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (typeof this[units] === 'function') {
                return this[units](value);
            }
        }
        return this;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

    var formatFunctions = {};

    var formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken (token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '';
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var match1         = /\d/;            //       0 - 9
    var match2         = /\d\d/;          //      00 - 99
    var match3         = /\d{3}/;         //     000 - 999
    var match4         = /\d{4}/;         //    0000 - 9999
    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2      = /\d\d?/;         //       0 - 99
    var match1to3      = /\d{1,3}/;       //       0 - 999
    var match1to4      = /\d{1,4}/;       //       0 - 9999
    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned  = /\d+/;           //       0 - inf
    var matchSigned    = /[+-]?\d+/;      //    -inf - inf

    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

    // any word (or two) characters or numbers including two/three word month in arabic.
    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;

    var regexes = {};

    function isFunction (sth) {
        // https://github.com/moment/moment/issues/2325
        return typeof sth === 'function' &&
            Object.prototype.toString.call(sth) === '[object Function]';
    }


    function addRegexToken (token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken (token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken (token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (typeof callback === 'number') {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken (token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PARSING

    addRegexToken('M',    match1to2);
    addRegexToken('MM',   match1to2, match2);
    addRegexToken('MMM',  matchWord);
    addRegexToken('MMMM', matchWord);

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths (m) {
        return this._months[m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort (m) {
        return this._monthsShort[m.month()];
    }

    function localeMonthsParse (monthName, format, strict) {
        var i, mom, regex;

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth (mom, value) {
        var dayOfMonth;

        // TODO: Move this out of here!
        if (typeof value === 'string') {
            value = mom.localeData().monthsParse(value);
            // TODO: Another silent failure?
            if (typeof value !== 'number') {
                return mom;
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth (value) {
        if (value != null) {
            setMonth(this, value);
            utils_hooks__hooks.updateOffset(this, true);
            return this;
        } else {
            return get_set__get(this, 'Month');
        }
    }

    function getDaysInMonth () {
        return daysInMonth(this.year(), this.month());
    }

    function checkOverflow (m) {
        var overflow;
        var a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
                a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    function warn(msg) {
        if (utils_hooks__hooks.suppressDeprecationWarnings === false && typeof console !== 'undefined' && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (firstTime) {
                warn(msg + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    utils_hooks__hooks.suppressDeprecationWarnings = false;

    var from_string__isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
        ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
        ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d{2}/],
        ['YYYY-DDD', /\d{4}-\d{3}/]
    ];

    // iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
        ['HH:mm', /(T| )\d\d:\d\d/],
        ['HH', /(T| )\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    // date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = from_string__isoRegex.exec(string);

        if (match) {
            getParsingFlags(config).iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    config._f = isoDates[i][0];
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    // match[6] should be 'T' or space
                    config._f += (match[6] || ' ') + isoTimes[i][0];
                    break;
                }
            }
            if (string.match(matchOffset)) {
                config._f += 'Z';
            }
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);

        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    utils_hooks__hooks.createFromInputFallback = deprecate(
        'moment construction falls back to js Date. This is ' +
        'discouraged and will be removed in upcoming major ' +
        'release. Please refer to ' +
        'https://github.com/moment/moment/issues/1407 for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    function createDate (y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor doesn't accept years < 1970
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }

    function createUTCDate (y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY',   4],       0, 'year');
    addFormatToken(0, ['YYYYY',  5],       0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PARSING

    addRegexToken('Y',      matchSigned);
    addRegexToken('YY',     match1to2, match2);
    addRegexToken('YYYY',   match1to4, match4);
    addRegexToken('YYYYY',  match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? utils_hooks__hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = utils_hooks__hooks.parseTwoDigitYear(input);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // HOOKS

    utils_hooks__hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', false);

    function getIsLeapYear () {
        return isLeapYear(this.year());
    }

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PARSING

    addRegexToken('w',  match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W',  match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = local__createLocal(mom).add(daysToDayOfWeek, 'd');
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }

    // LOCALES

    function localeWeek (mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow : 0, // Sunday is the first day of the week.
        doy : 6  // The week that contains Jan 1st is the first week of the year.
    };

    function localeFirstDayOfWeek () {
        return this._week.dow;
    }

    function localeFirstDayOfYear () {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek (input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek (input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PARSING

    addRegexToken('DDD',  match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var week1Jan = 6 + firstDayOfWeek - firstDayOfWeekOfYear, janX = createUTCDate(year, 0, 1 + week1Jan), d = janX.getUTCDay(), dayOfYear;
        if (d < firstDayOfWeek) {
            d += 7;
        }

        weekday = weekday != null ? 1 * weekday : firstDayOfWeek;

        dayOfYear = 1 + week1Jan + 7 * (week - 1) - d + weekday;

        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }

    // MOMENTS

    function getSetDayOfYear (input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        var now = new Date();
        if (config._useUTC) {
            return [now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()];
        }
        return [now.getFullYear(), now.getMonth(), now.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray (config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(local__createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = defaults(w.gg, config._a[YEAR], weekOfYear(local__createLocal(), dow, doy).year);
            week = defaults(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < dow) {
                    ++week;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);

        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }

    utils_hooks__hooks.ISO_8601 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === utils_hooks__hooks.ISO_8601) {
            configFromISO(config);
            return;
        }

        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                }
                else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (getParsingFlags(config).bigHour === true &&
                config._a[HOUR] <= 12 &&
                config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        configFromArray(config);
        checkOverflow(config);
    }


    function meridiemFixWrap (locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (!valid__isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i);
        config._a = [i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond];

        configFromArray(config);
    }

    function createFromConfig (config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig (config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || locale_locales__getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return valid__createInvalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        } else if (isDate(input)) {
            config._d = input;
        } else {
            configFromInput(config);
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (input === undefined) {
            config._d = new Date();
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (typeof(input) === 'object') {
            configFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC (input, format, locale, strict, isUTC) {
        var c = {};

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function local__createLocal (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
         'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
         function () {
             var other = local__createLocal.apply(null, arguments);
             return other < this ? this : other;
         }
     );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
        function () {
            var other = local__createLocal.apply(null, arguments);
            return other > this ? this : other;
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return local__createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    function Duration (duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = locale_locales__getLocale();

        this._bubble();
    }

    function isDuration (obj) {
        return obj instanceof Duration;
    }

    function offset (token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z',  matchOffset);
    addRegexToken('ZZ', matchOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(string) {
        var matches = ((string || '').match(matchOffset) || []);
        var chunk   = matches[matches.length - 1] || [];
        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? +input : +local__createLocal(input)) - (+res);
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(+res._d + diff);
            utils_hooks__hooks.updateOffset(res, false);
            return res;
        } else {
            return local__createLocal(input).local();
        }
    }

    function getDateOffset (m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    utils_hooks__hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset (input, keepLocalTime) {
        var offset = this._offset || 0,
            localAdjust;
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(input);
            }
            if (Math.abs(input) < 16) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    add_subtract__addSubtract(this, create__createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    utils_hooks__hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone (input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC (keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal (keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset () {
        if (this._tzm) {
            this.utcOffset(this._tzm);
        } else if (typeof this._i === 'string') {
            this.utcOffset(offsetFromString(this._i));
        }
        return this;
    }

    function hasAlignedHourOffset (input) {
        input = input ? local__createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime () {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted () {
        if (typeof this._isDSTShifted !== 'undefined') {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? create_utc__createUTC(c._a) : local__createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal () {
        return !this._isUTC;
    }

    function isUtcOffset () {
        return this._isUTC;
    }

    function isUtc () {
        return this._isUTC && this._offset === 0;
    }

    var aspNetRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/;

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    var create__isoRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;

    function create__createDuration (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms : input._milliseconds,
                d  : input._days,
                M  : input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y  : 0,
                d  : toInt(match[DATE])        * sign,
                h  : toInt(match[HOUR])        * sign,
                m  : toInt(match[MINUTE])      * sign,
                s  : toInt(match[SECOND])      * sign,
                ms : toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = create__isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y : parseIso(match[2], sign),
                M : parseIso(match[3], sign),
                d : parseIso(match[4], sign),
                h : parseIso(match[5], sign),
                m : parseIso(match[6], sign),
                s : parseIso(match[7], sign),
                w : parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(local__createLocal(duration.from), local__createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    }

    create__createDuration.fn = Duration.prototype;

    function parseIso (inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = create__createDuration(val, period);
            add_subtract__addSubtract(this, dur, direction);
            return this;
        };
    }

    function add_subtract__addSubtract (mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months;
        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            get_set__set(mom, 'Date', get_set__get(mom, 'Date') + days * isAdding);
        }
        if (months) {
            setMonth(mom, get_set__get(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            utils_hooks__hooks.updateOffset(mom, days || months);
        }
    }

    var add_subtract__add      = createAdder(1, 'add');
    var add_subtract__subtract = createAdder(-1, 'subtract');

    function moment_calendar__calendar (time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || local__createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            diff = this.diff(sod, 'days', true),
            format = diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';
        return this.format(formats && formats[format] || this.localeData().calendar(format, this, local__createLocal(now)));
    }

    function clone () {
        return new Moment(this);
    }

    function isAfter (input, units) {
        var inputMs;
        units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this > +input;
        } else {
            inputMs = isMoment(input) ? +input : +local__createLocal(input);
            return inputMs < +this.clone().startOf(units);
        }
    }

    function isBefore (input, units) {
        var inputMs;
        units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this < +input;
        } else {
            inputMs = isMoment(input) ? +input : +local__createLocal(input);
            return +this.clone().endOf(units) < inputMs;
        }
    }

    function isBetween (from, to, units) {
        return this.isAfter(from, units) && this.isBefore(to, units);
    }

    function isSame (input, units) {
        var inputMs;
        units = normalizeUnits(units || 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this === +input;
        } else {
            inputMs = +local__createLocal(input);
            return +(this.clone().startOf(units)) <= inputMs && inputMs <= +(this.clone().endOf(units));
        }
    }

    function diff (input, units, asFloat) {
        var that = cloneWithOffset(input, this),
            zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4,
            delta, output;

        units = normalizeUnits(units);

        if (units === 'year' || units === 'month' || units === 'quarter') {
            output = monthDiff(this, that);
            if (units === 'quarter') {
                output = output / 3;
            } else if (units === 'year') {
                output = output / 12;
            }
        } else {
            delta = this - that;
            output = units === 'second' ? delta / 1e3 : // 1000
                units === 'minute' ? delta / 6e4 : // 1000 * 60
                units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
                units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                delta;
        }
        return asFloat ? output : absFloor(output);
    }

    function monthDiff (a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        return -(wholeMonthDiff + adjust);
    }

    utils_hooks__hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';

    function toString () {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function moment_format__toISOString () {
        var m = this.clone().utc();
        if (0 < m.year() && m.year() <= 9999) {
            if ('function' === typeof Date.prototype.toISOString) {
                // native implementation is ~50x faster, use it when we can
                return this.toDate().toISOString();
            } else {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        } else {
            return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        }
    }

    function moment_format__format (inputString) {
        var output = formatMoment(this, inputString || utils_hooks__hooks.defaultFormat);
        return this.localeData().postformat(output);
    }

    function from (time, withoutSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }
        return create__createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
    }

    function fromNow (withoutSuffix) {
        return this.from(local__createLocal(), withoutSuffix);
    }

    function to (time, withoutSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }
        return create__createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
    }

    function toNow (withoutSuffix) {
        return this.to(local__createLocal(), withoutSuffix);
    }

    function locale (key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = locale_locales__getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData () {
        return this._locale;
    }

    function startOf (units) {
        units = normalizeUnits(units);
        // the following switch intentionally omits break keywords
        // to utilize falling through the cases.
        switch (units) {
        case 'year':
            this.month(0);
            /* falls through */
        case 'quarter':
        case 'month':
            this.date(1);
            /* falls through */
        case 'week':
        case 'isoWeek':
        case 'day':
            this.hours(0);
            /* falls through */
        case 'hour':
            this.minutes(0);
            /* falls through */
        case 'minute':
            this.seconds(0);
            /* falls through */
        case 'second':
            this.milliseconds(0);
        }

        // weeks are a special case
        if (units === 'week') {
            this.weekday(0);
        }
        if (units === 'isoWeek') {
            this.isoWeekday(1);
        }

        // quarters are also special
        if (units === 'quarter') {
            this.month(Math.floor(this.month() / 3) * 3);
        }

        return this;
    }

    function endOf (units) {
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond') {
            return this;
        }
        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
    }

    function to_type__valueOf () {
        return +this._d - ((this._offset || 0) * 60000);
    }

    function unix () {
        return Math.floor(+this / 1000);
    }

    function toDate () {
        return this._offset ? new Date(+this) : this._d;
    }

    function toArray () {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject () {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function moment_valid__isValid () {
        return valid__isValid(this);
    }

    function parsingFlags () {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt () {
        return getParsingFlags(this).overflow;
    }

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken (token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg',     'weekYear');
    addWeekYearFormatToken('ggggg',    'weekYear');
    addWeekYearFormatToken('GGGG',  'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PARSING

    addRegexToken('G',      matchSigned);
    addRegexToken('g',      matchSigned);
    addRegexToken('GG',     match1to2, match2);
    addRegexToken('gg',     match1to2, match2);
    addRegexToken('GGGG',   match1to4, match4);
    addRegexToken('gggg',   match1to4, match4);
    addRegexToken('GGGGG',  match1to6, match6);
    addRegexToken('ggggg',  match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = utils_hooks__hooks.parseTwoDigitYear(input);
    });

    // HELPERS

    function weeksInYear(year, dow, doy) {
        return weekOfYear(local__createLocal([year, 11, 31 + dow - doy]), dow, doy).week;
    }

    // MOMENTS

    function getSetWeekYear (input) {
        var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
        return input == null ? year : this.add((input - year), 'y');
    }

    function getSetISOWeekYear (input) {
        var year = weekOfYear(this, 1, 4).year;
        return input == null ? year : this.add((input - year), 'y');
    }

    function getISOWeeksInYear () {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear () {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    addFormatToken('Q', 0, 0, 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter (input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PARSING

    addRegexToken('D',  match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0], 10);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PARSING

    addRegexToken('d',    match1to2);
    addRegexToken('e',    match1to2);
    addRegexToken('E',    match1to2);
    addRegexToken('dd',   matchWord);
    addRegexToken('ddd',  matchWord);
    addRegexToken('dddd', matchWord);

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config) {
        var weekday = config._locale.weekdaysParse(input);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    // LOCALES

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays (m) {
        return this._weekdays[m.day()];
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort (m) {
        return this._weekdaysShort[m.day()];
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin (m) {
        return this._weekdaysMin[m.day()];
    }

    function localeWeekdaysParse (weekdayName) {
        var i, mom, regex;

        this._weekdaysParse = this._weekdaysParse || [];

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            if (!this._weekdaysParse[i]) {
                mom = local__createLocal([2000, 1]).day(i);
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek (input) {
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek (input) {
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek (input) {
        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.
        return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, function () {
        return this.hours() % 12 || 12;
    });

    function meridiem (token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PARSING

    function matchMeridiem (isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a',  matchMeridiem);
    addRegexToken('A',  matchMeridiem);
    addRegexToken('H',  match1to2);
    addRegexToken('h',  match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });

    // LOCALES

    function localeIsPM (input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }


    // MOMENTS

    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    var getSetHour = makeGetSet('Hours', true);

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PARSING

    addRegexToken('m',  match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PARSING

    addRegexToken('s',  match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });


    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PARSING

    addRegexToken('S',    match1to3, match1);
    addRegexToken('SS',   match1to3, match2);
    addRegexToken('SSS',  match1to3, match3);

    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    // MOMENTS

    var getSetMillisecond = makeGetSet('Milliseconds', false);

    addFormatToken('z',  0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr () {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName () {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var momentPrototype__proto = Moment.prototype;

    momentPrototype__proto.add          = add_subtract__add;
    momentPrototype__proto.calendar     = moment_calendar__calendar;
    momentPrototype__proto.clone        = clone;
    momentPrototype__proto.diff         = diff;
    momentPrototype__proto.endOf        = endOf;
    momentPrototype__proto.format       = moment_format__format;
    momentPrototype__proto.from         = from;
    momentPrototype__proto.fromNow      = fromNow;
    momentPrototype__proto.to           = to;
    momentPrototype__proto.toNow        = toNow;
    momentPrototype__proto.get          = getSet;
    momentPrototype__proto.invalidAt    = invalidAt;
    momentPrototype__proto.isAfter      = isAfter;
    momentPrototype__proto.isBefore     = isBefore;
    momentPrototype__proto.isBetween    = isBetween;
    momentPrototype__proto.isSame       = isSame;
    momentPrototype__proto.isValid      = moment_valid__isValid;
    momentPrototype__proto.lang         = lang;
    momentPrototype__proto.locale       = locale;
    momentPrototype__proto.localeData   = localeData;
    momentPrototype__proto.max          = prototypeMax;
    momentPrototype__proto.min          = prototypeMin;
    momentPrototype__proto.parsingFlags = parsingFlags;
    momentPrototype__proto.set          = getSet;
    momentPrototype__proto.startOf      = startOf;
    momentPrototype__proto.subtract     = add_subtract__subtract;
    momentPrototype__proto.toArray      = toArray;
    momentPrototype__proto.toObject     = toObject;
    momentPrototype__proto.toDate       = toDate;
    momentPrototype__proto.toISOString  = moment_format__toISOString;
    momentPrototype__proto.toJSON       = moment_format__toISOString;
    momentPrototype__proto.toString     = toString;
    momentPrototype__proto.unix         = unix;
    momentPrototype__proto.valueOf      = to_type__valueOf;

    // Year
    momentPrototype__proto.year       = getSetYear;
    momentPrototype__proto.isLeapYear = getIsLeapYear;

    // Week Year
    momentPrototype__proto.weekYear    = getSetWeekYear;
    momentPrototype__proto.isoWeekYear = getSetISOWeekYear;

    // Quarter
    momentPrototype__proto.quarter = momentPrototype__proto.quarters = getSetQuarter;

    // Month
    momentPrototype__proto.month       = getSetMonth;
    momentPrototype__proto.daysInMonth = getDaysInMonth;

    // Week
    momentPrototype__proto.week           = momentPrototype__proto.weeks        = getSetWeek;
    momentPrototype__proto.isoWeek        = momentPrototype__proto.isoWeeks     = getSetISOWeek;
    momentPrototype__proto.weeksInYear    = getWeeksInYear;
    momentPrototype__proto.isoWeeksInYear = getISOWeeksInYear;

    // Day
    momentPrototype__proto.date       = getSetDayOfMonth;
    momentPrototype__proto.day        = momentPrototype__proto.days             = getSetDayOfWeek;
    momentPrototype__proto.weekday    = getSetLocaleDayOfWeek;
    momentPrototype__proto.isoWeekday = getSetISODayOfWeek;
    momentPrototype__proto.dayOfYear  = getSetDayOfYear;

    // Hour
    momentPrototype__proto.hour = momentPrototype__proto.hours = getSetHour;

    // Minute
    momentPrototype__proto.minute = momentPrototype__proto.minutes = getSetMinute;

    // Second
    momentPrototype__proto.second = momentPrototype__proto.seconds = getSetSecond;

    // Millisecond
    momentPrototype__proto.millisecond = momentPrototype__proto.milliseconds = getSetMillisecond;

    // Offset
    momentPrototype__proto.utcOffset            = getSetOffset;
    momentPrototype__proto.utc                  = setOffsetToUTC;
    momentPrototype__proto.local                = setOffsetToLocal;
    momentPrototype__proto.parseZone            = setOffsetToParsedOffset;
    momentPrototype__proto.hasAlignedHourOffset = hasAlignedHourOffset;
    momentPrototype__proto.isDST                = isDaylightSavingTime;
    momentPrototype__proto.isDSTShifted         = isDaylightSavingTimeShifted;
    momentPrototype__proto.isLocal              = isLocal;
    momentPrototype__proto.isUtcOffset          = isUtcOffset;
    momentPrototype__proto.isUtc                = isUtc;
    momentPrototype__proto.isUTC                = isUtc;

    // Timezone
    momentPrototype__proto.zoneAbbr = getZoneAbbr;
    momentPrototype__proto.zoneName = getZoneName;

    // Deprecations
    momentPrototype__proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    momentPrototype__proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    momentPrototype__proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    momentPrototype__proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779', getSetZone);

    var momentPrototype = momentPrototype__proto;

    function moment_moment__createUnix (input) {
        return local__createLocal(input * 1000);
    }

    function moment_moment__createInZone () {
        return local__createLocal.apply(null, arguments).parseZone();
    }

    var defaultCalendar = {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[Last] dddd [at] LT',
        sameElse : 'L'
    };

    function locale_calendar__calendar (key, mom, now) {
        var output = this._calendar[key];
        return typeof output === 'function' ? output.call(mom, now) : output;
    }

    var defaultLongDateFormat = {
        LTS  : 'h:mm:ss A',
        LT   : 'h:mm A',
        L    : 'MM/DD/YYYY',
        LL   : 'MMMM D, YYYY',
        LLL  : 'MMMM D, YYYY h:mm A',
        LLLL : 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat (key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate () {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d';
    var defaultOrdinalParse = /\d{1,2}/;

    function ordinal (number) {
        return this._ordinal.replace('%d', number);
    }

    function preParsePostFormat (string) {
        return string;
    }

    var defaultRelativeTime = {
        future : 'in %s',
        past   : '%s ago',
        s  : 'a few seconds',
        m  : 'a minute',
        mm : '%d minutes',
        h  : 'an hour',
        hh : '%d hours',
        d  : 'a day',
        dd : '%d days',
        M  : 'a month',
        MM : '%d months',
        y  : 'a year',
        yy : '%d years'
    };

    function relative__relativeTime (number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (typeof output === 'function') ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture (diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
    }

    function locale_set__set (config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (typeof prop === 'function') {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _ordinalParseLenient.
        this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + (/\d{1,2}/).source);
    }

    var prototype__proto = Locale.prototype;

    prototype__proto._calendar       = defaultCalendar;
    prototype__proto.calendar        = locale_calendar__calendar;
    prototype__proto._longDateFormat = defaultLongDateFormat;
    prototype__proto.longDateFormat  = longDateFormat;
    prototype__proto._invalidDate    = defaultInvalidDate;
    prototype__proto.invalidDate     = invalidDate;
    prototype__proto._ordinal        = defaultOrdinal;
    prototype__proto.ordinal         = ordinal;
    prototype__proto._ordinalParse   = defaultOrdinalParse;
    prototype__proto.preparse        = preParsePostFormat;
    prototype__proto.postformat      = preParsePostFormat;
    prototype__proto._relativeTime   = defaultRelativeTime;
    prototype__proto.relativeTime    = relative__relativeTime;
    prototype__proto.pastFuture      = pastFuture;
    prototype__proto.set             = locale_set__set;

    // Month
    prototype__proto.months       =        localeMonths;
    prototype__proto._months      = defaultLocaleMonths;
    prototype__proto.monthsShort  =        localeMonthsShort;
    prototype__proto._monthsShort = defaultLocaleMonthsShort;
    prototype__proto.monthsParse  =        localeMonthsParse;

    // Week
    prototype__proto.week = localeWeek;
    prototype__proto._week = defaultLocaleWeek;
    prototype__proto.firstDayOfYear = localeFirstDayOfYear;
    prototype__proto.firstDayOfWeek = localeFirstDayOfWeek;

    // Day of Week
    prototype__proto.weekdays       =        localeWeekdays;
    prototype__proto._weekdays      = defaultLocaleWeekdays;
    prototype__proto.weekdaysMin    =        localeWeekdaysMin;
    prototype__proto._weekdaysMin   = defaultLocaleWeekdaysMin;
    prototype__proto.weekdaysShort  =        localeWeekdaysShort;
    prototype__proto._weekdaysShort = defaultLocaleWeekdaysShort;
    prototype__proto.weekdaysParse  =        localeWeekdaysParse;

    // Hours
    prototype__proto.isPM = localeIsPM;
    prototype__proto._meridiemParse = defaultLocaleMeridiemParse;
    prototype__proto.meridiem = localeMeridiem;

    function lists__get (format, index, field, setter) {
        var locale = locale_locales__getLocale();
        var utc = create_utc__createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function list (format, index, field, count, setter) {
        if (typeof format === 'number') {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return lists__get(format, index, field, setter);
        }

        var i;
        var out = [];
        for (i = 0; i < count; i++) {
            out[i] = lists__get(format, i, field, setter);
        }
        return out;
    }

    function lists__listMonths (format, index) {
        return list(format, index, 'months', 12, 'month');
    }

    function lists__listMonthsShort (format, index) {
        return list(format, index, 'monthsShort', 12, 'month');
    }

    function lists__listWeekdays (format, index) {
        return list(format, index, 'weekdays', 7, 'day');
    }

    function lists__listWeekdaysShort (format, index) {
        return list(format, index, 'weekdaysShort', 7, 'day');
    }

    function lists__listWeekdaysMin (format, index) {
        return list(format, index, 'weekdaysMin', 7, 'day');
    }

    locale_locales__getSetGlobalLocale('en', {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // Side effect imports
    utils_hooks__hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', locale_locales__getSetGlobalLocale);
    utils_hooks__hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', locale_locales__getLocale);

    var mathAbs = Math.abs;

    function duration_abs__abs () {
        var data           = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days         = mathAbs(this._days);
        this._months       = mathAbs(this._months);

        data.milliseconds  = mathAbs(data.milliseconds);
        data.seconds       = mathAbs(data.seconds);
        data.minutes       = mathAbs(data.minutes);
        data.hours         = mathAbs(data.hours);
        data.months        = mathAbs(data.months);
        data.years         = mathAbs(data.years);

        return this;
    }

    function duration_add_subtract__addSubtract (duration, input, value, direction) {
        var other = create__createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days         += direction * other._days;
        duration._months       += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function duration_add_subtract__add (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function duration_add_subtract__subtract (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, -1);
    }

    function absCeil (number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble () {
        var milliseconds = this._milliseconds;
        var days         = this._days;
        var months       = this._months;
        var data         = this._data;
        var seconds, minutes, hours, years, monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds           = absFloor(milliseconds / 1000);
        data.seconds      = seconds % 60;

        minutes           = absFloor(seconds / 60);
        data.minutes      = minutes % 60;

        hours             = absFloor(minutes / 60);
        data.hours        = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days   = days;
        data.months = months;
        data.years  = years;

        return this;
    }

    function daysToMonths (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays (months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as (units) {
        var days;
        var months;
        var milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'year') {
            days   = this._days   + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            return units === 'month' ? months : months / 12;
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week'   : return days / 7     + milliseconds / 6048e5;
                case 'day'    : return days         + milliseconds / 864e5;
                case 'hour'   : return days * 24    + milliseconds / 36e5;
                case 'minute' : return days * 1440  + milliseconds / 6e4;
                case 'second' : return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                default: throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function duration_as__valueOf () {
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs (alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms');
    var asSeconds      = makeAs('s');
    var asMinutes      = makeAs('m');
    var asHours        = makeAs('h');
    var asDays         = makeAs('d');
    var asWeeks        = makeAs('w');
    var asMonths       = makeAs('M');
    var asYears        = makeAs('y');

    function duration_get__get (units) {
        units = normalizeUnits(units);
        return this[units + 's']();
    }

    function makeGetter(name) {
        return function () {
            return this._data[name];
        };
    }

    var milliseconds = makeGetter('milliseconds');
    var seconds      = makeGetter('seconds');
    var minutes      = makeGetter('minutes');
    var hours        = makeGetter('hours');
    var days         = makeGetter('days');
    var duration_get__months       = makeGetter('months');
    var years        = makeGetter('years');

    function weeks () {
        return absFloor(this.days() / 7);
    }

    var round = Math.round;
    var thresholds = {
        s: 45,  // seconds to minute
        m: 45,  // minutes to hour
        h: 22,  // hours to day
        d: 26,  // days to month
        M: 11   // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function duration_humanize__relativeTime (posNegDuration, withoutSuffix, locale) {
        var duration = create__createDuration(posNegDuration).abs();
        var seconds  = round(duration.as('s'));
        var minutes  = round(duration.as('m'));
        var hours    = round(duration.as('h'));
        var days     = round(duration.as('d'));
        var months   = round(duration.as('M'));
        var years    = round(duration.as('y'));

        var a = seconds < thresholds.s && ['s', seconds]  ||
                minutes === 1          && ['m']           ||
                minutes < thresholds.m && ['mm', minutes] ||
                hours   === 1          && ['h']           ||
                hours   < thresholds.h && ['hh', hours]   ||
                days    === 1          && ['d']           ||
                days    < thresholds.d && ['dd', days]    ||
                months  === 1          && ['M']           ||
                months  < thresholds.M && ['MM', months]  ||
                years   === 1          && ['y']           || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set a threshold for relative time strings
    function duration_humanize__getSetRelativeTimeThreshold (threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        return true;
    }

    function humanize (withSuffix) {
        var locale = this.localeData();
        var output = duration_humanize__relativeTime(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var iso_string__abs = Math.abs;

    function iso_string__toISOString() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        var seconds = iso_string__abs(this._milliseconds) / 1000;
        var days         = iso_string__abs(this._days);
        var months       = iso_string__abs(this._months);
        var minutes, hours, years;

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes           = absFloor(seconds / 60);
        hours             = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years  = absFloor(months / 12);
        months %= 12;


        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds;
        var total = this.asSeconds();

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        return (total < 0 ? '-' : '') +
            'P' +
            (Y ? Y + 'Y' : '') +
            (M ? M + 'M' : '') +
            (D ? D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? h + 'H' : '') +
            (m ? m + 'M' : '') +
            (s ? s + 'S' : '');
    }

    var duration_prototype__proto = Duration.prototype;

    duration_prototype__proto.abs            = duration_abs__abs;
    duration_prototype__proto.add            = duration_add_subtract__add;
    duration_prototype__proto.subtract       = duration_add_subtract__subtract;
    duration_prototype__proto.as             = as;
    duration_prototype__proto.asMilliseconds = asMilliseconds;
    duration_prototype__proto.asSeconds      = asSeconds;
    duration_prototype__proto.asMinutes      = asMinutes;
    duration_prototype__proto.asHours        = asHours;
    duration_prototype__proto.asDays         = asDays;
    duration_prototype__proto.asWeeks        = asWeeks;
    duration_prototype__proto.asMonths       = asMonths;
    duration_prototype__proto.asYears        = asYears;
    duration_prototype__proto.valueOf        = duration_as__valueOf;
    duration_prototype__proto._bubble        = bubble;
    duration_prototype__proto.get            = duration_get__get;
    duration_prototype__proto.milliseconds   = milliseconds;
    duration_prototype__proto.seconds        = seconds;
    duration_prototype__proto.minutes        = minutes;
    duration_prototype__proto.hours          = hours;
    duration_prototype__proto.days           = days;
    duration_prototype__proto.weeks          = weeks;
    duration_prototype__proto.months         = duration_get__months;
    duration_prototype__proto.years          = years;
    duration_prototype__proto.humanize       = humanize;
    duration_prototype__proto.toISOString    = iso_string__toISOString;
    duration_prototype__proto.toString       = iso_string__toISOString;
    duration_prototype__proto.toJSON         = iso_string__toISOString;
    duration_prototype__proto.locale         = locale;
    duration_prototype__proto.localeData     = localeData;

    // Deprecations
    duration_prototype__proto.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', iso_string__toISOString);
    duration_prototype__proto.lang = lang;

    // Side effect imports

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    // Side effect imports

    ;

    //! moment.js
    //! version : 2.10.6
    //! authors : Tim Wood, Iskren Chernev, Moment.js contributors
    //! license : MIT
    //! momentjs.com

    utils_hooks__hooks.version = '2.10.6';

    setHookCallback(local__createLocal);

    utils_hooks__hooks.fn                    = momentPrototype;
    utils_hooks__hooks.min                   = min;
    utils_hooks__hooks.max                   = max;
    utils_hooks__hooks.utc                   = create_utc__createUTC;
    utils_hooks__hooks.unix                  = moment_moment__createUnix;
    utils_hooks__hooks.months                = lists__listMonths;
    utils_hooks__hooks.isDate                = isDate;
    utils_hooks__hooks.locale                = locale_locales__getSetGlobalLocale;
    utils_hooks__hooks.invalid               = valid__createInvalid;
    utils_hooks__hooks.duration              = create__createDuration;
    utils_hooks__hooks.isMoment              = isMoment;
    utils_hooks__hooks.weekdays              = lists__listWeekdays;
    utils_hooks__hooks.parseZone             = moment_moment__createInZone;
    utils_hooks__hooks.localeData            = locale_locales__getLocale;
    utils_hooks__hooks.isDuration            = isDuration;
    utils_hooks__hooks.monthsShort           = lists__listMonthsShort;
    utils_hooks__hooks.weekdaysMin           = lists__listWeekdaysMin;
    utils_hooks__hooks.defineLocale          = defineLocale;
    utils_hooks__hooks.weekdaysShort         = lists__listWeekdaysShort;
    utils_hooks__hooks.normalizeUnits        = normalizeUnits;
    utils_hooks__hooks.relativeTimeThreshold = duration_humanize__getSetRelativeTimeThreshold;

    var _moment__default = utils_hooks__hooks;

    //! moment.js locale configuration
    //! locale : afrikaans (af)
    //! author : Werner Mollentze : https://github.com/wernerm

    var af = _moment__default.defineLocale('af', {
        months : 'Januarie_Februarie_Maart_April_Mei_Junie_Julie_Augustus_September_Oktober_November_Desember'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Aug_Sep_Okt_Nov_Des'.split('_'),
        weekdays : 'Sondag_Maandag_Dinsdag_Woensdag_Donderdag_Vrydag_Saterdag'.split('_'),
        weekdaysShort : 'Son_Maa_Din_Woe_Don_Vry_Sat'.split('_'),
        weekdaysMin : 'So_Ma_Di_Wo_Do_Vr_Sa'.split('_'),
        meridiemParse: /vm|nm/i,
        isPM : function (input) {
            return /^nm$/i.test(input);
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours < 12) {
                return isLower ? 'vm' : 'VM';
            } else {
                return isLower ? 'nm' : 'NM';
            }
        },
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay : '[Vandag om] LT',
            nextDay : '[MÃ´re om] LT',
            nextWeek : 'dddd [om] LT',
            lastDay : '[Gister om] LT',
            lastWeek : '[Laas] dddd [om] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'oor %s',
            past : '%s gelede',
            s : '\'n paar sekondes',
            m : '\'n minuut',
            mm : '%d minute',
            h : '\'n uur',
            hh : '%d ure',
            d : '\'n dag',
            dd : '%d dae',
            M : '\'n maand',
            MM : '%d maande',
            y : '\'n jaar',
            yy : '%d jaar'
        },
        ordinalParse: /\d{1,2}(ste|de)/,
        ordinal : function (number) {
            return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de'); // Thanks to Joris RÃ¶ling : https://github.com/jjupiter
        },
        week : {
            dow : 1, // Maandag is die eerste dag van die week.
            doy : 4  // Die week wat die 4de Januarie bevat is die eerste week van die jaar.
        }
    });

    //! moment.js locale configuration
    //! locale : Moroccan Arabic (ar-ma)
    //! author : ElFadili Yassine : https://github.com/ElFadiliY
    //! author : Abdel Said : https://github.com/abdelsaid

    var ar_ma = _moment__default.defineLocale('ar-ma', {
        months : 'ÙŠÙ†Ø§ÙŠØ±_ÙØ¨Ø±Ø§ÙŠØ±_Ù…Ø§Ø±Ø³_Ø£Ø¨Ø±ÙŠÙ„_Ù…Ø§ÙŠ_ÙŠÙˆÙ†ÙŠÙˆ_ÙŠÙˆÙ„ÙŠÙˆØ²_ØºØ´Øª_Ø´ØªÙ†Ø¨Ø±_Ø£ÙƒØªÙˆØ¨Ø±_Ù†ÙˆÙ†Ø¨Ø±_Ø¯Ø¬Ù†Ø¨Ø±'.split('_'),
        monthsShort : 'ÙŠÙ†Ø§ÙŠØ±_ÙØ¨Ø±Ø§ÙŠØ±_Ù…Ø§Ø±Ø³_Ø£Ø¨Ø±ÙŠÙ„_Ù…Ø§ÙŠ_ÙŠÙˆÙ†ÙŠÙˆ_ÙŠÙˆÙ„ÙŠÙˆØ²_ØºØ´Øª_Ø´ØªÙ†Ø¨Ø±_Ø£ÙƒØªÙˆØ¨Ø±_Ù†ÙˆÙ†Ø¨Ø±_Ø¯Ø¬Ù†Ø¨Ø±'.split('_'),
        weekdays : 'Ø§Ù„Ø£Ø­Ø¯_Ø§Ù„Ø¥ØªÙ†ÙŠÙ†_Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡_Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡_Ø§Ù„Ø®Ù…ÙŠØ³_Ø§Ù„Ø¬Ù…Ø¹Ø©_Ø§Ù„Ø³Ø¨Øª'.split('_'),
        weekdaysShort : 'Ø§Ø­Ø¯_Ø§ØªÙ†ÙŠÙ†_Ø«Ù„Ø§Ø«Ø§Ø¡_Ø§Ø±Ø¨Ø¹Ø§Ø¡_Ø®Ù…ÙŠØ³_Ø¬Ù…Ø¹Ø©_Ø³Ø¨Øª'.split('_'),
        weekdaysMin : 'Ø­_Ù†_Ø«_Ø±_Ø®_Ø¬_Ø³'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[Ø§Ù„ÙŠÙˆÙ… Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
            nextDay: '[ØºØ¯Ø§ Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
            nextWeek: 'dddd [Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
            lastDay: '[Ø£Ù…Ø³ Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
            lastWeek: 'dddd [Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'ÙÙŠ %s',
            past : 'Ù…Ù†Ø° %s',
            s : 'Ø«ÙˆØ§Ù†',
            m : 'Ø¯Ù‚ÙŠÙ‚Ø©',
            mm : '%d Ø¯Ù‚Ø§Ø¦Ù‚',
            h : 'Ø³Ø§Ø¹Ø©',
            hh : '%d Ø³Ø§Ø¹Ø§Øª',
            d : 'ÙŠÙˆÙ…',
            dd : '%d Ø£ÙŠØ§Ù…',
            M : 'Ø´Ù‡Ø±',
            MM : '%d Ø£Ø´Ù‡Ø±',
            y : 'Ø³Ù†Ø©',
            yy : '%d Ø³Ù†ÙˆØ§Øª'
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Arabic Saudi Arabia (ar-sa)
    //! author : Suhail Alkowaileet : https://github.com/xsoh

    var ar_sa__symbolMap = {
        '1': 'Ù¡',
        '2': 'Ù¢',
        '3': 'Ù£',
        '4': 'Ù¤',
        '5': 'Ù¥',
        '6': 'Ù¦',
        '7': 'Ù§',
        '8': 'Ù¨',
        '9': 'Ù©',
        '0': 'Ù '
    }, ar_sa__numberMap = {
        'Ù¡': '1',
        'Ù¢': '2',
        'Ù£': '3',
        'Ù¤': '4',
        'Ù¥': '5',
        'Ù¦': '6',
        'Ù§': '7',
        'Ù¨': '8',
        'Ù©': '9',
        'Ù ': '0'
    };

    var ar_sa = _moment__default.defineLocale('ar-sa', {
        months : 'ÙŠÙ†Ø§ÙŠØ±_ÙØ¨Ø±Ø§ÙŠØ±_Ù…Ø§Ø±Ø³_Ø£Ø¨Ø±ÙŠÙ„_Ù…Ø§ÙŠÙˆ_ÙŠÙˆÙ†ÙŠÙˆ_ÙŠÙˆÙ„ÙŠÙˆ_Ø£ØºØ³Ø·Ø³_Ø³Ø¨ØªÙ…Ø¨Ø±_Ø£ÙƒØªÙˆØ¨Ø±_Ù†ÙˆÙÙ…Ø¨Ø±_Ø¯ÙŠØ³Ù…Ø¨Ø±'.split('_'),
        monthsShort : 'ÙŠÙ†Ø§ÙŠØ±_ÙØ¨Ø±Ø§ÙŠØ±_Ù…Ø§Ø±Ø³_Ø£Ø¨Ø±ÙŠÙ„_Ù…Ø§ÙŠÙˆ_ÙŠÙˆÙ†ÙŠÙˆ_ÙŠÙˆÙ„ÙŠÙˆ_Ø£ØºØ³Ø·Ø³_Ø³Ø¨ØªÙ…Ø¨Ø±_Ø£ÙƒØªÙˆØ¨Ø±_Ù†ÙˆÙÙ…Ø¨Ø±_Ø¯ÙŠØ³Ù…Ø¨Ø±'.split('_'),
        weekdays : 'Ø§Ù„Ø£Ø­Ø¯_Ø§Ù„Ø¥Ø«Ù†ÙŠÙ†_Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡_Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡_Ø§Ù„Ø®Ù…ÙŠØ³_Ø§Ù„Ø¬Ù…Ø¹Ø©_Ø§Ù„Ø³Ø¨Øª'.split('_'),
        weekdaysShort : 'Ø£Ø­Ø¯_Ø¥Ø«Ù†ÙŠÙ†_Ø«Ù„Ø§Ø«Ø§Ø¡_Ø£Ø±Ø¨Ø¹Ø§Ø¡_Ø®Ù…ÙŠØ³_Ø¬Ù…Ø¹Ø©_Ø³Ø¨Øª'.split('_'),
        weekdaysMin : 'Ø­_Ù†_Ø«_Ø±_Ø®_Ø¬_Ø³'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        meridiemParse: /Øµ|Ù…/,
        isPM : function (input) {
            return 'Ù…' === input;
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return 'Øµ';
            } else {
                return 'Ù…';
            }
        },
        calendar : {
            sameDay: '[Ø§Ù„ÙŠÙˆÙ… Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
            nextDay: '[ØºØ¯Ø§ Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
            nextWeek: 'dddd [Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
            lastDay: '[Ø£Ù…Ø³ Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
            lastWeek: 'dddd [Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'ÙÙŠ %s',
            past : 'Ù…Ù†Ø° %s',
            s : 'Ø«ÙˆØ§Ù†',
            m : 'Ø¯Ù‚ÙŠÙ‚Ø©',
            mm : '%d Ø¯Ù‚Ø§Ø¦Ù‚',
            h : 'Ø³Ø§Ø¹Ø©',
            hh : '%d Ø³Ø§Ø¹Ø§Øª',
            d : 'ÙŠÙˆÙ…',
            dd : '%d Ø£ÙŠØ§Ù…',
            M : 'Ø´Ù‡Ø±',
            MM : '%d Ø£Ø´Ù‡Ø±',
            y : 'Ø³Ù†Ø©',
            yy : '%d Ø³Ù†ÙˆØ§Øª'
        },
        preparse: function (string) {
            return string.replace(/[Ù¡Ù¢Ù£Ù¤Ù¥Ù¦Ù§Ù¨Ù©Ù ]/g, function (match) {
                return ar_sa__numberMap[match];
            }).replace(/ØŒ/g, ',');
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return ar_sa__symbolMap[match];
            }).replace(/,/g, 'ØŒ');
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale  : Tunisian Arabic (ar-tn)

    var ar_tn = _moment__default.defineLocale('ar-tn', {
        months: 'Ø¬Ø§Ù†ÙÙŠ_ÙÙŠÙØ±ÙŠ_Ù…Ø§Ø±Ø³_Ø£ÙØ±ÙŠÙ„_Ù…Ø§ÙŠ_Ø¬ÙˆØ§Ù†_Ø¬ÙˆÙŠÙ„ÙŠØ©_Ø£ÙˆØª_Ø³Ø¨ØªÙ…Ø¨Ø±_Ø£ÙƒØªÙˆØ¨Ø±_Ù†ÙˆÙÙ…Ø¨Ø±_Ø¯ÙŠØ³Ù…Ø¨Ø±'.split('_'),
        monthsShort: 'Ø¬Ø§Ù†ÙÙŠ_ÙÙŠÙØ±ÙŠ_Ù…Ø§Ø±Ø³_Ø£ÙØ±ÙŠÙ„_Ù…Ø§ÙŠ_Ø¬ÙˆØ§Ù†_Ø¬ÙˆÙŠÙ„ÙŠØ©_Ø£ÙˆØª_Ø³Ø¨ØªÙ…Ø¨Ø±_Ø£ÙƒØªÙˆØ¨Ø±_Ù†ÙˆÙÙ…Ø¨Ø±_Ø¯ÙŠØ³Ù…Ø¨Ø±'.split('_'),
        weekdays: 'Ø§Ù„Ø£Ø­Ø¯_Ø§Ù„Ø¥Ø«Ù†ÙŠÙ†_Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡_Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡_Ø§Ù„Ø®Ù…ÙŠØ³_Ø§Ù„Ø¬Ù…Ø¹Ø©_Ø§Ù„Ø³Ø¨Øª'.split('_'),
        weekdaysShort: 'Ø£Ø­Ø¯_Ø¥Ø«Ù†ÙŠÙ†_Ø«Ù„Ø§Ø«Ø§Ø¡_Ø£Ø±Ø¨Ø¹Ø§Ø¡_Ø®Ù…ÙŠØ³_Ø¬Ù…Ø¹Ø©_Ø³Ø¨Øª'.split('_'),
        weekdaysMin: 'Ø­_Ù†_Ø«_Ø±_Ø®_Ø¬_Ø³'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd D MMMM YYYY HH:mm'
        },
        calendar: {
            sameDay: '[Ø§Ù„ÙŠÙˆÙ… Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
            nextDay: '[ØºØ¯Ø§ Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
            nextWeek: 'dddd [Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
            lastDay: '[Ø£Ù…Ø³ Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
            lastWeek: 'dddd [Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'ÙÙŠ %s',
            past: 'Ù…Ù†Ø° %s',
            s: 'Ø«ÙˆØ§Ù†',
            m: 'Ø¯Ù‚ÙŠÙ‚Ø©',
            mm: '%d Ø¯Ù‚Ø§Ø¦Ù‚',
            h: 'Ø³Ø§Ø¹Ø©',
            hh: '%d Ø³Ø§Ø¹Ø§Øª',
            d: 'ÙŠÙˆÙ…',
            dd: '%d Ø£ÙŠØ§Ù…',
            M: 'Ø´Ù‡Ø±',
            MM: '%d Ø£Ø´Ù‡Ø±',
            y: 'Ø³Ù†Ø©',
            yy: '%d Ø³Ù†ÙˆØ§Øª'
        },
        week: {
            dow: 1, // Monday is the first day of the week.
            doy: 4 // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! Locale: Arabic (ar)
    //! Author: Abdel Said: https://github.com/abdelsaid
    //! Changes in months, weekdays: Ahmed Elkhatib
    //! Native plural forms: forabi https://github.com/forabi

    var ar__symbolMap = {
        '1': 'Ù¡',
        '2': 'Ù¢',
        '3': 'Ù£',
        '4': 'Ù¤',
        '5': 'Ù¥',
        '6': 'Ù¦',
        '7': 'Ù§',
        '8': 'Ù¨',
        '9': 'Ù©',
        '0': 'Ù '
    }, ar__numberMap = {
        'Ù¡': '1',
        'Ù¢': '2',
        'Ù£': '3',
        'Ù¤': '4',
        'Ù¥': '5',
        'Ù¦': '6',
        'Ù§': '7',
        'Ù¨': '8',
        'Ù©': '9',
        'Ù ': '0'
    }, pluralForm = function (n) {
        return n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5;
    }, plurals = {
        s : ['Ø£Ù‚Ù„ Ù…Ù† Ø«Ø§Ù†ÙŠØ©', 'Ø«Ø§Ù†ÙŠØ© ÙˆØ§Ø­Ø¯Ø©', ['Ø«Ø§Ù†ÙŠØªØ§Ù†', 'Ø«Ø§Ù†ÙŠØªÙŠÙ†'], '%d Ø«ÙˆØ§Ù†', '%d Ø«Ø§Ù†ÙŠØ©', '%d Ø«Ø§Ù†ÙŠØ©'],
        m : ['Ø£Ù‚Ù„ Ù…Ù† Ø¯Ù‚ÙŠÙ‚Ø©', 'Ø¯Ù‚ÙŠÙ‚Ø© ÙˆØ§Ø­Ø¯Ø©', ['Ø¯Ù‚ÙŠÙ‚ØªØ§Ù†', 'Ø¯Ù‚ÙŠÙ‚ØªÙŠÙ†'], '%d Ø¯Ù‚Ø§Ø¦Ù‚', '%d Ø¯Ù‚ÙŠÙ‚Ø©', '%d Ø¯Ù‚ÙŠÙ‚Ø©'],
        h : ['Ø£Ù‚Ù„ Ù…Ù† Ø³Ø§Ø¹Ø©', 'Ø³Ø§Ø¹Ø© ÙˆØ§Ø­Ø¯Ø©', ['Ø³Ø§Ø¹ØªØ§Ù†', 'Ø³Ø§Ø¹ØªÙŠÙ†'], '%d Ø³Ø§Ø¹Ø§Øª', '%d Ø³Ø§Ø¹Ø©', '%d Ø³Ø§Ø¹Ø©'],
        d : ['Ø£Ù‚Ù„ Ù…Ù† ÙŠÙˆÙ…', 'ÙŠÙˆÙ… ÙˆØ§Ø­Ø¯', ['ÙŠÙˆÙ…Ø§Ù†', 'ÙŠÙˆÙ…ÙŠÙ†'], '%d Ø£ÙŠØ§Ù…', '%d ÙŠÙˆÙ…Ù‹Ø§', '%d ÙŠÙˆÙ…'],
        M : ['Ø£Ù‚Ù„ Ù…Ù† Ø´Ù‡Ø±', 'Ø´Ù‡Ø± ÙˆØ§Ø­Ø¯', ['Ø´Ù‡Ø±Ø§Ù†', 'Ø´Ù‡Ø±ÙŠÙ†'], '%d Ø£Ø´Ù‡Ø±', '%d Ø´Ù‡Ø±Ø§', '%d Ø´Ù‡Ø±'],
        y : ['Ø£Ù‚Ù„ Ù…Ù† Ø¹Ø§Ù…', 'Ø¹Ø§Ù… ÙˆØ§Ø­Ø¯', ['Ø¹Ø§Ù…Ø§Ù†', 'Ø¹Ø§Ù…ÙŠÙ†'], '%d Ø£Ø¹ÙˆØ§Ù…', '%d Ø¹Ø§Ù…Ù‹Ø§', '%d Ø¹Ø§Ù…']
    }, pluralize = function (u) {
        return function (number, withoutSuffix, string, isFuture) {
            var f = pluralForm(number),
                str = plurals[u][pluralForm(number)];
            if (f === 2) {
                str = str[withoutSuffix ? 0 : 1];
            }
            return str.replace(/%d/i, number);
        };
    }, ar__months = [
        'ÙƒØ§Ù†ÙˆÙ† Ø§Ù„Ø«Ø§Ù†ÙŠ ÙŠÙ†Ø§ÙŠØ±',
        'Ø´Ø¨Ø§Ø· ÙØ¨Ø±Ø§ÙŠØ±',
        'Ø¢Ø°Ø§Ø± Ù…Ø§Ø±Ø³',
        'Ù†ÙŠØ³Ø§Ù† Ø£Ø¨Ø±ÙŠÙ„',
        'Ø£ÙŠØ§Ø± Ù…Ø§ÙŠÙˆ',
        'Ø­Ø²ÙŠØ±Ø§Ù† ÙŠÙˆÙ†ÙŠÙˆ',
        'ØªÙ…ÙˆØ² ÙŠÙˆÙ„ÙŠÙˆ',
        'Ø¢Ø¨ Ø£ØºØ³Ø·Ø³',
        'Ø£ÙŠÙ„ÙˆÙ„ Ø³Ø¨ØªÙ…Ø¨Ø±',
        'ØªØ´Ø±ÙŠÙ† Ø§Ù„Ø£ÙˆÙ„ Ø£ÙƒØªÙˆØ¨Ø±',
        'ØªØ´Ø±ÙŠÙ† Ø§Ù„Ø«Ø§Ù†ÙŠ Ù†ÙˆÙÙ…Ø¨Ø±',
        'ÙƒØ§Ù†ÙˆÙ† Ø§Ù„Ø£ÙˆÙ„ Ø¯ÙŠØ³Ù…Ø¨Ø±'
    ];

    var ar = _moment__default.defineLocale('ar', {
        months : ar__months,
        monthsShort : ar__months,
        weekdays : 'Ø§Ù„Ø£Ø­Ø¯_Ø§Ù„Ø¥Ø«Ù†ÙŠÙ†_Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡_Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡_Ø§Ù„Ø®Ù…ÙŠØ³_Ø§Ù„Ø¬Ù…Ø¹Ø©_Ø§Ù„Ø³Ø¨Øª'.split('_'),
        weekdaysShort : 'Ø£Ø­Ø¯_Ø¥Ø«Ù†ÙŠÙ†_Ø«Ù„Ø§Ø«Ø§Ø¡_Ø£Ø±Ø¨Ø¹Ø§Ø¡_Ø®Ù…ÙŠØ³_Ø¬Ù…Ø¹Ø©_Ø³Ø¨Øª'.split('_'),
        weekdaysMin : 'Ø­_Ù†_Ø«_Ø±_Ø®_Ø¬_Ø³'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'D/\u200FM/\u200FYYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        meridiemParse: /Øµ|Ù…/,
        isPM : function (input) {
            return 'Ù…' === input;
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return 'Øµ';
            } else {
                return 'Ù…';
            }
        },
        calendar : {
            sameDay: '[Ø§Ù„ÙŠÙˆÙ… Ø¹Ù†Ø¯ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
            nextDay: '[ØºØ¯Ù‹Ø§ Ø¹Ù†Ø¯ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
            nextWeek: 'dddd [Ø¹Ù†Ø¯ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
            lastDay: '[Ø£Ù…Ø³ Ø¹Ù†Ø¯ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
            lastWeek: 'dddd [Ø¹Ù†Ø¯ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'Ø¨Ø¹Ø¯ %s',
            past : 'Ù…Ù†Ø° %s',
            s : pluralize('s'),
            m : pluralize('m'),
            mm : pluralize('m'),
            h : pluralize('h'),
            hh : pluralize('h'),
            d : pluralize('d'),
            dd : pluralize('d'),
            M : pluralize('M'),
            MM : pluralize('M'),
            y : pluralize('y'),
            yy : pluralize('y')
        },
        preparse: function (string) {
            return string.replace(/\u200f/g, '').replace(/[Ù¡Ù¢Ù£Ù¤Ù¥Ù¦Ù§Ù¨Ù©Ù ]/g, function (match) {
                return ar__numberMap[match];
            }).replace(/ØŒ/g, ',');
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return ar__symbolMap[match];
            }).replace(/,/g, 'ØŒ');
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : azerbaijani (az)
    //! author : topchiyev : https://github.com/topchiyev

    var az__suffixes = {
        1: '-inci',
        5: '-inci',
        8: '-inci',
        70: '-inci',
        80: '-inci',
        2: '-nci',
        7: '-nci',
        20: '-nci',
        50: '-nci',
        3: '-Ã¼ncÃ¼',
        4: '-Ã¼ncÃ¼',
        100: '-Ã¼ncÃ¼',
        6: '-ncÄ±',
        9: '-uncu',
        10: '-uncu',
        30: '-uncu',
        60: '-Ä±ncÄ±',
        90: '-Ä±ncÄ±'
    };

    var az = _moment__default.defineLocale('az', {
        months : 'yanvar_fevral_mart_aprel_may_iyun_iyul_avqust_sentyabr_oktyabr_noyabr_dekabr'.split('_'),
        monthsShort : 'yan_fev_mar_apr_may_iyn_iyl_avq_sen_okt_noy_dek'.split('_'),
        weekdays : 'Bazar_Bazar ertÉ™si_Ã‡É™rÅŸÉ™nbÉ™ axÅŸamÄ±_Ã‡É™rÅŸÉ™nbÉ™_CÃ¼mÉ™ axÅŸamÄ±_CÃ¼mÉ™_ÅžÉ™nbÉ™'.split('_'),
        weekdaysShort : 'Baz_BzE_Ã‡Ax_Ã‡É™r_CAx_CÃ¼m_ÅžÉ™n'.split('_'),
        weekdaysMin : 'Bz_BE_Ã‡A_Ã‡É™_CA_CÃ¼_ÅžÉ™'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay : '[bugÃ¼n saat] LT',
            nextDay : '[sabah saat] LT',
            nextWeek : '[gÉ™lÉ™n hÉ™ftÉ™] dddd [saat] LT',
            lastDay : '[dÃ¼nÉ™n] LT',
            lastWeek : '[keÃ§É™n hÉ™ftÉ™] dddd [saat] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s sonra',
            past : '%s É™vvÉ™l',
            s : 'birneÃ§É™ saniyyÉ™',
            m : 'bir dÉ™qiqÉ™',
            mm : '%d dÉ™qiqÉ™',
            h : 'bir saat',
            hh : '%d saat',
            d : 'bir gÃ¼n',
            dd : '%d gÃ¼n',
            M : 'bir ay',
            MM : '%d ay',
            y : 'bir il',
            yy : '%d il'
        },
        meridiemParse: /gecÉ™|sÉ™hÉ™r|gÃ¼ndÃ¼z|axÅŸam/,
        isPM : function (input) {
            return /^(gÃ¼ndÃ¼z|axÅŸam)$/.test(input);
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'gecÉ™';
            } else if (hour < 12) {
                return 'sÉ™hÉ™r';
            } else if (hour < 17) {
                return 'gÃ¼ndÃ¼z';
            } else {
                return 'axÅŸam';
            }
        },
        ordinalParse: /\d{1,2}-(Ä±ncÄ±|inci|nci|Ã¼ncÃ¼|ncÄ±|uncu)/,
        ordinal : function (number) {
            if (number === 0) {  // special case for zero
                return number + '-Ä±ncÄ±';
            }
            var a = number % 10,
                b = number % 100 - a,
                c = number >= 100 ? 100 : null;
            return number + (az__suffixes[a] || az__suffixes[b] || az__suffixes[c]);
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : belarusian (be)
    //! author : Dmitry Demidov : https://github.com/demidov91
    //! author: Praleska: http://praleska.pro/
    //! Author : Menelion ElensÃºle : https://github.com/Oire

    function be__plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
    }
    function be__relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
            'mm': withoutSuffix ? 'Ñ…Ð²Ñ–Ð»Ñ–Ð½Ð°_Ñ…Ð²Ñ–Ð»Ñ–Ð½Ñ‹_Ñ…Ð²Ñ–Ð»Ñ–Ð½' : 'Ñ…Ð²Ñ–Ð»Ñ–Ð½Ñƒ_Ñ…Ð²Ñ–Ð»Ñ–Ð½Ñ‹_Ñ…Ð²Ñ–Ð»Ñ–Ð½',
            'hh': withoutSuffix ? 'Ð³Ð°Ð´Ð·Ñ–Ð½Ð°_Ð³Ð°Ð´Ð·Ñ–Ð½Ñ‹_Ð³Ð°Ð´Ð·Ñ–Ð½' : 'Ð³Ð°Ð´Ð·Ñ–Ð½Ñƒ_Ð³Ð°Ð´Ð·Ñ–Ð½Ñ‹_Ð³Ð°Ð´Ð·Ñ–Ð½',
            'dd': 'Ð´Ð·ÐµÐ½ÑŒ_Ð´Ð½Ñ–_Ð´Ð·Ñ‘Ð½',
            'MM': 'Ð¼ÐµÑÑÑ†_Ð¼ÐµÑÑÑ†Ñ‹_Ð¼ÐµÑÑÑ†Ð°Ñž',
            'yy': 'Ð³Ð¾Ð´_Ð³Ð°Ð´Ñ‹_Ð³Ð°Ð´Ð¾Ñž'
        };
        if (key === 'm') {
            return withoutSuffix ? 'Ñ…Ð²Ñ–Ð»Ñ–Ð½Ð°' : 'Ñ…Ð²Ñ–Ð»Ñ–Ð½Ñƒ';
        }
        else if (key === 'h') {
            return withoutSuffix ? 'Ð³Ð°Ð´Ð·Ñ–Ð½Ð°' : 'Ð³Ð°Ð´Ð·Ñ–Ð½Ñƒ';
        }
        else {
            return number + ' ' + be__plural(format[key], +number);
        }
    }
    function be__monthsCaseReplace(m, format) {
        var months = {
            'nominative': 'ÑÑ‚ÑƒÐ´Ð·ÐµÐ½ÑŒ_Ð»ÑŽÑ‚Ñ‹_ÑÐ°ÐºÐ°Ð²Ñ–Ðº_ÐºÑ€Ð°ÑÐ°Ð²Ñ–Ðº_Ñ‚Ñ€Ð°Ð²ÐµÐ½ÑŒ_Ñ‡ÑÑ€Ð²ÐµÐ½ÑŒ_Ð»Ñ–Ð¿ÐµÐ½ÑŒ_Ð¶Ð½Ñ–Ð²ÐµÐ½ÑŒ_Ð²ÐµÑ€Ð°ÑÐµÐ½ÑŒ_ÐºÐ°ÑÑ‚Ñ€Ñ‹Ñ‡Ð½Ñ–Ðº_Ð»Ñ–ÑÑ‚Ð°Ð¿Ð°Ð´_ÑÐ½ÐµÐ¶Ð°Ð½ÑŒ'.split('_'),
            'accusative': 'ÑÑ‚ÑƒÐ´Ð·ÐµÐ½Ñ_Ð»ÑŽÑ‚Ð°Ð³Ð°_ÑÐ°ÐºÐ°Ð²Ñ–ÐºÐ°_ÐºÑ€Ð°ÑÐ°Ð²Ñ–ÐºÐ°_Ñ‚Ñ€Ð°ÑžÐ½Ñ_Ñ‡ÑÑ€Ð²ÐµÐ½Ñ_Ð»Ñ–Ð¿ÐµÐ½Ñ_Ð¶Ð½Ñ–ÑžÐ½Ñ_Ð²ÐµÑ€Ð°ÑÐ½Ñ_ÐºÐ°ÑÑ‚Ñ€Ñ‹Ñ‡Ð½Ñ–ÐºÐ°_Ð»Ñ–ÑÑ‚Ð°Ð¿Ð°Ð´Ð°_ÑÐ½ÐµÐ¶Ð½Ñ'.split('_')
        },
        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
            'accusative' :
            'nominative';
        return months[nounCase][m.month()];
    }
    function be__weekdaysCaseReplace(m, format) {
        var weekdays = {
            'nominative': 'Ð½ÑÐ´Ð·ÐµÐ»Ñ_Ð¿Ð°Ð½ÑÐ´Ð·ÐµÐ»Ð°Ðº_Ð°ÑžÑ‚Ð¾Ñ€Ð°Ðº_ÑÐµÑ€Ð°Ð´Ð°_Ñ‡Ð°Ñ†Ð²ÐµÑ€_Ð¿ÑÑ‚Ð½Ñ–Ñ†Ð°_ÑÑƒÐ±Ð¾Ñ‚Ð°'.split('_'),
            'accusative': 'Ð½ÑÐ´Ð·ÐµÐ»ÑŽ_Ð¿Ð°Ð½ÑÐ´Ð·ÐµÐ»Ð°Ðº_Ð°ÑžÑ‚Ð¾Ñ€Ð°Ðº_ÑÐµÑ€Ð°Ð´Ñƒ_Ñ‡Ð°Ñ†Ð²ÐµÑ€_Ð¿ÑÑ‚Ð½Ñ–Ñ†Ñƒ_ÑÑƒÐ±Ð¾Ñ‚Ñƒ'.split('_')
        },
        nounCase = (/\[ ?[Ð’Ð²] ?(?:Ð¼Ñ–Ð½ÑƒÐ»ÑƒÑŽ|Ð½Ð°ÑÑ‚ÑƒÐ¿Ð½ÑƒÑŽ)? ?\] ?dddd/).test(format) ?
            'accusative' :
            'nominative';
        return weekdays[nounCase][m.day()];
    }

    var be = _moment__default.defineLocale('be', {
        months : be__monthsCaseReplace,
        monthsShort : 'ÑÑ‚ÑƒÐ´_Ð»ÑŽÑ‚_ÑÐ°Ðº_ÐºÑ€Ð°Ñ_Ñ‚Ñ€Ð°Ð²_Ñ‡ÑÑ€Ð²_Ð»Ñ–Ð¿_Ð¶Ð½Ñ–Ð²_Ð²ÐµÑ€_ÐºÐ°ÑÑ‚_Ð»Ñ–ÑÑ‚_ÑÐ½ÐµÐ¶'.split('_'),
        weekdays : be__weekdaysCaseReplace,
        weekdaysShort : 'Ð½Ð´_Ð¿Ð½_Ð°Ñ‚_ÑÑ€_Ñ‡Ñ†_Ð¿Ñ‚_ÑÐ±'.split('_'),
        weekdaysMin : 'Ð½Ð´_Ð¿Ð½_Ð°Ñ‚_ÑÑ€_Ñ‡Ñ†_Ð¿Ñ‚_ÑÐ±'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY Ð³.',
            LLL : 'D MMMM YYYY Ð³., HH:mm',
            LLLL : 'dddd, D MMMM YYYY Ð³., HH:mm'
        },
        calendar : {
            sameDay: '[Ð¡Ñ‘Ð½Ð½Ñ Ñž] LT',
            nextDay: '[Ð—Ð°ÑžÑ‚Ñ€Ð° Ñž] LT',
            lastDay: '[Ð£Ñ‡Ð¾Ñ€Ð° Ñž] LT',
            nextWeek: function () {
                return '[Ð£] dddd [Ñž] LT';
            },
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 5:
                case 6:
                    return '[Ð£ Ð¼Ñ–Ð½ÑƒÐ»ÑƒÑŽ] dddd [Ñž] LT';
                case 1:
                case 2:
                case 4:
                    return '[Ð£ Ð¼Ñ–Ð½ÑƒÐ»Ñ‹] dddd [Ñž] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'Ð¿Ñ€Ð°Ð· %s',
            past : '%s Ñ‚Ð°Ð¼Ñƒ',
            s : 'Ð½ÐµÐºÐ°Ð»ÑŒÐºÑ– ÑÐµÐºÑƒÐ½Ð´',
            m : be__relativeTimeWithPlural,
            mm : be__relativeTimeWithPlural,
            h : be__relativeTimeWithPlural,
            hh : be__relativeTimeWithPlural,
            d : 'Ð´Ð·ÐµÐ½ÑŒ',
            dd : be__relativeTimeWithPlural,
            M : 'Ð¼ÐµÑÑÑ†',
            MM : be__relativeTimeWithPlural,
            y : 'Ð³Ð¾Ð´',
            yy : be__relativeTimeWithPlural
        },
        meridiemParse: /Ð½Ð¾Ñ‡Ñ‹|Ñ€Ð°Ð½Ñ–Ñ†Ñ‹|Ð´Ð½Ñ|Ð²ÐµÑ‡Ð°Ñ€Ð°/,
        isPM : function (input) {
            return /^(Ð´Ð½Ñ|Ð²ÐµÑ‡Ð°Ñ€Ð°)$/.test(input);
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'Ð½Ð¾Ñ‡Ñ‹';
            } else if (hour < 12) {
                return 'Ñ€Ð°Ð½Ñ–Ñ†Ñ‹';
            } else if (hour < 17) {
                return 'Ð´Ð½Ñ';
            } else {
                return 'Ð²ÐµÑ‡Ð°Ñ€Ð°';
            }
        },
        ordinalParse: /\d{1,2}-(Ñ–|Ñ‹|Ð³Ð°)/,
        ordinal: function (number, period) {
            switch (period) {
            case 'M':
            case 'd':
            case 'DDD':
            case 'w':
            case 'W':
                return (number % 10 === 2 || number % 10 === 3) && (number % 100 !== 12 && number % 100 !== 13) ? number + '-Ñ–' : number + '-Ñ‹';
            case 'D':
                return number + '-Ð³Ð°';
            default:
                return number;
            }
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : bulgarian (bg)
    //! author : Krasen Borisov : https://github.com/kraz

    var bg = _moment__default.defineLocale('bg', {
        months : 'ÑÐ½ÑƒÐ°Ñ€Ð¸_Ñ„ÐµÐ²Ñ€ÑƒÐ°Ñ€Ð¸_Ð¼Ð°Ñ€Ñ‚_Ð°Ð¿Ñ€Ð¸Ð»_Ð¼Ð°Ð¹_ÑŽÐ½Ð¸_ÑŽÐ»Ð¸_Ð°Ð²Ð³ÑƒÑÑ‚_ÑÐµÐ¿Ñ‚ÐµÐ¼Ð²Ñ€Ð¸_Ð¾ÐºÑ‚Ð¾Ð¼Ð²Ñ€Ð¸_Ð½Ð¾ÐµÐ¼Ð²Ñ€Ð¸_Ð´ÐµÐºÐµÐ¼Ð²Ñ€Ð¸'.split('_'),
        monthsShort : 'ÑÐ½Ñ€_Ñ„ÐµÐ²_Ð¼Ð°Ñ€_Ð°Ð¿Ñ€_Ð¼Ð°Ð¹_ÑŽÐ½Ð¸_ÑŽÐ»Ð¸_Ð°Ð²Ð³_ÑÐµÐ¿_Ð¾ÐºÑ‚_Ð½Ð¾Ðµ_Ð´ÐµÐº'.split('_'),
        weekdays : 'Ð½ÐµÐ´ÐµÐ»Ñ_Ð¿Ð¾Ð½ÐµÐ´ÐµÐ»Ð½Ð¸Ðº_Ð²Ñ‚Ð¾Ñ€Ð½Ð¸Ðº_ÑÑ€ÑÐ´Ð°_Ñ‡ÐµÑ‚Ð²ÑŠÑ€Ñ‚ÑŠÐº_Ð¿ÐµÑ‚ÑŠÐº_ÑÑŠÐ±Ð¾Ñ‚Ð°'.split('_'),
        weekdaysShort : 'Ð½ÐµÐ´_Ð¿Ð¾Ð½_Ð²Ñ‚Ð¾_ÑÑ€Ñ_Ñ‡ÐµÑ‚_Ð¿ÐµÑ‚_ÑÑŠÐ±'.split('_'),
        weekdaysMin : 'Ð½Ð´_Ð¿Ð½_Ð²Ñ‚_ÑÑ€_Ñ‡Ñ‚_Ð¿Ñ‚_ÑÐ±'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'D.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY H:mm',
            LLLL : 'dddd, D MMMM YYYY H:mm'
        },
        calendar : {
            sameDay : '[Ð”Ð½ÐµÑ Ð²] LT',
            nextDay : '[Ð£Ñ‚Ñ€Ðµ Ð²] LT',
            nextWeek : 'dddd [Ð²] LT',
            lastDay : '[Ð’Ñ‡ÐµÑ€Ð° Ð²] LT',
            lastWeek : function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 6:
                    return '[Ð’ Ð¸Ð·Ð¼Ð¸Ð½Ð°Ð»Ð°Ñ‚Ð°] dddd [Ð²] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[Ð’ Ð¸Ð·Ð¼Ð¸Ð½Ð°Ð»Ð¸Ñ] dddd [Ð²] LT';
                }
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'ÑÐ»ÐµÐ´ %s',
            past : 'Ð¿Ñ€ÐµÐ´Ð¸ %s',
            s : 'Ð½ÑÐºÐ¾Ð»ÐºÐ¾ ÑÐµÐºÑƒÐ½Ð´Ð¸',
            m : 'Ð¼Ð¸Ð½ÑƒÑ‚Ð°',
            mm : '%d Ð¼Ð¸Ð½ÑƒÑ‚Ð¸',
            h : 'Ñ‡Ð°Ñ',
            hh : '%d Ñ‡Ð°ÑÐ°',
            d : 'Ð´ÐµÐ½',
            dd : '%d Ð´Ð½Ð¸',
            M : 'Ð¼ÐµÑÐµÑ†',
            MM : '%d Ð¼ÐµÑÐµÑ†Ð°',
            y : 'Ð³Ð¾Ð´Ð¸Ð½Ð°',
            yy : '%d Ð³Ð¾Ð´Ð¸Ð½Ð¸'
        },
        ordinalParse: /\d{1,2}-(ÐµÐ²|ÐµÐ½|Ñ‚Ð¸|Ð²Ð¸|Ñ€Ð¸|Ð¼Ð¸)/,
        ordinal : function (number) {
            var lastDigit = number % 10,
                last2Digits = number % 100;
            if (number === 0) {
                return number + '-ÐµÐ²';
            } else if (last2Digits === 0) {
                return number + '-ÐµÐ½';
            } else if (last2Digits > 10 && last2Digits < 20) {
                return number + '-Ñ‚Ð¸';
            } else if (lastDigit === 1) {
                return number + '-Ð²Ð¸';
            } else if (lastDigit === 2) {
                return number + '-Ñ€Ð¸';
            } else if (lastDigit === 7 || lastDigit === 8) {
                return number + '-Ð¼Ð¸';
            } else {
                return number + '-Ñ‚Ð¸';
            }
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Bengali (bn)
    //! author : Kaushik Gandhi : https://github.com/kaushikgandhi

    var bn__symbolMap = {
        '1': 'à§§',
        '2': 'à§¨',
        '3': 'à§©',
        '4': 'à§ª',
        '5': 'à§«',
        '6': 'à§¬',
        '7': 'à§­',
        '8': 'à§®',
        '9': 'à§¯',
        '0': 'à§¦'
    },
    bn__numberMap = {
        'à§§': '1',
        'à§¨': '2',
        'à§©': '3',
        'à§ª': '4',
        'à§«': '5',
        'à§¬': '6',
        'à§­': '7',
        'à§®': '8',
        'à§¯': '9',
        'à§¦': '0'
    };

    var bn = _moment__default.defineLocale('bn', {
        months : 'à¦œà¦¾à¦¨à§à§Ÿà¦¾à¦°à§€_à¦«à§‡à¦¬à§à§Ÿà¦¾à¦°à§€_à¦®à¦¾à¦°à§à¦š_à¦à¦ªà§à¦°à¦¿à¦²_à¦®à§‡_à¦œà§à¦¨_à¦œà§à¦²à¦¾à¦‡_à¦…à¦—à¦¾à¦¸à§à¦Ÿ_à¦¸à§‡à¦ªà§à¦Ÿà§‡à¦®à§à¦¬à¦°_à¦…à¦•à§à¦Ÿà§‹à¦¬à¦°_à¦¨à¦­à§‡à¦®à§à¦¬à¦°_à¦¡à¦¿à¦¸à§‡à¦®à§à¦¬à¦°'.split('_'),
        monthsShort : 'à¦œà¦¾à¦¨à§_à¦«à§‡à¦¬_à¦®à¦¾à¦°à§à¦š_à¦à¦ªà¦°_à¦®à§‡_à¦œà§à¦¨_à¦œà§à¦²_à¦…à¦—_à¦¸à§‡à¦ªà§à¦Ÿ_à¦…à¦•à§à¦Ÿà§‹_à¦¨à¦­_à¦¡à¦¿à¦¸à§‡à¦®à§'.split('_'),
        weekdays : 'à¦°à¦¬à¦¿à¦¬à¦¾à¦°_à¦¸à§‹à¦®à¦¬à¦¾à¦°_à¦®à¦™à§à¦—à¦²à¦¬à¦¾à¦°_à¦¬à§à¦§à¦¬à¦¾à¦°_à¦¬à§ƒà¦¹à¦¸à§à¦ªà¦¤à§à¦¤à¦¿à¦¬à¦¾à¦°_à¦¶à§à¦•à§à¦°à§à¦¬à¦¾à¦°_à¦¶à¦¨à¦¿à¦¬à¦¾à¦°'.split('_'),
        weekdaysShort : 'à¦°à¦¬à¦¿_à¦¸à§‹à¦®_à¦®à¦™à§à¦—à¦²_à¦¬à§à¦§_à¦¬à§ƒà¦¹à¦¸à§à¦ªà¦¤à§à¦¤à¦¿_à¦¶à§à¦•à§à¦°à§_à¦¶à¦¨à¦¿'.split('_'),
        weekdaysMin : 'à¦°à¦¬_à¦¸à¦®_à¦®à¦™à§à¦—_à¦¬à§_à¦¬à§à¦°à¦¿à¦¹_à¦¶à§_à¦¶à¦¨à¦¿'.split('_'),
        longDateFormat : {
            LT : 'A h:mm à¦¸à¦®à§Ÿ',
            LTS : 'A h:mm:ss à¦¸à¦®à§Ÿ',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, A h:mm à¦¸à¦®à§Ÿ',
            LLLL : 'dddd, D MMMM YYYY, A h:mm à¦¸à¦®à§Ÿ'
        },
        calendar : {
            sameDay : '[à¦†à¦œ] LT',
            nextDay : '[à¦†à¦—à¦¾à¦®à§€à¦•à¦¾à¦²] LT',
            nextWeek : 'dddd, LT',
            lastDay : '[à¦—à¦¤à¦•à¦¾à¦²] LT',
            lastWeek : '[à¦—à¦¤] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s à¦ªà¦°à§‡',
            past : '%s à¦†à¦—à§‡',
            s : 'à¦•à¦à¦• à¦¸à§‡à¦•à§‡à¦¨à§à¦¡',
            m : 'à¦à¦• à¦®à¦¿à¦¨à¦¿à¦Ÿ',
            mm : '%d à¦®à¦¿à¦¨à¦¿à¦Ÿ',
            h : 'à¦à¦• à¦˜à¦¨à§à¦Ÿà¦¾',
            hh : '%d à¦˜à¦¨à§à¦Ÿà¦¾',
            d : 'à¦à¦• à¦¦à¦¿à¦¨',
            dd : '%d à¦¦à¦¿à¦¨',
            M : 'à¦à¦• à¦®à¦¾à¦¸',
            MM : '%d à¦®à¦¾à¦¸',
            y : 'à¦à¦• à¦¬à¦›à¦°',
            yy : '%d à¦¬à¦›à¦°'
        },
        preparse: function (string) {
            return string.replace(/[à§§à§¨à§©à§ªà§«à§¬à§­à§®à§¯à§¦]/g, function (match) {
                return bn__numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return bn__symbolMap[match];
            });
        },
        meridiemParse: /à¦°à¦¾à¦¤|à¦¸à¦•à¦¾à¦²|à¦¦à§à¦ªà§à¦°|à¦¬à¦¿à¦•à§‡à¦²|à¦°à¦¾à¦¤/,
        isPM: function (input) {
            return /^(à¦¦à§à¦ªà§à¦°|à¦¬à¦¿à¦•à§‡à¦²|à¦°à¦¾à¦¤)$/.test(input);
        },
        //Bengali is a vast language its spoken
        //in different forms in various parts of the world.
        //I have just generalized with most common one used
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'à¦°à¦¾à¦¤';
            } else if (hour < 10) {
                return 'à¦¸à¦•à¦¾à¦²';
            } else if (hour < 17) {
                return 'à¦¦à§à¦ªà§à¦°';
            } else if (hour < 20) {
                return 'à¦¬à¦¿à¦•à§‡à¦²';
            } else {
                return 'à¦°à¦¾à¦¤';
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : tibetan (bo)
    //! author : Thupten N. Chakrishar : https://github.com/vajradog

    var bo__symbolMap = {
        '1': 'à¼¡',
        '2': 'à¼¢',
        '3': 'à¼£',
        '4': 'à¼¤',
        '5': 'à¼¥',
        '6': 'à¼¦',
        '7': 'à¼§',
        '8': 'à¼¨',
        '9': 'à¼©',
        '0': 'à¼ '
    },
    bo__numberMap = {
        'à¼¡': '1',
        'à¼¢': '2',
        'à¼£': '3',
        'à¼¤': '4',
        'à¼¥': '5',
        'à¼¦': '6',
        'à¼§': '7',
        'à¼¨': '8',
        'à¼©': '9',
        'à¼ ': '0'
    };

    var bo = _moment__default.defineLocale('bo', {
        months : 'à½Ÿà¾³à¼‹à½–à¼‹à½‘à½„à¼‹à½”à½¼_à½Ÿà¾³à¼‹à½–à¼‹à½‚à½‰à½²à½¦à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½‚à½¦à½´à½˜à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½žà½²à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½£à¾”à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½‘à¾²à½´à½‚à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½‘à½´à½“à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½¢à¾’à¾±à½‘à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½‘à½‚à½´à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½…à½´à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½…à½´à¼‹à½‚à½…à½²à½‚à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½…à½´à¼‹à½‚à½‰à½²à½¦à¼‹à½”'.split('_'),
        monthsShort : 'à½Ÿà¾³à¼‹à½–à¼‹à½‘à½„à¼‹à½”à½¼_à½Ÿà¾³à¼‹à½–à¼‹à½‚à½‰à½²à½¦à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½‚à½¦à½´à½˜à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½žà½²à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½£à¾”à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½‘à¾²à½´à½‚à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½‘à½´à½“à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½¢à¾’à¾±à½‘à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½‘à½‚à½´à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½…à½´à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½…à½´à¼‹à½‚à½…à½²à½‚à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½…à½´à¼‹à½‚à½‰à½²à½¦à¼‹à½”'.split('_'),
        weekdays : 'à½‚à½Ÿà½ à¼‹à½‰à½²à¼‹à½˜à¼‹_à½‚à½Ÿà½ à¼‹à½Ÿà¾³à¼‹à½–à¼‹_à½‚à½Ÿà½ à¼‹à½˜à½²à½‚à¼‹à½‘à½˜à½¢à¼‹_à½‚à½Ÿà½ à¼‹à½£à¾·à½‚à¼‹à½”à¼‹_à½‚à½Ÿà½ à¼‹à½•à½´à½¢à¼‹à½–à½´_à½‚à½Ÿà½ à¼‹à½”à¼‹à½¦à½„à½¦à¼‹_à½‚à½Ÿà½ à¼‹à½¦à¾¤à½ºà½“à¼‹à½”à¼‹'.split('_'),
        weekdaysShort : 'à½‰à½²à¼‹à½˜à¼‹_à½Ÿà¾³à¼‹à½–à¼‹_à½˜à½²à½‚à¼‹à½‘à½˜à½¢à¼‹_à½£à¾·à½‚à¼‹à½”à¼‹_à½•à½´à½¢à¼‹à½–à½´_à½”à¼‹à½¦à½„à½¦à¼‹_à½¦à¾¤à½ºà½“à¼‹à½”à¼‹'.split('_'),
        weekdaysMin : 'à½‰à½²à¼‹à½˜à¼‹_à½Ÿà¾³à¼‹à½–à¼‹_à½˜à½²à½‚à¼‹à½‘à½˜à½¢à¼‹_à½£à¾·à½‚à¼‹à½”à¼‹_à½•à½´à½¢à¼‹à½–à½´_à½”à¼‹à½¦à½„à½¦à¼‹_à½¦à¾¤à½ºà½“à¼‹à½”à¼‹'.split('_'),
        longDateFormat : {
            LT : 'A h:mm',
            LTS : 'A h:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, A h:mm',
            LLLL : 'dddd, D MMMM YYYY, A h:mm'
        },
        calendar : {
            sameDay : '[à½‘à½²à¼‹à½¢à½²à½„] LT',
            nextDay : '[à½¦à½„à¼‹à½‰à½²à½“] LT',
            nextWeek : '[à½–à½‘à½´à½“à¼‹à½•à¾²à½‚à¼‹à½¢à¾—à½ºà½¦à¼‹à½˜], LT',
            lastDay : '[à½à¼‹à½¦à½„] LT',
            lastWeek : '[à½–à½‘à½´à½“à¼‹à½•à¾²à½‚à¼‹à½˜à½à½ à¼‹à½˜] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s à½£à¼‹',
            past : '%s à½¦à¾”à½“à¼‹à½£',
            s : 'à½£à½˜à¼‹à½¦à½„',
            m : 'à½¦à¾à½¢à¼‹à½˜à¼‹à½‚à½…à½²à½‚',
            mm : '%d à½¦à¾à½¢à¼‹à½˜',
            h : 'à½†à½´à¼‹à½šà½¼à½‘à¼‹à½‚à½…à½²à½‚',
            hh : '%d à½†à½´à¼‹à½šà½¼à½‘',
            d : 'à½‰à½²à½“à¼‹à½‚à½…à½²à½‚',
            dd : '%d à½‰à½²à½“à¼‹',
            M : 'à½Ÿà¾³à¼‹à½–à¼‹à½‚à½…à½²à½‚',
            MM : '%d à½Ÿà¾³à¼‹à½–',
            y : 'à½£à½¼à¼‹à½‚à½…à½²à½‚',
            yy : '%d à½£à½¼'
        },
        preparse: function (string) {
            return string.replace(/[à¼¡à¼¢à¼£à¼¤à¼¥à¼¦à¼§à¼¨à¼©à¼ ]/g, function (match) {
                return bo__numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return bo__symbolMap[match];
            });
        },
        meridiemParse: /à½˜à½šà½“à¼‹à½˜à½¼|à½žà½¼à½‚à½¦à¼‹à½€à½¦|à½‰à½²à½“à¼‹à½‚à½´à½„|à½‘à½‚à½¼à½„à¼‹à½‘à½‚|à½˜à½šà½“à¼‹à½˜à½¼/,
        isPM: function (input) {
            return /^(à½‰à½²à½“à¼‹à½‚à½´à½„|à½‘à½‚à½¼à½„à¼‹à½‘à½‚|à½˜à½šà½“à¼‹à½˜à½¼)$/.test(input);
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'à½˜à½šà½“à¼‹à½˜à½¼';
            } else if (hour < 10) {
                return 'à½žà½¼à½‚à½¦à¼‹à½€à½¦';
            } else if (hour < 17) {
                return 'à½‰à½²à½“à¼‹à½‚à½´à½„';
            } else if (hour < 20) {
                return 'à½‘à½‚à½¼à½„à¼‹à½‘à½‚';
            } else {
                return 'à½˜à½šà½“à¼‹à½˜à½¼';
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : breton (br)
    //! author : Jean-Baptiste Le Duigou : https://github.com/jbleduigou

    function relativeTimeWithMutation(number, withoutSuffix, key) {
        var format = {
            'mm': 'munutenn',
            'MM': 'miz',
            'dd': 'devezh'
        };
        return number + ' ' + mutation(format[key], number);
    }
    function specialMutationForYears(number) {
        switch (lastNumber(number)) {
        case 1:
        case 3:
        case 4:
        case 5:
        case 9:
            return number + ' bloaz';
        default:
            return number + ' vloaz';
        }
    }
    function lastNumber(number) {
        if (number > 9) {
            return lastNumber(number % 10);
        }
        return number;
    }
    function mutation(text, number) {
        if (number === 2) {
            return softMutation(text);
        }
        return text;
    }
    function softMutation(text) {
        var mutationTable = {
            'm': 'v',
            'b': 'v',
            'd': 'z'
        };
        if (mutationTable[text.charAt(0)] === undefined) {
            return text;
        }
        return mutationTable[text.charAt(0)] + text.substring(1);
    }

    var br = _moment__default.defineLocale('br', {
        months : 'Genver_C\'hwevrer_Meurzh_Ebrel_Mae_Mezheven_Gouere_Eost_Gwengolo_Here_Du_Kerzu'.split('_'),
        monthsShort : 'Gen_C\'hwe_Meu_Ebr_Mae_Eve_Gou_Eos_Gwe_Her_Du_Ker'.split('_'),
        weekdays : 'Sul_Lun_Meurzh_Merc\'her_Yaou_Gwener_Sadorn'.split('_'),
        weekdaysShort : 'Sul_Lun_Meu_Mer_Yao_Gwe_Sad'.split('_'),
        weekdaysMin : 'Su_Lu_Me_Mer_Ya_Gw_Sa'.split('_'),
        longDateFormat : {
            LT : 'h[e]mm A',
            LTS : 'h[e]mm:ss A',
            L : 'DD/MM/YYYY',
            LL : 'D [a viz] MMMM YYYY',
            LLL : 'D [a viz] MMMM YYYY h[e]mm A',
            LLLL : 'dddd, D [a viz] MMMM YYYY h[e]mm A'
        },
        calendar : {
            sameDay : '[Hiziv da] LT',
            nextDay : '[Warc\'hoazh da] LT',
            nextWeek : 'dddd [da] LT',
            lastDay : '[Dec\'h da] LT',
            lastWeek : 'dddd [paset da] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'a-benn %s',
            past : '%s \'zo',
            s : 'un nebeud segondennoÃ¹',
            m : 'ur vunutenn',
            mm : relativeTimeWithMutation,
            h : 'un eur',
            hh : '%d eur',
            d : 'un devezh',
            dd : relativeTimeWithMutation,
            M : 'ur miz',
            MM : relativeTimeWithMutation,
            y : 'ur bloaz',
            yy : specialMutationForYears
        },
        ordinalParse: /\d{1,2}(aÃ±|vet)/,
        ordinal : function (number) {
            var output = (number === 1) ? 'aÃ±' : 'vet';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : bosnian (bs)
    //! author : Nedim Cholich : https://github.com/frontyard
    //! based on (hr) translation by Bojan MarkoviÄ‡

    function bs__translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'jedna minuta' : 'jedne minute';
        case 'mm':
            if (number === 1) {
                result += 'minuta';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'minute';
            } else {
                result += 'minuta';
            }
            return result;
        case 'h':
            return withoutSuffix ? 'jedan sat' : 'jednog sata';
        case 'hh':
            if (number === 1) {
                result += 'sat';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'sata';
            } else {
                result += 'sati';
            }
            return result;
        case 'dd':
            if (number === 1) {
                result += 'dan';
            } else {
                result += 'dana';
            }
            return result;
        case 'MM':
            if (number === 1) {
                result += 'mjesec';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'mjeseca';
            } else {
                result += 'mjeseci';
            }
            return result;
        case 'yy':
            if (number === 1) {
                result += 'godina';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'godine';
            } else {
                result += 'godina';
            }
            return result;
        }
    }

    var bs = _moment__default.defineLocale('bs', {
        months : 'januar_februar_mart_april_maj_juni_juli_august_septembar_oktobar_novembar_decembar'.split('_'),
        monthsShort : 'jan._feb._mar._apr._maj._jun._jul._aug._sep._okt._nov._dec.'.split('_'),
        weekdays : 'nedjelja_ponedjeljak_utorak_srijeda_Äetvrtak_petak_subota'.split('_'),
        weekdaysShort : 'ned._pon._uto._sri._Äet._pet._sub.'.split('_'),
        weekdaysMin : 'ne_po_ut_sr_Äe_pe_su'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'DD. MM. YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY H:mm',
            LLLL : 'dddd, D. MMMM YYYY H:mm'
        },
        calendar : {
            sameDay  : '[danas u] LT',
            nextDay  : '[sutra u] LT',
            nextWeek : function () {
                switch (this.day()) {
                case 0:
                    return '[u] [nedjelju] [u] LT';
                case 3:
                    return '[u] [srijedu] [u] LT';
                case 6:
                    return '[u] [subotu] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[u] dddd [u] LT';
                }
            },
            lastDay  : '[juÄer u] LT',
            lastWeek : function () {
                switch (this.day()) {
                case 0:
                case 3:
                    return '[proÅ¡lu] dddd [u] LT';
                case 6:
                    return '[proÅ¡le] [subote] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[proÅ¡li] dddd [u] LT';
                }
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'za %s',
            past   : 'prije %s',
            s      : 'par sekundi',
            m      : bs__translate,
            mm     : bs__translate,
            h      : bs__translate,
            hh     : bs__translate,
            d      : 'dan',
            dd     : bs__translate,
            M      : 'mjesec',
            MM     : bs__translate,
            y      : 'godinu',
            yy     : bs__translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : catalan (ca)
    //! author : Juan G. Hurtado : https://github.com/juanghurtado

    var ca = _moment__default.defineLocale('ca', {
        months : 'gener_febrer_marÃ§_abril_maig_juny_juliol_agost_setembre_octubre_novembre_desembre'.split('_'),
        monthsShort : 'gen._febr._mar._abr._mai._jun._jul._ag._set._oct._nov._des.'.split('_'),
        weekdays : 'diumenge_dilluns_dimarts_dimecres_dijous_divendres_dissabte'.split('_'),
        weekdaysShort : 'dg._dl._dt._dc._dj._dv._ds.'.split('_'),
        weekdaysMin : 'Dg_Dl_Dt_Dc_Dj_Dv_Ds'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY H:mm',
            LLLL : 'dddd D MMMM YYYY H:mm'
        },
        calendar : {
            sameDay : function () {
                return '[avui a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
            },
            nextDay : function () {
                return '[demÃ  a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
            },
            nextWeek : function () {
                return 'dddd [a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
            },
            lastDay : function () {
                return '[ahir a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
            },
            lastWeek : function () {
                return '[el] dddd [passat a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'en %s',
            past : 'fa %s',
            s : 'uns segons',
            m : 'un minut',
            mm : '%d minuts',
            h : 'una hora',
            hh : '%d hores',
            d : 'un dia',
            dd : '%d dies',
            M : 'un mes',
            MM : '%d mesos',
            y : 'un any',
            yy : '%d anys'
        },
        ordinalParse: /\d{1,2}(r|n|t|Ã¨|a)/,
        ordinal : function (number, period) {
            var output = (number === 1) ? 'r' :
                (number === 2) ? 'n' :
                (number === 3) ? 'r' :
                (number === 4) ? 't' : 'Ã¨';
            if (period === 'w' || period === 'W') {
                output = 'a';
            }
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : czech (cs)
    //! author : petrbela : https://github.com/petrbela

    var cs__months = 'leden_Ãºnor_bÅ™ezen_duben_kvÄ›ten_Äerven_Äervenec_srpen_zÃ¡Å™Ã­_Å™Ã­jen_listopad_prosinec'.split('_'),
        cs__monthsShort = 'led_Ãºno_bÅ™e_dub_kvÄ›_Ävn_Ävc_srp_zÃ¡Å™_Å™Ã­j_lis_pro'.split('_');
    function cs__plural(n) {
        return (n > 1) && (n < 5) && (~~(n / 10) !== 1);
    }
    function cs__translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':  // a few seconds / in a few seconds / a few seconds ago
            return (withoutSuffix || isFuture) ? 'pÃ¡r sekund' : 'pÃ¡r sekundami';
        case 'm':  // a minute / in a minute / a minute ago
            return withoutSuffix ? 'minuta' : (isFuture ? 'minutu' : 'minutou');
        case 'mm': // 9 minutes / in 9 minutes / 9 minutes ago
            if (withoutSuffix || isFuture) {
                return result + (cs__plural(number) ? 'minuty' : 'minut');
            } else {
                return result + 'minutami';
            }
            break;
        case 'h':  // an hour / in an hour / an hour ago
            return withoutSuffix ? 'hodina' : (isFuture ? 'hodinu' : 'hodinou');
        case 'hh': // 9 hours / in 9 hours / 9 hours ago
            if (withoutSuffix || isFuture) {
                return result + (cs__plural(number) ? 'hodiny' : 'hodin');
            } else {
                return result + 'hodinami';
            }
            break;
        case 'd':  // a day / in a day / a day ago
            return (withoutSuffix || isFuture) ? 'den' : 'dnem';
        case 'dd': // 9 days / in 9 days / 9 days ago
            if (withoutSuffix || isFuture) {
                return result + (cs__plural(number) ? 'dny' : 'dnÃ­');
            } else {
                return result + 'dny';
            }
            break;
        case 'M':  // a month / in a month / a month ago
            return (withoutSuffix || isFuture) ? 'mÄ›sÃ­c' : 'mÄ›sÃ­cem';
        case 'MM': // 9 months / in 9 months / 9 months ago
            if (withoutSuffix || isFuture) {
                return result + (cs__plural(number) ? 'mÄ›sÃ­ce' : 'mÄ›sÃ­cÅ¯');
            } else {
                return result + 'mÄ›sÃ­ci';
            }
            break;
        case 'y':  // a year / in a year / a year ago
            return (withoutSuffix || isFuture) ? 'rok' : 'rokem';
        case 'yy': // 9 years / in 9 years / 9 years ago
            if (withoutSuffix || isFuture) {
                return result + (cs__plural(number) ? 'roky' : 'let');
            } else {
                return result + 'lety';
            }
            break;
        }
    }

    var cs = _moment__default.defineLocale('cs', {
        months : cs__months,
        monthsShort : cs__monthsShort,
        monthsParse : (function (months, monthsShort) {
            var i, _monthsParse = [];
            for (i = 0; i < 12; i++) {
                // use custom parser to solve problem with July (Äervenec)
                _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
            }
            return _monthsParse;
        }(cs__months, cs__monthsShort)),
        weekdays : 'nedÄ›le_pondÄ›lÃ­_ÃºterÃ½_stÅ™eda_Ätvrtek_pÃ¡tek_sobota'.split('_'),
        weekdaysShort : 'ne_po_Ãºt_st_Ät_pÃ¡_so'.split('_'),
        weekdaysMin : 'ne_po_Ãºt_st_Ät_pÃ¡_so'.split('_'),
        longDateFormat : {
            LT: 'H:mm',
            LTS : 'H:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY H:mm',
            LLLL : 'dddd D. MMMM YYYY H:mm'
        },
        calendar : {
            sameDay: '[dnes v] LT',
            nextDay: '[zÃ­tra v] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[v nedÄ›li v] LT';
                case 1:
                case 2:
                    return '[v] dddd [v] LT';
                case 3:
                    return '[ve stÅ™edu v] LT';
                case 4:
                    return '[ve Ätvrtek v] LT';
                case 5:
                    return '[v pÃ¡tek v] LT';
                case 6:
                    return '[v sobotu v] LT';
                }
            },
            lastDay: '[vÄera v] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[minulou nedÄ›li v] LT';
                case 1:
                case 2:
                    return '[minulÃ©] dddd [v] LT';
                case 3:
                    return '[minulou stÅ™edu v] LT';
                case 4:
                case 5:
                    return '[minulÃ½] dddd [v] LT';
                case 6:
                    return '[minulou sobotu v] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'za %s',
            past : 'pÅ™ed %s',
            s : cs__translate,
            m : cs__translate,
            mm : cs__translate,
            h : cs__translate,
            hh : cs__translate,
            d : cs__translate,
            dd : cs__translate,
            M : cs__translate,
            MM : cs__translate,
            y : cs__translate,
            yy : cs__translate
        },
        ordinalParse : /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : chuvash (cv)
    //! author : Anatoly Mironov : https://github.com/mirontoli

    var cv = _moment__default.defineLocale('cv', {
        months : 'ÐºÓ‘Ñ€Ð»Ð°Ñ‡_Ð½Ð°Ñ€Ó‘Ñ_Ð¿ÑƒÑˆ_Ð°ÐºÐ°_Ð¼Ð°Ð¹_Ò«Ó—Ñ€Ñ‚Ð¼Ðµ_ÑƒÑ‚Ó‘_Ò«ÑƒÑ€Ð»Ð°_Ð°Ð²Ó‘Ð½_ÑŽÐ¿Ð°_Ñ‡Ó³Ðº_Ñ€Ð°ÑˆÑ‚Ð°Ð²'.split('_'),
        monthsShort : 'ÐºÓ‘Ñ€_Ð½Ð°Ñ€_Ð¿ÑƒÑˆ_Ð°ÐºÐ°_Ð¼Ð°Ð¹_Ò«Ó—Ñ€_ÑƒÑ‚Ó‘_Ò«ÑƒÑ€_Ð°Ð²Ð½_ÑŽÐ¿Ð°_Ñ‡Ó³Ðº_Ñ€Ð°Ñˆ'.split('_'),
        weekdays : 'Ð²Ñ‹Ñ€ÑÐ°Ñ€Ð½Ð¸ÐºÑƒÐ½_Ñ‚ÑƒÐ½Ñ‚Ð¸ÐºÑƒÐ½_Ñ‹Ñ‚Ð»Ð°Ñ€Ð¸ÐºÑƒÐ½_ÑŽÐ½ÐºÑƒÐ½_ÐºÓ—Ò«Ð½ÐµÑ€Ð½Ð¸ÐºÑƒÐ½_ÑÑ€Ð½ÐµÐºÑƒÐ½_ÑˆÓ‘Ð¼Ð°Ñ‚ÐºÑƒÐ½'.split('_'),
        weekdaysShort : 'Ð²Ñ‹Ñ€_Ñ‚ÑƒÐ½_Ñ‹Ñ‚Ð»_ÑŽÐ½_ÐºÓ—Ò«_ÑÑ€Ð½_ÑˆÓ‘Ð¼'.split('_'),
        weekdaysMin : 'Ð²Ñ€_Ñ‚Ð½_Ñ‹Ñ‚_ÑŽÐ½_ÐºÒ«_ÑÑ€_ÑˆÐ¼'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD-MM-YYYY',
            LL : 'YYYY [Ò«ÑƒÐ»Ñ…Ð¸] MMMM [ÑƒÐ¹Ó‘Ñ…Ó—Ð½] D[-Ð¼Ó—ÑˆÓ—]',
            LLL : 'YYYY [Ò«ÑƒÐ»Ñ…Ð¸] MMMM [ÑƒÐ¹Ó‘Ñ…Ó—Ð½] D[-Ð¼Ó—ÑˆÓ—], HH:mm',
            LLLL : 'dddd, YYYY [Ò«ÑƒÐ»Ñ…Ð¸] MMMM [ÑƒÐ¹Ó‘Ñ…Ó—Ð½] D[-Ð¼Ó—ÑˆÓ—], HH:mm'
        },
        calendar : {
            sameDay: '[ÐŸÐ°ÑÐ½] LT [ÑÐµÑ…ÐµÑ‚Ñ€Ðµ]',
            nextDay: '[Ð«Ñ€Ð°Ð½] LT [ÑÐµÑ…ÐµÑ‚Ñ€Ðµ]',
            lastDay: '[Ó–Ð½ÐµÑ€] LT [ÑÐµÑ…ÐµÑ‚Ñ€Ðµ]',
            nextWeek: '[ÒªÐ¸Ñ‚ÐµÑ] dddd LT [ÑÐµÑ…ÐµÑ‚Ñ€Ðµ]',
            lastWeek: '[Ð˜Ñ€Ñ‚Ð½Ó—] dddd LT [ÑÐµÑ…ÐµÑ‚Ñ€Ðµ]',
            sameElse: 'L'
        },
        relativeTime : {
            future : function (output) {
                var affix = /ÑÐµÑ…ÐµÑ‚$/i.exec(output) ? 'Ñ€ÐµÐ½' : /Ò«ÑƒÐ»$/i.exec(output) ? 'Ñ‚Ð°Ð½' : 'Ñ€Ð°Ð½';
                return output + affix;
            },
            past : '%s ÐºÐ°ÑÐ»Ð»Ð°',
            s : 'Ð¿Ó—Ñ€-Ð¸Ðº Ò«ÐµÐºÐºÑƒÐ½Ñ‚',
            m : 'Ð¿Ó—Ñ€ Ð¼Ð¸Ð½ÑƒÑ‚',
            mm : '%d Ð¼Ð¸Ð½ÑƒÑ‚',
            h : 'Ð¿Ó—Ñ€ ÑÐµÑ…ÐµÑ‚',
            hh : '%d ÑÐµÑ…ÐµÑ‚',
            d : 'Ð¿Ó—Ñ€ ÐºÑƒÐ½',
            dd : '%d ÐºÑƒÐ½',
            M : 'Ð¿Ó—Ñ€ ÑƒÐ¹Ó‘Ñ…',
            MM : '%d ÑƒÐ¹Ó‘Ñ…',
            y : 'Ð¿Ó—Ñ€ Ò«ÑƒÐ»',
            yy : '%d Ò«ÑƒÐ»'
        },
        ordinalParse: /\d{1,2}-Ð¼Ó—Ñˆ/,
        ordinal : '%d-Ð¼Ó—Ñˆ',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Welsh (cy)
    //! author : Robert Allen

    var cy = _moment__default.defineLocale('cy', {
        months: 'Ionawr_Chwefror_Mawrth_Ebrill_Mai_Mehefin_Gorffennaf_Awst_Medi_Hydref_Tachwedd_Rhagfyr'.split('_'),
        monthsShort: 'Ion_Chwe_Maw_Ebr_Mai_Meh_Gor_Aws_Med_Hyd_Tach_Rhag'.split('_'),
        weekdays: 'Dydd Sul_Dydd Llun_Dydd Mawrth_Dydd Mercher_Dydd Iau_Dydd Gwener_Dydd Sadwrn'.split('_'),
        weekdaysShort: 'Sul_Llun_Maw_Mer_Iau_Gwe_Sad'.split('_'),
        weekdaysMin: 'Su_Ll_Ma_Me_Ia_Gw_Sa'.split('_'),
        // time formats are the same as en-gb
        longDateFormat: {
            LT: 'HH:mm',
            LTS : 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd, D MMMM YYYY HH:mm'
        },
        calendar: {
            sameDay: '[Heddiw am] LT',
            nextDay: '[Yfory am] LT',
            nextWeek: 'dddd [am] LT',
            lastDay: '[Ddoe am] LT',
            lastWeek: 'dddd [diwethaf am] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'mewn %s',
            past: '%s yn Ã´l',
            s: 'ychydig eiliadau',
            m: 'munud',
            mm: '%d munud',
            h: 'awr',
            hh: '%d awr',
            d: 'diwrnod',
            dd: '%d diwrnod',
            M: 'mis',
            MM: '%d mis',
            y: 'blwyddyn',
            yy: '%d flynedd'
        },
        ordinalParse: /\d{1,2}(fed|ain|af|il|ydd|ed|eg)/,
        // traditional ordinal numbers above 31 are not commonly used in colloquial Welsh
        ordinal: function (number) {
            var b = number,
                output = '',
                lookup = [
                    '', 'af', 'il', 'ydd', 'ydd', 'ed', 'ed', 'ed', 'fed', 'fed', 'fed', // 1af to 10fed
                    'eg', 'fed', 'eg', 'eg', 'fed', 'eg', 'eg', 'fed', 'eg', 'fed' // 11eg to 20fed
                ];
            if (b > 20) {
                if (b === 40 || b === 50 || b === 60 || b === 80 || b === 100) {
                    output = 'fed'; // not 30ain, 70ain or 90ain
                } else {
                    output = 'ain';
                }
            } else if (b > 0) {
                output = lookup[b];
            }
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : danish (da)
    //! author : Ulrik Nielsen : https://github.com/mrbase

    var da = _moment__default.defineLocale('da', {
        months : 'januar_februar_marts_april_maj_juni_juli_august_september_oktober_november_december'.split('_'),
        monthsShort : 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
        weekdays : 'sÃ¸ndag_mandag_tirsdag_onsdag_torsdag_fredag_lÃ¸rdag'.split('_'),
        weekdaysShort : 'sÃ¸n_man_tir_ons_tor_fre_lÃ¸r'.split('_'),
        weekdaysMin : 'sÃ¸_ma_ti_on_to_fr_lÃ¸'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY HH:mm',
            LLLL : 'dddd [d.] D. MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay : '[I dag kl.] LT',
            nextDay : '[I morgen kl.] LT',
            nextWeek : 'dddd [kl.] LT',
            lastDay : '[I gÃ¥r kl.] LT',
            lastWeek : '[sidste] dddd [kl] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'om %s',
            past : '%s siden',
            s : 'fÃ¥ sekunder',
            m : 'et minut',
            mm : '%d minutter',
            h : 'en time',
            hh : '%d timer',
            d : 'en dag',
            dd : '%d dage',
            M : 'en mÃ¥ned',
            MM : '%d mÃ¥neder',
            y : 'et Ã¥r',
            yy : '%d Ã¥r'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : austrian german (de-at)
    //! author : lluchs : https://github.com/lluchs
    //! author: Menelion ElensÃºle: https://github.com/Oire
    //! author : Martin Groller : https://github.com/MadMG

    function de_at__processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            'm': ['eine Minute', 'einer Minute'],
            'h': ['eine Stunde', 'einer Stunde'],
            'd': ['ein Tag', 'einem Tag'],
            'dd': [number + ' Tage', number + ' Tagen'],
            'M': ['ein Monat', 'einem Monat'],
            'MM': [number + ' Monate', number + ' Monaten'],
            'y': ['ein Jahr', 'einem Jahr'],
            'yy': [number + ' Jahre', number + ' Jahren']
        };
        return withoutSuffix ? format[key][0] : format[key][1];
    }

    var de_at = _moment__default.defineLocale('de-at', {
        months : 'JÃ¤nner_Februar_MÃ¤rz_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
        monthsShort : 'JÃ¤n._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
        weekdays : 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
        weekdaysShort : 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
        weekdaysMin : 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
        longDateFormat : {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY HH:mm',
            LLLL : 'dddd, D. MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[Heute um] LT [Uhr]',
            sameElse: 'L',
            nextDay: '[Morgen um] LT [Uhr]',
            nextWeek: 'dddd [um] LT [Uhr]',
            lastDay: '[Gestern um] LT [Uhr]',
            lastWeek: '[letzten] dddd [um] LT [Uhr]'
        },
        relativeTime : {
            future : 'in %s',
            past : 'vor %s',
            s : 'ein paar Sekunden',
            m : de_at__processRelativeTime,
            mm : '%d Minuten',
            h : de_at__processRelativeTime,
            hh : '%d Stunden',
            d : de_at__processRelativeTime,
            dd : de_at__processRelativeTime,
            M : de_at__processRelativeTime,
            MM : de_at__processRelativeTime,
            y : de_at__processRelativeTime,
            yy : de_at__processRelativeTime
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : german (de)
    //! author : lluchs : https://github.com/lluchs
    //! author: Menelion ElensÃºle: https://github.com/Oire

    function de__processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            'm': ['eine Minute', 'einer Minute'],
            'h': ['eine Stunde', 'einer Stunde'],
            'd': ['ein Tag', 'einem Tag'],
            'dd': [number + ' Tage', number + ' Tagen'],
            'M': ['ein Monat', 'einem Monat'],
            'MM': [number + ' Monate', number + ' Monaten'],
            'y': ['ein Jahr', 'einem Jahr'],
            'yy': [number + ' Jahre', number + ' Jahren']
        };
        return withoutSuffix ? format[key][0] : format[key][1];
    }

    var de = _moment__default.defineLocale('de', {
        months : 'Januar_Februar_MÃ¤rz_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
        monthsShort : 'Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
        weekdays : 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
        weekdaysShort : 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
        weekdaysMin : 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
        longDateFormat : {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY HH:mm',
            LLLL : 'dddd, D. MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[Heute um] LT [Uhr]',
            sameElse: 'L',
            nextDay: '[Morgen um] LT [Uhr]',
            nextWeek: 'dddd [um] LT [Uhr]',
            lastDay: '[Gestern um] LT [Uhr]',
            lastWeek: '[letzten] dddd [um] LT [Uhr]'
        },
        relativeTime : {
            future : 'in %s',
            past : 'vor %s',
            s : 'ein paar Sekunden',
            m : de__processRelativeTime,
            mm : '%d Minuten',
            h : de__processRelativeTime,
            hh : '%d Stunden',
            d : de__processRelativeTime,
            dd : de__processRelativeTime,
            M : de__processRelativeTime,
            MM : de__processRelativeTime,
            y : de__processRelativeTime,
            yy : de__processRelativeTime
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : modern greek (el)
    //! author : Aggelos Karalias : https://github.com/mehiel

    var el = _moment__default.defineLocale('el', {
        monthsNominativeEl : 'Î™Î±Î½Î¿Ï…Î¬ÏÎ¹Î¿Ï‚_Î¦ÎµÎ²ÏÎ¿Ï…Î¬ÏÎ¹Î¿Ï‚_ÎœÎ¬ÏÏ„Î¹Î¿Ï‚_Î‘Ï€ÏÎ¯Î»Î¹Î¿Ï‚_ÎœÎ¬Î¹Î¿Ï‚_Î™Î¿ÏÎ½Î¹Î¿Ï‚_Î™Î¿ÏÎ»Î¹Î¿Ï‚_Î‘ÏÎ³Î¿Ï…ÏƒÏ„Î¿Ï‚_Î£ÎµÏ€Ï„Î­Î¼Î²ÏÎ¹Î¿Ï‚_ÎŸÎºÏ„ÏŽÎ²ÏÎ¹Î¿Ï‚_ÎÎ¿Î­Î¼Î²ÏÎ¹Î¿Ï‚_Î”ÎµÎºÎ­Î¼Î²ÏÎ¹Î¿Ï‚'.split('_'),
        monthsGenitiveEl : 'Î™Î±Î½Î¿Ï…Î±ÏÎ¯Î¿Ï…_Î¦ÎµÎ²ÏÎ¿Ï…Î±ÏÎ¯Î¿Ï…_ÎœÎ±ÏÏ„Î¯Î¿Ï…_Î‘Ï€ÏÎ¹Î»Î¯Î¿Ï…_ÎœÎ±ÎÎ¿Ï…_Î™Î¿Ï…Î½Î¯Î¿Ï…_Î™Î¿Ï…Î»Î¯Î¿Ï…_Î‘Ï…Î³Î¿ÏÏƒÏ„Î¿Ï…_Î£ÎµÏ€Ï„ÎµÎ¼Î²ÏÎ¯Î¿Ï…_ÎŸÎºÏ„Ï‰Î²ÏÎ¯Î¿Ï…_ÎÎ¿ÎµÎ¼Î²ÏÎ¯Î¿Ï…_Î”ÎµÎºÎµÎ¼Î²ÏÎ¯Î¿Ï…'.split('_'),
        months : function (momentToFormat, format) {
            if (/D/.test(format.substring(0, format.indexOf('MMMM')))) { // if there is a day number before 'MMMM'
                return this._monthsGenitiveEl[momentToFormat.month()];
            } else {
                return this._monthsNominativeEl[momentToFormat.month()];
            }
        },
        monthsShort : 'Î™Î±Î½_Î¦ÎµÎ²_ÎœÎ±Ï_Î‘Ï€Ï_ÎœÎ±ÏŠ_Î™Î¿Ï…Î½_Î™Î¿Ï…Î»_Î‘Ï…Î³_Î£ÎµÏ€_ÎŸÎºÏ„_ÎÎ¿Îµ_Î”ÎµÎº'.split('_'),
        weekdays : 'ÎšÏ…ÏÎ¹Î±ÎºÎ®_Î”ÎµÏ…Ï„Î­ÏÎ±_Î¤ÏÎ¯Ï„Î·_Î¤ÎµÏ„Î¬ÏÏ„Î·_Î Î­Î¼Ï€Ï„Î·_Î Î±ÏÎ±ÏƒÎºÎµÏ…Î®_Î£Î¬Î²Î²Î±Ï„Î¿'.split('_'),
        weekdaysShort : 'ÎšÏ…Ï_Î”ÎµÏ…_Î¤ÏÎ¹_Î¤ÎµÏ„_Î ÎµÎ¼_Î Î±Ï_Î£Î±Î²'.split('_'),
        weekdaysMin : 'ÎšÏ…_Î”Îµ_Î¤Ï_Î¤Îµ_Î Îµ_Î Î±_Î£Î±'.split('_'),
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'Î¼Î¼' : 'ÎœÎœ';
            } else {
                return isLower ? 'Ï€Î¼' : 'Î Îœ';
            }
        },
        isPM : function (input) {
            return ((input + '').toLowerCase()[0] === 'Î¼');
        },
        meridiemParse : /[Î Îœ]\.?Îœ?\.?/i,
        longDateFormat : {
            LT : 'h:mm A',
            LTS : 'h:mm:ss A',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY h:mm A',
            LLLL : 'dddd, D MMMM YYYY h:mm A'
        },
        calendarEl : {
            sameDay : '[Î£Î®Î¼ÎµÏÎ± {}] LT',
            nextDay : '[Î‘ÏÏÎ¹Î¿ {}] LT',
            nextWeek : 'dddd [{}] LT',
            lastDay : '[Î§Î¸ÎµÏ‚ {}] LT',
            lastWeek : function () {
                switch (this.day()) {
                    case 6:
                        return '[Ï„Î¿ Ï€ÏÎ¿Î·Î³Î¿ÏÎ¼ÎµÎ½Î¿] dddd [{}] LT';
                    default:
                        return '[Ï„Î·Î½ Ï€ÏÎ¿Î·Î³Î¿ÏÎ¼ÎµÎ½Î·] dddd [{}] LT';
                }
            },
            sameElse : 'L'
        },
        calendar : function (key, mom) {
            var output = this._calendarEl[key],
                hours = mom && mom.hours();
            if (typeof output === 'function') {
                output = output.apply(mom);
            }
            return output.replace('{}', (hours % 12 === 1 ? 'ÏƒÏ„Î·' : 'ÏƒÏ„Î¹Ï‚'));
        },
        relativeTime : {
            future : 'ÏƒÎµ %s',
            past : '%s Ï€ÏÎ¹Î½',
            s : 'Î»Î¯Î³Î± Î´ÎµÏ…Ï„ÎµÏÏŒÎ»ÎµÏ€Ï„Î±',
            m : 'Î­Î½Î± Î»ÎµÏ€Ï„ÏŒ',
            mm : '%d Î»ÎµÏ€Ï„Î¬',
            h : 'Î¼Î¯Î± ÏŽÏÎ±',
            hh : '%d ÏŽÏÎµÏ‚',
            d : 'Î¼Î¯Î± Î¼Î­ÏÎ±',
            dd : '%d Î¼Î­ÏÎµÏ‚',
            M : 'Î­Î½Î±Ï‚ Î¼Î®Î½Î±Ï‚',
            MM : '%d Î¼Î®Î½ÎµÏ‚',
            y : 'Î­Î½Î±Ï‚ Ï‡ÏÏŒÎ½Î¿Ï‚',
            yy : '%d Ï‡ÏÏŒÎ½Î¹Î±'
        },
        ordinalParse: /\d{1,2}Î·/,
        ordinal: '%dÎ·',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : australian english (en-au)

    var en_au = _moment__default.defineLocale('en-au', {
        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        longDateFormat : {
            LT : 'h:mm A',
            LTS : 'h:mm:ss A',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY h:mm A',
            LLLL : 'dddd, D MMMM YYYY h:mm A'
        },
        calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },
        ordinalParse: /\d{1,2}(st|nd|rd|th)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (~~(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : canadian english (en-ca)
    //! author : Jonathan Abourbih : https://github.com/jonbca

    var en_ca = _moment__default.defineLocale('en-ca', {
        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        longDateFormat : {
            LT : 'h:mm A',
            LTS : 'h:mm:ss A',
            L : 'YYYY-MM-DD',
            LL : 'D MMMM, YYYY',
            LLL : 'D MMMM, YYYY h:mm A',
            LLLL : 'dddd, D MMMM, YYYY h:mm A'
        },
        calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },
        ordinalParse: /\d{1,2}(st|nd|rd|th)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (~~(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    //! moment.js locale configuration
    //! locale : great britain english (en-gb)
    //! author : Chris Gedrim : https://github.com/chrisgedrim

    var en_gb = _moment__default.defineLocale('en-gb', {
        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },
        ordinalParse: /\d{1,2}(st|nd|rd|th)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (~~(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : esperanto (eo)
    //! author : Colin Dean : https://github.com/colindean
    //! komento: Mi estas malcerta se mi korekte traktis akuzativojn en tiu traduko.
    //!          Se ne, bonvolu korekti kaj avizi min por ke mi povas lerni!

    var eo = _moment__default.defineLocale('eo', {
        months : 'januaro_februaro_marto_aprilo_majo_junio_julio_aÅ­gusto_septembro_oktobro_novembro_decembro'.split('_'),
        monthsShort : 'jan_feb_mar_apr_maj_jun_jul_aÅ­g_sep_okt_nov_dec'.split('_'),
        weekdays : 'DimanÄ‰o_Lundo_Mardo_Merkredo_Ä´aÅ­do_Vendredo_Sabato'.split('_'),
        weekdaysShort : 'Dim_Lun_Mard_Merk_Ä´aÅ­_Ven_Sab'.split('_'),
        weekdaysMin : 'Di_Lu_Ma_Me_Ä´a_Ve_Sa'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'YYYY-MM-DD',
            LL : 'D[-an de] MMMM, YYYY',
            LLL : 'D[-an de] MMMM, YYYY HH:mm',
            LLLL : 'dddd, [la] D[-an de] MMMM, YYYY HH:mm'
        },
        meridiemParse: /[ap]\.t\.m/i,
        isPM: function (input) {
            return input.charAt(0).toLowerCase() === 'p';
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'p.t.m.' : 'P.T.M.';
            } else {
                return isLower ? 'a.t.m.' : 'A.T.M.';
            }
        },
        calendar : {
            sameDay : '[HodiaÅ­ je] LT',
            nextDay : '[MorgaÅ­ je] LT',
            nextWeek : 'dddd [je] LT',
            lastDay : '[HieraÅ­ je] LT',
            lastWeek : '[pasinta] dddd [je] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'je %s',
            past : 'antaÅ­ %s',
            s : 'sekundoj',
            m : 'minuto',
            mm : '%d minutoj',
            h : 'horo',
            hh : '%d horoj',
            d : 'tago',//ne 'diurno', Ä‰ar estas uzita por proksimumo
            dd : '%d tagoj',
            M : 'monato',
            MM : '%d monatoj',
            y : 'jaro',
            yy : '%d jaroj'
        },
        ordinalParse: /\d{1,2}a/,
        ordinal : '%da',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : spanish (es)
    //! author : Julio NapurÃ­ : https://github.com/julionc

    var monthsShortDot = 'Ene._Feb._Mar._Abr._May._Jun._Jul._Ago._Sep._Oct._Nov._Dic.'.split('_'),
        es__monthsShort = 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_');

    var es = _moment__default.defineLocale('es', {
        months : 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
        monthsShort : function (m, format) {
            if (/-MMM-/.test(format)) {
                return es__monthsShort[m.month()];
            } else {
                return monthsShortDot[m.month()];
            }
        },
        weekdays : 'Domingo_Lunes_Martes_MiÃ©rcoles_Jueves_Viernes_SÃ¡bado'.split('_'),
        weekdaysShort : 'Dom._Lun._Mar._MiÃ©._Jue._Vie._SÃ¡b.'.split('_'),
        weekdaysMin : 'Do_Lu_Ma_Mi_Ju_Vi_SÃ¡'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D [de] MMMM [de] YYYY',
            LLL : 'D [de] MMMM [de] YYYY H:mm',
            LLLL : 'dddd, D [de] MMMM [de] YYYY H:mm'
        },
        calendar : {
            sameDay : function () {
                return '[hoy a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            nextDay : function () {
                return '[maÃ±ana a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            nextWeek : function () {
                return 'dddd [a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            lastDay : function () {
                return '[ayer a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            lastWeek : function () {
                return '[el] dddd [pasado a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'en %s',
            past : 'hace %s',
            s : 'unos segundos',
            m : 'un minuto',
            mm : '%d minutos',
            h : 'una hora',
            hh : '%d horas',
            d : 'un dÃ­a',
            dd : '%d dÃ­as',
            M : 'un mes',
            MM : '%d meses',
            y : 'un aÃ±o',
            yy : '%d aÃ±os'
        },
        ordinalParse : /\d{1,2}Âº/,
        ordinal : '%dÂº',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : estonian (et)
    //! author : Henry Kehlmann : https://github.com/madhenry
    //! improvements : Illimar Tambek : https://github.com/ragulka

    function et__processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            's' : ['mÃµne sekundi', 'mÃµni sekund', 'paar sekundit'],
            'm' : ['Ã¼he minuti', 'Ã¼ks minut'],
            'mm': [number + ' minuti', number + ' minutit'],
            'h' : ['Ã¼he tunni', 'tund aega', 'Ã¼ks tund'],
            'hh': [number + ' tunni', number + ' tundi'],
            'd' : ['Ã¼he pÃ¤eva', 'Ã¼ks pÃ¤ev'],
            'M' : ['kuu aja', 'kuu aega', 'Ã¼ks kuu'],
            'MM': [number + ' kuu', number + ' kuud'],
            'y' : ['Ã¼he aasta', 'aasta', 'Ã¼ks aasta'],
            'yy': [number + ' aasta', number + ' aastat']
        };
        if (withoutSuffix) {
            return format[key][2] ? format[key][2] : format[key][1];
        }
        return isFuture ? format[key][0] : format[key][1];
    }

    var et = _moment__default.defineLocale('et', {
        months        : 'jaanuar_veebruar_mÃ¤rts_aprill_mai_juuni_juuli_august_september_oktoober_november_detsember'.split('_'),
        monthsShort   : 'jaan_veebr_mÃ¤rts_apr_mai_juuni_juuli_aug_sept_okt_nov_dets'.split('_'),
        weekdays      : 'pÃ¼hapÃ¤ev_esmaspÃ¤ev_teisipÃ¤ev_kolmapÃ¤ev_neljapÃ¤ev_reede_laupÃ¤ev'.split('_'),
        weekdaysShort : 'P_E_T_K_N_R_L'.split('_'),
        weekdaysMin   : 'P_E_T_K_N_R_L'.split('_'),
        longDateFormat : {
            LT   : 'H:mm',
            LTS : 'H:mm:ss',
            L    : 'DD.MM.YYYY',
            LL   : 'D. MMMM YYYY',
            LLL  : 'D. MMMM YYYY H:mm',
            LLLL : 'dddd, D. MMMM YYYY H:mm'
        },
        calendar : {
            sameDay  : '[TÃ¤na,] LT',
            nextDay  : '[Homme,] LT',
            nextWeek : '[JÃ¤rgmine] dddd LT',
            lastDay  : '[Eile,] LT',
            lastWeek : '[Eelmine] dddd LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s pÃ¤rast',
            past   : '%s tagasi',
            s      : et__processRelativeTime,
            m      : et__processRelativeTime,
            mm     : et__processRelativeTime,
            h      : et__processRelativeTime,
            hh     : et__processRelativeTime,
            d      : et__processRelativeTime,
            dd     : '%d pÃ¤eva',
            M      : et__processRelativeTime,
            MM     : et__processRelativeTime,
            y      : et__processRelativeTime,
            yy     : et__processRelativeTime
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : euskara (eu)
    //! author : Eneko Illarramendi : https://github.com/eillarra

    var eu = _moment__default.defineLocale('eu', {
        months : 'urtarrila_otsaila_martxoa_apirila_maiatza_ekaina_uztaila_abuztua_iraila_urria_azaroa_abendua'.split('_'),
        monthsShort : 'urt._ots._mar._api._mai._eka._uzt._abu._ira._urr._aza._abe.'.split('_'),
        weekdays : 'igandea_astelehena_asteartea_asteazkena_osteguna_ostirala_larunbata'.split('_'),
        weekdaysShort : 'ig._al._ar._az._og._ol._lr.'.split('_'),
        weekdaysMin : 'ig_al_ar_az_og_ol_lr'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'YYYY-MM-DD',
            LL : 'YYYY[ko] MMMM[ren] D[a]',
            LLL : 'YYYY[ko] MMMM[ren] D[a] HH:mm',
            LLLL : 'dddd, YYYY[ko] MMMM[ren] D[a] HH:mm',
            l : 'YYYY-M-D',
            ll : 'YYYY[ko] MMM D[a]',
            lll : 'YYYY[ko] MMM D[a] HH:mm',
            llll : 'ddd, YYYY[ko] MMM D[a] HH:mm'
        },
        calendar : {
            sameDay : '[gaur] LT[etan]',
            nextDay : '[bihar] LT[etan]',
            nextWeek : 'dddd LT[etan]',
            lastDay : '[atzo] LT[etan]',
            lastWeek : '[aurreko] dddd LT[etan]',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s barru',
            past : 'duela %s',
            s : 'segundo batzuk',
            m : 'minutu bat',
            mm : '%d minutu',
            h : 'ordu bat',
            hh : '%d ordu',
            d : 'egun bat',
            dd : '%d egun',
            M : 'hilabete bat',
            MM : '%d hilabete',
            y : 'urte bat',
            yy : '%d urte'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Persian (fa)
    //! author : Ebrahim Byagowi : https://github.com/ebraminio

    var fa__symbolMap = {
        '1': 'Û±',
        '2': 'Û²',
        '3': 'Û³',
        '4': 'Û´',
        '5': 'Ûµ',
        '6': 'Û¶',
        '7': 'Û·',
        '8': 'Û¸',
        '9': 'Û¹',
        '0': 'Û°'
    }, fa__numberMap = {
        'Û±': '1',
        'Û²': '2',
        'Û³': '3',
        'Û´': '4',
        'Ûµ': '5',
        'Û¶': '6',
        'Û·': '7',
        'Û¸': '8',
        'Û¹': '9',
        'Û°': '0'
    };

    var fa = _moment__default.defineLocale('fa', {
        months : 'Ú˜Ø§Ù†ÙˆÛŒÙ‡_ÙÙˆØ±ÛŒÙ‡_Ù…Ø§Ø±Ø³_Ø¢ÙˆØ±ÛŒÙ„_Ù…Ù‡_Ú˜ÙˆØ¦Ù†_Ú˜ÙˆØ¦ÛŒÙ‡_Ø§ÙˆØª_Ø³Ù¾ØªØ§Ù…Ø¨Ø±_Ø§Ú©ØªØ¨Ø±_Ù†ÙˆØ§Ù…Ø¨Ø±_Ø¯Ø³Ø§Ù…Ø¨Ø±'.split('_'),
        monthsShort : 'Ú˜Ø§Ù†ÙˆÛŒÙ‡_ÙÙˆØ±ÛŒÙ‡_Ù…Ø§Ø±Ø³_Ø¢ÙˆØ±ÛŒÙ„_Ù…Ù‡_Ú˜ÙˆØ¦Ù†_Ú˜ÙˆØ¦ÛŒÙ‡_Ø§ÙˆØª_Ø³Ù¾ØªØ§Ù…Ø¨Ø±_Ø§Ú©ØªØ¨Ø±_Ù†ÙˆØ§Ù…Ø¨Ø±_Ø¯Ø³Ø§Ù…Ø¨Ø±'.split('_'),
        weekdays : 'ÛŒÚ©\u200cØ´Ù†Ø¨Ù‡_Ø¯ÙˆØ´Ù†Ø¨Ù‡_Ø³Ù‡\u200cØ´Ù†Ø¨Ù‡_Ú†Ù‡Ø§Ø±Ø´Ù†Ø¨Ù‡_Ù¾Ù†Ø¬\u200cØ´Ù†Ø¨Ù‡_Ø¬Ù…Ø¹Ù‡_Ø´Ù†Ø¨Ù‡'.split('_'),
        weekdaysShort : 'ÛŒÚ©\u200cØ´Ù†Ø¨Ù‡_Ø¯ÙˆØ´Ù†Ø¨Ù‡_Ø³Ù‡\u200cØ´Ù†Ø¨Ù‡_Ú†Ù‡Ø§Ø±Ø´Ù†Ø¨Ù‡_Ù¾Ù†Ø¬\u200cØ´Ù†Ø¨Ù‡_Ø¬Ù…Ø¹Ù‡_Ø´Ù†Ø¨Ù‡'.split('_'),
        weekdaysMin : 'ÛŒ_Ø¯_Ø³_Ú†_Ù¾_Ø¬_Ø´'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        meridiemParse: /Ù‚Ø¨Ù„ Ø§Ø² Ø¸Ù‡Ø±|Ø¨Ø¹Ø¯ Ø§Ø² Ø¸Ù‡Ø±/,
        isPM: function (input) {
            return /Ø¨Ø¹Ø¯ Ø§Ø² Ø¸Ù‡Ø±/.test(input);
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return 'Ù‚Ø¨Ù„ Ø§Ø² Ø¸Ù‡Ø±';
            } else {
                return 'Ø¨Ø¹Ø¯ Ø§Ø² Ø¸Ù‡Ø±';
            }
        },
        calendar : {
            sameDay : '[Ø§Ù…Ø±ÙˆØ² Ø³Ø§Ø¹Øª] LT',
            nextDay : '[ÙØ±Ø¯Ø§ Ø³Ø§Ø¹Øª] LT',
            nextWeek : 'dddd [Ø³Ø§Ø¹Øª] LT',
            lastDay : '[Ø¯ÛŒØ±ÙˆØ² Ø³Ø§Ø¹Øª] LT',
            lastWeek : 'dddd [Ù¾ÛŒØ´] [Ø³Ø§Ø¹Øª] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'Ø¯Ø± %s',
            past : '%s Ù¾ÛŒØ´',
            s : 'Ú†Ù†Ø¯ÛŒÙ† Ø«Ø§Ù†ÛŒÙ‡',
            m : 'ÛŒÚ© Ø¯Ù‚ÛŒÙ‚Ù‡',
            mm : '%d Ø¯Ù‚ÛŒÙ‚Ù‡',
            h : 'ÛŒÚ© Ø³Ø§Ø¹Øª',
            hh : '%d Ø³Ø§Ø¹Øª',
            d : 'ÛŒÚ© Ø±ÙˆØ²',
            dd : '%d Ø±ÙˆØ²',
            M : 'ÛŒÚ© Ù…Ø§Ù‡',
            MM : '%d Ù…Ø§Ù‡',
            y : 'ÛŒÚ© Ø³Ø§Ù„',
            yy : '%d Ø³Ø§Ù„'
        },
        preparse: function (string) {
            return string.replace(/[Û°-Û¹]/g, function (match) {
                return fa__numberMap[match];
            }).replace(/ØŒ/g, ',');
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return fa__symbolMap[match];
            }).replace(/,/g, 'ØŒ');
        },
        ordinalParse: /\d{1,2}Ù…/,
        ordinal : '%dÙ…',
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12 // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : finnish (fi)
    //! author : Tarmo Aidantausta : https://github.com/bleadof

    var numbersPast = 'nolla yksi kaksi kolme neljÃ¤ viisi kuusi seitsemÃ¤n kahdeksan yhdeksÃ¤n'.split(' '),
        numbersFuture = [
            'nolla', 'yhden', 'kahden', 'kolmen', 'neljÃ¤n', 'viiden', 'kuuden',
            numbersPast[7], numbersPast[8], numbersPast[9]
        ];
    function fi__translate(number, withoutSuffix, key, isFuture) {
        var result = '';
        switch (key) {
        case 's':
            return isFuture ? 'muutaman sekunnin' : 'muutama sekunti';
        case 'm':
            return isFuture ? 'minuutin' : 'minuutti';
        case 'mm':
            result = isFuture ? 'minuutin' : 'minuuttia';
            break;
        case 'h':
            return isFuture ? 'tunnin' : 'tunti';
        case 'hh':
            result = isFuture ? 'tunnin' : 'tuntia';
            break;
        case 'd':
            return isFuture ? 'pÃ¤ivÃ¤n' : 'pÃ¤ivÃ¤';
        case 'dd':
            result = isFuture ? 'pÃ¤ivÃ¤n' : 'pÃ¤ivÃ¤Ã¤';
            break;
        case 'M':
            return isFuture ? 'kuukauden' : 'kuukausi';
        case 'MM':
            result = isFuture ? 'kuukauden' : 'kuukautta';
            break;
        case 'y':
            return isFuture ? 'vuoden' : 'vuosi';
        case 'yy':
            result = isFuture ? 'vuoden' : 'vuotta';
            break;
        }
        result = verbalNumber(number, isFuture) + ' ' + result;
        return result;
    }
    function verbalNumber(number, isFuture) {
        return number < 10 ? (isFuture ? numbersFuture[number] : numbersPast[number]) : number;
    }

    var fi = _moment__default.defineLocale('fi', {
        months : 'tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kesÃ¤kuu_heinÃ¤kuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu'.split('_'),
        monthsShort : 'tammi_helmi_maalis_huhti_touko_kesÃ¤_heinÃ¤_elo_syys_loka_marras_joulu'.split('_'),
        weekdays : 'sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai'.split('_'),
        weekdaysShort : 'su_ma_ti_ke_to_pe_la'.split('_'),
        weekdaysMin : 'su_ma_ti_ke_to_pe_la'.split('_'),
        longDateFormat : {
            LT : 'HH.mm',
            LTS : 'HH.mm.ss',
            L : 'DD.MM.YYYY',
            LL : 'Do MMMM[ta] YYYY',
            LLL : 'Do MMMM[ta] YYYY, [klo] HH.mm',
            LLLL : 'dddd, Do MMMM[ta] YYYY, [klo] HH.mm',
            l : 'D.M.YYYY',
            ll : 'Do MMM YYYY',
            lll : 'Do MMM YYYY, [klo] HH.mm',
            llll : 'ddd, Do MMM YYYY, [klo] HH.mm'
        },
        calendar : {
            sameDay : '[tÃ¤nÃ¤Ã¤n] [klo] LT',
            nextDay : '[huomenna] [klo] LT',
            nextWeek : 'dddd [klo] LT',
            lastDay : '[eilen] [klo] LT',
            lastWeek : '[viime] dddd[na] [klo] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s pÃ¤Ã¤stÃ¤',
            past : '%s sitten',
            s : fi__translate,
            m : fi__translate,
            mm : fi__translate,
            h : fi__translate,
            hh : fi__translate,
            d : fi__translate,
            dd : fi__translate,
            M : fi__translate,
            MM : fi__translate,
            y : fi__translate,
            yy : fi__translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : faroese (fo)
    //! author : Ragnar Johannesen : https://github.com/ragnar123

    var fo = _moment__default.defineLocale('fo', {
        months : 'januar_februar_mars_aprÃ­l_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
        monthsShort : 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
        weekdays : 'sunnudagur_mÃ¡nadagur_tÃ½sdagur_mikudagur_hÃ³sdagur_frÃ­ggjadagur_leygardagur'.split('_'),
        weekdaysShort : 'sun_mÃ¡n_tÃ½s_mik_hÃ³s_frÃ­_ley'.split('_'),
        weekdaysMin : 'su_mÃ¡_tÃ½_mi_hÃ³_fr_le'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D. MMMM, YYYY HH:mm'
        },
        calendar : {
            sameDay : '[Ã dag kl.] LT',
            nextDay : '[Ã morgin kl.] LT',
            nextWeek : 'dddd [kl.] LT',
            lastDay : '[Ã gjÃ¡r kl.] LT',
            lastWeek : '[sÃ­Ã°stu] dddd [kl] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'um %s',
            past : '%s sÃ­Ã°ani',
            s : 'fÃ¡ sekund',
            m : 'ein minutt',
            mm : '%d minuttir',
            h : 'ein tÃ­mi',
            hh : '%d tÃ­mar',
            d : 'ein dagur',
            dd : '%d dagar',
            M : 'ein mÃ¡naÃ°i',
            MM : '%d mÃ¡naÃ°ir',
            y : 'eitt Ã¡r',
            yy : '%d Ã¡r'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : canadian french (fr-ca)
    //! author : Jonathan Abourbih : https://github.com/jonbca

    var fr_ca = _moment__default.defineLocale('fr-ca', {
        months : 'janvier_fÃ©vrier_mars_avril_mai_juin_juillet_aoÃ»t_septembre_octobre_novembre_dÃ©cembre'.split('_'),
        monthsShort : 'janv._fÃ©vr._mars_avr._mai_juin_juil._aoÃ»t_sept._oct._nov._dÃ©c.'.split('_'),
        weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
        weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
        weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'YYYY-MM-DD',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[Aujourd\'hui Ã ] LT',
            nextDay: '[Demain Ã ] LT',
            nextWeek: 'dddd [Ã ] LT',
            lastDay: '[Hier Ã ] LT',
            lastWeek: 'dddd [dernier Ã ] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'dans %s',
            past : 'il y a %s',
            s : 'quelques secondes',
            m : 'une minute',
            mm : '%d minutes',
            h : 'une heure',
            hh : '%d heures',
            d : 'un jour',
            dd : '%d jours',
            M : 'un mois',
            MM : '%d mois',
            y : 'un an',
            yy : '%d ans'
        },
        ordinalParse: /\d{1,2}(er|e)/,
        ordinal : function (number) {
            return number + (number === 1 ? 'er' : 'e');
        }
    });

    //! moment.js locale configuration
    //! locale : french (fr)
    //! author : John Fischer : https://github.com/jfroffice

    var fr = _moment__default.defineLocale('fr', {
        months : 'janvier_fÃ©vrier_mars_avril_mai_juin_juillet_aoÃ»t_septembre_octobre_novembre_dÃ©cembre'.split('_'),
        monthsShort : 'janv._fÃ©vr._mars_avr._mai_juin_juil._aoÃ»t_sept._oct._nov._dÃ©c.'.split('_'),
        weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
        weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
        weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[Aujourd\'hui Ã ] LT',
            nextDay: '[Demain Ã ] LT',
            nextWeek: 'dddd [Ã ] LT',
            lastDay: '[Hier Ã ] LT',
            lastWeek: 'dddd [dernier Ã ] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'dans %s',
            past : 'il y a %s',
            s : 'quelques secondes',
            m : 'une minute',
            mm : '%d minutes',
            h : 'une heure',
            hh : '%d heures',
            d : 'un jour',
            dd : '%d jours',
            M : 'un mois',
            MM : '%d mois',
            y : 'un an',
            yy : '%d ans'
        },
        ordinalParse: /\d{1,2}(er|)/,
        ordinal : function (number) {
            return number + (number === 1 ? 'er' : '');
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : frisian (fy)
    //! author : Robin van der Vliet : https://github.com/robin0van0der0v

    var fy__monthsShortWithDots = 'jan._feb._mrt._apr._mai_jun._jul._aug._sep._okt._nov._des.'.split('_'),
        fy__monthsShortWithoutDots = 'jan_feb_mrt_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_');

    var fy = _moment__default.defineLocale('fy', {
        months : 'jannewaris_febrewaris_maart_april_maaie_juny_july_augustus_septimber_oktober_novimber_desimber'.split('_'),
        monthsShort : function (m, format) {
            if (/-MMM-/.test(format)) {
                return fy__monthsShortWithoutDots[m.month()];
            } else {
                return fy__monthsShortWithDots[m.month()];
            }
        },
        weekdays : 'snein_moandei_tiisdei_woansdei_tongersdei_freed_sneon'.split('_'),
        weekdaysShort : 'si._mo._ti._wo._to._fr._so.'.split('_'),
        weekdaysMin : 'Si_Mo_Ti_Wo_To_Fr_So'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD-MM-YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[hjoed om] LT',
            nextDay: '[moarn om] LT',
            nextWeek: 'dddd [om] LT',
            lastDay: '[juster om] LT',
            lastWeek: '[Ã´frÃ»ne] dddd [om] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'oer %s',
            past : '%s lyn',
            s : 'in pear sekonden',
            m : 'ien minÃºt',
            mm : '%d minuten',
            h : 'ien oere',
            hh : '%d oeren',
            d : 'ien dei',
            dd : '%d dagen',
            M : 'ien moanne',
            MM : '%d moannen',
            y : 'ien jier',
            yy : '%d jierren'
        },
        ordinalParse: /\d{1,2}(ste|de)/,
        ordinal : function (number) {
            return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de');
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : galician (gl)
    //! author : Juan G. Hurtado : https://github.com/juanghurtado

    var gl = _moment__default.defineLocale('gl', {
        months : 'Xaneiro_Febreiro_Marzo_Abril_Maio_XuÃ±o_Xullo_Agosto_Setembro_Outubro_Novembro_Decembro'.split('_'),
        monthsShort : 'Xan._Feb._Mar._Abr._Mai._XuÃ±._Xul._Ago._Set._Out._Nov._Dec.'.split('_'),
        weekdays : 'Domingo_Luns_Martes_MÃ©rcores_Xoves_Venres_SÃ¡bado'.split('_'),
        weekdaysShort : 'Dom._Lun._Mar._MÃ©r._Xov._Ven._SÃ¡b.'.split('_'),
        weekdaysMin : 'Do_Lu_Ma_MÃ©_Xo_Ve_SÃ¡'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY H:mm',
            LLLL : 'dddd D MMMM YYYY H:mm'
        },
        calendar : {
            sameDay : function () {
                return '[hoxe ' + ((this.hours() !== 1) ? 'Ã¡s' : 'Ã¡') + '] LT';
            },
            nextDay : function () {
                return '[maÃ±Ã¡ ' + ((this.hours() !== 1) ? 'Ã¡s' : 'Ã¡') + '] LT';
            },
            nextWeek : function () {
                return 'dddd [' + ((this.hours() !== 1) ? 'Ã¡s' : 'a') + '] LT';
            },
            lastDay : function () {
                return '[onte ' + ((this.hours() !== 1) ? 'Ã¡' : 'a') + '] LT';
            },
            lastWeek : function () {
                return '[o] dddd [pasado ' + ((this.hours() !== 1) ? 'Ã¡s' : 'a') + '] LT';
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : function (str) {
                if (str === 'uns segundos') {
                    return 'nuns segundos';
                }
                return 'en ' + str;
            },
            past : 'hai %s',
            s : 'uns segundos',
            m : 'un minuto',
            mm : '%d minutos',
            h : 'unha hora',
            hh : '%d horas',
            d : 'un dÃ­a',
            dd : '%d dÃ­as',
            M : 'un mes',
            MM : '%d meses',
            y : 'un ano',
            yy : '%d anos'
        },
        ordinalParse : /\d{1,2}Âº/,
        ordinal : '%dÂº',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Hebrew (he)
    //! author : Tomer Cohen : https://github.com/tomer
    //! author : Moshe Simantov : https://github.com/DevelopmentIL
    //! author : Tal Ater : https://github.com/TalAter

    var he = _moment__default.defineLocale('he', {
        months : '×™× ×•××¨_×¤×‘×¨×•××¨_×ž×¨×¥_××¤×¨×™×œ_×ž××™_×™×•× ×™_×™×•×œ×™_××•×’×•×¡×˜_×¡×¤×˜×ž×‘×¨_××•×§×˜×•×‘×¨_× ×•×‘×ž×‘×¨_×“×¦×ž×‘×¨'.split('_'),
        monthsShort : '×™× ×•×³_×¤×‘×¨×³_×ž×¨×¥_××¤×¨×³_×ž××™_×™×•× ×™_×™×•×œ×™_××•×’×³_×¡×¤×˜×³_××•×§×³_× ×•×‘×³_×“×¦×ž×³'.split('_'),
        weekdays : '×¨××©×•×Ÿ_×©× ×™_×©×œ×™×©×™_×¨×‘×™×¢×™_×—×ž×™×©×™_×©×™×©×™_×©×‘×ª'.split('_'),
        weekdaysShort : '××³_×‘×³_×’×³_×“×³_×”×³_×•×³_×©×³'.split('_'),
        weekdaysMin : '×_×‘_×’_×“_×”_×•_×©'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D [×‘]MMMM YYYY',
            LLL : 'D [×‘]MMMM YYYY HH:mm',
            LLLL : 'dddd, D [×‘]MMMM YYYY HH:mm',
            l : 'D/M/YYYY',
            ll : 'D MMM YYYY',
            lll : 'D MMM YYYY HH:mm',
            llll : 'ddd, D MMM YYYY HH:mm'
        },
        calendar : {
            sameDay : '[×”×™×•× ×‘Ö¾]LT',
            nextDay : '[×ž×—×¨ ×‘Ö¾]LT',
            nextWeek : 'dddd [×‘×©×¢×”] LT',
            lastDay : '[××ª×ž×•×œ ×‘Ö¾]LT',
            lastWeek : '[×‘×™×•×] dddd [×”××—×¨×•×Ÿ ×‘×©×¢×”] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '×‘×¢×•×“ %s',
            past : '×œ×¤× ×™ %s',
            s : '×ž×¡×¤×¨ ×©× ×™×•×ª',
            m : '×“×§×”',
            mm : '%d ×“×§×•×ª',
            h : '×©×¢×”',
            hh : function (number) {
                if (number === 2) {
                    return '×©×¢×ª×™×™×';
                }
                return number + ' ×©×¢×•×ª';
            },
            d : '×™×•×',
            dd : function (number) {
                if (number === 2) {
                    return '×™×•×ž×™×™×';
                }
                return number + ' ×™×ž×™×';
            },
            M : '×—×•×“×©',
            MM : function (number) {
                if (number === 2) {
                    return '×—×•×“×©×™×™×';
                }
                return number + ' ×—×•×“×©×™×';
            },
            y : '×©× ×”',
            yy : function (number) {
                if (number === 2) {
                    return '×©× ×ª×™×™×';
                } else if (number % 10 === 0 && number !== 10) {
                    return number + ' ×©× ×”';
                }
                return number + ' ×©× ×™×';
            }
        }
    });

    //! moment.js locale configuration
    //! locale : hindi (hi)
    //! author : Mayank Singhal : https://github.com/mayanksinghal

    var hi__symbolMap = {
        '1': 'à¥§',
        '2': 'à¥¨',
        '3': 'à¥©',
        '4': 'à¥ª',
        '5': 'à¥«',
        '6': 'à¥¬',
        '7': 'à¥­',
        '8': 'à¥®',
        '9': 'à¥¯',
        '0': 'à¥¦'
    },
    hi__numberMap = {
        'à¥§': '1',
        'à¥¨': '2',
        'à¥©': '3',
        'à¥ª': '4',
        'à¥«': '5',
        'à¥¬': '6',
        'à¥­': '7',
        'à¥®': '8',
        'à¥¯': '9',
        'à¥¦': '0'
    };

    var hi = _moment__default.defineLocale('hi', {
        months : 'à¤œà¤¨à¤µà¤°à¥€_à¤«à¤¼à¤°à¤µà¤°à¥€_à¤®à¤¾à¤°à¥à¤š_à¤…à¤ªà¥à¤°à¥ˆà¤²_à¤®à¤ˆ_à¤œà¥‚à¤¨_à¤œà¥à¤²à¤¾à¤ˆ_à¤…à¤—à¤¸à¥à¤¤_à¤¸à¤¿à¤¤à¤®à¥à¤¬à¤°_à¤…à¤•à¥à¤Ÿà¥‚à¤¬à¤°_à¤¨à¤µà¤®à¥à¤¬à¤°_à¤¦à¤¿à¤¸à¤®à¥à¤¬à¤°'.split('_'),
        monthsShort : 'à¤œà¤¨._à¤«à¤¼à¤°._à¤®à¤¾à¤°à¥à¤š_à¤…à¤ªà¥à¤°à¥ˆ._à¤®à¤ˆ_à¤œà¥‚à¤¨_à¤œà¥à¤²._à¤…à¤—._à¤¸à¤¿à¤¤._à¤…à¤•à¥à¤Ÿà¥‚._à¤¨à¤µ._à¤¦à¤¿à¤¸.'.split('_'),
        weekdays : 'à¤°à¤µà¤¿à¤µà¤¾à¤°_à¤¸à¥‹à¤®à¤µà¤¾à¤°_à¤®à¤‚à¤—à¤²à¤µà¤¾à¤°_à¤¬à¥à¤§à¤µà¤¾à¤°_à¤—à¥à¤°à¥‚à¤µà¤¾à¤°_à¤¶à¥à¤•à¥à¤°à¤µà¤¾à¤°_à¤¶à¤¨à¤¿à¤µà¤¾à¤°'.split('_'),
        weekdaysShort : 'à¤°à¤µà¤¿_à¤¸à¥‹à¤®_à¤®à¤‚à¤—à¤²_à¤¬à¥à¤§_à¤—à¥à¤°à¥‚_à¤¶à¥à¤•à¥à¤°_à¤¶à¤¨à¤¿'.split('_'),
        weekdaysMin : 'à¤°_à¤¸à¥‹_à¤®à¤‚_à¤¬à¥_à¤—à¥_à¤¶à¥_à¤¶'.split('_'),
        longDateFormat : {
            LT : 'A h:mm à¤¬à¤œà¥‡',
            LTS : 'A h:mm:ss à¤¬à¤œà¥‡',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, A h:mm à¤¬à¤œà¥‡',
            LLLL : 'dddd, D MMMM YYYY, A h:mm à¤¬à¤œà¥‡'
        },
        calendar : {
            sameDay : '[à¤†à¤œ] LT',
            nextDay : '[à¤•à¤²] LT',
            nextWeek : 'dddd, LT',
            lastDay : '[à¤•à¤²] LT',
            lastWeek : '[à¤ªà¤¿à¤›à¤²à¥‡] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s à¤®à¥‡à¤‚',
            past : '%s à¤ªà¤¹à¤²à¥‡',
            s : 'à¤•à¥à¤› à¤¹à¥€ à¤•à¥à¤·à¤£',
            m : 'à¤à¤• à¤®à¤¿à¤¨à¤Ÿ',
            mm : '%d à¤®à¤¿à¤¨à¤Ÿ',
            h : 'à¤à¤• à¤˜à¤‚à¤Ÿà¤¾',
            hh : '%d à¤˜à¤‚à¤Ÿà¥‡',
            d : 'à¤à¤• à¤¦à¤¿à¤¨',
            dd : '%d à¤¦à¤¿à¤¨',
            M : 'à¤à¤• à¤®à¤¹à¥€à¤¨à¥‡',
            MM : '%d à¤®à¤¹à¥€à¤¨à¥‡',
            y : 'à¤à¤• à¤µà¤°à¥à¤·',
            yy : '%d à¤µà¤°à¥à¤·'
        },
        preparse: function (string) {
            return string.replace(/[à¥§à¥¨à¥©à¥ªà¥«à¥¬à¥­à¥®à¥¯à¥¦]/g, function (match) {
                return hi__numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return hi__symbolMap[match];
            });
        },
        // Hindi notation for meridiems are quite fuzzy in practice. While there exists
        // a rigid notion of a 'Pahar' it is not used as rigidly in modern Hindi.
        meridiemParse: /à¤°à¤¾à¤¤|à¤¸à¥à¤¬à¤¹|à¤¦à¥‹à¤ªà¤¹à¤°|à¤¶à¤¾à¤®/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'à¤°à¤¾à¤¤') {
                return hour < 4 ? hour : hour + 12;
            } else if (meridiem === 'à¤¸à¥à¤¬à¤¹') {
                return hour;
            } else if (meridiem === 'à¤¦à¥‹à¤ªà¤¹à¤°') {
                return hour >= 10 ? hour : hour + 12;
            } else if (meridiem === 'à¤¶à¤¾à¤®') {
                return hour + 12;
            }
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'à¤°à¤¾à¤¤';
            } else if (hour < 10) {
                return 'à¤¸à¥à¤¬à¤¹';
            } else if (hour < 17) {
                return 'à¤¦à¥‹à¤ªà¤¹à¤°';
            } else if (hour < 20) {
                return 'à¤¶à¤¾à¤®';
            } else {
                return 'à¤°à¤¾à¤¤';
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : hrvatski (hr)
    //! author : Bojan MarkoviÄ‡ : https://github.com/bmarkovic

    function hr__translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'jedna minuta' : 'jedne minute';
        case 'mm':
            if (number === 1) {
                result += 'minuta';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'minute';
            } else {
                result += 'minuta';
            }
            return result;
        case 'h':
            return withoutSuffix ? 'jedan sat' : 'jednog sata';
        case 'hh':
            if (number === 1) {
                result += 'sat';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'sata';
            } else {
                result += 'sati';
            }
            return result;
        case 'dd':
            if (number === 1) {
                result += 'dan';
            } else {
                result += 'dana';
            }
            return result;
        case 'MM':
            if (number === 1) {
                result += 'mjesec';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'mjeseca';
            } else {
                result += 'mjeseci';
            }
            return result;
        case 'yy':
            if (number === 1) {
                result += 'godina';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'godine';
            } else {
                result += 'godina';
            }
            return result;
        }
    }

    var hr = _moment__default.defineLocale('hr', {
        months : 'sijeÄanj_veljaÄa_oÅ¾ujak_travanj_svibanj_lipanj_srpanj_kolovoz_rujan_listopad_studeni_prosinac'.split('_'),
        monthsShort : 'sij._velj._oÅ¾u._tra._svi._lip._srp._kol._ruj._lis._stu._pro.'.split('_'),
        weekdays : 'nedjelja_ponedjeljak_utorak_srijeda_Äetvrtak_petak_subota'.split('_'),
        weekdaysShort : 'ned._pon._uto._sri._Äet._pet._sub.'.split('_'),
        weekdaysMin : 'ne_po_ut_sr_Äe_pe_su'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'DD. MM. YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY H:mm',
            LLLL : 'dddd, D. MMMM YYYY H:mm'
        },
        calendar : {
            sameDay  : '[danas u] LT',
            nextDay  : '[sutra u] LT',
            nextWeek : function () {
                switch (this.day()) {
                case 0:
                    return '[u] [nedjelju] [u] LT';
                case 3:
                    return '[u] [srijedu] [u] LT';
                case 6:
                    return '[u] [subotu] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[u] dddd [u] LT';
                }
            },
            lastDay  : '[juÄer u] LT',
            lastWeek : function () {
                switch (this.day()) {
                case 0:
                case 3:
                    return '[proÅ¡lu] dddd [u] LT';
                case 6:
                    return '[proÅ¡le] [subote] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[proÅ¡li] dddd [u] LT';
                }
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'za %s',
            past   : 'prije %s',
            s      : 'par sekundi',
            m      : hr__translate,
            mm     : hr__translate,
            h      : hr__translate,
            hh     : hr__translate,
            d      : 'dan',
            dd     : hr__translate,
            M      : 'mjesec',
            MM     : hr__translate,
            y      : 'godinu',
            yy     : hr__translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : hungarian (hu)
    //! author : Adam Brunner : https://github.com/adambrunner

    var weekEndings = 'vasÃ¡rnap hÃ©tfÅ‘n kedden szerdÃ¡n csÃ¼tÃ¶rtÃ¶kÃ¶n pÃ©nteken szombaton'.split(' ');
    function hu__translate(number, withoutSuffix, key, isFuture) {
        var num = number,
            suffix;
        switch (key) {
        case 's':
            return (isFuture || withoutSuffix) ? 'nÃ©hÃ¡ny mÃ¡sodperc' : 'nÃ©hÃ¡ny mÃ¡sodperce';
        case 'm':
            return 'egy' + (isFuture || withoutSuffix ? ' perc' : ' perce');
        case 'mm':
            return num + (isFuture || withoutSuffix ? ' perc' : ' perce');
        case 'h':
            return 'egy' + (isFuture || withoutSuffix ? ' Ã³ra' : ' Ã³rÃ¡ja');
        case 'hh':
            return num + (isFuture || withoutSuffix ? ' Ã³ra' : ' Ã³rÃ¡ja');
        case 'd':
            return 'egy' + (isFuture || withoutSuffix ? ' nap' : ' napja');
        case 'dd':
            return num + (isFuture || withoutSuffix ? ' nap' : ' napja');
        case 'M':
            return 'egy' + (isFuture || withoutSuffix ? ' hÃ³nap' : ' hÃ³napja');
        case 'MM':
            return num + (isFuture || withoutSuffix ? ' hÃ³nap' : ' hÃ³napja');
        case 'y':
            return 'egy' + (isFuture || withoutSuffix ? ' Ã©v' : ' Ã©ve');
        case 'yy':
            return num + (isFuture || withoutSuffix ? ' Ã©v' : ' Ã©ve');
        }
        return '';
    }
    function week(isFuture) {
        return (isFuture ? '' : '[mÃºlt] ') + '[' + weekEndings[this.day()] + '] LT[-kor]';
    }

    var hu = _moment__default.defineLocale('hu', {
        months : 'januÃ¡r_februÃ¡r_mÃ¡rcius_Ã¡prilis_mÃ¡jus_jÃºnius_jÃºlius_augusztus_szeptember_oktÃ³ber_november_december'.split('_'),
        monthsShort : 'jan_feb_mÃ¡rc_Ã¡pr_mÃ¡j_jÃºn_jÃºl_aug_szept_okt_nov_dec'.split('_'),
        weekdays : 'vasÃ¡rnap_hÃ©tfÅ‘_kedd_szerda_csÃ¼tÃ¶rtÃ¶k_pÃ©ntek_szombat'.split('_'),
        weekdaysShort : 'vas_hÃ©t_kedd_sze_csÃ¼t_pÃ©n_szo'.split('_'),
        weekdaysMin : 'v_h_k_sze_cs_p_szo'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'YYYY.MM.DD.',
            LL : 'YYYY. MMMM D.',
            LLL : 'YYYY. MMMM D. H:mm',
            LLLL : 'YYYY. MMMM D., dddd H:mm'
        },
        meridiemParse: /de|du/i,
        isPM: function (input) {
            return input.charAt(1).toLowerCase() === 'u';
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours < 12) {
                return isLower === true ? 'de' : 'DE';
            } else {
                return isLower === true ? 'du' : 'DU';
            }
        },
        calendar : {
            sameDay : '[ma] LT[-kor]',
            nextDay : '[holnap] LT[-kor]',
            nextWeek : function () {
                return week.call(this, true);
            },
            lastDay : '[tegnap] LT[-kor]',
            lastWeek : function () {
                return week.call(this, false);
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s mÃºlva',
            past : '%s',
            s : hu__translate,
            m : hu__translate,
            mm : hu__translate,
            h : hu__translate,
            hh : hu__translate,
            d : hu__translate,
            dd : hu__translate,
            M : hu__translate,
            MM : hu__translate,
            y : hu__translate,
            yy : hu__translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Armenian (hy-am)
    //! author : Armendarabyan : https://github.com/armendarabyan

    function hy_am__monthsCaseReplace(m, format) {
        var months = {
            'nominative': 'Õ°Õ¸Ö‚Õ¶Õ¾Õ¡Ö€_ÖƒÕ¥Õ¿Ö€Õ¾Õ¡Ö€_Õ´Õ¡Ö€Õ¿_Õ¡ÕºÖ€Õ«Õ¬_Õ´Õ¡ÕµÕ«Õ½_Õ°Õ¸Ö‚Õ¶Õ«Õ½_Õ°Õ¸Ö‚Õ¬Õ«Õ½_Ö…Õ£Õ¸Õ½Õ¿Õ¸Õ½_Õ½Õ¥ÕºÕ¿Õ¥Õ´Õ¢Õ¥Ö€_Õ°Õ¸Õ¯Õ¿Õ¥Õ´Õ¢Õ¥Ö€_Õ¶Õ¸ÕµÕ¥Õ´Õ¢Õ¥Ö€_Õ¤Õ¥Õ¯Õ¿Õ¥Õ´Õ¢Õ¥Ö€'.split('_'),
            'accusative': 'Õ°Õ¸Ö‚Õ¶Õ¾Õ¡Ö€Õ«_ÖƒÕ¥Õ¿Ö€Õ¾Õ¡Ö€Õ«_Õ´Õ¡Ö€Õ¿Õ«_Õ¡ÕºÖ€Õ«Õ¬Õ«_Õ´Õ¡ÕµÕ«Õ½Õ«_Õ°Õ¸Ö‚Õ¶Õ«Õ½Õ«_Õ°Õ¸Ö‚Õ¬Õ«Õ½Õ«_Ö…Õ£Õ¸Õ½Õ¿Õ¸Õ½Õ«_Õ½Õ¥ÕºÕ¿Õ¥Õ´Õ¢Õ¥Ö€Õ«_Õ°Õ¸Õ¯Õ¿Õ¥Õ´Õ¢Õ¥Ö€Õ«_Õ¶Õ¸ÕµÕ¥Õ´Õ¢Õ¥Ö€Õ«_Õ¤Õ¥Õ¯Õ¿Õ¥Õ´Õ¢Õ¥Ö€Õ«'.split('_')
        },
        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
            'accusative' :
            'nominative';
        return months[nounCase][m.month()];
    }
    function hy_am__monthsShortCaseReplace(m, format) {
        var monthsShort = 'Õ°Õ¶Õ¾_ÖƒÕ¿Ö€_Õ´Ö€Õ¿_Õ¡ÕºÖ€_Õ´ÕµÕ½_Õ°Õ¶Õ½_Õ°Õ¬Õ½_Ö…Õ£Õ½_Õ½ÕºÕ¿_Õ°Õ¯Õ¿_Õ¶Õ´Õ¢_Õ¤Õ¯Õ¿'.split('_');
        return monthsShort[m.month()];
    }
    function hy_am__weekdaysCaseReplace(m, format) {
        var weekdays = 'Õ¯Õ«Ö€Õ¡Õ¯Õ«_Õ¥Ö€Õ¯Õ¸Ö‚Õ·Õ¡Õ¢Õ©Õ«_Õ¥Ö€Õ¥Ö„Õ·Õ¡Õ¢Õ©Õ«_Õ¹Õ¸Ö€Õ¥Ö„Õ·Õ¡Õ¢Õ©Õ«_Õ°Õ«Õ¶Õ£Õ·Õ¡Õ¢Õ©Õ«_Õ¸Ö‚Ö€Õ¢Õ¡Õ©_Õ·Õ¡Õ¢Õ¡Õ©'.split('_');
        return weekdays[m.day()];
    }

    var hy_am = _moment__default.defineLocale('hy-am', {
        months : hy_am__monthsCaseReplace,
        monthsShort : hy_am__monthsShortCaseReplace,
        weekdays : hy_am__weekdaysCaseReplace,
        weekdaysShort : 'Õ¯Ö€Õ¯_Õ¥Ö€Õ¯_Õ¥Ö€Ö„_Õ¹Ö€Ö„_Õ°Õ¶Õ£_Õ¸Ö‚Ö€Õ¢_Õ·Õ¢Õ©'.split('_'),
        weekdaysMin : 'Õ¯Ö€Õ¯_Õ¥Ö€Õ¯_Õ¥Ö€Ö„_Õ¹Ö€Ö„_Õ°Õ¶Õ£_Õ¸Ö‚Ö€Õ¢_Õ·Õ¢Õ©'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY Õ©.',
            LLL : 'D MMMM YYYY Õ©., HH:mm',
            LLLL : 'dddd, D MMMM YYYY Õ©., HH:mm'
        },
        calendar : {
            sameDay: '[Õ¡ÕµÕ½Ö…Ö€] LT',
            nextDay: '[Õ¾Õ¡Õ²Õ¨] LT',
            lastDay: '[Õ¥Ö€Õ¥Õ¯] LT',
            nextWeek: function () {
                return 'dddd [Ö…Ö€Õ¨ ÕªÕ¡Õ´Õ¨] LT';
            },
            lastWeek: function () {
                return '[Õ¡Õ¶ÖÕ¡Õ®] dddd [Ö…Ö€Õ¨ ÕªÕ¡Õ´Õ¨] LT';
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : '%s Õ°Õ¥Õ¿Õ¸',
            past : '%s Õ¡Õ¼Õ¡Õ»',
            s : 'Õ´Õ« Ö„Õ¡Õ¶Õ« Õ¾Õ¡ÕµÖ€Õ¯ÕµÕ¡Õ¶',
            m : 'Ö€Õ¸ÕºÕ¥',
            mm : '%d Ö€Õ¸ÕºÕ¥',
            h : 'ÕªÕ¡Õ´',
            hh : '%d ÕªÕ¡Õ´',
            d : 'Ö…Ö€',
            dd : '%d Ö…Ö€',
            M : 'Õ¡Õ´Õ«Õ½',
            MM : '%d Õ¡Õ´Õ«Õ½',
            y : 'Õ¿Õ¡Ö€Õ«',
            yy : '%d Õ¿Õ¡Ö€Õ«'
        },
        meridiemParse: /Õ£Õ«Õ·Õ¥Ö€Õ¾Õ¡|Õ¡Õ¼Õ¡Õ¾Õ¸Õ¿Õ¾Õ¡|ÖÕ¥Ö€Õ¥Õ¯Õ¾Õ¡|Õ¥Ö€Õ¥Õ¯Õ¸ÕµÕ¡Õ¶/,
        isPM: function (input) {
            return /^(ÖÕ¥Ö€Õ¥Õ¯Õ¾Õ¡|Õ¥Ö€Õ¥Õ¯Õ¸ÕµÕ¡Õ¶)$/.test(input);
        },
        meridiem : function (hour) {
            if (hour < 4) {
                return 'Õ£Õ«Õ·Õ¥Ö€Õ¾Õ¡';
            } else if (hour < 12) {
                return 'Õ¡Õ¼Õ¡Õ¾Õ¸Õ¿Õ¾Õ¡';
            } else if (hour < 17) {
                return 'ÖÕ¥Ö€Õ¥Õ¯Õ¾Õ¡';
            } else {
                return 'Õ¥Ö€Õ¥Õ¯Õ¸ÕµÕ¡Õ¶';
            }
        },
        ordinalParse: /\d{1,2}|\d{1,2}-(Õ«Õ¶|Ö€Õ¤)/,
        ordinal: function (number, period) {
            switch (period) {
            case 'DDD':
            case 'w':
            case 'W':
            case 'DDDo':
                if (number === 1) {
                    return number + '-Õ«Õ¶';
                }
                return number + '-Ö€Õ¤';
            default:
                return number;
            }
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Bahasa Indonesia (id)
    //! author : Mohammad Satrio Utomo : https://github.com/tyok
    //! reference: http://id.wikisource.org/wiki/Pedoman_Umum_Ejaan_Bahasa_Indonesia_yang_Disempurnakan

    var id = _moment__default.defineLocale('id', {
        months : 'Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_November_Desember'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nov_Des'.split('_'),
        weekdays : 'Minggu_Senin_Selasa_Rabu_Kamis_Jumat_Sabtu'.split('_'),
        weekdaysShort : 'Min_Sen_Sel_Rab_Kam_Jum_Sab'.split('_'),
        weekdaysMin : 'Mg_Sn_Sl_Rb_Km_Jm_Sb'.split('_'),
        longDateFormat : {
            LT : 'HH.mm',
            LTS : 'HH.mm.ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY [pukul] HH.mm',
            LLLL : 'dddd, D MMMM YYYY [pukul] HH.mm'
        },
        meridiemParse: /pagi|siang|sore|malam/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'pagi') {
                return hour;
            } else if (meridiem === 'siang') {
                return hour >= 11 ? hour : hour + 12;
            } else if (meridiem === 'sore' || meridiem === 'malam') {
                return hour + 12;
            }
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours < 11) {
                return 'pagi';
            } else if (hours < 15) {
                return 'siang';
            } else if (hours < 19) {
                return 'sore';
            } else {
                return 'malam';
            }
        },
        calendar : {
            sameDay : '[Hari ini pukul] LT',
            nextDay : '[Besok pukul] LT',
            nextWeek : 'dddd [pukul] LT',
            lastDay : '[Kemarin pukul] LT',
            lastWeek : 'dddd [lalu pukul] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'dalam %s',
            past : '%s yang lalu',
            s : 'beberapa detik',
            m : 'semenit',
            mm : '%d menit',
            h : 'sejam',
            hh : '%d jam',
            d : 'sehari',
            dd : '%d hari',
            M : 'sebulan',
            MM : '%d bulan',
            y : 'setahun',
            yy : '%d tahun'
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : icelandic (is)
    //! author : Hinrik Ã–rn SigurÃ°sson : https://github.com/hinrik

    function is__plural(n) {
        if (n % 100 === 11) {
            return true;
        } else if (n % 10 === 1) {
            return false;
        }
        return true;
    }
    function is__translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':
            return withoutSuffix || isFuture ? 'nokkrar sekÃºndur' : 'nokkrum sekÃºndum';
        case 'm':
            return withoutSuffix ? 'mÃ­nÃºta' : 'mÃ­nÃºtu';
        case 'mm':
            if (is__plural(number)) {
                return result + (withoutSuffix || isFuture ? 'mÃ­nÃºtur' : 'mÃ­nÃºtum');
            } else if (withoutSuffix) {
                return result + 'mÃ­nÃºta';
            }
            return result + 'mÃ­nÃºtu';
        case 'hh':
            if (is__plural(number)) {
                return result + (withoutSuffix || isFuture ? 'klukkustundir' : 'klukkustundum');
            }
            return result + 'klukkustund';
        case 'd':
            if (withoutSuffix) {
                return 'dagur';
            }
            return isFuture ? 'dag' : 'degi';
        case 'dd':
            if (is__plural(number)) {
                if (withoutSuffix) {
                    return result + 'dagar';
                }
                return result + (isFuture ? 'daga' : 'dÃ¶gum');
            } else if (withoutSuffix) {
                return result + 'dagur';
            }
            return result + (isFuture ? 'dag' : 'degi');
        case 'M':
            if (withoutSuffix) {
                return 'mÃ¡nuÃ°ur';
            }
            return isFuture ? 'mÃ¡nuÃ°' : 'mÃ¡nuÃ°i';
        case 'MM':
            if (is__plural(number)) {
                if (withoutSuffix) {
                    return result + 'mÃ¡nuÃ°ir';
                }
                return result + (isFuture ? 'mÃ¡nuÃ°i' : 'mÃ¡nuÃ°um');
            } else if (withoutSuffix) {
                return result + 'mÃ¡nuÃ°ur';
            }
            return result + (isFuture ? 'mÃ¡nuÃ°' : 'mÃ¡nuÃ°i');
        case 'y':
            return withoutSuffix || isFuture ? 'Ã¡r' : 'Ã¡ri';
        case 'yy':
            if (is__plural(number)) {
                return result + (withoutSuffix || isFuture ? 'Ã¡r' : 'Ã¡rum');
            }
            return result + (withoutSuffix || isFuture ? 'Ã¡r' : 'Ã¡ri');
        }
    }

    var is = _moment__default.defineLocale('is', {
        months : 'janÃºar_febrÃºar_mars_aprÃ­l_maÃ­_jÃºnÃ­_jÃºlÃ­_Ã¡gÃºst_september_oktÃ³ber_nÃ³vember_desember'.split('_'),
        monthsShort : 'jan_feb_mar_apr_maÃ­_jÃºn_jÃºl_Ã¡gÃº_sep_okt_nÃ³v_des'.split('_'),
        weekdays : 'sunnudagur_mÃ¡nudagur_Ã¾riÃ°judagur_miÃ°vikudagur_fimmtudagur_fÃ¶studagur_laugardagur'.split('_'),
        weekdaysShort : 'sun_mÃ¡n_Ã¾ri_miÃ°_fim_fÃ¶s_lau'.split('_'),
        weekdaysMin : 'Su_MÃ¡_Ãžr_Mi_Fi_FÃ¶_La'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY [kl.] H:mm',
            LLLL : 'dddd, D. MMMM YYYY [kl.] H:mm'
        },
        calendar : {
            sameDay : '[Ã­ dag kl.] LT',
            nextDay : '[Ã¡ morgun kl.] LT',
            nextWeek : 'dddd [kl.] LT',
            lastDay : '[Ã­ gÃ¦r kl.] LT',
            lastWeek : '[sÃ­Ã°asta] dddd [kl.] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'eftir %s',
            past : 'fyrir %s sÃ­Ã°an',
            s : is__translate,
            m : is__translate,
            mm : is__translate,
            h : 'klukkustund',
            hh : is__translate,
            d : is__translate,
            dd : is__translate,
            M : is__translate,
            MM : is__translate,
            y : is__translate,
            yy : is__translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : italian (it)
    //! author : Lorenzo : https://github.com/aliem
    //! author: Mattia Larentis: https://github.com/nostalgiaz

    var it = _moment__default.defineLocale('it', {
        months : 'gennaio_febbraio_marzo_aprile_maggio_giugno_luglio_agosto_settembre_ottobre_novembre_dicembre'.split('_'),
        monthsShort : 'gen_feb_mar_apr_mag_giu_lug_ago_set_ott_nov_dic'.split('_'),
        weekdays : 'Domenica_LunedÃ¬_MartedÃ¬_MercoledÃ¬_GiovedÃ¬_VenerdÃ¬_Sabato'.split('_'),
        weekdaysShort : 'Dom_Lun_Mar_Mer_Gio_Ven_Sab'.split('_'),
        weekdaysMin : 'D_L_Ma_Me_G_V_S'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[Oggi alle] LT',
            nextDay: '[Domani alle] LT',
            nextWeek: 'dddd [alle] LT',
            lastDay: '[Ieri alle] LT',
            lastWeek: function () {
                switch (this.day()) {
                    case 0:
                        return '[la scorsa] dddd [alle] LT';
                    default:
                        return '[lo scorso] dddd [alle] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : function (s) {
                return ((/^[0-9].+$/).test(s) ? 'tra' : 'in') + ' ' + s;
            },
            past : '%s fa',
            s : 'alcuni secondi',
            m : 'un minuto',
            mm : '%d minuti',
            h : 'un\'ora',
            hh : '%d ore',
            d : 'un giorno',
            dd : '%d giorni',
            M : 'un mese',
            MM : '%d mesi',
            y : 'un anno',
            yy : '%d anni'
        },
        ordinalParse : /\d{1,2}Âº/,
        ordinal: '%dÂº',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : japanese (ja)
    //! author : LI Long : https://github.com/baryon

    var ja = _moment__default.defineLocale('ja', {
        months : '1æœˆ_2æœˆ_3æœˆ_4æœˆ_5æœˆ_6æœˆ_7æœˆ_8æœˆ_9æœˆ_10æœˆ_11æœˆ_12æœˆ'.split('_'),
        monthsShort : '1æœˆ_2æœˆ_3æœˆ_4æœˆ_5æœˆ_6æœˆ_7æœˆ_8æœˆ_9æœˆ_10æœˆ_11æœˆ_12æœˆ'.split('_'),
        weekdays : 'æ—¥æ›œæ—¥_æœˆæ›œæ—¥_ç«æ›œæ—¥_æ°´æ›œæ—¥_æœ¨æ›œæ—¥_é‡‘æ›œæ—¥_åœŸæ›œæ—¥'.split('_'),
        weekdaysShort : 'æ—¥_æœˆ_ç«_æ°´_æœ¨_é‡‘_åœŸ'.split('_'),
        weekdaysMin : 'æ—¥_æœˆ_ç«_æ°´_æœ¨_é‡‘_åœŸ'.split('_'),
        longDateFormat : {
            LT : 'Ahæ™‚måˆ†',
            LTS : 'Ahæ™‚måˆ†sç§’',
            L : 'YYYY/MM/DD',
            LL : 'YYYYå¹´MæœˆDæ—¥',
            LLL : 'YYYYå¹´MæœˆDæ—¥Ahæ™‚måˆ†',
            LLLL : 'YYYYå¹´MæœˆDæ—¥Ahæ™‚måˆ† dddd'
        },
        meridiemParse: /åˆå‰|åˆå¾Œ/i,
        isPM : function (input) {
            return input === 'åˆå¾Œ';
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return 'åˆå‰';
            } else {
                return 'åˆå¾Œ';
            }
        },
        calendar : {
            sameDay : '[ä»Šæ—¥] LT',
            nextDay : '[æ˜Žæ—¥] LT',
            nextWeek : '[æ¥é€±]dddd LT',
            lastDay : '[æ˜¨æ—¥] LT',
            lastWeek : '[å‰é€±]dddd LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%så¾Œ',
            past : '%så‰',
            s : 'æ•°ç§’',
            m : '1åˆ†',
            mm : '%dåˆ†',
            h : '1æ™‚é–“',
            hh : '%dæ™‚é–“',
            d : '1æ—¥',
            dd : '%dæ—¥',
            M : '1ãƒ¶æœˆ',
            MM : '%dãƒ¶æœˆ',
            y : '1å¹´',
            yy : '%då¹´'
        }
    });

    //! moment.js locale configuration
    //! locale : Boso Jowo (jv)
    //! author : Rony Lantip : https://github.com/lantip
    //! reference: http://jv.wikipedia.org/wiki/Basa_Jawa

    var jv = _moment__default.defineLocale('jv', {
        months : 'Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_Nopember_Desember'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nop_Des'.split('_'),
        weekdays : 'Minggu_Senen_Seloso_Rebu_Kemis_Jemuwah_Septu'.split('_'),
        weekdaysShort : 'Min_Sen_Sel_Reb_Kem_Jem_Sep'.split('_'),
        weekdaysMin : 'Mg_Sn_Sl_Rb_Km_Jm_Sp'.split('_'),
        longDateFormat : {
            LT : 'HH.mm',
            LTS : 'HH.mm.ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY [pukul] HH.mm',
            LLLL : 'dddd, D MMMM YYYY [pukul] HH.mm'
        },
        meridiemParse: /enjing|siyang|sonten|ndalu/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'enjing') {
                return hour;
            } else if (meridiem === 'siyang') {
                return hour >= 11 ? hour : hour + 12;
            } else if (meridiem === 'sonten' || meridiem === 'ndalu') {
                return hour + 12;
            }
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours < 11) {
                return 'enjing';
            } else if (hours < 15) {
                return 'siyang';
            } else if (hours < 19) {
                return 'sonten';
            } else {
                return 'ndalu';
            }
        },
        calendar : {
            sameDay : '[Dinten puniko pukul] LT',
            nextDay : '[Mbenjang pukul] LT',
            nextWeek : 'dddd [pukul] LT',
            lastDay : '[Kala wingi pukul] LT',
            lastWeek : 'dddd [kepengker pukul] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'wonten ing %s',
            past : '%s ingkang kepengker',
            s : 'sawetawis detik',
            m : 'setunggal menit',
            mm : '%d menit',
            h : 'setunggal jam',
            hh : '%d jam',
            d : 'sedinten',
            dd : '%d dinten',
            M : 'sewulan',
            MM : '%d wulan',
            y : 'setaun',
            yy : '%d taun'
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Georgian (ka)
    //! author : Irakli Janiashvili : https://github.com/irakli-janiashvili

    function ka__monthsCaseReplace(m, format) {
        var months = {
            'nominative': 'áƒ˜áƒáƒœáƒ•áƒáƒ áƒ˜_áƒ—áƒ”áƒ‘áƒ”áƒ áƒ•áƒáƒšáƒ˜_áƒ›áƒáƒ áƒ¢áƒ˜_áƒáƒžáƒ áƒ˜áƒšáƒ˜_áƒ›áƒáƒ˜áƒ¡áƒ˜_áƒ˜áƒ•áƒœáƒ˜áƒ¡áƒ˜_áƒ˜áƒ•áƒšáƒ˜áƒ¡áƒ˜_áƒáƒ’áƒ•áƒ˜áƒ¡áƒ¢áƒ_áƒ¡áƒ”áƒ¥áƒ¢áƒ”áƒ›áƒ‘áƒ”áƒ áƒ˜_áƒáƒ¥áƒ¢áƒáƒ›áƒ‘áƒ”áƒ áƒ˜_áƒœáƒáƒ”áƒ›áƒ‘áƒ”áƒ áƒ˜_áƒ“áƒ”áƒ™áƒ”áƒ›áƒ‘áƒ”áƒ áƒ˜'.split('_'),
            'accusative': 'áƒ˜áƒáƒœáƒ•áƒáƒ áƒ¡_áƒ—áƒ”áƒ‘áƒ”áƒ áƒ•áƒáƒšáƒ¡_áƒ›áƒáƒ áƒ¢áƒ¡_áƒáƒžáƒ áƒ˜áƒšáƒ˜áƒ¡_áƒ›áƒáƒ˜áƒ¡áƒ¡_áƒ˜áƒ•áƒœáƒ˜áƒ¡áƒ¡_áƒ˜áƒ•áƒšáƒ˜áƒ¡áƒ¡_áƒáƒ’áƒ•áƒ˜áƒ¡áƒ¢áƒ¡_áƒ¡áƒ”áƒ¥áƒ¢áƒ”áƒ›áƒ‘áƒ”áƒ áƒ¡_áƒáƒ¥áƒ¢áƒáƒ›áƒ‘áƒ”áƒ áƒ¡_áƒœáƒáƒ”áƒ›áƒ‘áƒ”áƒ áƒ¡_áƒ“áƒ”áƒ™áƒ”áƒ›áƒ‘áƒ”áƒ áƒ¡'.split('_')
        },
        nounCase = (/D[oD] *MMMM?/).test(format) ?
            'accusative' :
            'nominative';
        return months[nounCase][m.month()];
    }
    function ka__weekdaysCaseReplace(m, format) {
        var weekdays = {
            'nominative': 'áƒ™áƒ•áƒ˜áƒ áƒ_áƒáƒ áƒ¨áƒáƒ‘áƒáƒ—áƒ˜_áƒ¡áƒáƒ›áƒ¨áƒáƒ‘áƒáƒ—áƒ˜_áƒáƒ—áƒ®áƒ¨áƒáƒ‘áƒáƒ—áƒ˜_áƒ®áƒ£áƒ—áƒ¨áƒáƒ‘áƒáƒ—áƒ˜_áƒžáƒáƒ áƒáƒ¡áƒ™áƒ”áƒ•áƒ˜_áƒ¨áƒáƒ‘áƒáƒ—áƒ˜'.split('_'),
            'accusative': 'áƒ™áƒ•áƒ˜áƒ áƒáƒ¡_áƒáƒ áƒ¨áƒáƒ‘áƒáƒ—áƒ¡_áƒ¡áƒáƒ›áƒ¨áƒáƒ‘áƒáƒ—áƒ¡_áƒáƒ—áƒ®áƒ¨áƒáƒ‘áƒáƒ—áƒ¡_áƒ®áƒ£áƒ—áƒ¨áƒáƒ‘áƒáƒ—áƒ¡_áƒžáƒáƒ áƒáƒ¡áƒ™áƒ”áƒ•áƒ¡_áƒ¨áƒáƒ‘áƒáƒ—áƒ¡'.split('_')
        },
        nounCase = (/(áƒ¬áƒ˜áƒœáƒ|áƒ¨áƒ”áƒ›áƒ“áƒ”áƒ’)/).test(format) ?
            'accusative' :
            'nominative';
        return weekdays[nounCase][m.day()];
    }

    var ka = _moment__default.defineLocale('ka', {
        months : ka__monthsCaseReplace,
        monthsShort : 'áƒ˜áƒáƒœ_áƒ—áƒ”áƒ‘_áƒ›áƒáƒ _áƒáƒžáƒ _áƒ›áƒáƒ˜_áƒ˜áƒ•áƒœ_áƒ˜áƒ•áƒš_áƒáƒ’áƒ•_áƒ¡áƒ”áƒ¥_áƒáƒ¥áƒ¢_áƒœáƒáƒ”_áƒ“áƒ”áƒ™'.split('_'),
        weekdays : ka__weekdaysCaseReplace,
        weekdaysShort : 'áƒ™áƒ•áƒ˜_áƒáƒ áƒ¨_áƒ¡áƒáƒ›_áƒáƒ—áƒ®_áƒ®áƒ£áƒ—_áƒžáƒáƒ _áƒ¨áƒáƒ‘'.split('_'),
        weekdaysMin : 'áƒ™áƒ•_áƒáƒ _áƒ¡áƒ_áƒáƒ—_áƒ®áƒ£_áƒžáƒ_áƒ¨áƒ'.split('_'),
        longDateFormat : {
            LT : 'h:mm A',
            LTS : 'h:mm:ss A',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY h:mm A',
            LLLL : 'dddd, D MMMM YYYY h:mm A'
        },
        calendar : {
            sameDay : '[áƒ“áƒ¦áƒ”áƒ¡] LT[-áƒ–áƒ”]',
            nextDay : '[áƒ®áƒ•áƒáƒš] LT[-áƒ–áƒ”]',
            lastDay : '[áƒ’áƒ£áƒ¨áƒ˜áƒœ] LT[-áƒ–áƒ”]',
            nextWeek : '[áƒ¨áƒ”áƒ›áƒ“áƒ”áƒ’] dddd LT[-áƒ–áƒ”]',
            lastWeek : '[áƒ¬áƒ˜áƒœáƒ] dddd LT-áƒ–áƒ”',
            sameElse : 'L'
        },
        relativeTime : {
            future : function (s) {
                return (/(áƒ¬áƒáƒ›áƒ˜|áƒ¬áƒ£áƒ—áƒ˜|áƒ¡áƒáƒáƒ—áƒ˜|áƒ¬áƒ”áƒšáƒ˜)/).test(s) ?
                    s.replace(/áƒ˜$/, 'áƒ¨áƒ˜') :
                    s + 'áƒ¨áƒ˜';
            },
            past : function (s) {
                if ((/(áƒ¬áƒáƒ›áƒ˜|áƒ¬áƒ£áƒ—áƒ˜|áƒ¡áƒáƒáƒ—áƒ˜|áƒ“áƒ¦áƒ”|áƒ—áƒ•áƒ”)/).test(s)) {
                    return s.replace(/(áƒ˜|áƒ”)$/, 'áƒ˜áƒ¡ áƒ¬áƒ˜áƒœ');
                }
                if ((/áƒ¬áƒ”áƒšáƒ˜/).test(s)) {
                    return s.replace(/áƒ¬áƒ”áƒšáƒ˜$/, 'áƒ¬áƒšáƒ˜áƒ¡ áƒ¬áƒ˜áƒœ');
                }
            },
            s : 'áƒ áƒáƒ›áƒ“áƒ”áƒœáƒ˜áƒ›áƒ” áƒ¬áƒáƒ›áƒ˜',
            m : 'áƒ¬áƒ£áƒ—áƒ˜',
            mm : '%d áƒ¬áƒ£áƒ—áƒ˜',
            h : 'áƒ¡áƒáƒáƒ—áƒ˜',
            hh : '%d áƒ¡áƒáƒáƒ—áƒ˜',
            d : 'áƒ“áƒ¦áƒ”',
            dd : '%d áƒ“áƒ¦áƒ”',
            M : 'áƒ—áƒ•áƒ”',
            MM : '%d áƒ—áƒ•áƒ”',
            y : 'áƒ¬áƒ”áƒšáƒ˜',
            yy : '%d áƒ¬áƒ”áƒšáƒ˜'
        },
        ordinalParse: /0|1-áƒšáƒ˜|áƒ›áƒ”-\d{1,2}|\d{1,2}-áƒ”/,
        ordinal : function (number) {
            if (number === 0) {
                return number;
            }
            if (number === 1) {
                return number + '-áƒšáƒ˜';
            }
            if ((number < 20) || (number <= 100 && (number % 20 === 0)) || (number % 100 === 0)) {
                return 'áƒ›áƒ”-' + number;
            }
            return number + '-áƒ”';
        },
        week : {
            dow : 1,
            doy : 7
        }
    });

    //! moment.js locale configuration
    //! locale : khmer (km)
    //! author : Kruy Vanna : https://github.com/kruyvanna

    var km = _moment__default.defineLocale('km', {
        months: 'áž˜áž€ážšáž¶_áž€áž»áž˜áŸ’áž—áŸˆ_áž˜áž·áž“áž¶_áž˜áŸážŸáž¶_áž§ážŸáž—áž¶_áž˜áž·ážáž»áž“áž¶_áž€áž€áŸ’áž€ážŠáž¶_ážŸáž¸áž áž¶_áž€áž‰áŸ’áž‰áž¶_ážáž»áž›áž¶_ážœáž·áž…áŸ’áž†áž·áž€áž¶_áž’áŸ’áž“áž¼'.split('_'),
        monthsShort: 'áž˜áž€ážšáž¶_áž€áž»áž˜áŸ’áž—áŸˆ_áž˜áž·áž“áž¶_áž˜áŸážŸáž¶_áž§ážŸáž—áž¶_áž˜áž·ážáž»áž“áž¶_áž€áž€áŸ’áž€ážŠáž¶_ážŸáž¸áž áž¶_áž€áž‰áŸ’áž‰áž¶_ážáž»áž›áž¶_ážœáž·áž…áŸ’áž†áž·áž€áž¶_áž’áŸ’áž“áž¼'.split('_'),
        weekdays: 'áž¢áž¶áž‘áž·ážáŸ’áž™_áž…áŸáž“áŸ’áž‘_áž¢áž„áŸ’áž‚áž¶ážš_áž–áž»áž’_áž–áŸ’ážšáž ážŸáŸ’áž”ážáž·áŸ_ážŸáž»áž€áŸ’ážš_ážŸáŸ…ážšáŸ'.split('_'),
        weekdaysShort: 'áž¢áž¶áž‘áž·ážáŸ’áž™_áž…áŸáž“áŸ’áž‘_áž¢áž„áŸ’áž‚áž¶ážš_áž–áž»áž’_áž–áŸ’ážšáž ážŸáŸ’áž”ážáž·áŸ_ážŸáž»áž€áŸ’ážš_ážŸáŸ…ážšáŸ'.split('_'),
        weekdaysMin: 'áž¢áž¶áž‘áž·ážáŸ’áž™_áž…áŸáž“áŸ’áž‘_áž¢áž„áŸ’áž‚áž¶ážš_áž–áž»áž’_áž–áŸ’ážšáž ážŸáŸ’áž”ážáž·áŸ_ážŸáž»áž€áŸ’ážš_ážŸáŸ…ážšáŸ'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            LTS : 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd, D MMMM YYYY HH:mm'
        },
        calendar: {
            sameDay: '[ážáŸ’áž„áŸƒáž“áŸˆ áž˜áŸ‰áŸ„áž„] LT',
            nextDay: '[ážŸáŸ’áž¢áŸ‚áž€ áž˜áŸ‰áŸ„áž„] LT',
            nextWeek: 'dddd [áž˜áŸ‰áŸ„áž„] LT',
            lastDay: '[áž˜áŸ’ážŸáž·áž›áž˜áž·áž‰ áž˜áŸ‰áŸ„áž„] LT',
            lastWeek: 'dddd [ážŸáž”áŸ’ážáž¶áž áŸáž˜áž»áž“] [áž˜áŸ‰áŸ„áž„] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%sáž‘áŸ€áž',
            past: '%sáž˜áž»áž“',
            s: 'áž”áŸ‰áž»áž“áŸ’áž˜áž¶áž“ážœáž·áž“áž¶áž‘áž¸',
            m: 'áž˜áž½áž™áž“áž¶áž‘áž¸',
            mm: '%d áž“áž¶áž‘áž¸',
            h: 'áž˜áž½áž™áž˜áŸ‰áŸ„áž„',
            hh: '%d áž˜áŸ‰áŸ„áž„',
            d: 'áž˜áž½áž™ážáŸ’áž„áŸƒ',
            dd: '%d ážáŸ’áž„áŸƒ',
            M: 'áž˜áž½áž™ážáŸ‚',
            MM: '%d ážáŸ‚',
            y: 'áž˜áž½áž™áž†áŸ’áž“áž¶áŸ†',
            yy: '%d áž†áŸ’áž“áž¶áŸ†'
        },
        week: {
            dow: 1, // Monday is the first day of the week.
            doy: 4 // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : korean (ko)
    //!
    //! authors
    //!
    //! - Kyungwook, Park : https://github.com/kyungw00k
    //! - Jeeeyul Lee <jeeeyul@gmail.com>

    var ko = _moment__default.defineLocale('ko', {
        months : '1ì›”_2ì›”_3ì›”_4ì›”_5ì›”_6ì›”_7ì›”_8ì›”_9ì›”_10ì›”_11ì›”_12ì›”'.split('_'),
        monthsShort : '1ì›”_2ì›”_3ì›”_4ì›”_5ì›”_6ì›”_7ì›”_8ì›”_9ì›”_10ì›”_11ì›”_12ì›”'.split('_'),
        weekdays : 'ì¼ìš”ì¼_ì›”ìš”ì¼_í™”ìš”ì¼_ìˆ˜ìš”ì¼_ëª©ìš”ì¼_ê¸ˆìš”ì¼_í† ìš”ì¼'.split('_'),
        weekdaysShort : 'ì¼_ì›”_í™”_ìˆ˜_ëª©_ê¸ˆ_í† '.split('_'),
        weekdaysMin : 'ì¼_ì›”_í™”_ìˆ˜_ëª©_ê¸ˆ_í† '.split('_'),
        longDateFormat : {
            LT : 'A hì‹œ më¶„',
            LTS : 'A hì‹œ më¶„ sì´ˆ',
            L : 'YYYY.MM.DD',
            LL : 'YYYYë…„ MMMM Dì¼',
            LLL : 'YYYYë…„ MMMM Dì¼ A hì‹œ më¶„',
            LLLL : 'YYYYë…„ MMMM Dì¼ dddd A hì‹œ më¶„'
        },
        calendar : {
            sameDay : 'ì˜¤ëŠ˜ LT',
            nextDay : 'ë‚´ì¼ LT',
            nextWeek : 'dddd LT',
            lastDay : 'ì–´ì œ LT',
            lastWeek : 'ì§€ë‚œì£¼ dddd LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s í›„',
            past : '%s ì „',
            s : 'ëª‡ì´ˆ',
            ss : '%dì´ˆ',
            m : 'ì¼ë¶„',
            mm : '%dë¶„',
            h : 'í•œì‹œê°„',
            hh : '%dì‹œê°„',
            d : 'í•˜ë£¨',
            dd : '%dì¼',
            M : 'í•œë‹¬',
            MM : '%dë‹¬',
            y : 'ì¼ë…„',
            yy : '%dë…„'
        },
        ordinalParse : /\d{1,2}ì¼/,
        ordinal : '%dì¼',
        meridiemParse : /ì˜¤ì „|ì˜¤í›„/,
        isPM : function (token) {
            return token === 'ì˜¤í›„';
        },
        meridiem : function (hour, minute, isUpper) {
            return hour < 12 ? 'ì˜¤ì „' : 'ì˜¤í›„';
        }
    });

    //! moment.js locale configuration
    //! locale : Luxembourgish (lb)
    //! author : mweimerskirch : https://github.com/mweimerskirch, David Raison : https://github.com/kwisatz

    function lb__processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            'm': ['eng Minutt', 'enger Minutt'],
            'h': ['eng Stonn', 'enger Stonn'],
            'd': ['een Dag', 'engem Dag'],
            'M': ['ee Mount', 'engem Mount'],
            'y': ['ee Joer', 'engem Joer']
        };
        return withoutSuffix ? format[key][0] : format[key][1];
    }
    function processFutureTime(string) {
        var number = string.substr(0, string.indexOf(' '));
        if (eifelerRegelAppliesToNumber(number)) {
            return 'a ' + string;
        }
        return 'an ' + string;
    }
    function processPastTime(string) {
        var number = string.substr(0, string.indexOf(' '));
        if (eifelerRegelAppliesToNumber(number)) {
            return 'viru ' + string;
        }
        return 'virun ' + string;
    }
    /**
     * Returns true if the word before the given number loses the '-n' ending.
     * e.g. 'an 10 Deeg' but 'a 5 Deeg'
     *
     * @param number {integer}
     * @returns {boolean}
     */
    function eifelerRegelAppliesToNumber(number) {
        number = parseInt(number, 10);
        if (isNaN(number)) {
            return false;
        }
        if (number < 0) {
            // Negative Number --> always true
            return true;
        } else if (number < 10) {
            // Only 1 digit
            if (4 <= number && number <= 7) {
                return true;
            }
            return false;
        } else if (number < 100) {
            // 2 digits
            var lastDigit = number % 10, firstDigit = number / 10;
            if (lastDigit === 0) {
                return eifelerRegelAppliesToNumber(firstDigit);
            }
            return eifelerRegelAppliesToNumber(lastDigit);
        } else if (number < 10000) {
            // 3 or 4 digits --> recursively check first digit
            while (number >= 10) {
                number = number / 10;
            }
            return eifelerRegelAppliesToNumber(number);
        } else {
            // Anything larger than 4 digits: recursively check first n-3 digits
            number = number / 1000;
            return eifelerRegelAppliesToNumber(number);
        }
    }

    var lb = _moment__default.defineLocale('lb', {
        months: 'Januar_Februar_MÃ¤erz_AbrÃ«ll_Mee_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
        monthsShort: 'Jan._Febr._Mrz._Abr._Mee_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
        weekdays: 'Sonndeg_MÃ©indeg_DÃ«nschdeg_MÃ«ttwoch_Donneschdeg_Freideg_Samschdeg'.split('_'),
        weekdaysShort: 'So._MÃ©._DÃ«._MÃ«._Do._Fr._Sa.'.split('_'),
        weekdaysMin: 'So_MÃ©_DÃ«_MÃ«_Do_Fr_Sa'.split('_'),
        longDateFormat: {
            LT: 'H:mm [Auer]',
            LTS: 'H:mm:ss [Auer]',
            L: 'DD.MM.YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY H:mm [Auer]',
            LLLL: 'dddd, D. MMMM YYYY H:mm [Auer]'
        },
        calendar: {
            sameDay: '[Haut um] LT',
            sameElse: 'L',
            nextDay: '[Muer um] LT',
            nextWeek: 'dddd [um] LT',
            lastDay: '[GÃ«schter um] LT',
            lastWeek: function () {
                // Different date string for 'DÃ«nschdeg' (Tuesday) and 'Donneschdeg' (Thursday) due to phonological rule
                switch (this.day()) {
                    case 2:
                    case 4:
                        return '[Leschten] dddd [um] LT';
                    default:
                        return '[Leschte] dddd [um] LT';
                }
            }
        },
        relativeTime : {
            future : processFutureTime,
            past : processPastTime,
            s : 'e puer Sekonnen',
            m : lb__processRelativeTime,
            mm : '%d Minutten',
            h : lb__processRelativeTime,
            hh : '%d Stonnen',
            d : lb__processRelativeTime,
            dd : '%d Deeg',
            M : lb__processRelativeTime,
            MM : '%d MÃ©int',
            y : lb__processRelativeTime,
            yy : '%d Joer'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal: '%d.',
        week: {
            dow: 1, // Monday is the first day of the week.
            doy: 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Lithuanian (lt)
    //! author : Mindaugas MozÅ«ras : https://github.com/mmozuras

    var lt__units = {
        'm' : 'minutÄ—_minutÄ—s_minutÄ™',
        'mm': 'minutÄ—s_minuÄiÅ³_minutes',
        'h' : 'valanda_valandos_valandÄ…',
        'hh': 'valandos_valandÅ³_valandas',
        'd' : 'diena_dienos_dienÄ…',
        'dd': 'dienos_dienÅ³_dienas',
        'M' : 'mÄ—nuo_mÄ—nesio_mÄ—nesÄ¯',
        'MM': 'mÄ—nesiai_mÄ—nesiÅ³_mÄ—nesius',
        'y' : 'metai_metÅ³_metus',
        'yy': 'metai_metÅ³_metus'
    },
    weekDays = 'sekmadienis_pirmadienis_antradienis_treÄiadienis_ketvirtadienis_penktadienis_Å¡eÅ¡tadienis'.split('_');
    function translateSeconds(number, withoutSuffix, key, isFuture) {
        if (withoutSuffix) {
            return 'kelios sekundÄ—s';
        } else {
            return isFuture ? 'keliÅ³ sekundÅ¾iÅ³' : 'kelias sekundes';
        }
    }
    function lt__monthsCaseReplace(m, format) {
        var months = {
                'nominative': 'sausis_vasaris_kovas_balandis_geguÅ¾Ä—_birÅ¾elis_liepa_rugpjÅ«tis_rugsÄ—jis_spalis_lapkritis_gruodis'.split('_'),
                'accusative': 'sausio_vasario_kovo_balandÅ¾io_geguÅ¾Ä—s_birÅ¾elio_liepos_rugpjÅ«Äio_rugsÄ—jo_spalio_lapkriÄio_gruodÅ¾io'.split('_')
            },
            nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
                'accusative' :
                'nominative';
        return months[nounCase][m.month()];
    }
    function translateSingular(number, withoutSuffix, key, isFuture) {
        return withoutSuffix ? forms(key)[0] : (isFuture ? forms(key)[1] : forms(key)[2]);
    }
    function special(number) {
        return number % 10 === 0 || (number > 10 && number < 20);
    }
    function forms(key) {
        return lt__units[key].split('_');
    }
    function lt__translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        if (number === 1) {
            return result + translateSingular(number, withoutSuffix, key[0], isFuture);
        } else if (withoutSuffix) {
            return result + (special(number) ? forms(key)[1] : forms(key)[0]);
        } else {
            if (isFuture) {
                return result + forms(key)[1];
            } else {
                return result + (special(number) ? forms(key)[1] : forms(key)[2]);
            }
        }
    }
    function relativeWeekDay(moment, format) {
        var nominative = format.indexOf('dddd HH:mm') === -1,
            weekDay = weekDays[moment.day()];
        return nominative ? weekDay : weekDay.substring(0, weekDay.length - 2) + 'Ä¯';
    }

    var lt = _moment__default.defineLocale('lt', {
        months : lt__monthsCaseReplace,
        monthsShort : 'sau_vas_kov_bal_geg_bir_lie_rgp_rgs_spa_lap_grd'.split('_'),
        weekdays : relativeWeekDay,
        weekdaysShort : 'Sek_Pir_Ant_Tre_Ket_Pen_Å eÅ¡'.split('_'),
        weekdaysMin : 'S_P_A_T_K_Pn_Å '.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'YYYY-MM-DD',
            LL : 'YYYY [m.] MMMM D [d.]',
            LLL : 'YYYY [m.] MMMM D [d.], HH:mm [val.]',
            LLLL : 'YYYY [m.] MMMM D [d.], dddd, HH:mm [val.]',
            l : 'YYYY-MM-DD',
            ll : 'YYYY [m.] MMMM D [d.]',
            lll : 'YYYY [m.] MMMM D [d.], HH:mm [val.]',
            llll : 'YYYY [m.] MMMM D [d.], ddd, HH:mm [val.]'
        },
        calendar : {
            sameDay : '[Å iandien] LT',
            nextDay : '[Rytoj] LT',
            nextWeek : 'dddd LT',
            lastDay : '[Vakar] LT',
            lastWeek : '[PraÄ—jusÄ¯] dddd LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'po %s',
            past : 'prieÅ¡ %s',
            s : translateSeconds,
            m : translateSingular,
            mm : lt__translate,
            h : translateSingular,
            hh : lt__translate,
            d : translateSingular,
            dd : lt__translate,
            M : translateSingular,
            MM : lt__translate,
            y : translateSingular,
            yy : lt__translate
        },
        ordinalParse: /\d{1,2}-oji/,
        ordinal : function (number) {
            return number + '-oji';
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : latvian (lv)
    //! author : Kristaps Karlsons : https://github.com/skakri
    //! author : JÄnis Elmeris : https://github.com/JanisE

    var lv__units = {
        'm': 'minÅ«tes_minÅ«tÄ“m_minÅ«te_minÅ«tes'.split('_'),
        'mm': 'minÅ«tes_minÅ«tÄ“m_minÅ«te_minÅ«tes'.split('_'),
        'h': 'stundas_stundÄm_stunda_stundas'.split('_'),
        'hh': 'stundas_stundÄm_stunda_stundas'.split('_'),
        'd': 'dienas_dienÄm_diena_dienas'.split('_'),
        'dd': 'dienas_dienÄm_diena_dienas'.split('_'),
        'M': 'mÄ“neÅ¡a_mÄ“neÅ¡iem_mÄ“nesis_mÄ“neÅ¡i'.split('_'),
        'MM': 'mÄ“neÅ¡a_mÄ“neÅ¡iem_mÄ“nesis_mÄ“neÅ¡i'.split('_'),
        'y': 'gada_gadiem_gads_gadi'.split('_'),
        'yy': 'gada_gadiem_gads_gadi'.split('_')
    };
    /**
     * @param withoutSuffix boolean true = a length of time; false = before/after a period of time.
     */
    function lv__format(forms, number, withoutSuffix) {
        if (withoutSuffix) {
            // E.g. "21 minÅ«te", "3 minÅ«tes".
            return number % 10 === 1 && number !== 11 ? forms[2] : forms[3];
        } else {
            // E.g. "21 minÅ«tes" as in "pÄ“c 21 minÅ«tes".
            // E.g. "3 minÅ«tÄ“m" as in "pÄ“c 3 minÅ«tÄ“m".
            return number % 10 === 1 && number !== 11 ? forms[0] : forms[1];
        }
    }
    function lv__relativeTimeWithPlural(number, withoutSuffix, key) {
        return number + ' ' + lv__format(lv__units[key], number, withoutSuffix);
    }
    function relativeTimeWithSingular(number, withoutSuffix, key) {
        return lv__format(lv__units[key], number, withoutSuffix);
    }
    function relativeSeconds(number, withoutSuffix) {
        return withoutSuffix ? 'daÅ¾as sekundes' : 'daÅ¾Äm sekundÄ“m';
    }

    var lv = _moment__default.defineLocale('lv', {
        months : 'janvÄris_februÄris_marts_aprÄ«lis_maijs_jÅ«nijs_jÅ«lijs_augusts_septembris_oktobris_novembris_decembris'.split('_'),
        monthsShort : 'jan_feb_mar_apr_mai_jÅ«n_jÅ«l_aug_sep_okt_nov_dec'.split('_'),
        weekdays : 'svÄ“tdiena_pirmdiena_otrdiena_treÅ¡diena_ceturtdiena_piektdiena_sestdiena'.split('_'),
        weekdaysShort : 'Sv_P_O_T_C_Pk_S'.split('_'),
        weekdaysMin : 'Sv_P_O_T_C_Pk_S'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY.',
            LL : 'YYYY. [gada] D. MMMM',
            LLL : 'YYYY. [gada] D. MMMM, HH:mm',
            LLLL : 'YYYY. [gada] D. MMMM, dddd, HH:mm'
        },
        calendar : {
            sameDay : '[Å odien pulksten] LT',
            nextDay : '[RÄ«t pulksten] LT',
            nextWeek : 'dddd [pulksten] LT',
            lastDay : '[Vakar pulksten] LT',
            lastWeek : '[PagÄjuÅ¡Ä] dddd [pulksten] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'pÄ“c %s',
            past : 'pirms %s',
            s : relativeSeconds,
            m : relativeTimeWithSingular,
            mm : lv__relativeTimeWithPlural,
            h : relativeTimeWithSingular,
            hh : lv__relativeTimeWithPlural,
            d : relativeTimeWithSingular,
            dd : lv__relativeTimeWithPlural,
            M : relativeTimeWithSingular,
            MM : lv__relativeTimeWithPlural,
            y : relativeTimeWithSingular,
            yy : lv__relativeTimeWithPlural
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Montenegrin (me)
    //! author : Miodrag NikaÄ <miodrag@restartit.me> : https://github.com/miodragnikac

    var me__translator = {
        words: { //Different grammatical cases
            m: ['jedan minut', 'jednog minuta'],
            mm: ['minut', 'minuta', 'minuta'],
            h: ['jedan sat', 'jednog sata'],
            hh: ['sat', 'sata', 'sati'],
            dd: ['dan', 'dana', 'dana'],
            MM: ['mjesec', 'mjeseca', 'mjeseci'],
            yy: ['godina', 'godine', 'godina']
        },
        correctGrammaticalCase: function (number, wordKey) {
            return number === 1 ? wordKey[0] : (number >= 2 && number <= 4 ? wordKey[1] : wordKey[2]);
        },
        translate: function (number, withoutSuffix, key) {
            var wordKey = me__translator.words[key];
            if (key.length === 1) {
                return withoutSuffix ? wordKey[0] : wordKey[1];
            } else {
                return number + ' ' + me__translator.correctGrammaticalCase(number, wordKey);
            }
        }
    };

    var me = _moment__default.defineLocale('me', {
        months: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
        monthsShort: ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun', 'jul', 'avg.', 'sep.', 'okt.', 'nov.', 'dec.'],
        weekdays: ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'Äetvrtak', 'petak', 'subota'],
        weekdaysShort: ['ned.', 'pon.', 'uto.', 'sri.', 'Äet.', 'pet.', 'sub.'],
        weekdaysMin: ['ne', 'po', 'ut', 'sr', 'Äe', 'pe', 'su'],
        longDateFormat: {
            LT: 'H:mm',
            LTS : 'H:mm:ss',
            L: 'DD. MM. YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY H:mm',
            LLLL: 'dddd, D. MMMM YYYY H:mm'
        },
        calendar: {
            sameDay: '[danas u] LT',
            nextDay: '[sjutra u] LT',

            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[u] [nedjelju] [u] LT';
                case 3:
                    return '[u] [srijedu] [u] LT';
                case 6:
                    return '[u] [subotu] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[u] dddd [u] LT';
                }
            },
            lastDay  : '[juÄe u] LT',
            lastWeek : function () {
                var lastWeekDays = [
                    '[proÅ¡le] [nedjelje] [u] LT',
                    '[proÅ¡log] [ponedjeljka] [u] LT',
                    '[proÅ¡log] [utorka] [u] LT',
                    '[proÅ¡le] [srijede] [u] LT',
                    '[proÅ¡log] [Äetvrtka] [u] LT',
                    '[proÅ¡log] [petka] [u] LT',
                    '[proÅ¡le] [subote] [u] LT'
                ];
                return lastWeekDays[this.day()];
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'za %s',
            past   : 'prije %s',
            s      : 'nekoliko sekundi',
            m      : me__translator.translate,
            mm     : me__translator.translate,
            h      : me__translator.translate,
            hh     : me__translator.translate,
            d      : 'dan',
            dd     : me__translator.translate,
            M      : 'mjesec',
            MM     : me__translator.translate,
            y      : 'godinu',
            yy     : me__translator.translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : macedonian (mk)
    //! author : Borislav Mickov : https://github.com/B0k0

    var mk = _moment__default.defineLocale('mk', {
        months : 'Ñ˜Ð°Ð½ÑƒÐ°Ñ€Ð¸_Ñ„ÐµÐ²Ñ€ÑƒÐ°Ñ€Ð¸_Ð¼Ð°Ñ€Ñ‚_Ð°Ð¿Ñ€Ð¸Ð»_Ð¼Ð°Ñ˜_Ñ˜ÑƒÐ½Ð¸_Ñ˜ÑƒÐ»Ð¸_Ð°Ð²Ð³ÑƒÑÑ‚_ÑÐµÐ¿Ñ‚ÐµÐ¼Ð²Ñ€Ð¸_Ð¾ÐºÑ‚Ð¾Ð¼Ð²Ñ€Ð¸_Ð½Ð¾ÐµÐ¼Ð²Ñ€Ð¸_Ð´ÐµÐºÐµÐ¼Ð²Ñ€Ð¸'.split('_'),
        monthsShort : 'Ñ˜Ð°Ð½_Ñ„ÐµÐ²_Ð¼Ð°Ñ€_Ð°Ð¿Ñ€_Ð¼Ð°Ñ˜_Ñ˜ÑƒÐ½_Ñ˜ÑƒÐ»_Ð°Ð²Ð³_ÑÐµÐ¿_Ð¾ÐºÑ‚_Ð½Ð¾Ðµ_Ð´ÐµÐº'.split('_'),
        weekdays : 'Ð½ÐµÐ´ÐµÐ»Ð°_Ð¿Ð¾Ð½ÐµÐ´ÐµÐ»Ð½Ð¸Ðº_Ð²Ñ‚Ð¾Ñ€Ð½Ð¸Ðº_ÑÑ€ÐµÐ´Ð°_Ñ‡ÐµÑ‚Ð²Ñ€Ñ‚Ð¾Ðº_Ð¿ÐµÑ‚Ð¾Ðº_ÑÐ°Ð±Ð¾Ñ‚Ð°'.split('_'),
        weekdaysShort : 'Ð½ÐµÐ´_Ð¿Ð¾Ð½_Ð²Ñ‚Ð¾_ÑÑ€Ðµ_Ñ‡ÐµÑ‚_Ð¿ÐµÑ‚_ÑÐ°Ð±'.split('_'),
        weekdaysMin : 'Ð½e_Ð¿o_Ð²Ñ‚_ÑÑ€_Ñ‡Ðµ_Ð¿Ðµ_Ña'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'D.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY H:mm',
            LLLL : 'dddd, D MMMM YYYY H:mm'
        },
        calendar : {
            sameDay : '[Ð”ÐµÐ½ÐµÑ Ð²Ð¾] LT',
            nextDay : '[Ð£Ñ‚Ñ€Ðµ Ð²Ð¾] LT',
            nextWeek : 'dddd [Ð²Ð¾] LT',
            lastDay : '[Ð’Ñ‡ÐµÑ€Ð° Ð²Ð¾] LT',
            lastWeek : function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 6:
                    return '[Ð’Ð¾ Ð¸Ð·Ð¼Ð¸Ð½Ð°Ñ‚Ð°Ñ‚Ð°] dddd [Ð²Ð¾] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[Ð’Ð¾ Ð¸Ð·Ð¼Ð¸Ð½Ð°Ñ‚Ð¸Ð¾Ñ‚] dddd [Ð²Ð¾] LT';
                }
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'Ð¿Ð¾ÑÐ»Ðµ %s',
            past : 'Ð¿Ñ€ÐµÐ´ %s',
            s : 'Ð½ÐµÐºÐ¾Ð»ÐºÑƒ ÑÐµÐºÑƒÐ½Ð´Ð¸',
            m : 'Ð¼Ð¸Ð½ÑƒÑ‚Ð°',
            mm : '%d Ð¼Ð¸Ð½ÑƒÑ‚Ð¸',
            h : 'Ñ‡Ð°Ñ',
            hh : '%d Ñ‡Ð°ÑÐ°',
            d : 'Ð´ÐµÐ½',
            dd : '%d Ð´ÐµÐ½Ð°',
            M : 'Ð¼ÐµÑÐµÑ†',
            MM : '%d Ð¼ÐµÑÐµÑ†Ð¸',
            y : 'Ð³Ð¾Ð´Ð¸Ð½Ð°',
            yy : '%d Ð³Ð¾Ð´Ð¸Ð½Ð¸'
        },
        ordinalParse: /\d{1,2}-(ÐµÐ²|ÐµÐ½|Ñ‚Ð¸|Ð²Ð¸|Ñ€Ð¸|Ð¼Ð¸)/,
        ordinal : function (number) {
            var lastDigit = number % 10,
                last2Digits = number % 100;
            if (number === 0) {
                return number + '-ÐµÐ²';
            } else if (last2Digits === 0) {
                return number + '-ÐµÐ½';
            } else if (last2Digits > 10 && last2Digits < 20) {
                return number + '-Ñ‚Ð¸';
            } else if (lastDigit === 1) {
                return number + '-Ð²Ð¸';
            } else if (lastDigit === 2) {
                return number + '-Ñ€Ð¸';
            } else if (lastDigit === 7 || lastDigit === 8) {
                return number + '-Ð¼Ð¸';
            } else {
                return number + '-Ñ‚Ð¸';
            }
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : malayalam (ml)
    //! author : Floyd Pink : https://github.com/floydpink

    var ml = _moment__default.defineLocale('ml', {
        months : 'à´œà´¨àµà´µà´°à´¿_à´«àµ†à´¬àµà´°àµà´µà´°à´¿_à´®à´¾àµ¼à´šàµà´šàµ_à´à´ªàµà´°à´¿àµ½_à´®àµ‡à´¯àµ_à´œàµ‚àµº_à´œàµ‚à´²àµˆ_à´“à´—à´¸àµà´±àµà´±àµ_à´¸àµ†à´ªàµà´±àµà´±à´‚à´¬àµ¼_à´’à´•àµà´Ÿàµ‹à´¬àµ¼_à´¨à´µà´‚à´¬àµ¼_à´¡à´¿à´¸à´‚à´¬àµ¼'.split('_'),
        monthsShort : 'à´œà´¨àµ._à´«àµ†à´¬àµà´°àµ._à´®à´¾àµ¼._à´à´ªàµà´°à´¿._à´®àµ‡à´¯àµ_à´œàµ‚àµº_à´œàµ‚à´²àµˆ._à´“à´—._à´¸àµ†à´ªàµà´±àµà´±._à´’à´•àµà´Ÿàµ‹._à´¨à´µà´‚._à´¡à´¿à´¸à´‚.'.split('_'),
        weekdays : 'à´žà´¾à´¯à´±à´¾à´´àµà´š_à´¤à´¿à´™àµà´•à´³à´¾à´´àµà´š_à´šàµŠà´µàµà´µà´¾à´´àµà´š_à´¬àµà´§à´¨à´¾à´´àµà´š_à´µàµà´¯à´¾à´´à´¾à´´àµà´š_à´µàµ†à´³àµà´³à´¿à´¯à´¾à´´àµà´š_à´¶à´¨à´¿à´¯à´¾à´´àµà´š'.split('_'),
        weekdaysShort : 'à´žà´¾à´¯àµ¼_à´¤à´¿à´™àµà´•àµ¾_à´šàµŠà´µàµà´µ_à´¬àµà´§àµ»_à´µàµà´¯à´¾à´´à´‚_à´µàµ†à´³àµà´³à´¿_à´¶à´¨à´¿'.split('_'),
        weekdaysMin : 'à´žà´¾_à´¤à´¿_à´šàµŠ_à´¬àµ_à´µàµà´¯à´¾_à´µàµ†_à´¶'.split('_'),
        longDateFormat : {
            LT : 'A h:mm -à´¨àµ',
            LTS : 'A h:mm:ss -à´¨àµ',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, A h:mm -à´¨àµ',
            LLLL : 'dddd, D MMMM YYYY, A h:mm -à´¨àµ'
        },
        calendar : {
            sameDay : '[à´‡à´¨àµà´¨àµ] LT',
            nextDay : '[à´¨à´¾à´³àµ†] LT',
            nextWeek : 'dddd, LT',
            lastDay : '[à´‡à´¨àµà´¨à´²àµ†] LT',
            lastWeek : '[à´•à´´à´¿à´žàµà´ž] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s à´•à´´à´¿à´žàµà´žàµ',
            past : '%s à´®àµàµ»à´ªàµ',
            s : 'à´…àµ½à´ª à´¨à´¿à´®à´¿à´·à´™àµà´™àµ¾',
            m : 'à´’à´°àµ à´®à´¿à´¨à´¿à´±àµà´±àµ',
            mm : '%d à´®à´¿à´¨à´¿à´±àµà´±àµ',
            h : 'à´’à´°àµ à´®à´£à´¿à´•àµà´•àµ‚àµ¼',
            hh : '%d à´®à´£à´¿à´•àµà´•àµ‚àµ¼',
            d : 'à´’à´°àµ à´¦à´¿à´µà´¸à´‚',
            dd : '%d à´¦à´¿à´µà´¸à´‚',
            M : 'à´’à´°àµ à´®à´¾à´¸à´‚',
            MM : '%d à´®à´¾à´¸à´‚',
            y : 'à´’à´°àµ à´µàµ¼à´·à´‚',
            yy : '%d à´µàµ¼à´·à´‚'
        },
        meridiemParse: /à´°à´¾à´¤àµà´°à´¿|à´°à´¾à´µà´¿à´²àµ†|à´‰à´šàµà´š à´•à´´à´¿à´žàµà´žàµ|à´µàµˆà´•àµà´¨àµà´¨àµ‡à´°à´‚|à´°à´¾à´¤àµà´°à´¿/i,
        isPM : function (input) {
            return /^(à´‰à´šàµà´š à´•à´´à´¿à´žàµà´žàµ|à´µàµˆà´•àµà´¨àµà´¨àµ‡à´°à´‚|à´°à´¾à´¤àµà´°à´¿)$/.test(input);
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'à´°à´¾à´¤àµà´°à´¿';
            } else if (hour < 12) {
                return 'à´°à´¾à´µà´¿à´²àµ†';
            } else if (hour < 17) {
                return 'à´‰à´šàµà´š à´•à´´à´¿à´žàµà´žàµ';
            } else if (hour < 20) {
                return 'à´µàµˆà´•àµà´¨àµà´¨àµ‡à´°à´‚';
            } else {
                return 'à´°à´¾à´¤àµà´°à´¿';
            }
        }
    });

    //! moment.js locale configuration
    //! locale : Marathi (mr)
    //! author : Harshad Kale : https://github.com/kalehv

    var mr__symbolMap = {
        '1': 'à¥§',
        '2': 'à¥¨',
        '3': 'à¥©',
        '4': 'à¥ª',
        '5': 'à¥«',
        '6': 'à¥¬',
        '7': 'à¥­',
        '8': 'à¥®',
        '9': 'à¥¯',
        '0': 'à¥¦'
    },
    mr__numberMap = {
        'à¥§': '1',
        'à¥¨': '2',
        'à¥©': '3',
        'à¥ª': '4',
        'à¥«': '5',
        'à¥¬': '6',
        'à¥­': '7',
        'à¥®': '8',
        'à¥¯': '9',
        'à¥¦': '0'
    };

    var mr = _moment__default.defineLocale('mr', {
        months : 'à¤œà¤¾à¤¨à¥‡à¤µà¤¾à¤°à¥€_à¤«à¥‡à¤¬à¥à¤°à¥à¤µà¤¾à¤°à¥€_à¤®à¤¾à¤°à¥à¤š_à¤à¤ªà¥à¤°à¤¿à¤²_à¤®à¥‡_à¤œà¥‚à¤¨_à¤œà¥à¤²à¥ˆ_à¤‘à¤—à¤¸à¥à¤Ÿ_à¤¸à¤ªà¥à¤Ÿà¥‡à¤‚à¤¬à¤°_à¤‘à¤•à¥à¤Ÿà¥‹à¤¬à¤°_à¤¨à¥‹à¤µà¥à¤¹à¥‡à¤‚à¤¬à¤°_à¤¡à¤¿à¤¸à¥‡à¤‚à¤¬à¤°'.split('_'),
        monthsShort: 'à¤œà¤¾à¤¨à¥‡._à¤«à¥‡à¤¬à¥à¤°à¥._à¤®à¤¾à¤°à¥à¤š._à¤à¤ªà¥à¤°à¤¿._à¤®à¥‡._à¤œà¥‚à¤¨._à¤œà¥à¤²à¥ˆ._à¤‘à¤—._à¤¸à¤ªà¥à¤Ÿà¥‡à¤‚._à¤‘à¤•à¥à¤Ÿà¥‹._à¤¨à¥‹à¤µà¥à¤¹à¥‡à¤‚._à¤¡à¤¿à¤¸à¥‡à¤‚.'.split('_'),
        weekdays : 'à¤°à¤µà¤¿à¤µà¤¾à¤°_à¤¸à¥‹à¤®à¤µà¤¾à¤°_à¤®à¤‚à¤—à¤³à¤µà¤¾à¤°_à¤¬à¥à¤§à¤µà¤¾à¤°_à¤—à¥à¤°à¥‚à¤µà¤¾à¤°_à¤¶à¥à¤•à¥à¤°à¤µà¤¾à¤°_à¤¶à¤¨à¤¿à¤µà¤¾à¤°'.split('_'),
        weekdaysShort : 'à¤°à¤µà¤¿_à¤¸à¥‹à¤®_à¤®à¤‚à¤—à¤³_à¤¬à¥à¤§_à¤—à¥à¤°à¥‚_à¤¶à¥à¤•à¥à¤°_à¤¶à¤¨à¤¿'.split('_'),
        weekdaysMin : 'à¤°_à¤¸à¥‹_à¤®à¤‚_à¤¬à¥_à¤—à¥_à¤¶à¥_à¤¶'.split('_'),
        longDateFormat : {
            LT : 'A h:mm à¤µà¤¾à¤œà¤¤à¤¾',
            LTS : 'A h:mm:ss à¤µà¤¾à¤œà¤¤à¤¾',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, A h:mm à¤µà¤¾à¤œà¤¤à¤¾',
            LLLL : 'dddd, D MMMM YYYY, A h:mm à¤µà¤¾à¤œà¤¤à¤¾'
        },
        calendar : {
            sameDay : '[à¤†à¤œ] LT',
            nextDay : '[à¤‰à¤¦à¥à¤¯à¤¾] LT',
            nextWeek : 'dddd, LT',
            lastDay : '[à¤•à¤¾à¤²] LT',
            lastWeek: '[à¤®à¤¾à¤—à¥€à¤²] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s à¤¨à¤‚à¤¤à¤°',
            past : '%s à¤ªà¥‚à¤°à¥à¤µà¥€',
            s : 'à¤¸à¥‡à¤•à¤‚à¤¦',
            m: 'à¤à¤• à¤®à¤¿à¤¨à¤¿à¤Ÿ',
            mm: '%d à¤®à¤¿à¤¨à¤¿à¤Ÿà¥‡',
            h : 'à¤à¤• à¤¤à¤¾à¤¸',
            hh : '%d à¤¤à¤¾à¤¸',
            d : 'à¤à¤• à¤¦à¤¿à¤µà¤¸',
            dd : '%d à¤¦à¤¿à¤µà¤¸',
            M : 'à¤à¤• à¤®à¤¹à¤¿à¤¨à¤¾',
            MM : '%d à¤®à¤¹à¤¿à¤¨à¥‡',
            y : 'à¤à¤• à¤µà¤°à¥à¤·',
            yy : '%d à¤µà¤°à¥à¤·à¥‡'
        },
        preparse: function (string) {
            return string.replace(/[à¥§à¥¨à¥©à¥ªà¥«à¥¬à¥­à¥®à¥¯à¥¦]/g, function (match) {
                return mr__numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return mr__symbolMap[match];
            });
        },
        meridiemParse: /à¤°à¤¾à¤¤à¥à¤°à¥€|à¤¸à¤•à¤¾à¤³à¥€|à¤¦à¥à¤ªà¤¾à¤°à¥€|à¤¸à¤¾à¤¯à¤‚à¤•à¤¾à¤³à¥€/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'à¤°à¤¾à¤¤à¥à¤°à¥€') {
                return hour < 4 ? hour : hour + 12;
            } else if (meridiem === 'à¤¸à¤•à¤¾à¤³à¥€') {
                return hour;
            } else if (meridiem === 'à¤¦à¥à¤ªà¤¾à¤°à¥€') {
                return hour >= 10 ? hour : hour + 12;
            } else if (meridiem === 'à¤¸à¤¾à¤¯à¤‚à¤•à¤¾à¤³à¥€') {
                return hour + 12;
            }
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 4) {
                return 'à¤°à¤¾à¤¤à¥à¤°à¥€';
            } else if (hour < 10) {
                return 'à¤¸à¤•à¤¾à¤³à¥€';
            } else if (hour < 17) {
                return 'à¤¦à¥à¤ªà¤¾à¤°à¥€';
            } else if (hour < 20) {
                return 'à¤¸à¤¾à¤¯à¤‚à¤•à¤¾à¤³à¥€';
            } else {
                return 'à¤°à¤¾à¤¤à¥à¤°à¥€';
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Bahasa Malaysia (ms-MY)
    //! author : Weldan Jamili : https://github.com/weldan

    var ms_my = _moment__default.defineLocale('ms-my', {
        months : 'Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember'.split('_'),
        monthsShort : 'Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis'.split('_'),
        weekdays : 'Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu'.split('_'),
        weekdaysShort : 'Ahd_Isn_Sel_Rab_Kha_Jum_Sab'.split('_'),
        weekdaysMin : 'Ah_Is_Sl_Rb_Km_Jm_Sb'.split('_'),
        longDateFormat : {
            LT : 'HH.mm',
            LTS : 'HH.mm.ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY [pukul] HH.mm',
            LLLL : 'dddd, D MMMM YYYY [pukul] HH.mm'
        },
        meridiemParse: /pagi|tengahari|petang|malam/,
        meridiemHour: function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'pagi') {
                return hour;
            } else if (meridiem === 'tengahari') {
                return hour >= 11 ? hour : hour + 12;
            } else if (meridiem === 'petang' || meridiem === 'malam') {
                return hour + 12;
            }
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours < 11) {
                return 'pagi';
            } else if (hours < 15) {
                return 'tengahari';
            } else if (hours < 19) {
                return 'petang';
            } else {
                return 'malam';
            }
        },
        calendar : {
            sameDay : '[Hari ini pukul] LT',
            nextDay : '[Esok pukul] LT',
            nextWeek : 'dddd [pukul] LT',
            lastDay : '[Kelmarin pukul] LT',
            lastWeek : 'dddd [lepas pukul] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'dalam %s',
            past : '%s yang lepas',
            s : 'beberapa saat',
            m : 'seminit',
            mm : '%d minit',
            h : 'sejam',
            hh : '%d jam',
            d : 'sehari',
            dd : '%d hari',
            M : 'sebulan',
            MM : '%d bulan',
            y : 'setahun',
            yy : '%d tahun'
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Bahasa Malaysia (ms-MY)
    //! author : Weldan Jamili : https://github.com/weldan

    var locale_ms = _moment__default.defineLocale('ms', {
        months : 'Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember'.split('_'),
        monthsShort : 'Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis'.split('_'),
        weekdays : 'Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu'.split('_'),
        weekdaysShort : 'Ahd_Isn_Sel_Rab_Kha_Jum_Sab'.split('_'),
        weekdaysMin : 'Ah_Is_Sl_Rb_Km_Jm_Sb'.split('_'),
        longDateFormat : {
            LT : 'HH.mm',
            LTS : 'HH.mm.ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY [pukul] HH.mm',
            LLLL : 'dddd, D MMMM YYYY [pukul] HH.mm'
        },
        meridiemParse: /pagi|tengahari|petang|malam/,
        meridiemHour: function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'pagi') {
                return hour;
            } else if (meridiem === 'tengahari') {
                return hour >= 11 ? hour : hour + 12;
            } else if (meridiem === 'petang' || meridiem === 'malam') {
                return hour + 12;
            }
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours < 11) {
                return 'pagi';
            } else if (hours < 15) {
                return 'tengahari';
            } else if (hours < 19) {
                return 'petang';
            } else {
                return 'malam';
            }
        },
        calendar : {
            sameDay : '[Hari ini pukul] LT',
            nextDay : '[Esok pukul] LT',
            nextWeek : 'dddd [pukul] LT',
            lastDay : '[Kelmarin pukul] LT',
            lastWeek : 'dddd [lepas pukul] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'dalam %s',
            past : '%s yang lepas',
            s : 'beberapa saat',
            m : 'seminit',
            mm : '%d minit',
            h : 'sejam',
            hh : '%d jam',
            d : 'sehari',
            dd : '%d hari',
            M : 'sebulan',
            MM : '%d bulan',
            y : 'setahun',
            yy : '%d tahun'
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Burmese (my)
    //! author : Squar team, mysquar.com

    var my__symbolMap = {
        '1': 'á',
        '2': 'á‚',
        '3': 'áƒ',
        '4': 'á„',
        '5': 'á…',
        '6': 'á†',
        '7': 'á‡',
        '8': 'áˆ',
        '9': 'á‰',
        '0': 'á€'
    }, my__numberMap = {
        'á': '1',
        'á‚': '2',
        'áƒ': '3',
        'á„': '4',
        'á…': '5',
        'á†': '6',
        'á‡': '7',
        'áˆ': '8',
        'á‰': '9',
        'á€': '0'
    };

    var my = _moment__default.defineLocale('my', {
        months: 'á€‡á€”á€ºá€”á€á€«á€›á€®_á€–á€±á€–á€±á€¬á€ºá€á€«á€›á€®_á€™á€á€º_á€§á€•á€¼á€®_á€™á€±_á€‡á€½á€”á€º_á€‡á€°á€œá€­á€¯á€„á€º_á€žá€¼á€‚á€¯á€á€º_á€…á€€á€ºá€á€„á€ºá€˜á€¬_á€¡á€±á€¬á€€á€ºá€á€­á€¯á€˜á€¬_á€”á€­á€¯á€á€„á€ºá€˜á€¬_á€’á€®á€‡á€„á€ºá€˜á€¬'.split('_'),
        monthsShort: 'á€‡á€”á€º_á€–á€±_á€™á€á€º_á€•á€¼á€®_á€™á€±_á€‡á€½á€”á€º_á€œá€­á€¯á€„á€º_á€žá€¼_á€…á€€á€º_á€¡á€±á€¬á€€á€º_á€”á€­á€¯_á€’á€®'.split('_'),
        weekdays: 'á€á€”á€„á€ºá€¹á€‚á€”á€½á€±_á€á€”á€„á€ºá€¹á€œá€¬_á€¡á€„á€ºá€¹á€‚á€«_á€—á€¯á€’á€¹á€“á€Ÿá€°á€¸_á€€á€¼á€¬á€žá€•á€á€±á€¸_á€žá€±á€¬á€€á€¼á€¬_á€…á€”á€±'.split('_'),
        weekdaysShort: 'á€”á€½á€±_á€œá€¬_á€‚á€«_á€Ÿá€°á€¸_á€€á€¼á€¬_á€žá€±á€¬_á€”á€±'.split('_'),
        weekdaysMin: 'á€”á€½á€±_á€œá€¬_á€‚á€«_á€Ÿá€°á€¸_á€€á€¼á€¬_á€žá€±á€¬_á€”á€±'.split('_'),

        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd D MMMM YYYY HH:mm'
        },
        calendar: {
            sameDay: '[á€šá€”á€±.] LT [á€™á€¾á€¬]',
            nextDay: '[á€™á€”á€€á€ºá€–á€¼á€”á€º] LT [á€™á€¾á€¬]',
            nextWeek: 'dddd LT [á€™á€¾á€¬]',
            lastDay: '[á€™á€”á€±.á€€] LT [á€™á€¾á€¬]',
            lastWeek: '[á€•á€¼á€®á€¸á€á€²á€·á€žá€±á€¬] dddd LT [á€™á€¾á€¬]',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'á€œá€¬á€™á€Šá€ºá€· %s á€™á€¾á€¬',
            past: 'á€œá€½á€”á€ºá€á€²á€·á€žá€±á€¬ %s á€€',
            s: 'á€…á€€á€¹á€€á€”á€º.á€¡á€”á€Šá€ºá€¸á€„á€šá€º',
            m: 'á€á€…á€ºá€™á€­á€”á€…á€º',
            mm: '%d á€™á€­á€”á€…á€º',
            h: 'á€á€…á€ºá€”á€¬á€›á€®',
            hh: '%d á€”á€¬á€›á€®',
            d: 'á€á€…á€ºá€›á€€á€º',
            dd: '%d á€›á€€á€º',
            M: 'á€á€…á€ºá€œ',
            MM: '%d á€œ',
            y: 'á€á€…á€ºá€”á€¾á€…á€º',
            yy: '%d á€”á€¾á€…á€º'
        },
        preparse: function (string) {
            return string.replace(/[áá‚áƒá„á…á†á‡áˆá‰á€]/g, function (match) {
                return my__numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return my__symbolMap[match];
            });
        },
        week: {
            dow: 1, // Monday is the first day of the week.
            doy: 4 // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : norwegian bokmÃ¥l (nb)
    //! authors : Espen Hovlandsdal : https://github.com/rexxars
    //!           Sigurd Gartmann : https://github.com/sigurdga

    var nb = _moment__default.defineLocale('nb', {
        months : 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
        monthsShort : 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
        weekdays : 'sÃ¸ndag_mandag_tirsdag_onsdag_torsdag_fredag_lÃ¸rdag'.split('_'),
        weekdaysShort : 'sÃ¸n_man_tirs_ons_tors_fre_lÃ¸r'.split('_'),
        weekdaysMin : 'sÃ¸_ma_ti_on_to_fr_lÃ¸'.split('_'),
        longDateFormat : {
            LT : 'H.mm',
            LTS : 'H.mm.ss',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY [kl.] H.mm',
            LLLL : 'dddd D. MMMM YYYY [kl.] H.mm'
        },
        calendar : {
            sameDay: '[i dag kl.] LT',
            nextDay: '[i morgen kl.] LT',
            nextWeek: 'dddd [kl.] LT',
            lastDay: '[i gÃ¥r kl.] LT',
            lastWeek: '[forrige] dddd [kl.] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'om %s',
            past : 'for %s siden',
            s : 'noen sekunder',
            m : 'ett minutt',
            mm : '%d minutter',
            h : 'en time',
            hh : '%d timer',
            d : 'en dag',
            dd : '%d dager',
            M : 'en mÃ¥ned',
            MM : '%d mÃ¥neder',
            y : 'ett Ã¥r',
            yy : '%d Ã¥r'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : nepali/nepalese
    //! author : suvash : https://github.com/suvash

    var ne__symbolMap = {
        '1': 'à¥§',
        '2': 'à¥¨',
        '3': 'à¥©',
        '4': 'à¥ª',
        '5': 'à¥«',
        '6': 'à¥¬',
        '7': 'à¥­',
        '8': 'à¥®',
        '9': 'à¥¯',
        '0': 'à¥¦'
    },
    ne__numberMap = {
        'à¥§': '1',
        'à¥¨': '2',
        'à¥©': '3',
        'à¥ª': '4',
        'à¥«': '5',
        'à¥¬': '6',
        'à¥­': '7',
        'à¥®': '8',
        'à¥¯': '9',
        'à¥¦': '0'
    };

    var ne = _moment__default.defineLocale('ne', {
        months : 'à¤œà¤¨à¤µà¤°à¥€_à¤«à¥‡à¤¬à¥à¤°à¥à¤µà¤°à¥€_à¤®à¤¾à¤°à¥à¤š_à¤…à¤ªà¥à¤°à¤¿à¤²_à¤®à¤ˆ_à¤œà¥à¤¨_à¤œà¥à¤²à¤¾à¤ˆ_à¤…à¤—à¤·à¥à¤Ÿ_à¤¸à¥‡à¤ªà¥à¤Ÿà¥‡à¤®à¥à¤¬à¤°_à¤…à¤•à¥à¤Ÿà¥‹à¤¬à¤°_à¤¨à¥‹à¤­à¥‡à¤®à¥à¤¬à¤°_à¤¡à¤¿à¤¸à¥‡à¤®à¥à¤¬à¤°'.split('_'),
        monthsShort : 'à¤œà¤¨._à¤«à¥‡à¤¬à¥à¤°à¥._à¤®à¤¾à¤°à¥à¤š_à¤…à¤ªà¥à¤°à¤¿._à¤®à¤ˆ_à¤œà¥à¤¨_à¤œà¥à¤²à¤¾à¤ˆ._à¤…à¤—._à¤¸à¥‡à¤ªà¥à¤Ÿ._à¤…à¤•à¥à¤Ÿà¥‹._à¤¨à¥‹à¤­à¥‡._à¤¡à¤¿à¤¸à¥‡.'.split('_'),
        weekdays : 'à¤†à¤‡à¤¤à¤¬à¤¾à¤°_à¤¸à¥‹à¤®à¤¬à¤¾à¤°_à¤®à¤™à¥à¤—à¤²à¤¬à¤¾à¤°_à¤¬à¥à¤§à¤¬à¤¾à¤°_à¤¬à¤¿à¤¹à¤¿à¤¬à¤¾à¤°_à¤¶à¥à¤•à¥à¤°à¤¬à¤¾à¤°_à¤¶à¤¨à¤¿à¤¬à¤¾à¤°'.split('_'),
        weekdaysShort : 'à¤†à¤‡à¤¤._à¤¸à¥‹à¤®._à¤®à¤™à¥à¤—à¤²._à¤¬à¥à¤§._à¤¬à¤¿à¤¹à¤¿._à¤¶à¥à¤•à¥à¤°._à¤¶à¤¨à¤¿.'.split('_'),
        weekdaysMin : 'à¤†à¤‡._à¤¸à¥‹._à¤®à¤™à¥_à¤¬à¥._à¤¬à¤¿._à¤¶à¥._à¤¶.'.split('_'),
        longDateFormat : {
            LT : 'Aà¤•à¥‹ h:mm à¤¬à¤œà¥‡',
            LTS : 'Aà¤•à¥‹ h:mm:ss à¤¬à¤œà¥‡',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, Aà¤•à¥‹ h:mm à¤¬à¤œà¥‡',
            LLLL : 'dddd, D MMMM YYYY, Aà¤•à¥‹ h:mm à¤¬à¤œà¥‡'
        },
        preparse: function (string) {
            return string.replace(/[à¥§à¥¨à¥©à¥ªà¥«à¥¬à¥­à¥®à¥¯à¥¦]/g, function (match) {
                return ne__numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return ne__symbolMap[match];
            });
        },
        meridiemParse: /à¤°à¤¾à¤¤à¥€|à¤¬à¤¿à¤¹à¤¾à¤¨|à¤¦à¤¿à¤‰à¤à¤¸à¥‹|à¤¬à¥‡à¤²à¥à¤•à¤¾|à¤¸à¤¾à¤à¤|à¤°à¤¾à¤¤à¥€/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'à¤°à¤¾à¤¤à¥€') {
                return hour < 3 ? hour : hour + 12;
            } else if (meridiem === 'à¤¬à¤¿à¤¹à¤¾à¤¨') {
                return hour;
            } else if (meridiem === 'à¤¦à¤¿à¤‰à¤à¤¸à¥‹') {
                return hour >= 10 ? hour : hour + 12;
            } else if (meridiem === 'à¤¬à¥‡à¤²à¥à¤•à¤¾' || meridiem === 'à¤¸à¤¾à¤à¤') {
                return hour + 12;
            }
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 3) {
                return 'à¤°à¤¾à¤¤à¥€';
            } else if (hour < 10) {
                return 'à¤¬à¤¿à¤¹à¤¾à¤¨';
            } else if (hour < 15) {
                return 'à¤¦à¤¿à¤‰à¤à¤¸à¥‹';
            } else if (hour < 18) {
                return 'à¤¬à¥‡à¤²à¥à¤•à¤¾';
            } else if (hour < 20) {
                return 'à¤¸à¤¾à¤à¤';
            } else {
                return 'à¤°à¤¾à¤¤à¥€';
            }
        },
        calendar : {
            sameDay : '[à¤†à¤œ] LT',
            nextDay : '[à¤­à¥‹à¤²à¥€] LT',
            nextWeek : '[à¤†à¤‰à¤à¤¦à¥‹] dddd[,] LT',
            lastDay : '[à¤¹à¤¿à¤œà¥‹] LT',
            lastWeek : '[à¤—à¤à¤•à¥‹] dddd[,] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%sà¤®à¤¾',
            past : '%s à¤…à¤—à¤¾à¤¡à¥€',
            s : 'à¤•à¥‡à¤¹à¥€ à¤¸à¤®à¤¯',
            m : 'à¤à¤• à¤®à¤¿à¤¨à¥‡à¤Ÿ',
            mm : '%d à¤®à¤¿à¤¨à¥‡à¤Ÿ',
            h : 'à¤à¤• à¤˜à¤£à¥à¤Ÿà¤¾',
            hh : '%d à¤˜à¤£à¥à¤Ÿà¤¾',
            d : 'à¤à¤• à¤¦à¤¿à¤¨',
            dd : '%d à¤¦à¤¿à¤¨',
            M : 'à¤à¤• à¤®à¤¹à¤¿à¤¨à¤¾',
            MM : '%d à¤®à¤¹à¤¿à¤¨à¤¾',
            y : 'à¤à¤• à¤¬à¤°à¥à¤·',
            yy : '%d à¤¬à¤°à¥à¤·'
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : dutch (nl)
    //! author : Joris RÃ¶ling : https://github.com/jjupiter

    var nl__monthsShortWithDots = 'jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.'.split('_'),
        nl__monthsShortWithoutDots = 'jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec'.split('_');

    var nl = _moment__default.defineLocale('nl', {
        months : 'januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december'.split('_'),
        monthsShort : function (m, format) {
            if (/-MMM-/.test(format)) {
                return nl__monthsShortWithoutDots[m.month()];
            } else {
                return nl__monthsShortWithDots[m.month()];
            }
        },
        weekdays : 'zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag'.split('_'),
        weekdaysShort : 'zo._ma._di._wo._do._vr._za.'.split('_'),
        weekdaysMin : 'Zo_Ma_Di_Wo_Do_Vr_Za'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD-MM-YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[vandaag om] LT',
            nextDay: '[morgen om] LT',
            nextWeek: 'dddd [om] LT',
            lastDay: '[gisteren om] LT',
            lastWeek: '[afgelopen] dddd [om] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'over %s',
            past : '%s geleden',
            s : 'een paar seconden',
            m : 'Ã©Ã©n minuut',
            mm : '%d minuten',
            h : 'Ã©Ã©n uur',
            hh : '%d uur',
            d : 'Ã©Ã©n dag',
            dd : '%d dagen',
            M : 'Ã©Ã©n maand',
            MM : '%d maanden',
            y : 'Ã©Ã©n jaar',
            yy : '%d jaar'
        },
        ordinalParse: /\d{1,2}(ste|de)/,
        ordinal : function (number) {
            return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de');
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : norwegian nynorsk (nn)
    //! author : https://github.com/mechuwind

    var nn = _moment__default.defineLocale('nn', {
        months : 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
        monthsShort : 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
        weekdays : 'sundag_mÃ¥ndag_tysdag_onsdag_torsdag_fredag_laurdag'.split('_'),
        weekdaysShort : 'sun_mÃ¥n_tys_ons_tor_fre_lau'.split('_'),
        weekdaysMin : 'su_mÃ¥_ty_on_to_fr_lÃ¸'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[I dag klokka] LT',
            nextDay: '[I morgon klokka] LT',
            nextWeek: 'dddd [klokka] LT',
            lastDay: '[I gÃ¥r klokka] LT',
            lastWeek: '[FÃ¸regÃ¥ande] dddd [klokka] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'om %s',
            past : 'for %s sidan',
            s : 'nokre sekund',
            m : 'eit minutt',
            mm : '%d minutt',
            h : 'ein time',
            hh : '%d timar',
            d : 'ein dag',
            dd : '%d dagar',
            M : 'ein mÃ¥nad',
            MM : '%d mÃ¥nader',
            y : 'eit Ã¥r',
            yy : '%d Ã¥r'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : polish (pl)
    //! author : Rafal Hirsz : https://github.com/evoL

    var monthsNominative = 'styczeÅ„_luty_marzec_kwiecieÅ„_maj_czerwiec_lipiec_sierpieÅ„_wrzesieÅ„_paÅºdziernik_listopad_grudzieÅ„'.split('_'),
        monthsSubjective = 'stycznia_lutego_marca_kwietnia_maja_czerwca_lipca_sierpnia_wrzeÅ›nia_paÅºdziernika_listopada_grudnia'.split('_');
    function pl__plural(n) {
        return (n % 10 < 5) && (n % 10 > 1) && ((~~(n / 10) % 10) !== 1);
    }
    function pl__translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'minuta' : 'minutÄ™';
        case 'mm':
            return result + (pl__plural(number) ? 'minuty' : 'minut');
        case 'h':
            return withoutSuffix  ? 'godzina'  : 'godzinÄ™';
        case 'hh':
            return result + (pl__plural(number) ? 'godziny' : 'godzin');
        case 'MM':
            return result + (pl__plural(number) ? 'miesiÄ…ce' : 'miesiÄ™cy');
        case 'yy':
            return result + (pl__plural(number) ? 'lata' : 'lat');
        }
    }

    var pl = _moment__default.defineLocale('pl', {
        months : function (momentToFormat, format) {
            if (format === '') {
                // Hack: if format empty we know this is used to generate
                // RegExp by moment. Give then back both valid forms of months
                // in RegExp ready format.
                return '(' + monthsSubjective[momentToFormat.month()] + '|' + monthsNominative[momentToFormat.month()] + ')';
            } else if (/D MMMM/.test(format)) {
                return monthsSubjective[momentToFormat.month()];
            } else {
                return monthsNominative[momentToFormat.month()];
            }
        },
        monthsShort : 'sty_lut_mar_kwi_maj_cze_lip_sie_wrz_paÅº_lis_gru'.split('_'),
        weekdays : 'niedziela_poniedziaÅ‚ek_wtorek_Å›roda_czwartek_piÄ…tek_sobota'.split('_'),
        weekdaysShort : 'nie_pon_wt_Å›r_czw_pt_sb'.split('_'),
        weekdaysMin : 'N_Pn_Wt_Åšr_Cz_Pt_So'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[DziÅ› o] LT',
            nextDay: '[Jutro o] LT',
            nextWeek: '[W] dddd [o] LT',
            lastDay: '[Wczoraj o] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[W zeszÅ‚Ä… niedzielÄ™ o] LT';
                case 3:
                    return '[W zeszÅ‚Ä… Å›rodÄ™ o] LT';
                case 6:
                    return '[W zeszÅ‚Ä… sobotÄ™ o] LT';
                default:
                    return '[W zeszÅ‚y] dddd [o] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'za %s',
            past : '%s temu',
            s : 'kilka sekund',
            m : pl__translate,
            mm : pl__translate,
            h : pl__translate,
            hh : pl__translate,
            d : '1 dzieÅ„',
            dd : '%d dni',
            M : 'miesiÄ…c',
            MM : pl__translate,
            y : 'rok',
            yy : pl__translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : brazilian portuguese (pt-br)
    //! author : Caio Ribeiro Pereira : https://github.com/caio-ribeiro-pereira

    var pt_br = _moment__default.defineLocale('pt-br', {
        months : 'Janeiro_Fevereiro_MarÃ§o_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split('_'),
        monthsShort : 'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
        weekdays : 'Domingo_Segunda-Feira_TerÃ§a-Feira_Quarta-Feira_Quinta-Feira_Sexta-Feira_SÃ¡bado'.split('_'),
        weekdaysShort : 'Dom_Seg_Ter_Qua_Qui_Sex_SÃ¡b'.split('_'),
        weekdaysMin : 'Dom_2Âª_3Âª_4Âª_5Âª_6Âª_SÃ¡b'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D [de] MMMM [de] YYYY',
            LLL : 'D [de] MMMM [de] YYYY [Ã s] HH:mm',
            LLLL : 'dddd, D [de] MMMM [de] YYYY [Ã s] HH:mm'
        },
        calendar : {
            sameDay: '[Hoje Ã s] LT',
            nextDay: '[AmanhÃ£ Ã s] LT',
            nextWeek: 'dddd [Ã s] LT',
            lastDay: '[Ontem Ã s] LT',
            lastWeek: function () {
                return (this.day() === 0 || this.day() === 6) ?
                    '[Ãšltimo] dddd [Ã s] LT' : // Saturday + Sunday
                    '[Ãšltima] dddd [Ã s] LT'; // Monday - Friday
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'em %s',
            past : '%s atrÃ¡s',
            s : 'poucos segundos',
            m : 'um minuto',
            mm : '%d minutos',
            h : 'uma hora',
            hh : '%d horas',
            d : 'um dia',
            dd : '%d dias',
            M : 'um mÃªs',
            MM : '%d meses',
            y : 'um ano',
            yy : '%d anos'
        },
        ordinalParse: /\d{1,2}Âº/,
        ordinal : '%dÂº'
    });

    //! moment.js locale configuration
    //! locale : portuguese (pt)
    //! author : Jefferson : https://github.com/jalex79

    var pt = _moment__default.defineLocale('pt', {
        months : 'Janeiro_Fevereiro_MarÃ§o_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split('_'),
        monthsShort : 'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
        weekdays : 'Domingo_Segunda-Feira_TerÃ§a-Feira_Quarta-Feira_Quinta-Feira_Sexta-Feira_SÃ¡bado'.split('_'),
        weekdaysShort : 'Dom_Seg_Ter_Qua_Qui_Sex_SÃ¡b'.split('_'),
        weekdaysMin : 'Dom_2Âª_3Âª_4Âª_5Âª_6Âª_SÃ¡b'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D [de] MMMM [de] YYYY',
            LLL : 'D [de] MMMM [de] YYYY HH:mm',
            LLLL : 'dddd, D [de] MMMM [de] YYYY HH:mm'
        },
        calendar : {
            sameDay: '[Hoje Ã s] LT',
            nextDay: '[AmanhÃ£ Ã s] LT',
            nextWeek: 'dddd [Ã s] LT',
            lastDay: '[Ontem Ã s] LT',
            lastWeek: function () {
                return (this.day() === 0 || this.day() === 6) ?
                    '[Ãšltimo] dddd [Ã s] LT' : // Saturday + Sunday
                    '[Ãšltima] dddd [Ã s] LT'; // Monday - Friday
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'em %s',
            past : 'hÃ¡ %s',
            s : 'segundos',
            m : 'um minuto',
            mm : '%d minutos',
            h : 'uma hora',
            hh : '%d horas',
            d : 'um dia',
            dd : '%d dias',
            M : 'um mÃªs',
            MM : '%d meses',
            y : 'um ano',
            yy : '%d anos'
        },
        ordinalParse: /\d{1,2}Âº/,
        ordinal : '%dÂº',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : romanian (ro)
    //! author : Vlad Gurdiga : https://github.com/gurdiga
    //! author : Valentin Agachi : https://github.com/avaly

    function ro__relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
                'mm': 'minute',
                'hh': 'ore',
                'dd': 'zile',
                'MM': 'luni',
                'yy': 'ani'
            },
            separator = ' ';
        if (number % 100 >= 20 || (number >= 100 && number % 100 === 0)) {
            separator = ' de ';
        }
        return number + separator + format[key];
    }

    var ro = _moment__default.defineLocale('ro', {
        months : 'ianuarie_februarie_martie_aprilie_mai_iunie_iulie_august_septembrie_octombrie_noiembrie_decembrie'.split('_'),
        monthsShort : 'ian._febr._mart._apr._mai_iun._iul._aug._sept._oct._nov._dec.'.split('_'),
        weekdays : 'duminicÄƒ_luni_marÈ›i_miercuri_joi_vineri_sÃ¢mbÄƒtÄƒ'.split('_'),
        weekdaysShort : 'Dum_Lun_Mar_Mie_Joi_Vin_SÃ¢m'.split('_'),
        weekdaysMin : 'Du_Lu_Ma_Mi_Jo_Vi_SÃ¢'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY H:mm',
            LLLL : 'dddd, D MMMM YYYY H:mm'
        },
        calendar : {
            sameDay: '[azi la] LT',
            nextDay: '[mÃ¢ine la] LT',
            nextWeek: 'dddd [la] LT',
            lastDay: '[ieri la] LT',
            lastWeek: '[fosta] dddd [la] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'peste %s',
            past : '%s Ã®n urmÄƒ',
            s : 'cÃ¢teva secunde',
            m : 'un minut',
            mm : ro__relativeTimeWithPlural,
            h : 'o orÄƒ',
            hh : ro__relativeTimeWithPlural,
            d : 'o zi',
            dd : ro__relativeTimeWithPlural,
            M : 'o lunÄƒ',
            MM : ro__relativeTimeWithPlural,
            y : 'un an',
            yy : ro__relativeTimeWithPlural
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : russian (ru)
    //! author : Viktorminator : https://github.com/Viktorminator
    //! Author : Menelion ElensÃºle : https://github.com/Oire

    function ru__plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
    }
    function ru__relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
            'mm': withoutSuffix ? 'Ð¼Ð¸Ð½ÑƒÑ‚Ð°_Ð¼Ð¸Ð½ÑƒÑ‚Ñ‹_Ð¼Ð¸Ð½ÑƒÑ‚' : 'Ð¼Ð¸Ð½ÑƒÑ‚Ñƒ_Ð¼Ð¸Ð½ÑƒÑ‚Ñ‹_Ð¼Ð¸Ð½ÑƒÑ‚',
            'hh': 'Ñ‡Ð°Ñ_Ñ‡Ð°ÑÐ°_Ñ‡Ð°ÑÐ¾Ð²',
            'dd': 'Ð´ÐµÐ½ÑŒ_Ð´Ð½Ñ_Ð´Ð½ÐµÐ¹',
            'MM': 'Ð¼ÐµÑÑÑ†_Ð¼ÐµÑÑÑ†Ð°_Ð¼ÐµÑÑÑ†ÐµÐ²',
            'yy': 'Ð³Ð¾Ð´_Ð³Ð¾Ð´Ð°_Ð»ÐµÑ‚'
        };
        if (key === 'm') {
            return withoutSuffix ? 'Ð¼Ð¸Ð½ÑƒÑ‚Ð°' : 'Ð¼Ð¸Ð½ÑƒÑ‚Ñƒ';
        }
        else {
            return number + ' ' + ru__plural(format[key], +number);
        }
    }
    function ru__monthsCaseReplace(m, format) {
        var months = {
            'nominative': 'ÑÐ½Ð²Ð°Ñ€ÑŒ_Ñ„ÐµÐ²Ñ€Ð°Ð»ÑŒ_Ð¼Ð°Ñ€Ñ‚_Ð°Ð¿Ñ€ÐµÐ»ÑŒ_Ð¼Ð°Ð¹_Ð¸ÑŽÐ½ÑŒ_Ð¸ÑŽÐ»ÑŒ_Ð°Ð²Ð³ÑƒÑÑ‚_ÑÐµÐ½Ñ‚ÑÐ±Ñ€ÑŒ_Ð¾ÐºÑ‚ÑÐ±Ñ€ÑŒ_Ð½Ð¾ÑÐ±Ñ€ÑŒ_Ð´ÐµÐºÐ°Ð±Ñ€ÑŒ'.split('_'),
            'accusative': 'ÑÐ½Ð²Ð°Ñ€Ñ_Ñ„ÐµÐ²Ñ€Ð°Ð»Ñ_Ð¼Ð°Ñ€Ñ‚Ð°_Ð°Ð¿Ñ€ÐµÐ»Ñ_Ð¼Ð°Ñ_Ð¸ÑŽÐ½Ñ_Ð¸ÑŽÐ»Ñ_Ð°Ð²Ð³ÑƒÑÑ‚Ð°_ÑÐµÐ½Ñ‚ÑÐ±Ñ€Ñ_Ð¾ÐºÑ‚ÑÐ±Ñ€Ñ_Ð½Ð¾ÑÐ±Ñ€Ñ_Ð´ÐµÐºÐ°Ð±Ñ€Ñ'.split('_')
        },
        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
            'accusative' :
            'nominative';
        return months[nounCase][m.month()];
    }
    function ru__monthsShortCaseReplace(m, format) {
        var monthsShort = {
            'nominative': 'ÑÐ½Ð²_Ñ„ÐµÐ²_Ð¼Ð°Ñ€Ñ‚_Ð°Ð¿Ñ€_Ð¼Ð°Ð¹_Ð¸ÑŽÐ½ÑŒ_Ð¸ÑŽÐ»ÑŒ_Ð°Ð²Ð³_ÑÐµÐ½_Ð¾ÐºÑ‚_Ð½Ð¾Ñ_Ð´ÐµÐº'.split('_'),
            'accusative': 'ÑÐ½Ð²_Ñ„ÐµÐ²_Ð¼Ð°Ñ€_Ð°Ð¿Ñ€_Ð¼Ð°Ñ_Ð¸ÑŽÐ½Ñ_Ð¸ÑŽÐ»Ñ_Ð°Ð²Ð³_ÑÐµÐ½_Ð¾ÐºÑ‚_Ð½Ð¾Ñ_Ð´ÐµÐº'.split('_')
        },
        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
            'accusative' :
            'nominative';
        return monthsShort[nounCase][m.month()];
    }
    function ru__weekdaysCaseReplace(m, format) {
        var weekdays = {
            'nominative': 'Ð²Ð¾ÑÐºÑ€ÐµÑÐµÐ½ÑŒÐµ_Ð¿Ð¾Ð½ÐµÐ´ÐµÐ»ÑŒÐ½Ð¸Ðº_Ð²Ñ‚Ð¾Ñ€Ð½Ð¸Ðº_ÑÑ€ÐµÐ´Ð°_Ñ‡ÐµÑ‚Ð²ÐµÑ€Ð³_Ð¿ÑÑ‚Ð½Ð¸Ñ†Ð°_ÑÑƒÐ±Ð±Ð¾Ñ‚Ð°'.split('_'),
            'accusative': 'Ð²Ð¾ÑÐºÑ€ÐµÑÐµÐ½ÑŒÐµ_Ð¿Ð¾Ð½ÐµÐ´ÐµÐ»ÑŒÐ½Ð¸Ðº_Ð²Ñ‚Ð¾Ñ€Ð½Ð¸Ðº_ÑÑ€ÐµÐ´Ñƒ_Ñ‡ÐµÑ‚Ð²ÐµÑ€Ð³_Ð¿ÑÑ‚Ð½Ð¸Ñ†Ñƒ_ÑÑƒÐ±Ð±Ð¾Ñ‚Ñƒ'.split('_')
        },
        nounCase = (/\[ ?[Ð’Ð²] ?(?:Ð¿Ñ€Ð¾ÑˆÐ»ÑƒÑŽ|ÑÐ»ÐµÐ´ÑƒÑŽÑ‰ÑƒÑŽ|ÑÑ‚Ñƒ)? ?\] ?dddd/).test(format) ?
            'accusative' :
            'nominative';
        return weekdays[nounCase][m.day()];
    }

    var ru = _moment__default.defineLocale('ru', {
        months : ru__monthsCaseReplace,
        monthsShort : ru__monthsShortCaseReplace,
        weekdays : ru__weekdaysCaseReplace,
        weekdaysShort : 'Ð²Ñ_Ð¿Ð½_Ð²Ñ‚_ÑÑ€_Ñ‡Ñ‚_Ð¿Ñ‚_ÑÐ±'.split('_'),
        weekdaysMin : 'Ð²Ñ_Ð¿Ð½_Ð²Ñ‚_ÑÑ€_Ñ‡Ñ‚_Ð¿Ñ‚_ÑÐ±'.split('_'),
        monthsParse : [/^ÑÐ½Ð²/i, /^Ñ„ÐµÐ²/i, /^Ð¼Ð°Ñ€/i, /^Ð°Ð¿Ñ€/i, /^Ð¼Ð°[Ð¹|Ñ]/i, /^Ð¸ÑŽÐ½/i, /^Ð¸ÑŽÐ»/i, /^Ð°Ð²Ð³/i, /^ÑÐµÐ½/i, /^Ð¾ÐºÑ‚/i, /^Ð½Ð¾Ñ/i, /^Ð´ÐµÐº/i],
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY Ð³.',
            LLL : 'D MMMM YYYY Ð³., HH:mm',
            LLLL : 'dddd, D MMMM YYYY Ð³., HH:mm'
        },
        calendar : {
            sameDay: '[Ð¡ÐµÐ³Ð¾Ð´Ð½Ñ Ð²] LT',
            nextDay: '[Ð—Ð°Ð²Ñ‚Ñ€Ð° Ð²] LT',
            lastDay: '[Ð’Ñ‡ÐµÑ€Ð° Ð²] LT',
            nextWeek: function () {
                return this.day() === 2 ? '[Ð’Ð¾] dddd [Ð²] LT' : '[Ð’] dddd [Ð²] LT';
            },
            lastWeek: function (now) {
                if (now.week() !== this.week()) {
                    switch (this.day()) {
                    case 0:
                        return '[Ð’ Ð¿Ñ€Ð¾ÑˆÐ»Ð¾Ðµ] dddd [Ð²] LT';
                    case 1:
                    case 2:
                    case 4:
                        return '[Ð’ Ð¿Ñ€Ð¾ÑˆÐ»Ñ‹Ð¹] dddd [Ð²] LT';
                    case 3:
                    case 5:
                    case 6:
                        return '[Ð’ Ð¿Ñ€Ð¾ÑˆÐ»ÑƒÑŽ] dddd [Ð²] LT';
                    }
                } else {
                    if (this.day() === 2) {
                        return '[Ð’Ð¾] dddd [Ð²] LT';
                    } else {
                        return '[Ð’] dddd [Ð²] LT';
                    }
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'Ñ‡ÐµÑ€ÐµÐ· %s',
            past : '%s Ð½Ð°Ð·Ð°Ð´',
            s : 'Ð½ÐµÑÐºÐ¾Ð»ÑŒÐºÐ¾ ÑÐµÐºÑƒÐ½Ð´',
            m : ru__relativeTimeWithPlural,
            mm : ru__relativeTimeWithPlural,
            h : 'Ñ‡Ð°Ñ',
            hh : ru__relativeTimeWithPlural,
            d : 'Ð´ÐµÐ½ÑŒ',
            dd : ru__relativeTimeWithPlural,
            M : 'Ð¼ÐµÑÑÑ†',
            MM : ru__relativeTimeWithPlural,
            y : 'Ð³Ð¾Ð´',
            yy : ru__relativeTimeWithPlural
        },
        meridiemParse: /Ð½Ð¾Ñ‡Ð¸|ÑƒÑ‚Ñ€Ð°|Ð´Ð½Ñ|Ð²ÐµÑ‡ÐµÑ€Ð°/i,
        isPM : function (input) {
            return /^(Ð´Ð½Ñ|Ð²ÐµÑ‡ÐµÑ€Ð°)$/.test(input);
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'Ð½Ð¾Ñ‡Ð¸';
            } else if (hour < 12) {
                return 'ÑƒÑ‚Ñ€Ð°';
            } else if (hour < 17) {
                return 'Ð´Ð½Ñ';
            } else {
                return 'Ð²ÐµÑ‡ÐµÑ€Ð°';
            }
        },
        ordinalParse: /\d{1,2}-(Ð¹|Ð³Ð¾|Ñ)/,
        ordinal: function (number, period) {
            switch (period) {
            case 'M':
            case 'd':
            case 'DDD':
                return number + '-Ð¹';
            case 'D':
                return number + '-Ð³Ð¾';
            case 'w':
            case 'W':
                return number + '-Ñ';
            default:
                return number;
            }
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Sinhalese (si)
    //! author : Sampath Sitinamaluwa : https://github.com/sampathsris

    var si = _moment__default.defineLocale('si', {
        months : 'à¶¢à¶±à·€à·à¶»à·’_à¶´à·™à¶¶à¶»à·€à·à¶»à·’_à¶¸à·à¶»à·Šà¶­à·”_à¶…à¶´à·Šâ€à¶»à·šà¶½à·Š_à¶¸à·à¶ºà·’_à¶¢à·–à¶±à·’_à¶¢à·–à¶½à·’_à¶…à¶œà·à·ƒà·Šà¶­à·”_à·ƒà·à¶´à·Šà¶­à·à¶¸à·Šà¶¶à¶»à·Š_à¶”à¶šà·Šà¶­à·à¶¶à¶»à·Š_à¶±à·œà·€à·à¶¸à·Šà¶¶à¶»à·Š_à¶¯à·™à·ƒà·à¶¸à·Šà¶¶à¶»à·Š'.split('_'),
        monthsShort : 'à¶¢à¶±_à¶´à·™à¶¶_à¶¸à·à¶»à·Š_à¶…à¶´à·Š_à¶¸à·à¶ºà·’_à¶¢à·–à¶±à·’_à¶¢à·–à¶½à·’_à¶…à¶œà·_à·ƒà·à¶´à·Š_à¶”à¶šà·Š_à¶±à·œà·€à·_à¶¯à·™à·ƒà·'.split('_'),
        weekdays : 'à¶‰à¶»à·’à¶¯à·_à·ƒà¶³à·”à¶¯à·_à¶…à¶Ÿà·„à¶»à·”à·€à·à¶¯à·_à¶¶à¶¯à·à¶¯à·_à¶¶à·Šâ€à¶»à·„à·ƒà·Šà¶´à¶­à·’à¶±à·Šà¶¯à·_à·ƒà·’à¶šà·”à¶»à·à¶¯à·_à·ƒà·™à¶±à·ƒà·”à¶»à·à¶¯à·'.split('_'),
        weekdaysShort : 'à¶‰à¶»à·’_à·ƒà¶³à·”_à¶…à¶Ÿ_à¶¶à¶¯à·_à¶¶à·Šâ€à¶»à·„_à·ƒà·’à¶šà·”_à·ƒà·™à¶±'.split('_'),
        weekdaysMin : 'à¶‰_à·ƒ_à¶…_à¶¶_à¶¶à·Šâ€à¶»_à·ƒà·’_à·ƒà·™'.split('_'),
        longDateFormat : {
            LT : 'a h:mm',
            LTS : 'a h:mm:ss',
            L : 'YYYY/MM/DD',
            LL : 'YYYY MMMM D',
            LLL : 'YYYY MMMM D, a h:mm',
            LLLL : 'YYYY MMMM D [à·€à·à¶±à·’] dddd, a h:mm:ss'
        },
        calendar : {
            sameDay : '[à¶…à¶¯] LT[à¶§]',
            nextDay : '[à·„à·™à¶§] LT[à¶§]',
            nextWeek : 'dddd LT[à¶§]',
            lastDay : '[à¶Šà¶ºà·š] LT[à¶§]',
            lastWeek : '[à¶´à·ƒà·”à¶œà·’à¶º] dddd LT[à¶§]',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%sà¶šà·’à¶±à·Š',
            past : '%sà¶šà¶§ à¶´à·™à¶»',
            s : 'à¶­à¶­à·Šà¶´à¶» à¶šà·’à·„à·’à¶´à¶º',
            m : 'à¶¸à·’à¶±à·’à¶­à·Šà¶­à·”à·€',
            mm : 'à¶¸à·’à¶±à·’à¶­à·Šà¶­à·” %d',
            h : 'à¶´à·à¶º',
            hh : 'à¶´à·à¶º %d',
            d : 'à¶¯à·’à¶±à¶º',
            dd : 'à¶¯à·’à¶± %d',
            M : 'à¶¸à·à·ƒà¶º',
            MM : 'à¶¸à·à·ƒ %d',
            y : 'à·€à·ƒà¶»',
            yy : 'à·€à·ƒà¶» %d'
        },
        ordinalParse: /\d{1,2} à·€à·à¶±à·’/,
        ordinal : function (number) {
            return number + ' à·€à·à¶±à·’';
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'à¶´.à·€.' : 'à¶´à·ƒà·Š à·€à¶»à·”';
            } else {
                return isLower ? 'à¶´à·™.à·€.' : 'à¶´à·™à¶» à·€à¶»à·”';
            }
        }
    });

    //! moment.js locale configuration
    //! locale : slovak (sk)
    //! author : Martin Minka : https://github.com/k2s
    //! based on work of petrbela : https://github.com/petrbela

    var sk__months = 'januÃ¡r_februÃ¡r_marec_aprÃ­l_mÃ¡j_jÃºn_jÃºl_august_september_oktÃ³ber_november_december'.split('_'),
        sk__monthsShort = 'jan_feb_mar_apr_mÃ¡j_jÃºn_jÃºl_aug_sep_okt_nov_dec'.split('_');
    function sk__plural(n) {
        return (n > 1) && (n < 5);
    }
    function sk__translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':  // a few seconds / in a few seconds / a few seconds ago
            return (withoutSuffix || isFuture) ? 'pÃ¡r sekÃºnd' : 'pÃ¡r sekundami';
        case 'm':  // a minute / in a minute / a minute ago
            return withoutSuffix ? 'minÃºta' : (isFuture ? 'minÃºtu' : 'minÃºtou');
        case 'mm': // 9 minutes / in 9 minutes / 9 minutes ago
            if (withoutSuffix || isFuture) {
                return result + (sk__plural(number) ? 'minÃºty' : 'minÃºt');
            } else {
                return result + 'minÃºtami';
            }
            break;
        case 'h':  // an hour / in an hour / an hour ago
            return withoutSuffix ? 'hodina' : (isFuture ? 'hodinu' : 'hodinou');
        case 'hh': // 9 hours / in 9 hours / 9 hours ago
            if (withoutSuffix || isFuture) {
                return result + (sk__plural(number) ? 'hodiny' : 'hodÃ­n');
            } else {
                return result + 'hodinami';
            }
            break;
        case 'd':  // a day / in a day / a day ago
            return (withoutSuffix || isFuture) ? 'deÅˆ' : 'dÅˆom';
        case 'dd': // 9 days / in 9 days / 9 days ago
            if (withoutSuffix || isFuture) {
                return result + (sk__plural(number) ? 'dni' : 'dnÃ­');
            } else {
                return result + 'dÅˆami';
            }
            break;
        case 'M':  // a month / in a month / a month ago
            return (withoutSuffix || isFuture) ? 'mesiac' : 'mesiacom';
        case 'MM': // 9 months / in 9 months / 9 months ago
            if (withoutSuffix || isFuture) {
                return result + (sk__plural(number) ? 'mesiace' : 'mesiacov');
            } else {
                return result + 'mesiacmi';
            }
            break;
        case 'y':  // a year / in a year / a year ago
            return (withoutSuffix || isFuture) ? 'rok' : 'rokom';
        case 'yy': // 9 years / in 9 years / 9 years ago
            if (withoutSuffix || isFuture) {
                return result + (sk__plural(number) ? 'roky' : 'rokov');
            } else {
                return result + 'rokmi';
            }
            break;
        }
    }

    var sk = _moment__default.defineLocale('sk', {
        months : sk__months,
        monthsShort : sk__monthsShort,
        monthsParse : (function (months, monthsShort) {
            var i, _monthsParse = [];
            for (i = 0; i < 12; i++) {
                // use custom parser to solve problem with July (Äervenec)
                _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
            }
            return _monthsParse;
        }(sk__months, sk__monthsShort)),
        weekdays : 'nedeÄ¾a_pondelok_utorok_streda_Å¡tvrtok_piatok_sobota'.split('_'),
        weekdaysShort : 'ne_po_ut_st_Å¡t_pi_so'.split('_'),
        weekdaysMin : 'ne_po_ut_st_Å¡t_pi_so'.split('_'),
        longDateFormat : {
            LT: 'H:mm',
            LTS : 'H:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY H:mm',
            LLLL : 'dddd D. MMMM YYYY H:mm'
        },
        calendar : {
            sameDay: '[dnes o] LT',
            nextDay: '[zajtra o] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[v nedeÄ¾u o] LT';
                case 1:
                case 2:
                    return '[v] dddd [o] LT';
                case 3:
                    return '[v stredu o] LT';
                case 4:
                    return '[vo Å¡tvrtok o] LT';
                case 5:
                    return '[v piatok o] LT';
                case 6:
                    return '[v sobotu o] LT';
                }
            },
            lastDay: '[vÄera o] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[minulÃº nedeÄ¾u o] LT';
                case 1:
                case 2:
                    return '[minulÃ½] dddd [o] LT';
                case 3:
                    return '[minulÃº stredu o] LT';
                case 4:
                case 5:
                    return '[minulÃ½] dddd [o] LT';
                case 6:
                    return '[minulÃº sobotu o] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'za %s',
            past : 'pred %s',
            s : sk__translate,
            m : sk__translate,
            mm : sk__translate,
            h : sk__translate,
            hh : sk__translate,
            d : sk__translate,
            dd : sk__translate,
            M : sk__translate,
            MM : sk__translate,
            y : sk__translate,
            yy : sk__translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : slovenian (sl)
    //! author : Robert SedovÅ¡ek : https://github.com/sedovsek

    function sl__processRelativeTime(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':
            return withoutSuffix || isFuture ? 'nekaj sekund' : 'nekaj sekundami';
        case 'm':
            return withoutSuffix ? 'ena minuta' : 'eno minuto';
        case 'mm':
            if (number === 1) {
                result += withoutSuffix ? 'minuta' : 'minuto';
            } else if (number === 2) {
                result += withoutSuffix || isFuture ? 'minuti' : 'minutama';
            } else if (number < 5) {
                result += withoutSuffix || isFuture ? 'minute' : 'minutami';
            } else {
                result += withoutSuffix || isFuture ? 'minut' : 'minutami';
            }
            return result;
        case 'h':
            return withoutSuffix ? 'ena ura' : 'eno uro';
        case 'hh':
            if (number === 1) {
                result += withoutSuffix ? 'ura' : 'uro';
            } else if (number === 2) {
                result += withoutSuffix || isFuture ? 'uri' : 'urama';
            } else if (number < 5) {
                result += withoutSuffix || isFuture ? 'ure' : 'urami';
            } else {
                result += withoutSuffix || isFuture ? 'ur' : 'urami';
            }
            return result;
        case 'd':
            return withoutSuffix || isFuture ? 'en dan' : 'enim dnem';
        case 'dd':
            if (number === 1) {
                result += withoutSuffix || isFuture ? 'dan' : 'dnem';
            } else if (number === 2) {
                result += withoutSuffix || isFuture ? 'dni' : 'dnevoma';
            } else {
                result += withoutSuffix || isFuture ? 'dni' : 'dnevi';
            }
            return result;
        case 'M':
            return withoutSuffix || isFuture ? 'en mesec' : 'enim mesecem';
        case 'MM':
            if (number === 1) {
                result += withoutSuffix || isFuture ? 'mesec' : 'mesecem';
            } else if (number === 2) {
                result += withoutSuffix || isFuture ? 'meseca' : 'mesecema';
            } else if (number < 5) {
                result += withoutSuffix || isFuture ? 'mesece' : 'meseci';
            } else {
                result += withoutSuffix || isFuture ? 'mesecev' : 'meseci';
            }
            return result;
        case 'y':
            return withoutSuffix || isFuture ? 'eno leto' : 'enim letom';
        case 'yy':
            if (number === 1) {
                result += withoutSuffix || isFuture ? 'leto' : 'letom';
            } else if (number === 2) {
                result += withoutSuffix || isFuture ? 'leti' : 'letoma';
            } else if (number < 5) {
                result += withoutSuffix || isFuture ? 'leta' : 'leti';
            } else {
                result += withoutSuffix || isFuture ? 'let' : 'leti';
            }
            return result;
        }
    }

    var sl = _moment__default.defineLocale('sl', {
        months : 'januar_februar_marec_april_maj_junij_julij_avgust_september_oktober_november_december'.split('_'),
        monthsShort : 'jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.'.split('_'),
        weekdays : 'nedelja_ponedeljek_torek_sreda_Äetrtek_petek_sobota'.split('_'),
        weekdaysShort : 'ned._pon._tor._sre._Äet._pet._sob.'.split('_'),
        weekdaysMin : 'ne_po_to_sr_Äe_pe_so'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'H:mm:ss',
            L : 'DD. MM. YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY H:mm',
            LLLL : 'dddd, D. MMMM YYYY H:mm'
        },
        calendar : {
            sameDay  : '[danes ob] LT',
            nextDay  : '[jutri ob] LT',

            nextWeek : function () {
                switch (this.day()) {
                case 0:
                    return '[v] [nedeljo] [ob] LT';
                case 3:
                    return '[v] [sredo] [ob] LT';
                case 6:
                    return '[v] [soboto] [ob] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[v] dddd [ob] LT';
                }
            },
            lastDay  : '[vÄeraj ob] LT',
            lastWeek : function () {
                switch (this.day()) {
                case 0:
                    return '[prejÅ¡njo] [nedeljo] [ob] LT';
                case 3:
                    return '[prejÅ¡njo] [sredo] [ob] LT';
                case 6:
                    return '[prejÅ¡njo] [soboto] [ob] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[prejÅ¡nji] dddd [ob] LT';
                }
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'Äez %s',
            past   : 'pred %s',
            s      : sl__processRelativeTime,
            m      : sl__processRelativeTime,
            mm     : sl__processRelativeTime,
            h      : sl__processRelativeTime,
            hh     : sl__processRelativeTime,
            d      : sl__processRelativeTime,
            dd     : sl__processRelativeTime,
            M      : sl__processRelativeTime,
            MM     : sl__processRelativeTime,
            y      : sl__processRelativeTime,
            yy     : sl__processRelativeTime
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Albanian (sq)
    //! author : FlakÃ«rim Ismani : https://github.com/flakerimi
    //! author: Menelion ElensÃºle: https://github.com/Oire (tests)
    //! author : Oerd Cukalla : https://github.com/oerd (fixes)

    var sq = _moment__default.defineLocale('sq', {
        months : 'Janar_Shkurt_Mars_Prill_Maj_Qershor_Korrik_Gusht_Shtator_Tetor_NÃ«ntor_Dhjetor'.split('_'),
        monthsShort : 'Jan_Shk_Mar_Pri_Maj_Qer_Kor_Gus_Sht_Tet_NÃ«n_Dhj'.split('_'),
        weekdays : 'E Diel_E HÃ«nÃ«_E MartÃ«_E MÃ«rkurÃ«_E Enjte_E Premte_E ShtunÃ«'.split('_'),
        weekdaysShort : 'Die_HÃ«n_Mar_MÃ«r_Enj_Pre_Sht'.split('_'),
        weekdaysMin : 'D_H_Ma_MÃ«_E_P_Sh'.split('_'),
        meridiemParse: /PD|MD/,
        isPM: function (input) {
            return input.charAt(0) === 'M';
        },
        meridiem : function (hours, minutes, isLower) {
            return hours < 12 ? 'PD' : 'MD';
        },
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay : '[Sot nÃ«] LT',
            nextDay : '[NesÃ«r nÃ«] LT',
            nextWeek : 'dddd [nÃ«] LT',
            lastDay : '[Dje nÃ«] LT',
            lastWeek : 'dddd [e kaluar nÃ«] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'nÃ« %s',
            past : '%s mÃ« parÃ«',
            s : 'disa sekonda',
            m : 'njÃ« minutÃ«',
            mm : '%d minuta',
            h : 'njÃ« orÃ«',
            hh : '%d orÃ«',
            d : 'njÃ« ditÃ«',
            dd : '%d ditÃ«',
            M : 'njÃ« muaj',
            MM : '%d muaj',
            y : 'njÃ« vit',
            yy : '%d vite'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Serbian-cyrillic (sr-cyrl)
    //! author : Milan JanaÄkoviÄ‡<milanjanackovic@gmail.com> : https://github.com/milan-j

    var sr_cyrl__translator = {
        words: { //Different grammatical cases
            m: ['Ñ˜ÐµÐ´Ð°Ð½ Ð¼Ð¸Ð½ÑƒÑ‚', 'Ñ˜ÐµÐ´Ð½Ðµ Ð¼Ð¸Ð½ÑƒÑ‚Ðµ'],
            mm: ['Ð¼Ð¸Ð½ÑƒÑ‚', 'Ð¼Ð¸Ð½ÑƒÑ‚Ðµ', 'Ð¼Ð¸Ð½ÑƒÑ‚Ð°'],
            h: ['Ñ˜ÐµÐ´Ð°Ð½ ÑÐ°Ñ‚', 'Ñ˜ÐµÐ´Ð½Ð¾Ð³ ÑÐ°Ñ‚Ð°'],
            hh: ['ÑÐ°Ñ‚', 'ÑÐ°Ñ‚Ð°', 'ÑÐ°Ñ‚Ð¸'],
            dd: ['Ð´Ð°Ð½', 'Ð´Ð°Ð½Ð°', 'Ð´Ð°Ð½Ð°'],
            MM: ['Ð¼ÐµÑÐµÑ†', 'Ð¼ÐµÑÐµÑ†Ð°', 'Ð¼ÐµÑÐµÑ†Ð¸'],
            yy: ['Ð³Ð¾Ð´Ð¸Ð½Ð°', 'Ð³Ð¾Ð´Ð¸Ð½Ðµ', 'Ð³Ð¾Ð´Ð¸Ð½Ð°']
        },
        correctGrammaticalCase: function (number, wordKey) {
            return number === 1 ? wordKey[0] : (number >= 2 && number <= 4 ? wordKey[1] : wordKey[2]);
        },
        translate: function (number, withoutSuffix, key) {
            var wordKey = sr_cyrl__translator.words[key];
            if (key.length === 1) {
                return withoutSuffix ? wordKey[0] : wordKey[1];
            } else {
                return number + ' ' + sr_cyrl__translator.correctGrammaticalCase(number, wordKey);
            }
        }
    };

    var sr_cyrl = _moment__default.defineLocale('sr-cyrl', {
        months: ['Ñ˜Ð°Ð½ÑƒÐ°Ñ€', 'Ñ„ÐµÐ±Ñ€ÑƒÐ°Ñ€', 'Ð¼Ð°Ñ€Ñ‚', 'Ð°Ð¿Ñ€Ð¸Ð»', 'Ð¼Ð°Ñ˜', 'Ñ˜ÑƒÐ½', 'Ñ˜ÑƒÐ»', 'Ð°Ð²Ð³ÑƒÑÑ‚', 'ÑÐµÐ¿Ñ‚ÐµÐ¼Ð±Ð°Ñ€', 'Ð¾ÐºÑ‚Ð¾Ð±Ð°Ñ€', 'Ð½Ð¾Ð²ÐµÐ¼Ð±Ð°Ñ€', 'Ð´ÐµÑ†ÐµÐ¼Ð±Ð°Ñ€'],
        monthsShort: ['Ñ˜Ð°Ð½.', 'Ñ„ÐµÐ±.', 'Ð¼Ð°Ñ€.', 'Ð°Ð¿Ñ€.', 'Ð¼Ð°Ñ˜', 'Ñ˜ÑƒÐ½', 'Ñ˜ÑƒÐ»', 'Ð°Ð²Ð³.', 'ÑÐµÐ¿.', 'Ð¾ÐºÑ‚.', 'Ð½Ð¾Ð².', 'Ð´ÐµÑ†.'],
        weekdays: ['Ð½ÐµÐ´ÐµÑ™Ð°', 'Ð¿Ð¾Ð½ÐµÐ´ÐµÑ™Ð°Ðº', 'ÑƒÑ‚Ð¾Ñ€Ð°Ðº', 'ÑÑ€ÐµÐ´Ð°', 'Ñ‡ÐµÑ‚Ð²Ñ€Ñ‚Ð°Ðº', 'Ð¿ÐµÑ‚Ð°Ðº', 'ÑÑƒÐ±Ð¾Ñ‚Ð°'],
        weekdaysShort: ['Ð½ÐµÐ´.', 'Ð¿Ð¾Ð½.', 'ÑƒÑ‚Ð¾.', 'ÑÑ€Ðµ.', 'Ñ‡ÐµÑ‚.', 'Ð¿ÐµÑ‚.', 'ÑÑƒÐ±.'],
        weekdaysMin: ['Ð½Ðµ', 'Ð¿Ð¾', 'ÑƒÑ‚', 'ÑÑ€', 'Ñ‡Ðµ', 'Ð¿Ðµ', 'ÑÑƒ'],
        longDateFormat: {
            LT: 'H:mm',
            LTS : 'H:mm:ss',
            L: 'DD. MM. YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY H:mm',
            LLLL: 'dddd, D. MMMM YYYY H:mm'
        },
        calendar: {
            sameDay: '[Ð´Ð°Ð½Ð°Ñ Ñƒ] LT',
            nextDay: '[ÑÑƒÑ‚Ñ€Ð° Ñƒ] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[Ñƒ] [Ð½ÐµÐ´ÐµÑ™Ñƒ] [Ñƒ] LT';
                case 3:
                    return '[Ñƒ] [ÑÑ€ÐµÐ´Ñƒ] [Ñƒ] LT';
                case 6:
                    return '[Ñƒ] [ÑÑƒÐ±Ð¾Ñ‚Ñƒ] [Ñƒ] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[Ñƒ] dddd [Ñƒ] LT';
                }
            },
            lastDay  : '[Ñ˜ÑƒÑ‡Ðµ Ñƒ] LT',
            lastWeek : function () {
                var lastWeekDays = [
                    '[Ð¿Ñ€Ð¾ÑˆÐ»Ðµ] [Ð½ÐµÐ´ÐµÑ™Ðµ] [Ñƒ] LT',
                    '[Ð¿Ñ€Ð¾ÑˆÐ»Ð¾Ð³] [Ð¿Ð¾Ð½ÐµÐ´ÐµÑ™ÐºÐ°] [Ñƒ] LT',
                    '[Ð¿Ñ€Ð¾ÑˆÐ»Ð¾Ð³] [ÑƒÑ‚Ð¾Ñ€ÐºÐ°] [Ñƒ] LT',
                    '[Ð¿Ñ€Ð¾ÑˆÐ»Ðµ] [ÑÑ€ÐµÐ´Ðµ] [Ñƒ] LT',
                    '[Ð¿Ñ€Ð¾ÑˆÐ»Ð¾Ð³] [Ñ‡ÐµÑ‚Ð²Ñ€Ñ‚ÐºÐ°] [Ñƒ] LT',
                    '[Ð¿Ñ€Ð¾ÑˆÐ»Ð¾Ð³] [Ð¿ÐµÑ‚ÐºÐ°] [Ñƒ] LT',
                    '[Ð¿Ñ€Ð¾ÑˆÐ»Ðµ] [ÑÑƒÐ±Ð¾Ñ‚Ðµ] [Ñƒ] LT'
                ];
                return lastWeekDays[this.day()];
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'Ð·Ð° %s',
            past   : 'Ð¿Ñ€Ðµ %s',
            s      : 'Ð½ÐµÐºÐ¾Ð»Ð¸ÐºÐ¾ ÑÐµÐºÑƒÐ½Ð´Ð¸',
            m      : sr_cyrl__translator.translate,
            mm     : sr_cyrl__translator.translate,
            h      : sr_cyrl__translator.translate,
            hh     : sr_cyrl__translator.translate,
            d      : 'Ð´Ð°Ð½',
            dd     : sr_cyrl__translator.translate,
            M      : 'Ð¼ÐµÑÐµÑ†',
            MM     : sr_cyrl__translator.translate,
            y      : 'Ð³Ð¾Ð´Ð¸Ð½Ñƒ',
            yy     : sr_cyrl__translator.translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Serbian-latin (sr)
    //! author : Milan JanaÄkoviÄ‡<milanjanackovic@gmail.com> : https://github.com/milan-j

    var sr__translator = {
        words: { //Different grammatical cases
            m: ['jedan minut', 'jedne minute'],
            mm: ['minut', 'minute', 'minuta'],
            h: ['jedan sat', 'jednog sata'],
            hh: ['sat', 'sata', 'sati'],
            dd: ['dan', 'dana', 'dana'],
            MM: ['mesec', 'meseca', 'meseci'],
            yy: ['godina', 'godine', 'godina']
        },
        correctGrammaticalCase: function (number, wordKey) {
            return number === 1 ? wordKey[0] : (number >= 2 && number <= 4 ? wordKey[1] : wordKey[2]);
        },
        translate: function (number, withoutSuffix, key) {
            var wordKey = sr__translator.words[key];
            if (key.length === 1) {
                return withoutSuffix ? wordKey[0] : wordKey[1];
            } else {
                return number + ' ' + sr__translator.correctGrammaticalCase(number, wordKey);
            }
        }
    };

    var sr = _moment__default.defineLocale('sr', {
        months: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
        monthsShort: ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun', 'jul', 'avg.', 'sep.', 'okt.', 'nov.', 'dec.'],
        weekdays: ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'Äetvrtak', 'petak', 'subota'],
        weekdaysShort: ['ned.', 'pon.', 'uto.', 'sre.', 'Äet.', 'pet.', 'sub.'],
        weekdaysMin: ['ne', 'po', 'ut', 'sr', 'Äe', 'pe', 'su'],
        longDateFormat: {
            LT: 'H:mm',
            LTS : 'H:mm:ss',
            L: 'DD. MM. YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY H:mm',
            LLLL: 'dddd, D. MMMM YYYY H:mm'
        },
        calendar: {
            sameDay: '[danas u] LT',
            nextDay: '[sutra u] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[u] [nedelju] [u] LT';
                case 3:
                    return '[u] [sredu] [u] LT';
                case 6:
                    return '[u] [subotu] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[u] dddd [u] LT';
                }
            },
            lastDay  : '[juÄe u] LT',
            lastWeek : function () {
                var lastWeekDays = [
                    '[proÅ¡le] [nedelje] [u] LT',
                    '[proÅ¡log] [ponedeljka] [u] LT',
                    '[proÅ¡log] [utorka] [u] LT',
                    '[proÅ¡le] [srede] [u] LT',
                    '[proÅ¡log] [Äetvrtka] [u] LT',
                    '[proÅ¡log] [petka] [u] LT',
                    '[proÅ¡le] [subote] [u] LT'
                ];
                return lastWeekDays[this.day()];
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'za %s',
            past   : 'pre %s',
            s      : 'nekoliko sekundi',
            m      : sr__translator.translate,
            mm     : sr__translator.translate,
            h      : sr__translator.translate,
            hh     : sr__translator.translate,
            d      : 'dan',
            dd     : sr__translator.translate,
            M      : 'mesec',
            MM     : sr__translator.translate,
            y      : 'godinu',
            yy     : sr__translator.translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : swedish (sv)
    //! author : Jens Alm : https://github.com/ulmus

    var sv = _moment__default.defineLocale('sv', {
        months : 'januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december'.split('_'),
        monthsShort : 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
        weekdays : 'sÃ¶ndag_mÃ¥ndag_tisdag_onsdag_torsdag_fredag_lÃ¶rdag'.split('_'),
        weekdaysShort : 'sÃ¶n_mÃ¥n_tis_ons_tor_fre_lÃ¶r'.split('_'),
        weekdaysMin : 'sÃ¶_mÃ¥_ti_on_to_fr_lÃ¶'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'YYYY-MM-DD',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[Idag] LT',
            nextDay: '[Imorgon] LT',
            lastDay: '[IgÃ¥r] LT',
            nextWeek: '[PÃ¥] dddd LT',
            lastWeek: '[I] dddd[s] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'om %s',
            past : 'fÃ¶r %s sedan',
            s : 'nÃ¥gra sekunder',
            m : 'en minut',
            mm : '%d minuter',
            h : 'en timme',
            hh : '%d timmar',
            d : 'en dag',
            dd : '%d dagar',
            M : 'en mÃ¥nad',
            MM : '%d mÃ¥nader',
            y : 'ett Ã¥r',
            yy : '%d Ã¥r'
        },
        ordinalParse: /\d{1,2}(e|a)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (~~(number % 100 / 10) === 1) ? 'e' :
                (b === 1) ? 'a' :
                (b === 2) ? 'a' :
                (b === 3) ? 'e' : 'e';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : tamil (ta)
    //! author : Arjunkumar Krishnamoorthy : https://github.com/tk120404

    var ta = _moment__default.defineLocale('ta', {
        months : 'à®œà®©à®µà®°à®¿_à®ªà®¿à®ªà¯à®°à®µà®°à®¿_à®®à®¾à®°à¯à®šà¯_à®à®ªà¯à®°à®²à¯_à®®à¯‡_à®œà¯‚à®©à¯_à®œà¯‚à®²à¯ˆ_à®†à®•à®¸à¯à®Ÿà¯_à®šà¯†à®ªà¯à®Ÿà¯†à®®à¯à®ªà®°à¯_à®…à®•à¯à®Ÿà¯‡à®¾à®ªà®°à¯_à®¨à®µà®®à¯à®ªà®°à¯_à®Ÿà®¿à®šà®®à¯à®ªà®°à¯'.split('_'),
        monthsShort : 'à®œà®©à®µà®°à®¿_à®ªà®¿à®ªà¯à®°à®µà®°à®¿_à®®à®¾à®°à¯à®šà¯_à®à®ªà¯à®°à®²à¯_à®®à¯‡_à®œà¯‚à®©à¯_à®œà¯‚à®²à¯ˆ_à®†à®•à®¸à¯à®Ÿà¯_à®šà¯†à®ªà¯à®Ÿà¯†à®®à¯à®ªà®°à¯_à®…à®•à¯à®Ÿà¯‡à®¾à®ªà®°à¯_à®¨à®µà®®à¯à®ªà®°à¯_à®Ÿà®¿à®šà®®à¯à®ªà®°à¯'.split('_'),
        weekdays : 'à®žà®¾à®¯à®¿à®±à¯à®±à¯à®•à¯à®•à®¿à®´à®®à¯ˆ_à®¤à®¿à®™à¯à®•à®Ÿà¯à®•à®¿à®´à®®à¯ˆ_à®šà¯†à®µà¯à®µà®¾à®¯à¯à®•à®¿à®´à®®à¯ˆ_à®ªà¯à®¤à®©à¯à®•à®¿à®´à®®à¯ˆ_à®µà®¿à®¯à®¾à®´à®•à¯à®•à®¿à®´à®®à¯ˆ_à®µà¯†à®³à¯à®³à®¿à®•à¯à®•à®¿à®´à®®à¯ˆ_à®šà®©à®¿à®•à¯à®•à®¿à®´à®®à¯ˆ'.split('_'),
        weekdaysShort : 'à®žà®¾à®¯à®¿à®±à¯_à®¤à®¿à®™à¯à®•à®³à¯_à®šà¯†à®µà¯à®µà®¾à®¯à¯_à®ªà¯à®¤à®©à¯_à®µà®¿à®¯à®¾à®´à®©à¯_à®µà¯†à®³à¯à®³à®¿_à®šà®©à®¿'.split('_'),
        weekdaysMin : 'à®žà®¾_à®¤à®¿_à®šà¯†_à®ªà¯_à®µà®¿_à®µà¯†_à®š'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, HH:mm',
            LLLL : 'dddd, D MMMM YYYY, HH:mm'
        },
        calendar : {
            sameDay : '[à®‡à®©à¯à®±à¯] LT',
            nextDay : '[à®¨à®¾à®³à¯ˆ] LT',
            nextWeek : 'dddd, LT',
            lastDay : '[à®¨à¯‡à®±à¯à®±à¯] LT',
            lastWeek : '[à®•à®Ÿà®¨à¯à®¤ à®µà®¾à®°à®®à¯] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s à®‡à®²à¯',
            past : '%s à®®à¯à®©à¯',
            s : 'à®’à®°à¯ à®šà®¿à®² à®µà®¿à®¨à®¾à®Ÿà®¿à®•à®³à¯',
            m : 'à®’à®°à¯ à®¨à®¿à®®à®¿à®Ÿà®®à¯',
            mm : '%d à®¨à®¿à®®à®¿à®Ÿà®™à¯à®•à®³à¯',
            h : 'à®’à®°à¯ à®®à®£à®¿ à®¨à¯‡à®°à®®à¯',
            hh : '%d à®®à®£à®¿ à®¨à¯‡à®°à®®à¯',
            d : 'à®’à®°à¯ à®¨à®¾à®³à¯',
            dd : '%d à®¨à®¾à®Ÿà¯à®•à®³à¯',
            M : 'à®’à®°à¯ à®®à®¾à®¤à®®à¯',
            MM : '%d à®®à®¾à®¤à®™à¯à®•à®³à¯',
            y : 'à®’à®°à¯ à®µà®°à¯à®Ÿà®®à¯',
            yy : '%d à®†à®£à¯à®Ÿà¯à®•à®³à¯'
        },
        ordinalParse: /\d{1,2}à®µà®¤à¯/,
        ordinal : function (number) {
            return number + 'à®µà®¤à¯';
        },
        // refer http://ta.wikipedia.org/s/1er1
        meridiemParse: /à®¯à®¾à®®à®®à¯|à®µà¯ˆà®•à®±à¯ˆ|à®•à®¾à®²à¯ˆ|à®¨à®£à¯à®ªà®•à®²à¯|à®Žà®±à¯à®ªà®¾à®Ÿà¯|à®®à®¾à®²à¯ˆ/,
        meridiem : function (hour, minute, isLower) {
            if (hour < 2) {
                return ' à®¯à®¾à®®à®®à¯';
            } else if (hour < 6) {
                return ' à®µà¯ˆà®•à®±à¯ˆ';  // à®µà¯ˆà®•à®±à¯ˆ
            } else if (hour < 10) {
                return ' à®•à®¾à®²à¯ˆ'; // à®•à®¾à®²à¯ˆ
            } else if (hour < 14) {
                return ' à®¨à®£à¯à®ªà®•à®²à¯'; // à®¨à®£à¯à®ªà®•à®²à¯
            } else if (hour < 18) {
                return ' à®Žà®±à¯à®ªà®¾à®Ÿà¯'; // à®Žà®±à¯à®ªà®¾à®Ÿà¯
            } else if (hour < 22) {
                return ' à®®à®¾à®²à¯ˆ'; // à®®à®¾à®²à¯ˆ
            } else {
                return ' à®¯à®¾à®®à®®à¯';
            }
        },
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'à®¯à®¾à®®à®®à¯') {
                return hour < 2 ? hour : hour + 12;
            } else if (meridiem === 'à®µà¯ˆà®•à®±à¯ˆ' || meridiem === 'à®•à®¾à®²à¯ˆ') {
                return hour;
            } else if (meridiem === 'à®¨à®£à¯à®ªà®•à®²à¯') {
                return hour >= 10 ? hour : hour + 12;
            } else {
                return hour + 12;
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : thai (th)
    //! author : Kridsada Thanabulpong : https://github.com/sirn

    var th = _moment__default.defineLocale('th', {
        months : 'à¸¡à¸à¸£à¸²à¸„à¸¡_à¸à¸¸à¸¡à¸ à¸²à¸žà¸±à¸™à¸˜à¹Œ_à¸¡à¸µà¸™à¸²à¸„à¸¡_à¹€à¸¡à¸©à¸²à¸¢à¸™_à¸žà¸¤à¸©à¸ à¸²à¸„à¸¡_à¸¡à¸´à¸–à¸¸à¸™à¸²à¸¢à¸™_à¸à¸£à¸à¸Žà¸²à¸„à¸¡_à¸ªà¸´à¸‡à¸«à¸²à¸„à¸¡_à¸à¸±à¸™à¸¢à¸²à¸¢à¸™_à¸•à¸¸à¸¥à¸²à¸„à¸¡_à¸žà¸¤à¸¨à¸ˆà¸´à¸à¸²à¸¢à¸™_à¸˜à¸±à¸™à¸§à¸²à¸„à¸¡'.split('_'),
        monthsShort : 'à¸¡à¸à¸£à¸²_à¸à¸¸à¸¡à¸ à¸²_à¸¡à¸µà¸™à¸²_à¹€à¸¡à¸©à¸²_à¸žà¸¤à¸©à¸ à¸²_à¸¡à¸´à¸–à¸¸à¸™à¸²_à¸à¸£à¸à¸Žà¸²_à¸ªà¸´à¸‡à¸«à¸²_à¸à¸±à¸™à¸¢à¸²_à¸•à¸¸à¸¥à¸²_à¸žà¸¤à¸¨à¸ˆà¸´à¸à¸²_à¸˜à¸±à¸™à¸§à¸²'.split('_'),
        weekdays : 'à¸­à¸²à¸—à¸´à¸•à¸¢à¹Œ_à¸ˆà¸±à¸™à¸—à¸£à¹Œ_à¸­à¸±à¸‡à¸„à¸²à¸£_à¸žà¸¸à¸˜_à¸žà¸¤à¸«à¸±à¸ªà¸šà¸”à¸µ_à¸¨à¸¸à¸à¸£à¹Œ_à¹€à¸ªà¸²à¸£à¹Œ'.split('_'),
        weekdaysShort : 'à¸­à¸²à¸—à¸´à¸•à¸¢à¹Œ_à¸ˆà¸±à¸™à¸—à¸£à¹Œ_à¸­à¸±à¸‡à¸„à¸²à¸£_à¸žà¸¸à¸˜_à¸žà¸¤à¸«à¸±à¸ª_à¸¨à¸¸à¸à¸£à¹Œ_à¹€à¸ªà¸²à¸£à¹Œ'.split('_'), // yes, three characters difference
        weekdaysMin : 'à¸­à¸²._à¸ˆ._à¸­._à¸ž._à¸žà¸¤._à¸¨._à¸ª.'.split('_'),
        longDateFormat : {
            LT : 'H à¸™à¸²à¸¬à¸´à¸à¸² m à¸™à¸²à¸—à¸µ',
            LTS : 'H à¸™à¸²à¸¬à¸´à¸à¸² m à¸™à¸²à¸—à¸µ s à¸§à¸´à¸™à¸²à¸—à¸µ',
            L : 'YYYY/MM/DD',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY à¹€à¸§à¸¥à¸² H à¸™à¸²à¸¬à¸´à¸à¸² m à¸™à¸²à¸—à¸µ',
            LLLL : 'à¸§à¸±à¸™ddddà¸—à¸µà¹ˆ D MMMM YYYY à¹€à¸§à¸¥à¸² H à¸™à¸²à¸¬à¸´à¸à¸² m à¸™à¸²à¸—à¸µ'
        },
        meridiemParse: /à¸à¹ˆà¸­à¸™à¹€à¸—à¸µà¹ˆà¸¢à¸‡|à¸«à¸¥à¸±à¸‡à¹€à¸—à¸µà¹ˆà¸¢à¸‡/,
        isPM: function (input) {
            return input === 'à¸«à¸¥à¸±à¸‡à¹€à¸—à¸µà¹ˆà¸¢à¸‡';
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return 'à¸à¹ˆà¸­à¸™à¹€à¸—à¸µà¹ˆà¸¢à¸‡';
            } else {
                return 'à¸«à¸¥à¸±à¸‡à¹€à¸—à¸µà¹ˆà¸¢à¸‡';
            }
        },
        calendar : {
            sameDay : '[à¸§à¸±à¸™à¸™à¸µà¹‰ à¹€à¸§à¸¥à¸²] LT',
            nextDay : '[à¸žà¸£à¸¸à¹ˆà¸‡à¸™à¸µà¹‰ à¹€à¸§à¸¥à¸²] LT',
            nextWeek : 'dddd[à¸«à¸™à¹‰à¸² à¹€à¸§à¸¥à¸²] LT',
            lastDay : '[à¹€à¸¡à¸·à¹ˆà¸­à¸§à¸²à¸™à¸™à¸µà¹‰ à¹€à¸§à¸¥à¸²] LT',
            lastWeek : '[à¸§à¸±à¸™]dddd[à¸—à¸µà¹ˆà¹à¸¥à¹‰à¸§ à¹€à¸§à¸¥à¸²] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'à¸­à¸µà¸ %s',
            past : '%sà¸—à¸µà¹ˆà¹à¸¥à¹‰à¸§',
            s : 'à¹„à¸¡à¹ˆà¸à¸µà¹ˆà¸§à¸´à¸™à¸²à¸—à¸µ',
            m : '1 à¸™à¸²à¸—à¸µ',
            mm : '%d à¸™à¸²à¸—à¸µ',
            h : '1 à¸Šà¸±à¹ˆà¸§à¹‚à¸¡à¸‡',
            hh : '%d à¸Šà¸±à¹ˆà¸§à¹‚à¸¡à¸‡',
            d : '1 à¸§à¸±à¸™',
            dd : '%d à¸§à¸±à¸™',
            M : '1 à¹€à¸”à¸·à¸­à¸™',
            MM : '%d à¹€à¸”à¸·à¸­à¸™',
            y : '1 à¸›à¸µ',
            yy : '%d à¸›à¸µ'
        }
    });

    //! moment.js locale configuration
    //! locale : Tagalog/Filipino (tl-ph)
    //! author : Dan Hagman

    var tl_ph = _moment__default.defineLocale('tl-ph', {
        months : 'Enero_Pebrero_Marso_Abril_Mayo_Hunyo_Hulyo_Agosto_Setyembre_Oktubre_Nobyembre_Disyembre'.split('_'),
        monthsShort : 'Ene_Peb_Mar_Abr_May_Hun_Hul_Ago_Set_Okt_Nob_Dis'.split('_'),
        weekdays : 'Linggo_Lunes_Martes_Miyerkules_Huwebes_Biyernes_Sabado'.split('_'),
        weekdaysShort : 'Lin_Lun_Mar_Miy_Huw_Biy_Sab'.split('_'),
        weekdaysMin : 'Li_Lu_Ma_Mi_Hu_Bi_Sab'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'MM/D/YYYY',
            LL : 'MMMM D, YYYY',
            LLL : 'MMMM D, YYYY HH:mm',
            LLLL : 'dddd, MMMM DD, YYYY HH:mm'
        },
        calendar : {
            sameDay: '[Ngayon sa] LT',
            nextDay: '[Bukas sa] LT',
            nextWeek: 'dddd [sa] LT',
            lastDay: '[Kahapon sa] LT',
            lastWeek: 'dddd [huling linggo] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'sa loob ng %s',
            past : '%s ang nakalipas',
            s : 'ilang segundo',
            m : 'isang minuto',
            mm : '%d minuto',
            h : 'isang oras',
            hh : '%d oras',
            d : 'isang araw',
            dd : '%d araw',
            M : 'isang buwan',
            MM : '%d buwan',
            y : 'isang taon',
            yy : '%d taon'
        },
        ordinalParse: /\d{1,2}/,
        ordinal : function (number) {
            return number;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : turkish (tr)
    //! authors : Erhan Gundogan : https://github.com/erhangundogan,
    //!           Burak YiÄŸit Kaya: https://github.com/BYK

    var tr__suffixes = {
        1: '\'inci',
        5: '\'inci',
        8: '\'inci',
        70: '\'inci',
        80: '\'inci',
        2: '\'nci',
        7: '\'nci',
        20: '\'nci',
        50: '\'nci',
        3: '\'Ã¼ncÃ¼',
        4: '\'Ã¼ncÃ¼',
        100: '\'Ã¼ncÃ¼',
        6: '\'ncÄ±',
        9: '\'uncu',
        10: '\'uncu',
        30: '\'uncu',
        60: '\'Ä±ncÄ±',
        90: '\'Ä±ncÄ±'
    };

    var tr = _moment__default.defineLocale('tr', {
        months : 'Ocak_Åžubat_Mart_Nisan_MayÄ±s_Haziran_Temmuz_AÄŸustos_EylÃ¼l_Ekim_KasÄ±m_AralÄ±k'.split('_'),
        monthsShort : 'Oca_Åžub_Mar_Nis_May_Haz_Tem_AÄŸu_Eyl_Eki_Kas_Ara'.split('_'),
        weekdays : 'Pazar_Pazartesi_SalÄ±_Ã‡arÅŸamba_PerÅŸembe_Cuma_Cumartesi'.split('_'),
        weekdaysShort : 'Paz_Pts_Sal_Ã‡ar_Per_Cum_Cts'.split('_'),
        weekdaysMin : 'Pz_Pt_Sa_Ã‡a_Pe_Cu_Ct'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay : '[bugÃ¼n saat] LT',
            nextDay : '[yarÄ±n saat] LT',
            nextWeek : '[haftaya] dddd [saat] LT',
            lastDay : '[dÃ¼n] LT',
            lastWeek : '[geÃ§en hafta] dddd [saat] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s sonra',
            past : '%s Ã¶nce',
            s : 'birkaÃ§ saniye',
            m : 'bir dakika',
            mm : '%d dakika',
            h : 'bir saat',
            hh : '%d saat',
            d : 'bir gÃ¼n',
            dd : '%d gÃ¼n',
            M : 'bir ay',
            MM : '%d ay',
            y : 'bir yÄ±l',
            yy : '%d yÄ±l'
        },
        ordinalParse: /\d{1,2}'(inci|nci|Ã¼ncÃ¼|ncÄ±|uncu|Ä±ncÄ±)/,
        ordinal : function (number) {
            if (number === 0) {  // special case for zero
                return number + '\'Ä±ncÄ±';
            }
            var a = number % 10,
                b = number % 100 - a,
                c = number >= 100 ? 100 : null;
            return number + (tr__suffixes[a] || tr__suffixes[b] || tr__suffixes[c]);
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : talossan (tzl)
    //! author : Robin van der Vliet : https://github.com/robin0van0der0v with the help of IustÃ¬ Canun


    var tzl = _moment__default.defineLocale('tzl', {
        months : 'Januar_Fevraglh_MarÃ§_AvrÃ¯u_Mai_GÃ¼n_Julia_Guscht_Setemvar_ListopÃ¤ts_Noemvar_Zecemvar'.split('_'),
        monthsShort : 'Jan_Fev_Mar_Avr_Mai_GÃ¼n_Jul_Gus_Set_Lis_Noe_Zec'.split('_'),
        weekdays : 'SÃºladi_LÃºneÃ§i_Maitzi_MÃ¡rcuri_XhÃºadi_ViÃ©nerÃ§i_SÃ¡turi'.split('_'),
        weekdaysShort : 'SÃºl_LÃºn_Mai_MÃ¡r_XhÃº_ViÃ©_SÃ¡t'.split('_'),
        weekdaysMin : 'SÃº_LÃº_Ma_MÃ¡_Xh_Vi_SÃ¡'.split('_'),
        longDateFormat : {
            LT : 'HH.mm',
            LTS : 'LT.ss',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM [dallas] YYYY',
            LLL : 'D. MMMM [dallas] YYYY LT',
            LLLL : 'dddd, [li] D. MMMM [dallas] YYYY LT'
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'd\'o' : 'D\'O';
            } else {
                return isLower ? 'd\'a' : 'D\'A';
            }
        },
        calendar : {
            sameDay : '[oxhi Ã ] LT',
            nextDay : '[demÃ  Ã ] LT',
            nextWeek : 'dddd [Ã ] LT',
            lastDay : '[ieiri Ã ] LT',
            lastWeek : '[sÃ¼r el] dddd [lasteu Ã ] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'osprei %s',
            past : 'ja%s',
            s : tzl__processRelativeTime,
            m : tzl__processRelativeTime,
            mm : tzl__processRelativeTime,
            h : tzl__processRelativeTime,
            hh : tzl__processRelativeTime,
            d : tzl__processRelativeTime,
            dd : tzl__processRelativeTime,
            M : tzl__processRelativeTime,
            MM : tzl__processRelativeTime,
            y : tzl__processRelativeTime,
            yy : tzl__processRelativeTime
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    function tzl__processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            's': ['viensas secunds', '\'iensas secunds'],
            'm': ['\'n mÃ­ut', '\'iens mÃ­ut'],
            'mm': [number + ' mÃ­uts', ' ' + number + ' mÃ­uts'],
            'h': ['\'n Ã¾ora', '\'iensa Ã¾ora'],
            'hh': [number + ' Ã¾oras', ' ' + number + ' Ã¾oras'],
            'd': ['\'n ziua', '\'iensa ziua'],
            'dd': [number + ' ziuas', ' ' + number + ' ziuas'],
            'M': ['\'n mes', '\'iens mes'],
            'MM': [number + ' mesen', ' ' + number + ' mesen'],
            'y': ['\'n ar', '\'iens ar'],
            'yy': [number + ' ars', ' ' + number + ' ars']
        };
        return isFuture ? format[key][0] : (withoutSuffix ? format[key][0] : format[key][1].trim());
    }

    //! moment.js locale configuration
    //! locale : Morocco Central Atlas TamaziÉ£t in Latin (tzm-latn)
    //! author : Abdel Said : https://github.com/abdelsaid

    var tzm_latn = _moment__default.defineLocale('tzm-latn', {
        months : 'innayr_brË¤ayrË¤_marË¤sË¤_ibrir_mayyw_ywnyw_ywlywz_É£wÅ¡t_Å¡wtanbir_ktË¤wbrË¤_nwwanbir_dwjnbir'.split('_'),
        monthsShort : 'innayr_brË¤ayrË¤_marË¤sË¤_ibrir_mayyw_ywnyw_ywlywz_É£wÅ¡t_Å¡wtanbir_ktË¤wbrË¤_nwwanbir_dwjnbir'.split('_'),
        weekdays : 'asamas_aynas_asinas_akras_akwas_asimwas_asiá¸yas'.split('_'),
        weekdaysShort : 'asamas_aynas_asinas_akras_akwas_asimwas_asiá¸yas'.split('_'),
        weekdaysMin : 'asamas_aynas_asinas_akras_akwas_asimwas_asiá¸yas'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[asdkh g] LT',
            nextDay: '[aska g] LT',
            nextWeek: 'dddd [g] LT',
            lastDay: '[assant g] LT',
            lastWeek: 'dddd [g] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'dadkh s yan %s',
            past : 'yan %s',
            s : 'imik',
            m : 'minuá¸',
            mm : '%d minuá¸',
            h : 'saÉ›a',
            hh : '%d tassaÉ›in',
            d : 'ass',
            dd : '%d ossan',
            M : 'ayowr',
            MM : '%d iyyirn',
            y : 'asgas',
            yy : '%d isgasn'
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : Morocco Central Atlas TamaziÉ£t (tzm)
    //! author : Abdel Said : https://github.com/abdelsaid

    var tzm = _moment__default.defineLocale('tzm', {
        months : 'âµ‰âµâµâ´°âµ¢âµ”_â´±âµ•â´°âµ¢âµ•_âµŽâ´°âµ•âµš_âµ‰â´±âµ”âµ‰âµ”_âµŽâ´°âµ¢âµ¢âµ“_âµ¢âµ“âµâµ¢âµ“_âµ¢âµ“âµâµ¢âµ“âµ£_âµ–âµ“âµ›âµœ_âµ›âµ“âµœâ´°âµâ´±âµ‰âµ”_â´½âµŸâµ“â´±âµ•_âµâµ“âµ¡â´°âµâ´±âµ‰âµ”_â´·âµ“âµŠâµâ´±âµ‰âµ”'.split('_'),
        monthsShort : 'âµ‰âµâµâ´°âµ¢âµ”_â´±âµ•â´°âµ¢âµ•_âµŽâ´°âµ•âµš_âµ‰â´±âµ”âµ‰âµ”_âµŽâ´°âµ¢âµ¢âµ“_âµ¢âµ“âµâµ¢âµ“_âµ¢âµ“âµâµ¢âµ“âµ£_âµ–âµ“âµ›âµœ_âµ›âµ“âµœâ´°âµâ´±âµ‰âµ”_â´½âµŸâµ“â´±âµ•_âµâµ“âµ¡â´°âµâ´±âµ‰âµ”_â´·âµ“âµŠâµâ´±âµ‰âµ”'.split('_'),
        weekdays : 'â´°âµ™â´°âµŽâ´°âµ™_â´°âµ¢âµâ´°âµ™_â´°âµ™âµ‰âµâ´°âµ™_â´°â´½âµ”â´°âµ™_â´°â´½âµ¡â´°âµ™_â´°âµ™âµ‰âµŽâµ¡â´°âµ™_â´°âµ™âµ‰â´¹âµ¢â´°âµ™'.split('_'),
        weekdaysShort : 'â´°âµ™â´°âµŽâ´°âµ™_â´°âµ¢âµâ´°âµ™_â´°âµ™âµ‰âµâ´°âµ™_â´°â´½âµ”â´°âµ™_â´°â´½âµ¡â´°âµ™_â´°âµ™âµ‰âµŽâµ¡â´°âµ™_â´°âµ™âµ‰â´¹âµ¢â´°âµ™'.split('_'),
        weekdaysMin : 'â´°âµ™â´°âµŽâ´°âµ™_â´°âµ¢âµâ´°âµ™_â´°âµ™âµ‰âµâ´°âµ™_â´°â´½âµ”â´°âµ™_â´°â´½âµ¡â´°âµ™_â´°âµ™âµ‰âµŽâµ¡â´°âµ™_â´°âµ™âµ‰â´¹âµ¢â´°âµ™'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS: 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[â´°âµ™â´·âµ… â´´] LT',
            nextDay: '[â´°âµ™â´½â´° â´´] LT',
            nextWeek: 'dddd [â´´] LT',
            lastDay: '[â´°âµšâ´°âµâµœ â´´] LT',
            lastWeek: 'dddd [â´´] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'â´·â´°â´·âµ… âµ™ âµ¢â´°âµ %s',
            past : 'âµ¢â´°âµ %s',
            s : 'âµ‰âµŽâµ‰â´½',
            m : 'âµŽâµ‰âµâµ“â´º',
            mm : '%d âµŽâµ‰âµâµ“â´º',
            h : 'âµ™â´°âµ„â´°',
            hh : '%d âµœâ´°âµ™âµ™â´°âµ„âµ‰âµ',
            d : 'â´°âµ™âµ™',
            dd : '%d oâµ™âµ™â´°âµ',
            M : 'â´°âµ¢oâµ“âµ”',
            MM : '%d âµ‰âµ¢âµ¢âµ‰âµ”âµ',
            y : 'â´°âµ™â´³â´°âµ™',
            yy : '%d âµ‰âµ™â´³â´°âµ™âµ'
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : ukrainian (uk)
    //! author : zemlanin : https://github.com/zemlanin
    //! Author : Menelion ElensÃºle : https://github.com/Oire

    function uk__plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
    }
    function uk__relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
            'mm': 'Ñ…Ð²Ð¸Ð»Ð¸Ð½Ð°_Ñ…Ð²Ð¸Ð»Ð¸Ð½Ð¸_Ñ…Ð²Ð¸Ð»Ð¸Ð½',
            'hh': 'Ð³Ð¾Ð´Ð¸Ð½Ð°_Ð³Ð¾Ð´Ð¸Ð½Ð¸_Ð³Ð¾Ð´Ð¸Ð½',
            'dd': 'Ð´ÐµÐ½ÑŒ_Ð´Ð½Ñ–_Ð´Ð½Ñ–Ð²',
            'MM': 'Ð¼Ñ–ÑÑÑ†ÑŒ_Ð¼Ñ–ÑÑÑ†Ñ–_Ð¼Ñ–ÑÑÑ†Ñ–Ð²',
            'yy': 'Ñ€Ñ–Ðº_Ñ€Ð¾ÐºÐ¸_Ñ€Ð¾ÐºÑ–Ð²'
        };
        if (key === 'm') {
            return withoutSuffix ? 'Ñ…Ð²Ð¸Ð»Ð¸Ð½Ð°' : 'Ñ…Ð²Ð¸Ð»Ð¸Ð½Ñƒ';
        }
        else if (key === 'h') {
            return withoutSuffix ? 'Ð³Ð¾Ð´Ð¸Ð½Ð°' : 'Ð³Ð¾Ð´Ð¸Ð½Ñƒ';
        }
        else {
            return number + ' ' + uk__plural(format[key], +number);
        }
    }
    function uk__monthsCaseReplace(m, format) {
        var months = {
            'nominative': 'ÑÑ–Ñ‡ÐµÐ½ÑŒ_Ð»ÑŽÑ‚Ð¸Ð¹_Ð±ÐµÑ€ÐµÐ·ÐµÐ½ÑŒ_ÐºÐ²Ñ–Ñ‚ÐµÐ½ÑŒ_Ñ‚Ñ€Ð°Ð²ÐµÐ½ÑŒ_Ñ‡ÐµÑ€Ð²ÐµÐ½ÑŒ_Ð»Ð¸Ð¿ÐµÐ½ÑŒ_ÑÐµÑ€Ð¿ÐµÐ½ÑŒ_Ð²ÐµÑ€ÐµÑÐµÐ½ÑŒ_Ð¶Ð¾Ð²Ñ‚ÐµÐ½ÑŒ_Ð»Ð¸ÑÑ‚Ð¾Ð¿Ð°Ð´_Ð³Ñ€ÑƒÐ´ÐµÐ½ÑŒ'.split('_'),
            'accusative': 'ÑÑ–Ñ‡Ð½Ñ_Ð»ÑŽÑ‚Ð¾Ð³Ð¾_Ð±ÐµÑ€ÐµÐ·Ð½Ñ_ÐºÐ²Ñ–Ñ‚Ð½Ñ_Ñ‚Ñ€Ð°Ð²Ð½Ñ_Ñ‡ÐµÑ€Ð²Ð½Ñ_Ð»Ð¸Ð¿Ð½Ñ_ÑÐµÑ€Ð¿Ð½Ñ_Ð²ÐµÑ€ÐµÑÐ½Ñ_Ð¶Ð¾Ð²Ñ‚Ð½Ñ_Ð»Ð¸ÑÑ‚Ð¾Ð¿Ð°Ð´Ð°_Ð³Ñ€ÑƒÐ´Ð½Ñ'.split('_')
        },
        nounCase = (/D[oD]? *MMMM?/).test(format) ?
            'accusative' :
            'nominative';
        return months[nounCase][m.month()];
    }
    function uk__weekdaysCaseReplace(m, format) {
        var weekdays = {
            'nominative': 'Ð½ÐµÐ´Ñ–Ð»Ñ_Ð¿Ð¾Ð½ÐµÐ´Ñ–Ð»Ð¾Ðº_Ð²Ñ–Ð²Ñ‚Ð¾Ñ€Ð¾Ðº_ÑÐµÑ€ÐµÐ´Ð°_Ñ‡ÐµÑ‚Ð²ÐµÑ€_Ð¿â€™ÑÑ‚Ð½Ð¸Ñ†Ñ_ÑÑƒÐ±Ð¾Ñ‚Ð°'.split('_'),
            'accusative': 'Ð½ÐµÐ´Ñ–Ð»ÑŽ_Ð¿Ð¾Ð½ÐµÐ´Ñ–Ð»Ð¾Ðº_Ð²Ñ–Ð²Ñ‚Ð¾Ñ€Ð¾Ðº_ÑÐµÑ€ÐµÐ´Ñƒ_Ñ‡ÐµÑ‚Ð²ÐµÑ€_Ð¿â€™ÑÑ‚Ð½Ð¸Ñ†ÑŽ_ÑÑƒÐ±Ð¾Ñ‚Ñƒ'.split('_'),
            'genitive': 'Ð½ÐµÐ´Ñ–Ð»Ñ–_Ð¿Ð¾Ð½ÐµÐ´Ñ–Ð»ÐºÐ°_Ð²Ñ–Ð²Ñ‚Ð¾Ñ€ÐºÐ°_ÑÐµÑ€ÐµÐ´Ð¸_Ñ‡ÐµÑ‚Ð²ÐµÑ€Ð³Ð°_Ð¿â€™ÑÑ‚Ð½Ð¸Ñ†Ñ–_ÑÑƒÐ±Ð¾Ñ‚Ð¸'.split('_')
        },
        nounCase = (/(\[[Ð’Ð²Ð£Ñƒ]\]) ?dddd/).test(format) ?
            'accusative' :
            ((/\[?(?:Ð¼Ð¸Ð½ÑƒÐ»Ð¾Ñ—|Ð½Ð°ÑÑ‚ÑƒÐ¿Ð½Ð¾Ñ—)? ?\] ?dddd/).test(format) ?
                'genitive' :
                'nominative');
        return weekdays[nounCase][m.day()];
    }
    function processHoursFunction(str) {
        return function () {
            return str + 'Ð¾' + (this.hours() === 11 ? 'Ð±' : '') + '] LT';
        };
    }

    var uk = _moment__default.defineLocale('uk', {
        months : uk__monthsCaseReplace,
        monthsShort : 'ÑÑ–Ñ‡_Ð»ÑŽÑ‚_Ð±ÐµÑ€_ÐºÐ²Ñ–Ñ‚_Ñ‚Ñ€Ð°Ð²_Ñ‡ÐµÑ€Ð²_Ð»Ð¸Ð¿_ÑÐµÑ€Ð¿_Ð²ÐµÑ€_Ð¶Ð¾Ð²Ñ‚_Ð»Ð¸ÑÑ‚_Ð³Ñ€ÑƒÐ´'.split('_'),
        weekdays : uk__weekdaysCaseReplace,
        weekdaysShort : 'Ð½Ð´_Ð¿Ð½_Ð²Ñ‚_ÑÑ€_Ñ‡Ñ‚_Ð¿Ñ‚_ÑÐ±'.split('_'),
        weekdaysMin : 'Ð½Ð´_Ð¿Ð½_Ð²Ñ‚_ÑÑ€_Ñ‡Ñ‚_Ð¿Ñ‚_ÑÐ±'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY Ñ€.',
            LLL : 'D MMMM YYYY Ñ€., HH:mm',
            LLLL : 'dddd, D MMMM YYYY Ñ€., HH:mm'
        },
        calendar : {
            sameDay: processHoursFunction('[Ð¡ÑŒÐ¾Ð³Ð¾Ð´Ð½Ñ– '),
            nextDay: processHoursFunction('[Ð—Ð°Ð²Ñ‚Ñ€Ð° '),
            lastDay: processHoursFunction('[Ð’Ñ‡Ð¾Ñ€Ð° '),
            nextWeek: processHoursFunction('[Ð£] dddd ['),
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 5:
                case 6:
                    return processHoursFunction('[ÐœÐ¸Ð½ÑƒÐ»Ð¾Ñ—] dddd [').call(this);
                case 1:
                case 2:
                case 4:
                    return processHoursFunction('[ÐœÐ¸Ð½ÑƒÐ»Ð¾Ð³Ð¾] dddd [').call(this);
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'Ð·Ð° %s',
            past : '%s Ñ‚Ð¾Ð¼Ñƒ',
            s : 'Ð´ÐµÐºÑ–Ð»ÑŒÐºÐ° ÑÐµÐºÑƒÐ½Ð´',
            m : uk__relativeTimeWithPlural,
            mm : uk__relativeTimeWithPlural,
            h : 'Ð³Ð¾Ð´Ð¸Ð½Ñƒ',
            hh : uk__relativeTimeWithPlural,
            d : 'Ð´ÐµÐ½ÑŒ',
            dd : uk__relativeTimeWithPlural,
            M : 'Ð¼Ñ–ÑÑÑ†ÑŒ',
            MM : uk__relativeTimeWithPlural,
            y : 'Ñ€Ñ–Ðº',
            yy : uk__relativeTimeWithPlural
        },
        // M. E.: those two are virtually unused but a user might want to implement them for his/her website for some reason
        meridiemParse: /Ð½Ð¾Ñ‡Ñ–|Ñ€Ð°Ð½ÐºÑƒ|Ð´Ð½Ñ|Ð²ÐµÑ‡Ð¾Ñ€Ð°/,
        isPM: function (input) {
            return /^(Ð´Ð½Ñ|Ð²ÐµÑ‡Ð¾Ñ€Ð°)$/.test(input);
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'Ð½Ð¾Ñ‡Ñ–';
            } else if (hour < 12) {
                return 'Ñ€Ð°Ð½ÐºÑƒ';
            } else if (hour < 17) {
                return 'Ð´Ð½Ñ';
            } else {
                return 'Ð²ÐµÑ‡Ð¾Ñ€Ð°';
            }
        },
        ordinalParse: /\d{1,2}-(Ð¹|Ð³Ð¾)/,
        ordinal: function (number, period) {
            switch (period) {
            case 'M':
            case 'd':
            case 'DDD':
            case 'w':
            case 'W':
                return number + '-Ð¹';
            case 'D':
                return number + '-Ð³Ð¾';
            default:
                return number;
            }
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : uzbek (uz)
    //! author : Sardor Muminov : https://github.com/muminoff

    var uz = _moment__default.defineLocale('uz', {
        months : 'ÑÐ½Ð²Ð°Ñ€ÑŒ_Ñ„ÐµÐ²Ñ€Ð°Ð»ÑŒ_Ð¼Ð°Ñ€Ñ‚_Ð°Ð¿Ñ€ÐµÐ»ÑŒ_Ð¼Ð°Ð¹_Ð¸ÑŽÐ½ÑŒ_Ð¸ÑŽÐ»ÑŒ_Ð°Ð²Ð³ÑƒÑÑ‚_ÑÐµÐ½Ñ‚ÑÐ±Ñ€ÑŒ_Ð¾ÐºÑ‚ÑÐ±Ñ€ÑŒ_Ð½Ð¾ÑÐ±Ñ€ÑŒ_Ð´ÐµÐºÐ°Ð±Ñ€ÑŒ'.split('_'),
        monthsShort : 'ÑÐ½Ð²_Ñ„ÐµÐ²_Ð¼Ð°Ñ€_Ð°Ð¿Ñ€_Ð¼Ð°Ð¹_Ð¸ÑŽÐ½_Ð¸ÑŽÐ»_Ð°Ð²Ð³_ÑÐµÐ½_Ð¾ÐºÑ‚_Ð½Ð¾Ñ_Ð´ÐµÐº'.split('_'),
        weekdays : 'Ð¯ÐºÑˆÐ°Ð½Ð±Ð°_Ð”ÑƒÑˆÐ°Ð½Ð±Ð°_Ð¡ÐµÑˆÐ°Ð½Ð±Ð°_Ð§Ð¾Ñ€ÑˆÐ°Ð½Ð±Ð°_ÐŸÐ°Ð¹ÑˆÐ°Ð½Ð±Ð°_Ð–ÑƒÐ¼Ð°_Ð¨Ð°Ð½Ð±Ð°'.split('_'),
        weekdaysShort : 'Ð¯ÐºÑˆ_Ð”ÑƒÑˆ_Ð¡ÐµÑˆ_Ð§Ð¾Ñ€_ÐŸÐ°Ð¹_Ð–ÑƒÐ¼_Ð¨Ð°Ð½'.split('_'),
        weekdaysMin : 'Ð¯Ðº_Ð”Ñƒ_Ð¡Ðµ_Ð§Ð¾_ÐŸÐ°_Ð–Ñƒ_Ð¨Ð°'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'D MMMM YYYY, dddd HH:mm'
        },
        calendar : {
            sameDay : '[Ð‘ÑƒÐ³ÑƒÐ½ ÑÐ¾Ð°Ñ‚] LT [Ð´Ð°]',
            nextDay : '[Ð­Ñ€Ñ‚Ð°Ð³Ð°] LT [Ð´Ð°]',
            nextWeek : 'dddd [ÐºÑƒÐ½Ð¸ ÑÐ¾Ð°Ñ‚] LT [Ð´Ð°]',
            lastDay : '[ÐšÐµÑ‡Ð° ÑÐ¾Ð°Ñ‚] LT [Ð´Ð°]',
            lastWeek : '[Ð£Ñ‚Ð³Ð°Ð½] dddd [ÐºÑƒÐ½Ð¸ ÑÐ¾Ð°Ñ‚] LT [Ð´Ð°]',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'Ð¯ÐºÐ¸Ð½ %s Ð¸Ñ‡Ð¸Ð´Ð°',
            past : 'Ð‘Ð¸Ñ€ Ð½ÐµÑ‡Ð° %s Ð¾Ð»Ð´Ð¸Ð½',
            s : 'Ñ„ÑƒÑ€ÑÐ°Ñ‚',
            m : 'Ð±Ð¸Ñ€ Ð´Ð°ÐºÐ¸ÐºÐ°',
            mm : '%d Ð´Ð°ÐºÐ¸ÐºÐ°',
            h : 'Ð±Ð¸Ñ€ ÑÐ¾Ð°Ñ‚',
            hh : '%d ÑÐ¾Ð°Ñ‚',
            d : 'Ð±Ð¸Ñ€ ÐºÑƒÐ½',
            dd : '%d ÐºÑƒÐ½',
            M : 'Ð±Ð¸Ñ€ Ð¾Ð¹',
            MM : '%d Ð¾Ð¹',
            y : 'Ð±Ð¸Ñ€ Ð¹Ð¸Ð»',
            yy : '%d Ð¹Ð¸Ð»'
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : vietnamese (vi)
    //! author : Bang Nguyen : https://github.com/bangnk

    var vi = _moment__default.defineLocale('vi', {
        months : 'thÃ¡ng 1_thÃ¡ng 2_thÃ¡ng 3_thÃ¡ng 4_thÃ¡ng 5_thÃ¡ng 6_thÃ¡ng 7_thÃ¡ng 8_thÃ¡ng 9_thÃ¡ng 10_thÃ¡ng 11_thÃ¡ng 12'.split('_'),
        monthsShort : 'Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12'.split('_'),
        weekdays : 'chá»§ nháº­t_thá»© hai_thá»© ba_thá»© tÆ°_thá»© nÄƒm_thá»© sÃ¡u_thá»© báº£y'.split('_'),
        weekdaysShort : 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
        weekdaysMin : 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM [nÄƒm] YYYY',
            LLL : 'D MMMM [nÄƒm] YYYY HH:mm',
            LLLL : 'dddd, D MMMM [nÄƒm] YYYY HH:mm',
            l : 'DD/M/YYYY',
            ll : 'D MMM YYYY',
            lll : 'D MMM YYYY HH:mm',
            llll : 'ddd, D MMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[HÃ´m nay lÃºc] LT',
            nextDay: '[NgÃ y mai lÃºc] LT',
            nextWeek: 'dddd [tuáº§n tá»›i lÃºc] LT',
            lastDay: '[HÃ´m qua lÃºc] LT',
            lastWeek: 'dddd [tuáº§n rá»“i lÃºc] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : '%s tá»›i',
            past : '%s trÆ°á»›c',
            s : 'vÃ i giÃ¢y',
            m : 'má»™t phÃºt',
            mm : '%d phÃºt',
            h : 'má»™t giá»',
            hh : '%d giá»',
            d : 'má»™t ngÃ y',
            dd : '%d ngÃ y',
            M : 'má»™t thÃ¡ng',
            MM : '%d thÃ¡ng',
            y : 'má»™t nÄƒm',
            yy : '%d nÄƒm'
        },
        ordinalParse: /\d{1,2}/,
        ordinal : function (number) {
            return number;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : chinese (zh-cn)
    //! author : suupic : https://github.com/suupic
    //! author : Zeno Zeng : https://github.com/zenozeng

    var zh_cn = _moment__default.defineLocale('zh-cn', {
        months : 'ä¸€æœˆ_äºŒæœˆ_ä¸‰æœˆ_å››æœˆ_äº”æœˆ_å…­æœˆ_ä¸ƒæœˆ_å…«æœˆ_ä¹æœˆ_åæœˆ_åä¸€æœˆ_åäºŒæœˆ'.split('_'),
        monthsShort : '1æœˆ_2æœˆ_3æœˆ_4æœˆ_5æœˆ_6æœˆ_7æœˆ_8æœˆ_9æœˆ_10æœˆ_11æœˆ_12æœˆ'.split('_'),
        weekdays : 'æ˜ŸæœŸæ—¥_æ˜ŸæœŸä¸€_æ˜ŸæœŸäºŒ_æ˜ŸæœŸä¸‰_æ˜ŸæœŸå››_æ˜ŸæœŸäº”_æ˜ŸæœŸå…­'.split('_'),
        weekdaysShort : 'å‘¨æ—¥_å‘¨ä¸€_å‘¨äºŒ_å‘¨ä¸‰_å‘¨å››_å‘¨äº”_å‘¨å…­'.split('_'),
        weekdaysMin : 'æ—¥_ä¸€_äºŒ_ä¸‰_å››_äº”_å…­'.split('_'),
        longDateFormat : {
            LT : 'Ahç‚¹mmåˆ†',
            LTS : 'Ahç‚¹måˆ†sç§’',
            L : 'YYYY-MM-DD',
            LL : 'YYYYå¹´MMMDæ—¥',
            LLL : 'YYYYå¹´MMMDæ—¥Ahç‚¹mmåˆ†',
            LLLL : 'YYYYå¹´MMMDæ—¥ddddAhç‚¹mmåˆ†',
            l : 'YYYY-MM-DD',
            ll : 'YYYYå¹´MMMDæ—¥',
            lll : 'YYYYå¹´MMMDæ—¥Ahç‚¹mmåˆ†',
            llll : 'YYYYå¹´MMMDæ—¥ddddAhç‚¹mmåˆ†'
        },
        meridiemParse: /å‡Œæ™¨|æ—©ä¸Š|ä¸Šåˆ|ä¸­åˆ|ä¸‹åˆ|æ™šä¸Š/,
        meridiemHour: function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'å‡Œæ™¨' || meridiem === 'æ—©ä¸Š' ||
                    meridiem === 'ä¸Šåˆ') {
                return hour;
            } else if (meridiem === 'ä¸‹åˆ' || meridiem === 'æ™šä¸Š') {
                return hour + 12;
            } else {
                // 'ä¸­åˆ'
                return hour >= 11 ? hour : hour + 12;
            }
        },
        meridiem : function (hour, minute, isLower) {
            var hm = hour * 100 + minute;
            if (hm < 600) {
                return 'å‡Œæ™¨';
            } else if (hm < 900) {
                return 'æ—©ä¸Š';
            } else if (hm < 1130) {
                return 'ä¸Šåˆ';
            } else if (hm < 1230) {
                return 'ä¸­åˆ';
            } else if (hm < 1800) {
                return 'ä¸‹åˆ';
            } else {
                return 'æ™šä¸Š';
            }
        },
        calendar : {
            sameDay : function () {
                return this.minutes() === 0 ? '[ä»Šå¤©]Ah[ç‚¹æ•´]' : '[ä»Šå¤©]LT';
            },
            nextDay : function () {
                return this.minutes() === 0 ? '[æ˜Žå¤©]Ah[ç‚¹æ•´]' : '[æ˜Žå¤©]LT';
            },
            lastDay : function () {
                return this.minutes() === 0 ? '[æ˜¨å¤©]Ah[ç‚¹æ•´]' : '[æ˜¨å¤©]LT';
            },
            nextWeek : function () {
                var startOfWeek, prefix;
                startOfWeek = _moment__default().startOf('week');
                prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[ä¸‹]' : '[æœ¬]';
                return this.minutes() === 0 ? prefix + 'dddAhç‚¹æ•´' : prefix + 'dddAhç‚¹mm';
            },
            lastWeek : function () {
                var startOfWeek, prefix;
                startOfWeek = _moment__default().startOf('week');
                prefix = this.unix() < startOfWeek.unix()  ? '[ä¸Š]' : '[æœ¬]';
                return this.minutes() === 0 ? prefix + 'dddAhç‚¹æ•´' : prefix + 'dddAhç‚¹mm';
            },
            sameElse : 'LL'
        },
        ordinalParse: /\d{1,2}(æ—¥|æœˆ|å‘¨)/,
        ordinal : function (number, period) {
            switch (period) {
            case 'd':
            case 'D':
            case 'DDD':
                return number + 'æ—¥';
            case 'M':
                return number + 'æœˆ';
            case 'w':
            case 'W':
                return number + 'å‘¨';
            default:
                return number;
            }
        },
        relativeTime : {
            future : '%så†…',
            past : '%så‰',
            s : 'å‡ ç§’',
            m : '1 åˆ†é’Ÿ',
            mm : '%d åˆ†é’Ÿ',
            h : '1 å°æ—¶',
            hh : '%d å°æ—¶',
            d : '1 å¤©',
            dd : '%d å¤©',
            M : '1 ä¸ªæœˆ',
            MM : '%d ä¸ªæœˆ',
            y : '1 å¹´',
            yy : '%d å¹´'
        },
        week : {
            // GB/T 7408-1994ã€Šæ•°æ®å…ƒå’Œäº¤æ¢æ ¼å¼Â·ä¿¡æ¯äº¤æ¢Â·æ—¥æœŸå’Œæ—¶é—´è¡¨ç¤ºæ³•ã€‹ä¸ŽISO 8601:1988ç­‰æ•ˆ
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

    //! moment.js locale configuration
    //! locale : traditional chinese (zh-tw)
    //! author : Ben : https://github.com/ben-lin

    var zh_tw = _moment__default.defineLocale('zh-tw', {
        months : 'ä¸€æœˆ_äºŒæœˆ_ä¸‰æœˆ_å››æœˆ_äº”æœˆ_å…­æœˆ_ä¸ƒæœˆ_å…«æœˆ_ä¹æœˆ_åæœˆ_åä¸€æœˆ_åäºŒæœˆ'.split('_'),
        monthsShort : '1æœˆ_2æœˆ_3æœˆ_4æœˆ_5æœˆ_6æœˆ_7æœˆ_8æœˆ_9æœˆ_10æœˆ_11æœˆ_12æœˆ'.split('_'),
        weekdays : 'æ˜ŸæœŸæ—¥_æ˜ŸæœŸä¸€_æ˜ŸæœŸäºŒ_æ˜ŸæœŸä¸‰_æ˜ŸæœŸå››_æ˜ŸæœŸäº”_æ˜ŸæœŸå…­'.split('_'),
        weekdaysShort : 'é€±æ—¥_é€±ä¸€_é€±äºŒ_é€±ä¸‰_é€±å››_é€±äº”_é€±å…­'.split('_'),
        weekdaysMin : 'æ—¥_ä¸€_äºŒ_ä¸‰_å››_äº”_å…­'.split('_'),
        longDateFormat : {
            LT : 'Ahé»žmmåˆ†',
            LTS : 'Ahé»žmåˆ†sç§’',
            L : 'YYYYå¹´MMMDæ—¥',
            LL : 'YYYYå¹´MMMDæ—¥',
            LLL : 'YYYYå¹´MMMDæ—¥Ahé»žmmåˆ†',
            LLLL : 'YYYYå¹´MMMDæ—¥ddddAhé»žmmåˆ†',
            l : 'YYYYå¹´MMMDæ—¥',
            ll : 'YYYYå¹´MMMDæ—¥',
            lll : 'YYYYå¹´MMMDæ—¥Ahé»žmmåˆ†',
            llll : 'YYYYå¹´MMMDæ—¥ddddAhé»žmmåˆ†'
        },
        meridiemParse: /æ—©ä¸Š|ä¸Šåˆ|ä¸­åˆ|ä¸‹åˆ|æ™šä¸Š/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'æ—©ä¸Š' || meridiem === 'ä¸Šåˆ') {
                return hour;
            } else if (meridiem === 'ä¸­åˆ') {
                return hour >= 11 ? hour : hour + 12;
            } else if (meridiem === 'ä¸‹åˆ' || meridiem === 'æ™šä¸Š') {
                return hour + 12;
            }
        },
        meridiem : function (hour, minute, isLower) {
            var hm = hour * 100 + minute;
            if (hm < 900) {
                return 'æ—©ä¸Š';
            } else if (hm < 1130) {
                return 'ä¸Šåˆ';
            } else if (hm < 1230) {
                return 'ä¸­åˆ';
            } else if (hm < 1800) {
                return 'ä¸‹åˆ';
            } else {
                return 'æ™šä¸Š';
            }
        },
        calendar : {
            sameDay : '[ä»Šå¤©]LT',
            nextDay : '[æ˜Žå¤©]LT',
            nextWeek : '[ä¸‹]ddddLT',
            lastDay : '[æ˜¨å¤©]LT',
            lastWeek : '[ä¸Š]ddddLT',
            sameElse : 'L'
        },
        ordinalParse: /\d{1,2}(æ—¥|æœˆ|é€±)/,
        ordinal : function (number, period) {
            switch (period) {
            case 'd' :
            case 'D' :
            case 'DDD' :
                return number + 'æ—¥';
            case 'M' :
                return number + 'æœˆ';
            case 'w' :
            case 'W' :
                return number + 'é€±';
            default :
                return number;
            }
        },
        relativeTime : {
            future : '%så…§',
            past : '%så‰',
            s : 'å¹¾ç§’',
            m : 'ä¸€åˆ†é˜',
            mm : '%dåˆ†é˜',
            h : 'ä¸€å°æ™‚',
            hh : '%då°æ™‚',
            d : 'ä¸€å¤©',
            dd : '%då¤©',
            M : 'ä¸€å€‹æœˆ',
            MM : '%då€‹æœˆ',
            y : 'ä¸€å¹´',
            yy : '%då¹´'
        }
    });

    var moment_with_locales = _moment__default;
    moment_with_locales.locale('en');

    return moment_with_locales;

}));
