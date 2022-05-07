import React from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import moment from "moment";
import "moment/locale/id";
import MUIDataTable from "mui-datatables";
import { Link } from "react-router-dom";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import Litepicker from "litepicker";
import * as Config from "./../../Config";
moment.locale("id");
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const Swal2 = withReactContent(Swal);

class PatientData extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if (admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      countdown: null,
      admin: admin,
      patient: {
        list: [],
        val: null,
        totalData: 0,
        totalPage: 0,
      },
      paging: {
        page: 1,
        perPage: 7,
      },
      form: {
        schedule: moment(),
        editedPatient: null,
        showKTPImg: null,
        type: "",
        allowedDateList: [],
        hourList: [],
        hourVal: "",
        statusVaccine: "",
        rejectNote: "",
        filterSearch: "",
        filterHospital: "",
        filterVaccineType: "",
        filterBrand: "",
        filterStatus: "",
        filterStatusSchedule: "",
        filterVaccineNo: "",
        filterVaccineDateFrom: null,
        filterVaccineDateTo: null,
        filterCreatedDateFrom: null,
        filterCreatedDateTo: null,
      },
      filter: {
        filterHospital: [],
        filterVaccineType: [],
        filterBrand: [],
      },
    };
    this.getPatientList = this.getPatientList.bind(this);
    this.prevPage = this.prevPage.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.generateFilter = this.generateFilter.bind(this);
    this.resetFilter = this.resetFilter.bind(this);
    this.showImage = this.showImage.bind(this);
    this.cancelPatient = this.cancelPatient.bind(this);
    this.fetchLocationVaccineCalendar =
      this.fetchLocationVaccineCalendar.bind(this);
    this.submitSchedule = this.submitSchedule.bind(this);
    this.openUpdateStatusModal = this.openUpdateStatusModal.bind(this);
    this.updateStatusVaccine = this.updateStatusVaccine.bind(this);
    this.printPDF = this.printPDF.bind(this);
    this.exportExcel = this.exportExcel.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
  }

  async componentDidMount() {
    await this.getPatientList(1);
    let filterVaccineDateInput = document.getElementById(
      "filter-vaccine-date-input"
    );
    if (filterVaccineDateInput != null) {
      new Litepicker({
        element: filterVaccineDateInput,
        singleMode: false,
        resetButton: true,
        setup: (picker) => {
          picker.on("selected", (dateFrom, dateTo) => {
            dateFrom = moment(dateFrom.dateInstance);
            dateTo = moment(dateTo.dateInstance);
            this.setState(
              (prevState) => ({
                form: {
                  ...prevState.form,
                  filterVaccineDateFrom: dateFrom,
                  filterVaccineDateTo: dateTo,
                },
              }),
              () => this.getPatientList(1)
            );
          });
          picker.on("clear:selection", () => {
            this.setState(
              (prevState) => ({
                form: {
                  ...prevState.form,
                  filterVaccineDateFrom: null,
                  filterVaccineDateTo: null,
                },
              }),
              () => this.getPatientList(1)
            );
          });
        },
      });
    }
    let filterCreatedDateInput = document.getElementById(
      "filter-created-date-input"
    );
    if (filterCreatedDateInput != null) {
      new Litepicker({
        element: filterCreatedDateInput,
        singleMode: false,
        resetButton: true,
        setup: (picker) => {
          picker.on("selected", (dateFrom, dateTo) => {
            dateFrom = moment(dateFrom.dateInstance);
            dateTo = moment(dateTo.dateInstance);
            this.setState(
              (prevState) => ({
                form: {
                  ...prevState.form,
                  filterCreatedDateFrom: dateFrom,
                  filterCreatedDateTo: dateTo,
                },
              }),
              () => this.getPatientList(1)
            );
          });
          picker.on("clear:selection", () => {
            this.setState(
              (prevState) => ({
                form: {
                  ...prevState.form,
                  filterCreatedDateFrom: null,
                  filterCreatedDateTo: null,
                },
              }),
              () => this.getPatientList(1)
            );
          });
        },
      });
    }
    this.setState({ filter: await this.generateFilter() });
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
    if (name.includes("filter") && name != "filterSearch")
      callback = () => {
        this.getPatientList(1);
        this.generateFilter().then((data) => this.setState({ filter: data }));
      };
    if (name === "filterHospital") {
      this.setState((prevState) => ({
        form: { ...prevState.form, filterVaccineType: "", filterBrand: "" },
      }));
    }
    if (name === "filterVaccineType") {
      this.setState((prevState) => ({
        form: { ...prevState.form, filterBrand: "" },
      }));
    }
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

  prevPage() {
    if (this.state.paging.page <= 1) return;
    this.getPatientList(this.state.paging.page - 1);
  }
  nextPage() {
    this.getPatientList(this.state.paging.page + 1);
  }

  openUpdateStatusModal(patient) {
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        editedPatient: patient,
        statusVaccine: "",
        rejectNote: "",
      },
    }));
  }

  async getPatientList(page) {
    this.setState({ isLoading: true });
    let formData = {
      page: page,
      limit: this.state.paging.perPage,
    };
    if (this.state.form.filterSearch !== "")
      formData.search = this.state.form.filterSearch;
    if (this.state.form.filterHospital !== "")
      formData.hospital_name =
        this.state.filter.filterHospital[
          this.state.form.filterHospital
        ].location_vaccine_name;
    if (this.state.form.filterVaccineType !== "")
      formData.type_vaccine =
        this.state.filter.filterVaccineType[
          this.state.form.filterVaccineType
        ].vaccine_name;
    if (this.state.form.filterBrand !== "")
      formData.brand = this.state.form.filterBrand;
    if (this.state.form.filterStatus !== "")
      formData.status = this.state.form.filterStatus;
    if (this.state.form.filterStatusSchedule !== "")
      formData.status_schedule = this.state.form.filterStatusSchedule;
    if (this.state.form.filterVaccineNo !== "")
      formData.status_vaccine = this.state.form.filterVaccineNo;
    if (this.state.form.filterVaccineDateFrom !== null)
      formData.date_from = moment(this.state.form.filterVaccineDateFrom).format(
        "YYYY-MM-DD"
      );
    if (this.state.form.filterVaccineDateTo !== null)
      formData.date_to = moment(this.state.form.filterVaccineDateTo).format(
        "YYYY-MM-DD"
      );
    if (this.state.form.filterCreatedDateFrom !== null)
      formData.created_at_from = moment(
        this.state.form.filterCreatedDateFrom
      ).format("YYYY-MM-DD");
    if (this.state.form.filterCreatedDateTo !== null)
      formData.created_at_to = moment(
        this.state.form.filterCreatedDateTo
      ).format("YYYY-MM-DD");
    let response = await axios.get(
      `${Config.API_URL_2}/admin_vaccine/get_data_patient`,
      { params: formData, headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        let patientList = data.data.patient;
        if (patientList.length === 0 && this.state.paging.page != page) {
          this.setState({ isLoading: false });
        } else {
          this.state.paging.page = page;
          this.setState({
            paging: this.state.paging,
            patient: {
              list: patientList,
              val: null,
              totalData: data.data.total_data,
              totalPage: data.data.total_page,
            },
          });
        }
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  }

  async setPatient(patient) {
    // this.setState({
    //   isLoading: true,
    //   patient: {
    //     list: this.state.patient.list,
    //     val: patient,
    //   },
    // });

    this.setState((prevState) => ({
      isLoading: true,
      patient: {
        ...prevState.patient,
        list: this.state.patient.list,
        val: patient,
      },
    }));

    let formData = {};
    let response = await axios.get(
      `${Config.API_URL_2}/admin_vaccine/get_data_patient_details/${patient.register_vaccine_new_id}`,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        patient.detail = data.data;
        // this.setState({
        //   patient: { list: this.state.patient.list, val: patient },
        // });

        this.setState((prevState) => ({
          patient: {
            ...prevState.patient,
            list: this.state.patient.list,
            val: patient,
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

  showImage(image) {
    Swal.fire({ imageUrl: image });
  }

  renderButtonCopy(property) {
    return (
      <a
        className="copy-button"
        style={{ marginLeft: "2em" }}
        onClick={() => navigator.clipboard.writeText(property)}
      >
        copy
      </a>
    );
  }

  renderButtonDownload(url) {
    return (
      <a href={url} className="download-button" style={{ marginLeft: "2em" }}>
        unduh
      </a>
    );
  }

  getDoctorAcceptance(patient) {
    if (patient.status !== "ACCEPTED") return "Tidak";
    if (patient.detail == null) return "-";
    if (this.getScreeningAnswer(patient.detail.is_alergic) === "Ya")
      return "Ya";
    if (this.getScreeningAnswer(patient.detail.is_autoimun) === "Ya")
      return "Ya";
    if (this.getScreeningAnswer(patient.detail.is_blood_disorders) === "Ya")
      return "Ya";
    if (this.getScreeningAnswer(patient.detail.is_drop_weight) === "Ya")
      return "Ya";
    if (this.getScreeningAnswer(patient.detail.is_fatigue) === "Ya")
      return "Ya";
    if (this.getScreeningAnswer(patient.detail.is_hard_climb_stair) === "Ya")
      return "Ya";
    if (this.getScreeningAnswer(patient.detail.is_have_disease) === "Ya")
      return "Ya";
    if (this.getScreeningAnswer(patient.detail.is_immunosupressant) === "Ya")
      return "Ya";
    if (this.getScreeningAnswer(patient.detail.is_many_diseases) === "Ya")
      return "Ya";
    if (this.getScreeningAnswer(patient.detail.is_pregnant) === "Ya")
      return "Ya";
    if (this.getScreeningAnswer(patient.detail.is_same_address) === "Ya")
      return "Ya";
    if (this.getScreeningAnswer(patient.detail.is_walk) === "Ya") return "Ya";
    if (this.getScreeningAnswer(patient.detail.is_covid) === "Ya") return "Ya";
    if (
      this.getScreeningAnswer(patient.detail.is_kid_have_other_vaccine) === "Ya"
    )
      return "Ya";
    if (
      this.getScreeningAnswer(patient.detail.is_kid_contact_patient_covid) ===
      "Ya"
    )
      return "Ya";
    if (this.getScreeningAnswer(patient.detail.is_kid_have_fever) === "Ya")
      return "Ya";
    if (
      this.getScreeningAnswer(patient.detail.is_kid_have_medical_emergency) ===
      "Ya"
    )
      return "Ya";
    if (
      this.getScreeningAnswer(patient.detail.is_kid_have_immune_disorders) ===
      "Ya"
    )
      return "Ya";
    if (
      this.getScreeningAnswer(patient.detail.is_kid_have_imunosupresan) === "Ya"
    )
      return "Ya";
    if (this.getScreeningAnswer(patient.detail.is_kid_have_alerrgies) === "Ya")
      return "Ya";
    if (this.getScreeningAnswer(patient.detail.is_kid_have_hemofilia) === "Ya")
      return "Ya";
    if (this.getScreeningAnswer(patient.detail.is_preeklampsia) === "Ya")
      return "Ya";
    if (this.getScreeningAnswer(patient.detail.is_comorbidities) === "Ya")
      return "Ya";
    return "Tidak";
  }

  async cancelPatient() {
    if (this.state.isLoading) return;

    if (this.state.patient.val.schedule_vaccine_id === null) {
      return Swal.fire(
        "Tidak dapat membatalkan pendaftaran pasien karena belum memilih tanggal vaksinasi"
      );
    }
    let confirm = await Swal.fire({
      title: "Apakah Anda yakin ingin membatalkan pendaftaran ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#61C7B5",
      cancelButtonColor: "#61C7B5",
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    });
    if (!confirm.value) return;
    this.setState({ isLoading: true });
    try {
      let response = await axios({
        url: `${Config.API_URL_2}/delete_schedule_vaccine/${this.state.patient.val.schedule_vaccine_id}`,
        method: "POST",
        headers: {
          token: this.state.admin.token,
        },
        data: {},
      });
      let data = response.data;
      if (data.statusCode === 200) {
        await Swal.fire("Pendaftaran Pasien Berhasil dibatalkan");
        await window.location.reload();
        // await this.getPatientList();
        // this.setState({
        //   patient: { list: this.state.patient.list, val: null },
        // });
      } else {
        await Swal.fire("Gagal", data.statusMessage, "warning");
      }
    } catch (error) {
      await Swal.fire(
        "Gagal",
        "Terjadi kesalahan pada koneksi anda. Silahkan coba beberapa saat lagi dan pastikan koneksi internet bekerja dengan baik. ",
        "error"
      );
    }
    this.setState({ isLoading: false });
  }

  async fetchLocationVaccineCalendar() {
    let formData = {};
    formData.location_vaccine_id = this.state.patient.val.location_vaccine_id;
    formData.type_vaccine = this.state.patient.val.detail.type_vaccine;
    formData.vaccine_status = this.state.patient.val.detail.status_vaccine;
    formData.brand_vaccine = this.state.patient.val.brand_vaccine;
    let response = await axios.post(
      `${Config.API_URL_2}/location_vaccine_calendar`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        this.setState((prevState) => ({
          form: {
            ...prevState.form,
            allowedDateList: data.data,
          },
        }));
      }
    } catch (error) {
      await Swal.fire(
        "Gagal",
        "Terjadi kesalahan pada koneksi anda. Silahkan coba beberapa saat lagi dan pastikan koneksi internet bekerja dengan baik. ",
        "error"
      );
    }
  }

  fetchLocationVaccineHourUpdate = async (date) => {
    let waitingLocationCalender = await this.fetchLocationVaccineCalendar();
    let waitingLocationVaccineHour = await this.fetchLocationVaccineHour(date);
  };

  async fetchLocationVaccineHour(date) {
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        hourList: [],
        hourVal: "",
      },
    }));

    let dateSelected = moment(date).format("YYYY-MM-DD");
    let locationVaccineCalendarID;
    for (let i = 0; i < this.state.form.allowedDateList.length; i++) {
      let item = this.state.form.allowedDateList[i];
      if (item.date === dateSelected) {
        locationVaccineCalendarID = item.location_vaccine_calendar_id;
        break;
      }
    }

    let formData = {};
    formData.location_vaccine_id = this.state.patient.val.location_vaccine_id;
    formData.location_vaccine_calendar_id = locationVaccineCalendarID;
    formData.date = moment(date).format("YYYY-MM-DD");
    formData.type_vaccine = this.state.patient.val.detail.type_vaccine;
    formData.brand_vaccine = this.state.patient.val.brand_vaccine;
    formData.vaccine_status = this.state.patient.val.detail.status_vaccine;
    formData.vaccine_status2 = this.state.patient.val.detail.status_vaccine;

    console.log("FORM DATA get_data_timeslot ", formData);
    let response = await axios.post(
      `${Config.API_URL_2}/get_data_timeslot`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        let hourList = data.data;
        for (let i = 0; i < hourList.length; i++) {
          let hour = hourList[i];
          hour.hour_start = hour.timeslot_start_time;
          hour.hour_end = hour.timeslot_end_time;
        }
        this.setState((prevState) => ({
          form: {
            ...prevState.form,
            hourList: hourList,
            hourVal: "",
          },
        }));
      }
    } catch (error) {
      await Swal.fire(
        "Gagal",
        "Terjadi kesalahan pada koneksi anda. Silahkan coba beberapa saat lagi dan pastikan koneksi internet bekerja dengan baik. ",
        "error"
      );
    }
  }

  async submitSchedule(date = null) {
    let form = this.state.form;
    let patientID = this.state.patient.val.register_vaccine_new_id;
    let scheduleID = this.state.patient.val.detail.schedule_vaccine_id;
    let vaccineNo = this.state.patient.val.status_vaccine;
    if (!moment.isMoment(date)) date = form.schedule;
    this.setState({ isLoading: true });
    let formData = {};
    formData.register_vaccine_new_id = patientID;
    formData.userId = this.state.patient.val.detail.userId;
    formData.status_vaccine = vaccineNo;
    formData.timeslot_id = form.hourVal.timeslot_id;
    formData.is_confirmed = 0;
    formData.date = moment(date).format("YYYY-MM-DD");
    try {
      let response;
      if (scheduleID === null)
        response = await axios.post(
          `${Config.API_URL_2}/create_schedule_vaccine_new`,
          formData,
          { headers: { token: this.state.admin.token } }
        );
      else
        response = await axios.post(
          `${Config.API_URL_2}/edit_schedule_vaccine_new/${scheduleID}`,
          formData,
          { headers: { token: this.state.admin.token } }
        );
      let data = response.data;
      if (data.statusCode === 200) {
        let schedule = data.data;
        document.getElementById("calendar-modal-close").click();
        await this.getPatientList(this.state.paging.page);
        for (let i = 0; i < this.state.patient.list.length; i++) {
          let item = this.state.patient.list[i];
          if (item.schedule_vaccine_id === schedule.schedule_vaccine_id) {
            this.setPatient(item);
            break;
          }
        }
      } else {
        await Swal.fire("Gagal", data.statusMessage, "warning");
      }
    } catch (error) {
      await Swal.fire(
        "Gagal",
        "Terjadi kesalahan pada koneksi anda. Silahkan coba beberapa saat lagi dan pastikan koneksi internet bekerja dengan baik. ",
        "error"
      );
    }
    this.setState({ isLoading: false });
  }

  async updateStatusVaccine() {
    if (this.state.isLoading) return;
    let form = this.state.form;
    if (form.statusVaccine === "")
      return Swal.fire("Status Vaksin wajib diisi");
    this.setState({ isLoading: true });
    let formData = {};
    formData.status = form.statusVaccine;
    formData.note = form.statusVaccine === "REJECTED" ? form.rejectNote : "";
    try {
      let response = await axios.post(
        `${Config.API_URL_2}/admin_vaccine/change_status_vaccine/${this.state.form.editedPatient.register_vaccine_new_id}`,
        formData,
        { headers: { token: this.state.admin.token } }
      );
      let data = response.data;
      if (data.statusCode === 200) {
        this.state.form.editedPatient.status = form.statusVaccine;
        this.setState({ patient: this.state.patient });
        document.getElementById("status-vaccine-update-modal-close").click();
      } else {
        await Swal.fire("Gagal", data.statusMessage, "warning");
      }
    } catch (error) {
      await Swal.fire(
        "Gagal",
        "Terjadi kesalahan pada koneksi anda. Silahkan coba beberapa saat lagi dan pastikan koneksi internet bekerja dengan baik. ",
        "error"
      );
    }
    this.setState({ isLoading: false });
  }

  printPDF() {
    let data = this.state.patient.val;
    var config = {
      content: [],
      footer: function (currentPage, pageCount) {
        return {
          margin: [20, 0, 20, 0],
          columns: [
            {
              text: "Printed on " + moment().format("DD MMMM YYYY HH:mm"),
              alignment: "left",
              italics: true,
              color: "#333",
            },
            {
              text: "Page " + currentPage.toString() + " of " + pageCount,
              alignment: "right",
              italics: true,
              color: "#333",
            },
          ],
        };
      },
      styles: {
        subheader: {
          fontSize: 12,
          bold: true,
          color: "#3A3A3C",
        },
        subheaderAnswer: {
          fontSize: 10,
          bold: true,
          color: "#3A3A3C",
        },
      },
      defaultStyle: {
        fontSize: 9,
        columnGap: 10,
        color: "#8F90A6",
      },
    };
    let screeningList = [];
    this.getScreeningPatient(data.detail).forEach((item) => {
      if (item === "SCREENING ALERGIC PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah Anda memiliki riwayat alergi berat seperti sesak napas, bengkak dan urtikaria seluruh badan atau reaksi berat lainnya karena vaksin?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_alergic),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING ALERGIC AFTER PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah Anda memiliki riwayat alergi berat setelah divaksinasi COVID-19 sebelumnya?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_alergic),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING AUTOIMMUNE PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah Anda mengidap penyakit autoimun seperti asma, lupus?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_autoimun),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING BLOOD PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah Anda sedang mendapat pengobatan untuk gangguan pembekuan darah, kelainan darah, defisiensi imun dan penerima produk darah/transfusi?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_blood_disorders),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING CHEMO PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah Anda sedang mendapat pengobatan immunosupressant seperti kortikosteroid dan kemoterapi?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_blood_disorders),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING HEART PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah Anda memiliki penyakit jantung berat dalam keadaan sesak?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_have_disease),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING STAIRS PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah Anda mengalami kesulitan untuk naik 10 anak tangga?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_hard_climb_stair),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING FATIQUE PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah Anda sering merasa kelelahan?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_fatigue),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING ILLNESS PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah Anda memiliki paling sedikit 5 dari 11 penyakit (Hipertensi, diabetes, kanker, penyakit paru kronis, serangan jantung, gagal jantung kongestif, nyeri dada, asma, nyeri sendi, stroke dan penyakit ginjal)?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_many_diseases),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING WALKING PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah Anda mengalami kesulitan berjalan kira-kira 100 sampai 200 meter?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_walk),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING WEIGHT PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah Anda mengalami penurunan berat badan yang bermakna dalam setahun terakhir?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_drop_weight),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING KID LAST MONTH PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah anak mendapat vaksin lain kurang dari 1 bulan sebelumnya?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(
                data.detail.is_kid_have_other_vaccine
              ),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING CHILD LAST 2 WEEKS PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah anak mendapat vaksin lain (Vaksin Rutin) kurang dari 2 Minggu sebelumnya?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(
                data.detail.is_kid_have_other_vaccine
              ),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING KID INFECTED PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah anak pernah sakit COVID-19?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_covid),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING KID CONTACTED PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah dalam keluarga terdapat kontak dengan pasien COVID-19?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(
                data.detail.is_kid_contact_patient_covid
              ),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING KID FEVER PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah dalam 7 hari terakhir anak menderita demam atau batuk pilek atau nyeri menelan atau muntah atau diare?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_kid_have_fever),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING CHILD FEVER PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah saat ini anak menderita demam atau batuk pilek atau nyeri menelan atau muntah atau diare?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_kid_have_fever),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING KID FLU PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah dalam 7 hari terakhir anak memerlukan perawatan di Rumah Sakit atau menderita kedaruratan medis seperti sesak napas, kejang, tidak sadar, berdebar-debar, perdarahan, hipertensi atau tremor hebat?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(
                data.detail.is_kid_have_medical_emergency
              ),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING CHILD FLU PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah dalam 7 hari terakhir anak pernah mendapat perawatan di Rumah Sakit atau menderita kedaruratan medis seperti sesak napas,kejang, tidak sadar, berdebar-debar, perdarahan, hipertensi, tremor hebat?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(
                data.detail.is_kid_have_medical_emergency
              ),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING KID IMMUNE PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah anak sedang menderita gangguan imunitas (Hiperimun: auto imun, alergi berat dan defisiensi imun: gizi buruk, HIV berat atau keganasan)?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(
                data.detail.is_kid_have_immune_disorders
              ),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING KID MEDICINE PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah saat ini anak sedang menjalani pengobatan imunosupresan jangka panjang (Steroid lebih dari 2 Minggu, Sitostatika)?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(
                data.detail.is_kid_have_imunosupresan
              ),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING KID ALERGIC PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah anak mempunyai riwayat alergi berat seperti sesak napas, bengkak, urtikaria di seluruh tubuh atau gejala syok anafilaksis (tidak sadar) setelah vaksinasi sebelumnya?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_kid_have_alerrgies),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING KID BLOOD PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah anak penyandang penyakit hemofilia atau kelainan pembekuan darah?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_kid_have_hemofilia),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING PREGNANT DURATION PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            { text: "Berapa usia kehamilan Anda?", margin: [0, 0, 0, 3] },
            { text: data.detail.gestational_age, style: "subheaderAnswer" },
          ],
        });
      if (item === "SCREENING PREGNANT PRECLAMP PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: `
            Apakah ibu memiliki keluhan dan tanda preeklampsia :
            a. Kaki bengkak
            b. Sakit kepala
            c. Nyeri ulu hati
            d. Pandangan kabur
            e. Tekanan darah <140/90 mmHg`,
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_preeklampsia),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING PREGNANT ALERGIC PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah Anda memiliki riwayat alergi berat seperti sesak napas, bengkak dan urtikaria seluruh badan atau reaksi berat lainnya karena vaksin?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_alergic),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING PREGNANT ALERGIC AFTER PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah Anda memiliki riwayat alergi berat setelah divaksinasi COVID-19 sebelumnya?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_alergic),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING PREGNANT SICKNESS PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: `
            Apakah Anda mempunyai penyakit penyerta, seperti :
            a. Jantung
            b. DM
            c. Asma
            d. Penyakit paru
            e. HIV
            f. Hipertiroid/Hipotiroid
            g. Penyakit ginjal kronik
            h. Penyakit hati`,
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_comorbidities),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING PREGNANT AUTOIMMUNE PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah Anda mengidap penyakit autoimun seperti lupus?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_autoimun),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING PREGNANT BLOOD PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah Anda sedang mendapat pengobatan untuk gangguan pembekuan darah, kelainan darah,defisiensi imun dan penerima produk darah/transfusi?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_blood_disorders),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING PREGNANT CHEMO PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah Anda sedang mendapat pengobatan immunosupressant seperti kortikosteroid dan kemoterapi?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_immunosupressant),
              style: "subheaderAnswer",
            },
          ],
        });
      if (item === "SCREENING PREGNANT POSITIVE PAGE")
        screeningList.push({
          margin: [0, 3, 0, 3],
          stack: [
            {
              text: "Apakah Anda pernah terkonfirmasi menderita COVID-19?",
              margin: [0, 0, 0, 3],
            },
            {
              text: this.getScreeningAnswer(data.detail.is_covid),
              style: "subheaderAnswer",
            },
          ],
        });
    });
    config.content.push({
      stack: [
        {
          margin: [0, 4, 0, 4],
          table: {
            headerRows: 0,
            widths: ["*"],
            body: [
              [
                {
                  text: data.fullname,
                  color: "#3E8CB9",
                  fillColor: "#D6EDF7",
                  border: [false, false, false, false],
                  margin: [4, 8, 4, 8],
                  fontSize: 14,
                },
              ],
            ],
          },
        },
        {
          columns: [
            // left
            {
              width: 250,
              margin: [0, 0, 4, 0],
              stack: [
                {
                  columns: [
                    {
                      margin: [0, 4, 0, 4],
                      stack: [
                        {
                          text: `Lokasi Vaksinasi ${
                            data.status_vaccine === "KEDUA" && "Kedua"
                          }`,
                          style: "subheader",
                        },
                        { text: data.hospital_name, margin: [0, 4, 0, 0] },
                      ],
                    },
                    {
                      margin: [0, 4, 0, 4],
                      stack: [
                        { text: "Vaksin Ke :", style: "subheader" },
                        {
                          text:
                            data.status_vaccine === "PERTAMA"
                              ? "Pertama"
                              : data.status_vaccine === "KEDUA"
                              ? "Kedua"
                              : "Ketiga",
                          margin: [0, 4, 0, 0],
                        },
                      ],
                    },
                  ],
                },
                {
                  margin: [0, 4, 0, 4],
                  stack: [
                    { text: "Nama Vaksin", style: "subheader" },
                    {
                      text: this.show(data.type_vaccine),
                      margin: [0, 4, 0, 0],
                    },
                  ],
                },
                {
                  margin: [0, 4, 0, 4],
                  stack: [
                    { text: "Merek Vaksin", style: "subheader" },
                    {
                      text: this.show(data.detail.brand_vaccine),
                      margin: [0, 4, 0, 0],
                    },
                  ],
                },
                {
                  columns: [
                    {
                      margin: [0, 4, 0, 4],
                      stack: [
                        {
                          text: `Tanggal Vaksinasi ${
                            data.status_vaccine === "KEDUA" && "Kedua"
                          }`,
                          style: "subheader",
                        },
                        {
                          text:
                            data.date == null
                              ? "-"
                              : moment(data.date).format("DD MMMM YYYY"),
                          margin: [0, 4, 0, 0],
                        },
                      ],
                    },
                    {
                      margin: [0, 4, 0, 4],
                      stack: [
                        {
                          text: `Jam Vaksinasi ${
                            data.status_vaccine === "KEDUA" && "Kedua"
                          }`,
                          style: "subheader",
                        },
                        {
                          text: data.jam_vaksin == null ? "-" : data.jam_vaksin,
                          margin: [0, 4, 0, 0],
                        },
                      ],
                    },
                  ],
                },
                data.status_vaccine === "KEDUA"
                  ? {
                      columns: [
                        {
                          margin: [0, 4, 0, 4],
                          stack: [
                            {
                              text: `Tanggal Vaksinasi Pertama`,
                              style: "subheader",
                            },
                            {
                              text: moment(
                                data.detail.first_vaccine_date
                              ).format("DD MMMM YYYY"),
                              margin: [0, 4, 0, 0],
                            },
                          ],
                        },
                        {
                          margin: [0, 4, 0, 4],
                          stack: [
                            {
                              text: `Lokasi Vaksinasi Pertama`,
                              style: "subheader",
                            },
                            {
                              text: data.detail.first_vaccine_location,
                              margin: [0, 4, 0, 0],
                            },
                          ],
                        },
                      ],
                    }
                  : null,
                {
                  margin: [0, 4, 0, 4],
                  stack: [
                    { text: `Kartu Identitas`, style: "subheader" },
                    {
                      columns: [
                        {
                          width: 80,
                          text: "Kewarganegaraan",
                          margin: [0, 2, 0, 0],
                        },
                        {
                          width: "*",
                          text: ": " + data.citizenship,
                          margin: [0, 4, 0, 0],
                        },
                      ],
                    },
                    {
                      columns: [
                        { width: 80, text: "NIK", margin: [0, 2, 0, 0] },
                        {
                          width: "*",
                          text: ": " + data.card_id_number,
                          margin: [0, 4, 0, 0],
                        },
                      ],
                    },
                  ],
                },
                {
                  margin: [0, 4, 0, 4],
                  stack: [
                    { text: "Data Diri", style: "subheader" },
                    {
                      columns: [
                        { width: 80, text: "Nama", margin: [0, 2, 0, 0] },
                        {
                          width: "*",
                          text: ": " + data.fullname,
                          margin: [0, 4, 0, 0],
                        },
                      ],
                    },
                    {
                      columns: [
                        {
                          width: 80,
                          text: "Jenis Kelamin",
                          margin: [0, 2, 0, 0],
                        },
                        {
                          width: "*",
                          text: ": " + data.detail.gender,
                          margin: [0, 4, 0, 0],
                        },
                      ],
                    },
                    {
                      columns: [
                        {
                          width: 80,
                          text: "Tanggal Lahir",
                          margin: [0, 2, 0, 0],
                        },
                        {
                          width: "*",
                          text:
                            ": " +
                            moment(data.detail.birthdate, true).format(
                              "DD/MM/YYYY"
                            ),
                          margin: [0, 4, 0, 0],
                        },
                      ],
                    },
                    {
                      columns: [
                        {
                          width: 80,
                          text: "Status Vaksin",
                          margin: [0, 2, 0, 0],
                        },
                        {
                          width: "*",
                          text: ": " + this.getStatusVaccineLabel(data),
                          margin: [0, 4, 0, 0],
                        },
                      ],
                    },
                    {
                      columns: [
                        {
                          width: 80,
                          text: "Status Jadwal",
                          margin: [0, 2, 0, 0],
                        },
                        {
                          width: "*",
                          text: ": " + this.getStatusScheduleLabel(data),
                          margin: [0, 4, 0, 0],
                        },
                      ],
                    },
                    {
                      columns: [
                        { width: 80, text: "Kategori", margin: [0, 2, 0, 0] },
                        {
                          width: "*",
                          text: ": " + data.category,
                          margin: [0, 4, 0, 0],
                        },
                      ],
                    },
                    {
                      columns: [
                        {
                          width: 80,
                          text: "Nama Perusahaan",
                          margin: [0, 2, 0, 0],
                        },
                        {
                          width: "*",
                          text:
                            ": " +
                            (data.detail.company_name == null
                              ? "-"
                              : data.detail.company_name),
                          margin: [0, 4, 0, 0],
                        },
                      ],
                    },
                  ],
                },
                {
                  margin: [0, 4, 0, 4],
                  stack: [
                    { text: "Data Kontak", style: "subheader" },
                    {
                      columns: [
                        {
                          width: 80,
                          text: "No.Handphone / WA",
                          margin: [0, 2, 0, 0],
                        },
                        {
                          width: "*",
                          text: ": " + data.phone_number,
                          margin: [0, 4, 0, 0],
                        },
                      ],
                    },
                    {
                      columns: [
                        { width: 80, text: "Email", margin: [0, 2, 0, 0] },
                        {
                          width: "*",
                          text: ": " + data.detail.email,
                          margin: [0, 4, 0, 0],
                        },
                      ],
                    },
                    {
                      columns: [
                        { width: 80, text: "Alamat KTP", margin: [0, 2, 0, 0] },
                        {
                          width: "*",
                          text: ": " + data.detail.address,
                          margin: [0, 4, 0, 0],
                        },
                      ],
                    },
                    {
                      columns: [
                        { width: 80, text: "Domisili", margin: [0, 2, 0, 0] },
                        {
                          width: "*",
                          text: ": " + data.detail.address_domicile,
                          margin: [0, 4, 0, 0],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            // right
            {
              width: "*",
              stack: [
                {
                  text: "Persetujuan Vaksin",
                  style: "subheader",
                  margin: [0, 4, 0, 8],
                },
                ...screeningList,
                {
                  margin: [0, 3, 0, 3],
                  stack: [
                    {
                      text: "Saya memiliki surat persetujuan dari dokter spesialis untuk vaksin?",
                      margin: [0, 0, 0, 3],
                    },
                    {
                      text: this.getDoctorAcceptance(data),
                      style: "subheaderAnswer",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    pdfMake.createPdf(config).download(`${data.fullname} Vaccine.pdf`);
  }

  getScreeningAnswer(ans) {
    if (ans === null) return "-";
    if (ans === "") return "-";
    if (Number(ans) === 0) return "Tidak";
    if (Number(ans) === 1) return "Ya";
    return "-";
  }

  generateCalendar() {
    let schedule = this.state.form.schedule;
    let dateRow = [];
    let row = [];
    for (let i = 1; i <= schedule.daysInMonth(); i++) {
      let day = moment(schedule).set("date", i);
      let weekday = moment(day).day();
      // start from monday, not sunday
      if (weekday === 0) weekday = 6;
      else if (weekday === 1) weekday = 0;
      else if (weekday === 2) weekday = 1;
      else if (weekday === 3) weekday = 2;
      else if (weekday === 4) weekday = 3;
      else if (weekday === 5) weekday = 4;
      else if (weekday === 6) weekday = 5;

      row[weekday] = day;
      if (weekday == 6) {
        dateRow.push(row);
        row = [];
      }
    }
    if (row.length > 0) {
      dateRow.push(row);
    }

    return (
      <div className="calendar">
        {this.state.form.type === "DATE" && (
          <>
            <div className="label">Atur Tanggal</div>
            <div className="month">
              <div
                onClick={() =>
                  this.setState((prevState) => ({
                    form: {
                      ...prevState.form,
                      schedule: moment(schedule).add(-1, "month"),
                    },
                  }))
                }
                className="clickable"
              >
                <img src={`${Config.BASE_URL}/img/calendar-arrow-left.png`} />
              </div>
              <div style={{ minWidth: "4px" }}></div>
              <div className="align-self-center">
                {moment(schedule).format("MMMM YYYY")}
              </div>
              <div style={{ minWidth: "4px" }}></div>
              <div
                onClick={() =>
                  this.setState((prevState) => ({
                    form: {
                      ...prevState.form,
                      schedule: moment(schedule).add(1, "month"),
                    },
                  }))
                }
                className="clickable"
              >
                <img src={`${Config.BASE_URL}/img/calendar-arrow-right.png`} />
              </div>
            </div>
            <div style={{ minHeight: "12px" }}></div>
            <div className="weekday">
              <div className="day">Sen</div>
              <div className="day">Sel</div>
              <div className="day">Rab</div>
              <div className="day">Kam</div>
              <div className="day">Jum</div>
              <div className="day">Sab</div>
              <div className="day">Ming</div>
            </div>
            <div style={{ minHeight: "12px" }}></div>
            <div className="date-list">
              {dateRow.map((item, index) => (
                <div key={index} className={`date`}>
                  {[...Array(7)].map((_, subindex) => (
                    <div
                      key={subindex}
                      onClick={() => {
                        if (!this.isCalendarAllowed(item[subindex])) return;
                        this.setState(
                          (prevState) => ({
                            form: {
                              ...prevState.form,
                              schedule: item[subindex],
                              type: "HOUR",
                            },
                          }),
                          () => this.fetchLocationVaccineHour(item[subindex])
                        );
                      }}
                      className={`item  ${
                        item[subindex] != null && this.isFull(item[subindex])
                          ? "date-full"
                          : ""
                      } ${
                        item[subindex] != null
                          ? this.isCalendarAllowed(item[subindex])
                            ? "active"
                            : "inactive"
                          : ""
                      }`}
                    >
                      {item[subindex] == null
                        ? ""
                        : moment(item[subindex]).format("DD")}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}

        {this.state.form.type === "HOUR" && (
          <div>
            <div className="label">Atur Tanggal</div>
            <div className="date-selected">
              {moment(this.state.form.schedule).format("DD MMMM YYYY")}
            </div>
            <div style={{ minHeight: "20px" }}></div>
            <div className="hour-list">
              {this.state.form.hourList.map((item, index) => (
                <div
                  key={index}
                  onClick={() =>
                    this.setState((prevState) => ({
                      form: {
                        ...prevState.form,
                        hourVal: item,
                      },
                    }))
                  }
                  className={`hour ${
                    this.state.form.hourVal === item ? "active" : ""
                  }`}
                >
                  {item.hour_start} - {item.hour_end}
                </div>
              ))}
              {this.state.form.hourList.length === 0 && (
                <div className="empty-hour-list w-100 text-center">
                  <small className="text-secondary">
                    <em>jadwal tidak tersedia</em>
                  </small>
                </div>
              )}
            </div>
            <div style={{ minHeight: "20px" }}></div>
            <button
              onClick={this.submitSchedule}
              className={`color-button ${
                this.state.form.hourVal !== "" ? "active" : ""
              }`}
              disabled={this.state.form.hourVal === ""}
            >
              Pilih
            </button>
          </div>
        )}
      </div>
    );
  }

  isCalendarAllowed(date) {
    for (let i = 0; i < this.state.form.allowedDateList.length; i++) {
      let item = this.state.form.allowedDateList[i];
      if (item.date === moment(date).format("YYYY-MM-DD")) return true;
    }
    return false;
  }

  isFull(date) {
    for (let i = 0; i < this.state.form.allowedDateList.length; i++) {
      let item = this.state.form.allowedDateList[i];
      if (item.date === moment(date).format("YYYY-MM-DD")) {
        if (item.is_full === 1) return true;
      }
    }
    return false;
  }

  getStatusVaccineLabel(item) {
    if (item == null) return "-";
    if (item.status === "ACCEPTED") return "Layak Vaksin";
    if (item.status === "REJECTED") return "Ditolak";
    if (item.status === "PENDING") return "Belum Terjadwal";
    if (item.status === "DONE") return "Selesai";
    return "-";
  }

  getStatusScheduleLabel(item) {
    if (item == null) return "-";
    if (item.schedule_status === "SCHEDULED") return "Terjadwal";
    if (item.schedule_status === "CANCELED") return "Dibatalkan";
    return "-";
  }

  resetFilter() {
    this.setState(
      (prevState) => ({
        form: {
          ...prevState.form,
          filterSearch: "",
          filterHospital: "",
          filterVaccineType: "",
          filterBrand: "",
          filterStatus: "",
          filterStatusSchedule: "",
          filterVaccineNo: "",
          filterVaccineDateFrom: null,
          filterVaccineDateTo: null,
          filterCreatedDateFrom: null,
          filterCreatedDateTo: null,
        },
      }),
      () => this.getPatientList(1)
    );
  }

  show(data) {
    if (data === null) return "-";
    if (data === "") return "-";
    return data;
  }

  async generateFilter() {
    this.setState({ isLoading: true });
    let filter = {
      filterHospital: [],
      filterVaccineType: [],
      filterBrand: [],
    };
    let form = {};
    if (this.state.form.filterHospital !== "")
      form.location_vaccine_id =
        this.state.filter.filterHospital[
          this.state.form.filterHospital
        ].location_vaccine_id;
    if (this.state.form.filterVaccineType !== "")
      form.location_vaccine_type_id =
        this.state.filter.filterVaccineType[
          this.state.form.filterVaccineType
        ].location_vaccine_type_id;
    if (this.state.form.filterVaccineNo !== "")
      form.vaccine_status = this.state.form.filterVaccineNo;
    let response = await axios.get(`${Config.API_URL_2}/admin_vaccine/filter`, {
      params: form,
      headers: { token: this.state.admin.token },
    });
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        filter.filterHospital = data.data.filterHospital;
        filter.filterVaccineType = data.data.filterVaccineType;
        filter.filterBrand = data.data.filterBrandVaccine;
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
    return filter;
  }

  async exportExcel() {
    if (this.state.isLoading) return;
    this.setState({ isLoading: true });
    let filter = {};
    filter.authority = this.state.admin.authority;
    if (this.state.form.filterSearch !== "")
      filter.search = this.state.form.filterSearch;
    if (this.state.form.filterHospital !== "")
      filter.hospital_name =
        this.state.filter.filterHospital[
          this.state.form.filterHospital
        ].location_vaccine_name;
    if (this.state.form.filterVaccineType !== "")
      filter.type_vaccine =
        this.state.filter.filterVaccineType[
          this.state.form.filterVaccineType
        ].vaccine_name;
    if (this.state.form.filterBrand !== "")
      filter.brand_vaccine = this.state.form.filterBrand;
    if (this.state.form.filterStatus !== "")
      filter.status_register = this.state.form.filterStatus;
    if (this.state.form.filterStatusSchedule !== "")
      filter.status_schedule = this.state.form.filterStatusSchedule;
    if (this.state.form.filterVaccineNo !== "")
      filter.status_vaccine = this.state.form.filterVaccineNo;
    if (this.state.form.filterCreatedDateFrom !== null)
      filter.date_register_from = moment(
        this.state.form.filterCreatedDateFrom
      ).format("YYYY-MM-DD");
    if (this.state.form.filterCreatedDateTo !== null)
      filter.date_register_to = moment(
        this.state.form.filterCreatedDateTo
      ).format("YYYY-MM-DD");
    if (this.state.form.filterVaccineDateFrom !== null)
      filter.date_from = moment(this.state.form.filterVaccineDateFrom).format(
        "YYYY-MM-DD"
      );
    if (this.state.form.filterVaccineDateTo !== null)
      filter.date_to = moment(this.state.form.filterVaccineDateTo).format(
        "YYYY-MM-DD"
      );
    let response = await axios.post(
      `${Config.API_URL_2}/admin_vaccine/data_patient_excel`,
      filter,
      {
        headers: {
          token: this.state.admin.token,
          "Content-Disposition": "attachment; filename=data.xlsx",
          // 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        responseType: "arraybuffer",
      }
    );
    try {
      let data = response.data;
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Patient Data.xlsx"); //or any other extension
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  }

  getPatientType(detail) {
    let age = moment().diff(
      moment(detail.birthdate).format("YYYY-MM-DD"),
      "years"
    );
    if (
      detail.type_vaccine != null &&
      (detail.type_vaccine.toLowerCase().includes("hamil") ||
        detail.category.toLowerCase().includes("hamil"))
    )
      return "PREGNANT";
    if (age <= 11) return "CHILD";
    if (age >= 12 && age <= 17) return "KID";
    if (age >= 18 && age <= 59) return "ADULT";
    if (age >= 60) return "ELDERLY";
    return "ADULT";
  }

  getScreeningPatient(detail) {
    let screeningList = [];
    let patientType = this.getPatientType(detail);
    switch (patientType) {
      case "ELDERLY":
        if (detail.status_vaccine === "PERTAMA") {
          screeningList = [
            "SCREENING ALERGIC PAGE",
            "SCREENING AUTOIMMUNE PAGE",
            "SCREENING BLOOD PAGE",
            "SCREENING CHEMO PAGE",
            "SCREENING HEART PAGE",
            "SCREENING PREGNANT POSITIVE PAGE",
            "SCREENING STAIRS PAGE",
            "SCREENING FATIQUE PAGE",
            "SCREENING ILLNESS PAGE",
            "SCREENING WALKING PAGE",
            "SCREENING WEIGHT PAGE",
          ];
        }
        if (detail.status_vaccine === "KEDUA") {
          screeningList = [
            "SCREENING ALERGIC PAGE",
            "SCREENING AUTOIMMUNE PAGE",
            "SCREENING BLOOD PAGE",
            "SCREENING CHEMO PAGE",
            "SCREENING HEART PAGE",
            "SCREENING PREGNANT POSITIVE PAGE",
            "SCREENING STAIRS PAGE",
            "SCREENING FATIQUE PAGE",
            "SCREENING ILLNESS PAGE",
            "SCREENING WALKING PAGE",
            "SCREENING WEIGHT PAGE",
          ];
        }
        if (detail.status_vaccine === "KETIGA") {
          screeningList = [
            "SCREENING ALERGIC AFTER PAGE",
            "SCREENING AUTOIMMUNE PAGE",
            "SCREENING BLOOD PAGE",
            "SCREENING CHEMO PAGE",
            "SCREENING HEART PAGE",
            "SCREENING PREGNANT POSITIVE PAGE",
            "SCREENING STAIRS PAGE",
            "SCREENING FATIQUE PAGE",
            "SCREENING ILLNESS PAGE",
            "SCREENING WEIGHT PAGE",
          ];
        }
        break;
      case "ADULT":
        if (detail.status_vaccine === "PERTAMA") {
          screeningList = [
            "SCREENING ALERGIC PAGE",
            "SCREENING AUTOIMMUNE PAGE",
            "SCREENING BLOOD PAGE",
            "SCREENING CHEMO PAGE",
            "SCREENING HEART PAGE",
            "SCREENING PREGNANT POSITIVE PAGE",
          ];
        }
        if (detail.status_vaccine === "KEDUA") {
          screeningList = [
            "SCREENING ALERGIC AFTER PAGE",
            "SCREENING AUTOIMMUNE PAGE",
            "SCREENING BLOOD PAGE",
            "SCREENING CHEMO PAGE",
            "SCREENING HEART PAGE",
            "SCREENING PREGNANT POSITIVE PAGE",
          ];
        }
        if (detail.status_vaccine === "KETIGA") {
          screeningList = [
            "SCREENING ALERGIC AFTER PAGE",
            "SCREENING AUTOIMMUNE PAGE",
            "SCREENING BLOOD PAGE",
            "SCREENING CHEMO PAGE",
            "SCREENING HEART PAGE",
            "SCREENING PREGNANT POSITIVE PAGE",
          ];
        }
        break;
      case "KID":
        screeningList = [
          "SCREENING KID LAST MONTH PAGE",
          "SCREENING KID INFECTED PAGE",
          "SCREENING KID CONTACTED PAGE",
          "SCREENING KID FEVER PAGE",
          "SCREENING KID FLU PAGE",
          "SCREENING KID IMMUNE PAGE",
          "SCREENING KID MEDICINE PAGE",
          "SCREENING KID ALERGIC PAGE",
          "SCREENING KID BLOOD PAGE",
        ];
        break;
      case "CHILD":
        screeningList = [
          "SCREENING CHILD LAST 2 WEEKS PAGE",
          "SCREENING KID INFECTED PAGE",
          "SCREENING KID CONTACTED PAGE",
          "SCREENING CHILD FEVER PAGE",
          "SCREENING CHILD FLU PAGE",
          "SCREENING KID IMMUNE PAGE",
          "SCREENING KID MEDICINE PAGE",
          "SCREENING KID ALERGIC PAGE",
          "SCREENING KID BLOOD PAGE",
        ];
        break;
      case "PREGNANT":
        if (detail.status_vaccine === "PERTAMA") {
          screeningList = [
            "SCREENING PREGNANT DURATION PAGE",
            "SCREENING PREGNANT PRECLAMP PAGE",
            "SCREENING PREGNANT ALERGIC PAGE",
            "SCREENING PREGNANT SICKNESS PAGE",
            "SCREENING PREGNANT AUTOIMMUNE PAGE",
            "SCREENING PREGNANT BLOOD PAGE",
            "SCREENING PREGNANT CHEMO PAGE",
            "SCREENING PREGNANT POSITIVE PAGE",
          ];
        }
        if (detail.status_vaccine === "KEDUA") {
          screeningList = [
            "SCREENING PREGNANT ALERGIC AFTER PAGE",
            "SCREENING PREGNANT DURATION PAGE",
            "SCREENING PREGNANT PRECLAMP PAGE",
            "SCREENING PREGNANT SICKNESS PAGE",
            "SCREENING PREGNANT AUTOIMMUNE PAGE",
            "SCREENING PREGNANT BLOOD PAGE",
            "SCREENING PREGNANT CHEMO PAGE",
            "SCREENING PREGNANT POSITIVE PAGE",
          ];
        }

        if (detail.status_vaccine === "KETIGA") {
          screeningList = [
            "SCREENING PREGNANT ALERGIC AFTER PAGE",
            "SCREENING PREGNANT DURATION PAGE",
            "SCREENING PREGNANT PRECLAMP PAGE",
            "SCREENING PREGNANT SICKNESS PAGE",
            "SCREENING PREGNANT AUTOIMMUNE PAGE",
            "SCREENING PREGNANT BLOOD PAGE",
            "SCREENING PREGNANT CHEMO PAGE",
            "SCREENING PREGNANT POSITIVE PAGE",
          ];
        }

        break;
    }
    return screeningList;
  }

  render() {
    let filter = this.state.filter;
    console.log(this.state);
    return (
      <>
        {this.state.patient.val == null && (
          <div className="patient-data-page standard-page">
            <div className="d-flex flex-column flex-md-row justify-content-between">
              <div className="action-bar">
                <div className="title">Daftar Vaksinasi</div>
              </div>
              <div className="export-button">
                <button
                  onClick={this.exportExcel}
                  disabled={this.isLoading}
                  className="color-button mt-3 no-wrap"
                >
                  Export to Excel
                </button>
              </div>
            </div>
            {this.state.isLoading && <div className="loader"></div>}
            <div className="filter d-flex">
              <div className="article-search-wrapper d-flex">
                <input
                  name="filterSearch"
                  type="text"
                  className="article-search"
                  onChange={(e) => {
                    this.handleFormChange(e, () => {
                      if (this.state.countdown != null)
                        clearTimeout(this.state.countdown);
                      this.setState({
                        countdown: setTimeout(
                          () => this.getPatientList(1),
                          1000
                        ),
                      });
                    });
                  }}
                  value={this.state.form.filterSearch}
                  placeholder="Cari..."
                  readonly={this.state.isLoading}
                />
                <div className="search-icon">
                  <img src={`${Config.BASE_URL}/img/green-search-icon.png`} />
                </div>
              </div>
            </div>
            <div className="filter d-flex flex-wrap">
              <div className="article-filter-select">
                <select
                  name="filterHospital"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterHospital}
                >
                  <option value="">Nama Rumah Sakit</option>
                  {filter.filterHospital.map((item, index) => (
                    <option key={index} value={index}>
                      {item.location_vaccine_name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div className="article-filter-select">
                <select
                  name="filterVaccineType"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterVaccineType}
                >
                  <option value="">Tipe Vaksin</option>
                  {filter.filterVaccineType.map((item, index) => (
                    <option key={index} value={index}>
                      {item.vaccine_name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div className="article-filter-select">
                <select
                  name="filterVaccineNo"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterVaccineNo}
                >
                  <option value="">Vaksin ke</option>
                  <option value="PERTAMA">Pertama</option>
                  <option value="KEDUA">Kedua</option>
                  <option value="KETIGA">Ketiga</option>
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div className="article-filter-select">
                <select
                  name="filterBrand"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterBrand}
                >
                  <option value="">Merek Vaksin</option>
                  {filter.filterBrand.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div className="article-filter-select">
                <select
                  name="filterStatus"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterStatus}
                >
                  <option value="">Status Vaksin</option>
                  <option value="ACCEPTED">Layak Vaksin</option>
                  <option value="REJECTED">Tidak Layak</option>
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div className="article-filter-select">
                <select
                  name="filterStatusSchedule"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterStatusSchedule}
                >
                  <option value="">Status Jadwal</option>
                  <option value="SCHEDULED">Terjadwal</option>
                  <option value="CANCELED">Dibatalkan</option>
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div
                onClick={() =>
                  document.getElementById("filter-vaccine-date-input").click()
                }
                className="article-filter-select"
              >
                <div className="label">
                  {this.state.form.filterVaccineDateFrom === null &&
                  this.state.form.filterVaccineDateTo === null
                    ? "Tanggal Vaksin"
                    : moment(this.state.form.filterVaccineDateFrom).format(
                        "DD/MM"
                      ) +
                      " - " +
                      moment(this.state.form.filterVaccineDateTo).format(
                        "DD/MM YYYY"
                      )}
                </div>
                <div className="icon">
                  <img
                    src={`${Config.BASE_URL}/img/green-calendar-icon.png`}
                    alt=""
                  />
                </div>
                <input
                  type="text"
                  id="filter-vaccine-date-input"
                  placeholder="Pilih Tanggal"
                  style={{
                    height: "2px",
                    visibility: "hidden",
                    position: "absolute",
                  }}
                />
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div
                onClick={() =>
                  document.getElementById("filter-created-date-input").click()
                }
                className="article-filter-select"
              >
                <div className="label">
                  {this.state.form.filterCreatedDateFrom === null &&
                  this.state.form.filterCreatedDateTo === null
                    ? "Tanggal Register"
                    : moment(this.state.form.filterCreatedDateFrom).format(
                        "DD/MM"
                      ) +
                      " - " +
                      moment(this.state.form.filterCreatedDateTo).format(
                        "DD/MM YYYY"
                      )}
                </div>
                <div className="icon">
                  <img
                    src={`${Config.BASE_URL}/img/green-calendar-icon.png`}
                    alt=""
                  />
                </div>
                <input
                  type="text"
                  id="filter-created-date-input"
                  placeholder="Pilih Tanggal"
                  style={{
                    height: "2px",
                    visibility: "hidden",
                    position: "absolute",
                  }}
                />
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div onClick={this.resetFilter} className="article-filter-select">
                <i className="fa fa-refresh"></i>
              </div>
            </div>
            <div className="primary-table overflow">
              <table className="table">
                <thead>
                  <tr>
                    <th className="no-wrap">Rumah Sakit</th>
                    <th className="no-wrap">Nama Pasien</th>
                    <th className="no-wrap">Kewarganegaraan</th>
                    <th className="no-wrap">NIK</th>
                    <th className="no-wrap">Tipe Vaksin</th>
                    <th className="no-wrap">Merek Vaksin</th>
                    <th className="no-wrap"></th>
                    <th className="no-wrap">Status Vaksin</th>
                    <th className="no-wrap">Status Jadwal</th>
                    <th className="no-wrap">Telepon</th>
                    <th className="no-wrap">Vaksin ke</th>
                    <th className="no-wrap">Tanggal Vaksin</th>
                    <th className="no-wrap">Tanggal Daftar</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.patient.list.length === 0 && (
                    <tr>
                      <td colSpan="13">
                        <div className="text-center text-secondary">
                          <small>
                            <em>Maaf tidak ada data yang ditemukan</em>
                          </small>
                        </div>
                      </td>
                    </tr>
                  )}
                  {this.state.patient.list.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="no-wrap">{item.hospital_name}</div>
                      </td>
                      <td>
                        <div className="no-wrap">{item.fullname}</div>
                      </td>
                      <td>
                        <div className="no-wrap">{item.citizenship}</div>
                      </td>
                      <td>
                        <div className="d-flex">
                          <div className="no-wrap">{item.card_id_number}</div>
                          <div
                            style={{ minHeight: "8px", minWidth: "8px" }}
                          ></div>
                          <div
                            onClick={() =>
                              this.setState((prevState) => ({
                                form: {
                                  ...prevState.form,
                                  showKTPImg: item.ktpPhotoPath,
                                },
                              }))
                            }
                            className="detail-text align-self-center clickable"
                            data-toggle="modal"
                            data-target="#nik-img-modal"
                          >
                            Lihat
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="no-wrap">{item.type_vaccine}</div>
                      </td>
                      <td>
                        <div className="no-wrap">{item.brand_vaccine}</div>
                      </td>
                      <td>
                        <div
                          onClick={() => this.setPatient(item)}
                          className="detail-text clickable"
                        >
                          Detail
                        </div>
                      </td>
                      <td>
                        <div key={index} className="d-flex">
                          {["ACCEPTED", "UPDATED"].includes(item.status) && (
                            <div className="vaccine-status accept">
                              Layak Vaksin
                            </div>
                          )}
                          {item.status === "REJECTED" && (
                            <div className="vaccine-status reject">Ditolak</div>
                          )}
                          {item.status === "PENDING" && (
                            <div className="vaccine-status registered">
                              Belum Terjadwal
                            </div>
                          )}
                          {item.status === "" && (
                            <div className="vaccine-status registered">
                              Belum Screening
                            </div>
                          )}
                          {item.status === "DONE" && (
                            <div className="vaccine-status done">Selesai</div>
                          )}
                          <div style={{ minWidth: "8px" }}></div>
                        </div>
                      </td>
                      <td>
                        {item.schedule_status === "SCHEDULED" ? (
                          <div className="vaccine-status accept">Terjadwal</div>
                        ) : item.schedule_status === "CANCELED" ? (
                          <div className="vaccine-status reject">
                            Dibatalkan
                          </div>
                        ) : (
                          <div className="vaccine-status registered">
                            Belum Terjadwal
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="no-wrap">{item.phone_number}</div>
                      </td>
                      <td>
                        <div className="no-wrap">
                          {item.status_vaccine === "PERTAMA"
                            ? "Pertama"
                            : item.status_vaccine === "KEDUA"
                            ? "Kedua"
                            : "Ketiga"}
                        </div>
                      </td>
                      <td>
                        <div className="no-wrap">
                          {item.date !== null && (
                            <div>
                              {moment(item.date).format("DD MMMM YYYY")}{" "}
                              {item.jam_vaksin}
                            </div>
                          )}
                          {item.date === null && (
                            <div>
                              <em className="text-secondary">
                                Belum Memilih Tanggal
                              </em>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="no-wrap">
                          {moment(item.created_at).format("DD MMMM YYYY")}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ minHeight: "16px", minWidth: "16px" }}></div>
            {this.state.patient.list.length > 0 && (
              <div className="page-bar d-flex flex-column flex-md-row justify-content-between">
                <div className="qty align-self-center">
                  {this.state.patient.totalData} data (
                  {this.state.patient.totalPage} halaman)
                </div>
                <div className="page-list">
                  <div className="qty align-self-center">
                    {this.state.paging.page} dari {this.state.patient.totalPage}
                  </div>
                  <div onClick={this.prevPage} className="page">
                    <div className="text-center">
                      <img src={`${Config.BASE_URL}/img/page-arrow-left.png`} />
                    </div>
                  </div>
                  <div className="page active">
                    <div className="text-center">{this.state.paging.page}</div>
                  </div>
                  <div onClick={this.nextPage} className="page">
                    <div className="text-center">
                      <img
                        src={`${Config.BASE_URL}/img/page-arrow-right.png`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <br />
          </div>
        )}
        {this.state.patient.val != null && (
          <div className="patient-detail-page">
            <div className="top">
              <div className="d-flex w-100">
                <div
                  onClick={() =>
                    this.setState((prevState) => ({
                      patient: {
                        ...prevState.patient,
                        list: this.state.patient.list,
                        val: null,
                      },
                    }))
                  }
                  className="back clickable align-self-center"
                >
                  <img
                    src={Config.BASE_URL + "/img/back-button-icon.png"}
                    alt=""
                  />
                </div>
                <div style={{ minWidth: "13px" }}></div>
                <div className="name align-self-center">
                  {this.state.patient.val.fullname}
                </div>
                <div className="print-button align-self-center flex-grow-1 text-center">
                  <button onClick={this.printPDF} type="button">
                    <i className="fa fa-print"></i> Cetak
                  </button>
                </div>
                <div className="flex-grow-1 align-self-center text-center">
                  {this.state.patient.val.detail != null &&
                    this.state.patient.val.detail.status === "CANCELED" && (
                      <button className="canceled-button" disabled={true}>
                        Telah Dibatalkan
                      </button>
                    )}
                  {this.state.patient.val.detail != null &&
                    this.state.patient.val.detail.status !== "CANCELED" && (
                      <button
                        onClick={this.cancelPatient}
                        className="cancel-button"
                      >
                        Batalkan
                      </button>
                    )}
                </div>
              </div>
            </div>
            <div className="content d-flex flex-column flex-md-row">
              <div className="left">
                <div className="container">
                  <div className="d-flex">
                    <div>
                      <div className="key">
                        Lokasi Vaksinasi{" "}
                        {this.state.patient.val.status_vaccine === "KEDUA" &&
                          "Kedua"}
                      </div>
                      <div className="value d-flex justify-content-between">
                        <div className="align-self-center">
                          {this.state.patient.val.hospital_name}
                        </div>
                        <div>
                          {this.renderButtonCopy(
                            this.state.patient.val.hospital_name
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ minWidth: "20px" }}></div>
                    <div>
                      <div className="key no-wrap">Vaksin ke</div>
                      <div className="value d-flex justify-content-between">
                        <div className="align-self-center">
                          {this.state.patient.val.status_vaccine === "PERTAMA"
                            ? "Pertama"
                            : this.state.patient.val.status_vaccine === "KEDUA"
                            ? "Kedua"
                            : "Ketiga"}
                        </div>
                        <div>
                          {this.renderButtonCopy(
                            this.state.patient.val.status_vaccine === "PERTAMA"
                              ? "Pertama"
                              : this.state.patient.val.status_vaccine ===
                                "KEDUA"
                              ? "Kedua"
                              : "Ketiga"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="key">Nama Vaksin</div>
                  <table>
                    <tbody>
                      <tr>
                        <td className="value w-100">
                          {this.show(this.state.patient.val.type_vaccine)}
                        </td>
                        <td className="text-right">
                          {this.renderButtonCopy(
                            this.show(this.state.patient.val.type_vaccine)
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="key">
                    Merek Vaksinasi{" "}
                    {this.state.patient.val.status_vaccine === "KETIGA" &&
                      "Ketiga"}
                  </div>
                  {this.state.patient.val.detail != null && (
                    <table>
                      <tbody>
                        <tr>
                          <td className="value w-100">
                            {this.show(
                              this.state.patient.val.detail.brand_vaccine
                            )}
                          </td>
                          <td className="text-right">
                            {this.renderButtonCopy(
                              this.show(
                                this.state.patient.val.detail.brand_vaccine
                              )
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                  <div className="d-flex">
                    <div>
                      <div className="key">
                        <span>
                          Tanggal Vaksin{" "}
                          {this.state.patient.val.status_vaccine === "KETIGA" &&
                            "Ketiga"}
                        </span>
                        {this.state.patient.val.detail != null &&
                          this.state.patient.val.detail.status !=
                            "CANCELED" && (
                            <span
                              onClick={() => {
                                this.setState(
                                  (prevState) => ({
                                    form: {
                                      ...prevState.form,
                                      type: "DATE",
                                    },
                                  }),
                                  this.fetchLocationVaccineCalendar
                                );
                              }}
                              className="clickable subaction"
                              data-toggle="modal"
                              data-target="#calendar-modal"
                            >
                              Ubah
                            </span>
                          )}
                      </div>
                      <div className="value d-flex justify-content-between">
                        <div className="align-self-center">
                          {this.state.patient.val.date == null
                            ? "-"
                            : moment(this.state.patient.val.date).format(
                                "DD MMMM YYYY"
                              )}
                        </div>
                        {this.state.patient.val.date != null && (
                          <div>
                            {this.renderButtonCopy(
                              moment(this.state.patient.val.date).format(
                                "DD MMMM YYYY"
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ minWidth: "20px" }}></div>
                    <div>
                      <div className="key no-wrap">
                        <span>
                          Jam Vaksin{" "}
                          {this.state.patient.val.status_vaccine === "KETIGA" &&
                            "Ketiga"}
                        </span>
                        {this.state.patient.val.detail != null &&
                          this.state.patient.val.date != null &&
                          this.state.patient.val.detail.status !=
                            "CANCELED" && (
                            <span
                              onClick={() => {
                                this.setState(
                                  (prevState) => ({
                                    form: {
                                      ...prevState.form,
                                      type: "HOUR",
                                    },
                                  }),
                                  () =>
                                    this.fetchLocationVaccineHourUpdate(
                                      this.state.patient.val.date
                                    )
                                );
                              }}
                              className="clickable subaction"
                              data-toggle="modal"
                              data-target="#calendar-modal"
                            >
                              Ubah
                            </span>
                          )}
                      </div>
                      <div className="value d-flex justify-content-between">
                        <div className="align-self-center">
                          {this.state.patient.val.jam_vaksin == null
                            ? "-"
                            : this.state.patient.val.jam_vaksin}
                        </div>
                        {this.state.patient.val.jam_vaksin != null && (
                          <div>
                            {this.renderButtonCopy(
                              this.state.patient.val.jam_vaksin
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="modal" id="calendar-modal">
                      <div className="modal-dialog">
                        <div className="modal-content">
                          <div className="modal-body">
                            <button
                              id="calendar-modal-close"
                              type="button"
                              className="close"
                              data-dismiss="modal"
                            >
                              &times;
                            </button>
                            {this.generateCalendar()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {this.state.patient.val.status_vaccine === "KEDUA" &&
                    this.state.patient.val.detail != null && (
                      <>
                        <div className="d-flex">
                          <div>
                            <div className="key">
                              <span>Tanggal Vaksinasi Pertama</span>
                            </div>
                            <div className="value d-flex justify-content-between">
                              <div className="align-self-center">
                                {moment(
                                  this.state.patient.val.detail
                                    .first_vaccine_date
                                ).format("DD MMMM YYYY")}
                              </div>
                              <div>
                                {this.renderButtonCopy(
                                  moment(
                                    this.state.patient.val.detail
                                      .first_vaccine_date
                                  ).format("DD MMMM YYYY")
                                )}
                              </div>
                            </div>
                          </div>
                          <div style={{ minWidth: "20px" }}></div>
                          <div>
                            <div className="key no-wrap">
                              <span>Lokasi Vaksinasi Pertama</span>
                            </div>
                            <div className="value d-flex justify-content-between">
                              <div className="align-self-center">
                                {
                                  this.state.patient.val.detail
                                    .first_vaccine_location
                                }
                              </div>
                              <div>
                                {this.renderButtonCopy(
                                  this.state.patient.val.detail
                                    .first_vaccine_location
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                  <div style={{ minHeight: "20px" }}></div>

                  {this.state.patient.val.status_vaccine === "KETIGA" && (
                    <>
                      <div className="key">Merek Vaksinasi Kedua</div>
                      {this.state.patient.val.detail != null && (
                        <table>
                          <tbody>
                            <tr>
                              <td className="value w-100">
                                {this.show(
                                  this.state.patient.val.detail
                                    .second_brand_vaccine
                                )}
                              </td>
                              <td className="text-right">
                                {this.renderButtonCopy(
                                  this.show(
                                    this.state.patient.val.detail
                                      .second_brand_vaccine
                                  )
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      )}

                      <div className="key">Lokasi Vaksinasi Kedua</div>
                      {this.state.patient.val.detail != null && (
                        <table>
                          <tbody>
                            <tr>
                              <td className="value w-100">
                                {this.show(
                                  this.state.patient.val.detail
                                    .second_vaccine_location
                                )}
                              </td>
                              <td className="text-right">
                                {this.renderButtonCopy(
                                  this.show(
                                    this.state.patient.val.detail
                                      .second_vaccine_location
                                  )
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      )}
                      <div className="key">Tanggal Vaksinasi Kedua</div>
                      {this.state.patient.val.detail != null && (
                        <table>
                          <tbody>
                            <tr>
                              <td className="value w-100">
                                {this.show(
                                  moment(
                                    this.state.patient.val.detail
                                      .second_vaccine_date
                                  ).format("DD MMMM YYYY")
                                )}
                              </td>
                              <td className="text-right">
                                {this.renderButtonCopy(
                                  this.show(
                                    moment(
                                      this.state.patient.val.detail
                                        .second_vaccine_date
                                    ).format("DD MMMM YYYY")
                                  )
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      )}
                    </>
                  )}

                  <div style={{ minHeight: "20px" }}></div>
                  <div className="key">
                    Kartu Identitas{" "}
                    {this.state.patient.val.detail != null && (
                      <span
                        onClick={() =>
                          this.showImage(
                            this.state.patient.val.detail.ktpPhotoPath
                          )
                        }
                        className="clickable subaction"
                      >
                        Lihat
                      </span>
                    )}
                  </div>
                  <table>
                    <tbody>
                      <tr>
                        <td className="value">Kewarganegaraan</td>
                        <td className="w-100 value">
                          {" "}
                          : {this.state.patient.val.citizenship}
                        </td>
                        <td className="text-right">
                          {this.renderButtonCopy(
                            this.state.patient.val.citizenship
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="value">NIK</td>
                        <td className="w-100 value">
                          {" "}
                          : {this.state.patient.val.card_id_number}
                        </td>
                        <td className="text-right">
                          {this.renderButtonCopy(
                            this.state.patient.val.card_id_number
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="key">Data Diri</div>
                  <table>
                    <tbody>
                      <tr>
                        <td className="value">Nama</td>
                        <td className="w-100 value">
                          {" "}
                          : {this.state.patient.val.fullname}
                        </td>
                        <td className="text-right">
                          {this.renderButtonCopy(
                            this.state.patient.val.fullname
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="value">Jenis Kelamin</td>
                        <td className="w-100 value">
                          {" "}
                          :{" "}
                          {this.state.patient.val.detail == null
                            ? "-"
                            : this.state.patient.val.detail.gender}
                        </td>
                        <td className="text-right">
                          {this.state.patient.val.detail == null
                            ? "-"
                            : this.renderButtonCopy(
                                this.state.patient.val.detail.gender
                              )}
                        </td>
                      </tr>
                      <tr>
                        <td className="value">Tanggal Lahir</td>
                        <td className="w-100 value">
                          {" "}
                          :{" "}
                          {this.state.patient.val.detail == null
                            ? "-"
                            : moment(
                                this.state.patient.val.detail.birthdate,
                                true
                              ).format("DD/MM/YYYY")}
                        </td>
                        <td className="text-right">
                          {this.state.patient.val.detail == null
                            ? "-"
                            : this.renderButtonCopy(
                                moment(
                                  this.state.patient.val.detail.birthdate,
                                  true
                                ).format("DD/MM/YYYY")
                              )}
                        </td>
                      </tr>
                      <tr>
                        <td className="value">Status Vaksin</td>
                        <td className="w-100 value">
                          {" "}
                          : {this.getStatusVaccineLabel(
                            this.state.patient.val
                          )}{" "}
                          {/* <i onClick={() => this.openUpdateStatusModal(this.state.patient.val)} className="fa fa-edit clickable ml-2" data-toggle="modal" data-target="#status-vaccine-update-modal"></i> */}
                        </td>
                        <td className="text-right">
                          {this.renderButtonCopy(
                            this.getStatusVaccineLabel(this.state.patient.val)
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="value">Status Jadwal</td>
                        <td className="w-100 value">
                          {" "}
                          :{" "}
                          {this.getStatusScheduleLabel(this.state.patient.val)}
                        </td>
                        <td className="text-right">
                          {this.renderButtonCopy(
                            this.getStatusScheduleLabel(this.state.patient.val)
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="value">Kategori</td>
                        <td className="w-100 value">
                          {" "}
                          : {this.show(this.state.patient.val.category)}
                        </td>
                        <td className="text-right">
                          {this.renderButtonCopy(
                            this.show(this.state.patient.val.category)
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="value">Nama Perusahaan</td>
                        <td className="w-100 value">
                          {" "}
                          :{" "}
                          {this.state.patient.val.detail == null
                            ? "-"
                            : this.show(
                                this.state.patient.val.detail.company_name
                              )}
                        </td>
                        <td className="text-right">
                          {this.state.patient.val.detail == null
                            ? "-"
                            : this.renderButtonCopy(
                                this.show(
                                  this.state.patient.val.detail.company_name
                                )
                              )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="key">Data Kontak</div>
                  <table>
                    <tbody>
                      <tr>
                        <td className="value">No.Handphone / WA</td>
                        <td className="w-100 value">
                          {" "}
                          : {this.state.patient.val.phone_number}
                        </td>
                        <td className="text-right">
                          {this.renderButtonCopy(
                            this.state.patient.val.phone_number
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="value">Email</td>
                        <td className="w-100 value">
                          {" "}
                          :{" "}
                          {this.state.patient.val.detail == null
                            ? "-"
                            : this.state.patient.val.detail.email}
                        </td>
                        <td className="text-right">
                          {this.state.patient.val.detail == null
                            ? "-"
                            : this.renderButtonCopy(
                                this.state.patient.val.detail.email
                              )}
                        </td>
                      </tr>
                      <tr>
                        <td className="value">Alamat KTP</td>
                        <td className="w-100 value">
                          {" "}
                          :{" "}
                          {this.state.patient.val.detail == null
                            ? "-"
                            : this.state.patient.val.detail.address}
                        </td>
                        <td className="text-right">
                          {this.state.patient.val.detail == null
                            ? "-"
                            : this.renderButtonCopy(
                                this.state.patient.val.detail.address
                              )}
                        </td>
                      </tr>
                      <tr>
                        <td className="value">Domisili</td>
                        <td className="w-100 value">
                          {" "}
                          :{" "}
                          {this.state.patient.val.detail == null
                            ? "-"
                            : this.state.patient.val.detail.is_same_address ===
                              "1"
                            ? "Sesuai KTP"
                            : this.state.patient.val.detail.address_domicile}
                        </td>
                        <td className="text-right">
                          {this.state.patient.val.detail == null
                            ? "-"
                            : this.renderButtonCopy(
                                this.state.patient.val.detail
                                  .is_same_address === "1"
                                  ? "Sesuai KTP"
                                  : this.state.patient.val.detail
                                      .address_domicile
                              )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {this.state.patient.val.detail != null && (
                    <>
                      <div className="key">Lampiran</div>
                      <div className="d-flex justify-content-between">
                        <div className="value">Foto Kartu Identitas</div>
                        {this.renderButtonDownload(
                          this.state.patient.val.detail.ktpPhotoPath
                        )}
                      </div>
                      <img
                        src={this.state.patient.val.detail.ktpPhotoPath}
                        data-toggle="modal"
                        data-target="#ktp-img-modal"
                        className="clickable"
                        style={{ width: "100%" }}
                        alt=""
                      />
                      <div className="modal" id="ktp-img-modal">
                        <div className="modal-dialog">
                          <div className="modal-content">
                            <div className="modal-body">
                              <button
                                type="button"
                                className="close"
                                data-dismiss="modal"
                              >
                                &times;
                              </button>
                              <img
                                src={this.state.patient.val.detail.ktpPhotoPath}
                                style={{ width: "100%" }}
                                alt=""
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
                    </>
                  )}

                  {this.state.patient.val.status_vaccine === "KETIGA" &&
                    this.state.patient.val.detail != null && (
                      <>
                        <div className="d-flex justify-content-between">
                          <div className="value">Kartu Vaksinasi Kedua</div>
                          {this.renderButtonDownload(
                            this.state.patient.val.detail.second_certificate
                          )}
                        </div>
                        <img
                          src={this.state.patient.val.detail.second_certificate}
                          data-toggle="modal"
                          data-target="#cert-img-modal"
                          className="clickable"
                          style={{ width: "100%" }}
                          alt=""
                        />
                        <div className="modal" id="cert-img-modal">
                          <div className="modal-dialog">
                            <div className="modal-content">
                              <div className="modal-body">
                                <button
                                  type="button"
                                  className="close"
                                  data-dismiss="modal"
                                >
                                  &times;
                                </button>
                                <img
                                  src={
                                    this.state.patient.val.detail
                                      .second_certificate
                                  }
                                  style={{ width: "100%" }}
                                  alt=""
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          style={{ minHeight: "8px", minWidth: "8px" }}
                        ></div>
                      </>
                    )}

                  {this.state.patient.val.status_vaccine === "KETIGA" &&
                    this.state.patient.val.detail != null && (
                      <>
                        <div className="d-flex justify-content-between">
                          <div className="value">Tiket Vaksinasi Ketiga</div>
                          {this.renderButtonDownload(
                            this.state.patient.val.detail.ticket_vaccine
                          )}
                        </div>
                        <img
                          src={this.state.patient.val.detail.ticket_vaccine}
                          data-toggle="modal"
                          data-target="#cert-img-modal"
                          className="clickable"
                          style={{ width: "100%" }}
                          alt=""
                        />
                        <div className="modal" id="cert-img-modal">
                          <div className="modal-dialog">
                            <div className="modal-content">
                              <div className="modal-body">
                                <button
                                  type="button"
                                  className="close"
                                  data-dismiss="modal"
                                >
                                  &times;
                                </button>
                                <img
                                  src={
                                    this.state.patient.val.detail.ticket_vaccine
                                  }
                                  style={{ width: "100%" }}
                                  alt=""
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          style={{ minHeight: "8px", minWidth: "8px" }}
                        ></div>
                      </>
                    )}

                  {this.state.patient.val.status_vaccine === "KEDUA" &&
                    this.state.patient.val.detail != null && (
                      <>
                        <div className="d-flex justify-content-between">
                          <div className="value">Kartu Vaksinasi Pertama</div>
                          {this.renderButtonDownload(
                            this.state.patient.val.detail.photo_certificate
                          )}
                        </div>
                        <img
                          src={this.state.patient.val.detail.photo_certificate}
                          data-toggle="modal"
                          data-target="#cert-img-modal"
                          className="clickable"
                          style={{ width: "100%" }}
                          alt=""
                        />
                        <div className="modal" id="cert-img-modal">
                          <div className="modal-dialog">
                            <div className="modal-content">
                              <div className="modal-body">
                                <button
                                  type="button"
                                  className="close"
                                  data-dismiss="modal"
                                >
                                  &times;
                                </button>
                                <img
                                  src={
                                    this.state.patient.val.detail
                                      .photo_certificate
                                  }
                                  style={{ width: "100%" }}
                                  alt=""
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          style={{ minHeight: "8px", minWidth: "8px" }}
                        ></div>
                      </>
                    )}
                  {this.state.patient.val.detail != null &&
                    this.state.patient.val.detail.userPhoto.map(
                      (item, index) => (
                        <div key={index}>
                          <div className="d-flex justify-content-between">
                            <div className="value">
                              Surat Rekomendasi Dokter atau Surat Lainnya
                            </div>
                            {this.renderButtonDownload(item.photoPath)}
                          </div>
                          <img
                            src={item.photoPath}
                            data-toggle="modal"
                            data-target="#other-img-modal"
                            className="clickable"
                            style={{ width: "100%" }}
                            alt=""
                          />
                          <div className="modal" id="other-img-modal">
                            <div className="modal-dialog">
                              <div className="modal-content">
                                <div className="modal-body">
                                  <button
                                    type="button"
                                    className="close"
                                    data-dismiss="modal"
                                  >
                                    &times;
                                  </button>
                                  <img
                                    src={item.photoPath}
                                    style={{ width: "100%" }}
                                    alt=""
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            style={{ minHeight: "8px", minWidth: "8px" }}
                          ></div>
                        </div>
                      )
                    )}
                  <div style={{ minHeight: "20px", minWidth: "20px" }}></div>
                </div>
              </div>
              <div className="middle"></div>
              <div className="right">
                {this.state.patient.val.detail != null && (
                  <div className="container">
                    <h5>Persetujuan Vaksinasi</h5>

                    {this.getScreeningPatient(
                      this.state.patient.val.detail
                    ).map((item, index) => (
                      <div key={index}>
                        {item === "SCREENING ALERGIC PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah Anda memiliki riwayat alergi berat seperti
                              sesak napas, bengkak dan urtikaria seluruh badan
                              atau reaksi berat lainnya karena vaksin?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail.is_alergic
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING ALERGIC AFTER PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah Anda memiliki riwayat alergi berat setelah
                              divaksinasi COVID-19 sebelumnya?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail.is_alergic
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING AUTOIMMUNE PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah Anda mengidap penyakit autoimun seperti
                              lupus?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail.is_autoimun
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING BLOOD PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah Anda sedang mendapat pengobatan untuk
                              gangguan pembekuan darah, kelainan darah,
                              defisiensi imun dan penerima produk
                              darah/transfusi?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail.is_blood_disorders
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING CHEMO PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah Anda sedang mendapat pengobatan
                              immunosupressant seperti kortikosteroid dan
                              kemoterapi?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail
                                  .is_immunosupressant
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING HEART PAGE" && (
                          <div className="group">
                            <div className="question">
                              {/* {this.state.patient.val.detail.status_vaccine ===
                              "KETIGA"
                                ? "Apakah Anda memiliki penyakit jantung berat atau asma dalam keadaan sesak?"
                                : " Apakah Anda memiliki penyakit jantung berat dalam keadaan sesak?"} */}
                              Apakah Anda memiliki penyakit jantung berat atau
                              asma dalam keadaan sesak?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail.is_have_disease
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING STAIRS PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah Anda mengalami kesulitan untuk naik 10 anak
                              tangga?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail
                                  .is_hard_climb_stair
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING FATIQUE PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah Anda sering merasa kelelahan?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail.is_fatigue
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING ILLNESS PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah Anda memiliki paling sedikit 5 dari 11
                              penyakit (Hipertensi, diabetes, kanker, penyakit
                              paru kronis, serangan jantung, gagal jantung
                              kongestif, nyeri dada, asma, nyeri sendi, stroke
                              dan penyakit ginjal)?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail.is_many_diseases
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING WALKING PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah Anda mengalami kesulitan berjalan kira-kira
                              100 sampai 200 meter?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail.is_walk
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING WEIGHT PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah Anda mengalami penurunan berat badan yang
                              bermakna dalam setahun terakhir?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail.is_drop_weight
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING KID LAST MONTH PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah anak mendapat vaksin lain kurang dari 1
                              bulan sebelumnya?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail
                                  .is_kid_have_other_vaccine
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING CHILD LAST 2 WEEKS PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah anak mendapat vaksin lain (Vaksin Rutin)
                              kurang dari 2 Minggu sebelumnya?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail
                                  .is_kid_have_other_vaccine
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING KID INFECTED PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah anak pernah sakit COVID-19?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail.is_covid
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING KID CONTACTED PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah dalam keluarga terdapat kontak dengan
                              pasien COVID-19?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail
                                  .is_kid_contact_patient_covid
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING KID FEVER PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah dalam 7 hari terakhir anak menderita demam
                              atau batuk pilek atau nyeri menelan atau muntah
                              atau diare?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail.is_kid_have_fever
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING CHILD FEVER PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah saat ini anak menderita demam atau batuk
                              pilek atau nyeri menelan atau muntah atau diare?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail.is_kid_have_fever
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING KID FLU PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah dalam 7 hari terakhir anak memerlukan
                              perawatan di Rumah Sakit atau menderita
                              kedaruratan medis seperti sesak napas, kejang,
                              tidak sadar, berdebar-debar, perdarahan,
                              hipertensi atau tremor hebat?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail
                                  .is_kid_have_medical_emergency
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING CHILD FLU PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah dalam 7 hari terakhir anak pernah mendapat
                              perawatan di Rumah Sakit atau menderita
                              kedaruratan medis seperti sesak napas,kejang,
                              tidak sadar, berdebar-debar, perdarahan,
                              hipertensi, tremor hebat?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail
                                  .is_kid_have_medical_emergency
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING KID IMMUNE PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah anak sedang menderita gangguan imunitas
                              (Hiperimun: auto imun, alergi berat dan defisiensi
                              imun: gizi buruk, HIV berat atau keganasan)?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail
                                  .is_kid_have_immune_disorders
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING KID MEDICINE PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah saat ini anak sedang menjalani pengobatan
                              imunosupresan jangka panjang (Steroid lebih dari 2
                              Minggu, Sitostatika)?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail
                                  .is_kid_have_imunosupresan
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING KID ALERGIC PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah anak mempunyai riwayat alergi berat seperti
                              sesak napas, bengkak, urtikaria di seluruh tubuh
                              atau gejala syok anafilaksis (tidak sadar) setelah
                              vaksinasi sebelumnya?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail
                                  .is_kid_have_alerrgies
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING KID BLOOD PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah anak penyandang penyakit hemofilia atau
                              kelainan pembekuan darah?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail
                                  .is_kid_have_hemofilia
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING PREGNANT DURATION PAGE" && (
                          <div className="group">
                            <div className="question">
                              Berapa usia kehamilan Anda?
                            </div>
                            <div className="answer">
                              {this.state.patient.val.detail.gestational_age}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING PREGNANT PRECLAMP PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah ibu memiliki keluhan dan tanda preeklampsia
                              :
                              <br />
                              a. Kaki bengkak
                              <br />
                              b. Sakit kepala
                              <br />
                              c. Nyeri ulu hati
                              <br />
                              d. Pandangan kabur
                              <br />
                              e. Tekanan darah &lt;140/90 mmHg
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail.is_preeklampsia
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING PREGNANT ALERGIC PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah Anda memiliki riwayat alergi berat seperti
                              sesak napas, bengkak dan urtikaria seluruh badan
                              atau reaksi berat lainnya karena vaksin?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail.is_alergic
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING PREGNANT ALERGIC AFTER PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah Anda memiliki riwayat alergi berat setelah
                              divaksinasi COVID-19 sebelumnya?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail.is_alergic
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING PREGNANT SICKNESS PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah Anda mempunyai penyakit penyerta, seperti :
                              <br />
                              a. Jantung
                              <br />
                              b. DM
                              <br />
                              c. Asma
                              <br />
                              d. Penyakit paru
                              <br />
                              e. HIV
                              <br />
                              f. Hipertiroid/Hipotiroid
                              <br />
                              g. Penyakit ginjal kronik
                              <br />
                              h. Penyakit hati
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail.is_comorbidities
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING PREGNANT AUTOIMMUNE PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah Anda mengidap penyakit autoimun seperti
                              lupus?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail.is_autoimun
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING PREGNANT BLOOD PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah Anda sedang mendapat pengobatan untuk
                              gangguan pembekuan darah, kelainan
                              darah,defisiensi imun dan penerima produk
                              darah/transfusi?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail.is_blood_disorders
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING PREGNANT CHEMO PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah Anda sedang mendapat pengobatan
                              immunosupressant seperti kortikosteroid dan
                              kemoterapi?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail
                                  .is_immunosupressant
                              )}
                            </div>
                          </div>
                        )}
                        {item === "SCREENING PREGNANT POSITIVE PAGE" && (
                          <div className="group">
                            <div className="question">
                              Apakah Anda pernah terkonfirmasi menderita
                              COVID-19?
                            </div>
                            <div className="answer">
                              {this.getScreeningAnswer(
                                this.state.patient.val.detail.is_covid
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="modal fade" id="status-vaccine-update-modal">
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-body">
                <div className="standard-form">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="statusVaccine"
                      onChange={this.handleFormChange}
                      value={this.state.form.statusVaccine}
                    >
                      <option value="">--Pilih Status--</option>
                      <option value="ACCEPTED">Layak Vaksin</option>
                      <option value="REJECTED">Ditolak</option>
                    </select>
                  </div>
                  {this.state.form.statusVaccine === "REJECTED" && (
                    <div className="form-group">
                      <label>Note</label>
                      <textarea
                        name="rejectNote"
                        rows="4"
                        value={this.state.form.rejectNote}
                        onChange={this.handleFormChange}
                      ></textarea>
                    </div>
                  )}
                  <div className="form-group">
                    <div className="d-flex">
                      <button
                        onClick={this.updateStatusVaccine}
                        className="green-button"
                      >
                        Simpan
                      </button>
                      <div
                        style={{ minWidth: "12px", minHeight: "12px" }}
                      ></div>
                      <button
                        id="status-vaccine-update-modal-close"
                        className="red-button"
                        data-dismiss="modal"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal fade" id="nik-img-modal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-body">
                <button type="button" className="close" data-dismiss="modal">
                  &times;
                </button>
                {this.state.form.showKTPImg != null && (
                  <img src={this.state.form.showKTPImg} alt="" />
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default PatientData;
