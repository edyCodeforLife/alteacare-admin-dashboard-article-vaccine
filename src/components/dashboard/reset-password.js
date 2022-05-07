import React from 'react';
import ResetPasswordForm from './../../forms/reset-password-form';

class ResetPassword extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if(admin == null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
    };
    this.returnPage = this.returnPage.bind(this);
  }

  returnPage() {
    window.history.back();
  }

  render() {
    return (
      <div className="reset-password-page">
        <div className="banner">
          <div className="title d-flex">
            <div onClick={this.returnPage} className="back align-self-center clickable"><svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.9999 6.99997H4.41394L9.70694 1.70697L8.29294 0.292969L0.585938 7.99997L8.29294 15.707L9.70694 14.293L4.41394 8.99997H18.9999V6.99997Z" fill="#3E8CB9"/></svg></div>
            <div style={{width: '12px'}}></div>
            <div className="text">Ubah Kata Sandi</div>
          </div>
        </div>
        <div className="content">
          <ResetPasswordForm></ResetPasswordForm>
        </div>
      </div>
    );
  }
}

export default ResetPassword;
