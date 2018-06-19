var React = require('react');
var Link = require('react-router-dom').Link;
const PropTypes = require('prop-types');

const Loading = require('./Loading');

function TileGrid (props) {

    console.log(props.features);

    return (
        <div className='cards'>
            {props.features.map((feature, index) => {
                return (
                    <a className="card" key={feature.id}>
                        <div className="wrap">
                            <img src={feature.images.tilezoom} />
                        </div>
                        <p>
                            <strong className="title">{feature.title}</strong>
                        </p>
                        {/*<p>*/}
                            {/*<small><em> meta </em></small>*/}
                        {/*</p>*/}
                    </a>
                )
            })}
        </div>
    )
}

// TileGrid.propTypes = {
//     features: PropTypes.array.isRequired
// };

class Home extends React.Component {
    constructor () {
        super();

        this.state = {
            features: null
        };

        this.updateTiles('urn:hbo:query:collections');

        // Handle Focus State Management
        window.fsm = new FocusStateManager();
    }
    updateTiles (urn) {
        let that = this;

        listAll(urn, function (features) {
            features.sort(function (a, b) {
                return (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0);
            });

            console.log('features', features);

            that.setState(() => {
                return {
                    features: features
                }
            });

            fsm.add('.nav .focusable a');
            fsm.addGrid('.card', 3);

            fsm.bind({
                onPressBack: function () {
                    if (fsm.current().row === 0 && fsm.current().col === 0) location.href = '/';
                    else fsm.goto(0,0);
                },
                beforeTransition: function (row, col, key) {
                    if (row === 1 && key === UP) return function () {
                        fsm.goto(0, 0);
                    };

                    if (row === 0 && key === DOWN) return function () {
                        fsm.goto(1, 0);
                    };

                    if (row === 0 && col === 2 && key === RIGHT) return function () {
                        return;
                    };
                },
                // afterTransition: focusStateUpdated
            });
        });
    }
    render () {
        return (
            <div className='home-container'>

                {!this.state.features
                    ? <Loading />
                    : <TileGrid features={this.state.features} />
                }

            </div>
        )
    }
}

module.exports = Home;
