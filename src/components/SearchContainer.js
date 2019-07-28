import React, { Component } from 'react';
import SearchResult from './SearchResult';

class SearchContainer extends Component {
    state = {  }
    render() { 
        if (this.props.search.length < 1) return null;
        if (this.props.searchState === "") return null;
        const results = this.props.search;
        return ( 
            <div className="search-container-container">

                {results.map((result, i) => {
                    return <SearchResult key={i} result={result}/>
                })}                

                <div className="search-result-container">
                    <h5 className="search-result-name">Search for more...</h5>
                </div>
            </div>
         );
    }
}
 
export default SearchContainer;