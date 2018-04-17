/* eslint-disable */
(function(){
  var root = this;
  // 保存之前的_的变量，防止覆盖
  var previousUnderscore = root._;

  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  var push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty;
  // 原生的方法
  var nativeIsArray = ArrayProto.isArray,
      nativeKeys = Object.keys,
      nativeBind = FuncProto.bind,
      nativeCreate = Object.create;
  // 空函数
  var Ctor = function() {};
  // 构造函数: 把一个obj构造为一个_的实例对象，对象的_wrapped属性保存着原来的obj
  var _ = function(obj) {
    if(obj instanceof _) return obj;
    if(!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  if(typeof exports !== 'undefined') {
    if(typeof module !== 'undefined' && moudule.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  _.VERSION = '1.8.3'

  var optimizeCb = function(func, context, argCount) {
    if(context === void 0) return func;
    switch(argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(contex, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other)
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection)
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection)
      };
    }
    return function(){
      return func.apply(context, arguments)
    };
  };

  var cb = function(value, context, argCount) {
    if(value == null) return _.identity;
    if(_.isFunction(value)) return optimizeCb(value, context, argCount);
    if(_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if(length < 2 || obj == null) return obj;
      for(var index = 1; index < length; index ++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for(var i = 0; i < l; i++) {
          var key = keys[i];
          if(!undefinedOnly || obj[key] ==- void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  var baseCreate = function(prototype) {
    if(!_.isObject(prototype)) return {};
    if(nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = collection.length;
    return typeof length == 'number' && length > 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  _.each = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if(isArrayLike(obj)) {
      for(i = 0, length = obj.length; i < length; i++){
        iteratee(obj[i], i, obj)
      }
    } else{
      var keys = _.keys(obj)
      for(i = 0, length = keys.length; i < length; i++){
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  _.map = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj);
    var length = (keys || obj).length;
    var results = Array(length);

    for(var i = 0; i < length; i++){
      var currentKey = keys ? keys[i]: i;
      results[i] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  }

  function createReduce(dir) {
    function iterator(obj ,iteratee, memo, keys, index, length) {
      for(; index >= 0 && index < length; index += dir){
        var currentKey = keys? keys[index]: index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4)
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length -1;
      if (arguments.length < 3) {
        memo = obj[keys? keys[index]: index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    }
  }

  _.reduce = _.foldl = _.inject = createReduce(1);
  _.reduceRight = _.foldr = createReduce(-1);
}.call(this));