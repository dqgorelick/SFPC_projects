import React from 'react'
import ReactDOM from 'react-dom'

import Websocket from 'react-websocket';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          notes: null,
          oscPort: null
        };
    }

    handleData(data) {
        // let result = JSON.parse(data);
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
        console.log('hello');
        return(
            <div>
                <h1>Hello Baku!</h1>
                <Websocket
                    url='ws://0.0.0.0:8081'
                    onMessage={this.handleData.bind(this)}
                />
                { this.state.notes &&
                    <div>
                        {this.state.notes}
                    </div>
                }
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
