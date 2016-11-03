define(function (require, exports, module) {
  var View = require('samsara/core/View');
  var Transform = require('samsara/core/Transform');
  var Surface = require('samsara/dom/Surface');
  var ContainerSurface = require('samsara/dom/ContainerSurface');
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
      this.springTransition = new Transitionable(1);
      this.easingTransition = new Transitionable(0);
      this.inertiaTransition = new Transitionable(0);
      this.firstRun = true;
      this.container = new ContainerSurface({
        size : [Math.min(450, window.innerWidth), undefined],
        origin: [.5, 0]
      });

      this.addBackground();
      this.addTitle();
      this.addRSVP();

      this.add({align: [0.5, 0]}).add(this.container);

      this.toggleAnimation(true);

    },

    onShow: function() {
      this.toggleAnimation(true);
    },

    onHide: function() {
      this.toggleAnimation(false);
    },

    toggleAnimation: function(isOn) {
      var target = isOn ? 0 : 1;
      this.easingTransition.set(target, this.options.easingTransition);
      this.inertiaTransition.set(target, this.options.easingTransition);

      var _this = this;
      var delay = this.firstRun ? 1000 : 0;
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
      this.container.add(van);
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
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center'
        },
        origin: [.5, 0]
      });

      this.container.add({
        align: [.5, .03],
        transform: this.springTransition.map(function (value) {
          return Transform.translateY(value * -400);
        })
      }).add(title);
      this.container.add({
        align: [.5, .1],
        transform: this.springTransition.map(function (value) {
          return Transform.translateY(value * -200);
        })
      }).add(subtitle);
    },

    addRSVP: function() {
      var dateText = new Surface({
        content: 'Saturday, July 22, 2017<br>1:00 PM',
        size: [false, true],
        properties: {
          fontFamily: 'Source Sans Pro',
          fontSize: '22px',
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center'
        },
        origin: [.5, 0]
      });

      var rsvpBtn = new Surface({
        tagName: 'button',
        classes: ['rsvp-link'],
        size: [true, true],
        content: '<span>RSVP</span>',
        origin: [.5, .5]
      });

      this.container.add({
        align: [.5, .2],
        transform: this.springTransition.map(function (value) {
          return Transform.translateX(value * 600);
        })
      }).add(dateText);

      this.container.add({
        align: [.5, .35],
        transform: this.springTransition.map(function (value) {
          return Transform.translateX(value * 400);
        })
      }).add(rsvpBtn);
    }
  });
  module.exports = PhilView;
});
