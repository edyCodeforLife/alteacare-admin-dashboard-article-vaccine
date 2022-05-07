import React from 'react';
import { BrowserRouter as Router, Switch, Route, NavLink } from "react-router-dom";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';
import moment from 'moment';
import validator from 'validator';
import 'moment/locale/id';
import MUIDataTable from "mui-datatables";
import { Link } from 'react-router-dom';
import * as Config from './../../Config';
import { useHistory } from "react-router-dom";
moment.locale('id');

const Swal2 = withReactContent(Swal);

class AdminEdit extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if(admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
      admID: '',
      form: {
        adm: null,
        name: '',
        isComposer: false,
        isWriter: false,
        isEditor: false,
        isReviewer: false,
      },
    };
    this.handleFormChange = this.handleFormChange.bind(this);
    this.getAdmDetail = this.getAdmDetail.bind(this);
    this.submit = this.submit.bind(this);
  }

  componentDidMount() {
    this.getAdmDetail();
  }

  async getAdmDetail() {
    let id = Number(window.location.pathname.replaceAll('/admin-edit/', ''));
    this.setState({ isLoading: true, admID: id });
    let response = await axios.get(`${Config.API_URL_2}/cms/admin/${id}`, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        let admin = data.data.admin;
        this.setState(prevState => ({
          form: {
            adm: admin,
            name: admin.name,
            isComposer: admin.role.includes("Penyusun") ? true : false,
            isWriter: admin.role.includes("Penulis") ? true : false,
            isEditor: admin.role.includes("Penyunting") ? true : false,
            isReviewer: admin.role.includes("Peninjau Materi") ? true : false,
          }
        }));
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  handleFormChange(event, callback = null) {
    const target = event.target;
    let value = target.type === 'number' ? target.value.replace(/\D/,'').replace('d', '') : target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    if(callback == null) this.setState(prevState => ({form: {...prevState.form, [name]: value}}));
    else this.setState(prevState => ({form: {...prevState.form, [name]: value}}), callback);
  }

  async submit() {
    if(this.state.isLoading) return;
    if(validator.isEmpty(this.state.form.name)) return Swal.fire('Nama wajib diisi');
    if(!this.state.form.isComposer && !this.state.form.isWriter && !this.state.form.isEditor && !this.state.form.isReviewer) return Swal.fire('Salah satu role wajib dipilih');
    this.setState({ isLoading: true });
    let role = "";
    if(this.state.form.isComposer) {
      if(role !== '') role += ",";
      role += "Penyusun";
    }
    if(this.state.form.isWriter) {
      if(role !== '') role += ",";
      role += "Penulis";
    }
    if(this.state.form.isEditor) {
      if(role !== '') role += ",";
      role += "Penyunting";
    }
    if(this.state.form.isReviewer) {
      if(role !== '') role += ",";
      role += "Peninjau Materi";
    }
    let formData = { };
    formData.name = this.state.form.name;
    formData.role = role;
    let response = await axios.put(`${Config.API_URL_2}/cms/admin/${this.state.form.adm.id}`, formData, { headers: { token: this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        await Swal.fire('Success', 'Berhasil diubah', 'success');
        (document.getElementsByClassName('back')[0]).click();
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  render() {
    return (<>
      <div className="standard-2-page">
        <div className="banner">
          <div className="title d-flex flex-column flex-md-row">
            <div className="flex-grow-1 align-self-center">
              <div className="left d-flex">
                <NavLink to="/admin"><div className="back clickable align-self-center"><svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.9999 6.99997H4.41394L9.70694 1.70697L8.29294 0.292969L0.585938 7.99997L8.29294 15.707L9.70694 14.293L4.41394 8.99997H18.9999V6.99997Z" fill="#3E8CB9"/></svg></div></NavLink>
                <div style={{width: '12px'}}></div>
                <div className="text flex-grow-1 align-self-center">Ubah Admin</div>
              </div>
            </div>
          </div>
        </div>
        <div className="standard-form">
          <div className="group">
            <label>Nama</label>
            <input name="name" type="text" onChange={this.handleFormChange} value={this.state.form.name} placeholder="Masukkan nama admin"/>
          </div>
          <div className="group">
            <label>Role Admin</label>
            <div className="checkbox-wrapper">
              <div onClick={() => this.setState(prevState => ({form: { ...prevState.form, isComposer: !this.state.form.isComposer }}))} className={`checkbox-option ${this.state.form.isComposer ? 'active' : ''}`}>
                <div className="option-box">✓</div>
                <div className="option-text">Penyusun</div>
              </div>
              <div style={{minWidth:'20px'}}></div>
              <div onClick={() => this.setState(prevState => ({form: { ...prevState.form, isWriter: !this.state.form.isWriter }}))} className={`checkbox-option ${this.state.form.isWriter ? 'active' : ''}`}>
                <div className="option-box">✓</div>
                <div className="option-text">Penulis</div>
              </div>
              <div style={{minWidth:'20px'}}></div>
              <div onClick={() => this.setState(prevState => ({form: { ...prevState.form, isEditor: !this.state.form.isEditor }}))} className={`checkbox-option ${this.state.form.isEditor ? 'active' : ''}`}>
                <div className="option-box">✓</div>
                <div className="option-text">Penyunting</div>
              </div>
              <div style={{minWidth:'20px'}}></div>
              <div onClick={() => this.setState(prevState => ({form: { ...prevState.form, isReviewer: !this.state.form.isReviewer }}))} className={`checkbox-option ${this.state.form.isReviewer ? 'active' : ''}`}>
                <div className="option-box">✓</div>
                <div className="option-text">Peninjau Materi</div>
              </div>
            </div>
          </div>
          <div className="group">
            <button onClick={this.submit} className="color-button">Ubah</button>
          </div>
        </div>
        {this.state.isLoading && <div className="loader"></div>}
      </div>
    </>);
  }
}

export default AdminEdit;
