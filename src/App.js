import React from 'react';
import Login from './views/login';
import Dashboard from './views/dashboard';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      admin: localStorage.getItem("admin"),
    };
    this.refreshAuth = this.refreshAuth.bind(this);
  }

  refreshAuth() {
    this.setState({
      admin: localStorage.getItem("admin"),
    });
  }

  render() {
    return (
      <>
      {this.state.admin == null ? <Login refreshAuth={this.refreshAuth}></Login> : <Dashboard refreshAuth={this.refreshAuth}></Dashboard>}
      </>
    );
  }
}

export default App;
