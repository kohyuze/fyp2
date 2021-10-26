import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Start from './Start';
import RatingAnalysis from './Rating/RatingAnalysis';
import SizingAnalysis from './SizingAnalysis';


function App() {
  return (
    <div className="App">
      <div className="content">
        <Router>
          <Switch>
            <Route exact path="/">
              <Start />
            </Route>
            <Route path="/RatingAnalysis">
              <RatingAnalysis />
            </Route>
            {/* <Route path="/SizingAnalysis">
              <SizingAnalysis />
            </Route> */}
          </Switch>
        </Router>
      </div>
    </div>
  );
}

export default App;
