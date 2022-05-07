import React from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import * as Config from './../../Config';

class ChangePassword extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if(admin == null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
      showNotif: false,
    };
    this.returnPage = this.returnPage.bind(this);
    this.sendResetEmailRequest = this.sendResetEmailRequest.bind(this);
  }

  returnPage() {
    window.history.back();
  }

  async sendResetEmailRequest() {
    this.setState({ isLoading: true });
    let formData = new FormData();
    let response = await axios.post(Config.API_URL + "/send-request-password-change-email", formData, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.status) {
        this.setState({ showNotif: true });
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  render() {
    return (
      <div className="change-password-page">
        <div className="banner">
          <div className="title d-flex">
            <div onClick={this.returnPage} className="back align-self-center clickable"><svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.9999 6.99997H4.41394L9.70694 1.70697L8.29294 0.292969L0.585938 7.99997L8.29294 15.707L9.70694 14.293L4.41394 8.99997H18.9999V6.99997Z" fill="#3E8CB9"/></svg></div>
            <div style={{width: '12px'}}></div>
            <div className="text">Ubah Kata Sandi</div>
          </div>
        </div>
        <div className="content">
          <p className="top-text">Silahkan tekan tombol “Dapatkan Link Ubah Kata Sandi”, kami akan mengirimkan link ke email ({this.state.admin.email}) untuk mengubah kata sandi kamu.</p>
          <button onClick={this.sendResetEmailRequest} disabled={this.state.isLoading}>{this.state.isLoading ? <span className="spinner-border spinner-border-sm"></span> : ''} Dapatkan Link Ubah Kata Sandi</button>
          {this.state.showNotif && <p className="info">Link berhasil dikirim ke email kamu</p>}
        </div>
      </div>
    );
  }
}

export default ChangePassword;
