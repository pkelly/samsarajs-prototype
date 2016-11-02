define(function (require, exports, module) {
    var Context = require('samsara/dom/Context');
    var ParallaxCats = require('./app/ParallaxCats');

    // Location of cat images
    var urls = [
        './assets/wedding1.jpg',
        './assets/wedding2.jpg',
        './assets/wedding3.jpg',
        './assets/wedding4.jpg',
        './assets/wedding5.jpg',
        './assets/wedding6.jpg',
        './assets/wedding7.jpg'
    ];

    // Create the parallaxCats view with specified options
    var parallaxCats = new ParallaxCats({
        size : [Math.min(400, window.innerWidth), undefined],
        origin: [.5, 0],
        skew : Math.PI / 25,
        parallaxAmount : 70,
        urls : urls
    });

    // Create a Samsara Context as the root of the render tree
    var context = new Context();

    // Add the parallaxCats to the context and center the origin point
    context
        .add({align : [.5,0]})
        .add(parallaxCats);

    // Mount the context to a DOM node
    context.mount(document.body);
});
