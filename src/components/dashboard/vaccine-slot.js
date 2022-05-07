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
import { Link } from "react-router-dom";
import * as Config from "./../../Config";
moment.locale("id");

const Swal2 = withReactContent(Swal);

class VaccineSlot extends React.Component {
  constructor(props) {
    super(props);
    let admin = JSON.parse(localStorage.getItem("admin"));
    if (admin === null) window.location.reload();
    this.state = {
      isLoading: false,
      admin: admin,
      form: {
        hospitalList: [],
        hospitalVal: "",
        locationTypeVal: "",
      },
      vaccineSlot: {
        list: [],
        val: null,
      },
    };
    this.handleFormChange = this.handleFormChange.bind(this);
    this.getListSlotTypeVaccine = this.getListSlotTypeVaccine.bind(this);
  }

  componentDidMount() {
    this.getListSlotTypeVaccine();
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

  async getListSlotTypeVaccine() {
    if (this.state.isLoading) return;
    this.setState({ isLoading: true });
    let response = await axios.get(
      `${Config.API_URL_2}/v2/admin_vaccine/list_slot_and_type_vaccine`,
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        this.setState((prevState) => ({
          vaccineSlot: { list: data.data, val: null },
        }));
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  }

  async toggleCategory(item, category) {
    if (this.state.isLoading) return;
    this.setState({ isLoading: true });
    let response = await axios.post(
      `${Config.API_URL_2}/admin_vaccine/${
        category === 1
          ? "enable_category_type_vaccine"
          : "disable_category_type_vaccine"
      }/${item.location_vaccine_available_id}`,
      {},
      { headers: { token: this.state.admin.token } }
    );
    try {
      let data = response.data;
      if (data.statusCode === 200) {
        item.is_category = category;
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Unable to connect to server", "error");
    }
    this.setState({ isLoading: false });
  }

  render() {
    for (let i = 0; i < this.state.vaccineSlot.list.length; i++) {
      let item = this.state.vaccineSlot.list[i];
      item.vaccine_ke = "-";
      if (item.vaccine_status === "PERTAMA") item.vaccine_ke = "Pertama";
      if (item.vaccine_status === "KEDUA") item.vaccine_ke = "Kedua";
      if (item.vaccine_status === "KETIGA") item.vaccine_ke = "Ketiga";
      if (item.vaccine_status === "PERTAMA, KEDUA")
        item.vaccine_ke = "Pertama, Kedua";
      if (item.vaccine_status === "PERTAMA, KETIGA")
        item.vaccine_ke = "Pertama, Ketiga";
      if (item.vaccine_status === "KEDUA, KETIGA")
        item.vaccine_ke = "Kedua, Ketiga";
      if (item.vaccine_status === "PERTAMA, KEDUA, KETIGA")
        item.vaccine_ke = "Pertama, Kedua, Ketiga";
      if (item.status === 1) item.status_string = "Enable";
      if (item.status === 0) item.status_string = "Disable";
    }
    let thead = [
      {
        label: "Nama Rumah Sakit",
        name: "location_vaccine_name",
        options: {
          sort: true,
          filter: true,
          customBodyRenderLite: (index) => (
            <div className="no-wrap">
              {this.state.vaccineSlot.list[index].location_vaccine_name}
            </div>
          ),
          customHeadRender: (columnMeta, handleToggleColumn, sortOrder) => {
            let orderIcon = <i className="fa fa-sort"></i>;
            if (sortOrder.name === String(columnMeta?.name)) {
              if (sortOrder.direction === "asc")
                orderIcon = <i className="fa fa-sort-asc"></i>;
              else orderIcon = <i className="fa fa-sort-desc"></i>;
            }
            return (
              <th
                onClick={() => handleToggleColumn(columnMeta?.index)}
                className="no-wrap clickable"
              >
                {String(columnMeta?.label)}&ensp; {orderIcon}
              </th>
            );
          },
        },
      },
      {
        label: "Tipe Lokasi",
        name: "type_location",
        options: {
          sort: true,
          filter: true,
          customBodyRenderLite: (index) => (
            <div className="no-wrap">
              {this.state.vaccineSlot.list[index].type_location}
            </div>
          ),
          customHeadRender: (columnMeta, handleToggleColumn, sortOrder) => {
            let orderIcon = <i className="fa fa-sort"></i>;
            if (sortOrder.name === String(columnMeta?.name)) {
              if (sortOrder.direction === "asc")
                orderIcon = <i className="fa fa-sort-asc"></i>;
              else orderIcon = <i className="fa fa-sort-desc"></i>;
            }
            return (
              <th
                onClick={() => handleToggleColumn(columnMeta?.index)}
                className="no-wrap clickable"
              >
                {String(columnMeta?.label)}&ensp; {orderIcon}
              </th>
            );
          },
        },
      },
      {
        label: "Tipe Vaksin",
        name: "type_vaccine",
        options: {
          sort: true,
          filter: true,
          customBodyRenderLite: (index) => (
            <div className="no-wrap">
              {this.state.vaccineSlot.list[index].type_vaccine}
            </div>
          ),
          customHeadRender: (columnMeta, handleToggleColumn, sortOrder) => {
            let orderIcon = <i className="fa fa-sort"></i>;
            if (sortOrder.name === String(columnMeta?.name)) {
              if (sortOrder.direction === "asc")
                orderIcon = <i className="fa fa-sort-asc"></i>;
              else orderIcon = <i className="fa fa-sort-desc"></i>;
            }
            return (
              <th
                onClick={() => handleToggleColumn(columnMeta?.index)}
                className="no-wrap clickable"
              >
                {String(columnMeta?.label)}&ensp; {orderIcon}
              </th>
            );
          },
        },
      },
      {
        label: "Vaksinasi ke",
        name: "vaccine_ke",
        options: {
          sort: true,
          filter: true,
          customBodyRenderLite: (index) => (
            <div className="no-wrap">
              {this.state.vaccineSlot.list[index].vaccine_ke}
            </div>
          ),
          customHeadRender: (columnMeta, handleToggleColumn, sortOrder) => {
            let orderIcon = <i className="fa fa-sort"></i>;
            if (sortOrder.name === String(columnMeta?.name)) {
              if (sortOrder.direction === "asc")
                orderIcon = <i className="fa fa-sort-asc"></i>;
              else orderIcon = <i className="fa fa-sort-desc"></i>;
            }
            return (
              <th
                onClick={() => handleToggleColumn(columnMeta?.index)}
                className="no-wrap clickable"
              >
                {String(columnMeta?.label)}&ensp; {orderIcon}
              </th>
            );
          },
        },
      },
      {
        label: "Merek Vaksinasi",
        name: "brand_vaccine",
        options: {
          sort: true,
          filter: true,
          customBodyRenderLite: (index) => (
            <div className="no-wrap">
              {this.state.vaccineSlot.list[index].brand_vaccine}
            </div>
          ),
          customHeadRender: (columnMeta, handleToggleColumn, sortOrder) => {
            let orderIcon = <i className="fa fa-sort"></i>;
            if (sortOrder.name === String(columnMeta?.name)) {
              if (sortOrder.direction === "asc")
                orderIcon = <i className="fa fa-sort-asc"></i>;
              else orderIcon = <i className="fa fa-sort-desc"></i>;
            }
            return (
              <th
                onClick={() => handleToggleColumn(columnMeta?.index)}
                className="no-wrap clickable"
              >
                {String(columnMeta?.label)}&ensp; {orderIcon}
              </th>
            );
          },
        },
      },
      {
        label: "Kewarganegaraan",
        name: "citizenship",
        options: {
          sort: true,
          filter: true,
          customBodyRenderLite: (index) => (
            <div className="no-wrap">
              {this.state.vaccineSlot.list[index].citizenship}
            </div>
          ),
          customHeadRender: (columnMeta, handleToggleColumn, sortOrder) => {
            let orderIcon = <i className="fa fa-sort"></i>;
            if (sortOrder.name === String(columnMeta?.name)) {
              if (sortOrder.direction === "asc")
                orderIcon = <i className="fa fa-sort-asc"></i>;
              else orderIcon = <i className="fa fa-sort-desc"></i>;
            }
            return (
              <th
                onClick={() => handleToggleColumn(columnMeta?.index)}
                className="no-wrap clickable"
              >
                {String(columnMeta?.label)}&ensp; {orderIcon}
              </th>
            );
          },
        },
      },
      {
        label: "Status",
        name: "status_string",
        options: {
          sort: true,
          filter: true,
          customBodyRenderLite: (index) => (
            <div className="no-wrap">
              {this.state.vaccineSlot.list[index].status === 1
                ? "Enable"
                : "Disable"}
            </div>
          ),
          customHeadRender: (columnMeta, handleToggleColumn, sortOrder) => {
            let orderIcon = <i className="fa fa-sort"></i>;
            if (sortOrder.name === String(columnMeta?.name)) {
              if (sortOrder.direction === "asc")
                orderIcon = <i className="fa fa-sort-asc"></i>;
              else orderIcon = <i className="fa fa-sort-desc"></i>;
            }
            return (
              <th
                onClick={() => handleToggleColumn(columnMeta?.index)}
                className="no-wrap clickable"
              >
                {String(columnMeta?.label)}&ensp; {orderIcon}
              </th>
            );
          },
        },
      },
      {
        label: "",
        name: "",
        options: {
          sort: false,
          filter: false,
          viewColumns: false,
          customBodyRenderLite: (index) => (
            <NavLink
              to={`/vaccine-slot-edit?location_vaccine_id=${
                this.state.vaccineSlot.list[index].location_vaccine_id
              }&type_vaccine=${encodeURIComponent(
                this.state.vaccineSlot.list[index].type_vaccine
              )}&vaccine_status=${
                this.state.vaccineSlot.list[index].vaccine_status
              }&brand_vaccine=${
                this.state.vaccineSlot.list[index].brand_vaccine
              }&location_vaccine_available_id=${encodeURIComponent(
                JSON.stringify(
                  this.state.vaccineSlot.list[index]
                    .location_vaccine_available_id
                )
              )}&type_location=${
                this.state.vaccineSlot.list[index].type_location
              }&citizenship=${this.state.vaccineSlot.list[index].citizenship}`}
            >
              <div className="detail-text clickable">Ubah</div>
            </NavLink>
          ),
        },
      },
    ];
    return (
      <>
        <div className="standard-page">
          <div className="d-flex flex-column flex-md-row justify-content-between">
            <div className="action-bar">
              <div className="title">Daftar Slot Vaksin</div>
              <NavLink to="/vaccine-slot-create">
                <button className="blue-action-button">+ Tambah</button>
              </NavLink>
            </div>
          </div>
          {this.state.isLoading && <div className="loader"></div>}
          <div className="primary-table">
            <MUIDataTable
              columns={thead}
              data={this.state.vaccineSlot.list}
              options={{
                selectableRows: "none",
                responsive: "standard",
                elevation: 0,
                download: false,
                rowsPerPage: 6,
                rowsPerPageOptions: [],
              }}
            />
          </div>
        </div>
      </>
    );
  }
}

export default VaccineSlot;
