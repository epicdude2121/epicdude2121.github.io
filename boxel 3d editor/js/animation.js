// This class utilizes tween.js within /libraries
class Animation {
    constructor() {
        
    }

    update(delta) {

    }

    init(options) {
        options.duration = (options.duration) ? options.duration : 250;
        options.fps = (options.fps) ? options.fps : 60;
        options.easing = (options.easing) ? options.easing : TWEEN.Easing.Quadratic.InOut;
        options.update = (options.update) ? options.update : function() {};
        options.callback = (options.callback) ? options.callback : function() {};
    }

    tween(before, after, options = {}) {
        // Initialize tween interval with asynchronous fps
        this.init(options);
        var interval = setInterval(
            function() { 
                if (TWEEN.update()) {
                    TWEEN.update();
                } 
                else {
                    TWEEN.remove(tween);
                    clearInterval(interval);
                    options.callback();
                }
            }, 1 / options.fps);

        // Initialize tween
        var tween = new TWEEN.Tween(before).to(after, options.duration).easing(options.easing).onUpdate(options.update).start();
    }
}