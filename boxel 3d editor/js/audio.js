class Audio extends THREE.AudioListener {
    constructor() {
        super();
        // create an AudioListener and add it to the camera
        this.loader = new THREE.AudioLoader();
        this.loadMusic();
    }

    loadMusic() {
        // create a global audio source
        var music = this.music = new THREE.Audio(this); // this = THREE.AudioListener

        // Load audio
        this.loader.load( 'audio/theme.mp3', function(buffer) {
            music.setBuffer(buffer);
            music.setLoop(true);
            if (chrome.extension != null) app.audio.playMusic();
        });

        // AudioContext resolution
        if (chrome.extension == null) {
            var audioEvent = $('body').on('click', function() {
                // Resolve AudioContext being blocked for music
                if (app.audio.allow != true) {
                    app.audio.playMusic();
                    app.audio.allow = true;
                    audioEvent.off(); // Remove click event
                }
            });
        }
    }

    playMusic() {
        this.music.play();
    }
    
    setVolume(volume) {
        this.setMasterVolume(volume);
    }
}