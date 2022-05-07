import React from 'react';
import { NavLink } from "react-router-dom";
import * as Config from './../Config';

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      admin: JSON.parse(localStorage.getItem("admin")),
    };
    this.logout = this.logout.bind(this);
  }

  logout() {
    localStorage.removeItem("admin");
    this.props.refreshAuth();
  }

  render() {
    return (
      <>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <i className="fa fa-user" style={{fontSize: '24px'}}></i>
      </button>

      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav ml-auto mt-2 mt-lg-0">
          <li className="nav-item dropdown">
            <a className="nav-link" href="#0" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <div className="profile d-flex">
                <div className="img"><img src={Config.BASE_URL + '/img/profile-example.png'} alt=""/></div>
                <div className="space"></div>
                <div className="content align-self-center">
                  <div className="name">{this.state.admin.name} <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.41 0.589966L6 5.16997L10.59 0.589966L12 1.99997L6 7.99997L0 1.99997L1.41 0.589966Z" fill="#61C7B5"/></svg></div>
                  <div className="email">{this.state.admin.email}</div>
                </div>
              </div>
            </a>
            <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
              <NavLink to="/change-password" className="dropdown-item change-password">Ubah Kata Sandi</NavLink>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout-button" onClick={this.logout} href="#0">
                <div className="d-flex">
                  <div><img src={Config.BASE_URL + "/img/logout-icon.png"} alt=""/></div>
                  <div style={{minWidth: '8px'}}></div>
                  <div className="text">Keluar</div>
                </div>
              </button>
            </div>
          </li>
        </ul>
      </div>
      </>
    );
  }
}

export default TopBar;
