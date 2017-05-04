var RADIUS = 1;
var NUMBER_OF_NOTES = 8;
var NOTE_CUBE_RADIUS = 0.4;

/*
    Music notes
 */

var notes;

// helper functions

function findPolarCoordinates(note, steps) {
    var result = parseInt(note)/steps * 2 * Math.PI;
    var pos = {x: Math.sin(result)*RADIUS, y: Math.cos(result)*RADIUS};
    return (pos);
}

/*
    Incoming data on socket
 */
var socket = new WebSocket('ws://localhost:8081/');

socket.onmessage = function(evt) {
    var result = JSON.parse(evt.data);
    notes = result.data.args;
    document.getElementById('notes').innerHTML = (function() {
        html = '';
        notes.forEach(function(note) {
            html += '<li>' + (note % 8) + '</li>';
        })
        return html;
    })();
};


/*
    ThreeJS canvas
 */



var container,
    renderer,
    scene,
    camera,
    background,
    uniforms,
    fov = 2,
    noteCubes = [];


    var spheres = [];

    var directionalLight, pointLight;

init();
animate();

function init() {



    // grab the container from the DOM
    container = document.getElementById('canvas');

    // create a camera the size of the browser window
    // and place it 100 units away, looking towards the center of the scene
    camera = new THREE.PerspectiveCamera(
        fov,
        window.innerWidth / window.innerHeight,
        1,
        10000);
    camera.position.z = 200;
    camera.target = new THREE.Vector3(0, 0, 0);

    scene = new THREE.Scene();

    // background

    uniforms = {
        time:       { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
        u_time:       { value: 1.0 },
        u_resolution: { value: new THREE.Vector2() }
    };

    var background_material = new THREE.ShaderMaterial( {

        uniforms: uniforms,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent

    } );


    var background = new THREE.Mesh( new THREE.PlaneBufferGeometry( 9, 9 ) , background_material );
    background.position.z = -10;
    scene.add(background);

    // circle
    var circle_material = new THREE.MeshBasicMaterial({

        color: 0x000000,
        wireframe: true,
    });

    var radius = RADIUS;
    var segments = 32;

    var circleGeometry = new THREE.CircleGeometry( radius, segments );
    var circle = new THREE.Mesh( circleGeometry, circle_material );
    scene.add( circle );


    // cube
    // cube_material = new THREE.MeshLambertMaterial({
    //     color: 0xffff00
    // });
    cube_material = new THREE.MeshPhongMaterial( {
        color: 0xFF9E65,
        emissive: 0x000000,
        side: THREE.DoubleSide,
        shading: THREE.FlatShading
    } )
    // var cube_material = new THREE.MeshBasicMaterial( {color: 0xffff00} );


    var geometry = new THREE.BoxGeometry(NOTE_CUBE_RADIUS, NOTE_CUBE_RADIUS, NOTE_CUBE_RADIUS);
    // var geometry = new THREE.SphereGeometry( 0.2, 10, 10 );

    for (var i = 0; i < NUMBER_OF_NOTES; i++) {
        noteCubes[i] = new THREE.Mesh(
            geometry,
            cube_material
        );
        var pos = findPolarCoordinates(i, NUMBER_OF_NOTES);
        noteCubes[i].position.x = pos.x;
        noteCubes[i].position.y = pos.y;
        scene.add(noteCubes[i]);
    }

    // lights
    var lights = [];
    lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
    lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
    lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

    lights[ 0 ].position.set( 0, 200, 0 );
    lights[ 1 ].position.set( 100, 200, 100 );
    lights[ 2 ].position.set( - 100, - 200, - 100 );

    scene.add( lights[ 0 ] );
    scene.add( lights[ 1 ] );
    scene.add( lights[ 2 ] );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    container.appendChild(renderer.domElement);

    onWindowResize();

    window.addEventListener( 'resize', onWindowResize, false );

};

function onWindowResize( event ) {
    renderer.setSize( window.innerWidth, window.innerHeight );

    uniforms.resolution.value.x = renderer.domElement.width;
    uniforms.resolution.value.y = renderer.domElement.height;

}

function animate() {
    requestAnimationFrame( animate );
    render();

}

function render() {

    uniforms.time.value += 0.05;
    if (notes && noteCubes.length) {
        notes.forEach(function(n, i) {
            noteCubes[n%8].rotation.x += 0.01;
            noteCubes[n%8].rotation.y += 0.01;
            noteCubes[n%8].position.z += 0.1   ;
        });
    }

    renderer.render(scene, camera);

}
