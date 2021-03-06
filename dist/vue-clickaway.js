/**
 * vue plugin to handle clicking away from the element
 * Original code from https://github.com/simplesmiler/vue-clickaway/blob/master/dist/vue-clickaway.js
 *
 * The original code has been modified to be usable in browser environment with requirejs. The diff can be viewed
 * at https://github.com/dmtri/vue-clickaway/commit/582561bcc07730b02c1903f2174c8ce6fbd1c5af
 *
 * @author github:simplesmiler, modified by Duc Trinh
 * @date Spring 2017
 * All rights reserved.
 */

define(function (require) {
  'use strict';

  var $            = require('jquery'),
      Vue          = require('vue');

    var HANDLER = '_vue_clickaway_handler';

    var bind = function(el, binding) {
      unbind(el);

      var callback = binding.value;
      if (typeof callback !== 'function') {
        if ('development' !== 'production') {
          Vue.util.warn(
            'v-' + binding.name + '="' +
            binding.expression + '" expects a function value, ' +
            'got ' + callback
          );
        }
        return;
      }

      // @NOTE: Vue binds directives in microtasks, while UI events are dispatched
      //        in macrotasks. This causes the listener to be set up before
      //        the "origin" click event (the event that lead to the binding of
      //        the directive) arrives at the document root. To work around that,
      //        we ignore events until the end of the "initial" macrotask.
      // @REFERENCE: https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
      // @REFERENCE: https://github.com/simplesmiler/vue-clickaway/issues/8
      var initialMacrotaskEnded = false;
      setTimeout(function() {
        initialMacrotaskEnded = true;
      }, 0);

      el[HANDLER] = function(ev) {
        // @NOTE: IE 5.0+
        // @REFERENCE: https://developer.mozilla.org/en/docs/Web/API/Node/contains
        if (initialMacrotaskEnded && !el.contains(ev.target)) {
          return callback(ev);
        }
      };

      document.documentElement.addEventListener('click', el[HANDLER], false);
    };

    var unbind = function(el) {
      document.documentElement.removeEventListener('click', el[HANDLER], false);
      delete el[HANDLER];
    };

/**
 * Initialize onClickaway directive here
 */
    var initializeClickawayDirective = function() {
      Vue.directive('onClickaway', {
        bind: bind,
        update: function(el, binding) {
          if (binding.value === binding.oldValue) return;
          bind(el, binding);
        },
        unbind: unbind,
      });
    };

  return {
    init: function() {
      initializeClickawayDirective();
    }
  };
})
