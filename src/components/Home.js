import React from 'react';
import { connect } from 'react-redux';

import { browserHistory, Link, Redirect } from 'react-router';


class Home extends React.Component {

  constructor(props, context) {
          super(props, context);

          this.state = {
              useScroll:'',
          };
      }

      componentWillUnmount(){

      }

      componentDidMount() {


       }

    render() {

        return (
            <div className="wrapper ad-container">
              home test 

            </div>
        );
    }
}


export default Home;
