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

class VaccineSlotCreate extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if(admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
      form: {
        hospitalList: [],
        hospitalVal: '',
        locationTypeVal: '',
        companyList: [],
        companyVal: '',
        vaccineTypeList: [],
        vaccineTypeVal: '',

        dateList: [],
        regularDays: [{key: Math.random(), start: null, end: null, qty: 0}],
        vaccine1: false,
        vaccine2: false,
        note: '',
      },
    };
    this.handleFormChange = this.handleFormChange.bind(this);
    this.getHospitalList = this.getHospitalList.bind(this);
    this.getVaccineTypeList = this.getVaccineTypeList.bind(this);
    this.initDatePicker = this.initDatePicker.bind(this);
    this.addRegularDaysRow = this.addRegularDaysRow.bind(this);
    this.removeRegularDaysRow = this.removeRegularDaysRow.bind(this);
    this.applyRegularSlot = this.applyRegularSlot.bind(this);
    this.handleTimeSlotChange = this.handleTimeSlotChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  componentDidMount() {
    this.getHospitalList();
    this.getVaccineTypeList();

  }

  initDatePicker() {
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        companyVal: '',
        vaccineTypeVal: '',

        dateList: [],
        regularDays: [{key: Math.random(), start: null, end: null, qty: 0}],
        vaccine1: false,
        vaccine2: false,
        note: '',
      },
    }));
    let dateRange = document.getElementById('date-range');
    if(dateRange != null) {
      new Litepicker({
        element: dateRange,
        plugins: ['multiselect'],
        setup: (picker) => {
          picker.on('button:apply', (date1, date2) => {
            let selectedList = picker.getMultipleDates();
            let dateList = [];
            for(let i=0;i<selectedList.length;i++) dateList.push({date: moment(selectedList[i].dateInstance), slot: []});
            this.setState(prevState => ({ form: { ...prevState.form, dateList: dateList }}));
            let dateText = '';
            for(let i=0;i<this.state.form.dateList.length;i++) {
              let item = this.state.form.dateList[i];
              if(dateText != '') dateText += ' / ';
              dateText += moment(item.date).format('DD MMM YYYY');
            }
            dateRange.value = dateText;
          });
        },
      });
    }
    let singleDateRange = document.getElementById('single-date-range');
    if(singleDateRange != null) {
      new Litepicker({
        element: singleDateRange,
        singleMode: true,
        setup: (picker) => {
          picker.on('selected', (date) => {
            date = moment(date.dateInstance);
            let exist = false;
            for(let i=0;i<this.state.form.dateList.length;i++) {
              let item = this.state.form.dateList[i];
              if(moment(item.date).isSame(date, 'day')) exist = true;
            }
            if(!exist) {
              this.state.form.dateList.push({date: date, slot: []});
              this.setState(prevState => ({ form: { ...prevState.form }}));
            }
          });
        },
      });
    }
  }

  addRegularDaysRow() {
    let regularDays = this.state.form.regularDays;
    regularDays.push({key: Math.random(), start: null, end: null, qty: 0});
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        regularDays: regularDays,
      }
    }));
  }

  removeRegularDaysRow(row) {
    if(this.state.form.regularDays.length <= 1) return;
    let indexSelected = this.state.form.regularDays.indexOf(row);
    let regularDays = [...this.state.form.regularDays.slice(0, indexSelected), ...this.state.form.regularDays.slice(indexSelected + 1)];
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        regularDays: regularDays,
      },
    }));
  }

  applyRegularSlot() {
    for(let i=0;i<this.state.form.dateList.length;i++) {
      let item = this.state.form.dateList[i];
      item.slot = [];
      for(let s=0;s<this.state.form.regularDays.length;s++) {
        let slot = JSON.parse(JSON.stringify(this.state.form.regularDays[s]));
        if(slot.start === null || slot.end === null) continue;
        slot.key = Math.random();
        item.slot.push(slot);
      }
    }
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        dateList: this.state.form.dateList,
      }
    }));
    console.log(this.state.form);
  }

  addSlotRegularDaysRow(item) {
    item.slot.push({key: Math.random(), start: moment(), end: moment(), qty: 0});
    this.setState(prevState => ({ form: { ...prevState.form }}));
  }

  removeSlotRegularDaysRow(item, subitem) {
    if(item.slot.length <= 1) return;
    let indexSelected = item.slot.indexOf(subitem);
    item.slot = [...item.slot.slice(0, indexSelected), ...item.slot.slice(indexSelected + 1)];
    this.setState(prevState => ({ form: { ...prevState.form }}));
  }

  removeRegularDaySlot(form, item) {
    let indexSelected = form.dateList.indexOf(item);
    form.dateList = [...form.dateList.slice(0, indexSelected), ...form.dateList.slice(indexSelected + 1)];
    this.setState(prevState => ({ form: { ...prevState.form }}));
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

  async getCompanyList() {
    if(this.state.form.hospitalVal === '') {
      this.setState(prevState => ({
        form: {
          ...prevState.form,
          companyList: [],
          companyVal: '',
        }
      }));
      return;
    }
    let formData = { };
    formData.location_vaccine_company = this.state.form.hospitalList[this.state.form.hospitalVal].name;
    let response = await axios.post(`${Config.API_URL_2}/admin_vaccine/get_company_name`, formData, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        this.setState(prevState => ({ form: { ...prevState.form, companyList: data.data }}));
        console.log(this.state.form.companyList);
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
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
    let response = await axios.get(`${Config.API_URL_2}/admin_vaccine/list_location_vaccine_type`, { headers: { 'token': this.state.admin.token } });
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
    if(this.state.form.locationTypeVal === 'PERUSAHAAN') {
      if(this.state.form.companyVal === '') return Swal.fire('Nama Perusahaan wajib diisi');
    }
    if(this.state.form.vaccineTypeVal === '') return Swal.fire('Tipe Vaksin wajib diisi');
    if(this.state.form.dateList.length === 0) return Swal.fire('Tanggal wajib dipilih');
    this.setState({ isLoading: true });
    let formData = { };
    formData.calendar = [];
    for(let i=0;i<this.state.form.dateList.length;i++) {
      let item = this.state.form.dateList[i];
      let dateSlot = { };
      dateSlot.location_vaccine_id = this.state.form.hospitalList[this.state.form.hospitalVal].location_vaccine_id;
      dateSlot.date = moment(item.date).format("YYYY-MM-DD");
      dateSlot.status = 1;
      dateSlot.type_vaccine = this.state.form.vaccineTypeList[this.state.form.vaccineTypeVal].vaccine_name;
      dateSlot.is_first = this.state.form.vaccine1 ? '1' : '0';
      dateSlot.is_second = this.state.form.vaccine2 ? '1' : '0';
      dateSlot.timeslot = [];
      for(let s=0;s<item.slot.length;s++) {
        let subitem = item.slot[s];
        if(subitem.start === null || subitem.end === null) continue;
        dateSlot.timeslot.push({
          timeslot_start_time: moment(subitem.start).format("HH.mm"),
          timeslot_end_time: moment(subitem.end).format("HH.mm"),
          status: 1,
          max_slot: subitem.qty,
          location_vaccine_id: dateSlot.location_vaccine_id,
          type_vaccine: this.state.form.vaccineTypeList[this.state.form.vaccineTypeVal].vaccine_name,
        });
      }
      formData.calendar.push(dateSlot);
    }
    let response = await axios.post(`${Config.API_URL_2}/admin_vaccine/add_slot_vaccine`, formData, { headers: { 'token': this.state.admin.token } });
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
                <NavLink to="/vaccine-slot"><div className="back clickable align-self-center"><svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.9999 6.99997H4.41394L9.70694 1.70697L8.29294 0.292969L0.585938 7.99997L8.29294 15.707L9.70694 14.293L4.41394 8.99997H18.9999V6.99997Z" fill="#3E8CB9"/></svg></div></NavLink>
                <div style={{width: '12px'}}></div>
                <div className="text flex-grow-1 align-self-center">Tambah Slot Vaksin</div>
              </div>
            </div>
          </div>
        </div>
        <div className="standard-form">
          <div className="action">
            <button onClick={this.submit} className="add-button">Tambahkan</button>
          </div>
          <div className="d-flex flex-column flex-md-row">
            <div className="left flex-grow-1 flex-basis-0">
              <div className="group">
                <label>Nama Rumah Sakit</label>
                <select name="hospitalVal" onChange={(e) => this.handleFormChange(e, this.getCompanyList)} value={this.state.form.hospitalVal}>
                  <option value="">-- Pilih Rumah Sakit --</option>
                  {this.state.form.hospitalList.map((item, index) => <option key={index} value={index}>{item.name}</option>)}
                </select>
              </div>
              <div className="group">
                <label>Tipe Lokasi</label>
                <select name="locationTypeVal" onChange={(e) => this.handleFormChange(e, this.initDatePicker)} value={this.state.form.locationTypeVal}>
                  <option value="">-- Pilih Tipe Lokasi --</option>
                  <option value="PERUSAHAAN">Perusahaan</option>
                  <option value="UMUM">Umum</option>
                </select>
              </div>
              {(['PERUSAHAAN']).includes(this.state.form.locationTypeVal) && <div className="group">
                <label>Nama Perusahaan</label>
                <select name="companyVal" onChange={this.handleFormChange} value={this.state.form.companyVal}>
                  <option value="">-- Pilih Perusahaan --</option>
                  {this.state.form.companyList.map((item, index) => <option key={index} value={index}>{item.company_name}</option>)}
                </select>
              </div>}
              {(['PERUSAHAAN', 'UMUM']).includes(this.state.form.locationTypeVal) && <div className="group">
                <label>{this.state.form.locationTypeVal === 'PERUSAHAAN' ? 'Nama' : 'Tipe'} Vaksin</label>
                <select name="vaccineTypeVal" onChange={this.handleFormChange} value={this.state.form.vaccineTypeVal}>
                  <option value="">-- Pilih Tipe Vaksin --</option>
                  {this.state.form.vaccineTypeList.map((item, index) => item.type_location.toUpperCase() === this.state.form.locationTypeVal && <option key={index} value={index}>{item.vaccine_name}</option>)}
                </select>
              </div>}
              {(['PERUSAHAAN', 'UMUM']).includes(this.state.form.locationTypeVal) && <div className="group">
                <label>Tanggal</label>
                <input type="text" id="date-range" placeholder="Pilih Tanggal"/>
              </div>}
            </div>
            <div style={{minWidth:'40px',minHeight:'20px'}}></div>
            <div className="right flex-grow-1 flex-basis-0">
              {(['PERUSAHAAN', 'UMUM']).includes(this.state.form.locationTypeVal) && <div className="group">
                <label>Vaksinasi ke</label>
                <div className="checkbox-wrapper">
                  <div onClick={() => this.setState(prevState => ({form: { ...prevState.form, vaccine1: !this.state.form.vaccine1 }}))} className={`checkbox-option ${this.state.form.vaccine1 ? 'active' : ''}`}>
                    <div className="option-box">✓</div>
                    <div className="option-text">Pertama</div>
                  </div>
                  <div style={{minWidth:'20px'}}></div>
                  <div onClick={() => this.setState(prevState => ({form: { ...prevState.form, vaccine2: !this.state.form.vaccine2 }}))} className={`checkbox-option ${this.state.form.vaccine2 ? 'active' : ''}`}>
                    <div className="option-box">✓</div>
                    <div className="option-text">Kedua</div>
                  </div>
                </div>
              </div>}
            </div>
          </div>
          {(['PERUSAHAAN', 'UMUM']).includes(this.state.form.locationTypeVal) && <div className="date-slot">
            <div className="container">
              <div className="label">Atur Jam</div>
              {this.state.form.regularDays.map((item, index) => <div key={item.key} className="timeslot">
                <div><TimePicker showSecond={false} allowEmpty={false} onChange={(value) => item.start = moment(value).format("HH:mm")} /></div>
                <div className="align-self-center mx-2">-</div>
                <div><TimePicker showSecond={false} allowEmpty={false} onChange={(value) => item.end = moment(value).format("HH:mm")} /></div>
                <div className="align-self-center mx-2">=</div>
                <div><input onChange={(e) => this.handleTimeSlotChange(e, item)} type="number" value={item.qty}/></div>
                <div onClick={() => this.removeRegularDaysRow(item)} className="align-self-center px-2 clickable">
                  <img src={`${Config.BASE_URL}/img/remove-timeslot-icon.png`} alt=""/>
                </div>
              </div>)}
              <div onClick={this.addRegularDaysRow} className="timeslot-add clickable">
                <div className="text-center"><img src={`${Config.BASE_URL}/img/timeslot-add-icon.png`} alt=""/></div>
              </div>
              <div className="apply-button">
                <button onClick={this.applyRegularSlot}>Terapkan Semua</button>
              </div>
            </div>

            <div className="container">
              <div className="dateslot-list">
                {this.state.form.dateList.map((item, index) => <div key={moment(item.date).format('DD-MM-YYYY')}>
                  <div className="d-flex">
                    <div data-toggle="collapse" data-target={`#date-slot-${index+1}`} className="dateslot clickable">
                      <div>{moment(item.date).format("DD MMM YYYY")}</div>
                      <div><img src={`${Config.BASE_URL}/img/down-icon.png`} alt=""/></div>
                    </div>
                    <div onClick={() => this.removeRegularDaySlot(this.state.form, item)} className="align-self-center px-2 clickable">
                      <img src={`${Config.BASE_URL}/img/remove-timeslot-icon.png`} alt=""/>
                    </div>
                  </div>

                  <div id={`date-slot-${index+1}`} className="collapse">
                    {item.slot.map((subitem, index) => <div key={subitem.key} className="timeslot">
                      <div><TimePicker showSecond={false} allowEmpty={false} defaultValue={moment(subitem.start, "HH:mm")} onChange={(value) => subitem.start = moment(value).format("HH:mm")} /></div>
                      <div className="align-self-center mx-2">-</div>
                      <div><TimePicker showSecond={false} allowEmpty={false} defaultValue={moment(subitem.end, "HH:mm")} onChange={(value) => subitem.end = moment(value).format("HH:mm")} /></div>
                      <div className="align-self-center mx-2">=</div>
                      <div><input onChange={(e) => this.handleTimeSlotChange(e, subitem)} type="number" value={subitem.qty}/></div>
                      <div onClick={() => this.removeSlotRegularDaysRow(item, subitem)} className="align-self-center px-2 clickable">
                        <img src={`${Config.BASE_URL}/img/remove-timeslot-icon.png`} alt=""/>
                      </div>
                    </div>)}
                    <div onClick={() => this.addSlotRegularDaysRow(item)} className="timeslot-add clickable">
                      <div className="text-center"><img src={`${Config.BASE_URL}/img/timeslot-add-icon.png`} alt=""/></div>
                    </div>
                  </div>
                </div>)}
                <div>
                  <div className="d-flex">
                    <div onClick={() => document.getElementById('single-date-range').click()} className="dateslot-add clickable">
                      <div className="align-self-center"><img src={`${Config.BASE_URL}/img/timeslot-add-icon.png`} alt=""/></div>
                      <div style={{minWidth:'10px',minHeight:'10px'}}></div>
                      <div className="align-self-center">Tambah Hari</div>
                    </div>
                    <div style={{minWidth:'46px',minHeight:'46px'}}></div>
                  </div>
                  <input type="text" id="single-date-range" placeholder="Pilih Tanggal" style={{height:'2px',visibility:'hidden',position:'absolute'}}/>
                </div>
              </div>
            </div>
          </div>}
        </div>
        {this.state.isLoading && <div className="loader"></div>}
      </div>
    </>);
  }
}

export default VaccineSlotCreate;
