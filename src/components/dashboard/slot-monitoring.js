import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import moment from "moment";
import "moment/locale/id";
import MUIDataTable from "mui-datatables";
import Litepicker from "litepicker";
import { Link } from "react-router-dom";
import * as Config from "./../../Config";
moment.locale("id");

const Swal2 = withReactContent(Swal);

class SlotMonitoring extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if (admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
      paging: {
        page: {
          byHour: 1,
          byDate: 1,
        },
        perPage: 7,
      },
      slotMonitoring: {
        listByHour: [],
        listByDate: [],
        valByHour: null,
        valByDate: null,
        totalDataByHour: 0,
        totalPageByHour: 0,
        totalDataByDate: 0,
        totalPageByDate: 0,
      },
      form: {
        showBy: "JAM",
        filterByHourHospitalName: "",
        filterByHourTypeLocation: "",
        filterByHourVaccineType: "",
        filterByHourVaccineBrand: "",
        filterByHourNationality: "",
        filterByHourCompanyName: "",
        filterByHourVaccineDateFrom: null,
        filterByHourVaccineDateTo: null,
        filterByHourVaccineNo: "",
        filterByHourStatus: "",

        filterByDateHospitalName: "",
        filterByDateTypeLocation: "",
        filterByDateVaccineType: "",
        filterByDateVaccineBrand: "",
        filterByDateNationality: "",
        filterByDateCompanyName: "",
        filterByDateVaccineDateFrom: null,
        filterByDateVaccineDateTo: null,
        filterByDateVaccineNo: "",
        filterByDateStatus: "",
      },
      filter: {
        filterByHourHospital: [],
        filterByHourVaccineType: [],
        filterByHourVaccineBrand: [],
        filterByHourCompanyName: [],

        filterByDateHospital: [],
        filterByDateVaccineType: [],
        filterByDateVaccineBrand: [],
        filterByDateCompanyName: [],
      },
    };
    this.resetFilterHour = this.resetFilterHour.bind(this);
    this.resetFilterDate = this.resetFilterDate.bind(this);
    this.prevPageHour = this.prevPageHour.bind(this);
    this.nextPageHour = this.nextPageHour.bind(this);
    this.prevPageDate = this.prevPageDate.bind(this);
    this.nextPageDate = this.nextPageDate.bind(this);
    this.fetchSlotMonitoringListByHour =
      this.fetchSlotMonitoringListByHour.bind(this);
    this.fetchSlotMonitoringListByDate =
      this.fetchSlotMonitoringListByDate.bind(this);
    this.exportExcelHour = this.exportExcelHour.bind(this);
    this.exportExcelDate = this.exportExcelDate.bind(this);
    this.generateFilter = this.generateFilter.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
  }

  async componentDidMount() {
    await this.fetchSlotMonitoringListByHour(this.state.paging.page.byHour);
    await this.fetchSlotMonitoringListByDate(this.state.paging.page.byDate);
    let vaccineDateHourInput = document.getElementById(
      "vaccine-date-hour-input"
    );
    if (vaccineDateHourInput != null) {
      new Litepicker({
        element: document.getElementById("vaccine-date-hour-input"),
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
                  filterByHourVaccineDateFrom: dateFrom,
                  filterByHourVaccineDateTo: dateTo,
                },
              }),
              () => this.fetchSlotMonitoringListByHour(1)
            );
          });
          picker.on("clear:selection", () => {
            this.setState(
              (prevState) => ({
                form: {
                  ...prevState.form,
                  filterByHourVaccineDateFrom: null,
                  filterByHourVaccineDateTo: null,
                },
              }),
              () => this.fetchSlotMonitoringListByHour(1)
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
    if (name.includes("filterByHour"))
      callback = () => this.fetchSlotMonitoringListByHour(1);
    if (name.includes("filterByDate"))
      callback = () => this.fetchSlotMonitoringListByDate(1);
    if (name === "showBy") {
      if (value === "JAM") {
        callback = () => {
          let vaccineDateHourInput = document.getElementById(
            "vaccine-date-hour-input"
          );
          if (vaccineDateHourInput != null) {
            new Litepicker({
              element: document.getElementById("vaccine-date-hour-input"),
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
                        filterByDateVaccineDateFrom: dateFrom,
                        filterByDateVaccineDateTo: dateTo,
                      },
                    }),
                    () => this.fetchSlotMonitoringListByDate(1)
                  );
                });
                picker.on("clear:selection", () => {
                  this.setState(
                    (prevState) => ({
                      form: {
                        ...prevState.form,
                        filterByDateVaccineDateFrom: null,
                        filterByDateVaccineDateTo: null,
                      },
                    }),
                    () => this.fetchSlotMonitoringListByDate(1)
                  );
                });
              },
            });
          }
        };
      }
      if (value === "TANGGAL") {
        callback = () => {
          let vaccineDateDateInput = document.getElementById(
            "vaccine-date-date-input"
          );
          if (vaccineDateDateInput != null) {
            new Litepicker({
              element: vaccineDateDateInput,
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
                        filterByDateVaccineDateFrom: dateFrom,
                        filterByDateVaccineDateTo: dateTo,
                      },
                    }),
                    () => this.fetchSlotMonitoringListByDate(1)
                  );
                });
                picker.on("clear:selection", () => {
                  this.setState(
                    (prevState) => ({
                      form: {
                        ...prevState.form,
                        filterByDateVaccineDateFrom: null,
                        filterByDateVaccineDateTo: null,
                      },
                    }),
                    () => this.fetchSlotMonitoringListByDate(1)
                  );
                });
              },
            });
          }
        };
      }
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

  resetFilterHour() {
    this.setState(
      (prevState) => ({
        form: {
          ...prevState.form,
          filterByHourHospitalName: "",
          filterByHourTypeLocation: "",
          filterByHourVaccineType: "",
          filterByHourVaccineBrand: "",
          filterByHourNationality: "",
          filterByHourCompanyName: "",
          filterByHourVaccineDateFrom: null,
          filterByHourVaccineDateTo: null,
          filterByHourVaccineNo: "",
          filterByHourStatus: "",
        },
      }),
      () => this.fetchSlotMonitoringListByHour(1)
    );
  }

  resetFilterDate() {
    this.setState(
      (prevState) => ({
        form: {
          ...prevState.form,
          filterByDateHospitalName: "",
          filterByDateTypeLocation: "",
          filterByDateVaccineType: "",
          filterByDateVaccineBrand: "",
          filterByDateNationality: "",
          filterByDateCompanyName: "",
          filterByDateVaccineDateFrom: null,
          filterByDateVaccineDateTo: null,
          filterByDateVaccineNo: "",
          filterByDateStatus: "",
        },
      }),
      () => this.fetchSlotMonitoringListByDate(1)
    );
  }

  prevPageHour() {
    if (this.state.paging.page.byHour <= 1) return;
    this.fetchSlotMonitoringListByHour(this.state.paging.page.byHour - 1);
  }
  nextPageHour() {
    this.fetchSlotMonitoringListByHour(this.state.paging.page.byHour + 1);
  }

  prevPageDate() {
    if (this.state.paging.page.byDate <= 1) return;
    this.fetchSlotMonitoringListByDate(this.state.paging.page.byDate - 1);
  }
  nextPageDate() {
    this.fetchSlotMonitoringListByDate(this.state.paging.page.byDate + 1);
  }

  async fetchSlotMonitoringListByHour(page) {
    this.setState({ isLoading: true });
    try {
      let formData = {
        page: page,
        limit: this.state.paging.perPage,
      };
      if (this.state.form.filterByHourHospitalName !== "")
        formData.hospital_name = this.state.form.filterByHourHospitalName;
      if (this.state.form.filterByHourTypeLocation !== "")
        formData.type_location = this.state.form.filterByHourTypeLocation;
      if (this.state.form.filterByHourVaccineType !== "")
        formData.type_vaccine = this.state.form.filterByHourVaccineType;
      if (this.state.form.filterByHourVaccineBrand !== "")
        formData.brand_vaccine = this.state.form.filterByHourVaccineBrand;
      if (this.state.form.filterByHourNationality !== "")
        formData.citizenship = this.state.form.filterByHourNationality;
      if (this.state.form.filterByHourCompanyName !== "")
        formData.company_name = this.state.form.filterByHourCompanyName;
      if (this.state.form.filterByHourVaccineDateFrom !== null)
        formData.date_from =
          this.state.form.filterByHourVaccineDateFrom === null
            ? ""
            : moment(this.state.form.filterByHourVaccineDateFrom).format(
                "YYYY-MM-DD"
              );
      if (this.state.form.filterByHourVaccineDateTo !== null)
        formData.date_to =
          this.state.form.filterByHourVaccineDateTo === null
            ? ""
            : moment(this.state.form.filterByHourVaccineDateTo).format(
                "YYYY-MM-DD"
              );
      if (this.state.form.filterByHourVaccineNo !== "")
        formData.is_first = this.state.form.filterByHourVaccineNo.includes(
          "PERTAMA"
        )
          ? "1"
          : "0";
      if (this.state.form.filterByHourVaccineNo !== "")
        formData.is_second = this.state.form.filterByHourVaccineNo.includes(
          "KEDUA"
        )
          ? "1"
          : "0";
      if (this.state.form.filterByHourVaccineNo !== "")
        formData.is_third = this.state.form.filterByHourVaccineNo.includes(
          "KETIGA"
        )
          ? "1"
          : "0";
      if (this.state.form.filterByHourStatus !== "")
        formData.status = this.state.form.filterByHourStatus;
      let response = await axios.get(
        `${Config.API_URL_2}/admin_vaccine/list_slot_monitoring`,
        { params: formData, headers: { token: this.state.admin.token } }
      );
      let data = response.data;
      if (data.statusCode === 200) {
        let slotByHour = data.data.slot;
        for (let i = 0; i < slotByHour.length; i++) {
          let item = slotByHour[i];
          if (item.is_first === 1) item.vaccine_number = "Pertama";
          if (item.is_second === 1) item.vaccine_number = "Kedua";
          if (item.is_third === 1) item.vaccine_number = "Ketiga";
          if (item.is_first === 1 && item.is_second === 1)
            item.vaccine_number = "Pertama, Kedua";
          if (
            item.is_first === 1 &&
            item.is_second === 1 &&
            item.is_third === 1
          )
            item.vaccine_number = "Pertama, Kedua, Ketiga";
          item.hour_range = `${item.timeslot_start_time} - ${item.timeslot_end_time}`;
          if (item.terisi < item.max) item.status = "Tersedia";
          if (item.terisi === item.max) item.status = "Penuh";
          if (item.terisi > item.max) item.status = "Over";
        }

        if (slotByHour.length === 0) {
          if (this.state.paging.page.byDate === page) {
            this.setState({
              slotMonitoring: {
                listByDate: this.state.slotMonitoring.listByDate,
                listByHour: [],
                valByDate: null,
                valByHour: null,
                totalDataByHour: 0,
                totalPageByHour: 0,
                totalPageByDate: this.state.slotMonitoring.totalPageByDate,
                totalDataByDate: this.state.slotMonitoring.totalDataByDate,
              },
            });
          }
          this.setState({ isLoading: false });
        } else {
          this.state.paging.page.byHour = page;
          this.setState({
            paging: this.state.paging,
            slotMonitoring: {
              listByDate: this.state.slotMonitoring.listByDate,
              listByHour: slotByHour,
              valByDate: null,
              valByHour: null,
              totalDataByHour: data.data.total_data,
              totalPageByHour: data.data.total_page,
              totalPageByDate: this.state.slotMonitoring.totalPageByDate,
              totalDataByDate: this.state.slotMonitoring.totalDataByDate,
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

  async fetchSlotMonitoringListByDate(page) {
    this.setState({ isLoading: true });
    try {
      let formData = {
        page: page,
        limit: this.state.paging.perPage,
      };
      if (this.state.form.filterByDateHospitalName !== "")
        formData.hospital_name = this.state.form.filterByDateHospitalName;
      if (this.state.form.filterByDateTypeLocation !== "")
        formData.type_location = this.state.form.filterByDateTypeLocation;
      if (this.state.form.filterByDateVaccineType !== "")
        formData.type_vaccine = this.state.form.filterByDateVaccineType;
      if (this.state.form.filterByDateVaccineBrand !== "")
        formData.brand_vaccine = this.state.form.filterByDateVaccineBrand;
      if (this.state.form.filterByDateNationality !== "")
        formData.citizenship = this.state.form.filterByDateNationality;
      if (this.state.form.filterByDateCompanyName !== "")
        formData.company_name = this.state.form.filterByDateCompanyName;
      if (this.state.form.filterByDateVaccineDateFrom !== null)
        formData.date_from =
          this.state.form.filterByDateVaccineDateFrom === null
            ? ""
            : moment(this.state.form.filterByDateVaccineDateFrom).format(
                "YYYY-MM-DD"
              );
      if (this.state.form.filterByDateVaccineDateTo !== null)
        formData.date_to =
          this.state.form.filterByDateVaccineDateTo === null
            ? ""
            : moment(this.state.form.filterByDateVaccineDateTo).format(
                "YYYY-MM-DD"
              );
      if (this.state.form.filterByDateVaccineNo !== "")
        formData.is_first = this.state.form.filterByDateVaccineNo.includes(
          "PERTAMA"
        )
          ? "1"
          : "0";
      if (this.state.form.filterByDateVaccineNo !== "")
        formData.is_second = this.state.form.filterByDateVaccineNo.includes(
          "KEDUA"
        )
          ? "1"
          : "0";
      if (this.state.form.filterByDateStatus !== "")
        formData.status = this.state.form.filterByDateStatus;
      let response = await axios.get(
        `${Config.API_URL_2}/admin_vaccine/list_slot_monitoring_date`,
        { params: formData, headers: { token: this.state.admin.token } }
      );
      let data = response.data;
      if (data.statusCode === 200) {
        let slotByDate = data.data.slot;
        for (let i = 0; i < slotByDate.length; i++) {
          let item = slotByDate[i];
          if (item.is_first === 1) item.vaccine_number = "Pertama";
          if (item.is_second === 1) item.vaccine_number = "Kedua";
          if (item.is_first === 1 && item.is_second === 1)
            item.vaccine_number = "Pertama, Kedua";
          item.hour_range = `${item.timeslot_start_time} - ${item.timeslot_end_time}`;
          if (item.terisi < item.max) item.status = "Tersedia";
          if (item.terisi === item.max) item.status = "Penuh";
          if (item.terisi > item.max) item.status = "Over";
        }

        if (slotByDate.length === 0) {
          if (this.state.paging.page.byDate === page) {
            this.setState({
              slotMonitoring: {
                listByDate: [],
                listByHour: this.state.slotMonitoring.listByHour,
                valByDate: null,
                valByHour: null,
                totalDataByDate: 0,
                totalPageByDate: 0,
                totalPageByHour: this.state.slotMonitoring.totalPageByHour,
                totalDataByHour: this.state.slotMonitoring.totalDataByHour,
              },
            });
          }
          this.setState({ isLoading: false });
        } else {
          this.state.paging.page.byDate = page;
          this.setState({
            paging: this.state.paging,
            slotMonitoring: {
              listByDate: slotByDate,
              listByHour: this.state.slotMonitoring.listByHour,
              valByDate: null,
              valByHour: null,
              totalDataByDate: data.data.total_data,
              totalPageByDate: data.data.total_page,
              totalPageByHour: this.state.slotMonitoring.totalPageByHour,
              totalDataByHour: this.state.slotMonitoring.totalDataByHour,
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

  async exportExcelHour() {
    if (this.state.isLoading) return;
    this.setState({ isLoading: true });
    let formData = {};
    if (this.state.form.filterByHourHospitalName !== "")
      formData.hospital_name = this.state.form.filterByHourHospitalName;
    if (this.state.form.filterByHourTypeLocation !== "")
      formData.type_location = this.state.form.filterByHourTypeLocation;
    if (this.state.form.filterByHourVaccineType !== "")
      formData.type_vaccine = this.state.form.filterByHourVaccineType;
    if (this.state.form.filterByHourVaccineBrand !== "")
      formData.brand_vaccine = this.state.form.filterByHourVaccineBrand;
    if (this.state.form.filterByHourNationality !== "")
      formData.citizenship = this.state.form.filterByHourNationality;
    if (this.state.form.filterByHourCompanyName !== "")
      formData.company_name = this.state.form.filterByHourCompanyName;
    if (this.state.form.filterByHourVaccineDateFrom !== "")
      formData.date_from =
        this.state.form.filterByHourVaccineDateFrom === null
          ? ""
          : moment(this.state.form.filterByHourVaccineDateFrom).format(
              "YYYY-MM-DD"
            );
    if (this.state.form.filterByHourVaccineDateTo !== "")
      formData.date_to =
        this.state.form.filterByHourVaccineDateTo === null
          ? ""
          : moment(this.state.form.filterByHourVaccineDateTo).format(
              "YYYY-MM-DD"
            );
    if (this.state.form.filterByHourVaccineNo !== "")
      formData.is_first = this.state.form.filterByHourVaccineNo.includes(
        "PERTAMA"
      )
        ? "1"
        : "0";
    if (this.state.form.filterByHourVaccineNo !== "")
      formData.is_second = this.state.form.filterByHourVaccineNo.includes(
        "KEDUA"
      )
        ? "1"
        : "0";
    if (this.state.form.filterByHourStatus !== "")
      formData.status = this.state.form.filterByHourStatus;
    let response = await axios.post(
      `${Config.API_URL_2}/admin_vaccine/slot_monitoring_excel`,
      formData,
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
      link.setAttribute("download", "Slot Monitoring Hour.xlsx"); //or any other extension
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  }

  async exportExcelDate() {
    if (this.state.isLoading) return;
    this.setState({ isLoading: true });
    let formData = {};
    if (this.state.form.filterByDateHospitalName !== "")
      formData.hospital_name = this.state.form.filterByDateHospitalName;
    if (this.state.form.filterByDateTypeLocation !== "")
      formData.type_location = this.state.form.filterByDateTypeLocation;
    if (this.state.form.filterByDateVaccineType !== "")
      formData.type_vaccine = this.state.form.filterByDateVaccineType;
    if (this.state.form.filterByDateVaccineBrand !== "")
      formData.brand_vaccine = this.state.form.filterByDateVaccineBrand;
    if (this.state.form.filterByDateNationality !== "")
      formData.citizenship = this.state.form.filterByDateNationality;
    if (this.state.form.filterByDateCompanyName !== "")
      formData.company_name = this.state.form.filterByDateCompanyName;
    if (this.state.form.filterByDateVaccineDateFrom !== "")
      formData.date_from =
        this.state.form.filterByDateVaccineDateFrom === null
          ? ""
          : moment(this.state.form.filterByDateVaccineDateFrom).format(
              "YYYY-MM-DD"
            );
    if (this.state.form.filterByDateVaccineDateTo !== "")
      formData.date_to =
        this.state.form.filterByDateVaccineDateTo === null
          ? ""
          : moment(this.state.form.filterByDateVaccineDateTo).format(
              "YYYY-MM-DD"
            );
    if (this.state.form.filterByDateVaccineNo !== "")
      formData.is_first = this.state.form.filterByDateVaccineNo.includes(
        "PERTAMA"
      )
        ? "1"
        : "0";
    if (this.state.form.filterByDateVaccineNo !== "")
      formData.is_second = this.state.form.filterByDateVaccineNo.includes(
        "KEDUA"
      )
        ? "1"
        : "0";
    if (this.state.form.filterByDateStatus !== "")
      formData.status = this.state.form.filterByDateStatus;
    let response = await axios.post(
      `${Config.API_URL_2}/admin_vaccine/slot_monitoring_by_date_excel`,
      formData,
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
      link.setAttribute("download", "Slot Monitoring Date.xlsx"); //or any other extension
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  }

  async generateFilter() {
    this.setState({ isLoading: true });
    let filter = {
      filterByHourHospital: [],
      filterByHourVaccineType: [],
      filterByHourVaccineBrand: [],
      filterByHourCompanyName: [],

      filterByDateHospital: [],
      filterByDateVaccineType: [],
      filterByDateVaccineBrand: [],
      filterByDateCompanyName: [],
    };
    let response = await axios.get(`${Config.API_URL_2}/admin_vaccine/filter`, {
      headers: { token: this.state.admin.token },
    });
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        filter.filterByHourHospital = data.data.filterHospital.map(
          (item, index) => item.location_vaccine_name
        );
        filter.filterByHourVaccineType = data.data.filterVaccineType.map(
          (item, index) => item.vaccine_name
        );
        filter.filterByHourVaccineBrand = data.data.filterBrandVaccine;
        filter.filterByHourCompanyName = data.data.filterCompanyName.map(
          (item, index) => item.company_name
        );
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
    return filter;
  }

  render() {
    let filter = this.state.filter;
    console.log("state", this.state);
    return (
      <>
        <div className="standard-page">
          <div className="d-flex flex-column flex-md-row justify-content-between">
            <div className="action-bar">
              <div className="title">Daftar Slot Monitoring</div>
            </div>
          </div>
          {this.state.isLoading && <div className="loader"></div>}
          <div className="d-flex flex-column flex-md-row justify-content-between">
            {/* <div className="show-by">
            <label className="mr-2">Tampilkan Berdasarkan</label>
            <select name="showBy" onChange={this.handleFormChange} value={this.state.form.showBy}>
              <option value="JAM">Jam</option>
              <option value="TANGGAL">Tanggal</option>
            </select>
          </div> */}
            <div style={{ minWidth: "4px", minHeight: "4px" }}></div>
            <div className="export-button">
              {this.state.form.showBy === "JAM" && (
                <button
                  onClick={this.exportExcelHour}
                  disabled={this.isLoading}
                  className="color-button"
                >
                  Export to Excel
                </button>
              )}
              {this.state.form.showBy === "TANGGAL" && (
                <button
                  onClick={this.exportExcelDate}
                  disabled={this.isLoading}
                  className="color-button"
                >
                  Export to Excel
                </button>
              )}
            </div>
          </div>
          <div style={{ minWidth: "4px", minHeight: "4px" }}></div>

          {this.state.form.showBy === "JAM" && (
            <div className="filter d-flex flex-wrap mb-2">
              <div className="article-filter-select">
                <select
                  name="filterByHourHospitalName"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterByHourHospitalName}
                >
                  <option value="">Nama Rumah Sakit</option>
                  {filter.filterByHourHospital.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div className="article-filter-select">
                <select
                  name="filterByHourTypeLocation"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterByHourTypeLocation}
                >
                  <option value="">Tipe Lokasi</option>
                  <option value="UMUM">Umum</option>
                  <option value="PERUSAHAAN">Perusahaan</option>
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div className="article-filter-select">
                <select
                  name="filterByHourVaccineType"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterByHourVaccineType}
                >
                  <option value="">Tipe Vaksin</option>
                  {filter.filterByHourVaccineType.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div className="article-filter-select">
                <select
                  name="filterByHourCompanyName"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterByHourCompanyName}
                >
                  <option value="">Nama Perusahaan</option>
                  {filter.filterByHourCompanyName.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div className="article-filter-select">
                <select
                  name="filterByHourVaccineNo"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterByHourVaccineNo}
                >
                  <option value="">Vaksin Ke</option>
                  <option value="PERTAMA">Pertama</option>
                  <option value="KEDUA">Kedua</option>
                  <option value="KETIGA">Ketiga</option>
                  <option value="PERTAMA,KEDUA">Pertama & Kedua</option>
                  <option value="PERTAMA,KETIGA">Pertama & Ketiga</option>
                  <option value="KEDUA,KETIGA">Kedua & Ketiga</option>
                  <option value="PERTAMA,KEDUA,KETIGA">
                    Pertama, Kedua, & Ketiga
                  </option>
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div className="article-filter-select">
                <select
                  name="filterByHourVaccineBrand"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterByHourVaccineBrand}
                >
                  <option value="">Merek Vaksin</option>
                  {filter.filterByHourVaccineBrand.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div className="article-filter-select">
                <select
                  name="filterByHourNationality"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterByHourNationality}
                >
                  <option value="">Kewarganegaraan</option>
                  <option value="WNI">WNI</option>
                  <option value="WNA">WNA</option>
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div
                onClick={() =>
                  document.getElementById("vaccine-date-hour-input").click()
                }
                className="article-filter-select"
              >
                <div className="label">
                  {this.state.form.filterByHourVaccineDateFrom === null &&
                  this.state.form.filterByHourVaccineDateTo === null
                    ? "Tanggal Vaksin"
                    : moment(
                        this.state.form.filterByHourVaccineDateFrom
                      ).format("DD/MM") +
                      " - " +
                      moment(this.state.form.filterByHourVaccineDateTo).format(
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
                  id="vaccine-date-hour-input"
                  placeholder="Pilih Tanggal"
                  style={{
                    height: "2px",
                    visibility: "hidden",
                    position: "absolute",
                  }}
                />
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div className="article-filter-select">
                <select
                  name="filterByHourStatus"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterByHourStatus}
                >
                  <option value="">Status</option>
                  <option value="TERSEDIA">Tersedia</option>
                  <option value="PENUH">Penuh</option>
                  <option value="OVER">Over</option>
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div
                onClick={this.resetFilterHour}
                className="article-filter-select"
              >
                <i className="fa fa-refresh"></i>
              </div>
            </div>
          )}
          {this.state.form.showBy === "JAM" && (
            <div>
              <div className="primary-table overflow">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="no-wrap">Nama Rumah Sakit</th>
                      <th className="no-wrap">Tipe Lokasi</th>
                      <th className="no-wrap">Tipe Vaksin</th>
                      <th className="no-wrap">Nama Perusahaan</th>
                      <th className="no-wrap">Vaksinasi ke</th>
                      <th className="no-wrap">Merek Vaksin</th>
                      <th className="no-wrap">Kewarganegaraan</th>
                      <th className="no-wrap">Tanggal Vaksin</th>
                      <th className="no-wrap">Jam</th>
                      <th className="no-wrap">Status</th>
                      <th className="no-wrap">Terisi</th>
                      <th className="no-wrap">Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.slotMonitoring.listByHour.length === 0 && (
                      <tr>
                        <td colSpan="8">
                          <div className="text-center text-secondary">
                            <small>
                              <em>Maaf tidak ada data yang ditemukan</em>
                            </small>
                          </div>
                        </td>
                      </tr>
                    )}
                    {this.state.slotMonitoring.listByHour.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="no-wrap">
                            {item.location_vaccine_name}
                          </div>
                        </td>
                        <td>
                          <div className="no-wrap">{item.type_location}</div>
                        </td>
                        <td>
                          <div className="no-wrap">{item.type_vaccine}</div>
                        </td>
                        <td>
                          <div className="no-wrap">{item.company_name}</div>
                        </td>
                        <td>
                          <div className="no-wrap">{item.vaccine_number}</div>
                        </td>
                        <td>
                          <div className="no-wrap">{item.brand_vaccine}</div>
                        </td>
                        <td>
                          <div className="no-wrap">{item.citizenship}</div>
                        </td>
                        <td>
                          <div className="no-wrap">
                            {moment(item.date).format("DD MMMM YYYY")}
                          </div>
                        </td>
                        <td>
                          <div className="no-wrap">{item.hour_range}</div>
                        </td>
                        <td>
                          <div
                            className={`no-wrap ${
                              item.status === "Tersedia"
                                ? "slot-available"
                                : item.status === "Penuh"
                                ? "slot-full"
                                : "slot-over"
                            }`}
                          >
                            {item.status}
                          </div>
                        </td>
                        <td>
                          <div className="no-wrap">{item.terisi}</div>
                        </td>
                        <td>
                          <div className="no-wrap">{item.max}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ minHeight: "16px", minWidth: "16px" }}></div>
              {this.state.slotMonitoring.listByHour.length > 0 && (
                <div className="page-bar d-flex flex-column flex-md-row justify-content-between">
                  <div className="qty align-self-center">
                    {this.state.slotMonitoring.totalDataByHour} data (
                    {this.state.slotMonitoring.totalPageByHour} halaman)
                  </div>
                  <div className="page-list">
                    <div className="qty align-self-center">
                      {this.state.paging.page.byHour} dari{" "}
                      {this.state.slotMonitoring.totalPageByHour}
                    </div>
                    <div onClick={this.prevPageHour} className="page">
                      <div className="text-center">
                        <img
                          src={`${Config.BASE_URL}/img/page-arrow-left.png`}
                        />
                      </div>
                    </div>
                    <div className="page active">
                      <div className="text-center">
                        {this.state.paging.page.byHour}
                      </div>
                    </div>
                    <div onClick={this.nextPageHour} className="page">
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

          {this.state.form.showBy === "TANGGAL" && (
            <div className="filter d-flex flex-wrap mb-2">
              <div className="article-filter-select">
                <select
                  name="filterByDateHospitalName"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterByDateHospitalName}
                >
                  <option value="">Nama Rumah Sakit</option>
                  {filter.filterByDateHospital.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div className="article-filter-select">
                <select
                  name="filterByDateTypeLocation"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterByDateTypeLocation}
                >
                  <option value="">Tipe Lokasi</option>
                  <option value="UMUM">Umum</option>
                  <option value="PERUSAHAAN">Perusahaan</option>
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div className="article-filter-select">
                <select
                  name="filterByDateVaccineType"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterByDateVaccineType}
                >
                  <option value="">Tipe Vaksin</option>
                  {filter.filterByDateVaccineType.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div className="article-filter-select">
                <select
                  name="filterByDateCompanyName"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterByDateCompanyName}
                >
                  <option value="">Nama Perusahaan</option>
                  {filter.filterByDateCompanyName.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div className="article-filter-select">
                <select
                  name="filterByDateVaccineNo"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterByDateVaccineNo}
                >
                  <option value="">Vaksin Ke</option>
                  <option value="PERTAMA">Pertama</option>
                  <option value="KEDUA">Kedua</option>
                  <option value="PERTAMA,KEDUA">Pertama & Kedua</option>
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div className="article-filter-select">
                <select
                  name="filterByDateVaccineBrand"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterByDateVaccineBrand}
                >
                  <option value="">Merek Vaksin</option>
                  {filter.filterByDateVaccineBrand.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div className="article-filter-select">
                <select
                  name="filterByDateNationality"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterByDateNationality}
                >
                  <option value="">Kewarganegaraan</option>
                  <option value="WNI">WNI</option>
                  <option value="WNA">WNA</option>
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div
                onClick={() =>
                  document.getElementById("vaccine-date-date-input").click()
                }
                className="article-filter-select"
              >
                <div className="label">
                  {this.state.form.filterByDateVaccineDateFrom === null &&
                  this.state.form.filterByDateVaccineDateTo === null
                    ? "Tanggal Vaksin"
                    : moment(
                        this.state.form.filterByDateVaccineDateFrom
                      ).format("DD/MM") +
                      " - " +
                      moment(this.state.form.filterByDateVaccineDateTo).format(
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
                  id="vaccine-date-date-input"
                  placeholder="Pilih Tanggal"
                  style={{
                    height: "2px",
                    visibility: "hidden",
                    position: "absolute",
                  }}
                />
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div className="article-filter-select">
                <select
                  name="filterByDateStatus"
                  onChange={this.handleFormChange}
                  value={this.state.form.filterByDateStatus}
                >
                  <option value="">Status</option>
                  <option value="TERSEDIA">Tersedia</option>
                  <option value="PENUH">Penuh</option>
                  <option value="OVER">Over</option>
                </select>
              </div>
              <div style={{ minHeight: "8px", minWidth: "8px" }}></div>
              <div
                onClick={this.resetFilterDate}
                className="article-filter-select"
              >
                <i className="fa fa-refresh"></i>
              </div>
            </div>
          )}
          {this.state.form.showBy === "TANGGAL" && (
            <div>
              <div className="primary-table overflow">
                {this.state.slotMonitoring.listByDate.length > 0 && (
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="no-wrap">Nama Rumah Sakit</th>
                        <th className="no-wrap">Tipe Lokasi</th>
                        <th className="no-wrap">Tipe Vaksin</th>
                        <th className="no-wrap">Nama Perusahaan</th>
                        <th className="no-wrap">Vaksinasi ke</th>
                        <th className="no-wrap">Merek Vaksin</th>
                        <th className="no-wrap">Kewarganegaraan</th>
                        <th className="no-wrap">Tanggal Vaksin</th>
                        <th className="no-wrap">Status</th>
                        <th className="no-wrap">Terisi</th>
                        <th className="no-wrap">Max</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.slotMonitoring.listByDate.length === 0 && (
                        <tr>
                          <td colSpan="7">
                            <div className="text-center text-secondary">
                              <small>
                                <em>Maaf tidak ada data yang ditemukan</em>
                              </small>
                            </div>
                          </td>
                        </tr>
                      )}
                      {this.state.slotMonitoring.listByDate.map(
                        (item, index) => (
                          <tr key={index}>
                            <td>
                              <div className="no-wrap">
                                {item.location_vaccine_name}
                              </div>
                            </td>
                            <td>
                              <div className="no-wrap">
                                {item.type_location}
                              </div>
                            </td>
                            <td>
                              <div className="no-wrap">{item.type_vaccine}</div>
                            </td>
                            <td>
                              <div className="no-wrap">{item.company_name}</div>
                            </td>
                            <td>
                              <div className="no-wrap">
                                {item.vaccine_number}
                              </div>
                            </td>
                            <td>
                              <div className="no-wrap">
                                {item.brand_vaccine}
                              </div>
                            </td>
                            <td>
                              <div className="no-wrap">{item.citizenship}</div>
                            </td>
                            <td>
                              <div className="no-wrap">
                                {moment(item.date).format("DD MMMM YYYY")}
                              </div>
                            </td>
                            <td>
                              <div
                                className={`no-wrap ${
                                  item.status === "Tersedia"
                                    ? "slot-available"
                                    : item.status === "Penuh"
                                    ? "slot-full"
                                    : "slot-over"
                                }`}
                              >
                                {item.status}
                              </div>
                            </td>
                            <td>
                              <div className="no-wrap">{item.terisi}</div>
                            </td>
                            <td>
                              <div className="no-wrap">{item.max}</div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                )}
              </div>
              <div style={{ minHeight: "16px", minWidth: "16px" }}></div>
              {this.state.slotMonitoring.listByDate.length > 0 && (
                <div className="page-bar d-flex flex-column flex-md-row justify-content-between">
                  <div className="qty align-self-center">
                    {this.state.slotMonitoring.totalDataByDate} data (
                    {this.state.slotMonitoring.totalPageByDate} halaman)
                  </div>
                  <div className="page-list">
                    <div className="qty align-self-center">
                      {this.state.paging.page.byDate} dari{" "}
                      {this.state.slotMonitoring.totalPageByDate}
                    </div>
                    <div onClick={this.prevPageDate} className="page">
                      <div className="text-center">
                        <img
                          src={`${Config.BASE_URL}/img/page-arrow-left.png`}
                        />
                      </div>
                    </div>
                    <div className="page active">
                      <div className="text-center">
                        {this.state.paging.page.byDate}
                      </div>
                    </div>
                    <div onClick={this.nextPageDate} className="page">
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
        </div>
      </>
    );
  }
}

export default SlotMonitoring;
