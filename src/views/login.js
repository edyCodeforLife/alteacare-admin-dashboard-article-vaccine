import React from 'react';
import LoginForm from './../forms/login-form';

class Login extends React.Component {
  render() {
    return (
      <div className="login d-flex flex-column-reverse flex-md-row">
        <div className="left align-self-center">
          <div className="wrapper">
            <h3>AlteaCare Admin Dashboard</h3>
            <p>Silahkan log in dengan akun admin</p>
            <LoginForm refreshAuth={this.props.refreshAuth}></LoginForm>
          </div>
        </div>
        <div className="right"></div>
      </div>
    );
  }
}

export default Login;
