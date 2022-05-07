import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";
import _ from "lodash";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import moment from "moment";
import validator from "validator";
import "moment/locale/id";
import MUIDataTable from "mui-datatables";
import { Link } from "react-router-dom";
import * as Config from "./../../Config";
import { useHistory } from "react-router-dom";
import Litepicker from "litepicker";
import "litepicker/dist/plugins/multiselect";
import TimePicker from "rc-time-picker";
import "rc-time-picker/assets/index.css";
moment.locale("id");

const Swal2 = withReactContent(Swal);

class VaccineSlotEdit extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if (admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
      editedVaccineSlot: null,
      form: {
        hospitalList: [],
        hospitalVal: "",
        locationTypeVal: "",
        companyName: "",
        passcode: "",
        vaccineTypeList: [],
        vaccineTypeVal: "",
        vaccineBrandList: [],
        vaccineBrandVal: "",

        // brand
        brandName: "",
        editedBrand: null,
        editBrandName: "",

        // Fajar Tambah Allowed
        brandNameSecond: "",
        editedBrandSecond: null,
        editBrandNameSecond: "",
        vaccineBrandListSecond: [],
        vaccineBrandValSecond: "",
        second_brand_allowed: [],

        // category
        categoryList: [],
        categoryVal: "",
        categoryName: "",
        editedCategory: null,
        editCategoryName: "",

        // first vaccine location
        firstlocList: [],
        firstlocVal: "",
        firstlocName: "",
        editedFirstloc: null,
        editFirstlocName: "",

        dateList: [],
        regularDays: [
          { key: Math.random(), start: null, end: null, qty: 0, status: 1 },
        ],
        vaccine1: false,
        vaccine2: false,
        vaccine3: false,
        wni: false,
        wna: false,
        note: "",
        status: "1",
      },
    };
    this.handleFormChange = this.handleFormChange.bind(this);
    this.getHospitalList = this.getHospitalList.bind(this);
    this.getVaccineTypeList = this.getVaccineTypeList.bind(this);
    this.getVaccineBrandList = this.getVaccineBrandList.bind(this);
    this.fetchCategoryList = this.fetchCategoryList.bind(this);
    this.addCategory = this.addCategory.bind(this);
    this.editCategory = this.editCategory.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
    this.fetchFirstlocList = this.fetchFirstlocList.bind(this);
    this.addFirstloc = this.addFirstloc.bind(this);
    this.editFirstloc = this.editFirstloc.bind(this);
    this.deleteFirstloc = this.deleteFirstloc.bind(this);
    this.addBrand = this.addBrand.bind(this);
    this.editBrand = this.editBrand.bind(this);
    this.deleteBrand = this.deleteBrand.bind(this);
    this.initDatePicker = this.initDatePicker.bind(this);
    this.addRegularDaysRow = this.addRegularDaysRow.bind(this);
    this.removeRegularDaysRow = this.removeRegularDaysRow.bind(this);
    this.applyRegularSlot = this.applyRegularSlot.bind(this);
    this.handleTimeSlotChange = this.handleTimeSlotChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  async componentDidMount() {
    await this.getHospitalList();
    await this.getVaccineBrandList();
    await this.getVaccineSlotDetail();
    await this.getFirstVaccineBrandList();
  }

  getFirstVaccineBrandList = async () => {
    this.setState((prevState) => ({
      isLoading: true,
      form: {
        ...prevState.form,
        vaccineBrandListSecond: [],
      },
    }));
    let response = await axios.get(
      Config.API_URL_2 + "/v2/admin-vaccine/list_brand_vaccine",
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        let brandList = data.data;
        for (let i = 0; i < brandList.length; i++) brandList[i].status = 0;
        this.setState((prevState) => ({
          form: {
            ...prevState.form,
            vaccineBrandListSecond: brandList,
          },
        }));
        await this.getBrandVaccineAllowed();
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  };

  async getVaccineSlotDetail() {
    this.setState({ isLoading: true });
    let url = new URL(window.location.href);
    let formData = {};
    formData.location_vaccine_id = url.searchParams.get("location_vaccine_id");
    formData.type_vaccine = url.searchParams.get("type_vaccine");
    formData.vaccine_status = url.searchParams.get("vaccine_status");
    formData.brand_vaccine = url.searchParams.get("brand_vaccine");
    formData.location_vaccine_available_id = JSON.parse(
      url.searchParams.get("location_vaccine_available_id")
    );
    formData.type_location = url.searchParams.get("type_location");
    formData.citizenship = url.searchParams.get("citizenship");
    let response = await axios.post(
      `${Config.API_URL_2}/v2/admin_vaccine/detail_slot_and_type_vaccine`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        let vaccineSlot = data.data;

        let hospitalSelected = "";
        for (let i = 0; i < this.state.form.hospitalList.length; i++) {
          let item = this.state.form.hospitalList[i];
          if (item.location_vaccine_id === vaccineSlot.location_vaccine_id) {
            hospitalSelected = i;
            break;
          }
        }

        let brand = vaccineSlot.brand_vaccine.split(", ");
        this.state.form.vaccineBrandList.forEach((item) => {
          if (brand.includes(item.brand_vaccine)) item.status = 1;
        });
        this.setState((prevState) => ({
          editedVaccineSlot: vaccineSlot,
          form: {
            ...prevState.form,
            hospitalVal: hospitalSelected,
            locationTypeVal: formData.type_location,
          },
        }));
        await this.getVaccineTypeList();
        await this.fetchFirstlocList();
        let vaccineTypeSelected = "";
        for (let i = 0; i < this.state.form.vaccineTypeList.length; i++) {
          let item = this.state.form.vaccineTypeList[i];
          if (
            item.type_location.toUpperCase() !== this.state.form.locationTypeVal
          )
            continue;
          if (
            item.location_vaccine_type_id ===
            vaccineSlot.location_vaccine_type_id
          ) {
            vaccineTypeSelected = i;
            break;
          }
        }
        let dateList = [];
        for (let i = 0; i < vaccineSlot.calendar.length; i++) {
          let item = vaccineSlot.calendar[i];
          let date = {
            locationVaccineCalendarID: item.location_vaccine_calendar_id,
            date: moment(item.date),
            slot: [],
            status: Number(item.status),
          };
          for (let s = 0; s < item.timeslot[0].length; s++) {
            let subitem = item.timeslot[0][s];
            date.slot.push({
              timeslotID: subitem.timeslot_id,
              key: Math.random(),
              start: moment(subitem.timeslot_start_time, "HH.mm").format(
                "HH:mm"
              ),
              end: moment(subitem.timeslot_end_time, "HH.mm").format("HH:mm"),
              qty: Number(subitem.max_slot),
              status: Number(subitem.status),
            });
          }
          dateList.push(date);
        }
        this.setState(
          (prevState) => ({
            form: {
              ...prevState.form,
              companyName: vaccineSlot.company_name,
              passcode: vaccineSlot.passcode,
              vaccineTypeVal: vaccineTypeSelected,
              dateList: dateList,
              vaccine1: vaccineSlot.is_first === 1,
              vaccine2: vaccineSlot.is_second === 1,
              vaccine3: vaccineSlot.is_third === 1,
              wni: ["WNI", "ALL"].includes(vaccineSlot.citizenship),
              wna: ["WNA", "ALL"].includes(vaccineSlot.citizenship),
              note: vaccineSlot.noted,
              status: String(vaccineSlot.status),
            },
          }),
          this.fetchCategoryList
        );

        let dateRange = document.getElementById("date-range");
        if (dateRange != null) {
          new Litepicker({
            element: dateRange,
            plugins: ["multiselect"],
            setup: (picker) => {
              picker.on("button:apply", (date1, date2) => {
                let selectedList = picker.getMultipleDates();
                let dateList = [];
                for (let i = 0; i < selectedList.length; i++)
                  dateList.push({
                    date: moment(selectedList[i].dateInstance),
                    slot: [],
                  });
                this.setState((prevState) => ({
                  form: { ...prevState.form, dateList: dateList },
                }));
                let dateText = "";
                for (let i = 0; i < this.state.form.dateList.length; i++) {
                  let item = this.state.form.dateList[i];
                  if (dateText != "") dateText += " / ";
                  dateText += moment(item.date).format("DD MMM YYYY");
                }
                dateRange.value = dateText;
              });
            },
          });
        }
        let singleDateRange = document.getElementById("single-date-range");
        if (singleDateRange != null) {
          new Litepicker({
            element: singleDateRange,
            singleMode: true,
            setup: (picker) => {
              picker.on("selected", (date) => {
                date = moment(date.dateInstance);
                let exist = false;
                for (let i = 0; i < this.state.form.dateList.length; i++) {
                  let item = this.state.form.dateList[i];
                  if (moment(item.date).isSame(date, "day")) exist = true;
                }
                if (!exist) {
                  this.state.form.dateList.push({ date: date, slot: [] });
                  this.setState((prevState) => ({
                    form: { ...prevState.form },
                  }));
                }
              });
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

  toggleStatus(item) {
    item.status = item.status === 1 ? 0 : 1;
    this.setState({ form: this.state.form });
  }

  initDatePicker() {
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        companyVal: "",
        vaccineTypeVal: "",

        dateList: [],
        regularDays: [
          { key: Math.random(), start: null, end: null, qty: 0, status: 1 },
        ],
        vaccine1: false,
        vaccine2: false,
        wni: false,
        wna: false,
        note: "",
      },
    }));
    let dateRange = document.getElementById("date-range");
    if (dateRange != null) {
      new Litepicker({
        element: dateRange,
        plugins: ["multiselect"],
        setup: (picker) => {
          picker.on("button:apply", (date1, date2) => {
            let selectedList = picker.getMultipleDates();
            let dateList = [];
            for (let i = 0; i < selectedList.length; i++)
              dateList.push({
                date: moment(selectedList[i].dateInstance),
                slot: [],
              });
            this.setState((prevState) => ({
              form: { ...prevState.form, dateList: dateList },
            }));
            let dateText = "";
            for (let i = 0; i < this.state.form.dateList.length; i++) {
              let item = this.state.form.dateList[i];
              if (dateText != "") dateText += " / ";
              dateText += moment(item.date).format("DD MMM YYYY");
            }
            dateRange.value = dateText;
          });
        },
      });
    }
    let singleDateRange = document.getElementById("single-date-range");
    if (singleDateRange != null) {
      new Litepicker({
        element: singleDateRange,
        singleMode: true,
        setup: (picker) => {
          picker.on("selected", (date) => {
            date = moment(date.dateInstance);
            let exist = false;
            for (let i = 0; i < this.state.form.dateList.length; i++) {
              let item = this.state.form.dateList[i];
              if (moment(item.date).isSame(date, "day")) exist = true;
            }
            if (!exist) {
              this.state.form.dateList.push({ date: date, slot: [] });
              this.setState((prevState) => ({ form: { ...prevState.form } }));
            }
          });
        },
      });
    }
  }

  addRegularDaysRow() {
    let regularDays = this.state.form.regularDays;
    regularDays.push({
      key: Math.random(),
      start: null,
      end: null,
      qty: 0,
      status: 1,
    });
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        regularDays: regularDays,
      },
    }));
  }

  removeRegularDaysRow(row) {
    if (this.state.form.regularDays.length <= 1) return;
    let indexSelected = this.state.form.regularDays.indexOf(row);
    let regularDays = [
      ...this.state.form.regularDays.slice(0, indexSelected),
      ...this.state.form.regularDays.slice(indexSelected + 1),
    ];
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        regularDays: regularDays,
      },
    }));
  }

  applyRegularSlot() {
    for (let i = 0; i < this.state.form.dateList.length; i++) {
      let item = this.state.form.dateList[i];
      item.slot = [];
      for (let s = 0; s < this.state.form.regularDays.length; s++) {
        let slot = JSON.parse(JSON.stringify(this.state.form.regularDays[s]));
        if (slot.start === null || slot.end === null) continue;
        slot.key = Math.random();
        item.slot.push(slot);
      }
    }
    alert("Jam berhasil diterapkan");
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        dateList: this.state.form.dateList,
      },
    }));
  }

  addSlotRegularDaysRow(item) {
    item.slot.push({
      key: Math.random(),
      start: moment(),
      end: moment(),
      qty: 0,
      status: 1,
    });
    this.setState((prevState) => ({ form: { ...prevState.form } }));
  }

  removeSlotRegularDaysRow(item, subitem) {
    if (item.slot.length <= 1) return;
    let indexSelected = item.slot.indexOf(subitem);
    item.slot = [
      ...item.slot.slice(0, indexSelected),
      ...item.slot.slice(indexSelected + 1),
    ];
    this.setState((prevState) => ({ form: { ...prevState.form } }));
  }

  removeRegularDaySlot(form, item) {
    let indexSelected = form.dateList.indexOf(item);
    form.dateList = [
      ...form.dateList.slice(0, indexSelected),
      ...form.dateList.slice(indexSelected + 1),
    ];
    this.setState((prevState) => ({ form: { ...prevState.form } }));
  }

  async getHospitalList() {
    this.setState({ isLoading: true });
    let response = await axios.get(
      Config.API_URL_2 + "/hospital_vaccine_list",
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        this.setState((prevState) => ({
          form: {
            ...prevState.form,
            hospitalList: data.data,
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

  async getVaccineTypeList() {
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        vaccineTypeList: [],
        vaccineTypeVal: "",
      },
    }));
    if (
      this.state.form.hospitalVal === "" ||
      this.state.form.locationTypeVal === ""
    )
      return;
    let formData = {};
    formData.hospital_name =
      this.state.form.hospitalList[this.state.form.hospitalVal].name;
    formData.type_location = this.state.form.locationTypeVal;
    let response = await axios.post(
      `${Config.API_URL_2}/admin_vaccine/type_vaccine_by_location`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        this.setState((prevState) => ({
          form: {
            ...prevState.form,
            vaccineTypeList: data.data,
          },
        }));
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
  }

  async getVaccineBrandList() {
    this.setState((prevState) => ({
      isLoading: true,
      form: {
        ...prevState.form,
        vaccineBrandList: [],
      },
    }));
    let response = await axios.get(
      Config.API_URL_2 + "/v2/admin-vaccine/list_brand_vaccine",
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        let brandList = data.data;
        for (let i = 0; i < brandList.length; i++)
          brandList[i].status = Number(brandList[i].status);
        this.setState((prevState) => ({
          form: {
            ...prevState.form,
            vaccineBrandList: brandList,
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

  async addBrand() {
    if (this.state.isLoading) return;
    if (this.state.form.brandName === "")
      return Swal.fire("Nama Merek Vaksin wajib diisi");
    this.setState({ isLoading: true });
    let formData = {};
    formData.brand_vaccine = this.state.form.brandName;
    let response = await axios.post(
      `${Config.API_URL_2}/v2/admin-vaccine/list_brand_vaccine`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 201) {
        await Swal.fire(
          "Success",
          "Merek Vaksin berhasil ditambahkan",
          "success"
        );
        this.getVaccineBrandList();
        this.setState((prevState) => ({
          form: { ...prevState.form, brand_vaccine: "" },
        }));
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  }

  async editBrand() {
    if (this.state.isLoading) return;
    this.setState({ isLoading: true });
    let formData = {};
    formData.brand_vaccine = this.state.form.editBrandName;
    let response = await axios.put(
      `${Config.API_URL_2}/v2/admin-vaccine/list_brand_vaccine/${this.state.form.editedBrand.brand_vaccine_id}`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        await Swal.fire(
          "Success",
          "Merek vaksinasi berhasil diubah",
          "success"
        );
        this.state.form.editedBrand.brand_vaccine =
          this.state.form.editBrandName;
        this.setState((prevState) => ({
          form: { ...prevState.form, editedBrand: null },
        }));
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState((prevState) => ({
      form: { ...prevState.form },
      isLoading: false,
    }));
  }

  async deleteBrand(brand) {
    if (this.state.isLoading) return;
    let confirm = await Swal.fire({
      title: "Hapus Merek Vaksin ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    });
    if (!confirm.value) return;
    this.setState({ isLoading: true });
    let formData = {};
    let response = await axios.delete(
      `${Config.API_URL_2}/v2/admin-vaccine/list_brand_vaccine/${brand.brand_vaccine_id}`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        await Swal.fire("Success", "Merek vaksin berhasil dihapus", "success");
        this.getVaccineBrandList();
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState((prevState) => ({
      form: { ...prevState.form },
      isLoading: false,
    }));
  }

  getBrandName() {
    let brand = "";
    for (let i = 0; i < this.state.form.vaccineBrandList.length; i++) {
      let item = this.state.form.vaccineBrandList[i];
      if (Number(item.status) === 1) {
        if (brand != "") brand += ", ";
        brand += item.brand_vaccine;
      }
    }
    return brand;
  }

  getBrandNameSecond() {
    let brand = "";
    for (let i = 0; i < this.state.form.vaccineBrandListSecond.length; i++) {
      let item = this.state.form.vaccineBrandListSecond[i];
      if (Number(item.status) === 1) {
        if (brand != "") brand += ", ";
        brand += item.brand_vaccine;
      }
    }
    return brand;
  }

  setEditBrand(brand) {
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        editedBrand: brand,
        editBrandName: brand.brand_vaccine,
      },
    }));
  }

  async toggleBrandStatus(brand) {
    brand.status = brand.status === 1 ? 0 : 1;
    this.setState((prevState) => ({
      form: { ...prevState.form, editedBrand: null },
    }));
  }

  async toggleBrandStatusSecond(data) {
    let brands = this.getBrandName();
    if (brands === "") {
      return Swal.fire("Harap memilih merek vaksin (Untuk Slot)");
    }

    // if (this.state.form.type_vaccine === "") {
    //   return Swal.fire("Harap memilih tipe vaksin");
    // }

    for (let i = 0; i < this.state.form.vaccineBrandListSecond.length; i++) {
      let item = this.state.form.vaccineBrandListSecond[i];
      if (Number(item.brand_vaccine_id) === data.brand_vaccine_id) {
        if (item.status == 1) {
          item.status = 0;
          this.setState((prevState) => ({
            form: { ...prevState.form, editedBrand: null },
          }));
        } else {
          item.status = 1;
          this.setState((prevState) => ({
            form: { ...prevState.form, editedBrand: null },
          }));
        }
      }
    }

    await this.postBrandAllowed();
  }

  postBrandAllowed = async () => {
    let brand_second = this.getBrandNameSecond();
    if (brand_second === "") {
      return Swal.fire("Harap memilih merek vaksin Sebelumnya");
    }
    let brand = this.getBrandName();

    let formData = {
      brand_vaccine: brand,
      vaccine_allowed: brand_second,
      type_vaccine:
        this.state.form.vaccineTypeList[this.state.form.vaccineTypeVal]
          .vaccine_name,
      location_vaccine_id:
        this.state.form.hospitalList[this.state.form.hospitalVal]
          .location_vaccine_id,
    };

    this.setState({
      isLoading: true,
    });
    try {
      let response = await axios.post(
        `${Config.API_URL_2}/create-brand-vaccine-allowed`,
        formData,
        { headers: { token: this.state.admin.token } }
      );

      let data = response.data;
      if (data.statusCode === 201) {
        this.setState({
          isLoading: false,
        });
        this.getBrandVaccineAllowed();
      } else {
        this.setState({
          isLoading: false,
        });
      }
    } catch (error) {
      this.setState({
        isLoading: false,
      });
    }
  };

  getBrandVaccineAllowed = async () => {
    if (this.state.form.location_vaccine_id == "") {
      return;
    } else {
      let formData = {
        location_vaccine_id:
          this.state.form.hospitalList[this.state.form.hospitalVal]
            .location_vaccine_id,
        type_vaccine:
          this.state.form.vaccineTypeList[this.state.form.vaccineTypeVal]
            .vaccine_name,
      };
      let response = await axios.post(
        `${Config.API_URL_2}/get-brand-vaccine-allowed`,
        formData,
        { headers: { token: this.state.admin.token } }
      );

      try {
        let data = response.data;
        if (data.statusCode === 200) {
          this.setState((prevState) => ({
            form: {
              ...prevState.form,
              second_brand_allowed: data.data,
            },
          }));
          let resync_brand_allowed = await this.resync();
        } else {
          Swal.fire("Failed", data.message, "error");
        }
      } catch (error) {
        Swal.fire("Error", "Unable to connect to server", "error");
      }
    }
  };

  resync = async () => {
    console.log("STATE", this.state);
    if (!_.isEmpty(this.state.form.second_brand_allowed)) {
      console.log("RESYNC");
      for (let x = 0; x < this.state.form.second_brand_allowed.length; x++) {
        let name = this.state.form.second_brand_allowed[x];
        console.log("name :", x, " ", name);
        let found = this.state.form.vaccineBrandListSecond.find(
          (x) => x.brand_vaccine == name.trim()
        );

        // for(let m=0; m<this.state.form.vaccineBrandListSecond; m++){
        //   console.log(this.state.form.vaccineBrandListSecond[m].brand_vaccine);
        // }
        console.log("found :", x, " ", found);

        if (found !== undefined) {
          this.state.form.vaccineBrandListSecond
            .filter(
              (someobject) =>
                someobject.brand_vaccine_id == found.brand_vaccine_id
            )
            .forEach((someobject) => (someobject.status = 1));
          this.setState((prevState) => ({
            form: {
              ...prevState.form,
            },
          }));
        }
      }
    }
  };

  handleFormChange(event, callback = null) {
    const target = event.target;
    let value =
      target.type === "number"
        ? target.value.replace(/\D/, "").replace("d", "")
        : target.type === "checkbox"
        ? target.checked
        : target.value;
    let name = target.name;
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

  handleTimeSlotChange(event, item) {
    const target = event.target;
    let value = Number(target.value.replace(/\D/, "").replace("d", ""));
    item.qty = value;
    this.setState((prevState) => ({ form: { ...prevState.form } }));
  }

  async submit() {
    if (this.state.isLoading) return;
    if (this.state.form.hospitalVal === "")
      return Swal.fire("Rumah Sakit wajib diisi");
    if (this.state.form.locationTypeVal === "")
      return Swal.fire("Tipe Lokasi wajib diisi");
    if (this.state.form.locationTypeVal === "PERUSAHAAN") {
      if (this.state.form.companyName === "")
        return Swal.fire("Nama Perusahaan wajib diisi");
      if (this.state.form.passcode === "")
        return Swal.fire("Passcode wajib diisi");
    }
    if (this.state.form.vaccineTypeVal === "")
      return Swal.fire("Tipe Vaksin wajib diisi");
    if (this.state.form.dateList.length === 0)
      return Swal.fire("Tanggal wajib dipilih");

    // FAJAR ADD => VALIDASI DOSIS
    let dosis = [
      this.state.form.vaccine1,
      this.state.form.vaccine2,
      this.state.form.vaccine3,
    ];
    let checker = dosis.every((v) => v === false);
    if (checker) return Swal.fire("Wajib pilih Dosis Vaksinasi");

    // FAJAR ADD => VALIDASI LOKASI VAKSIN SEBELUMNYA
    if (this.state.form.vaccine2 || this.state.form.vaccine3) {
      if (_.isEmpty(this.state.form.firstlocList)) {
        return Swal.fire("Wajib Pilih Lokasi Vaksinasi Sebelumnya");
      } else {
        let find_firstlocList = this.state.form.firstlocList.find(
          (x) => x.status === 1
        );

        if (find_firstlocList === undefined) {
          return Swal.fire("Wajib Pilih Lokasi Vaksinasi Sebelumnya");
        }
      }
    }

    let brand = this.getBrandName();
    if (brand === "") return Swal.fire("Wajib pilih merek vaksin");
    if (!this.state.form.wni && !this.state.form.wna)
      return Swal.fire("Wajib pilih Kewarganegaraan");
    let citizenship = "";
    if (this.state.form.wni) citizenship = "WNI";
    if (this.state.form.wna) citizenship = "WNA";
    if (this.state.form.wni && this.state.form.wna) citizenship = "ALL";
    this.setState({ isLoading: true });
    let formData = {
      location_vaccine_available: {
        brand_vaccine: brand,
        citizenship: citizenship,
        hospital_vaccine_notes: this.state.form.note,
        location_vaccine_id:
          this.state.form.hospitalVal === ""
            ? ""
            : this.state.form.hospitalList[this.state.form.hospitalVal]
                .location_vaccine_id,
        location_vaccine_type_id:
          this.state.form.vaccineTypeVal === ""
            ? ""
            : this.state.form.vaccineTypeList[this.state.form.vaccineTypeVal]
                .location_vaccine_type_id,
        type_vaccine:
          this.state.form.vaccineTypeVal === ""
            ? ""
            : this.state.form.vaccineTypeList[this.state.form.vaccineTypeVal]
                .vaccine_name,
        noted: this.state.form.note,
        status: this.state.form.status,
        is_first: this.state.form.vaccine1 ? "1" : "0",
        is_second: this.state.form.vaccine2 ? "1" : "0",
        is_third: this.state.form.vaccine3 ? "1" : "0",
        location_vaccine_available_id:
          this.state.editedVaccineSlot.location_vaccine_available_id,
        calendar: [],
      },
      company: {
        data_person_company_id:
          this.state.editedVaccineSlot.data_person_company_id,
        type_location: this.state.form.locationTypeVal,
        birthdate:
          this.state.form.locationTypeVal === "PERUSAHAAN" ? "2021-01-01" : "",
        brand_vaccine:
          this.state.form.locationTypeVal === "PERUSAHAAN" ? brand : "",
        citizenship:
          this.state.form.locationTypeVal === "PERUSAHAAN" ? citizenship : "",
        company_name:
          this.state.form.locationTypeVal === "PERUSAHAAN"
            ? this.state.form.companyName
            : "",
        location_vaccine_company:
          this.state.form.locationTypeVal === "PERUSAHAAN"
            ? this.state.form.hospitalList[this.state.form.hospitalVal].name
            : "",
        passcode:
          this.state.form.locationTypeVal === "PERUSAHAAN"
            ? this.state.form.passcode
            : "",
      },
    };
    for (let i = 0; i < this.state.form.dateList.length; i++) {
      let item = this.state.form.dateList[i];
      let dateSlot = {};
      dateSlot.location_vaccine_calendar_id = item.locationVaccineCalendarID;
      dateSlot.date = moment(item.date).format("YYYY-MM-DD");
      dateSlot.timeslot = [];
      dateSlot.status = item.status;
      for (let s = 0; s < item.slot.length; s++) {
        let subitem = item.slot[s];
        if (subitem.start === null || subitem.end === null) continue;
        dateSlot.timeslot.push({
          timeslot_id: subitem.timeslotID,
          timeslot_start_time: moment(subitem.start, "HH:mm").format("HH.mm"),
          timeslot_end_time: moment(subitem.end, "HH:mm").format("HH.mm"),
          max_slot: subitem.qty,
          status: subitem.status,
        });
      }
      formData.location_vaccine_available.calendar.push(dateSlot);
    }
    let response = await axios.put(
      `${Config.API_URL_2}/v2/admin_vaccine/update_slot_vaccine_and_type`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        await Swal.fire("Success", "Berhasil diubah", "success");
        document.getElementsByClassName("back")[0].click();
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  }

  getCategoryText() {
    let result = "";
    for (let i = 0; i < this.state.form.categoryList.length; i++) {
      let item = this.state.form.categoryList[i];
      if (item.status === 0) continue;
      if (result != "") result += ", ";
      result += item.profession;
    }
    return result;
  }

  async fetchCategoryList() {
    if (
      this.state.form.hospitalVal === "" ||
      this.state.form.vaccineTypeVal === ""
    )
      return;
    this.setState((prevState) => ({
      isLoading: true,
      form: {
        ...prevState.form,
        categoryList: [],
        categoryVal: "",
        categoryName: "",
      },
    }));
    let formData = {};
    formData.hospital_name =
      this.state.form.hospitalList[this.state.form.hospitalVal].name;
    formData.type_vaccine =
      this.state.form.vaccineTypeList[
        this.state.form.vaccineTypeVal
      ].vaccine_name;
    let response = await axios.post(
      `${Config.API_URL_2}/admin_vaccine/get_category`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        this.setState((prevState) => ({
          form: {
            ...prevState.form,
            categoryList: data.data,
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

  async addCategory() {
    if (this.state.isLoading) return;
    if (this.state.form.categoryName === "")
      return Swal.fire("Nama Kategori wajib diisi");
    this.setState({ isLoading: true });
    let formData = {};
    formData.location_vaccine_id =
      this.state.form.hospitalList[
        this.state.form.hospitalVal
      ].location_vaccine_id;
    formData.profession = this.state.form.categoryName;
    formData.type_vaccine =
      this.state.form.vaccineTypeList[
        this.state.form.vaccineTypeVal
      ].vaccine_name;
    let response = await axios.post(
      `${Config.API_URL_2}/admin_vaccine/add_category`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        await Swal.fire("Success", "Kategori Berhasil ditambahkan", "success");
        this.fetchCategoryList();
        // document.getElementById('category-close').click();
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  }

  async editCategory() {
    if (this.state.isLoading) return;
    this.setState({ isLoading: true });
    let formData = {};
    formData.location_vaccine_id =
      this.state.form.editedCategory.location_vaccine_id;
    formData.profession = this.state.form.editCategoryName;
    formData.type_vaccine = this.state.form.editedCategory.type_vaccine;
    formData.status = this.state.form.editedCategory.status;
    let response = await axios.post(
      `${Config.API_URL_2}/admin_vaccine/edit_category/${this.state.form.editedCategory.location_vaccine_profession_id}`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        await Swal.fire(
          "Success",
          "Status kategori berhasil diubah",
          "success"
        );
        this.state.form.editedCategory.profession =
          this.state.form.editCategoryName;
        this.setState((prevState) => ({
          form: { ...prevState.form, editedCategory: null },
        }));
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState((prevState) => ({
      form: { ...prevState.form },
      isLoading: false,
    }));
  }

  async deleteCategory(category) {
    if (this.state.isLoading) return;
    let confirm = await Swal.fire({
      title: "Hapus Kategori ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    });
    if (!confirm.value) return;
    this.setState({ isLoading: true });
    let formData = {};
    let response = await axios.post(
      `${Config.API_URL_2}/admin_vaccine/delete_category/${category.location_vaccine_profession_id}`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        await Swal.fire("Success", "Kategori berhasil dihapus", "success");
        this.fetchCategoryList();
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState((prevState) => ({
      form: { ...prevState.form },
      isLoading: false,
    }));
  }

  setEditCategory(category) {
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        editedCategory: category,
        editCategoryName: category.profession,
      },
    }));
  }

  async toggleCategoryStatus(category) {
    if (this.state.isLoading) return;
    this.setState({ isLoading: true });
    let formData = {};
    formData.location_vaccine_id = category.location_vaccine_id;
    formData.profession = category.profession;
    formData.type_vaccine = category.type_vaccine;
    formData.status = category.status === 1 ? 0 : 1;
    let response = await axios.post(
      `${Config.API_URL_2}/admin_vaccine/edit_category/${category.location_vaccine_profession_id}`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        await Swal.fire(
          "Success",
          "Status kategori berhasil diubah",
          "success"
        );
        category.status = category.status === 1 ? 0 : 1;
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState((prevState) => ({
      form: { ...prevState.form },
      isLoading: false,
    }));
  }

  getFirstlocText() {
    let result = "";
    for (let i = 0; i < this.state.form.firstlocList.length; i++) {
      let item = this.state.form.firstlocList[i];
      if (item.status === 0) continue;
      if (result != "") result += ", ";
      result += item.hospital_name;
    }
    return result;
  }

  async fetchFirstlocList() {
    if (this.state.form.hospitalVal === "") return;
    this.setState((prevState) => ({
      isLoading: true,
      form: {
        ...prevState.form,
        firstlocList: [],
        firstlocVal: "",
        firstlocName: "",
      },
    }));
    let locationVaccineID =
      this.state.form.hospitalList[this.state.form.hospitalVal]
        .location_vaccine_id;
    let response = await axios.get(
      `${Config.API_URL_2}/v2/admin_vaccine/get_location_list_by_id/${locationVaccineID}`,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        let list = data.data;
        for (let i = 0; i < list.length; i++) {
          let item = list[i];
          item.status = Number(item.status);
        }
        this.setState((prevState) => ({
          form: {
            ...prevState.form,
            firstlocList: list,
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

  async addFirstloc() {
    if (this.state.isLoading) return;
    if (this.state.form.firstlocName === "")
      return Swal.fire("Nama Lokasi Pertama wajib diisi");
    this.setState({ isLoading: true });
    let formData = {};
    formData.location_vaccine_id =
      this.state.form.hospitalList[
        this.state.form.hospitalVal
      ].location_vaccine_id;
    formData.hospital_name = this.state.form.firstlocName;
    formData.status = 1;

    let response = await axios({
      method: "post",
      url: `${Config.API_URL_2}/v2/admin_vaccine/location_list`,
      data: formData,
      headers: { token: this.state.admin.token },
    });

    try {
      let data = response.data;
      if (data.statusCode === 201) {
        await Swal.fire(
          "Success",
          "Lokasi Vaksin Pertama Berhasil ditambahkan",
          "success"
        );
        this.fetchFirstlocList();
        // document.getElementById('firstloc-close').click();
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  }

  async editFirstloc() {
    if (this.state.isLoading) return;
    this.setState({ isLoading: true });
    let formData = {};
    formData.location_vaccine_id =
      this.state.form.editedFirstloc.location_vaccine_id;
    formData.hospital_name = this.state.form.editFirstlocName;
    formData.status = this.state.form.editedFirstloc.status;
    let response = await axios.put(
      `${Config.API_URL_2}/v2/admin_vaccine/location_list/${this.state.form.editedFirstloc.location_vaccine_list_id}`,
      formData,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        await Swal.fire(
          "Success",
          "Status lokasi vaksin pertama berhasil diubah",
          "success"
        );
        this.state.form.editedFirstloc.hospital_name =
          this.state.form.editFirstlocName;
        this.setState((prevState) => ({
          form: { ...prevState.form, editedFirstloc: null },
        }));
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState((prevState) => ({
      form: { ...prevState.form },
      isLoading: false,
    }));
  }

  async deleteFirstloc(firstloc) {
    if (this.state.isLoading) return;
    let confirm = await Swal.fire({
      title: "Hapus Lokasi Vaksin Pertama ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    });
    if (!confirm.value) return;
    this.setState({ isLoading: true });
    let formData = {};

    let response = await axios({
      method: "delete",
      url: `${Config.API_URL_2}/v2/admin_vaccine/location_list/${firstloc.location_vaccine_list_id}`,
      data: {},
      headers: { token: this.state.admin.token },
    });

    try {
      let data = response.data;
      if (data.statusCode === 200) {
        await Swal.fire(
          "Success",
          "Lokasi Vaksin Pertama berhasil dihapus",
          "success"
        );
        this.fetchFirstlocList();
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState((prevState) => ({
      form: { ...prevState.form },
      isLoading: false,
    }));
  }

  setEditFirstloc(firstloc) {
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        editedFirstloc: firstloc,
        editFirstlocName: firstloc.hospital_name,
      },
    }));
  }

  async toggleFirstlocStatus(firstloc) {
    if (this.state.isLoading) return;
    this.setState({ isLoading: true });
    let formData = {};
    formData.location_vaccine_id = firstloc.location_vaccine_id;
    formData.hospital_name = firstloc.hospital_name;
    formData.status = firstloc.status === 1 ? 0 : 1;

    let response = await axios({
      method: "put",
      url: `${Config.API_URL_2}/v2/admin_vaccine/location_list/${firstloc.location_vaccine_list_id}`,
      data: {
        location_vaccine_id: firstloc.location_vaccine_id,
        hospital_name: firstloc.hospital_name,
        status: firstloc.status === 1 ? 0 : 1,
      },
      headers: { token: this.state.admin.token },
    });

    try {
      let data = response.data;
      if (data.statusCode === 200) {
        await Swal.fire(
          "Success",
          "Status lokasi vaksinasi pertama berhasil diubah",
          "success"
        );
        firstloc.status = firstloc.status === 1 ? 0 : 1;
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState((prevState) => ({
      form: { ...prevState.form },
      isLoading: false,
    }));
  }

  render() {
    console.log(this.state);
    return (
      <>
        <div className="standard-2-page">
          <div className="banner">
            <div className="title d-flex flex-column flex-md-row">
              <div className="flex-grow-1 align-self-center">
                <div className="left d-flex">
                  <NavLink to="/vaccine-slot">
                    <div className="back clickable align-self-center">
                      <svg
                        width="19"
                        height="16"
                        viewBox="0 0 19 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18.9999 6.99997H4.41394L9.70694 1.70697L8.29294 0.292969L0.585938 7.99997L8.29294 15.707L9.70694 14.293L4.41394 8.99997H18.9999V6.99997Z"
                          fill="#3E8CB9"
                        />
                      </svg>
                    </div>
                  </NavLink>
                  <div style={{ width: "12px" }}></div>
                  <div className="text flex-grow-1 align-self-center">
                    Ubah Slot Vaksin
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="standard-form">
            <div className="action">
              <button onClick={this.submit} className="add-button">
                Simpan
              </button>
            </div>

            <form autocomplete="off">
              <div className="d-flex flex-column flex-md-row">
                <div className="left flex-grow-1 flex-basis-0">
                  <div className="group">
                    <label>Nama Rumah Sakit</label>
                    <select
                      name="hospitalVal"
                      onChange={(e) =>
                        this.handleFormChange(e, () => {
                          this.getVaccineTypeList();
                        })
                      }
                      value={this.state.form.hospitalVal}
                    >
                      <option value="">-- Pilih Rumah Sakit --</option>
                      {this.state.form.hospitalList.map((item, index) => (
                        <option key={index} value={index}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="group">
                    <label>Tipe Lokasi</label>
                    <select
                      name="locationTypeVal"
                      onChange={(e) =>
                        this.handleFormChange(e, () => {
                          this.initDatePicker();
                          this.getVaccineTypeList();
                        })
                      }
                      value={this.state.form.locationTypeVal}
                    >
                      <option value="">-- Pilih Tipe Lokasi --</option>
                      <option value="PERUSAHAAN">Perusahaan</option>
                      <option value="UMUM">Umum</option>
                    </select>
                  </div>
                  {["PERUSAHAAN"].includes(this.state.form.locationTypeVal) && (
                    <div className="group">
                      <label>Nama Perusahaan</label>
                      <input
                        name="companyName"
                        type="text"
                        onChange={this.handleFormChange}
                        value={this.state.form.companyName}
                        placeholder="Tulis Nama Perusahaan"
                      />
                    </div>
                  )}
                  {["PERUSAHAAN"].includes(this.state.form.locationTypeVal) && (
                    <div className="group">
                      <label>Passcode</label>
                      <input
                        name="passcode"
                        type="text"
                        onChange={this.handleFormChange}
                        value={this.state.form.passcode}
                        placeholder="Tulis Passcode"
                      />
                    </div>
                  )}
                  {["PERUSAHAAN", "UMUM"].includes(
                    this.state.form.locationTypeVal
                  ) && (
                    <div className="group">
                      <label>
                        {this.state.form.locationTypeVal === "PERUSAHAAN"
                          ? "Nama"
                          : "Tipe"}{" "}
                        Vaksin
                      </label>
                      <select
                        name="vaccineTypeVal"
                        onChange={this.handleFormChange}
                        value={this.state.form.vaccineTypeVal}
                      >
                        <option value="">-- Pilih Tipe Vaksin --</option>
                        {this.state.form.vaccineTypeList.map(
                          (item, index) =>
                            item.type_location.toUpperCase() ===
                              this.state.form.locationTypeVal && (
                              <option key={index} value={index}>
                                {item.vaccine_name}
                              </option>
                            )
                        )}
                      </select>
                    </div>
                  )}
                  {this.state.form.locationTypeVal === "UMUM" &&
                    this.state.form.hospitalVal !== "" &&
                    this.state.form.locationTypeVal !== "" &&
                    this.state.form.vaccineTypeVal !== "" &&
                    this.state.form.vaccineTypeList[
                      this.state.form.vaccineTypeVal
                    ].is_category === 1 && (
                      <>
                        <div className="group">
                          <label>Kategori</label>
                          <div
                            className="placeholder clickable"
                            data-toggle="modal"
                            data-target="#category-modal"
                          >
                            {this.getCategoryText() === ""
                              ? "-- Pilih Kategori --"
                              : this.getCategoryText()}
                          </div>
                          <div className="modal fade" id="category-modal">
                            <div className="modal-dialog">
                              <div className="modal-content">
                                <div className="modal-body">
                                  <div className="d-flex justify-content-between">
                                    <div className="blue-title">
                                      Daftar Kategori
                                    </div>
                                    <div
                                      id="category-close"
                                      className="close"
                                      data-dismiss="modal"
                                    >
                                      Tutup
                                    </div>
                                  </div>
                                  <div className="d-flex">
                                    <div className="group text-left flex-grow-1 flex-basis-0">
                                      <label>Tambah kategori</label>
                                      <input
                                        name="categoryName"
                                        type="text"
                                        onChange={this.handleFormChange}
                                        value={this.state.form.categoryName}
                                        placeholder="Tulis Nama Kategori"
                                      />
                                    </div>
                                    <div
                                      style={{
                                        minWidth: "20px",
                                        minHeight: "20px",
                                      }}
                                    ></div>
                                    <div className="left flex-grow-1 flex-basis-0 align-self-end">
                                      <div className="group">
                                        <div
                                          onClick={this.addCategory}
                                          className="color-button new-button"
                                          style={{ cursor: "pointer" }}
                                        >
                                          Tambah
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="category-list">
                                    {this.state.form.categoryList.map(
                                      (item, index) => (
                                        <div
                                          key={index}
                                          className="category-item-wrapper"
                                        >
                                          <div className="category-item flex-grow-1">
                                            <div
                                              onClick={() =>
                                                this.toggleCategoryStatus(item)
                                              }
                                              className={`option-box ${
                                                item.status === 1
                                                  ? "active"
                                                  : ""
                                              }`}
                                            >
                                              ✓
                                            </div>
                                            <div
                                              style={{ minWidth: "12px" }}
                                            ></div>
                                            <div className="category-text">
                                              {item.profession}
                                            </div>
                                            <div
                                              style={{ minWidth: "12px" }}
                                            ></div>
                                            <div
                                              onClick={() =>
                                                this.setEditCategory(item)
                                              }
                                              className="category-edit-icon clickable"
                                            >
                                              <img
                                                src={`${Config.BASE_URL}/img/category-edit-icon.png`}
                                              />
                                            </div>
                                          </div>
                                          <div
                                            style={{ minWidth: "16px" }}
                                          ></div>
                                          <div
                                            onClick={() =>
                                              this.deleteCategory(item)
                                            }
                                            className="category-edit-icon align-self-center clickable"
                                          >
                                            <img
                                              src={`${Config.BASE_URL}/img/remove-timeslot-icon.png`}
                                            />
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                  {this.state.form.editedCategory !== null && (
                                    <>
                                      <div className="group text-left">
                                        <label>Ubah kategori</label>
                                        <input
                                          name="editCategoryName"
                                          type="text"
                                          onChange={this.handleFormChange}
                                          value={
                                            this.state.form.editCategoryName
                                          }
                                          placeholder="Tulis Nama Kategori"
                                        />
                                      </div>
                                      <div className="group">
                                        <div className="d-flex">
                                          <div className="left flex-grow-1">
                                            <div
                                              onClick={this.editCategory}
                                              className="color-button new-button"
                                              style={{ cursor: "pointer" }}
                                            >
                                              Ubah
                                            </div>
                                          </div>
                                          <div
                                            style={{
                                              minWidth: "20px",
                                              minHeight: "20px",
                                            }}
                                          ></div>
                                          <div className="right flex-grow-1">
                                            <div
                                              onClick={() =>
                                                this.setState((prevState) => ({
                                                  form: {
                                                    ...prevState.form,
                                                    editedCategory: null,
                                                    editCategoryName: "",
                                                  },
                                                }))
                                              }
                                              style={{ cursor: "pointer" }}
                                              className="red-outline-button new-button"
                                            >
                                              Batal
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                  <div className="group">
                                    <div className="d-flex">
                                      <div className="flex-grow-1">
                                        <div
                                          className="keep-button new-button"
                                          data-dismiss="modal"
                                          style={{ cursor: "pointer" }}
                                        >
                                          Simpan
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  {["PERUSAHAAN", "UMUM"].includes(
                    this.state.form.locationTypeVal
                  ) && (
                    <div className="group">
                      <label>Tanggal</label>
                      <input
                        type="text"
                        id="date-range"
                        placeholder="Pilih Tanggal"
                      />
                    </div>
                  )}
                </div>
                <div style={{ minWidth: "40px", minHeight: "20px" }}></div>
                <div className="right flex-grow-1 flex-basis-0">
                  {["PERUSAHAAN", "UMUM"].includes(
                    this.state.form.locationTypeVal
                  ) && (
                    <div className="group">
                      <label>Vaksinasi ke</label>
                      <div className="checkbox-wrapper">
                        <div
                          onClick={() =>
                            this.setState((prevState) => ({
                              form: {
                                ...prevState.form,
                                vaccine1: !this.state.form.vaccine1,
                              },
                            }))
                          }
                          className={`checkbox-option ${
                            this.state.form.vaccine1 ? "active" : ""
                          }`}
                        >
                          <div className="option-box">✓</div>
                          <div className="option-text">Pertama</div>
                        </div>
                        <div style={{ minWidth: "20px" }}></div>
                        <div
                          onClick={() =>
                            this.setState((prevState) => ({
                              form: {
                                ...prevState.form,
                                vaccine2: !this.state.form.vaccine2,
                              },
                            }))
                          }
                          className={`checkbox-option ${
                            this.state.form.vaccine2 ? "active" : ""
                          }`}
                        >
                          <div className="option-box">✓</div>
                          <div className="option-text">Kedua</div>
                        </div>

                        <div style={{ minWidth: "20px" }}></div>
                        <div
                          onClick={() =>
                            this.setState((prevState) => ({
                              form: {
                                ...prevState.form,
                                vaccine3: !this.state.form.vaccine3,
                              },
                            }))
                          }
                          className={`checkbox-option ${
                            this.state.form.vaccine3 ? "active" : ""
                          }`}
                        >
                          <div className="option-box">✓</div>
                          <div className="option-text">Ketiga</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {["PERUSAHAAN", "UMUM"].includes(
                    this.state.form.locationTypeVal
                  ) && (
                    <div className="group">
                      <label> Merek Vaksin (Untuk Slot)</label>
                      <div
                        className="placeholder clickable"
                        data-toggle="modal"
                        data-target="#brand-modal"
                      >
                        {this.getBrandName() === ""
                          ? "-- Pilih Merek Vaksin --"
                          : this.getBrandName()}
                      </div>
                      <div className="modal fade" id="brand-modal">
                        <div className="modal-dialog">
                          <div className="modal-content">
                            <div className="modal-body">
                              <div className="d-flex justify-content-between">
                                <div className="blue-title">
                                  Daftar Merek Vaksin
                                </div>
                                <div
                                  id="brand-close"
                                  className="close"
                                  data-dismiss="modal"
                                >
                                  Tutup
                                </div>
                              </div>
                              {/* <div className="group">
                          <div className="d-flex">
                            <div className="group text-left flex-grow-1 flex-basis-0">
                              <label>Tambah Merek Vaksin</label>
                              <input name="brandName" type="text" onChange={this.handleFormChange} value={this.state.form.brandName} placeholder="Tulis Nama Merek Vaksin"/>
                            </div>
                            <div style={{minWidth:'20px',minHeight:'20px'}}></div>
                            <div className="group align-self-end flex-grow-1 flex-basis-0">
                              <button onClick={this.addBrand} className="color-button">Tambah</button>
                            </div>
                          </div>
                        </div> */}
                              <div className="brand-list">
                                {this.state.form.vaccineBrandList.map(
                                  (item, index) => (
                                    <div
                                      key={index}
                                      className="brand-item-wrapper"
                                    >
                                      <div className="brand-item flex-grow-1">
                                        <div
                                          onClick={() =>
                                            this.toggleBrandStatus(item)
                                          }
                                          className={`option-box ${
                                            item.status === 1 ? "active" : ""
                                          }`}
                                        >
                                          ✓
                                        </div>
                                        <div style={{ minWidth: "12px" }}></div>
                                        <div className="brand-text">
                                          {item.brand_vaccine}
                                        </div>
                                        {/* <div style={{minWidth:'12px'}}></div> */}
                                        {/* <div onClick={() => this.setEditBrand(item)} className="brand-edit-icon clickable"><img src={`${Config.BASE_URL}/img/category-edit-icon.png`} /></div> */}
                                      </div>
                                      {/* <div style={{minWidth:'16px'}}></div> */}
                                      {/* <div onClick={() => this.deleteBrand(item)} className="category-edit-icon align-self-center clickable"><img src={`${Config.BASE_URL}/img/remove-timeslot-icon.png`} /></div> */}
                                    </div>
                                  )
                                )}
                              </div>
                              {this.state.form.editedBrand !== null && (
                                <>
                                  <div className="group text-left">
                                    <label>Ubah Merek Vaksin</label>
                                    <input
                                      name="editBrandName"
                                      type="text"
                                      onChange={this.handleFormChange}
                                      value={this.state.form.editBrandName}
                                      placeholder="Tulis Nama Merek Vaksin"
                                    />
                                  </div>
                                  <div className="group">
                                    <div className="d-flex">
                                      <div className="left flex-grow-1">
                                        <div
                                          onClick={this.editBrand}
                                          className="color-button"
                                          style={{ cursor: "pointer" }}
                                        >
                                          Ubah
                                        </div>
                                      </div>
                                      <div
                                        style={{
                                          minWidth: "20px",
                                          minHeight: "20px",
                                        }}
                                      ></div>
                                      <div className="right flex-grow-1">
                                        <div
                                          onClick={() =>
                                            this.setState((prevState) => ({
                                              form: {
                                                ...prevState.form,
                                                editedBrand: null,
                                                editBrandName: "",
                                              },
                                            }))
                                          }
                                          style={{ cursor: "pointer" }}
                                          className="red-outline-button"
                                        >
                                          Batal
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                              <div className="d-flex">
                                <div className="flex-grow-1">
                                  <div
                                    className="keep-button new-button"
                                    data-dismiss="modal"
                                    style={{ cursor: "pointer" }}
                                  >
                                    Simpan
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {["PERUSAHAAN", "UMUM"].includes(
                    this.state.form.locationTypeVal
                  ) && (
                    <div className="group">
                      <label>Kewarganegaraan</label>
                      <div className="checkbox-wrapper">
                        <div
                          onClick={() =>
                            this.setState((prevState) => ({
                              form: {
                                ...prevState.form,
                                wni: !this.state.form.wni,
                              },
                            }))
                          }
                          className={`checkbox-option ${
                            this.state.form.wni ? "active" : ""
                          }`}
                        >
                          <div className="option-box">✓</div>
                          <div className="option-text">WNI</div>
                        </div>
                        <div style={{ minWidth: "20px" }}></div>
                        <div
                          onClick={() =>
                            this.setState((prevState) => ({
                              form: {
                                ...prevState.form,
                                wna: !this.state.form.wna,
                              },
                            }))
                          }
                          className={`checkbox-option ${
                            this.state.form.wna ? "active" : ""
                          }`}
                        >
                          <div className="option-box">✓</div>
                          <div className="option-text">WNA</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {["PERUSAHAAN", "UMUM"].includes(
                    this.state.form.locationTypeVal
                  ) &&
                    this.state.form.vaccine3 && (
                      <div className="group">
                        <label> Merek Vaksin Sebelumnya yang diizinkan</label>
                        <div
                          className="placeholder clickable"
                          data-toggle="modal"
                          data-target="#brand-modal-second"
                        >
                          {this.getBrandNameSecond() === ""
                            ? "-- Pilih Merek Vaksin Sebelumnya --"
                            : this.getBrandNameSecond()}
                        </div>
                        <div className="modal fade" id="brand-modal-second">
                          <div className="modal-dialog">
                            <div className="modal-content">
                              <div className="modal-body">
                                <div className="d-flex justify-content-between">
                                  <div className="blue-title">
                                    Daftar Merek Vaksin Sebelumnya
                                  </div>
                                  <div
                                    id="brand-close"
                                    className="close"
                                    data-dismiss="modal"
                                  >
                                    Tutup
                                  </div>
                                </div>

                                <div className="brand-list">
                                  {this.state.form.vaccineBrandListSecond.map(
                                    (item, index) => (
                                      <div
                                        key={index}
                                        className="brand-item-wrapper"
                                      >
                                        <div className="brand-item flex-grow-1">
                                          <div
                                            onClick={() =>
                                              this.toggleBrandStatusSecond(item)
                                            }
                                            className={`option-box ${
                                              item.status === 1 ? "active" : ""
                                            }`}
                                          >
                                            ✓
                                          </div>
                                          <div
                                            style={{ minWidth: "12px" }}
                                          ></div>
                                          <div className="brand-text">
                                            {item.brand_vaccine}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>

                                <div className="d-flex">
                                  <div className="flex-grow-1">
                                    <div
                                      className="keep-button new-button"
                                      data-dismiss="modal"
                                      style={{ cursor: "pointer" }}
                                    >
                                      Simpan
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {["PERUSAHAAN", "UMUM"].includes(
                    this.state.form.locationTypeVal
                  ) &&
                    (this.state.form.vaccine2 || this.state.form.vaccine3) && (
                      <>
                        <div className="group">
                          <label>Lokasi Vaksin Sebelumnya yang diizinkan</label>
                          <div
                            className="placeholder clickable"
                            data-toggle="modal"
                            data-target="#firstloc-modal"
                          >
                            {this.getFirstlocText() === ""
                              ? "-- Pilih Lokasi --"
                              : this.getFirstlocText()}
                          </div>
                          <div className="modal fade" id="firstloc-modal">
                            <div className="modal-dialog">
                              <div className="modal-content">
                                <div className="modal-body">
                                  <div className="d-flex justify-content-between">
                                    <div className="blue-title">
                                      Daftar Lokasi Sebelumnya
                                    </div>
                                    <div
                                      id="firstloc-close"
                                      className="close"
                                      data-dismiss="modal"
                                    >
                                      Tutup
                                    </div>
                                  </div>
                                  <div className="group">
                                    <div className="d-flex">
                                      <div className="group text-left flex-grow-1 flex-basis-0">
                                        <label>Tambah lokasi sebelumnya</label>
                                        <input
                                          name="firstlocName"
                                          type="text"
                                          onChange={this.handleFormChange}
                                          value={this.state.form.firstlocName}
                                          placeholder="Tulis Nama Lokasi Sebelumnya"
                                        />
                                      </div>
                                      <div
                                        style={{
                                          minWidth: "20px",
                                          minHeight: "20px",
                                        }}
                                      ></div>
                                      <div className="left align-self-end flex-grow-1 flex-basis-0">
                                        <div className="group">
                                          <div
                                            onClick={this.addFirstloc}
                                            className="color-button new-button"
                                            style={{ cursor: "pointer" }}
                                          >
                                            Tambah
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="firstloc-list">
                                    {this.state.form.firstlocList.map(
                                      (item, index) => (
                                        <div
                                          key={index}
                                          className="firstloc-item-wrapper"
                                        >
                                          <div className="firstloc-item flex-grow-1">
                                            <div
                                              onClick={() =>
                                                this.toggleFirstlocStatus(item)
                                              }
                                              className={`option-box ${
                                                item.status === 1
                                                  ? "active"
                                                  : ""
                                              }`}
                                            >
                                              ✓
                                            </div>
                                            <div
                                              style={{ minWidth: "12px" }}
                                            ></div>
                                            <div className="firstloc-text">
                                              {item.hospital_name}
                                            </div>
                                            <div
                                              style={{ minWidth: "12px" }}
                                            ></div>
                                            <div
                                              onClick={() =>
                                                this.setEditFirstloc(item)
                                              }
                                              className="firstloc-edit-icon clickable"
                                            >
                                              <img
                                                src={`${Config.BASE_URL}/img/category-edit-icon.png`}
                                              />
                                            </div>
                                          </div>
                                          <div
                                            style={{ minWidth: "16px" }}
                                          ></div>
                                          <div
                                            onClick={() =>
                                              this.deleteFirstloc(item)
                                            }
                                            className="firstloc-edit-icon align-self-center clickable"
                                          >
                                            <img
                                              src={`${Config.BASE_URL}/img/remove-timeslot-icon.png`}
                                            />
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                  {this.state.form.editedFirstloc !== null && (
                                    <>
                                      <div className="group text-left">
                                        <label>Ubah Lokasi Sebelumnya</label>
                                        <input
                                          name="editFirstlocName"
                                          type="text"
                                          onChange={this.handleFormChange}
                                          value={
                                            this.state.form.editFirstlocName
                                          }
                                          placeholder="Tulis Nama Lokasi Sebelumnya"
                                        />
                                      </div>
                                      <div className="group">
                                        <div className="d-flex">
                                          <div className="left flex-grow-1">
                                            <div
                                              onClick={this.editFirstloc}
                                              className="color-button new-button"
                                              style={{ cursor: "pointer" }}
                                            >
                                              Ubah
                                            </div>
                                          </div>
                                          <div
                                            style={{
                                              minWidth: "20px",
                                              minHeight: "20px",
                                            }}
                                          ></div>
                                          <div className="right flex-grow-1">
                                            <div
                                              onClick={() =>
                                                this.setState((prevState) => ({
                                                  form: {
                                                    ...prevState.form,
                                                    editedFirstloc: null,
                                                    editFirstlocName: "",
                                                  },
                                                }))
                                              }
                                              className="red-outline-button new-button"
                                              style={{ cursor: "pointer" }}
                                            >
                                              Batal
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                  <div className="d-flex">
                                    <div className="flex-grow-1">
                                      <div
                                        className="keep-button new-button"
                                        data-dismiss="modal"
                                        style={{ cursor: "pointer" }}
                                      >
                                        Simpan
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                  {["PERUSAHAAN", "UMUM"].includes(
                    this.state.form.locationTypeVal
                  ) && (
                    <div className="group">
                      <label>Note</label>
                      <textarea
                        name="note"
                        onChange={this.handleFormChange}
                        value={this.state.form.note}
                        rows="6"
                      ></textarea>
                    </div>
                  )}

                  {["PERUSAHAAN", "UMUM"].includes(
                    this.state.form.locationTypeVal
                  ) && (
                    <div className="group">
                      <label>Status</label>
                      <select
                        name="status"
                        onChange={this.handleFormChange}
                        value={this.state.form.status}
                      >
                        <option value="1">Enabled</option>
                        <option value="0">Disabled</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
              {["PERUSAHAAN", "UMUM"].includes(
                this.state.form.locationTypeVal
              ) && (
                <div className="date-slot">
                  <div className="container">
                    <div className="label">Atur Jam</div>
                    {this.state.form.regularDays.map((item, index) => (
                      <div key={item.key} className="timeslot">
                        <div>
                          <TimePicker
                            showSecond={false}
                            allowEmpty={false}
                            onChange={(value) =>
                              (item.start = moment(value).format("HH:mm"))
                            }
                          />
                        </div>
                        <div className="align-self-center mx-2">-</div>
                        <div>
                          <TimePicker
                            showSecond={false}
                            allowEmpty={false}
                            onChange={(value) =>
                              (item.end = moment(value).format("HH:mm"))
                            }
                          />
                        </div>
                        <div className="align-self-center mx-2">=</div>
                        <div>
                          <input
                            onChange={(e) => this.handleTimeSlotChange(e, item)}
                            type="number"
                            value={item.qty}
                          />
                        </div>
                        <div
                          onClick={() => this.removeRegularDaysRow(item)}
                          className="align-self-center px-2 clickable"
                        >
                          <img
                            src={`${Config.BASE_URL}/img/remove-timeslot-icon.png`}
                            alt=""
                          />
                        </div>
                      </div>
                    ))}
                    <div
                      onClick={this.addRegularDaysRow}
                      className="timeslot-add clickable"
                    >
                      <div className="text-center">
                        <img
                          src={`${Config.BASE_URL}/img/timeslot-add-icon.png`}
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="apply-button">
                      <div
                        onClick={this.applyRegularSlot}
                        style={{ cursor: "pointer" }}
                      >
                        Terapkan Semua
                      </div>
                    </div>
                  </div>

                  <div className="container">
                    <div className="dateslot-list">
                      {this.state.form.dateList.map((item, index) => (
                        <div key={moment(item.date).format("DD-MM-YYYY")}>
                          <div className="d-flex">
                            <div
                              data-toggle="collapse"
                              data-target={`#date-slot-${index + 1}`}
                              className="dateslot clickable"
                            >
                              <div>
                                {moment(item.date).format("DD MMM YYYY")}
                              </div>
                              <div>
                                <img
                                  src={`${Config.BASE_URL}/img/down-icon.png`}
                                  alt=""
                                />
                              </div>
                            </div>
                            <div
                              onClick={() =>
                                this.removeRegularDaySlot(this.state.form, item)
                              }
                              className="align-self-center px-2 clickable"
                            >
                              <img
                                src={`${Config.BASE_URL}/img/remove-timeslot-icon.png`}
                                alt=""
                              />
                            </div>
                            <div
                              onClick={() => this.toggleStatus(item)}
                              className="align-self-center px-2 clickable"
                            >
                              {item.status === 1 && (
                                <img
                                  src={`${Config.BASE_URL}/img/disable-timeslot-icon.png`}
                                  alt=""
                                />
                              )}
                              {item.status === 0 && (
                                <div className="open-status">Buka</div>
                              )}
                            </div>
                          </div>

                          <div
                            id={`date-slot-${index + 1}`}
                            className="collapse"
                          >
                            {item.slot.map((subitem, index) => (
                              <div key={subitem.key} className="timeslot">
                                <div>
                                  <TimePicker
                                    showSecond={false}
                                    allowEmpty={false}
                                    defaultValue={moment(
                                      subitem.start,
                                      "HH:mm"
                                    )}
                                    onChange={(value) =>
                                      (subitem.start =
                                        moment(value).format("HH:mm"))
                                    }
                                  />
                                </div>
                                <div className="align-self-center mx-2">-</div>
                                <div>
                                  <TimePicker
                                    showSecond={false}
                                    allowEmpty={false}
                                    defaultValue={moment(subitem.end, "HH:mm")}
                                    onChange={(value) =>
                                      (subitem.end =
                                        moment(value).format("HH:mm"))
                                    }
                                  />
                                </div>
                                <div className="align-self-center mx-2">=</div>
                                <div>
                                  <input
                                    onChange={(e) =>
                                      this.handleTimeSlotChange(e, subitem)
                                    }
                                    type="number"
                                    value={subitem.qty}
                                  />
                                </div>
                                <div
                                  onClick={() =>
                                    this.removeSlotRegularDaysRow(item, subitem)
                                  }
                                  className="align-self-center px-2 clickable"
                                >
                                  <img
                                    src={`${Config.BASE_URL}/img/remove-timeslot-icon.png`}
                                    alt=""
                                  />
                                </div>
                                <div
                                  onClick={() => this.toggleStatus(subitem)}
                                  className="align-self-center px-2 clickable"
                                >
                                  {subitem.status === 1 && (
                                    <img
                                      src={`${Config.BASE_URL}/img/disable-timeslot-icon.png`}
                                      alt=""
                                    />
                                  )}
                                  {subitem.status === 0 && (
                                    <div className="open-status">Buka</div>
                                  )}
                                </div>
                              </div>
                            ))}
                            <div
                              onClick={() => this.addSlotRegularDaysRow(item)}
                              className="timeslot-add clickable"
                            >
                              <div className="text-center">
                                <img
                                  src={`${Config.BASE_URL}/img/timeslot-add-icon.png`}
                                  alt=""
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div>
                        <div className="d-flex">
                          <div
                            onClick={() =>
                              document
                                .getElementById("single-date-range")
                                .click()
                            }
                            className="dateslot-add clickable"
                          >
                            <div className="align-self-center">
                              <img
                                src={`${Config.BASE_URL}/img/timeslot-add-icon.png`}
                                alt=""
                              />
                            </div>
                            <div
                              style={{ minWidth: "10px", minHeight: "10px" }}
                            ></div>
                            <div className="align-self-center">Tambah Hari</div>
                          </div>
                          <div
                            style={{ minWidth: "46px", minHeight: "46px" }}
                          ></div>
                        </div>
                        <input
                          type="text"
                          id="single-date-range"
                          placeholder="Pilih Tanggal"
                          style={{
                            height: "2px",
                            visibility: "hidden",
                            position: "absolute",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
          {this.state.isLoading && <div className="loader"></div>}
        </div>
      </>
    );
  }
}

export default VaccineSlotEdit;
