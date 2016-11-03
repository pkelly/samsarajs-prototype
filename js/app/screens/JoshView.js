define(function (require, exports, module) {
    var View = require('samsara/core/View');
    var Transform = require('samsara/core/Transform');
    var Surface = require('samsara/dom/Surface');
    var Transitionable = require('samsara/core/Transitionable');
    var SequentialLayout = require('samsara/layouts/SequentialLayout');
    var ContainerSurface = require('samsara/dom/ContainerSurface');
    var Hallway = require('js/app/Hallway')

    var JoshView = View.extend({
        defaults: {
        },
        initialize: function (options) {

          var angle = new Transitionable(0);

          // Map the angle to a rotation `Transform`
          var rotation = angle.map(function (angle) {
              return Transform.rotateY(angle);
          });

          var rotation2 = angle.map(function (angle) {
              return Transform.rotateY(-angle);
          });

          var catpics =  [
          "http://i.imgur.com/jg0bGqX.jpg",
          "http://i.imgur.com/SOFXhd6.jpg",
          "http://i.imgur.com/OSxRCYM.jpg",
          "http://i.imgur.com/Tm4pKkK.jpg",
          "http://i.imgur.com/VzgR46g.jpg",
          "http://i.imgur.com/mcI4erD.jpg",
          "http://i.imgur.com/WejnJ5Q.jpg",
          "http://i.imgur.com/dK71XuW.jpg",
          "http://i.imgur.com/7slR9P8.jpg",
          "http://i.imgur.com/6UMzMmC.jpg",
          "http://i.imgur.com/25yHIkt.jpg",
          "http://i.imgur.com/xt7oU2u.jpg",
          "http://i.imgur.com/ywLBU3I.jpg",
          "http://i.imgur.com/oDlmNJh.jpg",
          "http://i.imgur.com/C0vahU8.jpg",
          "http://i.imgur.com/4clqUdj.jpg",
          "http://i.imgur.com/SApC1Vj.jpg",
          "http://i.imgur.com/N9ef4xz.jpg",
          "http://i.imgur.com/6c7QM8W.png",
          "https://i.imgur.com/B7zInR1.jpg",
          "http://i.imgur.com/9My4X1v.jpg",
          "http://i.imgur.com/x3VCr3e.jpg",
          "http://i.imgur.com/55PhhO1.jpg",
          "http://i.imgur.com/A6jU0wt.jpg",
          "http://i.imgur.com/T6fXmCU.jpg",
          "http://i.imgur.com/q9l2nc2.jpg",
          "http://i.imgur.com/rixAnAr.jpg",
          "http://i.imgur.com/ILEuLF0.jpg",
          "http://i.imgur.com/vloPjNa.jpg",
          "http://imgur.com/H2mby53.jpg",
          "http://i.imgur.com/eXUsDio.png",
          "http://i.imgur.com/41qSbCP.jpg"

          ]



          var hall = new Hallway({
            images: catpics.slice(0, Math.ceil(catpics.length * 1/3))
          });
          var hall2 = new Hallway({
            images: catpics.slice(Math.ceil(catpics.length * 1/3), Math.ceil(catpics.length * 2/3))
          });
          var hall3 = new Hallway({
            images: catpics.slice(Math.ceil(catpics.length * 2/3))
          });



          var myContext = this.myContext =  new ContainerSurface();

          setTimeout(function() {
            myContext.setPerspective(600);
          }, 0);

          myContext.add({
            transform: Transform.translateZ(100)
          }).add({
            transform: Transform.translateY(-400)
          }).add({
              align: [0.5, 0.5],
              transform : rotation
          }).add(hall);

          myContext.add({
            transform: Transform.translateZ(100)
          }).add({
            transform: Transform.translateY(-100)
          }).add({
              align: [0.5, 0.5],
              transform : rotation2
          }).add(hall2);

          myContext.add({
            transform: Transform.translateZ(100)
          }).add({
            transform: Transform.translateY(200)
          }).add({
              align: [0.5, 0.5],
              transform : rotation
          }).add(hall3);


          angle.set(1000000, {duration: 10000000000})
          this.add(myContext);
        },

    });

    module.exports = JoshView;
});
