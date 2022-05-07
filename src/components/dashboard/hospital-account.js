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

class HospitalAccount extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if(admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
      hospitalAccount: {
        list: [],
        val: null,
      },
    };
    this.getHospitalAccountList = this.getHospitalAccountList.bind(this);
  }

  componentDidMount() {
    this.getHospitalAccountList();
  }

  async getHospitalAccountList() {
    this.setState({ isLoading: true });
    let formData = { };
    let response = await axios.get(Config.API_URL_2 + "/admin_vaccine/data_account_hospital", { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        this.setState({
          hospitalAccount: { list: data.date, val: null }
        });
        console.log(this.state.hospitalAccount);
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  render() {
    let createDateList = [];
    let updateDateList = [];
    for(let i=0;i<this.state.hospitalAccount.list.length;i++) {
      let item = this.state.hospitalAccount.list[i];
      let createDate = moment(item.created_at).format('DD MMMM YYYY');
      let updateDate = moment(item.updated_at).format('DD MMMM YYYY');
      if(!createDateList.includes(createDate)) createDateList.push(createDate);
      if(!updateDateList.includes(updateDate)) updateDateList.push(updateDate);
    }
    let thead = [
      {
        label: 'Nama Rumah Sakit',
        name: 'name',
        options: {
          sort: true,
          filter: true,
          customBodyRenderLite: (index) => <div className="no-wrap">{this.state.hospitalAccount.list[index].name}</div>,
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
        label: 'Email Rumah Sakit',
        name: 'email',
        options: {
          sort: true,
          filter: true,
          customBodyRenderLite: (index) => <div className="no-wrap">{this.state.hospitalAccount.list[index].email}</div>,
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
        label: 'Status',
        name: 'status',
        options: {
          sort: true,
          filter: true,
          filterOptions: {
            names: ['Enable', 'Disable'],
            logic(item, filterVal) {
              if(Number(item) === 1 && filterVal[0] === 'Enable') return false;
              if(Number(item) === 0 && filterVal[0] === 'Disable') return false;
              return true;
            },
          },
          viewColumns: false,
          customBodyRenderLite: (index) => <span>{Number(this.state.hospitalAccount.list[index].status) === 0 ? 'Disable' : 'Enable'}</span>,
          customHeadRender: (columnMeta, handleToggleColumn, sortOrder) => {
            let orderIcon = <i className="fa fa-sort"></i>;
            if(sortOrder.name === String(columnMeta?.name)) {
              if(sortOrder.direction === 'asc') orderIcon = <i className="fa fa-sort-asc"></i>;
              else orderIcon = <i className="fa fa-sort-desc"></i>;
            }
            return <th onClick={() => handleToggleColumn(columnMeta?.index)} className="no-wrap clickable">{String(columnMeta?.label)}&ensp; {orderIcon}</th>;
          },
        }
      },{
        label: 'Tanggal dibuat',
        name: 'created_at',
        options: {
          sort: true,
          filter: true,
          filterOptions: {
            names: createDateList,
            logic(item, filterVal) {
              return !(moment(item).format("DD MMMM YYYY") === filterVal[0]);
            },
          },
          customBodyRenderLite: (index) => <div>{moment(this.state.hospitalAccount.list[index].created_at).format('DD MMMM YYYY')}</div>,
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
        label: 'Tanggal diperbaharui',
        name: 'updated_at',
        options: {
          sort: true,
          filter: true,
          filterOptions: {
            names: updateDateList,
            logic(item, filterVal) {
              return !(moment(item).format("DD MMMM YYYY") === filterVal[0]);
            },
          },
          customBodyRenderLite: (index) => <div>{moment(this.state.hospitalAccount.list[index].updated_at).format('DD MMMM YYYY, HH:mm:ss')}</div>,
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
          filter: false,
          viewColumns: false,
          customBodyRenderLite: (index) => <NavLink to={`/hospital-account-edit/${this.state.hospitalAccount.list[index].id}`}><div className="detail-text clickable">Ubah</div></NavLink>
        }
      },
    ];
    return (<>
      <div className="standard-page">
        <div className="d-flex flex-column flex-md-row justify-content-between">
          <div className="action-bar">
            <div className="title">Daftar Rumah Sakit</div>
            <NavLink to="/hospital-account-create"><button className="blue-action-button">+ Tambah</button></NavLink>
          </div>
        </div>
        {this.state.isLoading && <div className="loader"></div>}
        <div className="primary-table">
          <MUIDataTable columns={thead} data={this.state.hospitalAccount.list} options={{
            selectableRows: 'none',
            responsive: 'standard',
            elevation: 0, download: false,
            rowsPerPage: 6, rowsPerPageOptions: []
          }} />
        </div>
      </div>
    </>);
  }
}

export default HospitalAccount;
