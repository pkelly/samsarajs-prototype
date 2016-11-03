define(function (require, exports, module) {
    var Context = require('samsara/dom/Context');
    var PhotoStack = require('./app/PhotoStack');

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


    var photoStack = new PhotoStack({
        size : [window.innerWidth, window.innerHeight],
        //origin: [.5, 0],
        //skew : Math.PI / 25,
        //parallaxAmount : 70,
        urls : urls
    });

    var context = new Context();

    context
        .add(photoStack);

    context.mount(document.body);
});
