var TIMESTAMP = null;
var LOCATION = 'entrance'; //starting position

//Return 'Location' URL Parameter
const getParameterByName = (name) => {
    var url = new URL(document.location.href);
    return url.searchParams.get(name);
}

//Checking if there is a 'Location' parameter in the URL. Add one if not.
const onLoad = () => {
    if (getParameterByName("location")) {

        console.log('starting location set to: ' + getParameterByName("location"));
        setTimeout(() => {

            var targetEl = document.querySelector('a-sky');
            var newLocation = getParameterByName("location");
            var newLocationID = "#" + newLocation;
            var image = document.getElementById(newLocation);
            var offsetY = image.getAttribute("offset-y");

            navigate(newLocationID);

            targetEl.setAttribute('material', 'src', newLocationID);
            targetEl.setAttribute('rotation', 'y', offsetY);
            targetEl.emit('fade-image-in');
        }, 300);

    } else {

        queryString.push('location', LOCATION); // query-string library
        console.log('starting location init: ' + getParameterByName("location"));

    }
}

//Change Sky Image.
//Set Markers related to the 'Location'.
const navigate = (loc) => {
    var oldNav,
        skyObj = document.querySelector('a-sky').components.material;

    if (skyObj) {
        oldNav = "nav_" + skyObj.oldData.src.id;
    } else {
        oldNav = "nav_entrance"
    }

    console.log("oldNav :" + oldNav);
    document.getElementById(oldNav).setAttribute('visible', 'false');
    document.getElementById(oldNav).setAttribute('scale', '0.1 0.1 0.1');
    var nav = loc.replace("#", "nav_");
    console.log("nav :" + nav);
    document.getElementById(nav).setAttribute('visible', 'true');
    document.getElementById(nav).setAttribute('scale', '1 1 1');
}

// Clickable marker component
AFRAME.registerComponent('marker', {
    schema: {
        icon: {
            type: 'string',
            default: 'icn_point'
        },
        enterColor: {
            type: 'string',
            default: '#ffffff'
        },
        leaveColor: {
            type: 'string',
            default: '#ffffff'
        },
        yRot: {
            type: 'number',
            default: 0
        },
        yPos: {
            type: 'number',
            default: 0
        },
        zPos: {
            type: 'number',
            default: -3
        }
    },
    init: function () {
        var data = this.data;
        var el = this.el;

        el.setAttribute('rotation', `0 ${data.yRot} 0`);
        el.setAttribute('position', `0 ${data.yPos} 0`);

        var marker = document.createElement("a-entity");
        marker.setAttribute('geometry', 'primitive: plane; width:0.25; height: 0.25;');
        marker.setAttribute('material', `shader: flat; transparent:true; opacity: 0.75; color: ${data.leaveColor}; src: #${data.icon}`);
        marker.setAttribute('position', `0 0 ${data.zPos}`);
        marker.setAttribute('rotation', '0 0 0');
        marker.setAttribute('scale', '1 1 1');
        el.appendChild(marker);

        marker.addEventListener('mouseenter', function (evt) {
            this.setAttribute('material', `color: ${data.enterColor}; opacity: 0.95;`);
            this.setAttribute('scale', '1.25 1.25 1.25');
        });
        marker.addEventListener('mouseleave', function (evt) {
            this.setAttribute('material', `color: ${data.leaveColor}; opacity: 0.75;`);
            this.setAttribute('scale', '1 1 1');
        });
    }
});

// Component to change sky on click and set markers/hotspots.
AFRAME.registerComponent('enter-room', {
    schema: {
        on: {
            type: 'string',
            default: 'click'
        },
        target: {
            type: 'selector',
            default: 'a-sky'
        },
        src: {
            type: 'string'
        },
        dur: {
            type: 'number',
            default: 300
        }
    },

    init: function () {
        var data = this.data;
        var el = this.el;
        var targetEl = this.data.target;

        this.setupFadeAnimation();

        el.addEventListener(data.on, function (evt) {

            if (TIMESTAMP == null || TIMESTAMP + 1000 < evt.timeStamp) {

                var imageID = data.src.replace("#", "");
                var image = document.getElementById(imageID);
                var offsetY = image.getAttribute("offset-y");

                // Fade out image.
                targetEl.emit('fade-image-out');

                // Wait for fade to complete.
                setTimeout(() => {
                    // Set image.
                    navigate(data.src);
                    queryString.push('location', data.src.replace("#", ""));
                    targetEl.setAttribute('material', 'src', data.src);
                    targetEl.setAttribute('rotation', 'y', offsetY);
                    targetEl.emit('fade-image-in');
                }, data.dur);

                TIMESTAMP = evt.timeStamp;
            }

        });
    },
    /**
     * Setup fade-in + fade-out.
     */
    setupFadeAnimation: function () {
        var data = this.data;
        var targetEl = this.data.target;
        // Only set up once.
        if (targetEl.dataset.setImageFadeSetup) {
            return;
        }
        targetEl.dataset.setImageFadeSetup = true;

        // Create animations.
        targetEl.setAttribute('animation__fadeout', {
            property: 'material.color',
            startEvents: 'fade-image-out',
            dir: 'normal',
            dur: data.dur,
            from: '#fff',
            to: '#000'
        });
        targetEl.setAttribute('animation__fadein', {
            property: 'material.color',
            startEvents: 'fade-image-in',
            dir: 'normal',
            dur: data.dur,
            from: '#000',
            to: '#fff'
        });
    }
});

// component rotating on the Y-axes with the camera
AFRAME.registerComponent('rotate-with-camera', {
    init: function () {
        var cameraEl = this.cameraEl = document.querySelector('a-camera');
    },
    tick: function () {
        var rotation = this.cameraEl.object3D.getWorldRotation();
        this.el.setAttribute("rotation", "-90 0 " + Math.round(THREE.Math.radToDeg(rotation.y) * 100) / 100);
    }
});

// component linking to URL
AFRAME.registerComponent('outlink', {
    schema: {
        url: {
            type: 'string',
            default: ''
        },
    },
    init: function () {
        var data = this.data;
        this.el.addEventListener('click', function (evt) {
            window.open(data.url, "_self")
        });
    }
});




//
//-------- positioning helper function for markers --------
//

AFRAME.registerComponent('yhelper', {
    init: function () {
        var yDisplay = document.createElement("a-entity");
        yDisplay.setAttribute('geometry', 'primitive: plane; width: 0.5; height: 0.2;');
        yDisplay.setAttribute('material', 'shader: flat; opacity: 0.2; color: #000000');
        yDisplay.setAttribute('rotation', '0 0 0');
        yDisplay.setAttribute('position', '0 0.125 -1');
        yDisplay.setAttribute('text', 'value', 'y-pos');
        yDisplay.setAttribute('text', 'align', 'center');
        yDisplay.setAttribute('text', 'wrapCount', '10');
        this.el.appendChild(yDisplay);
        this.yDisplay = yDisplay;
    },
    tick: function () {
        var rotation = this.el.object3D.getWorldRotation();
        this.yDisplay.setAttribute('text', 'value', Math.round(THREE.Math.radToDeg(rotation.y) * 100) / 100);
    }
});

//Loads Initial Scene.
onLoad();