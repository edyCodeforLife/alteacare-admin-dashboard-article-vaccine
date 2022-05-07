import React from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';
import moment from 'moment';
import MUIDataTable from "mui-datatables";
import { Link } from 'react-router-dom';
import * as Config from './../../Config';
import UpdateKwitansiStatusForm from './../../forms/update-kwitansi-status-form';

const Swal2 = withReactContent(Swal);

class Information extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if(admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
      information: {
        list: [],
        val: null,
      }
    };
    this.getInformation = this.getInformation.bind(this);
    this.showImage = this.showImage.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
  }

  componentDidMount() {
    this.getInformation();
  }

  async getInformation() {
    this.setState({ isLoading: true });
    let formData = new FormData();
    let response = await axios.post(Config.API_URL + "/get-information-list", formData, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.status) {
        this.setState({
          information: { list: data.data, val: null }
        });
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  async deleteInformation(info) {
    if(this.state.isLoading) return;
    let confirm = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });
    if(!confirm.value) return;
    this.setState({ isLoading: true });
    let formData = new FormData();
    formData.append('id', info.news_id);
    let response = await axios.post(Config.API_URL + "/delete-information", formData, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.status) {
        await Swal.fire('Success', 'Informasi berhasil dihapus', 'success');
        this.getInformation();
      } else {
        Swal.fire('Failed', data.message, 'error');
      }
    } catch(error) {
      Swal.fire('Error', 'Unable to connect to server', 'error');
    }
    this.setState({ isLoading: false });
  }

  showImage(image) {
    Swal.fire({
      imageUrl: image,
    });
  }

  async updateStatus(kwitansi) {
    await Swal2.fire({
      html: (
        <>
          <div className="update-kwitansi-status">
            <UpdateKwitansiStatusForm admin={this.state.admin} kwitansi={kwitansi} getKwitansi={this.getKwitansi}></UpdateKwitansiStatusForm>
          </div>
        </>
      ),
      showConfirmButton: false
    });
  }

  render() {
    let thead = [
      {
        label: 'Waktu unggah',
        name: 'create_at',
        options: {
          customBodyRenderLite: (index) => this.state.information.list[index] === undefined ? <span></span> : <div className="no-wrap">{moment(this.state.information.list[index].create_at).format('DD MMM YYYY, HH:mm:ss')}</div>,
          sort: true,
          filter: false,
        }
      },
      {
        label: 'Cover Informasi',
        name: 'cover_img',
        options: {
          sort: false,
          filter: false,
          customBodyRenderLite: (index) => this.state.information.list[index] === undefined ? <span></span> : <div className="text-center"><img onClick={() => this.showImage(this.state.information.list[index].cover)} src={this.state.information.list[index].cover} className="clickable" style={{height: '80px'}} alt=""/></div>
        }
      },
      {
        label: 'Judul Informasi',
        name: 'title',
        options: {
          sort: false,
          filter: false,
        }
      },
      {
        label: 'Cabang Rumah Sakit',
        name: 'hospital_name',
      },
      {
        label: 'Aksi',
        name: 'news_id',
        options: {
          sort: false,
          filter: false,
          customBodyRenderLite: (index) => this.state.information.list[index] === undefined ? <span></span> : (
            <div className="d-flex justify-content-center">
              <Link to={`/edit-information/${this.state.information.list[index].news_id}`}><i className="fa fa-edit clickable" style={{color: '#61C7B5', fontSize: '24px', position: 'relative', top: '2px'}}></i></Link>
              <div style={{minWidth: '12px'}}></div>
              <i onClick={() => this.deleteInformation(this.state.information.list[index])} className="fa fa-trash-o clickable" style={{color: '#ED2323', fontSize: '24px'}}></i>
            </div>
          ),
        }
      }
    ];
    return (
      <div className="information-page">
        <div className="d-flex flex-column flex-md-row justify-content-between">
          <div className="title">Informasi</div>
          <div><Link to='/add-information'><button type="button" className="primary-button">Tambah Informasi Baru</button></Link></div>
        </div>
        {this.state.isLoading && <div className="loader"></div>}
        <div className="primary-table">
          <MUIDataTable columns={thead} data={this.state.information.list} options={{
            selectableRows: 'none',
            responsive: 'standard',
            elevation: 0, download: false,
            rowsPerPage: 6, rowsPerPageOptions: []
          }} />
        </div>
      </div>
    );
  }
}

export default Information;
