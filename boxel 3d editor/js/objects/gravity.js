class Gravity extends Cube {
    constructor(options = {}) {
        super(options);
        this.body.class = 'gravity';
        
        // Update hitbox behavior
        this.hitbox.isSensor = true;
        this.hitbox.class = 'sensor';
        
        // Update body properties
        this.setScale({ x: 16, y: 16, z: 16 });
        this.shapes.removeAllShapes();
        this.shapes.setOpacities(0.5);
        this.addShapes(options);
    }

    addShapes(options) {
        var u = (options.scaleZ / 9); // unit size
        this.shapes.addCube({ x: 0, y: 0, z: -(u * 0.5), scaleX: 1, scaleY: 1, scaleZ: (u * 6), color: '#0287ef' }); // Blue Box
        this.shapes.addCube({ x: 0, y: -(u * 3), z: (u * 3), scaleX: (u * 7), scaleY: (u * 1), scaleZ: (u * 1), color: '#fff' }); // Line - horizontal
        this.shapes.addCube({ x: 0, y:  (u * 3), z: (u * 3), scaleX: (u * 5), scaleY: (u * 1), scaleZ: (u * 1), color: '#fff' }); // Box - horizontal top
        this.shapes.addCube({ x: 0, y: -(u * 1), z: (u * 3), scaleX: (u * 5), scaleY: (u * 1), scaleZ: (u * 1), color: '#fff' }); // Box - horizontal bottom
        this.shapes.addCube({ x: -(u * 2), y:  (u * 1), z: (u * 3), scaleX: (u * 1), scaleY: (u * 3), scaleZ: (u * 1), color: '#fff' }); // Box - vertical left
        this.shapes.addCube({ x:  (u * 2), y:  (u * 1), z: (u * 3), scaleX: (u * 1), scaleY: (u * 3), scaleZ: (u * 1), color: '#fff' }); // Box - vertical right
    }
}