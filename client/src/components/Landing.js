import React from "react";
import currLogoLarge from '../assets/kids-and-money.jpg';
import shoppingImage from '../assets/e-commerce-blog.jpg'
import currencyImage from '../assets/currency.jpg'

const Landing=()=>{
    return(
        <div style={{textAlign:'center'}} className="dctt-banner">
            <a href="/shopping"><img className= "banner-image-left" alt="Left Logo" src={shoppingImage}></img></a>
            <a href="/convert"><img className= "banner-image" alt="Large Logo" src={currLogoLarge}></img></a>
            <a href="/payments"><img  className= "banner-image-right" alt="Right Logo" src={currencyImage}></img></a>                                           
        </div>
    );
};

export default Landing;