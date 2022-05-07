import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import moment from "moment";
import validator from "validator";
import "moment/locale/id";
import MUIDataTable from "mui-datatables";
import { Link } from "react-router-dom";
import * as Config from "./../../Config";
import { useHistory } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import { Jodit } from "jodit";
import "jodit/build/jodit.min.css";
import imageCompression from "browser-image-compression";
moment.locale("id");

const Swal2 = withReactContent(Swal);

class ArticleListCreate extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if (admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
      adm: {
        list: [],
        val: null,
      },
      isPreview: false,
      isLoaded: false,
      isSubmitted: false,
      form: {
        title: "",
        galleryList: [],
        galleryVal: "",
        galleryFilter: "",
        gallerySelected: null,
        isGalleryEditName: false,
        galleryNewName: "",
        thumbnailImg: null,
        thumbnailImgName: null,
        thumbnailImgPreview: null,
        thumbnailImgMeta: null,
        thumbnailDesc: "",
        writerList: [],
        writerVal: "",
        editorList: [],
        editorVal: "",
        reviewerList: [],
        reviewerVal: "",
        categoryImg: null,
        categoryImgPreview: null,
        categoryFilter: "",
        topicFilter: '',
        topicVal: '',
        categoryList: [],
        categoryVal: "",
        categoryName: "",
        categoryLink: '',
        editedCategory: null,
        editCategoryName: "",
        tagRecommendedList: [
          { value: "COVID-19", label: "COVID-19" },
          { value: "Vaccine", label: "Vaccine" },
        ],
        tagVal: [],
        metadata: "",
        keywords: "",
        url: "",
        uploadMethod: "UPLOAD",
        editor: [],
        previewPage: 1,
        form_keywords: "",
        seoKeywords: [],
        seoKeywordsDensity: [],
        panjang_kalimat_pada_judul: false,
        panjang_keyword: false,
        panjang_metadata: false,
        panjang_content: false,
        judul_artikel_mengandung_keyword: false,
        meta_description_mengandung_keyword: false,
        artikel_mengandung_keyword: false,
      },
      // editorState: EditorState.createEmpty(),
    };
    this.handleChangeKeywords = this.handleChangeKeywords.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
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
    // this.editorImageUpload = this.editorImageUpload.bind(this);
    this.updateGalleryName = this.updateGalleryName.bind(this);
    this.updateGalleryDesc = this.updateGalleryDesc.bind(this);
    this.deleteGallery = this.deleteGallery.bind(this);
    this.getAdmList = this.getAdmList.bind(this);
    this.autoSave = this.autoSave.bind(this);
    // this.getEditorHTML = this.getEditorHTML.bind(this);
    this.submit = this.submit.bind(this);
    this.addEditor = this.addEditor.bind(this);
    this.removeEditor = this.removeEditor.bind(this);
  }

  // hack to remove classes & ID in image editor popup in texteditor
  removeClassesAndID() {
    setTimeout(() => {
      let joditInputClasses = document.querySelector(
        ".jodit-input[data-ref='classes']"
      );
      if (joditInputClasses != null) {
        let formElement = joditInputClasses.closest(".jodit-form__group");
        formElement.style.display = "none";
      }
      let joditInputID = document.querySelector(".jodit-input[data-ref='id']");
      if (joditInputID != null) {
        let formElement = joditInputID.closest(".jodit-form__group");
        formElement.style.display = "none";
      }
      this.removeClassesAndID();
    }, 1000);
  }

  /*
  onEditorStateChange: Function = (editorState) => {
    this.setState({ editorState });
  }
  */

  async componentDidMount() {
    this.removeClassesAndID();
    this.addEditor();
    await this.fetchCategoryList();
    await this.fetchGalleryList();
    await this.getAdmList();
    this.autoLoad();
    this.autoSave();
  }

  componentDidUpdate(prevProps, prevState) {
    // eslint-disable-next-line react/destructuring-assignment
    if (prevState.form.title !== this.state.form.title) {
      this.seoLengthTitle();
      this.checkSeoTitleOnKeywords();
    }
    if (prevState.form_keywords !== this.state.form_keywords) {
      this.splitKeywords();
      this.panjangKeywords();
      this.CountTotalAmountOfSpecificWordInString();
      this.removeDensityIfZero();
      this.checkSeoTitleOnKeywords();
      this.checkSeoMetaDescriptionOnKeywords();
      this.checkSeoArticleOnKeywords();
    }
    if (prevState.form.metadata !== this.state.form.metadata) {
      this.seoLengthMetaData();
      this.checkSeoMetaDescriptionOnKeywords();
    }
    // if (prevState.form_meta_description !== this.state.form_meta_description) {
    //   this.seoLength("seoMetaDescriptionLength", "form_meta_description");
    //   this.seoMetaDescriptionKeywords();
    // }
    // if (prevState.form_keywords !== this.state.form_keywords) {
    //   this.splitKeywords();
    //   this.CountTotalAmountOfSpecificWordInString();
    //   this.seoMetaDescriptionKeywords();
    // }
    // if (prevState.form_description !== this.state.form_description) {
    //   this.splitKeywords();
    //   this.CountTotalAmountOfSpecificWordInString();
    //   this.seoLength("seoContentLength", "form_description");
    // }
  }

  checkSeoArticleOnKeywords = () => {
    const { form_keywords } = this.state;
    let data = localStorage.getItem("article_draft");
    let parse_data = JSON.parse(data);
    let form_description = parse_data.content[0];

    if (form_description !== "" && form_keywords !== "") {
      var artikel = form_description.split(" ");
      let keyword = form_keywords.split(" ");
      const found = artikel.some((r) => keyword.includes(r));
      console.log("ARTIKEL: ", artikel);
      console.log("KEYWORDS: ", keyword);
      console.log(found);
      if (found) {
        this.setState({
          artikel_mengandung_keyword: true,
        });
      } else {
        this.setState({
          artikel_mengandung_keyword: false,
        });
      }
    }
  };

  checkSeoMetaDescriptionOnKeywords = () => {
    const { form, form_keywords } = this.state;
    if (form.metadata.length > 1 && form_keywords !== "") {
      var FORM_META = form.metadata ? form.metadata.split(" ") : "";
      let KEYWORD_SPLIT = form_keywords ? form_keywords.split(" ") : "";
      const found = FORM_META.some((r) => KEYWORD_SPLIT.includes(r));
      if (found) {
        this.setState({
          meta_description_mengandung_keyword: true,
        });
      } else {
        this.setState({
          meta_description_mengandung_keyword: false,
        });
      }
    } else {
      this.setState({
        meta_description_mengandung_keyword: false,
      });
    }
  };

  checkSeoTitleOnKeywords = () => {
    const { form, form_keywords } = this.state;
    if (form.title.length > 1 && form_keywords !== "") {
      var FORM_TITLE = form.title ? form.title.split(" ") : "";
      let KEYWORD_SPLIT = form_keywords ? form_keywords.split(" ") : "";
      const found = FORM_TITLE.some((r) => KEYWORD_SPLIT.includes(r));
      console.log("found :", found);
      if (found) {
        this.setState({
          judul_artikel_mengandung_keyword: true,
        });
      } else {
        this.setState({
          judul_artikel_mengandung_keyword: false,
        });
      }
    } else {
      this.setState({
        judul_artikel_mengandung_keyword: false,
      });
    }
  };

  removeDensityIfZero = () => {
    const { form_keywords } = this.state;
    if (form_keywords === "") {
      this.setState({
        seoKeywordsDensity: [],
        panjang_keyword: false,
      });
    }
  };

  seoLengthMetaData = () => {
    const { form } = this.state;
    if (form.metadata.length === 0) {
      this.setState({
        panjang_metadata: false,
      });
    } else if (form.metadata.length <= 50) {
      this.setState({
        panjang_metadata: false,
      });
    } else if (form.metadata.length <= 160) {
      this.setState({
        panjang_metadata: true,
      });
    } else {
      this.setState({
        panjang_metadata: false,
      });
    }
  };

  seoLengthTitle = () => {
    const { form } = this.state;
    if (form.title.length === 0) {
      this.setState({
        panjang_kalimat_pada_judul: false,
      });
    } else if (form.title.length <= 60) {
      this.setState({
        panjang_kalimat_pada_judul: true,
      });
    } else {
      this.setState({
        panjang_kalimat_pada_judul: false,
      });
    }
  };

  splitKeywords = () => {
    const { form_keywords } = this.state;
    if (form_keywords.length > 0) {
      var words = form_keywords.split(/\b\W+\b/);
      this.setState({
        seoKeywords: words,
      });
    } else {
      this.setState({
        seoKeywords: [],
      });
    }
  };

  panjangKeywords = () => {
    const { seoKeywordsDensity } = this.state;
    if (seoKeywordsDensity !== undefined) {
      if (seoKeywordsDensity.length === 0) {
        this.setState({
          panjang_keyword: false,
        });
      } else if (seoKeywordsDensity.length > 3) {
        this.setState({
          panjang_keyword: false,
        });
      } else {
        this.setState({
          panjang_keyword: true,
        });
      }
    }
  };

  CountTotalAmountOfSpecificWordInString() {
    const { seoKeywords } = this.state;
    let data = localStorage.getItem("article_draft");
    let parse_data = JSON.parse(data);
    let form_description = parse_data.content[0];

    if (seoKeywords !== undefined || seoKeywords === "") {
      if (seoKeywords.length !== 0 && form_description !== "") {
        let temp = [];
        for (let i = 0; i < seoKeywords.length; i++) {
          let next = 0;
          let findedword = 0;
          let countDescription =
            form_description.match(/[\w\d\’\'-]+/gi).length;
          do {
            var n = form_description.indexOf(seoKeywords[i], next);
            findedword = findedword + 1;
            next = n + seoKeywords[i].length;
          } while (n >= 0);
          let data = {
            keyword: seoKeywords[i],
            found: findedword - 1,
            density: (findedword - 1) / countDescription,
          };
          temp.push(data);
        }
        this.setState({
          seoKeywordsDensity: temp,
        });
      }
    } else {
      this.setState({
        seoKeywordsDensity: [],
      });
    }
  }

  generateToken(length) {
    var a =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split(
        ""
      );
    var b = [];
    for (var i = 0; i < length; i++) {
      var j = (Math.random() * (a.length - 1)).toFixed(0);
      b[i] = a[j];
    }
    return b.join("");
  }

  addEditor() {
    new Promise((resolve, reject) => {
      let page = this.state.form.editor.length + 1;
      let textEditor = { id: this.generateToken(16), textEditor: null };
      this.setState(
        (prevState) => ({
          form: {
            ...prevState.form,
            editor: [...this.state.form.editor, textEditor],
          },
        }),
        () => {
          let editor = new Jodit("#editor-" + page, {
            askBeforePasteHTML: false,
            controls: {
              font: {
                list: {
                  "Inter, sans-serif": "Inter",
                },
              },
            },
            style: {
              fontFamily: "Inter, sans-serif",
            },
            uploader: {
              url: `${Config.API_URL_2}/cms/images-article`,
              data: { token_body: this.state.admin.token },
              isSuccess: (resp) => {
                return resp;
              },
              process: function (resp) {
                return { url: resp.data.url };
              },
              defaultHandlerSuccess: function (data) {
                if (data.url.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/))
                  this.selection.insertImage(data.url);
                else
                  this.selection.insertHTML(
                    `<a href="${data.url}" download>${data.url}</a>`
                  );
              },
            },
            buttons: [
              ...Jodit.defaultOptions.buttons,
              {
                iconURL: `${Config.BASE_URL}/img/line-spacing-icon.png`,
                list: ["1,0", "1,15", "1,5", "2,0", "2,5", "3,0"],
                childTemplate: (editor, key, value) =>
                  `<span className="${key}">${editor.i18n(value)}</span>`,
                exec: (editor, key, value) => {
                  let defaultLineHeight;
                  let selected = value.control.name;
                  switch (selected) {
                    case "1,0":
                      defaultLineHeight = "normal";
                      break;
                    case "1,15":
                      defaultLineHeight = "25px";
                      break;
                    case "1,5":
                      defaultLineHeight = "30px";
                      break;
                    case "2,0":
                      defaultLineHeight = "35px";
                      break;
                    case "2,5":
                      defaultLineHeight = "40px";
                      break;
                    case "3,0":
                      defaultLineHeight = "45px";
                      break;
                  }
                  editor.s.applyStyle({ lineHeight: defaultLineHeight });
                },
              },
            ],
          });
          editor.events.on("afterPaste", (event) => {
            let html = editor.getEditorValue();
            html = html.replaceAll("font-family", "initial-font");
            editor.setEditorValue(html);
          });
          textEditor.textEditor = editor;
          this.setState(
            (prevState) => ({ form: { ...prevState.form } }),
            () => resolve(editor)
          );
        }
      );
    });
  }

  removeEditor(editor) {
    let index = this.state.form.editor.indexOf(editor);
    let editorList = [
      ...this.state.form.editor.slice(0, index),
      ...this.state.form.editor.slice(index + 1),
    ];
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        editor: editorList,
      },
    }));
  }

  autoLoad = () => {
    let data = localStorage.getItem("article_draft");
    if (data != null) {
      data = JSON.parse(data);
      console.log(data);
      let thumbnail = null;
      for (let i = 0; i < this.state.form.galleryList.length; i++) {
        let item = this.state.form.galleryList[i];
        if (item.id === data.gallerySelected) {
          thumbnail = item;
          break;
        }
      }
      let writerID = "";
      for (let i = 0; i < this.state.form.writerList.length; i++) {
        let item = this.state.form.writerList[i];
        if (Number(item.id) === Number(data.writerVal)) writerID = i;
      }
      let editorID = "";
      for (let i = 0; i < this.state.form.editorList.length; i++) {
        let item = this.state.form.editorList[i];
        if (Number(item.id) === Number(data.editorVal)) editorID = i;
      }
      let reviewerID = "";
      for (let i = 0; i < this.state.form.reviewerList.length; i++) {
        let item = this.state.form.reviewerList[i];
        if (Number(item.id) === Number(data.reviewerVal)) reviewerID = i;
      }
      let categoryID = "";
      for (let i = 0; i < this.state.form.categoryList.length; i++) {
        let item = this.state.form.categoryList[i];
        if (item.id === data.categoryVal) categoryID = i;
      }
      let defaultTagList = [];
      for (let i = 0; i < data.tagVal.length; i++)
        defaultTagList.push({ label: data.tagVal[i], value: data.tagVal[i] });
      this.setState(
        (prevState) => ({
          form: {
            ...prevState.form,
            title: data.title,
            gallerySelected: thumbnail,
            writerVal: writerID,
            editorVal: editorID,
            reviewerVal: reviewerID,
            categoryVal: categoryID,
            defaultTagList: defaultTagList,
            tagVal: data.tagVal,
            metadata: data.metadata,
          },
        }),
        async () => {
          while (this.state.form.editor.length < data.content.length)
            await this.addEditor();
          for (let i = 0; i < data.content.length; i++) {
            this.state.form.editor[i].textEditor.setEditorValue(
              data.content[i]
            );
          }
        }
      );
    }
    this.setState({ isLoaded: true });
  };

  autoSave = () => {
    if (!this.state.isSubmitted) {
      let content = [];
      for (let i = 0; i < this.state.form.editor.length; i++) {
        let item = this.state.form.editor[i];
        if (item.textEditor === null) continue;
        content.push(item.textEditor.getEditorValue());
      }
      setTimeout(() => {
        let data = {
          title: this.state.form.title,
          content: content,
          gallerySelected:
            this.state.form.gallerySelected === null
              ? ""
              : this.state.form.gallerySelected.id,
          writerVal:
            this.state.form.writerVal === ""
              ? ""
              : this.state.form.writerList[this.state.form.writerVal].id,
          editorVal:
            this.state.form.editorVal === ""
              ? ""
              : this.state.form.editorList[this.state.form.editorVal].id,
          reviewerVal:
            this.state.form.reviewerVal === ""
              ? ""
              : this.state.form.reviewerList[this.state.form.reviewerVal].id,
          categoryVal:
            this.state.form.categoryVal === ""
              ? ""
              : this.state.form.categoryList[this.state.form.categoryVal].id,
          tagVal: this.state.form.tagVal,
          metadata: this.state.form.metadata,
        };
        localStorage.setItem("article_draft", JSON.stringify(data));
        this.autoSave();
      }, 1000);
    }
  };

  countWords(str) {
    str = str.replace(/(^\s*)|(\s*$)/gi, "");
    str = str.replace(/[ ]{2,}/gi, " ");
    str = str.replace(/\n /, "\n");
    return str.split(" ").length;
  }

  async getAdmList() {
    this.setState({ isLoading: true });
    let response = await axios.get(`${Config.API_URL_2}/cms/admin`, {
      headers: { token: this.state.admin.token },
    });
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        let admList = data.data.admin;
        let writerList = [];
        let editorList = [];
        let reviewerList = [];
        for (let i = 0; i < admList.length; i++) {
          let item = admList[i];
          if (item.role.includes("Penulis")) writerList.push(item);
          if (item.role.includes("Penyunting")) editorList.push(item);
          if (item.role.includes("Peninjau Materi")) reviewerList.push(item);
        }
        this.setState((prevState) => ({
          adm: { list: data.data.admin, val: null },
          form: {
            ...prevState.form,
            writerList: writerList,
            writerVal: "",
            editorList: editorList,
            editorVal: "",
            reviewerList: reviewerList,
            reviewerVal: "",
          },
        }));
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
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
        if(document.getElementById('close-topic-modal') != null) document.getElementById('close-topic-modal').click();
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

  setEditCategory(category) {
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        editedCategory: category,
        categoryName: category.name,
        categoryLink: '',
        categoryImg: null,
        categoryImgPreview: null,
        topicVal: this.state.form.categoryList.indexOf(category),
      },
    }));
  }

  setUploadMethod(method) {
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        uploadMethod: method,
      },
    }));
  }

  handleTagChange(newValue: any, actionMeta: any) {
    let tags = [];
    if (newValue !== null) {
      for (let i = 0; i < newValue.length; i++) {
        tags.push(newValue[i].value);
      }
    }
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        tagVal: tags,
      },
    }));
  }

  handleFormChange(event, callback = null) {
    const target = event.target;
    let value =
      target.type === "number"
        ? target.value.replace(/\D/, "").replace("d", "")
        : target.type === "checkbox"
        ? target.checked
        : target.value;
    let name = target.name;
    if (name === "title") {
      if (this.countWords(value) > 30) return;
    }
    if (callback == null)
      this.setState((prevState) => ({
        form: { ...prevState.form, [name]: value },
      }));
    else
      this.setState(
        (prevState) => ({ form: { ...prevState.form, [name]: value } }),
        callback
      );
  }

  async handleThumbnailFileChange(event) {
    if (this.state.isLoading) return;
    this.setState({ isLoading: true });
    let context = this;
    let file = event.target.files[0];
    if (file != null) {
      this.state.form.thumbnailImgName = file.name;
      file = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });
      this.state.form.thumbnailImg = file;
      let reader = new FileReader();
      reader.addEventListener(
        "load",
        function () {
          context.state.form.thumbnailImgPreview = reader.result;
          let img = new Image();
          img.onload = () => {
            context.state.form.thumbnailImgMeta = {
              height: img.height,
              width: img.width,
            };
            context.setState(
              { form: context.state.form },
              context.uploadGallery
            );
          };
          img.src = context.state.form.thumbnailImgPreview;
        },
        false
      );
      reader.readAsDataURL(file);
    } else {
      this.state.form.thumbnailImg = null;
      this.state.form.thumbnailImgName = null;
      this.state.form.thumbnailImgPreview = null;
      this.state.form.thumbnailImgMeta = null;
    }
    this.setState({ isLoading: false, form: this.state.form });
  }

  /*
  editorImageUpload(file) {
    return new Promise(async (resolve, reject) => {
      let fileName = file.name;
      file = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
        useWebWorker: true
      });
      let formData = new FormData();
      formData.append('name', fileName);
      formData.append('image_article', file);
      let response = await axios.post(`${Config.API_URL_2}/cms/images-article`, formData, { headers: { 'token': this.state.admin.token } });
      try {
        let data = response.data;
        if(data.statusCode === 201) {
          let url = data.data.url;
          resolve({data: {link: url}});
        } else {
          Swal.fire('Failed', data.message, 'error');
        }
      } catch(error) {
        Swal.fire('Error', 'Unable to connect to server', 'error');
      }
    });
  }
  */

  handleChangeKeywords(event) {
    this.setState({ form_keywords: event.target.value });
  }

  async fetchGalleryList() {
    this.setState((prevState) => ({
      isLoading: true,
      form: {
        ...prevState.form,
        galleryList: [],
        galleryVal: "",
        gallerySelected: null,
      },
    }));
    let response = await axios.get(`${Config.API_URL_2}/cms/images-gallery`, {
      headers: { token: this.state.admin.token },
    });
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        this.setState((prevState) => ({
          form: {
            ...prevState.form,
            galleryList: data.data.images,
          },
        }));
        console.log(this.state.form.galleryList);
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  }

  async uploadGallery() {
    if (this.state.isLoading) return;
    this.setState({ isLoading: true });
    let formData = new FormData();
    formData.append(
      "dimension",
      `${this.state.form.thumbnailImgMeta.height} x ${this.state.form.thumbnailImgMeta.width}`
    );
    formData.append("name", this.state.form.thumbnailImgName);
    formData.append("image_gallery", this.state.form.thumbnailImg);
    let response = await axios.post(
      `${Config.API_URL_2}/cms/images-gallery`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 201) {
        this.setState(
          (prevState) => ({
            form: {
              ...prevState.form,
              thumbnailImg: null,
              thumbnailImgPreview: null,
              thumbnailImgMeta: null,
              uploadMethod: "GALLERY",
            },
          }),
          this.fetchGalleryList
        );
      } else {
        return Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      return Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  }

  async updateGalleryName() {
    if (this.state.isLoading) return;
    if (this.state.form.galleryNewName === "")
      return Swal.fire("Nama Galeri wajib diisi");
    this.setState({ isLoading: true });
    let formData = {};
    formData.name = this.state.form.galleryNewName;
    let response = await axios.put(
      `${Config.API_URL_2}/cms/images-gallery/${
        this.state.form.galleryList[this.state.form.galleryVal].id
      }`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        this.state.form.galleryList[this.state.form.galleryVal].name =
          this.state.form.galleryNewName;
        this.state.form.galleryList[this.state.form.galleryVal].urlAfterEdit =
          data.data.link;
        this.setState((prevState) => ({
          form: {
            ...prevState.form,
            isGalleryEditName: false,
            galleryNewName: "",
          },
        }));
      } else {
        Swal.fire("Failed", data.statusMessage, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  }

  async updateGalleryDesc() {
    if (this.state.isLoading) return;
    if (this.state.form.thumbnailDesc === "")
      return Swal.fire("Deskripsi wajib diisi");
    this.setState({ isLoading: true });
    let formData = {};
    formData.caption = this.state.form.thumbnailDesc;
    let response = await axios.put(
      `${Config.API_URL_2}/cms/images-gallery/caption/${this.state.form.gallerySelected.id}`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        this.state.form.gallerySelected.caption = this.state.form.thumbnailDesc;
        Swal.fire("Success", "Deskripsi berhasil diubah", "success");
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  }

  async deleteGallery() {
    if (this.state.isLoading) return;
    let gallery = this.state.form.galleryList[this.state.form.galleryVal];
    let confirm = await Swal.fire({
      title: "Hapus Galeri ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    });
    if (!confirm.value) return;
    this.setState({ isLoading: true });
    let response = await axios.delete(
      `${Config.API_URL_2}/cms/images-gallery/${gallery.id}`,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        await Swal.fire("Success", "Galeri berhasil dihapus", "success");
        this.fetchGalleryList();
      } else {
        return Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      return Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState((prevState) => ({
      form: { ...prevState.form },
      isLoading: false,
    }));
  }

  /*
  getEditorHTML() {
    return draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()));
  }
  */

  async submit(status) {
    if (this.state.isLoading) return;
    let content = this.state.form.editor[0].textEditor.getEditorValue();
    let pagination = [];
    for (let i = 1; i < this.state.form.editor.length; i++) {
      let item = {
        page: i + 1,
        content: this.state.form.editor[i].textEditor.getEditorValue(),
      };
      pagination.push(item);
    }
    if (validator.isEmpty(this.state.form.title))
      return Swal.fire("Judul Artikel wajib diisi");
    if (status === "Terbit" && this.state.form.gallerySelected === null)
      return Swal.fire("Thumbnail wajib diisi");
    if (status === "Terbit" && this.state.form.categoryVal === "")
      return Swal.fire("Kategori wajib diisi");
    if (status === "Terbit" && this.state.form.writerVal === "")
      return Swal.fire("Penulis wajib diisi");
    if (status === "Terbit" && this.state.form.editorVal === "")
      return Swal.fire("Penyunting wajib diisi");
    // if(status === 'Terbit' && this.state.form.reviewerVal === '') return Swal.fire('Peninjau wajib diisi');
    this.setState({ isLoading: true });
    let formData = {};
    formData.title = this.state.form.title;
    formData.content = content;
    formData.pagination = pagination;
    if (this.state.form.gallerySelected !== null)
      formData.id_thumbnail = this.state.form.gallerySelected.id;
    if (this.state.form.writerVal !== "")
      formData.id_penulis =
        this.state.form.writerList[this.state.form.writerVal].id;
    if (this.state.form.editorVal !== "")
      formData.id_penyunting =
        this.state.form.editorList[this.state.form.editorVal].id;
    if (this.state.form.reviewerVal !== "")
      formData.id_peninjau_materi =
        this.state.form.reviewerList[this.state.form.reviewerVal].id;
    if (this.state.form.categoryVal !== "")
      formData.id_category =
        this.state.form.categoryList[this.state.form.categoryVal].id;
    if (status !== "Draft" || this.state.form.tagVal.length > 0)
      formData.tags = this.state.form.tagVal;
    if (status !== "Draft" || this.state.form.metadata !== "")
      formData.metadata = this.state.form.metadata;
    formData.status = status;
    let response = await axios.post(
      `${Config.API_URL_2}/cms/article`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 201) {
        this.setState({ isSubmitted: true });
        await Swal.fire("Success", "Berhasil ditambahkan", "success");
        localStorage.removeItem("article_draft");
        document.getElementsByClassName("back")[0].click();
      } else {
        return Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      return Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  }

  generatePreviewPagination() {
    let pagination = {
      page: [],
    };
    let currentPage = this.state.form.previewPage;
    let totalPage = this.state.form.editor.length;

    if (currentPage === 1) {
      let after = totalPage - currentPage;
      if (after === 0) {
        pagination.page.push(currentPage);
      } else if (after === 1) {
        pagination.page.push(currentPage);
        pagination.page.push(currentPage + 1);
      } else if (after === 2) {
        pagination.page.push(currentPage);
        pagination.page.push(currentPage + 1);
        pagination.page.push(currentPage + 2);
      } else if (after > 2) {
        pagination.page.push(currentPage);
        pagination.page.push(currentPage + 1);
        pagination.page.push(currentPage + 2);
      }
    } else if (currentPage === totalPage) {
      if (currentPage - 2 > 0) pagination.page.push(currentPage - 2);
      if (currentPage - 1 > 0) pagination.page.push(currentPage - 1);
      pagination.page.push(currentPage);
    } else {
      pagination.page.push(currentPage - 1);
      pagination.page.push(currentPage);
      pagination.page.push(currentPage + 1);
    }
    return pagination;
  }

  goPage(page) {
    if (page < 1) return;
    if (page > this.state.form.editor.length) return;
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        previewPage: page,
      },
    }));
  }

  render() {
    // const { editorState } = this.state;
    return (
      <>
        <div className="standard-2-page">
          <div className="banner">
            <div className="title d-flex flex-column flex-md-row">
              <div className="flex-grow-1 align-self-center">
                <div className="left d-flex flex-column flex-md-row">
                  {!this.state.isPreview && (
                    <NavLink to="/article-list">
                      <div className="back clickable align-self-center">
                        <svg
                          width="19"
                          height="16"
                          viewBox="0 0 19 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M18.9999 6.99997H4.41394L9.70694 1.70697L8.29294 0.292969L0.585938 7.99997L8.29294 15.707L9.70694 14.293L4.41394 8.99997H18.9999V6.99997Z"
                            fill="#3E8CB9"
                          />
                        </svg>
                      </div>
                    </NavLink>
                  )}
                  <div style={{ width: "12px" }}></div>
                  <div className="text flex-grow-1 align-self-center">
                    Tambah Artikel Baru
                  </div>
                  <div style={{ minHeight: "16px", minWidth: "16px" }}></div>
                  {!this.state.isPreview && (
                    <div className="action d-flex flex-column flex-md-row">
                      <button
                        onClick={() => this.submit("Draft")}
                        className="blue-outline-button"
                      >
                        Simpan sebagai draf
                      </button>
                      <div
                        style={{ minHeight: "16px", minWidth: "16px" }}
                      ></div>
                      <button
                        onClick={() => this.setState({ isPreview: true })}
                        disabled={this.state.isLoading}
                        className="green-button"
                      >
                        Pratinjau
                      </button>
                      <div
                        style={{ minHeight: "16px", minWidth: "16px" }}
                      ></div>
                      <button
                        onClick={() => this.submit("Terbit")}
                        className="blue-button"
                      >
                        Terbitkan
                      </button>
                    </div>
                  )}
                  {this.state.isPreview && (
                    <div className="action d-flex flex-column flex-md-row">
                      <button
                        onClick={() => this.setState({ isPreview: false })}
                        className="green-outline-button"
                      >
                        Tutup pratinjau
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div
            style={{ display: this.state.isPreview ? "none" : "flex" }}
            className="flex-column flex-md-row"
          >
            <div className="left flex-grow-1">
              <div className="article-form">
                <div className="container">
                  <div className="group">
                    <div className="d-flex justify-content-between">
                      <label>Judul Artikel</label>
                      <div>
                        {this.state.form.title === ""
                          ? "0"
                          : this.countWords(this.state.form.title)}{" "}
                        / 30 kata
                      </div>
                    </div>
                    <input
                      name="title"
                      type="text"
                      onChange={this.handleFormChange}
                      value={this.state.form.title}
                      placeholder="Buat Judul Baru"
                    />
                  </div>
                  <div className="group">
                    <label>Isi Artikel</label>
                    <div id="text-editor-wrapper">
                      {this.state.form.editor.map((item, index) => (
                        <div key={item.id} className="page-wrapper">
                          <div className="page-wrapper-head d-flex justify-content-between">
                            <div className="page-no d-flex">
                              <span>Halaman {index + 1}</span>
                              {index > 0 && (
                                <>
                                  <div style={{ minWidth: "16px" }}></div>
                                  <div
                                    onClick={() => this.removeEditor(item)}
                                    className="page-remove clickable"
                                  >
                                    Hapus
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="add-page d-flex">
                              <div className="icon align-self-center">
                                <img
                                  src={`${Config.BASE_URL}/img/page-break-icon.png`}
                                  alt=""
                                />
                              </div>
                              <div
                                style={{ minHeight: "4px", minWidth: "4px" }}
                              ></div>
                              <div
                                onClick={this.addEditor}
                                className="align-self-center clickable"
                              >
                                Buat Halaman Baru
                              </div>
                            </div>
                          </div>
                          <div
                            onChange={() => console.log("TEST")}
                            id={`editor-${index + 1}`}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {false && <div className="group">
                    <label>Analisis SEO</label>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 10,
                            background: this.state.panjang_kalimat_pada_judul
                              ? "green"
                              : "red",
                            marginRight: 4,
                          }}
                        ></div>
                        <div>
                          Panjang Kalimat pada Judul Artikel (
                          {this.state.form.title.length} / 60)
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 10,
                            background: this.state.panjang_keyword
                              ? "green"
                              : "red",
                            marginRight: 4,
                          }}
                        ></div>
                        <div>
                          Panjang Keywords (
                          {this.state.seoKeywordsDensity
                            ? this.state.seoKeywordsDensity.length
                            : 0}
                          /3)
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 10,
                            background: this.state.panjang_metadata
                              ? "green"
                              : "red",
                            marginRight: 4,
                          }}
                        ></div>
                        <div>
                          Panjang Meta Description{" "}
                          {this.state.form.metadata?.length}. Rekomendasi dari
                          50 hingga 150 Karakter
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 10,
                            background: this.state
                              .judul_artikel_mengandung_keyword
                              ? "green"
                              : "red",
                            marginRight: 4,
                          }}
                        ></div>
                        <div>Judul artikel mengandung Keywords </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 10,
                            background: this.state
                              .meta_description_mengandung_keyword
                              ? "green"
                              : "red",
                            marginRight: 4,
                          }}
                        ></div>
                        <div>Meta Description mengandung keywords</div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 10,
                            background: this.state.artikel_mengandung_keyword
                              ? "green"
                              : "red",
                            marginRight: 4,
                          }}
                        ></div>
                        <div>
                          Isi Artikel mengandung keywords{" "}
                          <button
                            onClick={() => this.checkSeoArticleOnKeywords()}
                          >
                            refresh
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>}
                </div>
              </div>
            </div>
            <div style={{ minWidth: "20px", minHeight: "20px" }}></div>
            <div className="right meta-section">
              <div className="meta-card">
                <div
                  data-toggle="collapse"
                  data-target="#meta-thumbnail"
                  className="card-toggler clickable"
                >
                  <div className="text align-self-center">Gambar Thumbnail</div>
                  <div style={{ minWidth: "20px" }}></div>
                  <div className="align-self-center">
                    <img src={`${Config.BASE_URL}/img/down-icon.png`} />
                  </div>
                </div>
                <div id="meta-thumbnail" className="container collapse">
                  <div className="meta-wrapper">
                    {this.state.form.gallerySelected !== null && (
                      <div
                        className="thumbnail-preview-img"
                        style={{
                          backgroundImage: `url('${this.state.form.gallerySelected.url}')`,
                        }}
                      ></div>
                    )}
                    {this.state.form.gallerySelected === null && (
                      <div
                        data-toggle="modal"
                        data-target="#thumbnail-modal"
                        className="image-config clickable"
                      >
                        Atur Gambar
                      </div>
                    )}
                    {this.state.form.gallerySelected !== null && (
                      <button
                        data-toggle="modal"
                        data-target="#thumbnail-modal"
                        className="upload-thumbnail"
                      >
                        Ganti Gambar
                      </button>
                    )}
                    {this.state.form.gallerySelected !== null && (
                      <div
                        onClick={() => {
                          this.setState((prevState) => ({
                            form: { ...prevState.form, gallerySelected: null },
                          }));
                        }}
                        className="delete-command clickable"
                      >
                        Hapus gambar
                      </div>
                    )}
                    {this.state.form.gallerySelected !== null && (
                      <>
                        <div className="group text-left">
                          <label>Deskripsi</label>
                          <input
                            name="thumbnailDesc"
                            type="text"
                            onChange={this.handleFormChange}
                            value={this.state.form.thumbnailDesc}
                            placeholder="Tulis Deskripsi"
                          />
                        </div>
                        <div
                          style={{ minWidth: "20px", minHeight: "20px" }}
                        ></div>
                        <div className="group">
                          <button
                            onClick={this.updateGalleryDesc}
                            className="color-button"
                          >
                            Simpan
                          </button>
                        </div>
                      </>
                    )}
                    <div className="modal fade" id="thumbnail-modal">
                      <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                          <div className="modal-body p-0">
                            <div className="header">
                              <div className="header-title">Galleri Media</div>
                              <div
                                id="close-gallery-modal"
                                className="close-it clickable"
                                data-dismiss="modal"
                              >
                                Tutup
                              </div>
                            </div>
                            <div className="panel-tab">
                              <div
                                onClick={() => this.setUploadMethod("UPLOAD")}
                                className={`panel-tab-item clickable ${
                                  this.state.form.uploadMethod === "UPLOAD"
                                    ? "active"
                                    : ""
                                }`}
                              >
                                Unggah Media
                              </div>
                              <div
                                onClick={() => this.setUploadMethod("GALLERY")}
                                className={`panel-tab-item clickable ${
                                  this.state.form.uploadMethod === "GALLERY"
                                    ? "active"
                                    : ""
                                }`}
                              >
                                Dari Galleri
                              </div>
                            </div>
                            <div className="panel-content">
                              {this.state.form.uploadMethod === "UPLOAD" && (
                                <div className="panel-upload-content">
                                  <input
                                    id="meta-thumbnail-input"
                                    type="file"
                                    onChange={this.handleThumbnailFileChange}
                                    style={{ display: "none" }}
                                  />
                                  <div
                                    className="pick-img align-self-center clickable"
                                    onClick={() =>
                                      document
                                        .getElementById("meta-thumbnail-input")
                                        .click()
                                    }
                                  >
                                    Pilih Gambar
                                  </div>
                                  <div style={{ minHeight: "16px" }}></div>
                                  <div className="pick-img-note">
                                    Ukuran Maksimal gambar : 50 MB
                                  </div>
                                </div>
                              )}
                              {this.state.form.uploadMethod === "GALLERY" && (
                                <div className="panel-gallery">
                                  <div className="d-flex flex-column-reverse flex-md-row h-100">
                                    <div className="left flex-grow-1">
                                      <div className="search-bar">
                                        <input
                                          name="galleryFilter"
                                          onChange={this.handleFormChange}
                                          type="text"
                                          className="gallery-filter-input"
                                          placeholder=""
                                        />
                                        <div className="search-icon">
                                          <img
                                            src={`${Config.BASE_URL}/img/search-icon.png`}
                                          />
                                        </div>
                                      </div>
                                      <div className="panel-gallery-list d-flex flex-wrap">
                                        {this.state.form.galleryList.map(
                                          (item, index) =>
                                            (this.state.form.galleryFilter ===
                                              "" ||
                                              item.name
                                                .toLowerCase()
                                                .includes(
                                                  this.state.form.galleryFilter.toLowerCase()
                                                )) && (
                                              <div
                                                key={index}
                                                onClick={() =>
                                                  this.setState(
                                                    (prevState) => ({
                                                      form: {
                                                        ...prevState.form,
                                                        galleryVal: index,
                                                        thumbnailDesc:
                                                          item.caption,
                                                      },
                                                    })
                                                  )
                                                }
                                                className={`panel-gallery-item clickable ${
                                                  this.state.form.galleryVal ===
                                                  index
                                                    ? "active"
                                                    : ""
                                                }`}
                                                style={{
                                                  backgroundImage: `url('${item.url}')`,
                                                }}
                                              ></div>
                                            )
                                        )}
                                      </div>
                                    </div>
                                    <div className="right flex-grow-1">
                                      <div className="gallery-detail">
                                        {this.state.form.galleryVal !== "" && (
                                          <div className="gallery-detail-wrapper">
                                            <div
                                              className="gallery-image"
                                              style={{
                                                backgroundImage: `url('${
                                                  this.state.form.galleryList[
                                                    this.state.form.galleryVal
                                                  ].url
                                                }')`,
                                              }}
                                            ></div>
                                            <div className="d-flex justify-content-between">
                                              {!this.state.form
                                                .isGalleryEditName && (
                                                <div className="gallery-name">
                                                  {
                                                    this.state.form.galleryList[
                                                      this.state.form.galleryVal
                                                    ].name
                                                  }
                                                </div>
                                              )}
                                              {this.state.form
                                                .isGalleryEditName && (
                                                <div className="group my-2">
                                                  <input
                                                    type="text"
                                                    name="galleryNewName"
                                                    onChange={
                                                      this.handleFormChange
                                                    }
                                                    value={
                                                      this.state.form
                                                        .galleryNewName
                                                    }
                                                  />
                                                </div>
                                              )}
                                              <div
                                                style={{
                                                  minWidth: "8px",
                                                  minHeight: "8px",
                                                }}
                                              ></div>
                                              {!this.state.form
                                                .isGalleryEditName && (
                                                <div
                                                  onClick={() =>
                                                    this.setState(
                                                      (prevState) => ({
                                                        form: {
                                                          ...prevState.form,
                                                          isGalleryEditName:
                                                            !this.state.form
                                                              .isGalleryEditName,
                                                          galleryNewName: this
                                                            .state.form
                                                            .isGalleryEditName
                                                            ? ""
                                                            : this.state.form
                                                                .galleryList[
                                                                this.state.form
                                                                  .galleryVal
                                                              ].name,
                                                        },
                                                      })
                                                    )
                                                  }
                                                  className="change-name clickable"
                                                >
                                                  Ubah nama
                                                </div>
                                              )}
                                              {this.state.form
                                                .isGalleryEditName && (
                                                <div>
                                                  <div
                                                    onClick={
                                                      this.updateGalleryName
                                                    }
                                                    className="change-name clickable"
                                                  >
                                                    Simpan
                                                  </div>
                                                  <div
                                                    onClick={() =>
                                                      this.setState(
                                                        (prevState) => ({
                                                          form: {
                                                            ...prevState.form,
                                                            isGalleryEditName: false,
                                                            galleryNewName: "",
                                                          },
                                                        })
                                                      )
                                                    }
                                                    className="delete-gallery-img clickable"
                                                  >
                                                    Batal
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                            <div className="gallery-image-meta">
                                              {moment(
                                                this.state.form.galleryList[
                                                  this.state.form.galleryVal
                                                ].create_at
                                              ).format("MMMM DD YYYY")}
                                              ,{" "}
                                              {
                                                this.state.form.galleryList[
                                                  this.state.form.galleryVal
                                                ].size
                                              }
                                            </div>
                                            <div className="gallery-image-meta">
                                              {
                                                this.state.form.galleryList[
                                                  this.state.form.galleryVal
                                                ].dimension
                                              }{" "}
                                              pixels
                                            </div>
                                            <div
                                              onClick={this.deleteGallery}
                                              className="delete-gallery-img text-right clickable"
                                            >
                                              Hapus gambar dari galeri
                                            </div>
                                            <div
                                              style={{
                                                minWidth: "12px",
                                                minHeight: "12px",
                                              }}
                                            ></div>
                                            <div className="group">
                                              <label>Copy Link Image</label>
                                              <textarea
                                                rows="3"
                                                value={
                                                  this.state.form.galleryList[
                                                    this.state.form.galleryVal
                                                  ].urlAfterEdit != null
                                                    ? this.state.form
                                                        .galleryList[
                                                        this.state.form
                                                          .galleryVal
                                                      ].urlAfterEdit
                                                    : this.state.form
                                                        .galleryList[
                                                        this.state.form
                                                          .galleryVal
                                                      ].url
                                                }
                                                readOnly
                                              ></textarea>
                                            </div>
                                            <div
                                              style={{
                                                minWidth: "12px",
                                                minHeight: "12px",
                                              }}
                                            ></div>
                                            <div className="group">
                                              <button
                                                onClick={() => {
                                                  this.setState(
                                                    (prevState) => ({
                                                      form: {
                                                        ...prevState.form,
                                                        gallerySelected:
                                                          this.state.form
                                                            .galleryList[
                                                            this.state.form
                                                              .galleryVal
                                                          ],
                                                      },
                                                    })
                                                  );
                                                  document
                                                    .getElementById(
                                                      "close-gallery-modal"
                                                    )
                                                    .click();
                                                }}
                                                className="color-button"
                                              >
                                                Pilih Gambar
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="meta-card">
                <div
                  data-toggle="collapse"
                  data-target="#meta-writer-editor"
                  className="card-toggler clickable"
                >
                  <div className="text align-self-center">Penulis, Editor, Peninjau</div>
                  <div style={{ minWidth: "20px" }}></div>
                  <div className="align-self-center">
                    <img src={`${Config.BASE_URL}/img/down-icon.png`} />
                  </div>
                </div>
                <div id="meta-writer-editor" className="container collapse">
                  <div className="meta-wrapper">
                    <div className="group">
                      <label>Penulis</label>
                      <select
                        name="writerVal"
                        onChange={this.handleFormChange}
                        value={this.state.form.writerVal}
                      >
                        <option value="">-- Pilih Penulis --</option>
                        {this.state.form.writerList.map((item, index) => (
                          <option key={index} value={index}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="group">
                      <label>Penyunting Bahasa</label>
                      <select
                        name="editorVal"
                        onChange={this.handleFormChange}
                        value={this.state.form.editorVal}
                      >
                        <option value="">-- Pilih Penyunting --</option>
                        {this.state.form.editorList.map((item, index) => (
                          <option key={index} value={index}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="group">
                      <label>Peninjau Materi</label>
                      <select
                        name="reviewerVal"
                        onChange={this.handleFormChange}
                        value={this.state.form.reviewerVal}
                      >
                        <option value="">-- Pilih Peninjau --</option>
                        {this.state.form.reviewerList.map((item, index) => (
                          <option key={index} value={index}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/*
                  <div style={{minWidth:'20px',minHeight:'20px'}}></div>
                  <div className="group">
                    <div className="d-flex flex-column flex-md-row">
                      <div className="left flex-grow-1 flex-basis-0"><button className="color-button">Simpan</button></div>
                      <div style={{minWidth:'16px',minHeight:'16px'}}></div>
                      <div className="right flex-grow-1 flex-basis-0"><button className="red-outline-button">Batal</button></div>
                    </div>
                  </div>
                  */}
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
                <div
                  data-toggle="collapse"
                  data-target="#meta-tag"
                  className="card-toggler clickable"
                >
                  <div className="text align-self-center">Tag</div>
                  <div style={{ minWidth: "20px" }}></div>
                  <div className="align-self-center">
                    <img src={`${Config.BASE_URL}/img/down-icon.png`} />
                  </div>
                </div>
                <div id="meta-tag" className="container collapse">
                  <div className="meta-wrapper">
                    <div className="group">
                      {this.state.isLoaded && (
                        <CreatableSelect
                          isMulti
                          onChange={this.handleTagChange}
                          options={this.state.form.tagRecommendedList}
                          defaultValue={this.state.form.defaultTagList}
                        />
                      )}
                    </div>
                    <div className="small-note">
                      Pisahkan dengan tombol Enter.
                    </div>
                    {/*
                  <div style={{minWidth:'20px',minHeight:'20px'}}></div>
                  <div className="group">
                    <button className="color-button">Simpan</button>
                  </div>
                  */}
                  </div>
                </div>
              </div>
              {false && <div className="meta-card">
                <div
                  data-toggle="collapse"
                  data-target="#keyword"
                  className="card-toggler clickable"
                >
                  <div className="text align-self-center">Keywords</div>
                  <div style={{ minWidth: "20px" }}></div>
                  <div className="align-self-center">
                    <img src={`${Config.BASE_URL}/img/down-icon.png`} />
                  </div>
                </div>
                <div id="keyword" className="container collapse">
                  <div className="meta-wrapper">
                    <div className="small-note text-left">
                      *Tulis isi artikel terlebih dahulu <br />
                      *pisahkan keyword dengan spasi
                    </div>
                    <div className="group">
                      <textarea
                        name="keywords"
                        rows="4"
                        maxLength="150"
                        value={this.state.form_keywords}
                        onChange={this.handleChangeKeywords}
                      ></textarea>
                    </div>
                    {/*
                  <div style={{minWidth:'20px',minHeight:'20px'}}></div>
                  <div className="group">
                    <button className="color-button">Simpan</button>
                  </div>
                  */}
                  </div>
                </div>
              </div>}
              <div className="meta-card">
                <div
                  data-toggle="collapse"
                  data-target="#meta-metadata"
                  className="card-toggler clickable"
                >
                  <div className="text align-self-center">Metadata</div>
                  <div style={{ minWidth: "20px" }}></div>
                  <div className="align-self-center">
                    <img src={`${Config.BASE_URL}/img/down-icon.png`} />
                  </div>
                </div>
                <div id="meta-metadata" className="container collapse">
                  <div className="meta-wrapper">
                    <div className="small-note text-right">
                      {this.state.form.metadata.length} / 150 karakter
                    </div>
                    <div className="group">
                      <textarea
                        name="metadata"
                        rows="4"
                        maxLength="150"
                        onChange={this.handleFormChange}
                        value={this.state.form.metadata}
                      ></textarea>
                    </div>
                    {/*
                  <div style={{minWidth:'20px',minHeight:'20px'}}></div>
                  <div className="group">
                    <button className="color-button">Simpan</button>
                  </div>
                  */}
                  </div>
                </div>
              </div>
              {false && (
                <div className="meta-card">
                  <div
                    data-toggle="collapse"
                    data-target="#meta-keywords"
                    className="card-toggler clickable"
                  >
                    <div className="text align-self-center">Kata kunci</div>
                    <div style={{ minWidth: "20px" }}></div>
                    <div className="align-self-center">
                      <img src={`${Config.BASE_URL}/img/down-icon.png`} />
                    </div>
                  </div>
                  <div id="meta-keywords" className="container collapse">
                    <div className="meta-wrapper">
                      <div className="group">
                        <CreatableSelect
                          isMulti
                          onChange={this.handleTagChange}
                          options={this.state.form.tagRecommendedList}
                        />
                      </div>
                      <div className="small-note">
                        Pisahkan dengan tombol Enter.
                      </div>
                      {/*
                  <div style={{minWidth:'20px',minHeight:'20px'}}></div>
                  <div className="group">
                    <button className="color-button">Simpan</button>
                  </div>
                  */}
                    </div>
                  </div>
                </div>
              )}
              {false && (
                <div className="meta-card">
                  <div
                    data-toggle="collapse"
                    data-target="#meta-url"
                    className="card-toggler clickable"
                  >
                    <div className="text align-self-center">URL</div>
                    <div style={{ minWidth: "20px" }}></div>
                    <div className="align-self-center">
                      <img src={`${Config.BASE_URL}/img/down-icon.png`} />
                    </div>
                  </div>
                  <div id="meta-url" className="container collapse">
                    <div className="meta-wrapper">
                      <div className="group">
                        <label>Copy URL</label>
                        <textarea
                          name="url"
                          rows="3"
                          maxLength="150"
                          onChange={this.handleFormChange}
                          value={this.state.form.url}
                        ></textarea>
                      </div>
                      {/*
                  <div style={{minWidth:'20px',minHeight:'20px'}}></div>
                  <div className="group">
                    <button className="color-button">Simpan</button>
                  </div>
                  */}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div style={{ minWidth: "20px", minHeight: "20px" }}></div>
          </div>
          {this.state.isPreview && (
            <div className="d-flex flex-column">
              <div className="preview-page">
                <div className="preview-page-header">Pratinjau Artikel</div>
                <div className="container" style={{ maxWidth: "700px" }}>
                  <div className="title">{this.state.form.title}</div>
                  <div style={{ minWidth: "16px", minHeight: "16px" }}></div>
                  <div className="meta">
                    Ditulis oleh :{" "}
                    <span>
                      {this.state.form.writerVal === ""
                        ? "-"
                        : this.state.form.writerList[this.state.form.writerVal]
                            .name}
                    </span>
                  </div>
                  <div style={{ minWidth: "8px", minHeight: "8px" }}></div>
                  <div className="meta">
                    {this.state.form.reviewerVal !== "" && (
                      <>
                        {" "}
                        Ditinjau oleh :{" "}
                        <span>
                          {
                            this.state.form.reviewerList[
                              this.state.form.reviewerVal
                            ].name
                          }
                        </span>
                      </>
                    )}
                  </div>
                  <div style={{ minWidth: "16px", minHeight: "16px" }}></div>
                  {this.state.form.gallerySelected !== null && (
                    <img
                      className="preview-img"
                      src={this.state.form.gallerySelected.url}
                    />
                  )}
                  {this.state.form.gallerySelected !== null && (
                    <div className="preview-img-caption">
                      {this.state.form.gallerySelected.caption}
                    </div>
                  )}
                  <div style={{ minWidth: "16px", minHeight: "16px" }}></div>
                  <div className="meta-tags-list">
                    {this.state.form.tagVal.map((item, index) => (
                      <>
                        <div key={index} className="meta-tags">
                          {item}
                        </div>
                        <div style={{ minWidth: "4px" }}></div>
                      </>
                    ))}
                  </div>
                  <div style={{ minWidth: "16px", minHeight: "16px" }}></div>
                  <div
                    className="content"
                    dangerouslySetInnerHTML={{
                      __html:
                        this.state.form.editor[
                          this.state.form.previewPage - 1
                        ].textEditor.getEditorValue(),
                    }}
                  ></div>
                  <div className="pagination d-flex justify-content-center">
                    <div className="note align-self-center">
                      Lanjut ke halaman
                    </div>
                    <div style={{ minWidth: "16px", minHeight: "16px" }}></div>
                    <div
                      onClick={() =>
                        this.goPage(this.state.form.previewPage - 1)
                      }
                      className="page clickable"
                    >
                      <img
                        src={`${Config.BASE_URL}/img/page-arrow-left.png`}
                        alt=""
                      />
                    </div>
                    {this.generatePreviewPagination().page.map(
                      (item, index) => (
                        <div
                          onClick={() => this.goPage(item)}
                          className={`page ${
                            item === this.state.form.previewPage ? "active" : ""
                          } clickable`}
                        >
                          {item}
                        </div>
                      )
                    )}
                    <div
                      onClick={() =>
                        this.goPage(this.state.form.previewPage + 1)
                      }
                      className="page clickable"
                    >
                      <img
                        src={`${Config.BASE_URL}/img/page-arrow-right.png`}
                        alt=""
                      />
                    </div>
                  </div>
                  <div style={{ minWidth: "16px", minHeight: "16px" }}></div>
                  <div className="article-action d-flex">
                    <div className="like d-flex">
                      <div>
                        <img
                          src={`${Config.BASE_URL}/img/like-icon.png`}
                          alt=""
                        />
                      </div>
                      <div style={{ minHeight: "4px", minWidth: "4px" }}></div>
                      <div className="like-qty align-self-center">
                        0 Disukai
                      </div>
                    </div>
                    <div style={{ minHeight: "20px", minWidth: "20px" }}></div>
                    <div className="comment like d-flex">
                      <div>
                        <img
                          src={`${Config.BASE_URL}/img/comment-icon.png`}
                          alt=""
                        />
                      </div>
                      <div style={{ minHeight: "4px", minWidth: "4px" }}></div>
                      <div className="like-qty align-self-center">
                        0 Komentar
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {this.state.isLoading && <div className="loader"></div>}
        </div>
      </>
    );
  }
}

export default ArticleListCreate;
