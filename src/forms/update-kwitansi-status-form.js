import React, { useState } from 'react';
import { useFormik } from 'formik';
import validator from 'validator';
import Swal from 'sweetalert2';
import axios from 'axios';
import * as Config from './../Config';

const UpdateKwitansiStatusForm = (props) => {
  let admin = props.admin;
  let kwitansi = props.kwitansi;
  let inputFile;
  const triggerInputFile = e => {
    inputFile.click();
  }
  const [cashbackImg, setCashbackImg] = useState(undefined);
  const [errorMessage, setErrorMessage] = useState('');

  const form = useFormik({
    initialValues: {
      status: 'DITERIMA',
      cashback: '0',
      cancelReasonList: ['Kwitansi tidak jelas', 'Input data tidak benar', 'Tanggal Kwitansi tidak sesuai dengan ketentuan', 'Pelanggan telah mengikuti program cashback', 'Nomor handphone tidak terdaftar di e-Wallet', 'Lain-lain (tidak sesuai dengan ketentuan)' ],
      cancelReason: 'Kwitansi tidak jelas',
    },
    onSubmit: async values => {
      if(values.status === 'DIPROSES') {
        let formData = new FormData();
        formData.append('id', kwitansi.id);
        formData.append('status', 'DIPROSES');
        let response = await axios.post(Config.API_URL + "/update-kwitansi-status", formData, { headers: { 'token': admin.token } });
        try {
          let data = response.data;
          if(data.status) {
            props.getKwitansi();
            await Swal.fire('Success', 'Status kwitansi berhasil diubah', 'success');
          } else {
            Swal.fire('Failed', data.message, 'error');
          }
        } catch(error) {
          Swal.fire('Error', 'Unable to connect to server', 'error');
        }
      } else if(values.status === 'DITERIMA') {
        //if(cashbackImg == null) return setErrorMessage('Bukti transfer wajib dilampirkan');
        //if(cashbackImg.size >= 2000000) return setErrorMessage('File tidak boleh melebih 2MB');
        //if(!(['image/jpeg', 'image/png', 'image/jpg']).includes(cashbackImg.type)) return setErrorMessage('Format gambar tidak didukung');
        if(!validator.isInt(values.cashback)) return setErrorMessage('Cashback harus berupa angka');
        if(parseInt(values.cashback) <= 0) return setErrorMessage('Cashback harus lebih besar dari 0');
        let formData = new FormData();
        formData.append('id', kwitansi.id);
        //formData.append('cashbackImg', cashbackImg);
        formData.append('cashback', values.cashback);
        formData.append('status', 'DITERIMA');
        let response = await axios.post(Config.API_URL + "/update-kwitansi-status", formData, { headers: { 'token': admin.token } });
        try {
          let data = response.data;
          if(data.status) {
            props.getKwitansi();
            await Swal.fire('Success', 'Status kwitansi berhasil diubah', 'success');
          } else {
            Swal.fire('Failed', data.message, 'error');
          }
        } catch(error) {
          Swal.fire('Error', 'Unable to connect to server', 'error');
        }
      } else if(values.status === 'DITOLAK') {
        let formData = new FormData();
        formData.append('id', kwitansi.id);
        formData.append('status', 'DITOLAK');
        formData.append('cancelReason', values.cancelReason);
        let response = await axios.post(Config.API_URL + "/update-kwitansi-status", formData, { headers: { 'token': admin.token } });
        try {
          let data = response.data;
          if(data.status) {
            props.getKwitansi();
            await Swal.fire('Success', 'Status kwitansi berhasil diubah', 'success');
          } else {
            Swal.fire('Failed', data.message, 'error');
          }
        } catch(error) {
          Swal.fire('Error', 'Unable to connect to server', 'error');
        }
      }
    },
  });
  return (
    <form onSubmit={form.handleSubmit}>
      <div className="form-field">
        <label>Status</label>
        <select name="status" onChange={form.handleChange} onBlur={form.handleBlur} value={form.values.status}>
          <option value="DITERIMA">DI TERIMA</option>
          <option value="DITOLAK">DI TOLAK</option>
        </select>
      </div>
      {
        form.values.status === 'DITERIMA' &&
        <>
          <hr/>
          <h3 className="form-info">Info Cashback</h3>
          <div className="form-field">
            <label>Jumlah Cashback</label>
            <input type="text" name="cashback" onChange={form.handleChange} value={form.values.cashback} placeholder="Contoh: 20000" />
          </div>
          {false && <div className="form-field">
            <button onClick={triggerInputFile} type="button" className="transfer-proof">
              <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.50008 11.3333L10.0001 8L12.5001 11.75V10.5H15.8334V4.66667C15.8334 3.7475 15.0859 3 14.1667 3H3.33341C2.41425 3 1.66675 3.7475 1.66675 4.66667V14.6667C1.66675 15.5858 2.41425 16.3333 3.33341 16.3333H10.0001V13H4.16675L6.66675 9.66667L7.50008 11.3333Z" fill="white"/>
                <path d="M15.8334 12.1667H14.1667V14.6667H11.6667V16.3334H14.1667V18.8334H15.8334V16.3334H18.3334V14.6667H15.8334V12.1667Z" fill="white"/>
              </svg>
              <span className="ml-1">{cashbackImg === undefined ? `Bukti Transfer` : `Ubah Bukti`}</span>
            </button>
            <p className="button-note mt-2">{cashbackImg === undefined ? `(.JPG, .JPEG, .PNG Max 2 MB)` : cashbackImg.name}</p>
            <input ref={input => inputFile = input} type="file" onChange={(event) => setCashbackImg(event.currentTarget.files[0])} className="hide d-none" accept=".jpg,.jpeg,.png"/>
            {errorMessage !== '' && <div className="alert alert-warning mt-2">{errorMessage}</div>}
          </div>}
        </>
      }
      {
        form.values.status === 'DITOLAK' &&
        <>
          <hr/>
          <h3 className="form-info">Info Penolakan</h3>
          <div className="form-field">
            <label>Alasan</label>
            <select name="cancelReason" onChange={form.handleChange} onBlur={form.handleBlur} value={form.values.cancelReason}>
              {form.values.cancelReasonList.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </>
      }
      <div className="d-flex mt-3">
        <div className="form-field flex-grow-1">
          <button onClick={() => Swal.close()} type="button" className="cancel">Batal</button>
        </div>
        <div style={{width: '16px'}}></div>
        <div className="form-field flex-grow-1">
          <button type="submit" className="primary" disabled={form.isSubmitting}>{form.isSubmitting ? <span className="spinner-border spinner-border-sm"></span> : ''} <span>Submit</span></button>
        </div>
      </div>
    </form>
  );
}

export default UpdateKwitansiStatusForm;
