var React = require('react');
var queryString = require('query-string');
var api = require('../utils/api');
var Link = require('react-router-dom').Link;
var PropTypes = require('prop-types');

var PlayerPreview = require('./PlayerPreview');
var Loading = require('./Loading');


const Profile = props => {

    let info = props.info;

    return (
        <PlayerPreview avatar={info.avatar_url} username={info.login}>
            <ul className='space-list-items centered' style={{ textAlign: 'center' }}>
                {info.name && <li>{info.name}</li>}
                {info.location && <li>{info.location}</li>}
                {info.company && <li>{info.company}</li>}

                <li>Followers: {info.followers}</li>
                <li>Following: {info.following}</li>
                <li>Public Repos: {info.public_repos}</li>

                {info.blog && <li><a href={info.blog} target='_blank'>{info.blog}</a></li>}
            </ul>
        </PlayerPreview>
    )
};


const Player = props => {
    return (
        <div>
            <h1 className='header'>{props.label}</h1>
            <h3 style={{textAlign: 'center'}}>{props.score}</h3>
            <Profile info={props.profile} />
        </div>
    )
};

Player.propTypes = {
    label: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
    profile: PropTypes.object.isRequired
};

class Results extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            winner: null,
            loser: null,
            error: null,
            loading: true
        }
    }
    componentDidMount () {
        let players = queryString.parse(this.props.location.search)

        api.battle([
            players.playerOneName,
            players.playerTwoName
        ]).then(players => {

            if (players === null) return this.setState(() => {
                return {
                    error: 'Error. Do both users exist?',
                    loading: false
                }
            });

            this.setState(() => {
                return {
                    error: null,
                    winner: players[0],
                    loser: players[1],
                    loading: false
                }
            }).bind(this);

            console.log(players);
        })
    }
    render () {

        let error = this.state.error;
        let winner = this.state.winner;
        let loser = this.state.loser;
        let loading = this.state.loading;

        if (loading)
            return <Loading />;

        if (error)
            return (
                <div>
                    <p>{error}</p>
                    <Link to='/battle'>Reset</Link>
                </div>
            );

        return (
            <div className='row'>
                <Player label='Winner' score={winner.score} profile={winner.profile} />
                <Player label='Loser' score={loser.score} profile={loser.profile} />
            </div>
        )
    }
}

module.exports = Results;