import React, { useRef } from 'react';
import Tab1Graphics from './RatingTab1Graphics';
import Tab2Graphics from './RatingTab2Graphics';
import Tab1Form from './RatingTab1Form';
import Tab2Form from './RatingTab2Form';
import Tab3Form from './RatingTab3Form';

import { Link } from 'react-router-dom';

class RatingAnalysis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: "tab-1", //default tab is tab1
    };
  }

  //switches the tabs
  onClickTab = e => {
    this.setState({ currentTab: e.target.id });
  }

  render() {
    return (
      <div>
        <div>

          <div className={`${this.state.currentTab === "tab-1" ? "" : "hide"}`}>
            <Tab1Graphics data={this.props.data}/>
          </div>
          <div className={`${this.state.currentTab === "tab-2" ? "" : "hide"}`}>
            <Tab2Graphics data={this.props.data}/>
          </div>
          <div className={`${this.state.currentTab === "tab-3" ? "" : "hide"}`}>
            <Tab1Graphics data={this.props.data}/>
          </div>
        </div>

        <button onClick={() => console.log(this.props)}>log props</button>
        <button onClick={() => console.log(this.state)}>log state2</button>

        <button className="next" onClick={() => this.props.handlePageChange({ currentPage: 'inputCheck' })}>Check Inputs &raquo;</button>
        <section className="tabs">
          <div className="container">
            <div id="tab-1" className={`tab-item ${this.state.currentTab === "tab-1" ? "tab-border" : ""}`} onClick={this.onClickTab}>
              <p id="tab-1">General</p>
            </div>
            <div id="tab-2" className={`tab-item ${this.state.currentTab === "tab-2" ? "tab-border" : ""}`} onClick={this.onClickTab}>
              <p id="tab-2">Tube</p>
            </div>
            <div id="tab-3" className={`tab-item ${this.state.currentTab === "tab-3" ? "tab-border" : ""}`} onClick={this.onClickTab}>
              <p id="tab-3">Shell</p>
            </div>
          </div>
        </section>

        <section className="tab-content">
          <div className="container">
            <div id="tab-1-content" className={`tab-content-item ${this.state.currentTab === "tab-1" ? "show" : ""}`}>
              <div className="tab-1-content-inner">
                <div>
                  < Tab1Form
                    formData={this.props.data}
                    handleSubmit={this.props.handleSubmit}
                    updateTubeProperties={this.props.updateTubeProperties}
                    updateShellProperties={this.props.updateShellProperties}
                  />
                </div>
              </div>
            </div>

            <div id="tab-2-content" className={`tab-content-item ${this.state.currentTab === "tab-2" ? "show" : ""}`}>
              <div className="tab-2-content-top">
                < Tab2Form
                  formData={this.props.data}
                  handleSubmit={this.props.handleSubmit}
                />
              </div>
            </div>
            <div id="tab-3-content" className={`tab-content-item ${this.state.currentTab === "tab-3" ? "show" : ""}`}>
              <div className="text-center">
                < Tab3Form
                  formData={this.props.data}
                  handleSubmit={this.props.handleSubmit}
                />
              </div>
            </div>
          </div>

        </section>
      </div>
    );
  }
}
export default RatingAnalysis;