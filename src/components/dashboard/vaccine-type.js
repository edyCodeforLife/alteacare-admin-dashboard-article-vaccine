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

class VaccineType extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if(admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
      vaccineType: {
        list: [],
        val: null,
      },
    };
    this.getVaccineTypeList = this.getVaccineTypeList.bind(this);
  }

  componentDidMount() {
    this.getVaccineTypeList();
  }

  async getVaccineTypeList() {
    this.setState({ isLoading: true });
    let formData = { };
    let response = await axios.get(Config.API_URL_2 + "/admin_vaccine/list_location_vaccine_type", { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        let vaccineTypeList = data.data;
        for(let i=0;i<vaccineTypeList.length;i++) {
          let item = vaccineTypeList[i];
          item.range_age = `${item.min_age} - ${item.max_age} Tahun`;
        }
        this.setState({
          vaccineType: { list: vaccineTypeList, val: null }
        });
        console.log(this.state.vaccineType);
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async toggleCategory(item, category) {
    if(this.state.isLoading) return;
    this.setState({ isLoading: true });
    let response = await axios.post(`${Config.API_URL_2}/admin_vaccine/${category === 1 ? 'enable_category_type_vaccine' : 'disable_category_type_vaccine'}/${item.location_vaccine_available_id}`, { }, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.statusCode === 200) {
        item.is_category = category;
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
        label: 'Tipe Lokasi',
        name: 'type_location',
        options: {
          sort: true,
          filter: true,
          customBodyRenderLite: (index) => <div className="no-wrap">{this.state.vaccineType.list[index].type_location}</div>,
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
        label: 'Tipe Vaksin',
        name: 'vaccine_name',
        options: {
          sort: true,
          filter: true,
          customBodyRenderLite: (index) => <div className="no-wrap">{this.state.vaccineType.list[index].vaccine_name}</div>,
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
        label: 'Umur (untuk Vaksin)',
        name: 'range_age',
        options: {
          sort: true,
          filter: true,
          customBodyRenderLite: (index) => <div className="no-wrap">{this.state.vaccineType.list[index].range_age}</div>,
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
        label: 'Kategori',
        name: 'is_category',
        options: {
          sort: true,
          filter: true,
          customBodyRenderLite: (index) => <>
            {Number(this.state.vaccineType.list[index].is_category) === 1 && <div className="enable-category no-wrap">Enable</div>}
            {Number(this.state.vaccineType.list[index].is_category) === 0 && <div className="disable-category no-wrap">Disable</div>}
          </>,
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
          customBodyRenderLite: (index) => <NavLink to={`/vaccine-type-edit/${this.state.vaccineType.list[index].location_vaccine_type_id}`}><div className="detail-text clickable">Ubah</div></NavLink>
        }
      },
    ];
    return (<>
      <div className="standard-page">
        <div className="d-flex flex-column flex-md-row justify-content-between">
          <div className="action-bar">
            <div className="title">Daftar Tipe Vaksin</div>
            <NavLink to="/vaccine-type-create"><button className="blue-action-button">+ Tambah</button></NavLink>
          </div>
        </div>
        {this.state.isLoading && <div className="loader"></div>}
        <div className="primary-table">
          <MUIDataTable columns={thead} data={this.state.vaccineType.list} options={{
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

export default VaccineType;
