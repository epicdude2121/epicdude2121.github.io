class Grapple extends Cube {
    constructor(options = {}) {
        super(options);
        this.body.class = 'grapple';

        // Add bounce sensor
        this.sensor = Matter.Bodies.rectangle(0, 0, options.scaleX, options.scaleY, { isSensor: true, density: 0, class: 'sensor' });
        Matter.Body.setParts(this.body, [this.hitbox, this.sensor]);
        
        // Update body properties
        this.setScale({ x: 16, y: 16, z: 16 });
        this.shapes.removeAllShapes();
        this.addShapes(options);
    }

    addShapes(options) {
        var u = (options.scaleZ / 8); // unit size
        this.shapes.addCube({ x: 0, y: 0, z: -u, scaleX: 1, scaleY: 1, scaleZ: (u * 7), color: '#0287ef' }); // Blue Box
        
        // Box bottom left
        this.shapes.addExtrusion({
            position: { x: 0, y: 0, z: (u * 3) },
            points: [{ x: 0, y: 0 }, { x: 0, y: -(u * 3) }, { x: -(u * 3), y: -(u * 3) }, { x: -(u * 3), y: 0 }],
            depth: u,
            color: '#fff'
        });

        // Box diagonal center
        this.shapes.addExtrusion({
            position: { x: 0, y: 0, z: (u * 3) },
            points: [{ x: -(u * 1), y: 0 }, { x: 0, y: -(u * 1) }, { x: (u * 2), y: (u * 1) }, { x: (u * 1), y: (u * 2) }],
            depth: u,
            color: '#fff'
        });

        // Triangle top right
        this.shapes.addExtrusion({
            position: { x: 0, y: 0, z: (u * 3) },
            points: [{ x: 0, y: (u * 3) }, { x: (u * 3), y: (u * 3) }, { x: (u * 3), y: 0 }],
            depth: u,
            color: '#fff'
        });
    }
}