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
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      // constants for shell
      shellIT: 0,
      shellOT: 0,
      shellMFR: 0,
      shellSHC: 0,
      shellDV: 0,
      shellTC: 0,
      shellD: 0,
      shellFF: 0,
      //ShellPN: 0, //not filled in form
      // Constant for tube
      tubeIT: 0,
      tubeOT: 0,
      tubeMFR: 0,
      tubeSHC: 0,
      tubeDV: 0,
      tubeTC: 0,
      tubeD: 0,
      tubeFF: 0,
      //TubePN: 0, //not filled in form
      // Constant for Constraints and physical Dimensions
      tubeInnerD: 0,
      tubeOuterD: 0,
      tubePitch: 0,
      numberTube: 0,
      numberPasses: 0,
      layoutAngle: 0,
      shellInnerDiameter: 0,
      baffleCut: 0,
      centralBaffleSpacing: 0,
      clearance: 0,
      shellSideFluidDynamicViscocity: 0,
      tubeMaterialThermalConductivity: 0,
      // Constant for material design
      tubeUnsupportedLength: 0,
      tubeYoungModule: 0,
      tubeLongitudeStress: 0,
      addedMassCoefficient: 0,
      metalMassUnitLength: 0,
      //TEMA configs
      head: 'A_1',
      shell: 'E',
      rear: 'M_1',
      // App states
      currentTab: "tab-1", //default tab is tab1
      currentPage: "forms"
    };
  }

  //switches the tabs
  onClickTab = e => {
    this.setState({ currentTab: e.target.id });
  }

  handleSubmit(value) {
    for (var property in value) {
      //this loop converts all the data input into float so we can do arithmetic
      value[property] = parseFloat(value[property])
    }
    this.setState(value);
    // this.setState({ isSubmitted: true })
    //upon submission, this will toggle and the ternary operator in render() will display
    //the corresponding page
  }

  // onClickNext = e => {
  //   this.setState({ currentPage: "inputCheck" });
  // }

  render() {
    return (
      <div>
        <div>
          
          <div className={`${this.state.currentTab === "tab-1" ? "" : "hide"}`}>
            <Tab1Graphics />
          </div>
          <div className={`${this.state.currentTab === "tab-2" ? "" : "hide"}`}>
            <Tab2Graphics />
          </div>
          <div className={`${this.state.currentTab === "tab-3" ? "" : "hide"}`}>
            <Tab1Graphics />
          </div>
        </div>

        {/* <a href="#" class="next" onClick={this.onClickNext}>Next &raquo;</a> */}
        <Link to="/RatingInputPage" className="next" >Next &raquo;</Link>

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
                  < Tab1Form formData={this.state} handleSubmit={this.handleSubmit} />
                  <button onClick={() => console.log(this.state)}>log state</button>
                </div>
              </div>
            </div>

            <div id="tab-2-content" className={`tab-content-item ${this.state.currentTab === "tab-2" ? "show" : ""}`}>
              <div className="tab-2-content-top">
                < Tab2Form formData={this.state} handleSubmit={this.handleSubmit} />
              </div>
            </div>
            <div id="tab-3-content" className={`tab-content-item ${this.state.currentTab === "tab-3" ? "show" : ""}`}>
              <div className="text-center">
                < Tab3Form formData={this.state} handleSubmit={this.handleSubmit} />
              </div>
            </div>
          </div>

        </section>
      </div>
    );
  }
}
export default RatingAnalysis;