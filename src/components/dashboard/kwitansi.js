import React from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';
import moment from 'moment';
import MUIDataTable from "mui-datatables";
import * as Config from './../../Config';
import UpdateKwitansiStatusForm from './../../forms/update-kwitansi-status-form';

const Swal2 = withReactContent(Swal);

class Kwitansi extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if(admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
      kwitansi: {
        list: [],
        val: null,
      }
    };
    this.getKwitansi = this.getKwitansi.bind(this);
    this.showImage = this.showImage.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
  }

  componentDidMount() {
    this.getKwitansi();
  }

  async getKwitansi() {
    this.setState({ isLoading: true });
    let formData = new FormData();
    let response = await axios.post(Config.API_URL + "/get-kwitansi-list", formData, { headers: { 'token': this.state.admin.token } });
    try {
      let data = response.data;
      if(data.status) {
        this.setState({
          kwitansi: { list: data.data, val: null }
        });
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

  showImageTransfer(image) {
    Swal.fire({
      imageUrl: image.substr(0, 7) == 'uploads' ? Config.API_URL + '/' + image : image,
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
        name: 'upload_time',
        options: {
          customBodyRenderLite: (index) => <div className="no-wrap">{moment(this.state.kwitansi.list[index].upload_time).format('DD MMM YYYY, HH:mm:ss')}</div>,
          sort: true,
          filter: false,
        }
      },
      {
        label: 'ID Kwitansi',
        name: 'kwitansi_id',
        options: {
          sort: false,
          filter: false,
        }
      },
      {
        label: 'Nama',
        name: 'fullname',
        options: {
          sort: false,
          filter: false,
          customBodyRenderLite: (index) => <div className="no-wrap">{this.state.kwitansi.list[index].fullname}</div>
        }
      },
      {
        label: 'Status',
        name: 'status',
        options: {
          customBodyRenderLite: (index) => <div className="d-flex"><div className={`kwitansi-status ${ this.state.kwitansi.list[index].status === 'NEW' ? 'new' : this.state.kwitansi.list[index].status === 'DIPROSES' ? 'process' : this.state.kwitansi.list[index].status === 'DITERIMA' ? 'approved' : 'rejected' } no-wrap`}>{this.state.kwitansi.list[index].status}</div><div style={{width: '4px'}}></div><button onClick={() => this.updateStatus(this.state.kwitansi.list[index])} className="btn" disabled={(['DITERIMA', 'DITOLAK']).includes(this.state.kwitansi.list[index].status)}>UBAH</button></div>
        }
      },
      {
        label: 'Bukti',
        name: 'kwitansi_img',
        options: {
          sort: false,
          filter: false,
          customBodyRenderLite: (index) => <div onClick={() => this.showImage(this.state.kwitansi.list[index].kwitansi_img)} className="no-wrap text-primary clickable">view image</div>
        }
      },
      {
        label: 'Cabang RS',
        name: 'cabang_rs',
        options: {
          customBodyRenderLite: (index) => <div className="no-wrap">{this.state.kwitansi.list[index].cabang_rs}</div>
        }
      },
      {
        label: 'Tanggal Transaksi',
        name: 'transaction_date',
        options: {
          filter: false,
          customBodyRenderLite: (index) => <div className="no-wrap">{moment(this.state.kwitansi.list[index].transaction_date).format('DD MMM YYYY')}</div>
        }
      },
      {
        label: 'Nominal',
        name: 'nominal',
        options: {
          filter: false,
          customBodyRenderLite: (index) => <div className="no-wrap text-right">{new Intl.NumberFormat().format(this.state.kwitansi.list[index].nominal)}</div>
        }
      },
      {
        label: 'No HP',
        name: 'phone_number',
        options: {
          filter: false,
          sort: false,
          customBodyRenderLite: (index) => <div className="no-wrap">{this.state.kwitansi.list[index].phone_number}</div>
        }
      },
      {
        label: 'Ewallet',
        name: 'ewallet',
        options: {
          customBodyRenderLite: (index) => <div className="no-wrap">{this.state.kwitansi.list[index].ewallet}</div>
        }
      },
      {
        label: 'Cashback',
        name: 'cashback',
        options: {
          filter: false,
          customBodyRenderLite: (index) => <div className={(this.state.kwitansi.list[index].cashback === null ? "text-center" : "text-right") + " no-wrap"}>{this.state.kwitansi.list[index].cashback === null ? '-' : new Intl.NumberFormat().format(this.state.kwitansi.list[index].cashback)}</div>
        }
      },
      {
        label: 'Bukti Transfer',
        name: 'transfer_img',
        options: {
          filter: false,
          sort: false,
          customBodyRenderLite: (index) => <div className={(this.state.kwitansi.list[index].transfer_img === null ? "text-center" : "text-right") + " no-wrap"}>{this.state.kwitansi.list[index].transfer_img === null ? '-' : <div onClick={() => this.showImageTransfer(this.state.kwitansi.list[index].transfer_img)} className="no-wrap text-primary clickable">view image</div>}</div>
        }
      },
      {
        label: 'Alasan',
        name: 'reason',
        options: {
          filter: false,
          customBodyRenderLite: (index) => <div className={(this.state.kwitansi.list[index].reason === null ? "text-center" : "text-right") + " no-wrap"}>{this.state.kwitansi.list[index].reason === null ? '-' : this.state.kwitansi.list[index].reason}</div>
        }
      },
    
    ];
    return (
      <div className="kwitansi-page">
        <div className="title">Kwitansi</div>
        {this.state.isLoading && <div className="loader"></div>}
        <div className="primary-table">
          <MUIDataTable columns={thead} data={this.state.kwitansi.list} options={{
            selectableRows: 'none',
            responsive: 'standard',
            elevation: 0, download: false,
            rowsPerPage: 10, rowsPerPageOptions: []
          }} />
        </div>
      </div>
    );
  }
}

export default Kwitansi;
