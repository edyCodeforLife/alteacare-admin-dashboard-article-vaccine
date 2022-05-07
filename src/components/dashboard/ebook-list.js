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

const Swal2 = withReactContent(Swal);

class EbookList extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if(admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      countdown: null,
      admin: admin,
      ebook: {
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
        filterComposer: '',
        filterOrderBy: '',
        filterCreatedDateFrom: null,
        filterCreatedDateTo: null,
        filterUpdatedDateFrom: null,
        filterUpdatedDateTo: null,
      },
      filter: {
        filterComposer: [],
      },
    };
    this.getEbookList = this.getEbookList.bind(this);
    this.prevPage = this.prevPage.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.generateFilter = this.generateFilter.bind(this);
    this.resetFilter = this.resetFilter.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.delete = this.delete.bind(this);
  }

  async componentDidMount() {
    await this.getEbookList(1);
    let filterCreatedDateInput = document.getElementById('filter-created-date-input');
    if(filterCreatedDateInput != null) {
      new Litepicker({
        element: filterCreatedDateInput,
        singleMode: false,
        resetButton: true,
        setup: (picker) => {
          picker.on('selected', (date1, date2) => {
            date1 = moment(date1.dateInstance);
            date2 = moment(date2.dateInstance);
            this.setState(prevState => ({
              form: {
                ...prevState.form,
                filterCreatedDateFrom: date1,
                filterCreatedDateTo: date2,
              }
            }), () => this.getEbookList(1))
          });
          picker.on('clear:selection', () => {
            this.setState(prevState => ({
              form: {
                ...prevState.form,
                filterCreatedDateFrom: null,
                filterCreatedDateTo: null,
              }
            }), () => this.getEbookList(1));
          });
        },
      });
    }
    let filterUpdatedDateInput = document.getElementById('filter-updated-date-input');
    if(filterUpdatedDateInput != null) {
      new Litepicker({
        element: filterUpdatedDateInput,
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
            }), () => this.getEbookList(1))
          });
          picker.on('clear:selection', () => {
            this.setState(prevState => ({
              form: {
                ...prevState.form,
                filterUpdatedDateFrom: null,
                filterUpdatedDateTo: null,
              }
            }), () => this.getEbookList(1));
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
      this.getEbookList(1);
      this.generateFilter().then((data) => this.setState({filter: data}));
    };
    if(callback == null) this.setState(prevState => ({form: {...prevState.form, [name]: value}}));
    else this.setState(prevState => ({form: {...prevState.form, [name]: value}}), callback);
  }

  prevPage() {
    if(this.state.paging.page <= 1) return;
    this.getEbookList(this.state.paging.page - 1);
  }
  nextPage() {
    this.getEbookList(this.state.paging.page + 1);
  }

  async getEbookList(page) {
    this.setState({ isLoading: true });
    let formData = {
      page: page,
      limit: this.state.paging.perPage,
    };
    if(this.state.form.filterSearch !== '') formData.keyword = this.state.form.filterSearch;
    if(this.state.form.filterOrderBy !== '') formData.order_by = this.state.form.filterOrderBy;
    if(this.state.form.filterComposer !== '') formData.pengunggah_id = this.state.filter.filterComposer[this.state.form.filterComposer].id;
    if(this.state.form.filterCreatedDateFrom !== null) formData.created_at_from = moment(this.state.form.filterCreatedDateFrom).format("YYYY-MM-DD");
    if(this.state.form.filterCreatedDateTo !== null) formData.created_at_to = moment(this.state.form.filterCreatedDateTo).format("YYYY-MM-DD");
    if(this.state.form.filterUpdatedDateFrom !== null) formData.updated_at_from = moment(this.state.form.filterUpdatedDateFrom).format("YYYY-MM-DD");
    if(this.state.form.filterUpdatedDateTo !== null) formData.updated_at_to = moment(this.state.form.filterUpdatedDateTo).format("YYYY-MM-DD");
    let response = await axios.get(`${Config.API_URL_2}/admin/ebook`, { params: formData, headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.message === 'Success get data') {
        let ebookList = data.data.ebook;
        if(ebookList.length === 0 && this.state.paging.page != page) {
          this.setState({ isLoading: false });
        } else {
          this.state.paging.page = page;
          this.setState({ paging: this.state.paging, ebook: { list: ebookList, val: null, totalData: data.data.total_data, totalPage: data.data.total_page } });
        }
        console.log(this.state.ebook);
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
        filterComposer: '',
        filterOrderBy: '',
        filterCreatedDateFrom: null,
        filterCreatedDateTo: null,
        filterUpdatedDateFrom: null,
        filterUpdatedDateTo: null,
      }
    }), () => this.getEbookList(1));
  }

  async generateFilter() {
    this.setState({ isLoading: true });
    let filter = {
      filterComposer: [],
    };
    let response = await axios.get(`${Config.API_URL_2}/cms/admin`, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        let adminList = data.data.admin;
        for(let i=0;i<adminList.length;i++) {
          let item = adminList[i];
          if(item.role.includes('Penyusun')) filter.filterComposer.push(item);
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

  async delete(ebook) {
    if(this.state.isLoading) return;
    let confirm = await Swal.fire({
      title: 'Apakah Anda yakin ingin menghapus E-Book ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak'
    });
    if(!confirm.value) return;
    this.setState({ isLoading: true });
    let response = await axios.delete(`${Config.API_URL_2}/admin/ebook/${ebook.ebook_id}`, { headers: { token: this.state.admin.token } });
    try {
      let data = response.data;
      if(data.message === 'Success delete data') {
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

  render() {
    let filter = this.state.filter;
    return (<>
      <div className="patient-data-page standard-page">
        <div className="d-flex flex-column flex-md-row justify-content-between">
          <div className="action-bar">
            <div className="title">Daftar E-Book</div>
            <NavLink to="/ebook-list-create"><button className="green-action-button">+ Buat Ebook Baru</button></NavLink>
          </div>
        </div>
        {this.state.isLoading && <div className="loader"></div>}
        <div className="filter d-flex">
          <div className="article-search-wrapper d-flex">
            <input name="filterSearch" type="text" className="article-search" onChange={(e) => {
              this.handleFormChange(e, () => {
                if(this.state.countdown != null) clearTimeout(this.state.countdown);
                this.setState({
                  countdown: setTimeout(() => this.getEbookList(1), 1000),
                });
              });
            }} value={this.state.form.filterSearch} placeholder="Cari..."/>
            <div className="search-icon"><img src={`${Config.BASE_URL}/img/green-search-icon.png`} /></div>
            <div style={{minHeight:'8px',minWidth:'8px'}}></div>
          </div>
        </div>
        <div className="filter d-flex flex-wrap">
          <div className="article-filter-select">
            <select name="filterComposer" onChange={this.handleFormChange} value={this.state.form.filterComposer}>
              <option value="">Penyusun</option>
              {filter.filterComposer.map((item, index) => <option key={index} value={index}>{item.name}</option>)}
            </select>
          </div>
          <div style={{minHeight:'8px',minWidth:'8px'}}></div>
          <div className="article-filter-select">
            <select name="filterOrderBy" onChange={this.handleFormChange} value={this.state.form.filterOrderBy}>
              <option value="">Urutkan</option>
              <option value="ebook_title">Judul</option>
              <option value="peninjau">Peninjau</option>
              <option value="created_at">Tanggal Unggah</option>
              <option value="category_name">Kategori</option>
              <option value="updated_at">Tanggal Perbarui</option>
              <option value="total_download">Total Unduh</option>
            </select>
          </div>
          <div style={{minHeight:'8px',minWidth:'8px'}}></div>
          <div onClick={() => document.getElementById('filter-created-date-input').click()} className="article-filter-select">
            <div className="label">{this.state.form.filterCreatedDateFrom === null && this.state.form.filterCreatedDateTo === null ? 'Diunggah' : moment(this.state.form.filterCreatedDateFrom).format("DD/MM") + ' - ' + moment(this.state.form.filterCreatedDateTo).format("DD/MM YYYY")}</div>
            <div className="icon"><img src={`${Config.BASE_URL}/img/green-calendar-icon.png`} alt=""/></div>
            <input type="text" id="filter-created-date-input" style={{height:'2px',visibility:'hidden',position:'absolute'}}/>
          </div>
          <div style={{minHeight:'8px',minWidth:'8px'}}></div>
          <div onClick={() => document.getElementById('filter-updated-date-input').click()} className="article-filter-select">
            <div className="label">{this.state.form.filterUpdatedDateFrom === null && this.state.form.filterUpdatedDateTo === null ? 'Diperbarui' : moment(this.state.form.filterUpdatedDateFrom).format("DD/MM") + ' - ' + moment(this.state.form.filterUpdatedDateTo).format("DD/MM YYYY")}</div>
            <div className="icon"><img src={`${Config.BASE_URL}/img/green-calendar-icon.png`} alt=""/></div>
            <input type="text" id="filter-updated-date-input" style={{height:'2px',visibility:'hidden',position:'absolute'}}/>
          </div>
          <div style={{minHeight:'8px',minWidth:'8px'}}></div>
          <div onClick={this.resetFilter} className="article-filter-select">
            <i className="fa fa-refresh"></i>
          </div>
        </div>
        <div className="primary-table overflow">
          <table className="table">
            <thead>
              <tr>
                <th>Judul E-book</th>
                <th>Penyusun</th>
                <th>Topik</th>
                <th>Status</th>
                <th>Diunggah</th>
                <th>Diperbarui</th>
                <th>Diunduh</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {this.state.ebook.list.length === 0 && <tr>
                <td colSpan="8"><div className="text-center text-secondary"><small><em>Maaf tidak ada data yang ditemukan</em></small></div></td>
              </tr>}
              {this.state.ebook.list.map((item, index) => <tr key={index}>
                <td><div className="article-title">{item.ebook_title}</div></td>
                <td><div className="no-wrap">{item.penyusun}</div></td>
                <td><div className="no-wrap">{item.category_name}</div></td>
                <td><div className={`no-wrap ${item.status === 'Draft' ? 'draft-status' : 'published-status'}`}>{item.status}</div></td>
                <td><div className="no-wrap">{moment(item.create_at).format('DD MMMM YYYY')}</div></td>
                <td><div className="no-wrap">{moment(item.update_at).format('DD MMMM YYYY')}</div></td>
                <td><div className="text-right">{new Intl.NumberFormat().format(item.total_download)}</div></td>
                <td>
                  <div className="d-flex article-action">
                    <div className="left d-flex">
                      <NavLink to={`/ebook-list-edit/${item.slug}`}><div className="blue-action clickable">Ubah</div></NavLink>
                      <div style={{minHeight:'16px',minWidth:'16px'}}></div>
                      <div onClick={() => this.delete(item)} className="red-action clickable">Hapus</div>
                      <div style={{minHeight:'16px',minWidth:'16px'}}></div>
                      <NavLink to={`/ebook-list-edit/${item.slug}?preview=1`}><div className="green-action clickable">Lihat</div></NavLink>
                    </div>
                  </div>
                </td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div style={{minHeight:'16px',minWidth:'16px'}}></div>
        {this.state.ebook.list.length > 0 && <div className="page-bar d-flex flex-column flex-md-row justify-content-between">
          <div className="qty align-self-center">{this.state.ebook.totalData} data ({this.state.ebook.totalPage} halaman)</div>
          <div className="page-list">
            <div className="qty align-self-center">{this.state.paging.page} dari {this.state.ebook.totalPage}</div>
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

export default EbookList;
