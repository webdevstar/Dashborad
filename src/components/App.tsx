import * as React from 'react';
import Navbar from './Navbar';
import { Toast } from './Toast';

class App extends React.Component<any, any> {

  render() {

    var { children } = this.props;

    return (
      // <Navbar history={this.props.history}>
      <div>
        <Navbar>
          {children}
        </Navbar>
        <Toast />
      </div>
    );
  }
}

export default App;