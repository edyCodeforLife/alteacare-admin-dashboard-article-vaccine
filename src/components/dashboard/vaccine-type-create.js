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

class HospitalAccountCreate extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if(admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
      form: {
        locationTypeVal: 'PERUSAHAAN',
        vaccineType: '',
        minAge: '',
        maxAge: '',
        category: '1',
      }
    };
    this.handleFormChange = this.handleFormChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  componentDidMount() {

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
    if(validator.isEmpty(this.state.form.vaccineType)) return Swal.fire('Nama Program Vaksin wajib diisi');
    if(this.state.form.minAge === '' || this.state.form.maxAge === '') return Swal.fire('Umur wajib diisi');
    if(Number(this.state.form.minAge) > Number(this.state.form.maxAge)) return Swal.fire('Umur tidak valid');
    this.setState({ isLoading: true });
    let formData = { };
    formData.type_location = this.state.form.locationTypeVal;
    formData.vaccine_name = this.state.form.vaccineType;
    formData.min_age = this.state.form.minAge;
    formData.max_age = this.state.form.maxAge;
    formData.is_category = this.state.form.locationTypeVal === 'PERUSAHAAN' ? '' : this.state.form.category;
    let response = await axios.post(`${Config.API_URL_2}/admin_vaccine/create_location_vaccine_type`, formData, { headers: { 'token': this.state.admin.token } });
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
                <NavLink to="/vaccine-type"><div className="back clickable align-self-center"><svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.9999 6.99997H4.41394L9.70694 1.70697L8.29294 0.292969L0.585938 7.99997L8.29294 15.707L9.70694 14.293L4.41394 8.99997H18.9999V6.99997Z" fill="#3E8CB9"/></svg></div></NavLink>
                <div style={{width: '12px'}}></div>
                <div className="text flex-grow-1 align-self-center">Tambah Daftar Tipe Vaksin</div>
              </div>
            </div>
          </div>
        </div>
        <div className="standard-form">
          <div className="group">
            <label>Tipe Lokasi</label>
            <select name="locationTypeVal" onChange={this.handleFormChange} value={this.state.form.locationTypeVal}>
              <option value="PERUSAHAAN">Perusahaan</option>
              <option value="UMUM">Umum</option>
            </select>
          </div>
          <div className="group">
            <label>Tipe Vaksin</label>
            <input name="vaccineType" type="text" onChange={this.handleFormChange} value={this.state.form.vaccineType} placeholder="Tulis Nama Program Vaksin"/>
          </div>
          <div className="group">
            <label>Umur (untuk Vaksin)</label>
            <div className="group-wrapper">
              <div className="from flex-grow-1">
                <label className="align-self-center mb-0">Dari</label>
                <div style={{minWidth:'16px'}}></div>
                <input name="minAge" type="number" onChange={this.handleFormChange} value={this.state.form.minAge} placeholder="00" className="text-center" />
              </div>
              <div style={{minWidth:'32px'}}></div>
              <div className="to flex-grow-1">
                <label className="align-self-center mb-0">Sampai</label>
                <div style={{minWidth:'16px'}}></div>
                <input name="maxAge" type="number" onChange={this.handleFormChange} value={this.state.form.maxAge} placeholder="00" className="text-center" />
              </div>
            </div>
          </div>
          {this.state.form.locationTypeVal === 'UMUM' && <div className="group">
            <label>Kategori</label>
            <select name="category" onChange={this.handleFormChange} value={this.state.form.category}>
              <option value="1">Enable</option>
              <option value="0">Disable</option>
            </select>
          </div>}
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
