import React from 'react';
import axios from 'axios';
import moment from 'moment';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentHeader,
  EuiPageContentBody,
  EuiText,
  EuiAccordion,
  EuiOverlayMask,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiButtonEmpty,
  EuiButton,
  EuiFieldText,
  EuiFieldSearch,
  EuiSwitch,
  EuiFlexItem,
  EuiPagination,
  EuiFlexGroup,
  EuiIcon,
  EuiDatePicker,
  EuiDatePickerRange,
  EuiRadioGroup,
  EuiLoadingSpinner,
} from '@elastic/eui';

import { FormattedMessage } from '@kbn/i18n/react';
import './main.css';
import Error from './../Error';
import Editor from './Editor';
import { EuiHeader } from '@elastic/eui';
import NavBar from './NavBar';

export class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchInput: '',
      queryResponse: [],
      bookmarkedIds: [],
      deletingTag: false,
      isCompressed: false,
      testTags: [],
      labels: ['Review', 'FISA', 'Pertinent', 'Non-Pertinent', 'Trash'],
      addedLabels: [],
      tagAdded: false,
      isModalVisible: false,
      isBulkTagModalVisible: false,
      isAdvancedSearchModalVisible: false,
      isClearable: true,
      value: '',
      activePage: 0,
      from: 0,
      size: 10,
      numHits: 0,
      resultsFound: false,
      startDate: moment().subtract(3, 'months'),
      endDate: moment(),
      breadcrumbs: [],
      radioIdSelected: '',
      testStateChange: '',
      textBarOne: '',
      textBarTwo: '',
      isLoading: false,
      totalDocs: 0,
    };
    this.PAGE_COUNT = 10;
  }

  async componentDidMount() {
    await axios.get('../api/newTestPlugin/example').then(resp => {
      this.setState({ time: resp.data.time });
    });

    const getStatus = async () => {
      const url = 'http://127.0.0.1:9200/_cluster/health';
      await axios.get(url).then(response => {
        this.setState({ result: response.data.status });
      });
    };
    getStatus();
    await this.totalDocuments();
  }

  handleChangeStart = date => {
    this.setState({
      startDate: date,
    });
  };

  handleChangeEnd = date => {
    this.setState({
      endDate: date,
    });
  };

  goToPage = async pageNumber => {
    let newSize = 10;
    let newFrom;
    pageNumber <= 0 ? (newFrom = pageNumber) : (newFrom = (pageNumber + 1) * 10 - 10);

    await this.setState({
      activePage: pageNumber,
      from: newFrom < 10 ? 0 : newFrom,
      size: newSize < 10 ? 10 : newSize,
      queryResponse: [],
    });
    await this.handleIDSearch();
  };

  handleSearchText = async event => {
    let value = event.target.value;
    try {
      await this.setState({ searchInput: value });
    } catch (error) {
      <Error error={error} />;
    }
  };

  handleTagText = async event => {
    let value = event.target.value;
    await this.setState({ TagInput: value });
  };

  handleDeleteTagText = async event => {
    let value = event.target.value;
    await this.setState({ DeleteInput: value, deletingTag: true });
  };

  handleIDSearch = async () => {
    this.setState({ isLoading: true });
    event.preventDefault();
    let searchQuery = this.state.searchInput.trim();
    let newBreadcrumb = {
      text: searchQuery,
      onClick: this.handleBreadCrumbClick,
    };
    let breadcrumbs = [];
    this.state.breadcrumbs.find(b => b.text === newBreadcrumb.text)
      ? (breadcrumbs = [...this.state.breadcrumbs])
      : (breadcrumbs = [...this.state.breadcrumbs, newBreadcrumb]);
    try {
      await axios
        .get('http://127.0.0.1:9200/kibana_sample_data_logs/_search', {
          params: {
            source: {
              from: this.state.from,
              size: this.state.size,
              query: {
                bool: {
                  must: [
                    {
                      range: {
                        timestamp: {
                          gte: this.state.startDate._d,
                          lte: this.state.endDate._d,
                        },
                      },
                    },
                    {
                      multi_match: {
                        query: `${searchQuery}`,
                        type: 'cross_fields',
                        fields: ['_id', 'tags.keyword', '*'],
                      },
                    },
                  ],
                },
              },
            },
            source_content_type: 'application/json',
          },
        })
        .then(res => {
          let response = res.data.hits.hits;
          setTimeout(() => {
            this.setState({
              queryResponse: response,
              numHits: res.data.hits.total.value,
              PAGE_COUNT: Math.floor(res.data.hits.total.value / 10),
              resultsFound: res.data.hits.total.value > 1 ? true : false,
              breadcrumbs: breadcrumbs,
              isLoading: false,
            });
          }, 1500);
        });
    } catch (error) {
      throw error;
    }
  };

  handleAdvancedSearch = async () => {
    event.preventDefault();
    let searchQuery = this.state.textBarTwo.trim();
    let secondSearchInput = this.state.textBarTwo.trim();
    let newBreadcrumb = {
      text: searchQuery,
      onClick: this.handleBreadCrumbClick,
    };
    let breadcrumbs = [];
    this.state.breadcrumbs.find(b => b.text === newBreadcrumb.text)
      ? (breadcrumbs = [...this.state.breadcrumbs])
      : (breadcrumbs = [...this.state.breadcrumbs, newBreadcrumb]);
    try {
      await axios
        .get('http://127.0.0.1:9200/kibana_sample_data_logs/_search', {
          params: {
            source: {
              from: this.state.from,
              size: this.state.size,
              query: {
                bool: {
                  must: {
                    term: { '*': searchQuery },
                    operator: 'AND',
                  },
                  must: {
                    term: { '*': secondSearchInput },
                  },
                  must: {
                    range: {
                      timestamp: {
                        gte: this.state.startDate._d,
                        lte: this.state.endDate._d,
                      },
                    },
                  },
                },
              },
            },
            source_content_type: 'application/json',
          },
        })
        .then(res => {
          let response = res.data.hits.hits;
          this.setState({
            queryResponse: response,
            numHits: res.data.hits.total.value,
            PAGE_COUNT: Math.floor(res.data.hits.total.value / 10),
            resultsFound: res.data.hits.total.value > 1 ? true : false,
            breadcrumbs: breadcrumbs,
          });
        });
    } catch (error) {
      <Error error={error} />;
    } finally {
      this.closeAdvancedSearchModal();
    }
  };

  handleBreadCrumbClick = async event => {
    event.preventDefault();
    let value = event.target.id;
    await this.setState({ searchInput: value, selected: true });
    await this.handleIDSearch();
  };

  deleteTag = async event => {
    let value = event.currentTarget.name;
    event.preventDefault();
    await axios
      .post(`http://localhost:9200/kibana_sample_data_logs/_update/${value}`, {
        script: {
          inline: 'ctx._source.tags.removeAll(Collections.singleton(params.tag))',
          lang: 'painless',
          params: {
            tag: `${this.state.DeleteInput}`,
          },
        },
      })
      .then(this.setState({ deletingTag: false }));
    if (this.state.testTags.includes(this.state.DeleteInput)) {
      let tag = this.state.DeleteInput;
      let tags = [...this.state.testTags];
      let index = tags.indexOf(tag);
      if (index != -1) {
        tags.splice(index, 1);
        await this.setState({ testTags: tags });
      }
    }
  };

  bookmarkId = async event => {
    if (!this.state.bookmarkedIds.includes(event.target.id)) {
      await this.setState({ bookmarkedIds: [...this.state.bookmarkedIds, event.target.id] });
      await localStorage.setItem('bookmark', this.state.bookmarkedIds);
    } else {
      alert(`id: ${event.target.id} has already been bookmarked`);
    }
  };

  bookmarkSearch = async event => {
    event.preventDefault();
    await this.setState({ searchInput: event.target.id });
    try {
      await axios
        .get('http://127.0.0.1:9200/kibana_sample_data_logs/_search', {
          params: {
            source: { from: 0, size: 10, query: { match: { _id: this.state.searchInput } } },
            source_content_type: 'application/json',
          },
        })
        .then(res => {
          this.setState({ queryResponse: res.data.hits.hits, numHits: 1 });
        });
    } catch (error) {
      <Error error={error} />;
    }
  };

  removeBookmark = async event => {
    let value = event.target.id;
    let array = [...this.state.bookmarkedIds];
    let index = array.indexOf(value);
    if (index !== -1) {
      array.splice(index, 1);
      await this.setState({ bookmarkedIds: array });
    }
  };

  exportBookmarkedIds = () => {
    let csv = `IDs:\n`;
    this.state.bookmarkedIds.map(row => (csv += `${row}\n`));
    if (confirm('Save IDs to CSV File?')) {
      const hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
      hiddenElement.target = '_blank';
      hiddenElement.download = 'bookmarkedIDs.csv';
      hiddenElement.click();
    }
  };

  handleTagRadio = async event => {
    if (event.target.checked && !this.state.testTags.includes(event.target.value)) {
      let tags = [...this.state.testTags];
      let input = event.target.value;
      await this.setState({ testTags: [...tags, input] });
      event.target.checked = false;
    } else if (this.state.testTags.includes(event.target.value)) {
      let tag = event.target.value;
      let tags = [...this.state.testTags];
      let index = tags.indexOf(tag);
      if (index != -1) {
        tags.splice(index, 1);
        await this.setState({ testTags: tags });
      }
    }
  };

  handleLabelRadioButton = async event => {
    if (event.target.checked && !this.state.addedLabels.includes(event.target.value)) {
      let labels = [...this.state.addedLabels];
      let input = event.target.value;
      await this.setState({ addedLabels: [...labels, input] });
    } else if (this.state.addedLabels.includes(event.target.value)) {
      let label = event.target.value;
      let labels = [...this.state.addedLabels];
      let index = labels.indexOf(label);
      if (index != -1) {
        labels.splice(index, 1);
        await this.setState({ addedLabels: labels });
      }
    }
  };

  handleAddLabelText = async event => {
    let value = event.target.value;
    await this.setState({ labelInput: value });
  };

  handleLabelSubmit = async event => {
    event.preventDefault();
    let el = document.getElementById('addTagForm');
    el.style.display = 'none';
    if (!this.state.labels.includes(this.state.labelInput) && this.state.labelInput.length > 0) {
      let currentLabels = [...this.state.labels];
      let newLabel = this.state.labelInput;
      let newLabels = [...currentLabels, newLabel];
      await this.setState({ labels: newLabels, isModalVisible: false });
    }
  };

  indexNewLabels = async event => {
    let value = event.currentTarget.name;
    let labels = [...this.state.addedLabels];
    event.preventDefault();
    await labels.forEach(element => {
      axios.post(`http://localhost:9200/kibana_sample_data_logs/_update/${value}`, {
        script: {
          source: 'ctx._source.tags.add(params.tags)',
          lang: 'painless',
          params: {
            tags: `${element}`,
          },
        },
      });
    });
  };

  handleBulkTags = async event => {
    let tags = [...this.state.addedLabels];
    await this.state.bookmarkedIds.forEach(element => {
      axios.post(`http://localhost:9200/kibana_sample_data_logs/_update/${element}`, {
        script: {
          source: 'ctx._source.tags.add(params.tags)',
          lang: 'painless',
          params: {
            tags: `${tags}`,
          },
        },
      });
    });
    await this.closeBulkTagModal();
  };

  deleteTagsFromList = async () => {
    let deleteArray = [...this.state.addedLabels];
    let labels = [...this.state.labels];
    await deleteArray.forEach(element => {
      let index = labels.indexOf(element);
      if (labels.includes(element)) {
        labels.splice(index, 1);
      }
    });
    await this.setState({ labels: labels });
  };

  removeAllBookmarks = () => {
    this.setState({ bookmarkedIds: [] });
  };

  onSwitchChange = () => {
    this.setState({
      isSwitchChecked: !this.state.isSwitchChecked,
    });
  };

  showModal = () => {
    this.setState({ isModalVisible: true });
  };

  closeModal = () => {
    this.setState({ isModalVisible: false });
  };

  showBulkTagModal = () => {
    this.setState({ isBulkTagModalVisible: true });
  };

  closeBulkTagModal = () => {
    this.setState({ isBulkTagModalVisible: false });
  };

  showAdvancedSearchModal = () => {
    this.setState({ isAdvancedSearchModalVisible: true });
  };

  closeAdvancedSearchModal = () => {
    this.setState({ isAdvancedSearchModalVisible: false });
  };

  onTextBarChange = async event => {
    let value = event.target.value;
    await this.setState({ [event.target.name]: value });
  };
  handleTestStateChange = async event => {
    let value = event.target.value;
    await this.setState({ testStateChange: value });
  };

  onRadioChange = async optionId => {
    await this.setState({
      radioIdSelected: optionId,
    });
  };

  totalDocuments = async () => {
    await axios
      .get('http://127.0.0.1:9200/kibana_sample_data_logs/_count', {
        params: {
          source: {
            query: {
              match_all: {},
            },
          },
          source_content_type: 'application/json',
        },
      })
      .then(res => {
        console.log(res);
        let response = res.data.count;
        setTimeout(() => {
          this.setState({
            totalDocs: response,
            isLoading: false,
          });
        }, 1500);
      });
  };

  render() {
    let breadcrumbs = this.state.breadcrumbs.map(b => (
      <div className="bread_crumbs">
        <p id={b.text} onClick={this.handleBreadCrumbClick}>
          {b.text}
        </p>
      </div>
    ));
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
        <EuiOverlayMask>
          <EuiModal onClose={this.closeModal}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>Add Tag</EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
              <EuiFieldText
                placeholder="Add label to the list"
                onChange={this.handleAddLabelText}
              />
            </EuiModalBody>
            <EuiModalFooter>
              <EuiButtonEmpty onClick={this.closeModal}>Cancel</EuiButtonEmpty>
              <EuiButton onClick={this.handleLabelSubmit} fill>
                Add
              </EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      );
    }
    let bulkTagModal;
    if (this.state.isBulkTagModalVisible) {
      bulkTagModal = (
        <EuiOverlayMask>
          <EuiModal onClose={this.closeBulkTagModal}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>Add Tags</EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
              {this.state.labels.map(l => (
                <div className="label">
                  <input
                    type="checkbox"
                    name="label"
                    id={l}
                    value={l}
                    onChange={this.handleLabelRadioButton}
                    label="tag"
                  />
                  <span>{l}</span>
                </div>
              ))}
              <span className="addTags" onClick={this.showModal}>
                <EuiIcon type="listAdd" />
              </span>

              <span className="deleteTags" onClick={this.deleteTagsFromList}>
                <EuiIcon type="trash" />
              </span>
            </EuiModalBody>
            <EuiModalFooter>
              <EuiButtonEmpty onClick={this.closeBulkTagModal}>Cancel</EuiButtonEmpty>
              <EuiButton onClick={this.handleBulkTags} fill>
                Add
              </EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      );
    }

    let advancedSearchModal;
    if (this.state.isAdvancedSearchModalVisible) {
      advancedSearchModal = (
        <EuiOverlayMask>
          <EuiModal onClose={this.closeAdvancedSearchModal} className="advanced_search_modal">
            <EuiHeader>
              Perform manual queries to the elasticsearch cluster
            </EuiHeader>
            <Editor />
          </EuiModal>
        </EuiOverlayMask>
      );
    }

    let tags = this.state.labels.map(l => (
      <div className="label">
        <input
          type="checkbox"
          name="label"
          id={l}
          value={l}
          onChange={this.handleLabelRadioButton}
          label="tag"
        />
        <span>{l}</span>
      </div>
    ));

    let bookmarks = this.state.bookmarkedIds.map(b => (
      <li className="bookmarks" key={b}>
        <span id={b} onClick={this.bookmarkSearch}>
          {b}
        </span>
        <span onClick={this.removeBookmark} className="delete" id={b}>
          (Remove)
        </span>
      </li>
    ));

    const results = this.state.queryResponse.map(i => (
      <div className="dropdown_result">
        <span className="result1">
          <strong>ID: </strong>
          {i._id}{' '}
          <button onClick={this.bookmarkId} id={i._id} className="tagButtonStyle">
            Bookmark
          </button>
          <br />
          <strong>Location Info: </strong>
          <br />
          <strong>Latitude: </strong>
          {i._source.geo.coordinates.lat}
          <strong>Longitude: </strong>
          {i._source.geo.coordinates.lon}
          <br />
          <strong>IP: </strong> {i._source.ip}
          <br />
          <strong>Event Timestamp: </strong> {i._source.utc_time}
          <br />
          <strong>Tags:</strong> {i._source.tags.map(t => t + ' ')}
          <br />
          <hr />
          <EuiAccordion buttonContent="Manage Tags" initialIsOpen={false} className="manage_tags">
            <div className="labelList">
              <div className="labels">
                {tags}
                <span className="addTags" onClick={this.showModal}>
                  <EuiIcon type="listAdd" />
                </span>

                <span className="deleteTags" onClick={this.deleteTagsFromList}>
                  <EuiIcon type="trash" />
                </span>
                <span>
                  <form className="tagAddForm" id="addTagForm">
                    <input
                      className="deleteTagText"
                      id="tagTextForm"
                      type="text"
                      placeholder="Add label to list"
                      onChange={this.handleAddLabelText}
                    />
                    <button className="tagButtonAddStyle" onClick={this.handleBulkTags}>
                      Add
                    </button>
                  </form>
                </span>
              </div>
              <button className="addlabelButtonStyle" onClick={this.indexNewLabels} name={i._id}>
                Apply Tags
              </button>
              <br />
              {/* <form>
              <input onChange={this.handleDeleteTagText} placeholder="Enter Tag to Delete" className="deleteTagText" />
              <button className='tagButtonStyle' name={i._id} onClick={this.deleteTag}>Delete</button>
            </form> */}
            </div>
          </EuiAccordion>
        </span>
      </div>
    ));
    return (
      <EuiPage>
        <EuiPageBody>
          <EuiPageContent className="background">
            <EuiPageContentHeader></EuiPageContentHeader>
            <EuiPageContentBody>
              <EuiText>
                <NavBar 
                totalHits={this.state.totalDocs}
                status={this.state.result}
                />
                {/* <h1 className="headerStyle">Document Tagging Plugin Test</h1> */}
                <span>Elasticsearch cluster health: </span>{' '}
                <span style={statusStyle}> {this.state.result}</span>
                <p>Total Documents indexed in Elasticsearch: {this.state.totalDocs}</p>
   
                <form className="searchBarStyles" onSubmit={this.handleIDSearch}>
                  <EuiFieldSearch
                    placeholder="Search Document ID or Tag"
                    onChange={this.onTextBarChange}
                    isClearable={this.state.isClearable}
                    className="searchBar"
                    name="searchInput"
                    id="searchInput"
                  />
                  <EuiFlexItem grow={false}>
                    <EuiButton fill className="button_style" onClick={this.handleIDSearch}>
                      Search
                    </EuiButton>
                  </EuiFlexItem>
                </form>
                <span onClick={this.showAdvancedSearchModal} className="advanced_search">
                  Advanced Search
                </span>
                <div className="searchBarStyles">
                  <EuiDatePickerRange
                    className="datePicker"
                    startDateControl={
                      <EuiDatePicker
                        className="date_picker"
                        dateFormat="YYYY-MM-DD hh:mm:ss:SSS A"
                        selected={this.state.startDate}
                        onChange={this.handleChangeStart}
                        startDate={this.state.startDate}
                        endDate={this.state.endDate}
                        isInvalid={this.state.startDate > this.state.endDate}
                        aria-label="Start date"
                        showTimeSelect
                      />
                    }
                    endDateControl={
                      <EuiDatePicker
                        className="date_picker"
                        dateFormat="YYYY-MM-DD hh:mm:ss:SSS A"
                        selected={this.state.endDate}
                        onChange={this.handleChangeEnd}
                        startDate={this.state.startDate}
                        endDate={this.state.endDate}
                        isInvalid={this.state.startDate > this.state.endDate}
                        aria-label="End date"
                        showTimeSelect
                      />
                    }
                  />
                </div>
                <EuiAccordion buttonContent="View bookmarked Ids" initialIsOpen={false}>
                  {bookmarks}
                  <p onClick={this.removeAllBookmarks} className="remove_all">
                    Remove All
                  </p>
                  <span className="export_buttons">
                    <button onClick={this.exportBookmarkedIds} className="exportButtonStyle">
                      Export CSV
                    </button>
                    <button onClick={this.showBulkTagModal} className="exportButtonStyle">
                      Bulk Tag
                    </button>
                  </span>
                </EuiAccordion>
                <br />
                <div className="hits">
                  {this.state.numHits ? `Number of results:  ${this.state.numHits}` : ''}
                </div>
                <EuiFlexGroup justifyContent="spaceAround">
                  <EuiFlexItem grow={false}>
                    <EuiPagination
                      pageCount={this.state.PAGE_COUNT}
                      activePage={this.state.activePage}
                      onPageClick={this.goToPage}
                    />
                    {this.state.resultsFound && (
                      <p>
                        Displaying: {this.state.from + 1} -{' '}
                        {this.state.numHits < 10 ? this.state.numHits : this.state.from + 10}
                      </p>
                    )}
                  </EuiFlexItem>
                </EuiFlexGroup>
                <div className="breadcrumb_container"> {breadcrumbs}</div>
                {advancedSearchModal}
                {modal}
                {bulkTagModal}
                {this.state.isLoading ? (
                  <div>
                    <EuiLoadingSpinner size="xl" />
                  </div>
                ) : (
                  results
                )}
              </EuiText>
            </EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    );
  }
}
