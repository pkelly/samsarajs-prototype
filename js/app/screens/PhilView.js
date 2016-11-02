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

      var surface = new Surface({
         content : 'PhilView',
         size : [],
         properties : {background : '#3651FE', color: 'white'}
       });

      var opacity = new Transitionable(0);

      var van = new Surface({
        tagName : 'img',
        opacity: opacity,
        size: [false, false],
        aspectRatio : 9/16,
        attributes : {src : './assets/van-cropped.jpg'}
      });

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
        content: 'July 22, 2017 &emsp; Ilkley, West Yorkshire',
        size: [false, true],
        properties: {
          fontFamily: 'Source Sans Pro',
          fontSize: '20px',
          color: 'white',
          textAlign: 'center'
        },
        origin: [.5, 0]
      });

      opacity.set(1, {curve: 'easeIn', duration: 500});
      this.easingTransition.set(1, this.options.easingTransition);
      this.inertiaTransition.set(1, this.options.easingTransition);

      var _this = this;
      setTimeout(function() {
        _this.springTransition.set(1, _this.options.springTransition);
      }, 350);



      this.add(van);
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
      }
    });

  module.exports = PhilView;
});