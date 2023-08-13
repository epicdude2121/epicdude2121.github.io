class Player extends Cube {
    constructor(options = {}) {
        super(options);
        this.body.class = 'player';

        // Update body
        this.setScale({ x: 16, y: 16, z: 16 });
        this.setStatic(false);
        this.setColors('#dc265a');
        this.setMode('jump'); // Default 'jump'
        this.mass = 5;
        this.allowJump = false;
        this.addLight('#dc265a', 2, 256, false);
        this.rope = new Rope();
    }

    jump() {
        if (this.mode == 'jump') {
            if (this.allowJump == true) {
                this.allowJump = false;
    
                // Define jump conditions
                var gravity = app.engine.world.gravity;
                var gravityAngle = (Math.PI / 2) - Matter.Vector.angle({ x: 0, y: 0 }, gravity);
                var velocity = this.body.velocity;
                var spinDirection = 1; // Default clockwise
                var angularVelocity = (Math.PI / 20);
                var forceScale = 0.025; // Default 0.025
                var force = {
                    x: -(gravity.x * forceScale * this.body.mass),
                    y: -(gravity.y * forceScale * this.body.mass)
                };
    
                // Rotate velocity angle back to 0 degrees, remove y velocity, then rotate back to gravity angle
                velocity = Matter.Vector.rotate(velocity, gravityAngle);
                velocity.y = 0; // Reset vertical velocity to 0
                spinDirection = velocity.x >= 0 ? 1 : -1;
                angularVelocity *= spinDirection;
                velocity = Matter.Vector.rotate(velocity, -gravityAngle);
    
                // Disable angular velocity at slower speeds
                if (this.body.speed < this.maxSpeed * 0.25) angularVelocity = 0;
    
                // Use engine to modulate object
                Matter.Body.setVelocity(this.body, velocity);
                Matter.Body.setAngularVelocity(this.body, angularVelocity);
                Matter.Body.applyForce(this.body, this.body.position, force);
            }
        }
    }

    addRope(mouse) {
        // Add constraint
        if (this.mode == 'grapple' && this.isFrozen() == false){
            var spacing = 4; // Smaller = more precise
            var length = 400; // How far to check for objects beyond p2
            var dx = mouse.x - this.position.x;
            var dy = mouse.y - this.position.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            var p1 = { x: this.position.x, y: -this.position.y };
            var p2 = { 
                x: (this.position.x + (mouse.x - this.position.x) * length / distance),
                y: -(this.position.y + (mouse.y - this.position.y) * length / distance)
            };

            // Clear existing rope to prevent duplicate chains
            this.removeRope();

            for (var i = 0; i < length; i += spacing) {
                var percent = i / (length);
                var point = { 
                    x: p1.x + ((p2.x - p1.x) * percent),
                    y: p1.y + ((p2.y - p1.y) * percent)
                };
                var collision = Matter.Query.point(app.engine.world.bodies, point);
                
                // Add rope if collision detected
                if (collision.length > 0 && collision[0].class != "player") {
                    // Check if collision is visible
                    if (app.level.getObjectByName(collision[0].name).visible == true) {
                        app.level.add(this.rope);
                        this.rope.addJoints(this.body, collision[0], point); // bodyA, bodyB, point
                        this.updateRope();
                        break;
                    }
                }
            }
        }
    }

    updateRope() {
        this.rope.updateJoints();
    }

    removeRope() {
        this.rope.removeJoints();
        app.level.remove(this.rope);
    }

    kill() {
        if (this.isFrozen() == false) {
            this.freeze(true);
            this.visible = false;
            this.killTimeout = setTimeout(function() { app.player.restart(); }, 1000); // Respawn in 1 second
            var rows = 4, cols = 4, layers = 4;
            var scale = { x: this.scale.x / cols, y: this.scale.y / rows, z: this.scale.z / layers }
            for (var row = -rows / 2; row < rows / 2; row++) {
                for (var col = -cols / 2; col < cols / 2; col++) {
                    var randAngle = randomNumber(0, 360 * (Math.PI / 180));
                    var particleData = {
                        color: this.color,
                        position: { 
                            x: this.position.x + (col * scale.x) + (scale.x / 2),
                            y: this.position.y + (row * scale.y) + (scale.y / 2), 
                            z: 0
                        },
                        rotation: { x: 0, y: 0, z: randAngle },
                        scale: { x: scale.x, y: scale.y, z: scale.z },
                        isStatic: false,
                        friction: 0
                    };
                    var particle = app.level.createObject('cube');
                    app.level.setObjectProperties(particle, particleData);
                    app.level.addObject(particle, app);
                    particle.isParticle = true;
                    particle.setColors(this.color);
                    Matter.Body.setVelocity(particle.body, this.body.velocity);
                }
            }
        }
    }

    cancelRestart() {
        // Clear potential timeout from player kill
        clearTimeout(this.killTimeout);
    }

    saveCheckpoint(position) {
        if (this.checkpoint == null) this.checkpoint = {};
        this.checkpoint.x = position.x;
        this.checkpoint.y = position.y;
        this.checkpoint.z = position.z;
    }

    removeCheckpoint() {
        this.checkpoint = null;
    }

    setPositionToCheckpoint() {
        if (this.checkpoint != null) {
            this.setPosition({
                x: this.position.x = this.checkpoint.x,
                y: this.position.y = this.checkpoint.y,
                z: this.position.z = this.checkpoint.z
            }, false);
        }
    }

    respawn(override = false) {
        // Override is used when a checkpoint set
        if (app.player.isFrozen() == true || override == true) {
            app.level.removeParticles(app);
            app.player.resetToOrigin();
            app.player.setPositionToCheckpoint();
        }
    }

    restart() {
        app.level.retryLevel(app, true);
    }

    finish() {
        var levelName = app.level.name;
        var time = app.timer.toString();
        var hasNewScore = app.storage.saveScore(levelName, time);
        var text = 'Finished!<br>Score: ' + time;

        // Show new record text
        if (hasNewScore == true) text += '<br><em>New record!</em>';

        app.play = false;
        app.ui.dialog.add({
            attributes: { id: 'finished' },
            text: text,
            inputs: [
                { attributes: { value: 'Retry', type: 'button' }, function: app.level.retryLevel, parameter: app },
                { attributes: { value: 'Continue', type: 'button' }, function: app.level.exitLevel, parameter: app }
            ]
        });
    }

    shrink() {
        this.setScale({ 
            x: this.scale.x / 2, 
            y: this.scale.y / 2, 
            z: this.scale.z / 2 
        }, false);
    }

    grow() {
        this.setScale({ 
            x: this.scale.x * 2, 
            y: this.scale.y * 2, 
            z: this.scale.z * 2 
        }, false);
    }

    renderSpeed(a) {
        var speed = this.body.speed;
        var maxSpeed = 10;
        var newSpeed = 0;
        var width = newSpeed + '%;';

        // Clamp speed and update style attribute
        if (speed > maxSpeed) speed = maxSpeed;
        newSpeed = (speed / maxSpeed) * 100;
        width = 'width: calc(' + newSpeed + '% - 8px)';
        a.document.getElementById('speed').setAttribute('style', width);
    }

    setSkin(skin, a = app) {
        if (skin.id == null || skin.url == null) skin = a.skins.default;
        
        // Add texture
        this.addTexture(skin.url);
    }

    reset() {
        app.updateGravity();
        this.setScale({ x: this.scaleOrigin.x, y: this.scaleOrigin.y, z: this.scaleOrigin.z }, false);
        this.setMode(this.modeOrigin, false);
    }

    addTexture(url) {
        var loader = new THREE.TextureLoader();
        loader.load(url, 
            function(texture){
                app.player.remove(app.player.skin); // Reset skin
                app.player.shapes.visible = false;
                //app.player.remove(app.player.shapes); // Permanently remove shapes mesh
                var geometry = new THREE.BoxGeometry(1, 1, 1);
                var material = new THREE.MeshPhongMaterial({ map: texture, transparent: true, opacity: 1 });
                app.player.shapes.setOpacities(0);
                app.player.skin = new THREE.Mesh(geometry, material);
                app.player.add(app.player.skin);
            },
            undefined,
            function(err) {
                console.error( 'An error happened: ' + err );
            }
        );
    }
}