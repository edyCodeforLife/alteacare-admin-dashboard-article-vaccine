import React from 'react';
import { BrowserRouter as Router, Switch, Route, NavLink } from "react-router-dom";
import Swal from 'sweetalert2';
import axios from 'axios';
import moment from 'moment';
import validator from 'validator';
import 'moment/locale/id';
import MUIDataTable from "mui-datatables";
import { Link } from 'react-router-dom';
import * as Config from './../../Config';
import { useHistory } from "react-router-dom";
moment.locale('id');

class SubscriberListEdit extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if(admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
      id: null,
      subscriber: null,
      topicList: [],
      topicSelected: [],
      form: {
        name: '',
        email: '',
        status: '',
      },
    };

    this.fetchTopicList = this.fetchTopicList.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  async componentDidMount() {
    await this.fetchTopicList();
    let id = Number(window.location.pathname.replaceAll('/subscriber-list-edit/', ''));
    this.setState({id: id}, this.fetchDetail);
  }

  handleFormChange(event, callback = null) {
    const target = event.target;
    let value = target.type === 'number' ? target.value.replace(/\D/,'').replace('d', '') : target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    if(callback == null) this.setState(prevState => ({form: {...prevState.form, [name]: value}}));
    else this.setState(prevState => ({form: {...prevState.form, [name]: value}}), callback);
  }

  toggleTopic(topic) {
    let selectedTopic = this.state.topicSelected;
    if(this.state.topicSelected.includes(topic)) selectedTopic.splice(selectedTopic.indexOf(topic), 1);
    else selectedTopic.push(topic);
    this.setState({ topicSelected: selectedTopic });
    console.log(this.state.topicSelected);
  }

  async fetchDetail() {
    let form = { };
    form.subscriber_id = this.state.id;
    let response = await axios.post(`${Config.API_URL_2}/admin/check-subscriber`, form, { headers: { token: this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        let subscriber = data.data;
        let topicList = subscriber.topic.map((item) => item.id);
        let topicSelected = this.state.topicList.filter((item) => topicList.includes(item.id));
        this.setState(prevState => ({
          form: {
            ...prevState.form,
            name: subscriber.name,
            email: subscriber.email,
            status: subscriber.status,
          },
          topicSelected: topicSelected, subscriber: subscriber
        }));
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
  }

  async fetchTopicList() {
    this.setState({ topicList: [] });
    let response = await axios.get(`${Config.API_URL_2}/cms/category`, { headers: { token: this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        this.setState({topicList: data.data.categories});
        console.log(this.state.topicList);
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
  }

  async submit() {
    if(this.state.isLoading) return;
    if(this.state.topicSelected.length === 0) return Swal.fire('Topik wajib dipilih');
    if(this.state.form.name === '') return Swal.fire('Nama wajib diisi');
    if(this.state.form.email === '') return Swal.fire('Email wajib diisi');
    if(!validator.isEmail(this.state.form.email)) return Swal.fire('Email tidak valid');
    if(this.state.form.status === '') return Swal.fire('Status wajib dipilih');
    this.setState({isLoading: true});
    try {
      let formData = { };
      formData.name = this.state.form.name;
      formData.email = this.state.form.email;
      formData.list_topic_id = this.state.topicSelected.map((item) => item.id);
      formData.status = this.state.form.status;
      let response = await axios.put(`${Config.API_URL_2}/admin/subcribe/${this.state.subscriber.subscriber_id}`, formData, { headers: { token: this.state.admin.token } });
      let data = response.data;
      if(data.statusCode === 201 || data.statusCode === 200) {
        await Swal.fire('Sukses', 'Langganan sudah diubah', 'success');
        (document.getElementsByClassName('back')[0]).click();
      } else {
        await Swal.fire('Gagal', data.statusMessage, 'warning');
      }
    } catch(error) {
      await Swal.fire('Gagal', 'Terjadi kesalahan pada koneksi anda. Silahkan coba beberapa saat lagi dan pastikan koneksi internet bekerja dengan baik. ', 'error');
    }
    this.setState({isLoading: false});
  }

  render() {
    return (<>
      <div className="standard-2-page">
        <div className="banner">
          <div className="title d-flex flex-column flex-md-row">
            <div className="flex-grow-1 align-self-center">
              <div className="left d-flex">
                <NavLink to="/subscriber-list"><div className="back clickable align-self-center"><svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.9999 6.99997H4.41394L9.70694 1.70697L8.29294 0.292969L0.585938 7.99997L8.29294 15.707L9.70694 14.293L4.41394 8.99997H18.9999V6.99997Z" fill="#3E8CB9"/></svg></div></NavLink>
                <div style={{width: '12px'}}></div>
                <div className="text flex-grow-1 align-self-center">Ubah Langganan</div>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex flex-column flex-md-row h-100">
          <div className="select-topic">
            <div className="title">Pilih Topik Kesehatan</div>
            <div className="selection-list">
              {this.state.topicList.map((item, index) => <div key={item.id} onClick={() => this.toggleTopic(item)} className={`topic-item ${this.state.topicSelected.includes(item) ? 'active' : ''} d-flex clickable`}>
                <div className="checkbox align-self-center"><i className="fa fa-check"></i></div>
                <div style={{minHeight:'10px',minWidth:'10px'}}></div>
                <div className="topic-name">{item.name}</div>
              </div>)}
            </div>
          </div>
          <div className="standard-form" style={{minWidth: '30%'}}>
            <div className="group">
              <label>Nama</label>
              <input name="name" type="text" onChange={this.handleFormChange} value={this.state.form.name} placeholder="Masukkan nama"/>
            </div>
            <div className="group">
              <label>Email</label>
              <input name="email" type="email" onChange={this.handleFormChange} value={this.state.form.email} placeholder="Masukkan nama email"/>
            </div>
            <div className="group">
              <label>Status</label>
              <select name="status" onChange={this.handleFormChange} value={this.state.form.status}>
                <option value="">-- Pilih Status --</option>
                <option value="BERLANGGANAN">Berlangganan</option>
                <option value="BERHENTI">Berhenti</option>
              </select>
            </div>
            <div className="group">
              <button onClick={this.submit} className="color-button">Simpan</button>
            </div>
          </div>
        </div>
        {this.state.isLoading && <div className="loader"></div>}
      </div>
    </>);
  }
}

export default SubscriberListEdit;
