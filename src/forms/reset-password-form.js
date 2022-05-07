import React from 'react';
import { useFormik } from 'formik';
import validator from 'validator';
import Swal from 'sweetalert2';
import axios from 'axios';
import * as Config from './../Config';
import { useParams } from "react-router-dom";

const ResetPasswordForm = (props) => {
  let { token } = useParams();
  const form = useFormik({
    initialValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    onSubmit: async values => {
      if(validator.isEmpty(values.oldPassword)) return Swal.fire('Failed', 'Kata sandi wajib diisi', 'warning');
      if(!values.oldPassword.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)) return Swal.fire('Failed', 'Kata sandi wajib mengandung angka, huruf kecil, dan huruf besar', 'warning');
      if(validator.isEmpty(values.newPassword)) return Swal.fire('Failed', 'Kata sandi wajib diisi', 'warning');
      if(!values.newPassword.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)) return Swal.fire('Failed', 'Kata sandi wajib mengandung angka, huruf kecil, dan huruf besar', 'warning');
      if(values.newPassword !== values.confirmPassword) return Swal.fire('Failed', 'Konfirmasi password tidak sesuai');
      let formData = new FormData();
      formData.append('token', token);
      formData.append('oldPassword', values.oldPassword);
      formData.append('newPassword', values.newPassword);
      let response = await axios.post(Config.API_URL + "/reset-password", formData);
      try {
        let data = response.data;
        if(data.status) {
          await Swal.fire({
            title: 'Kata Sandi Berhasil Diubah',
            text: 'Silahkan log in untuk menggunakan kata sandi baru kamu',
            imageUrl: Config.BASE_URL + '/img/notif-background-1.png',
            imageWidth: 320, imageHeight: 320, confirmButtonColor: "#61C7B5"
          });
          localStorage.removeItem("admin");
          window.location.href = Config.BASE_URL;
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
      <div className="form-field">
        <label>Kata Sandi Lama</label>
        <input type="password" name="oldPassword" onChange={form.handleChange} value={form.values.oldPassword} placeholder="Masukkan kata sandi lama" />
      </div>
      <div className="form-field">
        <label>Kata Sandi Baru</label>
        <input type="password" name="newPassword" onChange={form.handleChange} value={form.values.newPassword} placeholder="Masukkan kata sandi baru" />
      </div>
      <div className="form-field">
        <label>Konfirmasi Kata Sandi Baru</label>
        <input type="password" name="confirmPassword" onChange={form.handleChange} value={form.values.confirmPassword} placeholder="Masukkan kata sandi baru" />
      </div>
      <div className="form-field">
        <button type="submit" disabled={form.isSubmitting}>{form.isSubmitting ? <span className="spinner-border spinner-border-sm"></span> : ''} <span>Ubah Kata Sandi</span></button>
      </div>
    </form>
  );
}

export default ResetPasswordForm;
