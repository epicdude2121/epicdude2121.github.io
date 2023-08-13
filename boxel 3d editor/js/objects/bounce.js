class Bounce extends Cube {
    constructor(options = {}) {
        super(options);
        this.body.class = 'bounce';

        // Add bounce sensor
        this.sensor = Matter.Bodies.rectangle(0, -0.6, options.scaleX * 0.6, options.scaleY * 0.2, { isSensor: true, density: 0, class: 'sensor' });
        Matter.Body.setParts(this.body, [this.hitbox, this.sensor]);

        this.setScale({ x: 16, y: 16, z: 16 });
        this.shapes.removeAllShapes();
        this.addShapes(options);
    }

    addShapes(options) {
        var u = (options.scaleZ * 0.2); // unit size
        this.shapes.addCube({ y: (u * 2), scaleX: (u * 5), scaleY: (u * 1), scaleZ: (u * 5), color: '#0287ef' });
        this.shapes.addCube({ y: (u * 1), scaleX: (u * 1), scaleY: (u * 1), scaleZ: (u * 1), color: '#ffffff' });
        this.shapes.addCube({ y: -(u * 1), scaleY: (u * 3), scaleZ: (u * 5), color: '#0287ef' });
    }
}