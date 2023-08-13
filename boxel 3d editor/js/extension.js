class Extension {
    constructor() {
        this.updateUI();
    }
    
    updateUI() {
        $(document).ready(function(){
            // Check if the program is running on an extension
            if (app.extension.isChromeExtension() == true) {
                var url = location.href;
                var fullscreen_enabled = url.indexOf('fullscreen') >= 0; 
                var fullscreen_button = $('[action="fullscreen"]');
                var review_button = $('.review');

                // Check if extension is NOT in fullscreen mode
                if (fullscreen_enabled == false) {
                    fullscreen_button.removeClass('hidden');
                    fullscreen_button.on('click', function(){
                        app.extension.openFullScreen();
                    });
                }
    
                // Add link to review
                review_button.on('click', function() {
                    if (chrome.extension) {
                        if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1) {
                            
                        }
                        else if(navigator.userAgent.indexOf("Edg") != -1) {
                            chrome.tabs.create({ url: 'https://microsoftedge.microsoft.com/addons/detail/boxel-3d/gcklngphfijejfnnicbadhghhdifidek' });
                        }
                        else if(navigator.userAgent.indexOf("Chrome") != -1) {
                            chrome.tabs.create({ url: 'https://chrome.google.com/webstore/detail/boxel-3d/mjjgmlmpeaikcaajghilhnioimmaibon/reviews' });
                        }
                        else if(navigator.userAgent.indexOf("Safari") != -1) {
                            
                        }
                        else if(navigator.userAgent.indexOf("Firefox") != -1) {
                            
                        }
                        else if((navigator.userAgent.indexOf("MSIE") != -1) || (!!document.documentMode == true)) {
                            
                        }  
                        else {
                            
                        }
                    }
                    else {
                        // Open for non-extension version
                    }
                });
    
                // Append platform class for styling
                $('body').addClass('chrome');
            }
        });
    }

    openFullScreen() {
        var url = location.href + '?fullscreen=true';
        chrome.tabs.create({ url: url });
    }

    isChromeExtension() {
        return chrome.extension != null;
    }
}