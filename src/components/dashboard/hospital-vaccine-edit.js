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
import Litepicker from 'litepicker';
import 'litepicker/dist/plugins/multiselect';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';
moment.locale('id');

const Swal2 = withReactContent(Swal);

class HospitalVaccineEdit extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if(admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
      hospitalVaccineID: '',
      form: {
        hospitalList: [],
        hospitalVal: '',
        locationTypeVal: '',
        vaccineTypeList: [],
        vaccineTypeVal: '',
        vaccineBrandList: [],
        vaccineBrandVal: '',
        companyName: '',
        passcode: '',
        note: '',
        vaccineFor: '',
        wni: false,
        wna: false,
        status: '1',

        // category
        dataPersonCompanyID: '',
        categoryList: [],
        categoryVal: '',
        categoryName: '',
        editedCategory: null,
        editCategoryName: '',

        // brand
        brandName: '',
        editedBrand: null,
        editBrandName: '',
      },
    };
    this.handleFormChange = this.handleFormChange.bind(this);
    this.getHospitalList = this.getHospitalList.bind(this);
    this.getVaccineTypeList = this.getVaccineTypeList.bind(this);
    this.getVaccineBrandList = this.getVaccineBrandList.bind(this);
    this.fetchCategoryList = this.fetchCategoryList.bind(this);
    this.addCategory = this.addCategory.bind(this);
    this.editCategory = this.editCategory.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
    this.addBrand = this.addBrand.bind(this);
    this.editBrand = this.editBrand.bind(this);
    this.deleteBrand = this.deleteBrand.bind(this);
    this.getHospitalVaccineDetail = this.getHospitalVaccineDetail.bind(this);
    this.submit = this.submit.bind(this);
  }

  async componentDidMount() {
    await this.getHospitalList();
    await this.getVaccineTypeList();
    await this.getVaccineBrandList();
    this.getHospitalVaccineDetail();
  }

  async getHospitalVaccineDetail() {
    let id = Number(window.location.pathname.replaceAll('/hospital-vaccine-edit/', ''));
    this.setState({ isLoading: true, hospitalVaccineID: id });
    let response = await axios.get(`${Config.API_URL_2}/admin_vaccine/get_data_type_vaccine_detail/${id}`, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        let detail = data.data;
        console.log(detail);
        if(detail.company != null) {
          for(let i=0;i<this.state.form.hospitalList.length;i++) {
            let item = this.state.form.hospitalList[i];
            if(item.location_vaccine_id === detail.company.location_vaccine_id) {
              this.setState(prevState => ({ form: { ...prevState.form, hospitalVal: i }}));
              break;
            }
          }
          this.setState(prevState => ({
            form: {
              ...prevState.form,
              companyName: detail.company.company_name,
              passcode: detail.company.passcode,
              dataPersonCompanyID: detail.company.data_person_company_id,
            }
          }));
        }
        if(detail.location_vaccine_available != null) {
          let brand = detail.location_vaccine_available.brand_vaccine.split(", ");
          this.state.form.vaccineBrandList.forEach((item) => {
            if(brand.includes(item.brand_vaccine)) item.status = 1;
          })
          this.setState(prevState => ({
            form: {
              ...prevState.form,
              locationTypeVal: detail.location_vaccine_available.type_location.toUpperCase(),
              vaccineFor: detail.location_vaccine_available.vaccine_status,
              note: detail.location_vaccine_available.type_location.toUpperCase() === 'PERUSAHAAN' ? detail.company.hospital_vaccine_notes : detail.location_vaccine_available.noted,
              status: String(detail.location_vaccine_available.status),
              wna: (['WNA', 'ALL']).includes(detail.location_vaccine_available.citizenship),
              wni: (['WNI', 'ALL']).includes(detail.location_vaccine_available.citizenship),
            }
          }));
          for(let i=0;i<this.state.form.hospitalList.length;i++) {
            let item = this.state.form.hospitalList[i];
            if(item.location_vaccine_id === detail.location_vaccine_available.location_vaccine_id) {
              this.setState(prevState => ({ form: { ...prevState.form, hospitalVal: i }}));
              break;
            }
          }
          for(let i=0;i<this.state.form.vaccineTypeList.length;i++) {
            let item = this.state.form.vaccineTypeList[i];
            if(item.type_location.toUpperCase() !== this.state.form.locationTypeVal) continue;
            if(item.vaccine_name === detail.location_vaccine_available.vaccine_name) {
              this.setState(prevState => ({ form: { ...prevState.form, vaccineTypeVal: i }}));
            }
          }
        }
        this.fetchCategoryList();
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async getHospitalList() {
    this.setState({ isLoading: true });
    let response = await axios.get(Config.API_URL_2 + "/hospital_vaccine_list", { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        this.setState(prevState => ({
          form: {
            ...prevState.form,
            hospitalList: data.data,
          }
        }));
        console.log(this.state.form.hospitalList);
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async getVaccineTypeList() {
    this.setState(prevState => ({
      isLoading: true,
      form: {
        ...prevState.form,
        vaccineTypeList: [],
        vaccineTypeVal: '',
      }
    }));
    let response = await axios.get(Config.API_URL_2 + "/admin_vaccine/list_location_vaccine_type", { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        this.setState(prevState => ({
          form: {
            ...prevState.form,
            vaccineTypeList: data.data,
          }
        }));
        console.log(this.state.form.vaccineTypeList);
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async getVaccineBrandList() {
    this.setState(prevState => ({
      isLoading: true,
      form: {
        ...prevState.form,
        vaccineBrandList: [],
      }
    }));
    let response = await axios.get(Config.API_URL_2 + "/v2/admin-vaccine/list_brand_vaccine", { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        this.setState(prevState => ({
          form: {
            ...prevState.form,
            vaccineBrandList: data.data,
          }
        }));
        console.log(this.state.form.vaccineBrandList);
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async addBrand() {
    if(this.state.isLoading) return;
    if(this.state.form.brandName === '') return Swal.fire('Nama Merek Vaksin wajib diisi');
    this.setState({ isLoading: true });
    let formData = { };
    formData.brand_vaccine = this.state.form.brandName;
    let response = await axios.post(`${Config.API_URL_2}/v2/admin-vaccine/list_brand_vaccine`, formData, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 201) {
        await Swal.fire('Success', 'Merek Vaksin berhasil ditambahkan', 'success');
        this.getVaccineBrandList();
        this.setState(prevState => ({ form: { ...prevState.form, brand_vaccine: '' }}));
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      console.log(error);
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async editBrand() {
    if(this.state.isLoading) return;
    this.setState({ isLoading: true });
    let formData = { };
    formData.brand_vaccine = this.state.form.editBrandName;
    let response = await axios.put(`${Config.API_URL_2}/v2/admin-vaccine/list_brand_vaccine/${this.state.form.editedBrand.brand_vaccine_id}`, formData, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        await Swal.fire('Success', 'Merek vaksinasi berhasil diubah', 'success');
        this.state.form.editedBrand.brand_vaccine = this.state.form.editBrandName;
        this.setState(prevState => ({ form: { ...prevState.form, editedBrand: null }}));
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState(prevState => ({ form: { ...prevState.form }, isLoading: false }));
  }

  async deleteBrand(brand) {
    if(this.state.isLoading) return;
    let confirm = await Swal.fire({
      title: 'Hapus Merek Vaksin ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
    });
    if(!confirm.value) return;
    this.setState({ isLoading: true });
    let formData = { };
    let response = await axios.delete(`${Config.API_URL_2}/v2/admin-vaccine/list_brand_vaccine/${brand.brand_vaccine_id}`, formData, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        await Swal.fire('Success', 'Merek vaksin berhasil dihapus', 'success');
        this.getVaccineBrandList();
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState(prevState => ({ form: { ...prevState.form }, isLoading: false }));
  }

  setEditBrand(brand) {
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        editedBrand: brand,
        editBrandName: brand.brand_vaccine,
      }
    }));
  }

  toggleBrandStatus(brand) {
    if(brand.status === 1) brand.status = 0;
    else brand.status = 1;
    this.setState(prevState => ({ form: { ...prevState.form }}));
  }

  handleFormChange(event, callback = null) {
    const target = event.target;
    let value = target.type === 'number' ? target.value.replace(/\D/,'').replace('d', '') : target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    if(callback == null) this.setState(prevState => ({form: {...prevState.form, [name]: value}}));
    else this.setState(prevState => ({form: {...prevState.form, [name]: value}}), callback);
  }

  handleTimeSlotChange(event, item) {
    const target = event.target;
    let value = Number(target.value.replace(/\D/,'').replace('d', ''));
    item.qty = value;
    this.setState(prevState => ({form: {...prevState.form }}));
  }

  async submit() {
    if(this.state.isLoading) return;
    if(this.state.form.hospitalVal === '') return Swal.fire('Rumah Sakit wajib diisi');
    if(this.state.form.locationTypeVal === '') return Swal.fire('Tipe Lokasi wajib diisi');
    if(this.state.form.vaccineTypeVal === '') return Swal.fire('Tipe Vaksin wajib diisi');
    if(this.state.form.locationTypeVal === 'PERUSAHAAN' && validator.isEmpty(this.state.form.companyName)) return Swal.fire('Nama Perusahaan wajib diisi');
    if(this.state.form.locationTypeVal === 'PERUSAHAAN' && validator.isEmpty(this.state.form.passcode)) return Swal.fire('Passcode wajib diisi');
    let brand = '';
    for(let i=0;i<this.state.form.vaccineBrandList.length;i++) {
      let item = this.state.form.vaccineBrandList[i];
      if(item.status === 1) {
        if(brand != '') brand += ', ';
        brand += item.brand_vaccine;
      }
    }
    if(brand === '') return Swal.fire('Wajib pilih merek vaksin');
    if(!this.state.form.wni && !this.state.form.wna) return Swal.fire('Wajib pilih Kewarganegaraan');
    let citizenship = '';
    if(this.state.form.wni) citizenship = 'WNI';
    if(this.state.form.wna) citizenship = 'WNA';
    if(this.state.form.wni && this.state.form.wna) citizenship = 'ALL';
    this.setState({ isLoading: true });
    let formData = { };
    formData.location_vaccine_id = this.state.form.hospitalList[this.state.form.hospitalVal].location_vaccine_id;
    formData.location_vaccine_type_id = this.state.form.vaccineTypeList[this.state.form.vaccineTypeVal].location_vaccine_type_id;
    formData.vaccine_status = this.state.form.vaccineFor.toUpperCase();
    formData.noted = this.state.form.locationTypeVal === 'UMUM' ? this.state.form.note : '';
    formData.hospital_vaccine_notes = this.state.form.locationTypeVal === 'PERUSAHAAN' ? this.state.form.note : '';
    formData.data_person_company_id = this.state.form.dataPersonCompanyID;
    formData.passcode = this.state.form.passcode;
    formData.company_name = this.state.form.companyName;
    formData.status = this.state.form.status;
    formData.brand_vaccine = brand;
    formData.citizenship = citizenship;
    let response = await axios.post(`${Config.API_URL_2}/admin_vaccine/update_type_vaccine/${this.state.hospitalVaccineID}`, formData, { headers: { 'token': this.state.admin.token } });
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

  async fetchCategoryList() {
    if(this.state.form.hospitalVal === '' || this.state.form.vaccineTypeVal === '') return;
    this.setState(prevState => ({
      isLoading: true,
      form: {
        ...prevState.form,
        categoryList: [],
        categoryVal: '',
        categoryName: '',
      }
    }));
    let formData = { };
    formData.hospital_name = this.state.form.hospitalList[this.state.form.hospitalVal].name;
    formData.type_vaccine = this.state.form.vaccineTypeList[this.state.form.vaccineTypeVal].vaccine_name;
    let response = await axios.post(`${Config.API_URL_2}/admin_vaccine/get_category`, formData, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        this.setState(prevState => ({
          form: {
            ...prevState.form,
            categoryList: data.data,
          }
        }));
        console.log(this.state.form.categoryList);
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async addCategory() {
    if(this.state.isLoading) return;
    if(this.state.form.categoryName === '') return Swal.fire('Nama Kategori wajib diisi');
    this.setState({ isLoading: true });
    let formData = { };
    formData.location_vaccine_id = this.state.form.hospitalList[this.state.form.hospitalVal].location_vaccine_id;
    formData.profession = this.state.form.categoryName;
    formData.type_vaccine = this.state.form.vaccineTypeList[this.state.form.vaccineTypeVal].vaccine_name;
    let response = await axios.post(`${Config.API_URL_2}/admin_vaccine/add_category`, formData, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        await Swal.fire('Success', 'Kategori Berhasil ditambahkan', 'success');
        this.fetchCategoryList();
        document.getElementById('category-close').click();
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async toggleCategoryStatus(category) {
    if(this.state.isLoading) return;
    this.setState({ isLoading: true });
    let formData = { };
    formData.location_vaccine_id = category.location_vaccine_id;
    formData.profession = category.profession;
    formData.type_vaccine = category.type_vaccine;
    formData.status = category.status === 1 ? 0 : 1;
    let response = await axios.post(`${Config.API_URL_2}/admin_vaccine/edit_category/${category.location_vaccine_profession_id}`, formData, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        await Swal.fire('Success', 'Status kategori berhasil diubah', 'success');
        category.status = category.status === 1 ? 0 : 1;
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState(prevState => ({ form: { ...prevState.form }, isLoading: false }));
  }

  async editCategory() {
    if(this.state.isLoading) return;
    this.setState({ isLoading: true });
    let formData = { };
    formData.location_vaccine_id = this.state.form.editedCategory.location_vaccine_id;
    formData.profession = this.state.form.editCategoryName;
    formData.type_vaccine = this.state.form.editedCategory.type_vaccine;
    formData.status = this.state.form.editedCategory.status;
    let response = await axios.post(`${Config.API_URL_2}/admin_vaccine/edit_category/${this.state.form.editedCategory.location_vaccine_profession_id}`, formData, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        await Swal.fire('Success', 'Status kategori berhasil diubah', 'success');
        this.state.form.editedCategory.profession = this.state.form.editCategoryName;
        this.setState(prevState => ({ form: { ...prevState.form, editedCategory: null }}));
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState(prevState => ({ form: { ...prevState.form }, isLoading: false }));
  }

  async deleteCategory(category) {
    if(this.state.isLoading) return;
    let confirm = await Swal.fire({
      title: 'Hapus Kategori ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
    });
    if(!confirm.value) return;
    this.setState({ isLoading: true });
    let formData = { };
    let response = await axios.post(`${Config.API_URL_2}/admin_vaccine/delete_category/${category.location_vaccine_profession_id}`, formData, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        await Swal.fire('Success', 'Kategori berhasil dihapus', 'success');
        this.fetchCategoryList();
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState(prevState => ({ form: { ...prevState.form }, isLoading: false }));
  }

  setEditCategory(category) {
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        editedCategory: category,
        editCategoryName: category.profession,
      }
    }));
  }

  render() {
    return (<>
      <div className="standard-2-page">
        <div className="banner">
          <div className="title d-flex flex-column flex-md-row">
            <div className="flex-grow-1 align-self-center">
              <div className="left d-flex">
                <NavLink to="/hospital-vaccine"><div className="back clickable align-self-center"><svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.9999 6.99997H4.41394L9.70694 1.70697L8.29294 0.292969L0.585938 7.99997L8.29294 15.707L9.70694 14.293L4.41394 8.99997H18.9999V6.99997Z" fill="#3E8CB9"/></svg></div></NavLink>
                <div style={{width: '12px'}}></div>
                <div className="text flex-grow-1 align-self-center">Ubah Vaksin Rumah Sakit</div>
              </div>
            </div>
          </div>
        </div>
        <div className="standard-form">
          <div className="action">
            <button onClick={this.submit} className="add-button">Simpan</button>
          </div>
          <div className="d-flex flex-column flex-md-row">
            <div className="left flex-grow-1 flex-basis-0">
              <div className="group">
                <label>Nama Rumah Sakit</label>
                <select name="hospitalVal" onChange={(e) => this.handleFormChange(e, this.fetchCategoryList)} value={this.state.form.hospitalVal}>
                  <option value="">-- Pilih Rumah Sakit --</option>
                  {this.state.form.hospitalList.map((item, index) => <option key={index} value={index}>{item.name}</option>)}
                </select>
              </div>
              <div className="group">
                <label>Tipe Lokasi</label>
                <select name="locationTypeVal" onChange={this.handleFormChange} value={this.state.form.locationTypeVal}>
                  <option value="">-- Pilih Tipe Lokasi --</option>
                  <option value="PERUSAHAAN">Perusahaan</option>
                  <option value="UMUM">Umum</option>
                </select>
              </div>
              <div className="group">
                <label>Tipe Vaksin</label>
                <select name="vaccineTypeVal" onChange={(e) => this.handleFormChange(e, this.fetchCategoryList)} value={this.state.form.vaccineTypeVal}>
                  <option value="">-- Pilih Tipe Vaksin --</option>
                  {this.state.form.vaccineTypeList.map((item, index) => item.type_location.toUpperCase() === this.state.form.locationTypeVal && <option key={index} value={index}>{item.vaccine_name}</option>)}
                </select>
              </div>
              {this.state.form.locationTypeVal === 'PERUSAHAAN' && <div className="group">
                <label>Nama Perusahaan</label>
                <input name="companyName" type="text" onChange={this.handleFormChange} value={this.state.form.companyName} placeholder="Tulis Nama Perusahaan"/>
              </div>}
              {this.state.form.locationTypeVal === 'UMUM' && this.state.form.hospitalVal !== '' && this.state.form.locationTypeVal !== '' && this.state.form.vaccineTypeVal !== '' && this.state.form.vaccineTypeList[this.state.form.vaccineTypeVal].is_category === 1 && <>
              <div className="group">
                <label>Kategori</label>
                <div className="placeholder clickable" data-toggle="modal" data-target="#category-modal">-- Pilih Kategori --</div>
                <div className="modal fade" id="category-modal">
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-body">
                        <div className="d-flex justify-content-between">
                          <div className="blue-title">Daftar Kategori</div>
                          <div id="category-close" className="close" data-dismiss="modal">Tutup</div>
                        </div>
                        <div className="category-list">
                          {this.state.form.categoryList.map((item, index) => <div key={index} className="category-item-wrapper">
                            <div className="category-item flex-grow-1">
                              <div onClick={() => this.toggleCategoryStatus(item)} className={`option-box ${item.status === 1 ? 'active' : ''}`}>✓</div>
                              <div style={{minWidth:'12px'}}></div>
                              <div className="category-text">{item.profession}</div>
                              <div style={{minWidth:'12px'}}></div>
                              <div onClick={() => this.setEditCategory(item)} className="category-edit-icon clickable"><img src={`${Config.BASE_URL}/img/category-edit-icon.png`} /></div>
                            </div>
                            <div style={{minWidth:'16px'}}></div>
                            <div onClick={() => this.deleteCategory(item)} className="category-edit-icon align-self-center clickable"><img src={`${Config.BASE_URL}/img/remove-timeslot-icon.png`} /></div>
                          </div>)}
                        </div>
                        {this.state.form.editedCategory !== null && <><div className="group text-left">
                          <label>Ubah kategori</label>
                          <input name="editCategoryName" type="text" onChange={this.handleFormChange} value={this.state.form.editCategoryName} placeholder="Tulis Nama Kategori"/>
                        </div>
                        <div className="group">
                          <div className="d-flex">
                            <div className="left flex-grow-1">
                              <button onClick={this.editCategory} className="color-button">Ubah</button>
                            </div>
                            <div style={{minWidth:'20px',minHeight:'20px'}}></div>
                            <div className="right flex-grow-1">
                              <button onClick={() => this.setState(prevState => ({ form: { ...prevState.form, editedCategory: null, editCategoryName: '' }}))} className="red-outline-button">Batal</button>
                            </div>
                          </div>
                        </div></>}
                        <div className="group text-left">
                          <label>Tambah kategori</label>
                          <input name="categoryName" type="text" onChange={this.handleFormChange} value={this.state.form.categoryName} placeholder="Tulis Nama Kategori"/>
                        </div>
                        <div className="group">
                          <div className="d-flex">
                            <div className="left flex-grow-1">
                              <button onClick={this.addCategory} className="color-button">Tambah</button>
                            </div>
                            <div style={{minWidth:'20px',minHeight:'20px'}}></div>
                            <div className="right flex-grow-1">
                              <button className="red-outline-button" data-dismiss="modal">Batal</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div></>}
              {this.state.form.locationTypeVal === 'PERUSAHAAN' && <div className="group">
                <label>Passcode</label>
                <input name="passcode" type="text" onChange={this.handleFormChange} value={this.state.form.passcode} placeholder="Tulis Passcode"/>
              </div>}
            </div>
            <div style={{minWidth:'40px',minHeight:'20px'}}></div>
            <div className="right flex-grow-1 flex-basis-0">
              <div className="group">
                <label>Vaksinasi ke</label>
                <select name="vaccineFor" onChange={this.handleFormChange} value={this.state.form.vaccineFor}>
                  <option value="Pertama">Pertama</option>
                  <option value="Kedua">Kedua</option>
                </select>
              </div>
              <div className="group">
                <label>Note</label>
                <textarea name="note" onChange={this.handleFormChange} value={this.state.form.note} rows="6"></textarea>
              </div>
              <div className="group">
                <label>Merek Vaksin</label>
                <div className="placeholder clickable" data-toggle="modal" data-target="#brand-modal">-- Pilih Merek Vaksin --</div>
                <div className="modal fade" id="brand-modal">
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-body">
                        <div className="d-flex justify-content-between">
                          <div className="blue-title">Daftar Merek Vaksin</div>
                          <div id="brand-close" className="close" data-dismiss="modal">Tutup</div>
                        </div>
                        <div className="brand-list">
                          {this.state.form.vaccineBrandList.map((item, index) => <div key={index} className="brand-item-wrapper">
                            <div className="brand-item flex-grow-1">
                              <div onClick={() => this.toggleBrandStatus(item)} className={`option-box ${item.status === 1 ? 'active' : ''}`}>✓</div>
                              <div style={{minWidth:'12px'}}></div>
                              <div className="brand-text">{item.brand_vaccine}</div>
                              <div style={{minWidth:'12px'}}></div>
                              <div onClick={() => this.setEditBrand(item)} className="brand-edit-icon clickable"><img src={`${Config.BASE_URL}/img/category-edit-icon.png`} /></div>
                            </div>
                            <div style={{minWidth:'16px'}}></div>
                            <div onClick={() => this.deleteBrand(item)} className="category-edit-icon align-self-center clickable"><img src={`${Config.BASE_URL}/img/remove-timeslot-icon.png`} /></div>
                          </div>)}
                        </div>
                        {this.state.form.editedBrand !== null && <><div className="group text-left">
                          <label>Ubah kategori</label>
                          <input name="editBrandName" type="text" onChange={this.handleFormChange} value={this.state.form.editBrandName} placeholder="Tulis Nama Merek Vaksin"/>
                        </div>
                        <div className="group">
                          <div className="d-flex">
                            <div className="left flex-grow-1">
                              <button onClick={this.editBrand} className="color-button">Ubah</button>
                            </div>
                            <div style={{minWidth:'20px',minHeight:'20px'}}></div>
                            <div className="right flex-grow-1">
                              <button onClick={() => this.setState(prevState => ({ form: { ...prevState.form, editedBrand: null, editBrandName: '' }}))} className="red-outline-button">Batal</button>
                            </div>
                          </div>
                        </div></>}
                        <div className="group text-left">
                          <label>Tambah Merek Vaksin</label>
                          <input name="brandName" type="text" onChange={this.handleFormChange} value={this.state.form.brandName} placeholder="Tulis Nama Merek Vaksin"/>
                        </div>
                        <div className="group">
                          <div className="d-flex">
                            <div className="left flex-grow-1">
                              <button onClick={this.addBrand} className="color-button">Tambah</button>
                            </div>
                            <div style={{minWidth:'20px',minHeight:'20px'}}></div>
                            <div className="right flex-grow-1">
                              <button className="red-outline-button" data-dismiss="modal">Batal</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="group">
                <label>Kewarganegaraan</label>
                <div className="checkbox-wrapper">
                  <div onClick={() => this.setState(prevState => ({form: { ...prevState.form, wni: !this.state.form.wni }}))} className={`checkbox-option ${this.state.form.wni ? 'active' : ''}`}>
                    <div className="option-box">✓</div>
                    <div className="option-text">WNI</div>
                  </div>
                  <div style={{minWidth:'20px'}}></div>
                  <div onClick={() => this.setState(prevState => ({form: { ...prevState.form, wna: !this.state.form.wna }}))} className={`checkbox-option ${this.state.form.wna ? 'active' : ''}`}>
                    <div className="option-box">✓</div>
                    <div className="option-text">WNA</div>
                  </div>
                </div>
              </div>
              <div className="group">
                <label>Status Tombol</label>
                <select name="status" onChange={this.handleFormChange} value={this.state.form.status}>
                  <option value="1">Enable</option>
                  <option value="0">Disable</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        {this.state.isLoading && <div className="loader"></div>}
      </div>
    </>);
  }
}

export default HospitalVaccineEdit;
