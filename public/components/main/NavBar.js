import React from 'react';
import './NavBar.css';
import {
EuiOverlayMask,
EuiModal,
EuiModalFooter,
EuiModalBody,
EuiButtonEmpty
}from '@elastic/eui';

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }


  showModal = () => {
    this.setState({ isModalVisible: true });
  };

  closeModal = () => {
    this.setState({ isModalVisible: false });
  };

  render() {
    console.log("nav bar props")
    console.log(this.props)
    const statusStyle = {
      color: '',
    };
    if (this.state.result === 'green') {
      (statusStyle.color = 'green'), (statusStyle.fontSize = '20px');
    } else if (this.state.result === 'yellow') {
      (statusStyle.color = 'gold'), (statusStyle.fontSize = '20px');
    } else if (this.state.result === 'red') {
      (statusStyle.color = 'red'), (statusStyle.fontSize = '20px');
    }

    let modal;
    if (this.state.isModalVisible) {
      modal = (
        <EuiOverlayMask className="statusmodal">
          <EuiModal onClose={this.closeModal}>
            <EuiModalBody>
              <span>Elasticsearch cluster health: </span>{' '}
              <span style={statusStyle}> {this.props.status}</span>
              <p>Total Documents indexed in Elasticsearch: {this.props.totalHits}</p>
            </EuiModalBody>
            <EuiModalFooter>
              <EuiButtonEmpty onClick={this.closeModal}>Cancel</EuiButtonEmpty>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      );
    }

    return (
      <div className="navbar">
        <p className="home">Document Tagger</p>
        <p className="apply">Apply Bulk Tags</p>
        <p onClick={this.showModal} className="status">Status Info</p>
        {modal}
      </div>
    );
  }
}

export default NavBar;
