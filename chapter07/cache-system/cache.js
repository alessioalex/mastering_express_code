"use strict";

var ms = require('ms');
var cache = {};

var isEmpty = function(val) {
  return (val === undefined || val === null);
};

// generate a unique string for a set of arguments
var getHash = function(key, args, prefix) {
  prefix = prefix || '';
  return prefix + (key || args.toString());
};

// execute all functions with the `args` array
var callFunctions = function(functionsArray, args) {
  functionsArray.forEach(function(cb) {
    cb.apply(null, args);
  });
};

cache.remember = function(originalFunc, opts) {
  opts = opts || {};

  // default ttl one day
  var ttl = opts.ttl || ms('24h');
  // if the function is called multiple times with the same arguments
  // (multiple funcs trying to access the same key) before finishing its task
  // (executing the original function and adding the item to the cache),
  // make sure to only call the original && cache.set functions once
  // and after that execute all pending callbacks
  var pendingFuncs = {};

  return function() {
    var args = Array.prototype.slice.call(arguments);
    // extract the callback from the function's arguments (should be the last one)
    var callback = args.pop();
    var key = getHash(opts.key, args, opts.prefix);

    // try to fetch the data from the cache
    cache.get(key, function(err, val) {
      if (err) { return callback(err); }

      if (isEmpty(val)) {
        // if there are pending functions for the key then push this callback
        // to the array and return, because the first function call will be
        // taking care of the rest
        if (pendingFuncs['get_' + key]) {
          return pendingFuncs['get_' + key].push(callback);
        } else {
          // since it's the first function call for `key`
          // we will continue to call the original function and add the value
          // to the cache (if there's no error and the value is not empty)
          pendingFuncs['get_' + key] = [callback];
        }

        // remember we have the arguments that we need to pass to the original
        // function, but without the callback
        // now we are adding our own callback (that will execute all the pending functions once called)
        // to the `args` array (so we can use `originalFunc.apply` later)
        args.push(function(err, value) {
          // if there's an error or if the value wasn't found,
          // call all functions early
          if (err || isEmpty(value)) {
            return callFunctions(pendingFuncs['get_' + key], [err]);
          }

          // value found, add it to the cache and execute pending functions
          cache.set(key, value, ttl, function(err) {
            callFunctions(pendingFuncs['get_' + key], [err, value]);
            delete pendingFuncs['get_' + key];
          });
        });

        originalFunc.apply(null, args);
      } else {
        // data found in cache, no need to get it by using the original function
        callback(null, val);
      }
    });
  };
};

cache.forget = function(originalFunc, opts) {
  opts = opts || {};

  // default ttl one day
  var ttl = opts.ttl || ms('24h');
  // if the function is called multiple times with the same arguments
  // (multiple funcs trying to access the same key) before finishing its task
  // (executing the original function and removing the item from the cache),
  // make sure to only call the original && cache.del functions once
  // and after that execute all pending callbacks
  var pendingFuncs = {};

  return function() {
    var args = Array.prototype.slice.call(arguments);
    // extract the callback from the function's arguments (should be the last one)
    var callback = args.pop();
    var key = getHash(opts.key, args, opts.prefix);

    // if there are pending functions for the key then push this callback
    // to the array and return, because the first function call will be
    // taking care of the rest
    if (pendingFuncs['del_' + key]) {
      return pendingFuncs['del_' + key].push(callback);
    } else {
      // since it's the first function call for `key`
      // we will continue to remove the value from the cache and call the original function
      pendingFuncs['del_' + key] = [callback];
    }

    // first delete the value from the cache
    cache.del(key, function(err) {
      // if there's an error, execute all pending functions early
      // but not the original function
      if (err) {
        callFunctions(pendingFuncs['del_' + key], [err]);
        delete pendingFuncs['del_' + key];
      } else {
        // execute the original function and all the pending functions after
        args.push(function(err) {
          callFunctions(pendingFuncs['del_' + key], [err]);
          delete pendingFuncs['del_' + key];
        });

        originalFunc.apply(null, args);
      }
    });
  };
};

var store = {};
cache.set = function(key, val, ttl, cb) {
  store['prefix-' + key] = val;
  // keep it async
  setImmediate(function() {
    cb();
  });
};
cache.get = function(key, cb) {
  // keep it async
  setImmediate(function() {
    cb(null, store['prefix-' + key]);
  });
};
cache.del = function(key, cb) {
  // keep it async
  setImmediate(function() {
    delete store['prefix-' + key];
    cb();
  });
};

var users = ['John Doe', 'Jane Doe'];
var getUser = function(userId, cb) {
  console.log('getUser CALLED');
  return setTimeout(function() {
    cb(null, users[userId]);
  }, 300);
};

var removeUser = function(userId, cb) {
  console.log('removeUser CALLED');
  return setTimeout(function() {
    delete users[userId];
    cb();
  }, 300);
};

getUser = cache.remember(getUser);
removeUser = cache.forget(removeUser);

getUser(0, function(err, user) {
  console.log('user 0', user);

  // much faster n)w, retrieved value from cache
  getUser(0, function(err, user) {
    console.log('user 0', user);

    // this one's slow, it isn't cached yet
    getUser(1, function(err, user) {
      console.log('user 1', user);

      removeUser(1, function(err) {
        cache.get(1, function(err, user) {
          console.log('user 1 should be undefined now:', user);
        });
      });
    });
  });
});
