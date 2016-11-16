/*
    Music notes
 */

var notes;

/*
    Incoming data on socket
 */
var socket = new WebSocket('ws://0.0.0.0:8081/');

socket.onmessage = function(evt) {
    // console.log('evt.data',evt.data);
    var result = JSON.parse(evt.data);
    console.log('result', result);
    notes = result.data.args;
    document.getElementById('notes').innerHTML = (function() {
        html = '';
        notes.forEach(function(note) {
            html+= '<li>' + (note%8) + '</li>';
        })
        return html;
    })();
};


/*
    ThreeJS canvas
 */

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor (0x48B3B5, 1);
document.getElementById('canvas').appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( 2, 1, 1 );
var material = new THREE.MeshBasicMaterial( { color: 0xCC15A5 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

var render = function () {
    requestAnimationFrame( render );

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.001;

    renderer.render(scene, camera);
};

render();
