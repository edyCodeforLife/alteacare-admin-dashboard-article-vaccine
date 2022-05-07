import React from 'react';
import AddInformationForm from './../../forms/add-information-form';

class AddInformation extends React.Component {
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
      <div className="add-information-page">
        <AddInformationForm returnPage={this.returnPage}></AddInformationForm>
      </div>
    );
  }
}

export default AddInformation;
