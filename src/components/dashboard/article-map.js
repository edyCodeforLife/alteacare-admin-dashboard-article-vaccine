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
import "moment/locale/id";
import MUIDataTable from "mui-datatables";
import { Link } from "react-router-dom";
import * as Config from "./../../Config";
import imageCompression from "browser-image-compression";
moment.locale("id");

const Swal2 = withReactContent(Swal);

class ArticleMap extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if (admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
      articleMap: {
        list: [],
        val: null,
      },
      article: {
        list: [],
        val: null,
      },
      form: {
        filterArticle: "",
        recArticlesVal: [],
        filterCategory: "",
        editedCategory: null,
        categoryList: [],
        categoryVal: "",
        categoryName: "",
        categoryLink: "",
        categoryImg: null,
        categoryImgPreview: null,
        categoryFilter: "",
        topicFilter: "",
        topicVal: "",
      },
    };
    this.getArticleMapList = this.getArticleMapList.bind(this);
    this.getArticleList = this.getArticleList.bind(this);
    this.setRecVal = this.setRecVal.bind(this);
    this.toggleRecVal = this.toggleRecVal.bind(this);
    this.updateRecommendedVal = this.updateRecommendedVal.bind(this);
    this.deleteRecommendedVal = this.deleteRecommendedVal.bind(this);
    this.isRecommended = this.isRecommended.bind(this);
    this.fetchCategoryList = this.fetchCategoryList.bind(this);
    this.addCategory = this.addCategory.bind(this);
    this.editCategory = this.editCategory.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.handleCategoryFileChange = this.handleCategoryFileChange.bind(this);
    this.fetchCategoryList = this.fetchCategoryList.bind(this);
    this.addCategory = this.addCategory.bind(this);
    this.editCategory = this.editCategory.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
  }

  async componentDidMount() {
    await this.getArticleMapList();
    await this.getArticleList();
    await this.fetchCategoryList();
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

  async handleCategoryFileChange(event) {
    if (this.state.isLoading) return;
    this.setState({ isLoading: true });
    let context = this;
    let file = event.target.files[0];
    if (file != null) {
      file = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });
      let reader = new FileReader();
      this.state.form.categoryImg = file;
      reader.addEventListener(
        "load",
        function () {
          context.state.form.categoryImgPreview = reader.result;
          let img = new Image();
          img.onload = () => {
            context.setState({ form: context.state.form });
          };
          img.src = context.state.form.categoryImgPreview;
        },
        false
      );
      reader.readAsDataURL(file);
    } else {
      this.state.form.categoryImg = null;
      this.state.form.categoryImgPreview = null;
    }
    this.setState({ isLoading: false, form: this.state.form });
  }

  async fetchCategoryList() {
    this.setState((prevState) => ({
      isLoading: true,
      form: {
        ...prevState.form,
        categoryList: [],
        categoryVal: "",
        categoryName: "",
      },
    }));
    let response = await axios.get(`${Config.API_URL_2}/cms/category`, {
      headers: { token: this.state.admin.token },
    });
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        this.setState((prevState) => ({
          form: {
            ...prevState.form,
            categoryList: data.data.categories,
          },
        }));
        console.log(this.state.form.categoryList);
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  }

  async addCategory() {
    if (this.state.isLoading) return;
    if (this.state.form.categoryName === "")
      return Swal.fire("Nama Topik wajib diisi");
    if (
      this.state.form.categoryImg == null &&
      this.state.form.categoryLink === ""
    )
      return Swal.fire("Gambar Topik wajib diisi");
    this.setState({ isLoading: true });
    let formData = new FormData();
    let type = "";
    if (this.state.form.categoryLink !== "") type = "LINK";
    if (this.state.form.categoryImg != null) type = "UPLOAD";
    formData.append("name", this.state.form.categoryName);
    if (type !== "") formData.append("type", type);
    if (type === "LINK") formData.append("link", this.state.form.categoryLink);
    if (type === "UPLOAD")
      formData.append("category_image", this.state.form.categoryImg);
    let response = await axios.post(
      `${Config.API_URL_2}/cms/category`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 201) {
        await Swal.fire("Success", "Topik Berhasil ditambahkan", "success");
        this.fetchCategoryList();
        if (document.getElementById("close-topic-modal") != null)
          document.getElementById("close-topic-modal").click();
        this.setState((prevState) => ({
          form: {
            ...prevState.form,
            topicVal: "",
            categoryName: "",
            categoryLink: "",
            categoryImg: null,
            categoryImgPreview: null,
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

  async editCategory() {
    if (this.state.isLoading) return;
    if (this.state.form.categoryName === "")
      return Swal.fire("Nama Topik wajib diisi");
    this.setState({ isLoading: true });
    let formData = new FormData();
    formData.append("name", this.state.form.categoryName);
    let type = "";
    if (this.state.form.categoryLink !== "") type = "LINK";
    if (this.state.form.categoryImg != null) type = "UPLOAD";
    if (type !== "") formData.append("type", type);
    if (type === "LINK") formData.append("link", this.state.form.categoryLink);
    if (type === "UPLOAD")
      formData.append("category_image", this.state.form.categoryImg);
    let response = await axios.put(
      `${Config.API_URL_2}/cms/category/${
        this.state.form.categoryList[this.state.form.topicVal].id
      }`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        await Swal.fire("Success", "Status topik berhasil diubah", "success");
        this.setState((prevState) => ({
          form: {
            ...prevState.form,
            editedCategory: null,
            topicVal: "",
            categoryName: "",
            categoryImg: null,
            categoryImgPreview: null,
          },
        }));
        this.fetchCategoryList();
        if (document.getElementById("close-topic-modal") != null)
          document.getElementById("close-topic-modal").click();
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState((prevState) => ({
      form: { ...prevState.form },
      isLoading: false,
    }));
  }

  async deleteCategory(category) {
    if (this.state.isLoading) return;
    let confirm = await Swal.fire({
      title: "Hapus Topik ini?",
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
      `${Config.API_URL_2}/cms/category/${category.id}`,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        await Swal.fire("Success", "Topik berhasil dihapus", "success");
        this.fetchCategoryList();
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState((prevState) => ({
      form: { ...prevState.form },
      isLoading: false,
    }));
  }

  setEditCategory(category) {
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        editedCategory: category,
        categoryName: category.name,
        categoryLink: "",
        categoryImg: null,
        categoryImgPreview: null,
        topicVal: this.state.form.categoryList.indexOf(category),
      },
    }));
  }

  async getArticleList() {
    this.setState({ isLoading: true });
    let response = await axios.get(`${Config.API_URL_2}/cms/article`, {
      headers: { token: this.state.admin.token },
    });
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        this.setState({ article: { list: data.data.articles, val: null } });
        console.log(this.state.article);
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  }

  async getArticleMapList() {
    this.setState({ isLoading: true });
    let response = await axios.get(
      `${Config.API_URL_2}/cms/article/recomend/top`,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        this.setState({
          articleMap: { list: data.data.articles, val: null },
        });
        console.log(this.state.articleMap);
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  }

  toggleRecVal(article) {
    if (this.isRecommended(article)) {
      let articleID = article.id;
      let recArticlesVal = this.state.form.recArticlesVal;
      recArticlesVal.splice(recArticlesVal.indexOf(articleID), 1);
      this.setState((prevState) => ({ form: { ...prevState.form } }));
    } else {
      if (this.state.form.recArticlesVal.length === 5)
        return Swal.fire(
          "Maksimum jumlah artikel yang dapat direkomendasi adalah 5"
        );
      this.setState((prevState) => ({
        form: {
          ...prevState.form,
          recArticlesVal: [...this.state.form.recArticlesVal, article.id],
        },
      }));
    }
  }

  async updateRecommendedVal() {
    if (this.state.isLoading) return;
    this.setState({ isLoading: true });
    let formData = {};
    formData.list_id = this.state.form.recArticlesVal;
    let response = await axios.put(
      `${Config.API_URL_2}/cms/article/recomend/edit`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        await Swal.fire("Berhasil", "Rekomendasi berhasil diubah", "success");
        window.location.reload();
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  }

  async deleteRecommendedVal(article) {
    if (this.state.isLoading) return;
    let confirm = await Swal.fire({
      title: "Apakah anda yakin?",
      text: "Apakah Anda yakin ingin menghapus Artikel ini dari daftar rekomendasi?",
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
      `${Config.API_URL_2}/cms/article/recomend/delete/${article.id}`,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        await Swal.fire("Berhasil", "Data telah dihapus", "success");
        window.location.reload();
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  }

  setRecVal() {
    let articles = [];
    for (let i = 0; i < this.state.articleMap.list.length; i++) {
      let item = this.state.articleMap.list[i];
      articles.push(item.id);
    }
    this.setState((prevState) => ({
      form: { ...prevState.form, recArticlesVal: articles },
    }));
  }

  isRecommended(article) {
    return this.state.form.recArticlesVal.includes(article.id);
  }

  render() {
    return (
      <>
        <div className="standard-2-page">
          <div className="banner">
            <div className="title d-flex flex-column flex-md-row">
              <div className="flex-grow-1 align-self-center">
                <div className="left d-flex">
                  <div className="text flex-grow-1 align-self-center">
                    Map Konten
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ minHeight: "16px" }}></div>
          <div className="tab-container">
            <div className="tab-header">
              <div className="title">Rekomendasi</div>
              <div className="action">
                <button
                  onClick={this.setRecVal}
                  data-toggle="modal"
                  data-target="#article-modal"
                >
                  Terbitkan
                </button>
              </div>
            </div>
            <div className="tab-content">
              <div className="article-map-list">
                {this.state.articleMap.list.map((item, index) => (
                  <div key={index}>
                    <div className="d-flex flex-column h-100">
                      <div
                        onClick={() =>
                          this.setState((prevState) => ({
                            articleMap: {
                              ...this.state.articleMap,
                              val: index,
                            },
                          }))
                        }
                        className={`article-map flex-grow-1 clickable ${
                          index === this.state.articleMap.val ? "active" : ""
                        }`}
                      >
                        <div className="article-map-wrapper">
                          <div
                            className="article-thumb"
                            style={{
                              backgroundImage: `url('${item.url_thumbnail}')`,
                            }}
                          ></div>
                          <div className="article-data">
                            <div className="article-title">{item.title}</div>
                            <div
                              style={{ minHeight: "10px", minWidth: "10px" }}
                            ></div>
                            <div className="article-desc">{item.caption}</div>
                            <div
                              style={{ minHeight: "10px", minWidth: "10px" }}
                            ></div>
                            <div className="article-date">
                              {moment(item.create_at).format(
                                "dddd, DD MMMM YYYY"
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`article-map-action ${
                          index === this.state.articleMap.val ? "show" : ""
                        }`}
                      >
                        <div
                          onClick={this.setRecVal}
                          data-toggle="modal"
                          data-target="#article-modal"
                          className="edit-action clickable"
                        >
                          Ubah
                        </div>
                        <div
                          style={{ minHeight: "8px", minWidth: "8px" }}
                        ></div>
                        <div
                          onClick={() => this.deleteRecommendedVal(item)}
                          className="delete-action clickable"
                        >
                          Hapus
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {this.state.articleMap.list.length < 5 && (
                  <div
                    onClick={this.setRecVal}
                    data-toggle="modal"
                    data-target="#article-modal"
                    className="article-map-add clickable"
                  >
                    <div>
                      <img
                        src={`${Config.BASE_URL}/img/white-add-icon.png`}
                        alt=""
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="modal fade" id="article-modal">
                <div className="modal-dialog modal-xl">
                  <div className="modal-content">
                    <div className="modal-body p-0">
                      <div className="header">
                        <div className="header-title">Daftar Artikel</div>
                        <div
                          id="close-article-modal"
                          className="close-it clickable"
                          data-dismiss="modal"
                        >
                          Tutup
                        </div>
                      </div>
                      <div className="panel-content">
                        <div className="container">
                          <div
                            style={{ minHeight: "16px", minWidth: "16px" }}
                          ></div>
                          <div className="action d-flex flex-column flex-md-row justify-content-end">
                            <div className="article-search-wrapper">
                              <input
                                name="filterArticle"
                                type="text"
                                className="article-search"
                                onChange={this.handleFormChange}
                                value={this.state.form.filterArticle}
                                placeholder="Cari artikel"
                              />
                              <div className="search-icon">
                                <img
                                  src={`${Config.BASE_URL}/img/green-search-icon.png`}
                                />
                              </div>
                            </div>
                            <div
                              style={{ minHeight: "16px", minWidth: "16px" }}
                            ></div>
                            <div>
                              <NavLink to="/article-list-create">
                                <button
                                  onClick={() =>
                                    document
                                      .getElementById("close-article-modal")
                                      .click()
                                  }
                                  className="blue-button"
                                >
                                  Buat Artikel Baru
                                </button>
                              </NavLink>
                            </div>
                          </div>
                          <div
                            style={{ minHeight: "12px", minWidth: "12px" }}
                          ></div>
                          <div className="overflow">
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>Judul</th>
                                  <th>Penulis</th>
                                  <th>Topik</th>
                                  <th>Tanggal dibuat</th>
                                  <th>Tanggal diperbarui</th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {this.state.article.list.map(
                                  (item, index) =>
                                    (this.state.form.filterArticle === "" ||
                                      item.title
                                        .toLowerCase()
                                        .includes(
                                          this.state.form.filterArticle.toLowerCase()
                                        )) &&
                                    item.status === "Terbit" && (
                                      <tr key={index}>
                                        <td className="title">{item.title}</td>
                                        <td>{item.writer}</td>
                                        <td>{item.category}</td>
                                        <td>
                                          {moment(item.create_at).format(
                                            "DD MMMM YYYY"
                                          )}
                                        </td>
                                        <td>
                                          {moment(item.update_at).format(
                                            "DD MMMM YYYY"
                                          )}
                                        </td>
                                        <td>
                                          <div
                                            onClick={() =>
                                              this.toggleRecVal(item)
                                            }
                                            className={`checkbox clickable ${
                                              this.isRecommended(item)
                                                ? "active"
                                                : ""
                                            }`}
                                          >
                                            ✓
                                          </div>
                                        </td>
                                      </tr>
                                    )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      <div
                        style={{ minHeight: "12px", minWidth: "12px" }}
                      ></div>
                      <div className="panel-footer">
                        <div className="container">
                          <div
                            style={{ minHeight: "16px", minWidth: "16px" }}
                          ></div>
                          <div className="action text-right">
                            <button
                              onClick={this.updateRecommendedVal}
                              className="green-button"
                            >
                              Terapkan
                            </button>
                          </div>
                          <div
                            style={{ minHeight: "16px", minWidth: "16px" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ minHeight: "32px", minWidth: "32px" }}></div>
          <div className="banner">
            <div className="title d-flex flex-column flex-md-row">
              <div className="flex-grow-1 align-self-center">
                <div className="left d-flex">
                  <div className="text flex-grow-1 align-self-center">
                    Topik Artikel
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ minHeight: "16px", minWidth: "16px" }}></div>
          <div className="category-map-list">
            <div className="action d-flex flex-column flex-md-row justify-content-end">
              <div className="category-search-wrapper">
                <input
                  name="filterCategory"
                  type="text"
                  className="category-search"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterCategory}
                  placeholder="Cari Topik"
                />
                <div className="search-icon">
                  <img src={`${Config.BASE_URL}/img/green-search-icon.png`} />
                </div>
              </div>
              <div style={{ minHeight: "16px", minWidth: "16px" }}></div>
              <div>
                <button
                  onClick={() =>
                    this.setState((prevState) => ({
                      form: {
                        ...prevState.form,
                        editedCategory: null,
                        categoryName: "",
                        categoryLink: "",
                        categoryImg: null,
                        categoryImgPreview: null,
                        topicVal: "",
                      },
                    }))
                  }
                  className="blue-button"
                  data-toggle="modal"
                  data-target="#topic-modal"
                >
                  Tambah Topik
                </button>
              </div>
              <div className="modal fade" id="topic-modal">
                <div className="modal-dialog modal-xl">
                  <div className="modal-content">
                    <div className="modal-body p-0">
                      <div className="header">
                        <div className="header-title">Galleri Media</div>
                        <div
                          id="close-topic-modal"
                          className="close-it clickable"
                          data-dismiss="modal"
                        >
                          Tutup
                        </div>
                      </div>
                      <div className="panel-content d-flex flex-md-row flex-column">
                        <div className="panel-upload-content">
                          <div className="topic-form group text-left">
                            <label>Nama Topik</label>
                            <input
                              name="categoryName"
                              type="text"
                              onChange={this.handleFormChange}
                              value={this.state.form.categoryName}
                              placeholder="Tulis Nama Topik"
                            />
                          </div>
                          <div style={{ minHeight: "24px" }}></div>
                          <input
                            id="topic-img-input"
                            type="file"
                            onChange={this.handleCategoryFileChange}
                            style={{ display: "none" }}
                            accept=".jpg,.jpeg,.png"
                          />
                          <div
                            className="pick-img-wrapper"
                            style={{
                              backgroundImage:
                                this.state.form.categoryImgPreview === null
                                  ? this.state.form.categoryLink !== ""
                                    ? `url('${this.state.form.categoryLink}')`
                                    : this.state.form.topicVal !== ""
                                    ? `url('${
                                        this.state.form.categoryList[
                                          this.state.form.topicVal
                                        ].image
                                      }')`
                                    : ""
                                  : `url('${this.state.form.categoryImgPreview}')`,
                            }}
                          >
                            <div
                              className={`pick-img-wrapper-2 ${
                                this.state.form.categoryImgPreview === null &&
                                this.state.form.topicVal === "" &&
                                this.state.form.categoryLink === ""
                                  ? ""
                                  : "active"
                              }`}
                            >
                              <div
                                className="pick-img align-self-center clickable"
                                onClick={() =>
                                  document
                                    .getElementById("topic-img-input")
                                    .click()
                                }
                              >
                                Pilih Gambar
                              </div>
                              <div style={{ minHeight: "16px" }}></div>
                              <div className="pick-img-note">
                                Ukuran Maksimal gambar : 50 MB
                              </div>
                              {this.state.form.topicVal !== "" && (
                                <div className="pick-img-note">
                                  <em>(Isi untuk mengubah gambar)</em>
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ minHeight: "24px" }}></div>
                          {this.state.form.topicVal === "" && (
                            <button
                              onClick={this.addCategory}
                              className="color-button"
                            >
                              Tambahkan
                            </button>
                          )}
                          {this.state.form.topicVal !== "" && (
                            <button
                              onClick={this.editCategory}
                              className="color-button"
                            >
                              Ubah
                            </button>
                          )}
                          {this.state.form.topicVal !== "" && (
                            <>
                              <div style={{ minHeight: "12px" }}></div>
                              <button
                                onClick={() =>
                                  this.setState((prevState) => ({
                                    form: {
                                      ...prevState.form,
                                      topicVal: "",
                                      categoryName: "",
                                      categoryImg: null,
                                      categoryImgPreview: null,
                                    },
                                  }))
                                }
                                className="red-button"
                              >
                                Tutup
                              </button>
                            </>
                          )}
                        </div>
                        <div className="panel-gallery">
                          <div className="d-flex flex-column-reverse flex-md-row h-100">
                            <div className="left flex-grow-1">
                              <div style={{ minHeight: "16px" }}></div>
                              <div className="search-bar">
                                <input
                                  name="topicFilter"
                                  onChange={this.handleFormChange}
                                  type="text"
                                  className="gallery-filter-input w-100"
                                  placeholder=""
                                />
                                <div className="search-icon">
                                  <img
                                    src={`${Config.BASE_URL}/img/search-icon.png`}
                                  />
                                </div>
                              </div>
                              <div className="panel-gallery-list d-flex flex-wrap">
                                {this.state.form.categoryList.map(
                                  (item, index) =>
                                    (this.state.form.topicFilter === "" ||
                                      item.name
                                        .toLowerCase()
                                        .includes(
                                          this.state.form.topicFilter.toLowerCase()
                                        )) && (
                                      <div
                                        key={index}
                                        onClick={() =>
                                          this.setState((prevState) => ({
                                            form: {
                                              ...prevState.form,
                                              categoryLink: item.image,
                                              categoryImg: null,
                                              categoryImgPreview: null,
                                            },
                                          }))
                                        }
                                        className={`panel-gallery-item clickable ${
                                          this.state.form.topicVal === index
                                            ? "active"
                                            : ""
                                        }`}
                                        style={{
                                          backgroundImage: `url('${item.image}')`,
                                        }}
                                      ></div>
                                    )
                                )}
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
            <div className="category-map-list-wrapper">
              {this.state.form.categoryList.map(
                (item, index) =>
                  (index === 0 ||
                    this.state.form.filterCategory === "" ||
                    item.name
                      .toLowerCase()
                      .includes(
                        this.state.form.filterCategory.toLowerCase()
                      )) && (
                    <div
                      key={index}
                      className={`category-map ${
                        index === 0 ? "primary" : "secondary"
                      }`}
                    >
                      <NavLink
                        to={`/article-map-category/${item.id}`}
                        className="text"
                        style={{
                          backgroundImage: `url('${item.image}')`,
                          backgroundPosition: "center",
                          backgroundSize: "cover",
                          borderRadius: "8px",
                        }}
                      >
                        {index > 0 && (
                          <div
                            style={{
                              height: "100%",
                              display: "flex",
                              justifyContent: "center",
                              flexDirection: "column",
                              backgroundColor: "rgb(0, 0, 0, 0.3)",
                              fontFamily: "Inter",
                              fontWeight: "bold",
                              fontSize: "20px",
                              color: "#FFFFFF",
                              borderRadius: "8px",
                            }}
                          >
                            {item.name}
                          </div>
                        )}
                        {index === 0 && <div>{item.name}</div>}
                      </NavLink>
                      <div
                        className={`category-map-action ${
                          index > 0 ? "show" : ""
                        }`}
                      >
                        <div
                          onClick={() => this.setEditCategory(item)}
                          data-toggle="modal"
                          data-target="#topic-modal"
                          className="edit-action clickable"
                        >
                          Ubah
                        </div>
                        <div
                          style={{ minHeight: "8px", minWidth: "8px" }}
                        ></div>
                        <div
                          onClick={() => this.deleteCategory(item)}
                          className="delete-action clickable"
                        >
                          Hapus
                        </div>
                      </div>
                    </div>
                  )
              )}
            </div>
            <div style={{ minHeight: "16px", minWidth: "16px" }}></div>
          </div>
        </div>
        <div style={{ minHeight: "32px", minWidth: "32px" }}></div>
        {this.state.isLoading && <div className="loader"></div>}
      </>
    );
  }
}

export default ArticleMap;
