import React from 'react';
import ReactDOM from 'react-dom';

import Websocket from 'react-websocket';

import Visualizer from './components/Visualizer';

class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      notes: null,
      oscPort: null
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
        <Visualizer />
      </div>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById('app'));
