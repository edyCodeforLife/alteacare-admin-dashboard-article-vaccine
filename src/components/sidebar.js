import React from 'react';
import { NavLink } from "react-router-dom";
import * as Config from './../Config';

class SideBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      admin: JSON.parse(localStorage.getItem("admin")),
    };
  }

  renderSuperAdmin(){
    return (
      <div className="list-group list-group-flush">
        <NavLink to="/kwitansi" isActive={(match, location) => (['/kwitansi']).includes(location.pathname)} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/kwitansi-icon.png"} alt=""/></span>
          <span className="label-name">Kwitansi</span>
        </NavLink>
        <NavLink to="/information" isActive={(match, location) => (['/information', '/add-information']).includes(location.pathname)} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/info-icon.png"} alt=""/></span>
          <span className="label-name">Informasi</span>
        </NavLink>
        <NavLink to="/vaccine" isActive={(match, location) => (['/vaccine']).includes(location.pathname)} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/info-icon.png"} alt=""/></span>
          <span className="label-name">Vaksin</span>
        </NavLink>

        {/* New Vaccine */}
        <NavLink to="/hospital-account" isActive={(match, location) => (['/hospital-account', '/hospital-account-create']).includes(location.pathname) || location.pathname.includes('/hospital-account-edit/')} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/hospital-account-icon.png"} alt=""/></span>
          <span className="label-name">Akun Rumah Sakit</span>
        </NavLink>
        <NavLink to="/vaccine-type" isActive={(match, location) => (['/vaccine-type', '/vaccine-type-create']).includes(location.pathname) || location.pathname.includes('/vaccine-type-edit/')} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/vaccine-type-icon.png"} alt=""/></span>
          <span className="label-name">Tipe Vaksin</span>
        </NavLink>
        {/* <NavLink to="/hospital-vaccine" isActive={(match, location) => (['/hospital-vaccine', '/hospital-vaccine-create']).includes(location.pathname) || location.pathname.includes('/hospital-vaccine-edit/')} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/vaccine-type-icon.png"} alt=""/></span>
          <span className="label-name">Vaksin Rumah Sakit</span>
        </NavLink> */}
        <NavLink to="/vaccine-slot" isActive={(match, location) => (['/vaccine-slot', '/vaccine-slot-create']).includes(location.pathname) || location.pathname.includes('/vaccine-slot-edit')} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/vaccine-slot-icon.png"} alt=""/></span>
          <span className="label-name">Slot Vaksin</span>
        </NavLink>
        <NavLink to="/slot-monitoring" isActive={(match, location) => (['/slot-monitoring', '/slot-monitoring-detail']).includes(location.pathname)} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/slot-monitoring-icon.png"} alt=""/></span>
          <span className="label-name">Slot Monitoring</span>
        </NavLink>
        <NavLink to="/patient-data" isActive={(match, location) => (['/patient-data']).includes(location.pathname)} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/patient-data-icon.png"} alt=""/></span>
          <span className="label-name">Data Pasien</span>
        </NavLink>
        <NavLink to="/article-list" isActive={(match, location) => (['/article-list', '/article-list-create']).includes(location.pathname) || location.pathname.includes('/article-list-edit')} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/article-list-icon.png"} alt=""/></span>
          <span className="label-name">Daftar Artikel</span>
        </NavLink>
        <NavLink to="/article-map" isActive={(match, location) => (['/article-map', '/article-map-create']).includes(location.pathname) || location.pathname.includes('/article-map-edit') || location.pathname.includes('/article-map-category')} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/article-map-icon.png"} alt=""/></span>
          <span className="label-name">Map Konten</span>
        </NavLink>
        <NavLink to="/ebook-list" isActive={(match, location) => (['/ebook-list', '/ebook-list-create']).includes(location.pathname) || location.pathname.includes('/ebook-list-edit')} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/article-list-icon.png"} alt=""/></span>
          <span className="label-name">Daftar Ebook</span>
        </NavLink>
        <NavLink to="/subscriber-list" isActive={(match, location) => (['/subscriber-list', '/subscriber-list-create']).includes(location.pathname) || location.pathname.includes('/subscriber-list-edit')} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/article-list-icon.png"} alt=""/></span>
          <span className="label-name">Daftar Subscriber</span>
        </NavLink>
        <NavLink to="/admin" isActive={(match, location) => (['/admin', '/admin-create']).includes(location.pathname) || location.pathname.includes('/admin-edit')} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/patient-data-icon.png"} alt=""/></span>
          <span className="label-name">Admin</span>
        </NavLink>
      </div>
    )
  }

  renderCSAdmin(){
    return (
      <div className="list-group list-group-flush">
        <NavLink to="/vaccine" isActive={(match, location) => (['/vaccine']).includes(location.pathname)} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/info-icon.png"} alt=""/></span>
          <span className="label-name">Vaksin</span>
        </NavLink>
        <NavLink to="/slot-monitoring" isActive={(match, location) => (['/slot-monitoring', '/slot-monitoring-detail']).includes(location.pathname)} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/slot-monitoring-icon.png"} alt=""/></span>
          <span className="label-name">Slot Monitoring</span>
        </NavLink>
      </div>
    )
  }

  renderVaccineAdmin(){
    return (
      <div className="list-group list-group-flush">
        <NavLink to="/hospital-account" isActive={(match, location) => (['/hospital-account', '/hospital-account-create']).includes(location.pathname) || location.pathname.includes('/hospital-account-edit/')} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/hospital-account-icon.png"} alt=""/></span>
          <span className="label-name">Akun Rumah Sakit</span>
        </NavLink>
        <NavLink to="/vaccine-type" isActive={(match, location) => (['/vaccine-type', '/vaccine-type-create']).includes(location.pathname) || location.pathname.includes('/vaccine-type-edit/')} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/vaccine-type-icon.png"} alt=""/></span>
          <span className="label-name">Tipe Vaksin</span>
        </NavLink>
        {/* <NavLink to="/hospital-vaccine" isActive={(match, location) => (['/hospital-vaccine', '/hospital-vaccine-create']).includes(location.pathname) || location.pathname.includes('/hospital-vaccine-edit/')} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/vaccine-type-icon.png"} alt=""/></span>
          <span className="label-name">Vaksin Rumah Sakit</span>
        </NavLink> */}
        <NavLink to="/vaccine-slot" isActive={(match, location) => (['/vaccine-slot', '/vaccine-slot-create']).includes(location.pathname) || location.pathname.includes('/vaccine-slot-edit')} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/vaccine-slot-icon.png"} alt=""/></span>
          <span className="label-name">Slot Vaksin</span>
        </NavLink>
        <NavLink to="/slot-monitoring" isActive={(match, location) => (['/slot-monitoring', '/slot-monitoring-detail']).includes(location.pathname)} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/slot-monitoring-icon.png"} alt=""/></span>
          <span className="label-name">Slot Monitoring</span>
        </NavLink>
        <NavLink to="/patient-data" isActive={(match, location) => (['/patient-data']).includes(location.pathname)} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/patient-data-icon.png"} alt=""/></span>
          <span className="label-name">Data Pasien</span>
        </NavLink>
      </div>
    )
  }

  renderHospitalAdmin(){
    return (
      <div className="list-group list-group-flush">
        <NavLink to="/vaccine" id="vaccine-link" isActive={(match, location) => (['/vaccine']).includes(location.pathname)} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/info-icon.png"} alt=""/></span>
          <span className="label-name">Vaksin</span>
        </NavLink>
      </div>
    )
  }

  renderInfoAdmin(){
    return (
      <div className="list-group list-group-flush">
          <NavLink to="/information" isActive={(match, location) => (['/information', '/add-information']).includes(location.pathname)} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/info-icon.png"} alt=""/></span>
          <span className="label-name">Informasi</span>
        </NavLink>
      </div>
    )
  }

  renderReceiptAdmin(){
    return (
      <div className="list-group list-group-flush">
        <NavLink to="/kwitansi" isActive={(match, location) => (['/kwitansi']).includes(location.pathname)} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/kwitansi-icon.png"} alt=""/></span>
          <span className="label-name">Kwitansi</span>
        </NavLink>
      </div>
    )
  }

  renderArticleAdmin(){
    return (
      <div className="list-group list-group-flush">
        <NavLink to="/article-list" isActive={(match, location) => (['/article-list', '/article-list-create']).includes(location.pathname) || location.pathname.includes('/article-list-edit')} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/article-list-icon.png"} alt=""/></span>
          <span className="label-name">Daftar Artikel</span>
        </NavLink>
        <NavLink to="/ebook-list" isActive={(match, location) => (['/ebook-list', '/ebook-list-create']).includes(location.pathname) || location.pathname.includes('/ebook-list-edit')} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/article-list-icon.png"} alt=""/></span>
          <span className="label-name">Daftar Ebook</span>
        </NavLink>
        <NavLink to="/article-map" isActive={(match, location) => (['/article-map', '/article-map-create']).includes(location.pathname) || location.pathname.includes('/article-map-edit') || location.pathname.includes('/article-map-category')} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/article-map-icon.png"} alt=""/></span>
          <span className="label-name">Map Konten</span>
        </NavLink>
        <NavLink to="/subscriber-list" isActive={(match, location) => (['/subscriber-list', '/subscriber-list-create']).includes(location.pathname) || location.pathname.includes('/subscriber-list-edit')} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/article-list-icon.png"} alt=""/></span>
          <span className="label-name">Daftar Subscriber</span>
        </NavLink>
        <NavLink to="/admin" isActive={(match, location) => (['/admin', '/admin-create']).includes(location.pathname) || location.pathname.includes('/admin-edit')} activeClassName="current" className="list-group-item list-group-item-action">
          <span className="label-icon"><img src={Config.BASE_URL + "/img/patient-data-icon.png"} alt=""/></span>
          <span className="label-name">Admin</span>
        </NavLink>
      </div>
    )
  }

  render() {
    let sideBar;
    if(this.state.admin.authority === "Super Admin") sideBar =  this.renderSuperAdmin();
    else if(this.state.admin.authority === "Vaccine Admin") sideBar = this.renderVaccineAdmin();
    else if(this.state.admin.authority === "Hospital Admin") sideBar = this.renderHospitalAdmin();
    else if(this.state.admin.authority === "Information Admin") sideBar = this.renderInfoAdmin();
    else if(this.state.admin.authority === "CS Admin") sideBar = this.renderCSAdmin();
    else if(this.state.admin.authority === "Receipt Admin") sideBar = this.renderReceiptAdmin();
    else if(this.state.admin.authority === "Article Admin") sideBar = this.renderArticleAdmin();
    else sideBar = this.renderInfoAdmin();

    return (
      <div id="sidebar-wrapper">
        <div className="sidebar-heading">
          <NavLink to="/"><img src={Config.BASE_URL + "/img/logo.png"} alt=""/></NavLink>
        </div>
        {sideBar}
      </div>
    );
  }
}

export default SideBar;
