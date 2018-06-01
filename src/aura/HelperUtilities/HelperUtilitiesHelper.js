({
    //underscore utility methods
    isNull: function(obj) { return obj === null; },
    isUndefined: function(obj) { return $A.util.isUndefined(obj); },
    isUndefinedOrNull: function(obj) { return $A.util.isUndefinedOrNull(obj); },
    isEmpty: function(obj) { return $A.util.isEmpty(obj); },
    isNotEmpty: function(obj) { return !this.isEmpty(obj); },
    isObject: function(obj) { return $A.util.isObject(obj); },
    isArray: function(obj) { return $A.util.isArray(obj); },

    isTypeOf: function(obj, name){ return Object.prototype.toString.call(obj) === '[object ' + name + ']'; }, 
    isFunction: function(obj) { return this.isTypeOf(obj, "Function"); },
    isArguments: function(obj) { return this.isTypeOf(obj, "Arguments"); },
    isString: function(obj) { return this.isTypeOf(obj, "String"); },
    isNumber: function(obj) { return this.isTypeOf(obj, "Number"); },
    isBoolean: function(obj) { return this.isTypeOf(obj, "Boolean"); },
    isDate: function(obj) { return this.isTypeOf(obj, "Date"); },
    isRegExp: function(obj) { return this.isTypeOf(obj, "RegExp"); },
    isError: function(obj) { return this.isTypeOf(obj, "Error"); },
    isMap: function(obj) { return this.isTypeOf(obj, "Map"); },
    isSet: function(obj) { return this.isTypeOf(obj, "Set"); },
    isNaN: function(obj) { return this.isNumber(obj) && isNaN(obj); },

    identity: function(value) { return value; },
    constant: function(value){ return () => { return value; } },
    keys: function(obj) { return this.isObject(obj) ? Object.keys(obj) : []; },
    values: function(obj) { return this.isObject(obj) ? Object.values(obj) : []; },
    rest: function(obj, n) { return Array.prototype.slice.call(obj, n || 0); },
    hasOwnProperty: function(obj, path){ return Object.prototype.hasOwnProperty.call(obj, path); },
    property: function(key) { return (obj) => { return this.isObject(obj) && this.isString(key) ? obj[key] : null; } },
    propertyOf: function(obj) { return (key) => { return this.isObject(obj) && this.isString(key) ? obj[key] : null; } },
    put: function(obj, value, key){ if(this.isObject(obj) && this.isString(key)) obj[key] = value; return obj; },
    push: function(array, value){ if(this.isArray(array) && !this.isUndefinedOrNull(value)) array.push(value); return array; },
    ensureArray: function(list){ return (this.isArray(list) ? list : (!this.isUndefinedOrNull(list) ? [list] : [])); },

    isArrayLike: function(obj){
        if(this.isArray(obj)) return true;
        if(!this.isObject(obj)) return false;
        var length = obj.length, maxLength = Math.pow(2, 53) - 1;
        return typeof length == 'number' && length >= 0 && length <= maxLength;
    },
    callback: function(func, context){
        if(!this.isFunction(func)) func = this.identity;
        if(func.bound || func.aurabound) return func; 
        if(!this.isObject(context)) context = this;
        var boundFunc = function(){ return func.apply(context, arguments); };
        boundFunc.bound = true; return boundFunc;
    },
    auraCallback: function(func, context){
        if(!this.isFunction(func)) func = this.identity;
        if(func.aurabound) return func;
        var boundFunc = $A.getCallback(this.callback(func, context));
        boundFunc.aurabound = true; return boundFunc;
    },
    each: function(obj, iteratee, context){
        iteratee = this.callback(iteratee, context);
        if(this.isArrayLike(obj)) {
            for(var i = 0, length = obj.length; i < length; i++) {
                iteratee(obj[i], i, obj);
            }
        } else if(this.isObject(obj)){ 
            for(var i = 0, keys = this.keys(obj), length = keys.length; i < length; i++) {
                iteratee(obj[keys[i]], keys[i], obj);
            }
        }
    },
    map: function(obj, iteratee, context){ 
        iteratee = this.callback(iteratee, context);
        var results = this.isArrayLike(obj) ? [] : this.isObject(obj) ? {} : null; if(!results) return obj;
        this.each(obj, (value, key, obj) => { results[key] = iteratee(value, key, obj, results); });
        return results;
    },
    reduce: function(obj, iteratee, memo, context){
        iteratee = this.callback(iteratee, context);
        this.each(obj, (value, key, obj) => { memo = iteratee(memo, value, key, obj); });
        return memo;
    },
    findIndex: function(array, predicate, context){
        if(!this.isArray(array)) return null;
        predicate = this.callback(predicate, context);
        for(var i = 0, length = array.length; i < length; i++) {
            if(predicate(array[i], i, array)) return i;
        }
    },
    findKey: function(obj, predicate, context){
        if(!this.isObject(obj)) return null; 
        predicate = this.callback(predicate, context);
        for(var i = 0, keys = this.keys(obj), length = keys.length; i < length; i++) {
            var key = keys[i]; if(predicate(obj[key], key, obj)) return key;
        }
    },
    find: function(obj, predicate, context) {
        var finder = this.isArray(obj) ? this.findIndex : this.findKey;
        var key = finder.call(this, obj, predicate, context);
        if(!this.isUndefinedOrNull(key)) return obj[key];
    },
    filter: function(obj, predicate, context) { 
        predicate = this.callback(predicate, context);
        return this.reduce(obj, (results, value, key, obj) => { 
            if(predicate(value, key, obj, results)) results.push(value); 
            return results;
        }, []);
    },
    where: function(obj, attrs) {
        return this.filter(obj, this.matcher(attrs));
    },
    findWhere: function(obj, attrs) {
        return this.find(obj, this.matcher(attrs));
    },
    matcher: function(attrs) {
        return this.partial(this.isMatch, this, this.extend({}, attrs));
    },
    extend: function(obj){
        var args = this.rest(arguments, 1); 
        if(this.isArrayLike(obj)) obj = this.reduce(this.flatten(args), this.push, obj);
        if(this.isObject(obj)) this.each(args, this.partial(this.reduce, this, this.put, obj));
        return obj;
    },
    isMatch: function(obj, attrs) {
        if(!this.isObject(obj) || !this.isObject(attrs)) return false;
        for(var i = 0, keys = this.keys(attrs), length = keys.length; i < length; i++) {
            var key = keys[i]; if(!(key in obj) || obj[key] !== attrs[key]) return false; 
        }
        return true;
    },
    partial: function(func) {
        var rest = this.rest(arguments, 1); func = this.callback(func);
        return this.callback(function() { 
            var pos = 0, len = arguments.length; 
            var args = this.map(rest, (arg) => { return (pos < len && arg === this) ? arguments[pos++] : arg; });
            while(pos < len) { args.push(arguments[pos++]); }
            return func.apply(null, args); 
        });
    },
    has: function(obj, path){
        if(!this.isObject(obj)) return false; 
        if(this.isString(path)) return this.hasOwnProperty(obj, path);  
        if(this.isArray(path)) return !this.find(path, this.negate(this.partial(this.hasOwnProperty, obj)));
    },
    negate: function(predicate, context) {
        predicate = this.callback(predicate, context);
        return function() { return !predicate.apply(null, arguments); };
    },
    contains: function(obj, item) {
        if(this.isObject(obj)) obj = this.values(obj);
        return this.findIndex(obj, (value) => { return value === item; }) >= 0;
    },
    pluck: function(obj, key) {
        return this.isArrayLike(obj) ? this.map(obj, this.property(key)) : this.propertyOf(obj)(key);
    },
    size: function(obj) {
        return this.isArray(obj) ? obj.length : this.isObject(obj) ? this.keys(obj).length : 0;
    },
    toArray: function(obj){
        if (this.isArray(obj)) return Array.prototype.slice.call(obj);
        if (this.isArrayLike(obj)) return this.map(obj, this.identity);
        if(this.isObject(obj)) return this.values(obj);
        return [];
    },
    difference: function(array, rest) { 
        if(!this.isArray(rest)) rest = this.rest(arguments, 1);
        return this.filter(array, this.partial(this.negate(this.contains), rest));
    },
    without: function(array, rest){
        if(!this.isArray(rest)) rest = this.rest(arguments, 1);
        return this.difference(array, rest);
    },
    unique: function(array){
        return this.filter(array, (value, index, array, results) => { 
            return !this.contains(results, value); 
        });
    },
    flatten: function(){
        return this.reduce(arguments, (results, value) => {
            if(this.isUndefinedOrNull(value)) return results;
            if(!this.isArrayLike(value)) { results.push(value); return results; }
            return this.flatten.apply(null, results.concat(this.rest(value)));
        }, []);
    },
    compact: function(array) {
        return this.filter(array, Boolean);
    },
    union: function(){
        return this.unique(this.flatten(arguments));
    },
    intersection: function(){ 
        return this.reduce(arguments, (results, value) => { 
            return this.without(results, this.without(results, this.flatten(value))); 
        }, this.union(arguments));
    },
    bind: function(func, context) {
        func = this.callback(func, context); var args = this.rest(arguments, 2);
        return this.callback(function(){ return func.apply(null, this.extend(args, arguments)); });
    },
    delay: function(func, wait) {
        func = this.callback(func); var args = this.rest(arguments, 2);
        return setTimeout(() => { return func.apply(null, args); }, wait);
    },
    defer: function(func) {
        this.delay(func, 1);
    },
    wrap: function(func, wrapper) {
        return this.partial(wrapper, func);
    },
    compose: function() {
        var args = this.rest(arguments).reverse();
        return this.callback(function(){
            var result = this.callback(args[0]).apply(null, arguments);
            return this.reduce(this.rest(args, 1), (result, arg) => { 
                return this.callback(arg).call(this, result); 
            }, result);
        });
    },
    pick: function(obj, iteratee, context) {
        if(!this.isObject(obj)) return obj;
        var isfunc = this.isFunction(iteratee);
        var keys = isfunc ? this.keys(obj) : this.map(this.rest(arguments, 1), String);
        iteratee = isfunc ? this.callback(iteratee, context) : iteratee = this.constant(true);
        return this.reduce(keys, (result, key) => { 
            if(iteratee.call(this, obj[key], key, obj)) result[key] = obj[key]; 
            return result; 
        }, {});
    },
    omit: function(obj, iteratee, context){
        if(this.isFunction(iteratee)){
            iteratee = this.callback(this.negate(iteratee), context);
        } else {
            keys = this.map(this.rest(arguments, 1), String);
            iteratee = (value, key) => { return !this.contains(keys, key); };
        }
        return this.pick.call(this, obj, iteratee);
    },
    clone: function(obj) {
        return this.isArray(obj) ? obj.slice() : this.isObject(obj) ? this.extend({}, obj) : obj;
    },
    tap: function(obj, interceptor){
        this.callback(interceptor).call(this, obj); return obj;
    },
    functions: function(obj){
        return this.reduce(obj, (names, func, key) => { 
            if (this.isFunction(func)) names.push(key); return names; 
        }, []);
    },
    chain: function(obj){
        return new this.wrapper(obj);
    },
    wrapper: function(obj){
        this._wrapped = obj;
    },
    mapArray: function(){
        var map = {};
        return {
            put: (key, value) => {
                if(_.has(map, key)) map[key].push(value);
                else map[key] = [value];
                map[key] = this.unique(map[key]);
            },
            value: () => { return map },
            has: (key) => { return this.has(map, key); },
            isEmpty: () => { return this.isEmpty(map); }
        };
    },
    replaceAll: function(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    },

    //promise utility methods
    promise: function(callback, context){
        return this.wrapPromise(new Promise(this.callback(callback, context)));
    },
    deferred: function(){
        var defer = {};
        defer.promise = this.promise((resolve, reject) => { 
            defer.resolve = resolve; defer.reject = reject; 
        });
        return defer;
    },
    wrapPromise: function(promise){
        promise = { original: promise, originalThen: promise.then };
        promise.then = this.callback(function(){ 
            var nextPromise = promise.originalThen.apply(promise.original, this.map(arguments, this.auraCallback));
            return this.wrapPromise(nextPromise);
        });
        return promise;
    },
    deferredWithValue: function(value){
        var defer = this.deferred(); defer.resolve(value); 
        return defer.promise;
    },
    async: function(defers){
        defers = this.ensureArray(defers);
        return {
            push: (defer) => { defers.push(defer); },
            execute: () => { return Promise.all(defers); }
        };
    },
    sync: function(funcs){
        funcs = this.ensureArray(funcs);
        return {
            push: (func) => { funcs.push(func); },
            execute: (value) => {
                var defer = this.deferredWithValue();
                funcs.forEach((func) => { defer = defer.then(func); });
                return defer;
            }
        };
    },

    //other utility methods
    log: function(cmp){ 
        console.log.apply(console, this.extend([cmp.getConcreteComponent().getName()], this.rest(arguments, 1))); 
    },
    error: function(cmp){ 
        console.error.apply(console, this.extend([cmp.getConcreteComponent().getName()], this.rest(arguments, 1))); 
    },
    parseJSON: function(data, defaultValue){
        if(this.isString(data)) return JSON.parse(data); 
        else if(this.isUndefinedOrNull(data)) return defaultValue;
        else return data;
    },
    stringifyJSON: function(data){
        if(this.isUndefinedOrNull(data)) return '';
        else if(!this.isString(data)) return JSON.stringify(data, null, '\t'); 
        else return data;
    },
    split: function(str, char){
        var list = [];
        if(this.isString(str) && this.isString(char)){
            list = this.chain(str.split(char)).filter(this.isNotEmpty).map(this.trim).compact().value();
        }
        return list;
    },
    trim: function(str){
        return this.isString(str) ? str.trim() : str;
    }
})