import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter as Router, Route } from 'react-router-dom';

import { App, Home, Login, Register, Game, Wall ,Teleport} from 'Containers';
// Redux
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reducers from 'Reducers';
import thunk from 'redux-thunk';


const store = createStore(reducers, applyMiddleware(thunk));
const rootElement = document.getElementById('root');
ReactDOM.render(<Provider store={store}>
                  <Router>
                     <div>
                       <Route  path="/" component={App}/>
                       <div>
                          <Route exact path="/Teleport" component={Teleport}/>
                          <Route exact path="/login" component={Login}/>
                          <Route exact path="/register" component={Register}/>
                          <Route exact path="/game" component={Game}/>
                          <Route exact path="/wall" component={Wall}/>
                       </div>
                     </div>
                   </Router>
                  </Provider>
                , rootElement);
