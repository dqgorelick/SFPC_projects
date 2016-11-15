import React from 'react';
import ReactDOM from 'react-dom';

import Websocket from 'react-websocket';
import React3 from 'react-three-renderer';
import THREE from 'three';

class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      notes: null,
      oscPort: null
    };
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
          this.state.cubeRotation.x + 0.1,
          this.state.cubeRotation.y + 0.1,
          0
        ),
      });
    };
  }

  handleData(data) {
    let result = JSON.parse(data);
    console.log('result',result);
    this.setState({
      'notes': result.data.args
    });
  }

  componentDidMount() {
    console.log('hello world!');
  }

  render() {
    const width = window.innerWidth; // canvas width
    const height = window.innerHeight; // canvas height

    return(
      <div>
        <Websocket
            url='ws://0.0.0.0:8081'
            onMessage={this.handleData.bind(this)}
        />
        <div className="dev-notes">
          <h1>Midnight Flight Over Tokyo</h1>
          <p>Notes from server:</p>
          { this.state.notes &&
            <ul>
              {
                this.state.notes.map((note, index) => {
                  return (
                    <li key={`${note}_${index}`}>{note}</li>
                  )
                })
              }
            </ul>
          }
        </div>
        <React3
          // this points to the perspectiveCamera which has the name set to "camera" below
          mainCamera="camera"
          width={width}
          height={height}

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
                width={1}
                height={1}
                depth={1}
              />
              <meshBasicMaterial
                color={0x00ff00}
              />
            </mesh>
          </scene>
        </React3>
      </div>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById('app'));
