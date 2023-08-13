class Spike extends Cube {
    constructor(options = {}) {
        super(options);
        this.body.class = 'spike';

        // Add bounce sensor
        this.sensor = Matter.Bodies.rectangle(0, -0.6, options.scaleX * 0.6, options.scaleY * 0.2, { isSensor: true, density: 0, class: 'sensor' });
        Matter.Body.setParts(this.body, [this.hitbox, this.sensor]);

        this.setScale({ x: 16, y: 16, z: 16 });
        this.shapes.removeAllShapes();
        this.addShapes(options);
    }

    addShapes(options) {
        var u = (options.scaleZ * 0.25); // unit size
        this.shapes.addCone({ x: -(u * 1), y: (u * 0), z: (u * 1), scaleX: (u * 2), scaleY: (u * 4) });
        this.shapes.addCone({ x: -(u * 1), y: (u * 0), z: -(u * 1), scaleX: (u * 2), scaleY: (u * 4) });
        this.shapes.addCone({ x: (u * 1), y: (u * 0), z: (u * 1), scaleX: (u * 2), scaleY: (u * 4) });
        this.shapes.addCone({ x: (u * 1), y: (u * 0), z: -(u * 1), scaleX: (u * 2), scaleY: (u * 4) });
    }
}