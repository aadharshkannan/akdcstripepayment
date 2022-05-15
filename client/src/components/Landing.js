import React from "react";
import currLogoLarge from '../assets/kids-and-money.jpg';

const Landing=()=>{
    return(
        <div style={{textAlign:'center'}}>
            <div className="dctt-banner">Welcome to the Digital Currency Technology Transformation.</div>
            <img className= "banner-image" alt="Large Logo" src={currLogoLarge}></img>
        </div>
    );
};

export default Landing;