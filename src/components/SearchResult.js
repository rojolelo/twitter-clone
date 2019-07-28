import React from 'react';
import {Link} from "react-router-dom";

const SearchResult = (props) => {
    let image;

    if (!props.result.profilepic) {
        image = "https://cdn.britannica.com/67/197567-131-1645A26E.jpg"
    } else {
        image = props.result.profilepic
    }
    return ( 
        <Link to={props.result.id}>
        <div className="search-result-container">
            <img id="search-picture" src={image} />
            <span className="search-result-name">{props.result.firstName}</span>
            <span className="search-result-id">@{props.result.id}</span>
        </div>
        </Link>
     );
}
 
export default SearchResult;