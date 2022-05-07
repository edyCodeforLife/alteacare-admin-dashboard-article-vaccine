import React from 'react';
import { BrowserRouter as Router, Switch, Route, NavLink } from "react-router-dom";
import SideBar from './../components/sidebar';
import TopBar from './../components/topbar';
import ChangePassword from './../components/dashboard/change-password';
import ResetPassword from './../components/dashboard/reset-password';
import PatientData from './../components/dashboard/patient-data';
import HospitalAccount from './../components/dashboard/hospital-account';
import HospitalAccountCreate from './../components/dashboard/hospital-account-create';
import HospitalAccountEdit from './../components/dashboard/hospital-account-edit';
import VaccineType from './../components/dashboard/vaccine-type';
import VaccineTypeCreate from './../components/dashboard/vaccine-type-create';
import VaccineTypeEdit from './../components/dashboard/vaccine-type-edit';
import VaccineSlot from './../components/dashboard/vaccine-slot';
import VaccineSlotCreate from './../components/dashboard/vaccine-slot-create';
import VaccineSlotEdit from './../components/dashboard/vaccine-slot-edit';
import SlotMonitoring from './../components/dashboard/slot-monitoring';
import SlotMonitoringDetail from './../components/dashboard/slot-monitoring-detail';
import Admin from './../components/dashboard/admin';
import AdminCreate from './../components/dashboard/admin-create';
import AdminEdit from './../components/dashboard/admin-edit';
import ArticleList from './../components/dashboard/article-list';
import ArticleListCreate from './../components/dashboard/article-list-create';
import ArticleListEdit from './../components/dashboard/article-list-edit';
import ArticleMap from './../components/dashboard/article-map';
import ArticleMapCreate from './../components/dashboard/article-map-create';
import ArticleMapEdit from './../components/dashboard/article-map-edit';
import ArticleMapCategory from './../components/dashboard/article-map-category';
import EbookList from './../components/dashboard/ebook-list';
import EbookListCreate from './../components/dashboard/ebook-list-create';
import EbookListEdit from './../components/dashboard/ebook-list-edit';
import SubscriberList from './../components/dashboard/subscriber-list';
import SubscriberListCreate from './../components/dashboard/subscriber-list-create';
import SubscriberListEdit from './../components/dashboard/subscriber-list-edit';
import HospitalVaccine from './../components/dashboard/hospital-vaccine';
import HospitalVaccineCreate from './../components/dashboard/hospital-vaccine-create';
import HospitalVaccineEdit from './../components/dashboard/hospital-vaccine-edit';
import Kwitansi from './../components/dashboard/kwitansi';
import Information from './../components/dashboard/information';
import AddInformation from './../components/dashboard/add-information';
import EditInformation from './../components/dashboard/edit-information';
import Vaccine from './../components/dashboard/vaccine';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showMenu: false,
      admin: JSON.parse(localStorage.getItem("admin")),
    };
    this.toggleMenu = this.toggleMenu.bind(this);
    console.log(this.state.admin);
  }

  toggleMenu() {
    this.setState({
      showMenu: !this.state.showMenu,
    });
  }

  renderSuperAdmin() {
    return (
      <div className="page-content container-fluid flex-grow-1 px-0">
      <Switch>
        {/* New Vaccine */}
        <Route path="/patient-data">
          <PatientData></PatientData>
        </Route>
        <Route path="/hospital-account">
          <HospitalAccount></HospitalAccount>
        </Route>
        <Route path="/hospital-account-create">
          <HospitalAccountCreate></HospitalAccountCreate>
        </Route>
        <Route path="/hospital-account-edit/:id">
          <HospitalAccountEdit></HospitalAccountEdit>
        </Route>
        <Route path="/vaccine-type">
          <VaccineType></VaccineType>
        </Route>
        <Route path="/vaccine-type-create">
          <VaccineTypeCreate></VaccineTypeCreate>
        </Route>
        <Route path="/vaccine-type-edit/:id">
          <VaccineTypeEdit></VaccineTypeEdit>
        </Route>
        <Route path="/hospital-vaccine">
          <HospitalVaccine></HospitalVaccine>
        </Route>
        <Route path="/hospital-vaccine-create">
          <HospitalVaccineCreate></HospitalVaccineCreate>
        </Route>
        <Route path="/hospital-vaccine-edit/:id">
          <HospitalVaccineEdit></HospitalVaccineEdit>
        </Route>
        <Route path="/vaccine-slot">
          <VaccineSlot></VaccineSlot>
        </Route>
        <Route path="/vaccine-slot-create">
          <VaccineSlotCreate></VaccineSlotCreate>
        </Route>
        <Route path="/vaccine-slot-edit">
          <VaccineSlotEdit></VaccineSlotEdit>
        </Route>
        <Route path="/slot-monitoring">
          <SlotMonitoring></SlotMonitoring>
        </Route>
        <Route path="/slot-monitoring-detail">
          <SlotMonitoringDetail></SlotMonitoringDetail>
        </Route>
        <Route path="/article-list">
          <ArticleList></ArticleList>
        </Route>
        <Route path="/article-list-create">
          <ArticleListCreate></ArticleListCreate>
        </Route>
        <Route path="/article-list-edit">
          <ArticleListEdit></ArticleListEdit>
        </Route>
        <Route path="/article-map">
          <ArticleMap></ArticleMap>
        </Route>
        <Route path="/article-map-create">
          <ArticleMapCreate></ArticleMapCreate>
        </Route>
        <Route path="/article-map-edit">
          <ArticleMapEdit></ArticleMapEdit>
        </Route>
        <Route path="/article-map-category/:id">
          <ArticleMapCategory></ArticleMapCategory>
        </Route>
        <Route path="/ebook-list">
          <EbookList></EbookList>
        </Route>
        <Route path="/ebook-list-create">
          <EbookListCreate></EbookListCreate>
        </Route>
        <Route path="/ebook-list-edit">
          <EbookListEdit></EbookListEdit>
        </Route>
        <Route path="/subscriber-list">
          <SubscriberList></SubscriberList>
        </Route>
        <Route path="/subscriber-list-create">
          <SubscriberListCreate></SubscriberListCreate>
        </Route>
        <Route path="/subscriber-list-edit">
          <SubscriberListEdit></SubscriberListEdit>
        </Route>
        <Route path="/admin">
          <Admin></Admin>
        </Route>
        <Route path="/admin-create">
          <AdminCreate></AdminCreate>
        </Route>
        <Route path="/admin-edit/:id">
          <AdminEdit></AdminEdit>
        </Route>

        <Route path="/change-password">
          <ChangePassword></ChangePassword>
        </Route>
        <Route path="/reset-password/:token">
          <ResetPassword></ResetPassword>
        </Route>
        <Route path="/kwitansi">
          <Kwitansi></Kwitansi>
        </Route>
        <Route path="/information">
          <Information></Information>
        </Route>
        <Route path="/add-information">
          <AddInformation></AddInformation>
        </Route>
        <Route path="/edit-information/:id">
          <EditInformation></EditInformation>
        </Route>
        <Route path="/vaccine">
          <Vaccine></Vaccine>
        </Route>
        <Route path="/">
          select menu
        </Route>
      </Switch>
    </div>
    )
  }

  renderVaccineAdmin() {
    return (
      <div className="page-content container-fluid flex-grow-1 px-0">
      <Switch>
        <Route path="/change-password">
          <ChangePassword></ChangePassword>
        </Route>
        <Route path="/reset-password/:token">
          <ResetPassword></ResetPassword>
        </Route>
        <Route path="/hospital-account">
          <HospitalAccount></HospitalAccount>
        </Route>
        <Route path="/hospital-account-create">
          <HospitalAccountCreate></HospitalAccountCreate>
        </Route>
        <Route path="/hospital-account-edit/:id">
          <HospitalAccountEdit></HospitalAccountEdit>
        </Route>
        <Route path="/vaccine-type">
          <VaccineType></VaccineType>
        </Route>
        <Route path="/vaccine-type-create">
          <VaccineTypeCreate></VaccineTypeCreate>
        </Route>
        <Route path="/vaccine-type-edit/:id">
          <VaccineTypeEdit></VaccineTypeEdit>
        </Route>
        <Route path="/hospital-vaccine">
          <HospitalVaccine></HospitalVaccine>
        </Route>
        <Route path="/hospital-vaccine-create">
          <HospitalVaccineCreate></HospitalVaccineCreate>
        </Route>
        <Route path="/hospital-vaccine-edit/:id">
          <HospitalVaccineEdit></HospitalVaccineEdit>
        </Route>
        <Route path="/vaccine-slot">
          <VaccineSlot></VaccineSlot>
        </Route>
        <Route path="/vaccine-slot-create">
          <VaccineSlotCreate></VaccineSlotCreate>
        </Route>
        <Route path="/vaccine-slot-edit">
          <VaccineSlotEdit></VaccineSlotEdit>
        </Route>
        <Route path="/slot-monitoring">
          <SlotMonitoring></SlotMonitoring>
        </Route>
        <Route path="/slot-monitoring-detail">
          <SlotMonitoringDetail></SlotMonitoringDetail>
        </Route>
        <Route path="/patient-data">
          <PatientData></PatientData>
        </Route>
        <Route path="/">
          select menu
        </Route>
      </Switch>
    </div>
    )
  }

  renderHospitalAdmin() {
    return (
      <div className="page-content container-fluid flex-grow-1 px-0">
      <Switch>
        <Route path="/vaccine">
          <Vaccine></Vaccine>
        </Route>
        <Route path="/">
          select menu
        </Route>
      </Switch>
    </div>
    )
  }

  renderInfoAdmin() {
    return (
      <div className="page-content container-fluid flex-grow-1 px-0">
      <Switch>
        <Route path="/change-password">
          <ChangePassword></ChangePassword>
        </Route>
        <Route path="/reset-password/:token">
          <ResetPassword></ResetPassword>
        </Route>
        <Route path="/information">
          <Information></Information>
        </Route>
        <Route path="/add-information">
          <AddInformation></AddInformation>
        </Route>
        <Route path="/edit-information/:id">
          <EditInformation></EditInformation>
        </Route>
        <Route path="/">
          select menu
        </Route>
      </Switch>
    </div>
    )
  }

  renderReceiptAdmin() {
    return (
      <div className="page-content container-fluid flex-grow-1 px-0">
        <Switch>
          <Route path="/change-password">
            <ChangePassword></ChangePassword>
          </Route>
          <Route path="/reset-password/:token">
            <ResetPassword></ResetPassword>
          </Route>
          <Route path="/kwitansi">
            <Kwitansi></Kwitansi>
          </Route>
          <Route path="/">
            select menu
          </Route>
        </Switch>
      </div>);
  }

  renderArticleAdmin() {
    return (
      <div className="page-content container-fluid flex-grow-1 px-0">
      <Switch>
        <Route path="/change-password">
          <ChangePassword></ChangePassword>
        </Route>
        <Route path="/reset-password/:token">
          <ResetPassword></ResetPassword>
        </Route>
        <Route path="/article-list">
          <ArticleList></ArticleList>
        </Route>
        <Route path="/article-list-create">
          <ArticleListCreate></ArticleListCreate>
        </Route>
        <Route path="/article-list-edit">
          <ArticleListEdit></ArticleListEdit>
        </Route>
        <Route path="/ebook-list">
          <EbookList></EbookList>
        </Route>
        <Route path="/ebook-list-create">
          <EbookListCreate></EbookListCreate>
        </Route>
        <Route path="/ebook-list-edit">
          <EbookListEdit></EbookListEdit>
        </Route>
        <Route path="/article-map">
          <ArticleMap></ArticleMap>
        </Route>
        <Route path="/article-map-create">
          <ArticleMapCreate></ArticleMapCreate>
        </Route>
        <Route path="/article-map-edit">
          <ArticleMapEdit></ArticleMapEdit>
        </Route>
        <Route path="/article-map-category/:id">
          <ArticleMapCategory></ArticleMapCategory>
        </Route>
        <Route path="/subscriber-list">
          <SubscriberList></SubscriberList>
        </Route>
        <Route path="/subscriber-list-create">
          <SubscriberListCreate></SubscriberListCreate>
        </Route>
        <Route path="/subscriber-list-edit">
          <SubscriberListEdit></SubscriberListEdit>
        </Route>
        <Route path="/admin">
          <Admin></Admin>
        </Route>
        <Route path="/admin-create">
          <AdminCreate></AdminCreate>
        </Route>
        <Route path="/admin-edit/:id">
          <AdminEdit></AdminEdit>
        </Route>
        <Route path="/">
          select menu
        </Route>
      </Switch>
    </div>);
  }

  renderCSAdmin() {
    return (
      <div className="page-content container-fluid flex-grow-1 px-0">
      <Switch>
        <Route path="/change-password">
          <ChangePassword></ChangePassword>
        </Route>
        <Route path="/reset-password/:token">
          <ResetPassword></ResetPassword>
        </Route>
        <Route path="/slot-monitoring">
          <SlotMonitoring></SlotMonitoring>
        </Route>
        <Route path="/slot-monitoring-detail">
          <SlotMonitoringDetail></SlotMonitoringDetail>
        </Route>
        <Route path="/vaccine">
          <Vaccine></Vaccine>
        </Route>
        <Route path="/">
          select menu
        </Route>
      </Switch>
    </div>);
  }

  render() {
    let nav;
    if(this.state.admin.authority === "Super Admin") nav =  this.renderSuperAdmin();
    else if(this.state.admin.authority === "Vaccine Admin") nav = this.renderVaccineAdmin();
    else if(this.state.admin.authority === "Hospital Admin") nav = this.renderHospitalAdmin();
    else if(this.state.admin.authority === "CS Admin") nav = this.renderCSAdmin();
    else if(this.state.admin.authority === "Information Admin") nav = this.renderInfoAdmin();
    else if(this.state.admin.authority === "Receipt Admin") nav = this.renderReceiptAdmin();
    else if(this.state.admin.authority === "Article Admin") nav = this.renderArticleAdmin();
    else nav = this.renderInfoAdmin();

    return (
    <Router>
      <div className={`d-flex ${this.state.showMenu ? 'toggled' : ''}`} id="wrapper">
        <SideBar></SideBar>
        <div id="page-content-wrapper">
          <div className="d-flex flex-column h-100">
            <nav className="navbar navbar-expand-lg navbar-light">
              <button onClick={this.toggleMenu} type="button" className="btn" id="menu-toggle"><i className="fa fa-bars" style={{fontSize: '24px', color: '#AAAAAA'}}></i></button>
              <TopBar refreshAuth={this.props.refreshAuth}></TopBar>
            </nav>
            {nav}

          </div>
        </div>
      </div>
    </Router>
    );
  }
}

export default Dashboard;
