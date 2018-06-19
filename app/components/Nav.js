var React = require('react');
//var Link = require('react-router-dom').Link;
var NavLink = require('react-router-dom').NavLink;

function Nav () {
    return (
        <div>
            <ul className="nav">
                <li>
                    <NavLink to='/'>
                        <img className="logo" src="assets/hbogo-black.svg" alt=""/>
                    </NavLink>

                </li>
                <li>
                    <h1>Home</h1>
                </li>
                <div className="right">
                    <li className="focusable">
                        <NavLink exact to='/browse'>
                            <img className="icon" src="assets/browse.png" />
                            <img className="icon active" src="assets/browse-selected.png" />
                        </NavLink>
                    </li>
                    <li className="focusable">
                        <NavLink to='/battle'>
                            <img className="icon" src="assets/search.png" />
                            <img className="icon active" src="assets/search-selected.png" />
                        </NavLink>
                    </li>
                    <li className="focusable">
                        <NavLink to='/popular'>
                            <img className="icon" src="assets/profile.png" />
                            <img className="icon active" src="assets/profile-selected.png" />
                        </NavLink>
                    </li>
                    <li className="focusable">
                        <img className="provider-logo" src="assets/provider-logo.png" />
                    </li>
                </div>

            </ul>
        </div>
    )
}

module.exports = Nav;