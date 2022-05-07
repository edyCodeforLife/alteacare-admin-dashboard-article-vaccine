import React from 'react';
import Swal from 'sweetalert2';
import { BrowserRouter as Router, Switch, Route, NavLink } from "react-router-dom";
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/id';
import MUIDataTable from "mui-datatables";
import { Link } from 'react-router-dom';
import Litepicker from 'litepicker';
import * as Config from './../../Config';
moment.locale('id');

class SubscriberList extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if(admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      countdown: null,
      admin: admin,
      subscriber: {
        list: [],
        val: null,
        totalData: 0,
        totalPage: 0,
      },
      paging: {
        page: 1,
        perPage: 7,
      },
      form: {
        filterSearch: '',
        filterTopic: '',
        filterStatus: '',
        filterOrderBy: '',
        filterSubscriberDateFrom: null,
        filterSubscriberDateTo: null,
        filterUpdatedDateFrom: null,
        filterUpdatedDateTo: null,
      },
      filter: {
        filterTopic: [],
      },
    };
    this.getSubscriberList = this.getSubscriberList.bind(this);
    this.prevPage = this.prevPage.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.generateFilter = this.generateFilter.bind(this);
    this.resetFilter = this.resetFilter.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.delete = this.delete.bind(this);
    this.exportExcel = this.exportExcel.bind(this);
  }

  async componentDidMount() {
    await this.getSubscriberList(1);
    let filterSubscriberDateInput = document.getElementById('filter-subscriber-input');
    if(filterSubscriberDateInput != null) {
      new Litepicker({
        element: filterSubscriberDateInput,
        singleMode: false,
        resetButton: true,
        setup: (picker) => {
          picker.on('selected', (date1, date2) => {
            date1 = moment(date1.dateInstance);
            date2 = moment(date2.dateInstance);
            this.setState(prevState => ({
              form: {
                ...prevState.form,
                filterSubscriberDateFrom: date1,
                filterSubscriberDateTo: date2,
              }
            }), () => this.getSubscriberList(1))
          });
          picker.on('clear:selection', () => {
            this.setState(prevState => ({
              form: {
                ...prevState.form,
                filterSubscriberDateFrom: null,
                filterSubscriberDateTo: null,
              }
            }), () => this.getSubscriberList(1));
          });
        },
      });
    }
    let filterUpdateDateInput = document.getElementById('filter-update-input');
    if(filterUpdateDateInput != null) {
      new Litepicker({
        element: filterUpdateDateInput,
        singleMode: false,
        resetButton: true,
        setup: (picker) => {
          picker.on('selected', (date1, date2) => {
            date1 = moment(date1.dateInstance);
            date2 = moment(date2.dateInstance);
            this.setState(prevState => ({
              form: {
                ...prevState.form,
                filterUpdatedDateFrom: date1,
                filterUpdatedDateTo: date2,
              }
            }), () => this.getSubscriberList(1))
          });
          picker.on('clear:selection', () => {
            this.setState(prevState => ({
              form: {
                ...prevState.form,
                filterUpdatedDateFrom: null,
                filterUpdatedDateTo: null,
              }
            }), () => this.getSubscriberList(1));
          });
        },
      });
    }
    this.setState({filter: await this.generateFilter()});
  }

  handleFormChange(event, callback = null) {
    const target = event.target;
    let value = target.type === 'number' ? target.value.replace(/\D/,'').replace('d', '') : target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    if(name.includes('filter') && name != 'filterSearch') callback = () => {
      this.getSubscriberList(1);
    };
    if(callback == null) this.setState(prevState => ({form: {...prevState.form, [name]: value}}));
    else this.setState(prevState => ({form: {...prevState.form, [name]: value}}), callback);
  }

  prevPage() {
    if(this.state.paging.page <= 1) return;
    this.getSubscriberList(this.state.paging.page - 1);
  }
  nextPage() {
    this.getSubscriberList(this.state.paging.page + 1);
  }

  async getSubscriberList(page) {
    this.setState({ isLoading: true });
    let formData = {
      page: page,
      limit: this.state.paging.perPage,
    };
    if(this.state.form.filterSearch !== '') formData.keyword = this.state.form.filterSearch;
    if(this.state.form.filterOrderBy !== '') formData.order = this.state.form.filterOrderBy;
    if(this.state.form.filterTopic !== '') formData.topic = this.state.form.filterTopic;
    if(this.state.form.filterStatus !== '') formData.status = this.state.form.filterStatus;
    if(this.state.form.filterSubscriberDateFrom !== null) formData.date_start_from = moment(this.state.form.filterSubscriberDateFrom).format("YYYY-MM-DD");
    if(this.state.form.filterSubscriberDateTo !== null) formData.date_start_to = moment(this.state.form.filterSubscriberDateTo).format("YYYY-MM-DD");
    if(this.state.form.filterUpdatedDateFrom !== null) formData.updated_at_from = moment(this.state.form.filterUpdatedDateFrom).format("YYYY-MM-DD");
    if(this.state.form.filterUpdatedDateTo !== null) formData.updated_at_to = moment(this.state.form.filterUpdatedDateTo).format("YYYY-MM-DD");
    let response = await axios.get(`${Config.API_URL_2}/admin/subcribe`, { params: formData, headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        let subscriberList = data.data.subcriber;
        if(subscriberList.length === 0 && this.state.paging.page != page) {
          this.setState({ isLoading: false });
        } else {
          this.state.paging.page = page;
          this.setState({ paging: this.state.paging, subscriber: { list: subscriberList, val: null, totalData: data.data.meta.total_data, totalPage: data.data.meta.totalPage } });
        }
        console.log(this.state.subscriber);
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  resetFilter() {
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        filterSearch: '',
        filterTopic: '',
        filterStatus: '',
        filterOrderBy: '',
        filterSubscriberDateFrom: null,
        filterSubscriberDateTo: null,
        filterUpdatedDateFrom: null,
        filterUpdatedDateTo: null,
      }
    }), () => this.getSubscriberList(1));
  }

  async generateFilter() {
    this.setState({ isLoading: true });
    let filter = {
      filterTopic: [],
    };
    let response = await axios.get(`${Config.API_URL_2}/cms/category`, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        let topicList = data.data.categories;
        for(let i=0;i<topicList.length;i++) {
          let item = topicList[i];
          filter.filterTopic.push(item.name);
        }
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
    return filter;
  }

  async delete(subscriber) {
    if(this.state.isLoading) return;
    let confirm = await Swal.fire({
      title: 'Apakah Anda yakin ingin menghapus Subscriber ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak'
    });
    if(!confirm.value) return;
    this.setState({ isLoading: true });
    let response = await axios.delete(`${Config.API_URL_2}/admin/subcribe/${subscriber.subscriber_id}`, { headers: { token: this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        await Swal.fire('Berhasil', 'Data telah dihapus', 'success');
        window.location.reload();
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async exportExcel() {
    if(this.state.isLoading) return;
    this.setState({ isLoading: true });
    let filter = { };
    filter.authority = this.state.admin.authority;
    if(this.state.form.filterSearch !== '') filter.keyword = this.state.form.filterSearch;
    if(this.state.form.filterOrderBy !== '') filter.order = this.state.form.filterOrderBy;
    if(this.state.form.filterTopic !== '') filter.topic = this.state.form.filterTopic;
    if(this.state.form.filterStatus !== '') filter.status = this.state.form.filterStatus;
    if(this.state.form.filterSubscriberDateFrom !== null) filter.date_start_from = moment(this.state.form.filterSubscriberDateFrom).format("YYYY-MM-DD");
    if(this.state.form.filterSubscriberDateTo !== null) filter.date_start_to = moment(this.state.form.filterSubscriberDateTo).format("YYYY-MM-DD");
    if(this.state.form.filterUpdatedDateFrom !== null) filter.updated_at_from = moment(this.state.form.filterUpdatedDateFrom).format("YYYY-MM-DD");
    if(this.state.form.filterUpdatedDateTo !== null) filter.updated_at_to = moment(this.state.form.filterUpdatedDateTo).format("YYYY-MM-DD");
    let response = await axios.get(`${Config.API_URL_2}/admin/subscriber-excel`, {
      headers: {
        'token': this.state.admin.token,
        'Content-Disposition': "attachment; filename=data.xlsx",
        // 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      responseType: 'arraybuffer',
      params: filter,
    });
    try {
      let data = response.data;
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Subscriber List.xlsx'); //or any other extension
      document.body.appendChild(link);
      link.click();
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  render() {
    let filter = this.state.filter;
    return (<>
      <div className="patient-data-page standard-page">
        <div className="d-flex flex-column flex-md-row justify-content-between">
          <div className="action-bar">
            <div className="title">Subscriber</div>
            <NavLink to="/subscriber-list-create"><button className="green-action-button">+ Subscriber Baru</button></NavLink>
          </div>
        </div>
        {this.state.isLoading && <div className="loader"></div>}
        <div className="filter d-flex">
          <div className="article-search-wrapper d-flex">
            <input name="filterSearch" type="text" className="article-search" onChange={(e) => {
              this.handleFormChange(e, () => {
                if(this.state.countdown != null) clearTimeout(this.state.countdown);
                this.setState({
                  countdown: setTimeout(() => this.getSubscriberList(1), 1000),
                });
              });
            }} value={this.state.form.filterSearch} placeholder="Cari..." readonly={this.state.isLoading}/>
            <div className="search-icon"><img src={`${Config.BASE_URL}/img/green-search-icon.png`} /></div>
          </div>
        </div>
        <div className="filter d-flex flex-wrap">
          <div className="article-filter-select">
            <select name="filterTopic" onChange={this.handleFormChange} value={this.state.form.filterTopic}>
              <option value="">Topik</option>
              {filter.filterTopic.map((item, index) => <option key={index} value={item}>{item}</option>)}
            </select>
          </div>
          <div style={{minHeight:'8px',minWidth:'8px'}}></div>
          <div className="article-filter-select">
            <select name="filterStatus" onChange={this.handleFormChange} value={this.state.form.filterStatus}>
              <option value="">Status</option>
              <option value="BERLANGGANAN">Berlangganan</option>
              <option value="BERHENTI">Berhenti</option>
            </select>
          </div>
          <div style={{minHeight:'8px',minWidth:'8px'}}></div>
          <div className="article-filter-select">
            <select name="filterOrderBy" onChange={this.handleFormChange} value={this.state.form.filterOrderBy}>
              <option value="">Urutkan</option>
              <option value="created_at">Tanggal Subscribe</option>
              <option value="status">Status</option>
              <option value="name">Nama</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div style={{minHeight:'8px',minWidth:'8px'}}></div>
          <div onClick={() => document.getElementById('filter-subscriber-input').click()} className="article-filter-select">
            <div className="label">{this.state.form.filterSubscriberDateFrom === null && this.state.form.filterSubscriberDateTo === null ? 'Tgl Berlangganan' : moment(this.state.form.filterSubscriberDateFrom).format("DD/MM") + ' - ' + moment(this.state.form.filterSubscriberDateTo).format("DD/MM YYYY")}</div>
            <div className="icon"><img src={`${Config.BASE_URL}/img/green-calendar-icon.png`} alt=""/></div>
            <input type="text" id="filter-subscriber-input" style={{height:'2px',visibility:'hidden',position:'absolute'}}/>
          </div>
          <div style={{minHeight:'8px',minWidth:'8px'}}></div>
          <div onClick={() => document.getElementById('filter-update-input').click()} className="article-filter-select">
            <div className="label">{this.state.form.filterUpdatedDateFrom === null && this.state.form.filterUpdatedDateTo === null ? 'Tgl Perbarui' : moment(this.state.form.filterUpdatedDateFrom).format("DD/MM") + ' - ' + moment(this.state.form.filterUpdatedDateTo).format("DD/MM YYYY")}</div>
            <div className="icon"><img src={`${Config.BASE_URL}/img/green-calendar-icon.png`} alt=""/></div>
            <input type="text" id="filter-update-input" style={{height:'2px',visibility:'hidden',position:'absolute'}}/>
          </div>
          <div style={{minHeight:'8px',minWidth:'8px'}}></div>
          <div onClick={this.resetFilter} className="article-filter-select">
            <i className="fa fa-refresh"></i>
          </div>
          <div style={{minHeight:'8px',minWidth:'8px'}}></div>
          <div className="article-filter-select">
            <button onClick={this.exportExcel} className="download-report">Unduh Laporan</button>
          </div>
        </div>
        <div className="primary-table overflow">
          <table className="table">
            <thead>
              <tr>
                <th>Topik</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Tanggal Berlangganan</th>
                <th>Tanggal Diperbarui</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {this.state.subscriber.list.length === 0 && <tr>
                <td colSpan="7"><div className="text-center text-secondary"><small><em>Maaf tidak ada data yang ditemukan</em></small></div></td>
              </tr>}
              {this.state.subscriber.list.map((item, index) => <tr key={index}>
                <td><div className="article-title">{item.topic_list.split(",").join(", ")}</div></td>
                <td><div className="no-wrap">{item.name}</div></td>
                <td><div className="no-wrap">{item.email}</div></td>
                <td><div className="no-wrap">{moment(item.created_at.substr(0, 10)).format('DD MMMM YYYY')}</div></td>
                <td><div className="no-wrap">{moment(item.updated_at.substr(0, 10)).format('DD MMMM YYYY')}</div></td>
                <td><div className={`no-wrap ${item.status === 'BERLANGGANAN' ? 'subscribe-status' : 'unsubscribe-status'}`}>{item.status === 'BERLANGGANAN' ? 'Berlangganan' : 'Berhenti'}</div></td>
                <td>
                  <div className="d-flex article-action">
                    <div className="left d-flex">
                      <NavLink to={`/subscriber-list-edit/${item.subscriber_id}`}><div className="blue-action clickable">Ubah</div></NavLink>
                      <div style={{minHeight:'16px',minWidth:'16px'}}></div>
                      <div onClick={() => this.delete(item)} className="red-action clickable">Hapus</div>
                    </div>
                  </div>
                </td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div style={{minHeight:'16px',minWidth:'16px'}}></div>
        {this.state.subscriber.list.length > 0 && <div className="page-bar d-flex flex-column flex-md-row justify-content-between">
          <div className="qty align-self-center">{this.state.subscriber.totalData} data ({this.state.subscriber.totalPage} halaman)</div>
          <div className="page-list">
            <div className="qty align-self-center">{this.state.paging.page} dari {this.state.subscriber.totalPage}</div>
            <div onClick={this.prevPage} className="page"><div className="text-center"><img src={`${Config.BASE_URL}/img/page-arrow-left.png`} /></div></div>
            <div className="page active"><div className="text-center">{this.state.paging.page}</div></div>
            <div onClick={this.nextPage} className="page"><div className="text-center"><img src={`${Config.BASE_URL}/img/page-arrow-right.png`} /></div></div>
          </div>
        </div>}
        <br/>
      </div>
    </>);
  }
}

export default SubscriberList;
