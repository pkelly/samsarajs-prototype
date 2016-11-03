define(function (require, exports, module) {
  var View = require('samsara/core/View');
  var Transform = require('samsara/core/Transform');
  var Surface = require('samsara/dom/Surface');
  var Transitionable = require('samsara/core/Transitionable');
  var SequentialLayout = require('samsara/layouts/SequentialLayout');

  var PhilView = View.extend({
    defaults: {
      springTransition : {
        curve: 'spring',
        period: 40,
        damping: 0.4
      },
      easingTransition : {
        curve : 'easeIn',
        duration : 500
      },
      inertiaTransition: {
        curve: 'inertia',
        drag: .1,
        velocity: -.1
      }
    },
    initialize: function (options) {
      this.springTransition = new Transitionable(0);
      this.easingTransition = new Transitionable(0);
      this.inertiaTransition = new Transitionable(0);
      this.firstRun = true;

      this.addBackground();
      this.addTitle();
      this.addRSVP();

      this.toggleAnimation(true);

    },

    onShow: function() {
      console.log('onShow!!!!!!!');
      this.toggleAnimation(true);
    },

    onHide: function() {
      console.log('Hide!!!!!!!');
      this.toggleAnimation(false);
    },

    toggleAnimation: function(isOn) {
      var target = isOn ? 1 : 0;
      this.easingTransition.set(target, this.options.easingTransition);
      this.inertiaTransition.set(target, this.options.easingTransition);

      var _this = this;
      var delay = this.firstRun ? 350 : 0;
      setTimeout(function() {
        _this.springTransition.set(target, _this.options.springTransition);
      }, delay);

      this.firstRun = false;
    },

    addBackground: function() {
      var opacity = new Transitionable(0);

      var van = new Surface({
        tagName : 'img',
        opacity: opacity,
        size: [false, false],
        aspectRatio : 9/16,
        attributes : {src : './assets/van-cropped.jpg'}
      });
      opacity.set(1, {curve: 'easeIn', duration: 500});
      this.add(van);
    },

    addTitle: function() {
      var title = new Surface({
        content: 'Laura and Andrew',
        size: [false, true],
        properties: {
          fontFamily: 'Source Sans Pro',
          fontSize: '28px',
          color: 'white',
          textTransform: 'uppercase',
          textAlign: 'center'
        },
        origin: [.5, 0]
      });

      var subtitle = new Surface({
        content: 'Ilkley, West Yorkshire',
        size: [false, true],
        properties: {
          fontFamily: 'Source Sans Pro',
          fontSize: '20px',
          color: 'white',
          textAlign: 'center'
        },
        origin: [.5, 0]
      });

      this.add({
        align: [.5, -.1],
        transform: this.springTransition.map(function (value) {
          return Transform.translateY(value * 80.0);
        })
      }).add(title);
      this.add({
        align: [.5, -.1],
        transform: this.springTransition.map(function (value) {
          return Transform.translateY(value * 120.0);
        })
      }).add(subtitle);
    },

    addRSVP: function() {
      var dateText = new Surface({
        content: 'Saturday, July 22, 2017<br>1:00 PM',
        size: [false, true],
        properties: {
          fontFamily: 'Source Sans Pro',
          fontSize: '20px',
          color: 'white',
          textAlign: 'center'
        },
        origin: [.5, 0]
      });
      this.add({
        align: [1.5, .3],
        transform: this.springTransition.map(function (value) {
          return Transform.translateX(value * -370.0);
        })
      }).add(dateText);
    }
  });
  module.exports = PhilView;
});
