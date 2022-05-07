import React from 'react';
import { BrowserRouter as Router, Switch, Route, NavLink } from "react-router-dom";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';
import ReactTooltip from "react-tooltip";
import moment from 'moment';
import validator from 'validator';
import 'moment/locale/id';
import MUIDataTable from "mui-datatables";
import { Link } from 'react-router-dom';
import * as Config from './../../Config';
import { useHistory } from "react-router-dom";
import CreatableSelect from 'react-select/creatable';
import { Jodit } from 'jodit';
import "jodit/build/jodit.min.css";
import imageCompression from 'browser-image-compression';
moment.locale('id');

const Swal2 = withReactContent(Swal);

class EbookListEdit extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if(admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
      slug: '',
      adm: {
        list: [],
        val: null,
      },
      isPreview: window.location.search === '?preview=1',
      ebook: null,
      form: {
        title: '',
        galleryList: [],
        galleryVal: '',
        galleryFilter: '',
        gallerySelected: null,
        isGalleryEditName: false,
        galleryNewName: '',
        ebookFile: null,
        ebookFileName: null,
        ebookFileMeta: null,
        thumbnailImg: null,
        thumbnailImgName: null,
        thumbnailImgPreview: null,
        thumbnailImgMeta: null,
        thumbnailDesc: '',
        composerList: [],
        composerVal: '',
        reviewerVal: '',
        categoryImg: null,
        categoryImgPreview: null,
        categoryFilter: '',
        topicFilter: '',
        topicVal: '',
        categoryList: [],
        categoryVal: '',
        categoryName: '',
        categoryLink: '',
        editedCategory: null,
        editCategoryName: '',
        defaultTagList: [],
        tagRecommendedList: [
          { value: 'COVID-19', label: 'COVID-19' },
          { value: 'Vaccine', label: 'Vaccine' }
        ],
        tagVal: [],
        metadata: '',
        keywords: '',
        url: '',
        uploadMethod: 'UPLOAD',
        editor: null,
      },
    };
    this.handleFormChange = this.handleFormChange.bind(this);
    this.handleEbookFileChange = this.handleEbookFileChange.bind(this);
    this.handleThumbnailFileChange = this.handleThumbnailFileChange.bind(this);
    this.handleCategoryFileChange = this.handleCategoryFileChange.bind(this);
    this.handleTagChange = this.handleTagChange.bind(this);
    this.fetchCategoryList = this.fetchCategoryList.bind(this);
    this.addCategory = this.addCategory.bind(this);
    this.editCategory = this.editCategory.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
    this.setUploadMethod = this.setUploadMethod.bind(this);
    this.uploadGallery = this.uploadGallery.bind(this);
    this.fetchGalleryList = this.fetchGalleryList.bind(this);
    this.updateGalleryName = this.updateGalleryName.bind(this);
    this.updateGalleryDesc = this.updateGalleryDesc.bind(this);
    this.deleteGallery = this.deleteGallery.bind(this);
    this.getAdmList = this.getAdmList.bind(this);
    this.getEbookDetail = this.getEbookDetail.bind(this);
    this.submit = this.submit.bind(this);
    this.addEditor = this.addEditor.bind(this);
  }

  async componentDidMount() {
    this.removeClassesAndID();
    await this.fetchCategoryList();
    await this.fetchGalleryList();
    await this.getAdmList();
    await this.getEbookDetail();
  }

  // hack to remove classes & ID in image editor popup in texteditor
  removeClassesAndID() {
    setTimeout(() => {
      let joditInputClasses = document.querySelector(".jodit-input[data-ref='classes']");
      if(joditInputClasses != null) {
        let formElement = joditInputClasses.closest('.jodit-form__group');
        formElement.style.display = 'none';
      }
      let joditInputID = document.querySelector(".jodit-input[data-ref='id']");
      if(joditInputID != null) {
        let formElement = joditInputID.closest('.jodit-form__group');
        formElement.style.display = 'none';
      }
      this.removeClassesAndID();
    }, 1000);
  }

  addEditor() {
    let editor = new Jodit('#editor', {
      askBeforePasteHTML: false,
      controls: {
        font: {
          list: {
            'Inter, sans-serif': 'Inter'
          }
        }
      },
      style: {
        fontFamily: 'Inter, sans-serif',
      },
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
          childTemplate: (editor, key, value) => `<span className="${key}">${editor.i18n(value)}</span>`,
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
      ]
    });
    editor.events.on('afterPaste', (event) => {
      let html = editor.getEditorValue();
      html = html.replaceAll("font-family", "initial-font");
      editor.setEditorValue(html);
    });
    this.setState(prevState => ({ form: { ...prevState.form, editor: editor }}));
  }

  countWords(str) {
    str = str.replace(/(^\s*)|(\s*$)/gi,"");
    str = str.replace(/[ ]{2,}/gi," ");
    str = str.replace(/\n /,"\n");
    return str.split(' ').length;
  }

  async getEbookDetail() {
    let slug = window.location.pathname.replaceAll('/ebook-list-edit/', '');
    this.setState({ isLoading: true, slug: slug });
    let response = await axios.get(`${Config.API_URL_2}/admin/ebook/${slug}`, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.message === 'Success get data') {
        let detail = data.data;
        console.log(detail);
        let thumbnail = null;
        for(let i=0;i<this.state.form.galleryList.length;i++) {
          let item = this.state.form.galleryList[i];
          if(item.id === detail.thumbnail_id) {
            thumbnail = item; break;
          }
        }
        let composerID = '';
        for(let i=0;i<this.state.form.composerList.length;i++) {
          let item = this.state.form.composerList[i];
          if(item.id === detail.penyusun_id) composerID = i;
        }
        let categoryID = '';
        for(let i=0;i<this.state.form.categoryList.length;i++) {
          let item = this.state.form.categoryList[i];
          if(item.id === detail.category_id) categoryID = i;
        }
        let defaultTagList = [];
        defaultTagList = detail.tags.map((item, index) => ({label: item, value: item}));
        await this.addEditor();
        this.state.form.editor.setEditorValue(detail.ebook_description);

        this.setState(prevState => ({
          ebook: detail,
          form: {
            ...prevState.form,
            title: detail.ebook_title,
            defaultTagList: defaultTagList,
            gallerySelected: thumbnail,
            composerVal: composerID,
            reviewerVal: detail.peninjau,
            categoryVal: categoryID,
            thumbnailDesc: thumbnail == null ? '' : thumbnail.caption,
            metadata: detail.metadata ?? '',
          },
        }));
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async getAdmList() {
    this.setState({ isLoading: true });
    let response = await axios.get(`${Config.API_URL_2}/cms/admin`, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        let admList = data.data.admin;
        let composerList = [];
        for(let i=0;i<admList.length;i++) {
          let item = admList[i];
          if(item.role.includes('Penyusun')) composerList.push(item);
        }
        this.setState(prevState => ({
          adm: { list: data.data.admin, val: null },
          form: {
            ...prevState.form,
            composerList: composerList,
            composerVal: '',
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

  copyText(text) {
    navigator.clipboard.writeText(text);
  }

  async handleCategoryFileChange(event) {
    if(this.state.isLoading) return;
    this.setState({isLoading: true});
    let context = this;
    let file = event.target.files[0];
    if(file != null) {
      file = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
        useWebWorker: true
      });
      let reader = new FileReader();
      this.state.form.categoryImg = file;
      reader.addEventListener("load", function() {
        context.state.form.categoryImgPreview = reader.result;
        let img = new Image();
        img.onload = () => {
          context.setState({form: context.state.form});
        }
        img.src = context.state.form.categoryImgPreview;
      }, false);
      reader.readAsDataURL(file);
    } else {
      this.state.form.categoryImg = null;
      this.state.form.categoryImgPreview = null;
    }
    this.setState({isLoading: false, form: this.state.form});
  }

  async fetchCategoryList(defaultArticle = null) {
    this.setState(prevState => ({
      isLoading: true,
      form: {
        ...prevState.form,
        categoryList: [],
        categoryVal: '',
        categoryName: '',
      }
    }));
    let response = await axios.get(`${Config.API_URL_2}/cms/category`, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        let categoryList = data.data.categories;
        let categoryVal = '';
        if(defaultArticle != null) {
          for(let i=0;i<categoryList.length;i++) {
            let item = categoryList[i];
            if(item.id === defaultArticle.id) {
              categoryVal = i; break;
            }
          }
        }
        this.setState(prevState => ({
          form: {
            ...prevState.form,
            categoryList: categoryList,
            categoryVal: categoryVal,
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
    if(this.state.form.categoryName === '') return Swal.fire('Nama Topik wajib diisi');
    if(this.state.form.categoryImg == null && this.state.form.categoryLink === '') return Swal.fire('Gambar Topik wajib diisi');
    this.setState({ isLoading: true });
    let formData = new FormData();
    let type = '';
    if(this.state.form.categoryLink !== '') type = 'LINK';
    if(this.state.form.categoryImg != null) type = 'UPLOAD';
    formData.append('name', this.state.form.categoryName);
    if(type !== '') formData.append('type', type);
    if(type === 'LINK') formData.append('link', this.state.form.categoryLink);
    if(type === 'UPLOAD') formData.append('category_image', this.state.form.categoryImg);
    let response = await axios.post(`${Config.API_URL_2}/cms/category`, formData, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 201) {
        let newArticle = data.data.category;
        await Swal.fire('Success', 'Topik Berhasil ditambahkan', 'success');
        this.fetchCategoryList(newArticle);
        if(document.getElementById('close-topic-modal') != null) document.getElementById('close-topic-modal').click();
        this.setState(prevState => ({ form: { ...prevState.form, topicVal: '', categoryName: '', categoryLink: '', categoryImg: null, categoryImgPreview: null }}));
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async editCategory() {
    if(this.state.isLoading) return;
    if(this.state.form.categoryName === '') return Swal.fire('Nama Topik wajib diisi');
    this.setState({ isLoading: true });
    let formData = new FormData();
    formData.append('name', this.state.form.categoryName);
    let type = '';
    if(this.state.form.categoryLink !== '') type = 'LINK';
    if(this.state.form.categoryImg != null) type = 'UPLOAD';
    if(type !== '') formData.append('type', type);
    if(type === 'LINK') formData.append('link', this.state.form.categoryLink);
    if(type === 'UPLOAD') formData.append('category_image', this.state.form.categoryImg);
    let response = await axios.put(`${Config.API_URL_2}/cms/category/${this.state.form.categoryList[this.state.form.topicVal].id}`, formData, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        let category = this.state.form.categoryList[this.state.form.topicVal];
        await Swal.fire('Success', 'Status topik berhasil diubah', 'success');
        document.getElementById('close-topic-modal').click();
        this.setState(prevState => ({ form: { ...prevState.form, topicVal: '', categoryName: '', categoryImg: null, categoryImgPreview: null }}), () => this.fetchCategoryList(category));
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      console.log(error);
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState(prevState => ({ form: { ...prevState.form }, isLoading: false }));
  }

  async deleteCategory(category) {
    if(this.state.isLoading) return;
    let confirm = await Swal.fire({
      title: 'Hapus Topik ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
    });
    if(!confirm.value) return;
    this.setState({ isLoading: true });
    let response = await axios.delete(`${Config.API_URL_2}/cms/category/${category.id}`, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        await Swal.fire('Success', 'Topik berhasil dihapus', 'success');
        this.fetchCategoryList();
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState(prevState => ({ form: { ...prevState.form }, isLoading: false }));
  }

  setUploadMethod(method) {
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        uploadMethod: method,
      }
    }));
  }

  handleTagChange(newValue: any, actionMeta: any) {
    let tags = [];
    if(newValue !== null) {
      for(let i=0;i<newValue.length;i++) {
        tags.push(newValue[i].value);
      }
    }
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        tagVal: tags
      }
    }));
  }

  handleFormChange(event, callback = null) {
    const target = event.target;
    let value = target.type === 'number' ? target.value.replace(/\D/,'').replace('d', '') : target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    if(name === 'title') {
      if(this.countWords(value) > 300) return;
    }
    if(callback == null) this.setState(prevState => ({form: {...prevState.form, [name]: value}}));
    else this.setState(prevState => ({form: {...prevState.form, [name]: value}}), callback);
  }

  async handleEbookFileChange(event) {
    if(this.state.isLoading) return;
    this.setState({isLoading: true});
    let context = this;
    let file = event.target.files[0];
    if(file != null) {
      this.state.form.ebookFile = file;
      this.state.form.ebookFileName = file.name;
      this.state.form.ebookFileMeta = { size: Number(file.size / 1024) };
    } else {
      this.state.form.ebookFile = null;
      this.state.form.ebookFileName = null;
      this.state.form.ebookFileMeta = null;
    }
    console.log(this.state.form.ebookFile);
    this.setState({isLoading: false, form: this.state.form});
  }

  async handleThumbnailFileChange(event) {
    if(this.state.isLoading) return;
    this.setState({isLoading: true});
    let context = this;
    let file = event.target.files[0];
    if(file != null) {
      this.state.form.thumbnailImgName = file.name;
      file = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
        useWebWorker: true
      });
      this.state.form.thumbnailImg = file;
      let reader = new FileReader();
      reader.addEventListener("load", function() {
        context.state.form.thumbnailImgPreview = reader.result;
        let img = new Image();
        img.onload = () => {
          context.state.form.thumbnailImgMeta = { height: img.height, width: img.width };
          context.setState({form: context.state.form}, context.uploadGallery);
        }
        img.src = context.state.form.thumbnailImgPreview;
      }, false);
      reader.readAsDataURL(file);
    } else {
      this.state.form.thumbnailImg = null;
      this.state.form.thumbnailImgName = null;
      this.state.form.thumbnailImgPreview = null;
      this.state.form.thumbnailImgMeta = null;
    }
    this.setState({isLoading: false, form: this.state.form});
  }

  async fetchGalleryList() {
    this.setState(prevState => ({
      isLoading: true,
      form: {
        ...prevState.form,
        galleryList: [],
        galleryVal: '',
        gallerySelected: null,
      }
    }));
    let response = await axios.get(`${Config.API_URL_2}/cms/images-gallery`, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        this.setState(prevState => ({
          form: {
            ...prevState.form,
            galleryList: data.data.images,
          }
        }));
        console.log(this.state.form.galleryList);
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async uploadGallery() {
    if(this.state.isLoading) return;
    this.setState({ isLoading: true });
    let formData = new FormData();
    formData.append('dimension', `${this.state.form.thumbnailImgMeta.height} x ${this.state.form.thumbnailImgMeta.width}`);
    formData.append('name', this.state.form.thumbnailImgName);
    formData.append('image_gallery', this.state.form.thumbnailImg);
    let response = await axios.post(`${Config.API_URL_2}/cms/images-gallery`, formData, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 201) {
        this.setState(prevState => ({
          form: {
            ...prevState.form,
            thumbnailImg: null,
            thumbnailImgPreview: null,
            thumbnailImgMeta: null,
            uploadMethod: 'GALLERY',
          }
        }), this.fetchGalleryList);
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  downloadEbook(slug) {
    axios.post(`${Config.API_PUBLIC_URL}/ebook/${slug}`).then((response) => console.log(response));
  }

  async updateGalleryName() {
    if(this.state.isLoading) return;
    if(this.state.form.galleryNewName === '') return Swal.fire('Nama Galeri wajib diisi');
    this.setState({ isLoading: true });
    let formData = { };
    formData.name = this.state.form.galleryNewName;
    let response = await axios.put(`${Config.API_URL_2}/cms/images-gallery/${this.state.form.galleryList[this.state.form.galleryVal].id}`, formData, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        this.state.form.galleryList[this.state.form.galleryVal].name = this.state.form.galleryNewName;
        this.state.form.galleryList[this.state.form.galleryVal].urlAfterEdit = data.data.link;
        this.setState(prevState => ({
          form: {
            ...prevState.form,
            isGalleryEditName: false,
            galleryNewName: '',
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

  async updateGalleryDesc() {
    if(this.state.isLoading) return;
    if(this.state.form.thumbnailDesc === '') return Swal.fire('Deskripsi wajib diisi');
    this.setState({ isLoading: true });
    let formData = { };
    formData.caption = this.state.form.thumbnailDesc;
    let response = await axios.put(`${Config.API_URL_2}/cms/images-gallery/caption/${this.state.form.gallerySelected.id}`, formData, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        this.state.form.gallerySelected.caption = this.state.form.thumbnailDesc;
        Swal.fire('Success', 'Deskripsi berhasil diubah', 'success');
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async deleteGallery() {
    if(this.state.isLoading) return;
    let gallery = this.state.form.galleryList[this.state.form.galleryVal];
    let confirm = await Swal.fire({
      title: 'Hapus Galeri ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
    });
    if(!confirm.value) return;
    this.setState({ isLoading: true });
    let response = await axios.delete(`${Config.API_URL_2}/cms/images-gallery/${gallery.id}`, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        await Swal.fire('Success', 'Galeri berhasil dihapus', 'success');
        this.fetchGalleryList();
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState(prevState => ({ form: { ...prevState.form }, isLoading: false }));
  }

  async submit(status) {
    if(this.state.isLoading) return;
    let content = this.state.form.editor.getEditorValue();
    if(validator.isEmpty(this.state.form.title)) return Swal.fire('Judul Ebook wajib diisi');
    if(status === 'Terbit' && this.state.form.gallerySelected === null) return Swal.fire('Thumbnail wajib diisi');
    if(status === 'Terbit' && this.state.form.categoryVal === '') return Swal.fire('Topik wajib diisi');
    if(status === 'Terbit' && this.state.form.composerVal === '') return Swal.fire('Penyusun wajib diisi');
    this.setState({ isLoading: true });
    let formData = new FormData();
    formData.append('ebook_id', this.state.ebook.ebook_id);
    formData.append('ebook_title', this.state.form.title);
    if(this.state.form.categoryVal !== '') formData.append('category_id', this.state.form.categoryList[this.state.form.categoryVal].id);
    if(this.state.form.gallerySelected !== null) formData.append('thumbnail_id', this.state.form.gallerySelected.id);
    if(this.state.form.composerVal !== '') formData.append('penyusun_id', this.state.form.composerList[this.state.form.composerVal].id);
    formData.append('peninjau', this.state.form.reviewerVal);
    if(this.state.form.ebookFile !== null) formData.append('ebook_file', this.state.form.ebookFile);
    formData.append('ebook_description', content);
    if(status !== 'Draft' || this.state.form.metadata !== '') formData.append('ebook_metadata', this.state.form.metadata);
    formData.append('ebook_keyword', '');
    formData.append('status', status);
    if(status !== 'Draft' || this.state.form.tagVal.length > 0) formData.append('tags', this.state.form.tagVal);
    let response = await axios.post(`${Config.API_URL_2}/admin/ebook`, formData, { headers: { 'token': this.state.admin.token } });
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
              <div className="left d-flex flex-column flex-md-row">
                <NavLink to="/ebook-list"><div className="back clickable align-self-center"><svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.9999 6.99997H4.41394L9.70694 1.70697L8.29294 0.292969L0.585938 7.99997L8.29294 15.707L9.70694 14.293L4.41394 8.99997H18.9999V6.99997Z" fill="#3E8CB9"/></svg></div></NavLink>
                <div style={{width: '12px'}}></div>
                <div className="text flex-grow-1 align-self-center">
                  <div>{this.state.isPreview ? 'Lihat' : 'Ubah'} Ebook</div>
                </div>
                <div style={{minHeight:'16px',minWidth:'16px'}}></div>
                {!this.state.isPreview && <div className="action d-flex flex-column flex-md-row">
                  <button onClick={() => this.submit('Draft')} className="blue-outline-button">Simpan sebagai draf</button>
                  <div style={{minHeight:'16px',minWidth:'16px'}}></div>
                  <button onClick={() => this.setState({ isPreview: true })} disabled={this.state.isLoading} className="green-button">Pratinjau</button>
                  <div style={{minHeight:'16px',minWidth:'16px'}}></div>
                  <button onClick={() => this.submit('Terbit')} className="blue-button">Terbitkan</button>
                </div>}
                {this.state.isPreview && <div className="action d-flex flex-column flex-md-row">
                  {window.location.search !== '?preview=1' && <button onClick={() => this.setState({ isPreview: false })} className="green-outline-button">Tutup pratinjau</button>}
                  {window.location.search === '?preview=1' && <NavLink to="/ebook-list"><button className="green-outline-button">Tutup pratinjau</button></NavLink>}
                </div>}
              </div>
            </div>
          </div>
        </div>
        <div style={{display: this.state.isPreview ? 'none' : 'flex'}} className="flex-column flex-md-row">
          <div className="left flex-grow-1">
            <div className="article-form">
              <div className="container">
                <div className="group">
                  <div className="d-flex justify-content-between">
                    <label>Judul Ebook</label>
                    <div>{this.state.form.title === '' ? '0' : this.countWords(this.state.form.title)} / 300 kata</div>
                  </div>
                  <input name="title" type="text" onChange={this.handleFormChange} value={this.state.form.title} placeholder="Buat Judul Baru"/>
                </div>
                <div className="group">
                  <label>Unggah Ebook</label>
                  {this.state.ebook !== null && <div><small className="text-secondary"><em>* kosongkan jika tidak ingin mengubah <a href={this.state.ebook.ebook_file} download>pdf yang sudah diupload</a></em></small></div>}
                  <div>
                    <input id="ebook-input" type="file" onChange={this.handleEbookFileChange} accept=".pdf" style={{display:'none'}}/>
                    {this.state.form.ebookFile == null && <div onClick={() => document.getElementById('ebook-input').click()} className="upload-area clickable">
                      <div className="d-flex justify-content-between">
                        <div className="left">
                          <div className="upload-caption">Unggah Ebook</div>
                          <div style={{minHeight:'4px',minWidth:'4px'}}></div>
                          <div className="upload-desc">Unggah ebook dengan format pdf</div>
                        </div>
                        <div style={{minHeight:'12px',minWidth:'12px'}}></div>
                        <div className="right align-self-center"><img src={`${Config.BASE_URL}/img/upload-ebook-icon.png`} alt=""/></div>
                      </div>
                    </div>}
                    {this.state.form.ebookFile != null && <div className="upload-area">
                      <div className="d-flex">
                        <div className="ebook-title flex-grow-1">{this.state.form.ebookFileName}</div>
                        <div style={{minHeight:'16px',minWidth:'16px'}}></div>
                        <div className="ebook-size align-self-center">{new Intl.NumberFormat().format(this.state.form.ebookFileMeta.size)}KB</div>
                        <div style={{minHeight:'16px',minWidth:'16px'}}></div>
                        <div onClick={() => {
                          if(document.getElementById('ebook-input') != null) document.getElementById('ebook-input').value= null;
                          this.setState(prevState => ({
                           form: {
                             ...prevState.form,
                             ebookFile: null,
                             ebookFileName: null,
                             ebookFileMeta: null,
                           }
                         }));
                        }} className="ebook-delete align-self-center clickable">Hapus</div>
                      </div>
                    </div>}
                  </div>
                </div>
                <div className="group">
                  <label>Deskripsi</label>
                  <div id="text-editor-wrapper">
                    <div className="page-wrapper">
                      <div id={`editor`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{minWidth:'20px',minHeight:'20px'}}></div>
          <div className="right meta-section">
            <div className="meta-card">
              <div data-toggle="collapse" data-target="#meta-thumbnail" className="card-toggler clickable">
                <div className="text align-self-center">Gambar Thumbnail</div>
                <div style={{minWidth:'20px'}}></div>
                <div className="align-self-center"><img src={`${Config.BASE_URL}/img/down-icon.png`} /></div>
              </div>
              <div id="meta-thumbnail" className="container collapse">
                <div className="meta-wrapper">
                  {this.state.form.gallerySelected !== null && <div className="thumbnail-preview-img" style={{backgroundImage: `url('${this.state.form.gallerySelected.url}')`}}></div>}
                  {this.state.form.gallerySelected === null && <div data-toggle="modal" data-target="#thumbnail-modal" className="image-config clickable">Atur Gambar</div>}
                  {this.state.form.gallerySelected !== null && <button data-toggle="modal" data-target="#thumbnail-modal" className="upload-thumbnail">Ganti Gambar</button>}
                  {this.state.form.gallerySelected !== null && <div onClick={() => { this.setState(prevState => ({ form: { ...prevState.form, gallerySelected: null }}));  }} className="delete-command clickable">Hapus gambar</div>}
                  {this.state.form.gallerySelected !== null && <><div className="group text-left">
                    <label>Deskripsi</label>
                    <input name="thumbnailDesc" type="text" onChange={this.handleFormChange} value={this.state.form.thumbnailDesc} placeholder="Tulis Deskripsi"/>
                  </div>
                  <div style={{minWidth:'20px',minHeight:'20px'}}></div>
                  <div className="group">
                    <button onClick={this.updateGalleryDesc} className="color-button">Simpan</button>
                  </div></>}
                  <div className="modal fade" id="thumbnail-modal">
                    <div className="modal-dialog modal-xl">
                      <div className="modal-content">
                        <div className="modal-body p-0">
                          <div className="header">
                            <div className="header-title">Galleri Media</div>
                            <div id="close-gallery-modal" className="close-it clickable" data-dismiss="modal">Tutup</div>
                          </div>
                          <div className="panel-tab">
                            <div onClick={() => this.setUploadMethod('UPLOAD')} className={`panel-tab-item clickable ${this.state.form.uploadMethod === 'UPLOAD' ? 'active' : ''}`}>Unggah Media</div>
                            <div onClick={() => this.setUploadMethod('GALLERY')} className={`panel-tab-item clickable ${this.state.form.uploadMethod === 'GALLERY' ? 'active' : ''}`}>Dari Galleri</div>
                          </div>
                          <div className="panel-content">
                            {this.state.form.uploadMethod === 'UPLOAD' && <div className="panel-upload-content">
                              <input id="meta-thumbnail-input" type="file" onChange={this.handleThumbnailFileChange} style={{display:'none'}}/>
                              <div className="pick-img align-self-center clickable" onClick={() => document.getElementById('meta-thumbnail-input').click()}>Pilih Gambar</div>
                              <div style={{minHeight: '16px'}}></div>
                              <div className="pick-img-note">Ukuran Maksimal gambar : 50 MB</div>
                            </div>}
                            {this.state.form.uploadMethod === 'GALLERY' && <div className="panel-gallery">
                              <div className="d-flex flex-column-reverse flex-md-row h-100">
                                <div className="left flex-grow-1">
                                  <div className="search-bar">
                                    <input name="galleryFilter" onChange={this.handleFormChange} type="text" className="gallery-filter-input" placeholder=""/>
                                    <div className="search-icon"><img src={`${Config.BASE_URL}/img/search-icon.png`} /></div>
                                  </div>
                                  <div className="panel-gallery-list d-flex flex-wrap">
                                    {this.state.form.galleryList.map((item, index) => (this.state.form.galleryFilter === '' || item.name.toLowerCase().includes(this.state.form.galleryFilter.toLowerCase())) && <div key={index} onClick={() => this.setState(prevState => ({ form: { ...prevState.form, galleryVal: index, thumbnailDesc: item.caption } }))} className={`panel-gallery-item clickable ${this.state.form.galleryVal === index ? 'active' : ''}`} style={{backgroundImage: `url('${item.url}')`}}></div>)}
                                  </div>
                                </div>
                                <div className="right flex-grow-1">
                                  <div className="gallery-detail">
                                    {this.state.form.galleryVal !== '' && <div className="gallery-detail-wrapper">
                                      <div className="gallery-image" style={{backgroundImage: `url('${this.state.form.galleryList[this.state.form.galleryVal].url}')`}}></div>
                                      <div className="d-flex justify-content-between">
                                        {!this.state.form.isGalleryEditName && <div className="gallery-name">{this.state.form.galleryList[this.state.form.galleryVal].name}</div>}
                                        {this.state.form.isGalleryEditName && <div className="group my-2"><input type="text" name="galleryNewName" onChange={this.handleFormChange} value={this.state.form.galleryNewName}/></div>}
                                        <div style={{minWidth:'8px',minHeight:'8px'}}></div>
                                        {!this.state.form.isGalleryEditName && <div onClick={() => this.setState(prevState => ({
                                          form: {
                                            ...prevState.form,
                                            isGalleryEditName: !this.state.form.isGalleryEditName,
                                            galleryNewName: this.state.form.isGalleryEditName ? '' : this.state.form.galleryList[this.state.form.galleryVal].name,
                                          }
                                        }))} className="change-name clickable">Ubah nama</div>}
                                        {this.state.form.isGalleryEditName && <div>
                                          <div onClick={this.updateGalleryName} className="change-name clickable">Simpan</div>
                                          <div onClick={() => this.setState(prevState => ({ form: { ...prevState.form, isGalleryEditName: false, galleryNewName: '' }}))} className="delete-gallery-img clickable">Batal</div>
                                        </div>}
                                      </div>
                                      <div className="gallery-image-meta">{moment(this.state.form.galleryList[this.state.form.galleryVal].create_at).format("MMMM DD YYYY")}, {this.state.form.galleryList[this.state.form.galleryVal].size}</div>
                                      <div className="gallery-image-meta">{this.state.form.galleryList[this.state.form.galleryVal].dimension} pixels</div>
                                      <div onClick={this.deleteGallery} className="delete-gallery-img text-right clickable">Hapus gambar dari galeri</div>
                                      <div style={{minWidth:'12px',minHeight:'12px'}}></div>
                                      <div className="group">
                                        <label>Copy Link Image</label>
                                        <textarea rows="3" value={this.state.form.galleryList[this.state.form.galleryVal].urlAfterEdit != null ? this.state.form.galleryList[this.state.form.galleryVal].urlAfterEdit : this.state.form.galleryList[this.state.form.galleryVal].url} readOnly></textarea>
                                      </div>
                                      <div style={{minWidth:'12px',minHeight:'12px'}}></div>
                                      <div className="group">
                                        <button onClick={() => {
                                          this.setState(prevState => ({ form: { ...prevState.form, gallerySelected: this.state.form.galleryList[this.state.form.galleryVal] }}));
                                          document.getElementById('close-gallery-modal').click();
                                        }} className="color-button">Pilih Gambar</button>
                                      </div>
                                    </div>}
                                  </div>
                                </div>
                              </div>
                            </div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="meta-card">
              <div data-toggle="collapse" data-target="#meta-writer-editor" className="card-toggler clickable">
                <div className="text align-self-center">Penyusun, Peninjau</div>
                <div style={{minWidth:'20px'}}></div>
                <div className="align-self-center"><img src={`${Config.BASE_URL}/img/down-icon.png`} /></div>
              </div>
              <div id="meta-writer-editor" className="container collapse">
                <div className="meta-wrapper">
                  <div className="group">
                    <label>Penyusun</label>
                    <select name="composerVal" onChange={this.handleFormChange} value={this.state.form.composerVal}>
                      <option value="">-- Pilih Penyusun --</option>
                      {this.state.form.composerList.map((item, index) => <option key={index} value={index}>{item.name}</option>)}
                    </select>
                  </div>
                  <div className="group">
                    <label>Peninjau Materi</label>
                    <input name="reviewerVal" onChange={this.handleFormChange} value={this.state.form.reviewerVal} type="text" placeholder="Tulis Peninjau Materi"/>
                  </div>
                </div>
              </div>
            </div>
            <div className="meta-card">
              <div data-toggle="collapse" data-target="#meta-category" className="card-toggler clickable">
                <div className="text align-self-center">Topik</div>
                <div style={{minWidth:'20px'}}></div>
                <div className="align-self-center"><img src={`${Config.BASE_URL}/img/down-icon.png`} /></div>
              </div>
              <div id="meta-category" className="container collapse">
                <div className="meta-wrapper">
                  <div className="category-list">
                    <div className="group">
                      <input name="categoryFilter" onChange={this.handleFormChange} type="text" className="category-filter-input" placeholder=""/>
                      <div className="search-icon"><img src={`${Config.BASE_URL}/img/search-icon.png`} /></div>
                    </div>
                    <div style={{minHeight:'8px'}}></div>
                    {this.state.form.categoryList.map((item, index) => (this.state.form.categoryFilter === '' || item.name.toLowerCase().includes(this.state.form.categoryFilter.toLowerCase())) && <div key={index} className="category-item-wrapper">
                      <div className="category-item flex-grow-1">
                        <div onClick={() => this.setState(prevState => ({ form: { ...prevState.form, categoryVal: index }}))} className={`radio-box align-self-center ${this.state.form.categoryVal !== '' && this.state.form.categoryList[this.state.form.categoryVal] === item ? 'active' : ''}`}><div className="radio-box-content"></div></div>
                        <div style={{minWidth:'12px'}}></div>
                        <div className="category-text">{item.name}</div>
                        {/* index > 0 && <div style={{minWidth:'12px'}}></div> */}
                        {/* index > 0 && <div onClick={() => this.setEditCategory(item)} className="category-edit-icon clickable"><img src={`${Config.BASE_URL}/img/category-edit-icon.png`} /></div> */}
                      </div>
                      {index > 0 && <div style={{minWidth:'12px'}}></div>}
                      {index > 0 && <div onClick={() => this.deleteCategory(item)} className="category-edit-icon align-self-center clickable"><img src={`${Config.BASE_URL}/img/remove-timeslot-icon.png`} /></div>}
                    </div>)}
                  </div>
                  <div style={{minWidth:'20px',minHeight:'20px'}}></div>
                  <div className="group">
                    <button onClick={() => this.setState(prevState => ({
                      form: {
                        ...prevState.form,
                        editedCategory: null,
                        categoryName: '',
                        categoryLink: '',
                        categoryImg: null,
                        categoryImgPreview: null,
                        topicVal: '',
                      }
                    }))} data-toggle="modal" data-target="#topic-modal" className="color-button">Tambah Topik</button>
                    <div className="modal fade" id="topic-modal">
                      <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                          <div className="modal-body p-0">
                            <div className="header">
                              <div className="header-title">Galleri Media</div>
                              <div id="close-topic-modal" className="close-it clickable" data-dismiss="modal">Tutup</div>
                            </div>
                            <div className="panel-content d-flex flex-md-row flex-column">
                              <div className="panel-upload-content">
                                <div className="topic-form group text-left">
                                  <label>Nama Topik</label>
                                  <input name="categoryName" type="text" onChange={this.handleFormChange} value={this.state.form.categoryName} placeholder="Tulis Nama Topik"/>
                                </div>
                                <div style={{minHeight: '24px'}}></div>
                                <input id="topic-img-input" type="file" onChange={this.handleCategoryFileChange} style={{display:'none'}} accept=".jpg,.jpeg,.png"/>
                                <div className="pick-img-wrapper" style={{backgroundImage: this.state.form.categoryImgPreview === null ? this.state.form.categoryLink !== '' ? `url('${this.state.form.categoryLink}')` : (this.state.form.topicVal !== '' ? `url('${this.state.form.categoryList[this.state.form.topicVal].image}')` : '') : `url('${this.state.form.categoryImgPreview}')`}}>
                                  <div className={`pick-img-wrapper-2 ${this.state.form.categoryImgPreview === null && this.state.form.topicVal === '' && this.state.form.categoryLink === '' ? '' : 'active'}`}>
                                    <div className="pick-img align-self-center clickable" onClick={() => document.getElementById('topic-img-input').click()}>Pilih Gambar</div>
                                    <div style={{minHeight: '16px'}}></div>
                                    <div className="pick-img-note">Ukuran Maksimal gambar : 50 MB</div>
                                    {this.state.form.topicVal !== '' && <div className="pick-img-note"><em>(Isi untuk mengubah gambar)</em></div>}
                                  </div>
                                </div>
                                <div style={{minHeight: '24px'}}></div>
                                {this.state.form.topicVal === '' && <button onClick={this.addCategory} className="color-button">Tambahkan</button>}
                                {this.state.form.topicVal !== '' && <button onClick={this.editCategory} className="color-button">Ubah</button>}
                                {this.state.form.topicVal !== '' && <>
                                <div style={{minHeight: '12px'}}></div>
                                <button onClick={() => this.setState(prevState => ({ form: { ...prevState.form, topicVal: '', categoryName: '', categoryImg: null, categoryImgPreview: null }}))} className="red-button">Tutup</button>
                                </>}
                              </div>
                              <div className="panel-gallery">
                                <div className="d-flex flex-column-reverse flex-md-row h-100">
                                  <div className="left flex-grow-1">
                                    <div style={{minHeight: '16px'}}></div>
                                    <div className="search-bar">
                                      <input name="topicFilter" onChange={this.handleFormChange} type="text" className="gallery-filter-input" placeholder=""/>
                                      <div className="search-icon"><img src={`${Config.BASE_URL}/img/search-icon.png`} /></div>
                                    </div>
                                    <div className="panel-gallery-list d-flex flex-wrap">
                                      {this.state.form.categoryList.map((item, index) => (this.state.form.topicFilter === '' || item.name.toLowerCase().includes(this.state.form.topicFilter.toLowerCase())) && <div key={index} onClick={() => this.setState(prevState => ({
                                        form: {
                                          ...prevState.form,
                                          categoryLink: item.image,
                                          categoryImg: null,
                                          categoryImgPreview: null
                                        }
                                      }))} className={`panel-gallery-item clickable ${this.state.form.topicVal === index ? 'active' : ''}`} style={{backgroundImage: `url('${item.image}')`}}></div>)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="meta-card">
              <div data-toggle="collapse" data-target="#meta-tag" className="card-toggler clickable">
                <div className="text align-self-center">Tag</div>
                <div style={{minWidth:'20px'}}></div>
                <div className="align-self-center"><img src={`${Config.BASE_URL}/img/down-icon.png`} /></div>
              </div>
              <div id="meta-tag" className="container collapse">
                <div className="meta-wrapper">
                  <div className="group">
                    {this.state.ebook !== null && <CreatableSelect isMulti onChange={this.handleTagChange} options={this.state.form.tagRecommendedList} defaultValue={this.state.form.defaultTagList}/>}
                  </div>
                  <div className="small-note">Pisahkan dengan tombol Enter.</div>
                </div>
              </div>
            </div>
            <div className="meta-card">
              <div data-toggle="collapse" data-target="#meta-metadata" className="card-toggler clickable">
                <div className="text align-self-center">Metadata</div>
                <div style={{minWidth:'20px'}}></div>
                <div className="align-self-center"><img src={`${Config.BASE_URL}/img/down-icon.png`} /></div>
              </div>
              <div id="meta-metadata" className="container collapse">
                <div className="meta-wrapper">
                  <div className="small-note text-right">{this.state.form.metadata.length} / 150 karakter</div>
                  <div className="group">
                    <textarea name="metadata" rows="4" maxLength="150" onChange={this.handleFormChange} value={this.state.form.metadata}></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{minWidth:'20px',minHeight:'20px'}}></div>
        </div>
        {this.state.isPreview && this.state.ebook != null && <div className="container ebook-preview" style={{maxWidth: '700px'}}>
          <div style={{minHeight: '40px'}}></div>
          <div className="article-title">{this.state.form.title}</div>
          <div className="article-meta">
            {this.state.form.composerVal !== '' && <div className="writer">Penyusun : <span className="text-info">{this.state.form.composerList[this.state.form.composerVal].name}</span></div>}
          </div>
          <div className="article-meta d-flex justify-content-between">
            {this.state.form.reviewerVal !== '' && <div className="writer">Ditinjau oleh : <span className="text-info">{this.state.form.reviewerVal}</span></div>}
            <div className="date">{moment().format("dddd, DD MMMM YYYY")}</div>
          </div>
          {this.state.form.categoryVal !== '' && <div className="article-category">{this.state.form.categoryList[this.state.form.categoryVal].name}</div>}
          <div style={{minHeight: '30px'}}></div>
          <div className="d-flex flex-column flex-md-row">
            <div className="cover">
              {this.state.form.gallerySelected !== null && <img src={this.state.form.gallerySelected.url} alt=""/>}
              <div style={{minHeight: '30px'}}></div>
              <div className="download-button">
                {this.state.ebook !== null && <a href={this.state.ebook.ebook_file} onClick={() => this.downloadEbook(this.state.ebook.slug)} download><button>Unduh e-book</button></a>}
                {this.state.ebook == null && <a href="#"><button>Unduh e-book</button></a>}
              </div>
            </div>
            <div style={{minHeight: '40px',minWidth: '40px'}}></div>
            <div className="description d-flex flex-column">
              <div className="description-header">Deskripsi</div>
              <div style={{minHeight: '16px',minWidth: '16px'}}></div>
              <div className="content flex-grow-1" dangerouslySetInnerHTML={{__html: this.state.form.editor.getEditorValue()}}></div>
              <div style={{minHeight: '16px',minWidth: '16px'}}></div>
              <div className="article-share d-flex flex-column flex-md-row">
                <div className="share-text align-self-center">Bagikan</div>
                <div style={{minHeight:'12px',minWidth:'12px'}}></div>
                <div className="share-socmed d-flex align-self-center">
                  <div className="clickable">
                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${Config.USER_BASE_URL}/ebook/${this.state.ebook.slug}`)}&text=${this.state.ebook.ebook_title}`} target="_blank" rel="noreferrer">
                      <img src={`${Config.BASE_URL}/img/share-twitter-icon.png`} alt=""/>
                    </a>
                  </div>
                  <div style={{minHeight:'2px',minWidth:'2px'}}></div>
                  <div className="clickable">
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${Config.USER_BASE_URL}/ebook/${this.state.ebook.slug}`)}`} target="_blank" rel="noreferrer">
                      <img src={`${Config.BASE_URL}/img/share-linkedin-icon.png`} alt=""/>
                    </a>
                  </div>
                  <div style={{minHeight:'2px',minWidth:'2px'}}></div>
                  <div className="clickable">
                    <a href={`https://www.facebook.com/share.php?u=${encodeURIComponent(`${Config.USER_BASE_URL}/ebook/${this.state.ebook.slug}`)}`} target="_blank" rel="noreferrer">
                      <img src={`${Config.BASE_URL}/img/share-fb-icon.png`} alt=""/>
                    </a>
                  </div>
                  <div style={{minHeight:'2px',minWidth:'2px'}}></div>
                  <div className="clickable">
                    <a href={`https://wa.me/?text=${encodeURIComponent(`${Config.USER_BASE_URL}/ebook/${this.state.ebook.slug}`)}`} target="_blank" rel="noreferrer">
                      <img src={`${Config.BASE_URL}/img/share-wa-icon.png`} alt=""/>
                    </a>
                  </div>
                  <div style={{minHeight:'2px',minWidth:'2px'}}></div>
                  <div className="clickable">
                    <img src={`${Config.BASE_URL}/img/share-link-icon.png`} data-tip="Link telah di Copy" alt=""/>
                    <ReactTooltip
                      place="bottom"
                      event="click"
                      eventOff="mouseleave mouseout scroll"
                      effect="float"
                      afterShow={() => {
                        setTimeout(ReactTooltip.hide, 5000);
                        this.copyText(`${Config.USER_BASE_URL}/ebook/${this.state.ebook.slug}`);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{minHeight: '30px'}}></div>
          <div className="article-tags">
            {this.state.form.tagVal.map((item, index) => <a key={index} href="#"><div className="tag">{item}</div></a>)}
          </div>
          <div style={{minHeight: '40px'}}></div>
        </div>}
        {this.state.isLoading && <div className="loader"></div>}
      </div>
    </>);
  }
}

export default EbookListEdit;
