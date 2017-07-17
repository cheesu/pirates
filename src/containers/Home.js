import React from 'react';
import { connect } from 'react-redux';
import {HomeText } from 'Components';
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
              <HomeText />
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isLoggedIn: state.authentication.status.isLoggedIn,
        status: state.authentication.status,
        userItems: state.item.items,
    };
};


export default connect(mapStateToProps)(Home);
