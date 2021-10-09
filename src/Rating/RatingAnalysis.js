import React, { useRef } from 'react';
import A_1 from '../Resources/A_1.png'
import E from '../Resources/E.png'
import L_1 from '../Resources/L_1.png'
import Tab1Graphics from './RatingTab1Graphics';
import Tab2Graphics from './RatingTab2Graphics';

class RatingAnalysis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: "tab-1", //default tab is tab1
    };
  }

  //switches the tabs
  onClick = e => {
    this.setState({ currentTab: e.target.id });
  }

  render() {
    return (
      <div>
        <div className="graphics_container">
           {/* try see if you can do all this with a switch statement   */}
          <div className={`HX_container ${this.state.currentTab === "tab-1" ? "" : "hide"}`}>
              {/* <p>Tab1graphics</p> */}
            <Tab1Graphics/>
          </div>
          <div className={`cross-section ${this.state.currentTab === "tab-2" ? "" : "hide"}`}>
            <Tab2Graphics/>
          </div>
        </div>

        <section className="tabs">
          <div className="container">
            <div id="tab-1" className={`tab-item ${this.state.currentTab === "tab-1" ? "tab-border" : ""}`} onClick={this.onClick}>
              <p id="tab-1">General Configuration/Fluids</p>
            </div>
            <div id="tab-2" className={`tab-item ${this.state.currentTab === "tab-2" ? "tab-border" : ""}`} onClick={this.onClick}>
              <p id="tab-2">Tube Configurations</p>
            </div>
            <div id="tab-3" className={`tab-item ${this.state.currentTab === "tab-3" ? "tab-border" : ""}`} onClick={this.onClick}>
              <p id="tab-3">Shell Configurations</p>
            </div>
          </div>
        </section>

        <section className="tab-content">
          <div className="container">
            <div id="tab-1-content" className={`tab-content-item ${this.state.currentTab === "tab-1" ? "show" : ""}`}>
              <div className="tab-1-content-inner">
                <div>
                  <p className="text-lg">Tab 1</p>
                </div>
              </div>
            </div>

            <div id="tab-2-content" className={`tab-content-item ${this.state.currentTab === "tab-2" ? "show" : ""}`}>
              <div className="tab-2-content-top">
                <p className="text-lg">Tab 2</p>
              </div>
            </div>
            <div id="tab-3-content" className={`tab-content-item ${this.state.currentTab === "tab-3" ? "show" : ""}`}>
              <div className="text-center">
                <p className="text-lg">Tab 3</p>
              </div>
            </div>
          </div>

        </section> 
      </div>
    );
  }
}
export default RatingAnalysis;