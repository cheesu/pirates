import React from 'react';
import { browserHistory, Link } from 'react-router';
class RightMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            keyword: ''
        };

        this.handleClose = this.handleClose.bind(this);
        this.handleRightMenu = this.handleRightMenu.bind(this);

    }

    handleClose() {
        this.handleRightMenu('');
        this.props.onClose();
    }


    handleRightMenu(keyword) {
        // TO BE IMPLEMENTED
    }



    render() {

        const mapDataToLinks = (data) => {
            // IMPLEMENT: map data array to array of Link components
            // create Links to '/wall/:username'
        };

        return (
            <div className="right-menu-screen white-text">
                <div className="right">
                    <a className="waves-effect waves-light btn red lighten-1"
                        onClick={this.handleClose}>CLOSE</a>
                </div>
                <div className="container">
                    <div className="user-info">
                      <dt>ID:</dt><dd>ME</dd>
                      <dt>LV:</dt><dd>ME</dd>
                      <dt>JOB:</dt><dd>ME</dd>
                    </div>
                    <ul className="right-menu-results">
                        <li> INVEN </li>
                        <li> STATUS </li>
                        <li>  </li>
                    </ul>

                    <div className="collection">
                      <a href="#!" className="collection-item"><span className="badge">INVEN</span>Alan</a>
                      <a href="#!" className="collection-item"><span className="new badge">STATUS</span>Alan</a>
                      <a href="#!" className="collection-item">Alan</a>
                      <a href="#!" className="collection-item"><span className="badge">14</span>Alan</a>
                    </div>

                    <div className="collection skill-set">
                      <a href="#!" className="collection-item"><span className="badge">10mp</span>스킬1</a>
                      <a href="#!" className="new collection-item"><span className="badge">20mp</span>스킬2</a>
                      <a href="#!" className="collection-item">Alan</a>
                      <a href="#!" className="collection-item"><span className="badge">14</span>스킬3</a>
                    </div>

                    <ul className="right-menu-skill">
                        { mapDataToLinks(this.props.usernames) }

                    </ul>

                </div>
            </div>
        );
    }
}

RightMenu.propTypes = {
    onClose: React.PropTypes.func,
    onRightMenu: React.PropTypes.func
};

RightMenu.defaultProps = {
    onClose: () => {
        console.error('onClose not defined');
    },
    onRightMenu: () => {
        console.error('onRightMenu not defined');
    }
};

export default RightMenu;
