import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import validator from 'validator';
import Swal from 'sweetalert2';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useHistory } from "react-router-dom";
import * as Config from './../Config';

const AddInformationForm = (props) => {
  let admin = JSON.parse(localStorage.getItem("admin"));
  if(admin == null) window.location.reload();
  const [hospitalList, setHospitalList] = useState([]);
  let inputFile;
  const triggerInputFile = e => inputFile.click();
  const [coverImg, setCoverImg] = useState(undefined);
  const [content, setContent] = useState('');
  const history = useHistory();

  useEffect(() => {
    let formData = new FormData();
    axios.post(Config.API_URL + "/get-hospital-list", formData, { headers: { 'token': admin.token } }).then(function(response) {
      try {
        let data = response.data;
        if(data.status) {
          setHospitalList(data.data);
        } else {
          Swal.fire('Failed', data.message, 'error');
        }
      } catch(error) {
        Swal.fire('Error', 'Unable to connect to server', 'error');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useFormik({
    initialValues: {
      title: '',
      hospital: '',
    },
    onSubmit: async values => {
      if(validator.isEmpty(values.title)) return Swal.fire('Failed', 'Judul wajib diisi', 'warning');
      if(validator.isEmpty(values.hospital)) return Swal.fire('Failed', 'Pilih cabang rumah sakit', 'warning');
      if(coverImg === undefined) return Swal.fire('Failed', 'Cover wajib dilampirkan', 'warning');
      if(coverImg.size >= 2000000) return Swal.fire('Failed', 'File tidak boleh melebih 2MB', 'warning');
      if(!(['image/jpeg', 'image/png', 'image/jpg']).includes(coverImg.type)) return Swal.fire('Failed', 'Format gambar tidak didukung', 'warning');
      let formData = new FormData();
      formData.append('title', values.title);
      formData.append('hospital', values.hospital);
      formData.append('coverImg', coverImg);
      formData.append('content', content);
      let response = await axios.post(Config.API_URL + "/add-information", formData, { headers: { 'token': admin.token } });
      try {
        let data = response.data;
        if(data.status) {
          await Swal.fire('Success', 'Informasi berhasil ditambahkan', 'success');
          history.push("/information");
        } else {
          Swal.fire('Failed', data.message, 'error');
        }
      } catch(error) {
        Swal.fire('Error', 'Unable to connect to server', 'error');
      }
    },
  });
  return (
    <form onSubmit={form.handleSubmit}>
      <div className="banner">
        <div className="title d-flex flex-column flex-md-row">
          <div className="flex-grow-1 align-self-center">
            <div className="left d-flex">
              <div onClick={props.returnPage} className="back clickable align-self-center"><svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.9999 6.99997H4.41394L9.70694 1.70697L8.29294 0.292969L0.585938 7.99997L8.29294 15.707L9.70694 14.293L4.41394 8.99997H18.9999V6.99997Z" fill="#3E8CB9"/></svg></div>
              <div style={{width: '12px'}}></div>
              <div className="text flex-grow-1 align-self-center">Tambah Informasi Baru</div>
            </div>
          </div>
          <button type="submit" className="primary-button" disabled={form.isSubmitting}>{form.isSubmitting ? <span className="spinner-border spinner-border-sm"></span> : ''} <span>Publish Informasi</span></button>
        </div>
      </div>
      <div className="content">
        <div className="form-field">
          <label>Judul</label>
          <input type="text" name="title" onChange={form.handleChange} value={form.values.title} placeholder="Masukkan judul informasi" />
        </div>
        <div className="form-field">
          <label>Cabang Rumah Sakit</label>
          <select name="hospital" onChange={form.handleChange} onBlur={form.handleBlur} value={form.values.hospital}>
            <option value="">Pilih cabang rumah sakit mitra</option>
            {hospitalList.map((item) => <option key={item.hospital_id} value={item.hospital_id}>{item.name}</option>)}
          </select>
        </div>
        <div className="form-field mt-3">
          <div className="d-flex flex-column flex-md-row">
            <button onClick={triggerInputFile} type="button" className="transfer-proof">
              <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.50008 11.3333L10.0001 8L12.5001 11.75V10.5H15.8334V4.66667C15.8334 3.7475 15.0859 3 14.1667 3H3.33341C2.41425 3 1.66675 3.7475 1.66675 4.66667V14.6667C1.66675 15.5858 2.41425 16.3333 3.33341 16.3333H10.0001V13H4.16675L6.66675 9.66667L7.50008 11.3333Z" fill="white"/>
                <path d="M15.8334 12.1667H14.1667V14.6667H11.6667V16.3334H14.1667V18.8334H15.8334V16.3334H18.3334V14.6667H15.8334V12.1667Z" fill="white"/>
              </svg>
              <span>{coverImg === undefined ? `Tambah Cover Informasi` : `Ubah Cover Informasi`}</span>
            </button>
            <div style={{minWidth: '8px'}}></div>
            <p className="button-note align-self-center no-wrap mb-0">{coverImg === undefined ? `(.JPG, .JPEG, .PNG Max 2 MB)` : coverImg.name}</p>
            <input ref={input => inputFile = input} type="file" onChange={(event) => setCoverImg(event.currentTarget.files[0])} className="hide d-none" accept=".jpg,.jpeg,.png"/>
          </div>
        </div>
        <div className="custom-form-field mt-3">
          <ReactQuill theme="snow" value={content} onChange={setContent}/>
        </div>
      </div>
    </form>
  );
}

export default AddInformationForm;
