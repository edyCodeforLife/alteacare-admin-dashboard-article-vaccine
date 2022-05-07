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

class Admin extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if(admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
      adm: {
        list: [],
        val: null,
      },
    };
    this.getAdmList = this.getAdmList.bind(this);
    this.delete = this.delete.bind(this);
  }

  componentDidMount() {
    this.getAdmList();
  }

  async delete(adm) {
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
    let response = await axios.delete(`${Config.API_URL_2}/cms/admin/${adm.id}`, { headers: { token: this.state.admin.token } });
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

  async getAdmList() {
    this.setState({ isLoading: true });
    let response = await axios.get(`${Config.API_URL_2}/cms/admin`, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        this.setState({ adm: { list: data.data.admin, val: null } });
        console.log(this.state.adm);
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  render() {
    let thead = [
      {
        label: 'Nama',
        name: 'name',
        options: {
          sort: true,
          filter: false,
          customBodyRenderLite: (index) => <div className="no-wrap">{this.state.adm.list[index].name}</div>,
          customHeadRender: (columnMeta, handleToggleColumn, sortOrder) => {
            let orderIcon = <i className="fa fa-sort"></i>;
            if(sortOrder.name === String(columnMeta?.name)) {
              if(sortOrder.direction === 'asc') orderIcon = <i className="fa fa-sort-asc"></i>;
              else orderIcon = <i className="fa fa-sort-desc"></i>;
            }
            return <th onClick={() => handleToggleColumn(columnMeta?.index)} className="no-wrap clickable">{String(columnMeta?.label)}&ensp; {orderIcon}</th>;
          },
        }
      }, {
        label: 'Role',
        name: 'role',
        options: {
          sort: true,
          filter: true,
          filterOptions: {
            names: ['Penulis', 'Penyunting', 'Peninjau Materi'],
            logic(item, filterVal) {
              return !item.toLowerCase().includes(filterVal[0].toLowerCase());
            },
          },
          customBodyRenderLite: (index) => <div className="no-wrap">{this.state.adm.list[index].role}</div>,
          customHeadRender: (columnMeta, handleToggleColumn, sortOrder) => {
            let orderIcon = <i className="fa fa-sort"></i>;
            if(sortOrder.name === String(columnMeta?.name)) {
              if(sortOrder.direction === 'asc') orderIcon = <i className="fa fa-sort-asc"></i>;
              else orderIcon = <i className="fa fa-sort-desc"></i>;
            }
            return <th onClick={() => handleToggleColumn(columnMeta?.index)} className="no-wrap clickable">{String(columnMeta?.label)}&ensp; {orderIcon}</th>;
          },
        }
      }, {
        label: 'Jumlah Artikel',
        name: 'total_articles',
        options: {
          sort: true,
          filter: false,
          customBodyRenderLite: (index) => <div>{new Intl.NumberFormat().format(this.state.adm.list[index].total_articles)}</div>,
          customHeadRender: (columnMeta, handleToggleColumn, sortOrder) => {
            let orderIcon = <i className="fa fa-sort"></i>;
            if(sortOrder.name === String(columnMeta?.name)) {
              if(sortOrder.direction === 'asc') orderIcon = <i className="fa fa-sort-asc"></i>;
              else orderIcon = <i className="fa fa-sort-desc"></i>;
            }
            return <th onClick={() => handleToggleColumn(columnMeta?.index)} className="no-wrap clickable">{String(columnMeta?.label)}&ensp; {orderIcon}</th>;
          },
        }
      }, {
        label: 'Total Ebook',
        name: 'total_ebook',
        options: {
          sort: true,
          filter: false,
          customBodyRenderLite: (index) => <div>{new Intl.NumberFormat().format(this.state.adm.list[index].total_ebook)}</div>,
          customHeadRender: (columnMeta, handleToggleColumn, sortOrder) => {
            let orderIcon = <i className="fa fa-sort"></i>;
            if(sortOrder.name === String(columnMeta?.name)) {
              if(sortOrder.direction === 'asc') orderIcon = <i className="fa fa-sort-asc"></i>;
              else orderIcon = <i className="fa fa-sort-desc"></i>;
            }
            return <th onClick={() => handleToggleColumn(columnMeta?.index)} className="no-wrap clickable">{String(columnMeta?.label)}&ensp; {orderIcon}</th>;
          },
        }
      }, {
        label: '',
        name: '',
        options: {
          sort: false,
          viewColumns: false,
          filter: false,
          customBodyRenderLite: (index) => <div className="d-flex">
            <NavLink to={`/admin-edit/${this.state.adm.list[index].id}`}><div className="detail-text clickable">Ubah</div></NavLink>
            <div style={{minWidth:'20px'}}></div>
            <div onClick={() => this.delete(this.state.adm.list[index])} className="delete-text clickable">Hapus</div>
          </div>,
          customHeadRender: (columnMeta, handleToggleColumn, sortOrder) => {
            let orderIcon = <i className="fa fa-sort"></i>;
            if(sortOrder.name === String(columnMeta?.name)) {
              if(sortOrder.direction === 'asc') orderIcon = <i className="fa fa-sort-asc"></i>;
              else orderIcon = <i className="fa fa-sort-desc"></i>;
            }
            return <th onClick={() => handleToggleColumn(columnMeta?.index)} className="no-wrap clickable">{String(columnMeta?.label)}&ensp; {orderIcon}</th>;
          },
        }
      },
    ];
    return (<>
      <div className="standard-page">
        <div className="d-flex flex-column flex-md-row justify-content-between">
          <div className="action-bar">
            <div className="title">Daftar Admin</div>
            <NavLink to="/admin-create"><button className="green-action-button">+ Tambah Admin Baru</button></NavLink>
          </div>
        </div>
        {this.state.isLoading && <div className="loader"></div>}
        <div className="primary-table">
          <MUIDataTable columns={thead} data={this.state.adm.list} options={{
            selectableRows: 'none',
            responsive: 'standard',
            elevation: 0, download: false, print: false,
            rowsPerPage: 6, rowsPerPageOptions: []
          }} />
        </div>
      </div>
    </>);
  }
}

export default Admin;
