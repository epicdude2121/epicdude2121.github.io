class App {
    constructor() {
        var a = this;
        a.window = window;
        a.document = document;
        a.BOX_SIZE = 16;
        a.engine = Matter.Engine.create();
        a.screenWidth = a.window.innerWidth;
        a.screenHeight = a.window.innerHeight;
        a.stats = new Stats();
        a.fps = new FPS();
        a.ui = new UIController();
        a.animation = new Animation();
        a.timer = new Timer();
        a.mouse = new Mouse();
        a.keyboard = new Keyboard();
        a.audio = new Audio();
        a.storage = new StorageManager();
        a.skins = new Skins();
        a.collision = new Collision();
        a.level = new Level();
        a.levelEditor = new LevelEditor();
        a.levelHistory = new LevelHistory();
        a.extension = new Extension();
        a.player = new Player({ x: 0, y: 0, z: 0 });
        a.play = false;
        a.fov = 110; // Default 75
        a.camera = new THREE.PerspectiveCamera(a.fov, a.screenWidth / a.screenHeight, 1, 2000);
        a.camera.tilt = 0;
        a.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
        a.scene = new THREE.Scene();
        a.light = new THREE.HemisphereLight('#ffffff', '#000000', 1);
        a.targetFPS = 60;
        a.interval = 1000 / a.targetFPS;
        a.then = new Date().getTime();
        a.now = a.then;
        a.delta = 0;

        // Add music to camera
        a.camera.add(a.audio);

        // Add lighting to scene
        a.light.position.set(0.25, 0.5, 1);
        a.scene.add(a.light);

        // Update stats
        a.stats.setMode(0);
        a.stats.domElement.classList.add('stats');
        a.document.body.appendChild(a.stats.domElement);

        // Update scene settings
        a.renderer.setSize(a.screenWidth, a.screenHeight);
        a.renderer.powerPreference = 'high-performance';
        a.renderer.shadowMap.enabled = true;
        a.camera.position.x = 0;
        a.camera.position.y = 0;
        a.camera.position.zDefault = 100;
        a.camera.position.z = a.camera.position.zDefault;
        a.document.body.appendChild(a.renderer.domElement);

        // Add level to scene
        a.scene.add(a.level);

        // Add event listeners and render app
        a.canvas = a.renderer.domElement;
        a.canvas.classList.add('hidden'); // Default hidden with CSS
        a.canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); }, false);
        a.canvas.addEventListener('mousedown', function(e){ a.mouse.mouseDown(e, a); }, false);
        a.canvas.addEventListener('mousemove', function(e){ a.mouse.mouseMove(e, a); }, false);
        a.canvas.addEventListener('mouseup', function(e){ a.mouse.mouseUp(e, a); }, false);
        a.canvas.addEventListener('wheel', function(e){ a.mouse.wheel(e, a); }, false);
        a.window.addEventListener('resize', function(e) { a.resizeWindow(e, a); });
        a.window.addEventListener('keydown', function(e) { a.keyboard.keyDown(e, a); });
        a.window.addEventListener('keyup', function(e) { a.keyboard.keyUp(e, a); });
        Matter.Events.on(a.engine, 'collisionStart', function(e) { a.collision.checkPlayerCollision(e, a); });
        a.update(null, a);
        a.render(null, a);
        a.updateSettings(null, a); // Update settings
    }

    render(e, a) {
        a.now = new Date().getTime();
        a.delta = a.now - a.then;
        if (a.delta > a.interval) {
            // Update if play is true
            if (a.play == true) {
                a.update(null, a);
                Matter.Engine.update(a.engine);
            }
            a.then = a.now - (a.delta % a.interval);
            a.stats.update();
            a.fps.update();
        }
        a.renderer.render(a.scene, a.camera);
        requestAnimationFrame(function(e) { a.render(e, a); });
    }

    update(e, a) {
        a.updateCamera(a);
        a.timer.render(a);

        // Update player object
        a.player.renderSpeed(a);
        a.player.updateRope();

        // Loop through scene for all children
        var index = a.level.children.length - 1;
        while (index >= 0) {
            var child = a.level.children[index];

            // Update child if it has a collision box
            if (child.body != null && child.isFrozen() == false) {
                var rect = child.body;
                var x = rect.position.x;
                var y = rect.position.y;
                var z = child.position.z;
                var rotation = rect.angle;
                child.setPosition({ x: x, y: -y, z: z }, false);
                child.setRotation(-rotation, false);
                child.update();
                if (child.position.y < -1000) {
                    if (child.getClass() == 'player') child.kill();
                    else {
                        a.level.removeObject(child, a);
                        //child.resetToOrigin();
                    }
                }
            }
            index--; // Update iterator
        }
    }

    resizeWindow(e, a) {
        var screenWidth = a.window.innerWidth;
        var screenHeight = a.window.innerHeight;
        a.camera.aspect = screenWidth / screenHeight;
        a.camera.updateProjectionMatrix();
        a.renderer.setSize(screenWidth, screenHeight);
    }

    resetScene(a) {
        app.camera.position.z = app.camera.position.zDefault;
        a.ui.showObjectOptions(false);
        a.level.removeParticles(a);
        a.level.resetLevel(a);
        a.update(null, a);
    }

    updateCamera(a) {
        a.camera.position.x = a.player.position.x;
        a.camera.position.y = a.player.position.y + a.camera.tilt;
        //a.camera.lookAt(a.player.position.x, a.player.position.y, a.player.position.z);
    }

    updateSettings(settings, a = app) {
        // Compare new settings with local storage
        var storageSettings = a.storage.getSettings(a);
        if (settings == null) settings = storageSettings;
        
        // Add missing keys from storage
        Object.keys(storageSettings).forEach(function (key) {
            if (settings[key] == null) {
                settings[key] = storageSettings[key];
            }
        });
        
        // Update application from settings
        a.audio.setVolume(settings.volume);
        a.updateQuality(settings.quality, a);
        a.ui.toggleTheme(settings.theme);
        a.mouse.setSnap(settings.snap);
        a.player.setSkin(settings.skin, a);
        a.storage.setSettings(settings); // Store locally
        a.updateCameraMotion(settings.motion, a);
    }

    updateGravity(angle) { // between -1, and 1 directionally
        var vector = getVectorFromAngle(angle);
        var gravity = app.engine.world.gravity;
        gravity.x = vector.x;
        gravity.y = vector.y;

        // Animate camera
        if (angle != null && app.motion == true) {
            angle *= -1;
            if (angle < 0) app.camera.rotation.z = (app.camera.rotation.z - (Math.PI * 2)) % (Math.PI * 2);
            app.animation.tween(app.camera.rotation, { z: angle });
        }
        else app.camera.rotation.z = 0;
    }

    updateQuality(quality, a = app) {
        if (quality <= 0) quality = 1;
        a.renderer.setPixelRatio(a.window.devicePixelRatio / (10 / quality));
    }

    updateCameraMotion(motion, a = app) {
        a.motion = motion;
    }
}
var app = new App();