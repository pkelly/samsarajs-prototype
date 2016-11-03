define(function (require, exports, module) {
	module.exports = {
	  getRandomInt: function (min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    },
	       
	  getRandomRadian: function () {
      return Math.random() * 2 * Math.PI;
    }
	};
});