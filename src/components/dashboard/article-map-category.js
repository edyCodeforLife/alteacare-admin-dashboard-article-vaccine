import React from 'react';
import { BrowserRouter as Router, Switch, Route, NavLink } from "react-router-dom";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/id';
import MUIDataTable from "mui-datatables";
import { Link } from 'react-router-dom';
import * as Config from './../../Config';
moment.locale('id');

const Swal2 = withReactContent(Swal);

class ArticleMapCategory extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if(admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
      category: null,
      type: 'ARTICLE',
      typeTable: 'ARTICLE',
      categoriesList: [],
      categoryArticle: {
        list: [],
        val: null,
      },
      categoryEbook: {
        list: [],
        val: null,
      },
      article: {
        list: [],
        val: null,
      },
      ebook: {
        list: [],
        val: null,
      },
      form: {
        filterArticle: '',
        filterEbook: '',
        filterStatus: '',
        catArticlesVal: [],
        catEbookVal: [],
      }
    };
    this.getCategoryArticleList = this.getCategoryArticleList.bind(this);
    this.getCategoryEbookList = this.getCategoryEbookList.bind(this);
    this.getArticleList = this.getArticleList.bind(this);
    this.getEbookList = this.getEbookList.bind(this);
    this.setCatValue = this.setCatValue.bind(this);
    this.setCatEbookValue = this.setCatEbookValue.bind(this);
    this.toggleCatVal = this.toggleCatVal.bind(this);
    this.toggleCatEbookVal = this.toggleCatEbookVal.bind(this);
    this.updateCategoryArticle = this.updateCategoryArticle.bind(this);
    this.updateCategoryEbook = this.updateCategoryEbook.bind(this);
    this.deleteCategoryArticle = this.deleteCategoryArticle.bind(this);
    this.deleteCategoryEbook = this.deleteCategoryEbook.bind(this);
    this.isRecommended = this.isRecommended.bind(this);
    this.resetFilter = this.resetFilter.bind(this);
    this.showArticleList = this.showArticleList.bind(this);
    this.showEbookList = this.showEbookList.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
  }

  async componentDidMount() {
    await this.getCategoryDetail();
    await this.getCategoryArticleList();
    await this.getCategoryEbookList();
    await this.getArticleList();
    await this.getEbookList();
    await this.getCategoryList();
  }

  handleFormChange(event, callback = null) {
    const target = event.target;
    let value = target.type === 'number' ? target.value.replace(/\D/,'').replace('d', '') : target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    if(callback == null) this.setState(prevState => ({form: {...prevState.form, [name]: value}}));
    else this.setState(prevState => ({form: {...prevState.form, [name]: value}}), callback);
  }

  resetFilter() {
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        filterStatus: '',
      }
    }));
  }

  async getCategoryDetail() {
    let id = Number(window.location.pathname.replaceAll('/article-map-category/', ''));
    let response = await axios.get(`${Config.API_URL_2}/cms/category/${id}`, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        this.setState({ category: data.data.category });
        console.log(this.state.category);
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
  }

  async getCategoryList() {
    this.setState({ isLoading: true });
    let response = await axios.get(`${Config.API_URL_2}/cms/category`, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        this.setState({ categoriesList: data.data.categories });
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async getArticleList() {
    this.setState({ isLoading: true });
    let response = await axios.get(`${Config.API_URL_2}/cms/article`, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        this.setState({ article: { list: data.data.articles, val: null } });
        console.log(this.state.article);
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async getEbookList() {
    this.setState({ isLoading: true });
    let response = await axios.get(`${Config.API_URL_2}/admin/ebook`, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.message === 'Success get data') {
        let ebookList = data.data.ebook;
        this.setState({ ebook: { list: ebookList, val: null } });
        console.log(this.state.ebook);
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async getCategoryArticleList() {
    this.setState({ isLoading: true });
    let response = await axios.get(`${Config.API_URL_2}/cms/article?category=${this.state.category.name}`, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        this.setState({ categoryArticle: { list: data.data.articles, val: null }});
        console.log(this.state.categoryArticle);
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async getCategoryEbookList() {
    this.setState({ isLoading: true });
    let response = await axios.get(`${Config.API_URL_2}/admin/ebook/category/${this.state.category.id}`, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      console.log(data);
      if(data.statusCode === 200) {
        this.setState({ categoryEbook: { list: data.data.ebook, val: null }});
        console.log(this.state.categoryEbook);
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  toggleCatVal(article) {
    if(this.isRecommended(article)) {
      let articleID = article.id;
      let catArticlesVal = this.state.form.catArticlesVal;
      catArticlesVal.splice(catArticlesVal.indexOf(articleID), 1);
      this.setState(prevState => ({ form: { ...prevState.form }}));
    } else {
      this.setState(prevState => ({
        form: {
          ...prevState.form,
          catArticlesVal: [...this.state.form.catArticlesVal, article.id],
        }
      }));
    }
  }

  toggleCatEbookVal(ebook) {
    if(this.isRecommendedEbook(ebook)) {
      let ebookID = ebook.ebook_id;
      let catEbookVal = this.state.form.catEbookVal;
      catEbookVal.splice(catEbookVal.indexOf(ebookID), 1);
      this.setState(prevState => ({ form: { ...prevState.form }}));
    } else {
      this.setState(prevState => ({
        form: {
          ...prevState.form,
          catEbookVal: [...this.state.form.catEbookVal, ebook.ebook_id],
        }
      }));
    }
  }

  async updateCategoryArticle() {
    if(this.state.isLoading) return;
    let message = '';
    let listedCategory = [];
    for(let i=0;i<this.state.article.list.length;i++) {
      let item = this.state.article.list[i];
      if(this.state.form.catArticlesVal.includes(item.id)) {
        if(item.id_category !== this.state.category.id && item.id_category != null && !listedCategory.includes(item.id_category)) {
          if(message != '') message += ', ';
          message += `${item.category}`;
          listedCategory.push(item.id_category);
        }
      }
    }
    if(message != '') {
      message = 'dari ' + message;
      let confirm = await Swal.fire({
        title: 'Apakah anda yakin?',
        text: `Apakah Anda yakin ingin mengubah kategori ${message} ke ${this.state.category.name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya',
        cancelButtonText: 'Tidak'
      });
      if(!confirm.value) return;
    }
    this.setState({ isLoading: true });
    let formData = { };
    formData.id_category = this.state.category.id;
    formData.id_articles = this.state.form.catArticlesVal;
    let response = await axios.post(`${Config.API_URL_2}/cms/article/category/add`, formData, { headers: { token: this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        await Swal.fire('Berhasil', 'Artikel dalam kategori berhasil diubah', 'success');
        window.location.reload();
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async updateCategoryEbook() {
    if(this.state.isLoading) return;
    let message = '';
    let listedCategory = [];
    for(let i=0;i<this.state.ebook.list.length;i++) {
      let item = this.state.ebook.list[i];
      if(this.state.form.catEbookVal.includes(item.ebook_id)) {
        if(item.category_id !== this.state.category.id && item.category_id != null && !listedCategory.includes(item.category_id)) {
          if(message != '') message += ', ';
          message += `${item.category_name}`;
          listedCategory.push(item.category);
        }
      }
    }
    if(message != '') {
      message = 'dari ' + message;
      let confirm = await Swal.fire({
        title: 'Apakah anda yakin?',
        text: `Apakah Anda yakin ingin mengubah kategori ${message} ke ${this.state.category.name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya',
        cancelButtonText: 'Tidak'
      });
      if(!confirm.value) return;
    }
    this.setState({ isLoading: true });
    let formData = { };
    formData.category_id = this.state.category.id;
    formData.list_ebook_id = this.state.form.catEbookVal;
    let response = await axios.post(`${Config.API_URL_2}/admin/ebook/category`, formData, { headers: { token: this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        await Swal.fire('Berhasil', 'Artikel dalam kategori berhasil diubah', 'success');
        window.location.reload();
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async deleteCategoryArticle(article) {
    if(this.state.isLoading) return;
    let confirm = await Swal.fire({
      title: 'Apakah anda yakin?',
      text: 'Apakah Anda yakin ingin menghapus Artikel ini dari kategori?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak'
    });
    if(!confirm.value) return;
    this.setState({ isLoading: true });
    let response = await axios.delete(`${Config.API_URL_2}/cms/article/category/${article.id}`, { headers: { token: this.state.admin.token } });
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

  async deleteCategoryEbook(ebook) {
    if(this.state.isLoading) return;
    let confirm = await Swal.fire({
      title: 'Apakah anda yakin?',
      text: 'Apakah Anda yakin ingin menghapus Ebook ini dari kategori?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak'
    });
    if(!confirm.value) return;
    this.setState({ isLoading: true });
    let formData = { };
    formData.category_id = this.state.categoriesList[0].id;
    formData.list_ebook_id = [ebook.ebook_id];
    let response = await axios.post(`${Config.API_URL_2}/admin/ebook/category`, formData, { headers: { token: this.state.admin.token } });
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

  setCatValue() {
    let articles = [];
    for(let i=0;i<this.state.categoryArticle.list.length;i++) {
      let item = this.state.categoryArticle.list[i];
      articles.push(item.id);
    }
    this.setState(prevState => ({ form: { ...prevState.form, catArticlesVal: articles }}));
  }

  setCatEbookValue() {
    let ebooks = [];
    for(let i=0;i<this.state.categoryEbook.list.length;i++) {
      let item = this.state.categoryEbook.list[i];
      ebooks.push(item.ebook_id);
    }
    this.setState(prevState => ({ form: { ...prevState.form, catEbookVal: ebooks }}));
  }

  isRecommended(article) {
    return this.state.form.catArticlesVal.includes(article.id);
  }

  isRecommendedEbook(ebook) {
    return this.state.form.catEbookVal.includes(ebook.ebook_id);
  }

  showArticleList() {
    let result = [];
    for(let i=0;i<this.state.categoryArticle.list.length;i++) {
      let item = this.state.categoryArticle.list[i];
      if(this.state.form.filterStatus !== '' && item.status !== this.state.form.filterStatus) continue;
      result.push(item);
    }
    return result;
  }

  showEbookList() {
    let result = [];
    for(let i=0;i<this.state.categoryEbook.list.length;i++) {
      let item = this.state.categoryEbook.list[i];
      if(this.state.form.filterStatus !== '' && item.status !== this.state.form.filterStatus) continue;
      result.push(item);
    }
    return result;
  }

  render() {
    return (<>
      <div className="standard-2-page">
        <div className="banner">
          <div className="title d-flex flex-column flex-md-row">
            <div className="flex-grow-1 align-self-center">
              <div className="left d-flex">
                <div className="text flex-grow-1 align-self-center">Map Artikel / Artikel per kategori / {this.state.category === null ? '-' : this.state.category.name}</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{minHeight:'16px',minWidth:'16px'}}></div>
        <div>
          {this.state.categoryArticle.list.length === 0 && this.state.categoryEbook.list.length === 0 && !this.state.isLoading && <div className="category-map-list-empty mx-3">
            <div><img src={`${Config.BASE_URL}/img/empty-articles-icon.png`} /></div>
            <div style={{minHeight:'32px',minWidth:'32px'}}></div>
            <div className="note">Tidak ada artikel / ebook dalam kategori ini</div>
            <div style={{minHeight:'32px',minWidth:'32px'}}></div>
            <div><button onClick={() => {
              this.setCatValue();
              this.setCatEbookValue();
            }} className="blue-button" data-toggle="modal" data-target="#article-modal">Tambah</button></div>
            <div style={{minHeight:'16px',minWidth:'16px'}}></div>
            <div><NavLink to="/article-map"><button className="blue-button">← Kembali</button></NavLink></div>
          </div>}
          {(this.state.categoryArticle.list.length > 0 || this.state.categoryEbook.list.length > 0) && <div className="category-map-list">
            <div className="action d-flex flex-column flex-md-row justify-content-between">
              <div><NavLink to="/article-map"><button className="blue-button">← Kembali</button></NavLink></div>
              <div><button onClick={() => {
                this.setCatValue();
                this.setCatEbookValue();
              }} className="blue-button" data-toggle="modal" data-target="#article-modal">Tambah</button></div>
            </div>
            <div className="filter d-flex flex-wrap">
              <div className="article-filter-select">
                <select name="filterStatus" onChange={this.handleFormChange} value={this.state.form.filterStatus}>
                  <option value="">Status</option>
                  <option value="Draft">Draft</option>
                  <option value="Terbit">Terbit</option>
                </select>
              </div>
              <div style={{minHeight:'8px',minWidth:'8px'}}></div>
              <div onClick={this.resetFilter} className="article-filter-select">
                <i className="fa fa-refresh"></i>
              </div>
            </div>
            <div className="category-type d-flex">
              <button onClick={() => this.setState({type: 'ARTICLE'})} className={this.state.type === 'ARTICLE' ? "active" : ''}>Artikel</button>
              <div style={{minHeight:'16px',minWidth:'16px'}}></div>
              <button onClick={() => this.setState({type: 'EBOOK'})} className={this.state.type === 'EBOOK' ? "active" : ''}>Ebook</button>
            </div>
            {this.state.type === 'ARTICLE' && <div className="article-map-category-list">
              {this.showArticleList().map((item, index) => <div key={index}>
                <div onClick={() => this.setState(prevState => ({ categoryArticle: { ...this.state.categoryArticle, val: index }}))} className={`article-map clickable ${index === this.state.categoryArticle.val ? 'active' : ''}`}>
                  <div className="article-map-wrapper">
                    <div className="article-thumb" style={{backgroundImage: `url('${item.url_thumbnail}')`}}></div>
                    <div className="article-data">
                      <div className="article-title">{item.title}</div>
                      <div style={{minHeight:'10px',minWidth:'10px'}}></div>
                      <div className="article-desc">{item.caption}</div>
                      <div style={{minHeight:'10px',minWidth:'10px'}}></div>
                      <div className="article-date">{moment(item.create_at).format("dddd, DD MMMM YYYY")}</div>
                    </div>
                  </div>
                </div>
                <div className={`article-map-action ${index === this.state.categoryArticle.val ? 'show' : ''}`}>
                  <div onClick={() => this.deleteCategoryArticle(item)} className="delete-action clickable">Hapus</div>
                </div>
              </div>)}
            </div>}
            {this.state.type === 'EBOOK' && <div className="ebook-map-category-list">
              {this.showEbookList().map((item, index) => <div key={index}>
                <div onClick={() => this.setState(prevState => ({ categoryEbook: { ...this.state.categoryEbook, val: index }}))} className={`ebook-map clickable ${index === this.state.categoryEbook.val ? 'active' : ''}`}>
                  <div className="ebook-map-wrapper">
                    <div className="ebook-thumb" style={{backgroundImage: `url('${item.thumbnail}')`}}></div>
                    <div className="ebook-data">
                      <div className="ebook-title">{item.ebook_title}</div>
                      <div style={{minHeight:'10px',minWidth:'10px'}}></div>
                      <div className="ebook-date">{moment(item.create_at).format("dddd, DD MMMM YYYY")}</div>
                      <div style={{minHeight:'12px',minWidth:'12px'}}></div>
                      <div className="ebook-button">
                        <NavLink to={`/ebook-list-edit/${item.slug}?preview=1`}><button>Lihat e-book</button></NavLink>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`ebook-map-action ${index === this.state.categoryEbook.val ? 'show' : ''}`}>
                  <div onClick={() => this.deleteCategoryEbook(item)} className="delete-action clickable">Hapus</div>
                </div>
              </div>)}
            </div>}
            <div style={{minHeight:'16px',minWidth:'16px'}}></div>
          </div>}
          <div className="modal fade" id="article-modal">
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-body p-0">
                  <div className="header">
                    <div className="header-title">Daftar Artikel</div>
                    <div id="close-article-modal" className="close-it clickable" data-dismiss="modal">Tutup</div>
                  </div>
                  <div className="panel-content">
                    <div className="container">
                      <div style={{minHeight:'16px',minWidth:'16px'}}></div>
                      <div className="action d-flex flex-column flex-md-row">
                        <div className="category-type d-flex flex-grow-1">
                          <button onClick={() => this.setState({typeTable: 'ARTICLE'})} className={this.state.typeTable === 'ARTICLE' ? "active" : ''}>Artikel</button>
                          <div style={{minHeight:'16px',minWidth:'16px'}}></div>
                          <button onClick={() => this.setState({typeTable: 'EBOOK'})} className={this.state.typeTable === 'EBOOK' ? "active" : ''}>Ebook</button>
                        </div>
                        <div style={{minHeight:'16px',minWidth:'16px'}}></div>
                        {this.state.typeTable === 'ARTICLE' && <>
                          <div className="article-search-wrapper align-self-center">
                            <input name="filterArticle" type="text" className="article-search" onChange={this.handleFormChange} value={this.state.form.filterArticle} placeholder="Cari artikel"/>
                            <div className="search-icon"><img src={`${Config.BASE_URL}/img/green-search-icon.png`} /></div>
                          </div>
                          <div style={{minHeight:'16px',minWidth:'16px'}}></div>
                          <div className="align-self-center"><NavLink to="/article-list-create"><button onClick={() => document.getElementById('close-article-modal').click()} className="blue-button">Buat Artikel Baru</button></NavLink></div>
                        </>}
                        {this.state.typeTable === 'EBOOK' && <>
                          <div className="article-search-wrapper align-self-center">
                            <input name="filterEbook" type="text" className="article-search" onChange={this.handleFormChange} value={this.state.form.filterEbook} placeholder="Cari ebook"/>
                            <div className="search-icon"><img src={`${Config.BASE_URL}/img/green-search-icon.png`} /></div>
                          </div>
                          <div style={{minHeight:'16px',minWidth:'16px'}}></div>
                          <div className="align-self-center"><NavLink to="/ebook-list-create"><button onClick={() => document.getElementById('close-article-modal').click()} className="blue-button">Buat Ebook Baru</button></NavLink></div>
                        </>}
                      </div>
                      <div style={{minHeight:'12px',minWidth:'12px'}}></div>
                      {this.state.typeTable === 'ARTICLE' && <div className="overflow">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Judul</th>
                              <th>Penulis</th>
                              <th>Kategori</th>
                              <th>Tanggal dibuat</th>
                              <th>Tanggal diperbarui</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.article.list.map((item, index) => (this.state.form.filterArticle === '' || item.title.toLowerCase().includes(this.state.form.filterArticle.toLowerCase())) && <tr key={index}>
                              <td className="title">{item.title}</td>
                              <td>{item.writer}</td>
                              <td>{item.category}</td>
                              <td>{moment(item.create_at).format("DD MMMM YYYY")}</td>
                              <td>{moment(item.update_at).format("DD MMMM YYYY")}</td>
                              <td><div onClick={() => this.toggleCatVal(item)} className={`checkbox clickable ${this.isRecommended(item) ? 'active' : ''}`}>✓</div></td>
                            </tr>)}
                          </tbody>
                        </table>
                      </div>}
                      {this.state.typeTable === 'EBOOK' && <div className="overflow">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Judul</th>
                              <th>Pengunggah</th>
                              <th>Kategori</th>
                              <th>Tanggal dibuat</th>
                              <th>Tanggal diperbarui</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.ebook.list.map((item, index) => (this.state.form.filterEbook === '' || item.ebook_title.toLowerCase().includes(this.state.form.filterEbook.toLowerCase())) && <tr key={index}>
                              <td className="title">{item.ebook_title}</td>
                              <td>{item.penyusun}</td>
                              <td>{item.category_name}</td>
                              <td>{moment(item.create_at).format("DD MMMM YYYY")}</td>
                              <td>{moment(item.update_at).format("DD MMMM YYYY")}</td>
                              <td><div onClick={() => this.toggleCatEbookVal(item)} className={`checkbox clickable ${this.isRecommendedEbook(item) ? 'active' : ''}`}>✓</div></td>
                            </tr>)}
                          </tbody>
                        </table>
                      </div>}
                    </div>
                  </div>
                  <div style={{minHeight:'12px',minWidth:'12px'}}></div>
                  <div className="panel-footer">
                    <div className="container">
                      <div style={{minHeight:'16px',minWidth:'16px'}}></div>
                      <div className="action text-right">
                        {this.state.typeTable === 'ARTICLE' && <button onClick={this.updateCategoryArticle} className="green-button">Terapkan</button>}
                        {this.state.typeTable === 'EBOOK' && <button onClick={this.updateCategoryEbook} className="green-button">Terapkan</button>}
                      </div>
                      <div style={{minHeight:'16px',minWidth:'16px'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{minHeight:'32px',minWidth:'32px'}}></div>
      {this.state.isLoading && <div className="loader"></div>}
    </>);
  }
}

export default ArticleMapCategory;
