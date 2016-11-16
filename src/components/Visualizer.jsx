import React from 'react';

import React3 from 'react-three-renderer';
import THREE from 'three';

class Visualizer extends React.Component {
  constructor() {
    super()
    this.cameraPosition = new THREE.Vector3(0, 0, 5);

    this.state = {
      cubeRotation: new THREE.Euler(),
    };

    this._onAnimate = () => {
      // we will get this callback every frame
      // pretend cubeRotation is immutable.
      // this helps with updates and pure rendering.
      // React will be sure that the rotation has now updated.
      this.setState({
        cubeRotation: new THREE.Euler(
          this.state.cubeRotation.x + 0.01,
          0,
          0
        ),
      });
    };
  }

  render() {
    const width = window.innerWidth; // canvas width
    const height = window.innerHeight; // canvas height
    return (
      <React3
        // this points to the perspectiveCamera which has the name set to "camera" below
        mainCamera="camera"
        width={width}
        height={height}
        antialias
        clearColor={0x48B3B5}
        onAnimate={this._onAnimate}
      >
        <scene>
          <perspectiveCamera
            name="camera"
            fov={75}
            aspect={width / height}
            near={0.1}
            far={1000}

            position={this.cameraPosition}

          />
          <mesh
            rotation={this.state.cubeRotation}
          >
            <boxGeometry
              width={2}
              height={1}
              depth={1}
            />
            <meshBasicMaterial
              color={0xCC15A5}
            />
          </mesh>
        </scene>
      </React3>
    );
  }
}

// <mesh
//   rotation={this.state.cubeRotation}
// >
//   <boxGeometry
//     width={2}
//     height={1}
//     depth={1}
//   />
//   <meshBasicMaterial
//     wireframe
//     color={0xCCB815}
//   />
// </mesh>
//
export default Visualizer;
