import React from 'react';
import { useFormik } from 'formik';
import validator from 'validator';
import Swal from 'sweetalert2';
import axios from 'axios';
import * as Config from './../Config';

const LoginForm = (props) => {
  const form = useFormik({
    initialValues: {
      email: '',
      password: '',
      passwordVisible: false,
    },
    onSubmit: async values => {
      if(!validator.isEmail(values.email)) return Swal.fire('Failed', 'Email is invalid', 'warning');
      if(validator.isEmpty(values.password)) return Swal.fire('Failed', 'Password is required', 'warning');
      if(!values.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)) return Swal.fire('Failed', 'Kata sandi wajib mengandung angka, huruf kecil, dan huruf besar', 'warning');
      let formData = {};
      formData.email = values.email;
      formData.password = values.password;
      try {
        let response = await axios.post(Config.API_URL_2 + "/admin-login", formData);
        let data = response.data;
        if(data.status) {
          let admin = data.data;
          localStorage.setItem("admin", JSON.stringify(admin));
          await Swal.fire('Success', data.message, 'success');
          props.refreshAuth();
          if(admin.authority === "Hospital Admin") {
            if(document.getElementById('vaccine-link') != null) document.getElementById('vaccine-link').click();
          }
        } else {
          Swal.fire('Failed', data.message, 'error');
        }
      } catch(error) {
        let data = error.response.data;
        let message = 'Unable to connect to server';
        if(data.statusMessage != null) message = data.statusMessage;
        return Swal.fire('Gagal', message, 'error');
      }
    },
  });
  return (
    <form onSubmit={form.handleSubmit}>
      <div className="form-field">
        <label>Email</label>
        <input type="email" name="email" onChange={form.handleChange} value={form.values.email} placeholder="Contoh: nama@email.com" />
      </div>
      <div className="form-field">
        <label>Kata Sandi</label>
        <div className="password-form-field">
          <input type={form.values.passwordVisible ? "text" : "password"} name="password" onChange={form.handleChange} value={form.values.password} placeholder="Masukkan kata sandi" />
          <i onClick={() => form.setFieldValue("passwordVisible", !form.values.passwordVisible)} className={`fa ${form.values.passwordVisible ? 'fa-eye' : 'fa-eye-slash'}`}></i>
        </div>
      </div>
      <div className="form-field">
        <button type="submit" disabled={form.isSubmitting}>{form.isSubmitting ? <span className="spinner-border spinner-border-sm"></span> : ''} <span>Log In</span></button>
      </div>
    </form>
  );
}

export default LoginForm;
