import React from 'react';
import { BrowserRouter as Router, Switch, Route, NavLink } from "react-router-dom";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/id';
import MUIDataTable from "mui-datatables";
import Litepicker from 'litepicker';
import { Link } from 'react-router-dom';
import * as Config from './../../Config';
moment.locale('id');

const Swal2 = withReactContent(Swal);

class ArticleList extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if(admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
      paging: {
        page: 1,
        perPage: 7,
      },
      isPreview: false,
      article: {
        list: [],
        val: null,
      },
      form: {
        filterArticle: '',
        filterStatus: '',
        filterWriter: '',
        filterEditor: '',
        filterCategory: '',
        orderBy: '',
        filterCreatedAtFrom: null,
        filterCreatedAtTo: null,
        filterUpdatedAtFrom: null,
        filterUpdatedAtTo: null,
      }
    };
    this.handleFormChange = this.handleFormChange.bind(this);
    this.prevPage = this.prevPage.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.getArticleList = this.getArticleList.bind(this);
    this.duplicate = this.duplicate.bind(this);
    this.fetchPageList = this.fetchPageList.bind(this);
    this.resetFilter = this.resetFilter.bind(this);
    this.delete = this.delete.bind(this);
  }

  handleFormChange(event, callback = null) {
    const target = event.target;
    let value = target.type === 'number' ? target.value.replace(/\D/,'').replace('d', '') : target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    if(name === 'filterArticle') {
      this.setState(prevState => ({ paging: { ...prevState.paging, page: 1 }}));
    }
    if(callback == null) this.setState(prevState => ({form: {...prevState.form, [name]: value}}));
    else this.setState(prevState => ({form: {...prevState.form, [name]: value}}), callback);
  }

  resetFilter() {
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        filterArticle: '',
        filterStatus: '',
        filterWriter: '',
        filterEditor: '',
        filterCategory: '',
        orderBy: '',
        filterCreatedAtFrom: null,
        filterCreatedAtTo: null,
        filterUpdatedAtFrom: null,
        filterUpdatedAtTo: null,
      }
    }));
  }

  fetchPageList(dataList, all = false) {
    let form = this.state.form;
    let itemList = [];
    for(let i=0;i<dataList.length;i++) {
      let item = dataList[i];
      if(
        form.filterArticle !== ''
        && (
          !item.title.toLowerCase().includes(form.filterArticle.toLowerCase())
          &&
          (item.category == null || !item.category.toLowerCase().includes(form.filterArticle.toLowerCase()))
          &&
          (item.writer == null || !item.writer.toLowerCase().includes(form.filterArticle.toLowerCase()))
          &&
          (item.editor == null || !item.editor.toLowerCase().includes(form.filterArticle.toLowerCase()))
        )
      ) continue;
      if(form.filterStatus !== '' && item.status !== form.filterStatus) continue;
      if(form.filterWriter !== '' && item.writer !== form.filterWriter) continue;
      if(form.filterEditor !== '' && item.editor !== form.filterEditor) continue;
      if(form.filterCategory !== '' && item.category !== form.filterCategory) continue;
      if(
        form.filterCreatedAtFrom !== null && form.filterCreatedAtTo !== null &&
        (moment(item.create_at).isBefore(moment(form.filterCreatedAtFrom), 'day') || moment(item.create_at).isAfter(moment(form.filterCreatedAtTo), 'day'))
      ) continue;
      if(
        form.filterUpdatedAtFrom !== null && form.filterUpdatedAtTo !== null &&
        (moment(item.update_at).isBefore(moment(form.filterUpdatedAtFrom), 'day') || moment(item.update_at).isAfter(moment(form.filterUpdatedAtTo), 'day'))
      ) continue;
      itemList.push(item);
    }
    if(all) return itemList;
    let result = [];
    let currentPage = [];
    if(form.orderBy !== '') {
      switch(form.orderBy) {
        case 'MOST_VIEWED':
          itemList.sort((a, b) => {
            if(a.view > b.view) return -1;
            if(a.view < b.view) return 1;
            return 0;
          });
        break;
        case 'LESS_VIEWED':
          itemList.sort((a, b) => {
            if(a.view > b.view) return 1;
            if(a.view < b.view) return -1;
            return 0;
          });
        break;
        case 'OLDEST':
          itemList.sort((a, b) => {
            if(moment(a.create_at).isBefore(b.create_at)) return -1;
            if(moment(a.create_at).isAfter(b.create_at)) return 1;
            return 0;
          });
        break;
        case 'NEWEST':
          itemList.sort((a, b) => {
            if(moment(a.create_at).isBefore(b.create_at)) return 1;
            if(moment(a.create_at).isAfter(b.create_at)) return -1;
            return 0;
          });
        break;
        case 'ORDER_ASC':
          itemList.sort((a, b) => {
            return a.title.localeCompare(b.title);
          });
        break;
        case 'ORDER_DESC':
          itemList.sort((a, b) => {
            return b.title.localeCompare(a.title);
          });
        break;
      }
    }
    for(let i=0;i<itemList.length;i++) {
      if(currentPage.length < this.state.paging.perPage) {
        currentPage.push(itemList[i]);
        if(currentPage.length === this.state.paging.perPage) {
          result.push(currentPage);
          currentPage = [];
        }
      }
    }
    if(currentPage.length > 0) result.push(currentPage);
    return result;
  }

  prevPage() {
    if(this.state.paging.page <= 1) return;
    this.setState(prevState => ({ paging: { ...prevState.paging, page: this.state.paging.page - 1 }}));
  }
  nextPage() {
    if(this.fetchPageList(this.state.article.list).length <= this.state.paging.page) return;
    this.setState(prevState => ({ paging: { ...prevState.paging, page: this.state.paging.page + 1 }}));
  }

  async componentDidMount() {
    await this.getArticleList();
    let createDateInput = document.getElementById('create-date-input');
    if(createDateInput != null) {
      new Litepicker({
        element: createDateInput,
        singleMode: false,
        resetButton: true,
        setup: (picker) => {
          picker.on('selected', (date1, date2) => {
            date1 = moment(date1.dateInstance);
            date2 = moment(date2.dateInstance);
            this.setState(prevState => ({
              form: {
                ...prevState.form,
                filterCreatedAtFrom: date1,
                filterCreatedAtTo: date2,
              }
            }))
          });
          picker.on('clear:selection', () => {
            this.setState(prevState => ({
              form: {
                ...prevState.form,
                filterCreatedAtFrom: null,
                filterCreatedAtTo: null,
              }
            }));
          });
        },
      });
    }
    let updateDateInput = document.getElementById('update-date-input');
    if(updateDateInput != null) {
      new Litepicker({
        element: updateDateInput,
        singleMode: false,
        resetButton: true,
        setup: (picker) => {
          picker.on('selected', (date1, date2) => {
            date1 = moment(date1.dateInstance);
            date2 = moment(date2.dateInstance);
            this.setState(prevState => ({
              form: {
                ...prevState.form,
                filterUpdatedAtFrom: date1,
                filterUpdatedAtTo: date2,
              }
            }))
          });
          picker.on('clear:selection', () => {
            this.setState(prevState => ({
              form: {
                ...prevState.form,
                filterUpdatedAtFrom: null,
                filterUpdatedAtTo: null,
              }
            }));
          });
        },
      });
    }
  }

  async getArticleList() {
    this.setState({ isLoading: true });
    let response = await axios.get(`${Config.API_URL_2}/cms/article`, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        let articleList = data.data.articles;
        this.setState({ article: { list: articleList, val: null } });
        console.log(this.state.article);
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async duplicate(article) {
    if(this.state.isLoading) return;
    this.setState({ isLoading: true });
    let formData = { };
    formData.id = article.id;
    let response = await axios.post(`${Config.API_URL_2}/cms/article/duplicate`, formData, { headers: { token: this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 201) {
        await Swal.fire('Berhasil', 'Artikel berhasil diduplikasi', 'success');
        window.location.reload();
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async delete(article) {
    if(this.state.isLoading) return;
    let confirm = await Swal.fire({
      title: 'Apakah anda yakin?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak'
    });
    if(!confirm.value) return;
    this.setState({ isLoading: true });
    let response = await axios.delete(`${Config.API_URL_2}/cms/article/${article.id}`, { headers: { token: this.state.admin.token } });
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

  render() {
    let writerList = [];
    let editorList = [];
    let categoryList = [];
    for(let i=0;i<this.state.article.list.length;i++)  {
      let item = this.state.article.list[i];
      if(!writerList.includes(item.writer)) writerList.push(item.writer);
      if(!editorList.includes(item.editor)) editorList.push(item.editor);
      if(!categoryList.includes(item.category)) categoryList.push(item.category);
    }
    return (<>
      <div className="standard-page">
        <div>
          <div className="d-flex flex-column flex-md-row justify-content-between">
            <div className="action-bar">
              <div className="title">Daftar Artikel</div>
              <NavLink to="/article-list-create"><button className="green-action-button">+ Buat Artikel Baru</button></NavLink>
            </div>
          </div>
          <div className="filter d-flex flex-wrap">
            <div className="article-search-wrapper">
              <input name="filterArticle" type="text" className="article-search" onChange={this.handleFormChange} value={this.state.form.filterArticle} placeholder="Cari artikel"/>
              <div className="search-icon"><img src={`${Config.BASE_URL}/img/green-search-icon.png`} /></div>
            </div>
            <div style={{minHeight:'8px',minWidth:'8px'}}></div>
            <div className="article-filter-select">
              <select name="filterStatus" onChange={this.handleFormChange} value={this.state.form.filterStatus}>
                <option value="">Status</option>
                <option value="Draft">Draft</option>
                <option value="Terbit">Terbit</option>
              </select>
            </div>
            <div style={{minHeight:'8px',minWidth:'8px'}}></div>
            <div className="article-filter-select">
              <select name="filterWriter" onChange={this.handleFormChange} value={this.state.form.filterWriter}>
                <option value="">Penulis</option>
                {writerList.map((item, index) => <option key={index} value={item}>{item}</option>)}
              </select>
            </div>
            <div style={{minHeight:'8px',minWidth:'8px'}}></div>
            <div className="article-filter-select">
              <select name="filterEditor" onChange={this.handleFormChange} value={this.state.form.filterEditor}>
                <option value="">Editor</option>
                {editorList.map((item, index) => <option key={index} value={item}>{item}</option>)}
              </select>
            </div>
            <div style={{minHeight:'8px',minWidth:'8px'}}></div>
            <div className="article-filter-select">
              <select name="filterCategory" onChange={this.handleFormChange} value={this.state.form.filterCategory}>
                <option value="">Topik</option>
                {categoryList.map((item, index) => <option key={index} value={item}>{item}</option>)}
              </select>
            </div>
            <div style={{minHeight:'8px',minWidth:'8px'}}></div>
            <div className="article-filter-select">
              <select name="orderBy" onChange={this.handleFormChange} value={this.state.form.orderBy}>
                <option value="">Urutkan</option>
                <option value="MOST_VIEWED">Paling banyak dilihat</option>
                <option value="LESS_VIEWED">Paling sedikit dilihat</option>
                <option value="OLDEST">Terlama</option>
                <option value="NEWEST">Terbaru</option>
                <option value="ORDER_ASC">Urutkan dari A-Z</option>
                <option value="ORDER_DESC">Urutkan dari Z-A</option>
              </select>
            </div>
            <div style={{minHeight:'8px',minWidth:'8px'}}></div>
            <div onClick={() => document.getElementById('create-date-input').click()} className="article-filter-select">
              <div className="label">{this.state.form.filterCreatedAtFrom === null && this.state.form.filterCreatedAtTo === null ? 'Dibuat' : moment(this.state.form.filterCreatedAtFrom).format("DD/MM") + ' - ' + moment(this.state.form.filterCreatedAtTo).format("DD/MM YYYY")}</div>
              <div className="icon"><img src={`${Config.BASE_URL}/img/green-calendar-icon.png`} alt=""/></div>
              <input type="text" id="create-date-input" placeholder="Pilih Tanggal" style={{height:'2px',visibility:'hidden',position:'absolute'}}/>
            </div>
            <div style={{minHeight:'8px',minWidth:'8px'}}></div>
            <div onClick={() => document.getElementById('update-date-input').click()} className="article-filter-select">
              <div className="label">{this.state.form.filterUpdatedAtFrom === null && this.state.form.filterUpdatedAtTo === null ? 'Diperbarui' : moment(this.state.form.filterUpdatedAtFrom).format("DD/MM") + ' - ' + moment(this.state.form.filterUpdatedAtTo).format("DD/MM YYYY")}</div>
              <div className="icon"><img src={`${Config.BASE_URL}/img/green-calendar-icon.png`} alt=""/></div>
              <input type="text" id="update-date-input" placeholder="Pilih Tanggal" style={{height:'2px',visibility:'hidden',position:'absolute'}}/>
            </div>
            <div style={{minHeight:'8px',minWidth:'8px'}}></div>
            <div onClick={this.resetFilter} className="article-filter-select">
              <i className="fa fa-refresh"></i>
            </div>
          </div>
          <div style={{minHeight:'8px',minWidth:'8px'}}></div>
          <div className="primary-table article-table">
            {this.state.article.list.length > 0 && <table className="table">
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Penulis</th>
                  <th>Editor</th>
                  <th>Topik</th>
                  <th>Status</th>
                  <th>Dilihat</th>
                  <th>Disukai</th>
                  <th>Komentar</th>
                  <th>Tanggal Dibuat</th>
                  <th>Tanggal Diperbarui</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(this.fetchPageList(this.state.article.list)[this.state.paging.page - 1] ?? []).length === 0 && <tr>
                  <td colSpan="11"><div className="text-center text-secondary"><small><em>Maaf tidak ada data yang ditemukan</em></small></div></td>
                </tr>}
                {(this.fetchPageList(this.state.article.list)[this.state.paging.page - 1] ?? []).map((item, index) => <tr key={index}>
                  <td><div className="article-title">{item.title}</div></td>
                  <td><div className="no-wrap">{item.writer}</div></td>
                  <td><div className="no-wrap">{item.editor}</div></td>
                  <td><div className="no-wrap">{item.category}</div></td>
                  <td><div className={`no-wrap ${item.status === 'Draft' ? 'draft-status' : 'published-status'}`}>{item.status}</div></td>
                  <td><div className="text-right">{new Intl.NumberFormat().format(item.view)}</div></td>
                  <td><div className="text-right">{new Intl.NumberFormat().format(item.total_like)}</div></td>
                  <td><div className="text-right">{new Intl.NumberFormat().format(item.total_comment)}</div></td>
                  <td><div className="no-wrap">{moment(item.create_at).format('DD MMMM YYYY')}</div></td>
                  <td><div className="no-wrap">{moment(item.update_at).format('DD MMMM YYYY')}</div></td>
                  <td>
                    <div className="d-flex article-action">
                      <div className="left d-flex flex-column">
                        <NavLink to={`/article-list-edit/${item.slug}`}><div className="blue-action clickable">Ubah</div></NavLink>
                        <div style={{minHeight:'8px',minWidth:'8px'}}></div>
                        <div onClick={() => this.duplicate(item)} className="blue-action clickable">Duplikat</div>
                      </div>
                      <div style={{minHeight:'16px',minWidth:'16px'}}></div>
                      <div className="right d-flex flex-column">
                        <NavLink to={`/article-list-edit/${item.slug}?preview=1`}><div className="green-action clickable">Lihat</div></NavLink>
                        <div style={{minHeight:'8px',minWidth:'8px'}}></div>
                        <div onClick={() => this.delete(item)} className="red-action clickable">Hapus</div>
                      </div>
                    </div>
                  </td>
                </tr>)}
              </tbody>
            </table>}
          </div>
          <div style={{minHeight:'16px',minWidth:'16px'}}></div>
          {this.state.article.list.length > 0 && <div className="page-bar d-flex flex-column flex-md-row justify-content-between">
            <div className="qty align-self-center">{this.fetchPageList(this.state.article.list, true).length} Artikel</div>
            <div className="page-list">
              <div className="page-note">{this.state.paging.page} dari {this.fetchPageList(this.state.article.list).length}</div>
              <div onClick={this.prevPage} className="page"><div className="text-center"><img src={`${Config.BASE_URL}/img/page-arrow-left.png`} /></div></div>
              {this.state.paging.page > 1 && <div className="page"><div onClick={() => this.setState(prevState => ({ paging: { ...prevState.paging, page: this.state.paging.page - 1 }}))} className="text-center">{this.state.paging.page - 1}</div></div>}
              <div className="page active"><div className="text-center">{this.state.paging.page}</div></div>
              {this.fetchPageList(this.state.article.list).length > this.state.paging.page && <div onClick={() => this.setState(prevState => ({ paging: { ...prevState.paging, page: this.state.paging.page + 1 }}))} className="page"><div className="text-center">{this.state.paging.page + 1}</div></div>}
              <div onClick={this.nextPage} className="page"><div className="text-center"><img src={`${Config.BASE_URL}/img/page-arrow-right.png`} /></div></div>
            </div>
          </div>}
          <br/>
          {this.state.isLoading && <div className="loader"></div>}
        </div>
      </div>
    </>);
  }
}

export default ArticleList;
