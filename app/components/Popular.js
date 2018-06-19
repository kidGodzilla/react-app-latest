const React = require('react');
const PropTypes = require('prop-types');
const api = require('../utils/api');

const Loading = require('./Loading');

function SelectLanguage (props) {
    let languages = ['All', 'Javascript', 'Ruby', 'Java', 'CSS', 'Python'];

    return (
        <ul className='languages'>
            {languages.map(lang => { return (
                <li
                    onClick={props.onSelect.bind(null, lang)}
                    style={lang === props.selectedLanguage ? {color: '#d0021b'} : null}
                    key={lang}>
                    {lang}
                </li>
            )})}
        </ul>
    )
}

function RepoGrid (props) {

    console.log(props.repos);

    return (
        <ul className='popular-list'>
            {props.repos.map((repo, index) => {
                return (
                    <li key={repo.name} className='popular-item'>
                        <div className='popular-rank'>#{index + 1}</div>
                        <ul className='space-list-items'>
                            <li>
                                <img className='avatar' src={repo.owner.avatar_url} alt={`Avatar for ${repo.owner.login}`} />
                            </li>
                            <li>
                                <a href={repo.html_url} target="_blank">{repo.name}</a>
                            </li>
                            <li>
                                @{repo.owner.login}
                            </li>
                            <li>
                                {repo.stargazers_count} stars
                            </li>
                        </ul>
                    </li>
                )
            })}
        </ul>
    )
}

RepoGrid.propTypes = {
    repos: PropTypes.array.isRequired
};

SelectLanguage.propTypes = {
    selectedLanguage: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired
};

class Popular extends React.Component {
    constructor (props) {
        super(); // Always do this when opening a constructor

        this.state = {
            selectedLanguage: 'All',
            repos: null
        };

        this.updateLanguage = this.updateLanguage.bind(this); // Do this for every action to bind its context to this
    }
    componentDidMount () {
        this.updateLanguage(this.state.selectedLanguage);
    }
    updateLanguage (lang) {
        // Now we have a child who's bound to its parent's this context!
        this.setState(()=>{ // Oh look, getters and setters.. Hrmm...!
            return {
                selectedLanguage: lang,
                repos: null
            }
        });

        api.fetchPopularRepos(lang).then(repos => {
            this.setState(() => {
                return {
                    repos: repos
                }
            });
        });
    }
    render () {
        return (
            <div>
                <SelectLanguage selectedLanguage={this.state.selectedLanguage} onSelect={this.updateLanguage} />

                {!this.state.repos
                    ? <Loading />
                    : <RepoGrid repos={this.state.repos} />
                }
            </div>
        )
    }
}

module.exports = Popular;
