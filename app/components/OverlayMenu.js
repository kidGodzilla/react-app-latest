var React = require('react');
var NavLink = require('react-router-dom').NavLink;

class OverlayMenu extends React.Component {
    constructor (props) {
        super(props);
    }
    componentDidMount () {
        // Handle Focus State Management
        if (!window.fsm) window.fsm = new FocusStateManager();
        else fsm.remove();

        fsm.addGrid('.overlay > a:not(.disabled)', 0);
        fsm.bind({
            onPressBack: function () {
                window.history.back();
            }
        });
    }
    componentWillUnmount () {
    }
    render () {
        return (
            <div className="overlay">
                <NavLink className="focused" exact to='/'>
                    <h1>Home</h1>
                </NavLink>

                <h1 className="disabled">Series</h1>

                <NavLink exact to='/'>
                    <h1>Movies</h1>
                </NavLink>

                <NavLink exact to='/'>
                    <h1>Kids</h1>
                </NavLink>

                <NavLink exact to='/'>
                    <h1>Comedy</h1>
                </NavLink>

                <NavLink exact to='/'>
                    <h1>Sports</h1>
                </NavLink>

                <NavLink exact to='/'>
                    <h1>Documentaries</h1>
                </NavLink>

                <NavLink exact to='/'>
                    <h1>Collections</h1>
                </NavLink>
            </div>
        )
    }
}

module.exports = OverlayMenu;