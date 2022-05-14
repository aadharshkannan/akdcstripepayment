import React,{Component} from "react";
import currlogo from '../assets/AKDCLogo.png';
import '../assets/format.css';

class Header extends Component{
    render(){
        return(
            <nav className="green lighten-3 black-text">
                <div className="nav-wrapper">
                <a href="/" className="brand-logo left"><img className="brand-logo-header" src={currlogo}/></a>
                <ul class="right hide-on-med-and-down">
                    <li><a href="sass.html">Sass</a></li>
                    <li><a href="badges.html">Components</a></li>
                    <li><a href="collapsible.html">JavaScript</a></li>
                    </ul>
                </div>
            </nav>
        );
    }
}

export default Header;