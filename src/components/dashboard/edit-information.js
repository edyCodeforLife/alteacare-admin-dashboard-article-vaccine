import React from 'react';
import EditInformationForm from './../../forms/edit-information-form';

class EditInformation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
    this.returnPage = this.returnPage.bind(this);
  }

  returnPage() {
    window.history.back();
  }

  render() {
    return (
      <div className="edit-information-page">
        <EditInformationForm returnPage={this.returnPage}></EditInformationForm>
      </div>
    );
  }
}

export default EditInformation;
