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
import { Jodit } from 'jodit';
import "jodit/build/jodit.min.css";
moment.locale('id');

const Swal2 = withReactContent(Swal);

class HospitalAccountCreate extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if(admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
      form: {
        name: '',
        email: '',
        password: '',
        passwordView: false,
        confirmationPassword: '',
        confirmationPasswordView: false,
        category: '1',
        editor: null,
      },
    };
    this.handleFormChange = this.handleFormChange.bind(this);
    this.togglePasswordView = this.togglePasswordView.bind(this);
    this.toggleConfirmationPasswordView = this.toggleConfirmationPasswordView.bind(this);
    this.generateDescription = this.generateDescription.bind(this);
    this.submit = this.submit.bind(this);
  }

  componentDidMount() {
    let editor = new Jodit('#editor', {
      uploader: {
        url: `${Config.API_URL_2}/cms/images-article`,
        data: { token_body: this.state.admin.token },
        isSuccess: (resp) => { return resp },
        process: function (resp) { return { url: resp.data.url } },
        defaultHandlerSuccess: function(data) {
          if(data.url.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/)) this.selection.insertImage(data.url);
          else this.selection.insertHTML(`<a href="${data.url}" download>${data.url}</a>`);
        },
      },
      buttons: [
        ...Jodit.defaultOptions.buttons,
        {
          iconURL: `${Config.BASE_URL}/img/line-spacing-icon.png`,
          list: ['1,0', '1,15', '1,5', '2,0', '2,5', '3,0'],
          childTemplate: (editor, key, value) => `<span class="${key}">${editor.i18n(value)}</span>`,
          exec: (editor, key, value) => {
            let defaultLineHeight;
            let selected = value.control.name;
            switch(selected) {
              case '1,0':
                defaultLineHeight = 'normal';
                break;
              case '1,15':
                defaultLineHeight = '25px';
                break;
              case '1,5':
                defaultLineHeight = '30px';
                break;
              case '2,0':
                defaultLineHeight = '35px';
                break;
              case '2,5':
                defaultLineHeight = '40px';
                break;
              case '3,0':
                defaultLineHeight = '45px';
                break;
            }
            editor.s.applyStyle({ lineHeight: defaultLineHeight });
          }
        }
      ],
    });
    this.setState(prevState => ({ form: { ...prevState.form, editor: editor }}));
  }

  togglePasswordView() {
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        passwordView: !this.state.form.passwordView,
      }
    }));
  }

  toggleConfirmationPasswordView() {
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        confirmationPasswordView: !this.state.form.confirmationPasswordView,
      }
    }));
  }

  handleFormChange(event, callback = null) {
    const target = event.target;
    let value = target.type === 'number' ? target.value.replace(/\D/,'').replace('d', '') : target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    if(callback == null) this.setState(prevState => ({form: {...prevState.form, [name]: value}}));
    else this.setState(prevState => ({form: {...prevState.form, [name]: value}}), callback);
  }

  generateDescription() {
    this.state.form.editor.setEditorValue(`<br>
    <p><b> JADWAL PROGRAM VAKSINASI YANG TERSEDIA </b> </p></br>
    <p><strong>Tipe Vaksin 1</strong></p>
    <p>Hari : Hari Awal – Hari Akhir</p>
    <p>Tanggal : Tanggal Awal – Tanggal Akhir (+) Tahun</p>
    <p>Jam : Jam Awal – Jam Akhir</p>
    <p>Jenis Vaksinasi :  Pertama/Kedua</p>
    <p>Merek Vaksinasi :</p>
    <p style="color:red;">
    Note : <br />
    Isi Note
    </p>
    <br>
    <p><strong>Tipe Vaksin 2</strong></p>
    <p>Hari : Hari Awal – Hari Akhir</p>
    <p>Tanggal : Tanggal Awal – Tanggal Akhir (+) Tahun</p>
    <p>Jam : Jam Awal – Jam Akhir</p>
    <p>Jenis Vaksinasi :  Pertama/Kedua</p>
    <p>Merek Vaksinasi :</p>
    <p style="color:red;">
    Note : <br />
    Isi Note
    </p>
    <br>`);
  }

  async submit() {
    if(this.state.isLoading) return;
    let description = this.state.form.editor.getEditorValue();
    if(validator.isEmpty(this.state.form.name)) return Swal.fire('Nama wajib diisi');
    if(validator.isEmpty(this.state.form.email)) return Swal.fire('Email wajib diisi');
    if(!validator.isEmail(this.state.form.email)) return Swal.fire('Email tidak valid');
    if(!this.state.form.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)) return Swal.fire('Kata sandi wajib mengandung angka, huruf kecil, dan huruf besar');
    if(this.state.form.password != this.state.form.confirmationPassword) return Swal.fire('Konfirmasi password tidak sesuai');
    this.setState({ isLoading: true });
    let formData = { };
    formData.hospital_name = this.state.form.name;
    formData.email_hospital = this.state.form.email;
    formData.password = this.state.form.password;
    formData.status = this.state.form.category;
    formData.description = description;
    let response = await axios.post(`${Config.API_URL_2}/admin_vaccine/create_account_hospital`, formData, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        await Swal.fire('Success', 'Berhasil ditambahkan', 'success');
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
                <NavLink to="/hospital-account"><div className="back clickable align-self-center"><svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.9999 6.99997H4.41394L9.70694 1.70697L8.29294 0.292969L0.585938 7.99997L8.29294 15.707L9.70694 14.293L4.41394 8.99997H18.9999V6.99997Z" fill="#3E8CB9"/></svg></div></NavLink>
                <div style={{width: '12px'}}></div>
                <div className="text flex-grow-1 align-self-center">Tambah Daftar Rumah Sakit</div>
              </div>
            </div>
          </div>
        </div>
        <div className="standard-form">
          <div className="d-flex flex-column flex-md-row">
            <div className="left flex-grow-1 flex-basis-0">
              <div className="group">
                <label>Nama Rumah Sakit</label>
                <input name="name" type="text" onChange={this.handleFormChange} value={this.state.form.name} placeholder="Tulis Nama Rumah Sakit"/>
              </div>
              <div className="group">
                <label>Email Rumah Sakit</label>
                <input name="email" type="text" onChange={this.handleFormChange} value={this.state.form.email} placeholder="Tulis Alamat Email Rumah Sakit"/>
              </div>
              <div className="group">
                <label>Kata Sandi</label>
                <div className="password-wrapper">
                  <input name="password" type={`${this.state.form.passwordView ? 'text' : 'password'}`} value={this.state.form.password} onChange={this.handleFormChange} placeholder="Buat Kata Sandi"/>
                  {this.state.form.passwordView && <i onClick={this.togglePasswordView} className="fa fa-eye"></i>}
                  {!this.state.form.passwordView && <i onClick={this.togglePasswordView} className="fa fa-eye-slash"></i>}
                </div>
              </div>
              <div className="group">
                <label>Konfirmasi Kata Sandi</label>
                <div className="password-wrapper">
                  <input name="confirmationPassword" type={`${this.state.form.confirmationPasswordView ? 'text' : 'password'}`} value={this.state.form.confirmationPassword} onChange={this.handleFormChange} placeholder="Buat Kata Sandi"/>
                  {this.state.form.confirmationPasswordView && <i onClick={this.toggleConfirmationPasswordView} className="fa fa-eye"></i>}
                  {!this.state.form.confirmationPasswordView && <i onClick={this.toggleConfirmationPasswordView} className="fa fa-eye-slash"></i>}
                </div>
              </div>
            </div>
            <div style={{minWidth:'20px',minHeight:'20px'}}></div>
            <div className="right flex-grow-1 flex-basis-0">
              <div className="group">
                <label>Status</label>
                <select name="category" value={this.state.form.category} onChange={this.handleFormChange}>
                  <option value="1">Enable</option>
                  <option value="0">Disable</option>
                </select>
              </div>
              <div className="group">
                <div className="d-flex justify-content-between">
                  <div className="align-self-end"><label>Deskripsi</label></div>
                  <button onClick={this.generateDescription} className="green-outline-button">Generate</button>
                </div>
                <div id="editor"></div>
              </div>
            </div>
          </div>
          <div className="group">
            <button onClick={this.submit} className="color-button">Tambahkan</button>
          </div>
        </div>
        {this.state.isLoading && <div className="loader"></div>}
      </div>
    </>);
  }
}

export default HospitalAccountCreate;
