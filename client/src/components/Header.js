import React,{Component} from "react";
import { connect } from "react-redux";
import currlogo from '../assets/AKDCLogo.png';
import glogo from '../assets/GLogo.png';
import spinning from '../assets/spinning.gif';

import '../assets/format.css';

class Header extends Component{    

    getSingleImage(srcloc,alttxt,anch=null){

        return(
            <li key={alttxt+"1"}><a href="/api/logout"><div className="image-cropper"><img alt={alttxt} src={srcloc} /></div></a></li>
        );
    }

    getCreatorWithImage(srcloc,alttxt,creator){
        let buffer = [];
        buffer.push(<li key={alttxt+"2"}><div className="login-creator-mode">Admin Mode</div></li>);
        buffer.push(this.getSingleImage(srcloc,alttxt));

        return(buffer);
    }

    getAnchorImage(srcloc,alttxt,anch){

        return(
            <li><a href={anch}><img alt={alttxt} className="login-logo-header" src={srcloc} /></a></li>
        );
    }

    
    renderContent(){

        const svar = this.props.auth;

        if(svar==null)
        {
            return this.getSingleImage(spinning,"Loading");
        }

        if(svar.message==="Nobody")
        {
            return this.getAnchorImage(glogo,"Google logo","/auth/google");
        }

        const userImg = svar.user.googleDisplayPicURL;
        
        if(svar.auth && svar.auth.authorizationString)
        {
            return this.getCreatorWithImage(userImg,"User Logo",svar.user.googleDisplayName);
        }
        
        return this.getSingleImage(userImg,"User Logo");                    
    }
    render(){
        return(
            <nav className="header-color black-text">
                <div className="nav-wrapper">
                <a href="/" className="brand-logo left"><img alt="AKDC logo" className="brand-logo-header" src={currlogo}/></a>
                <ul className="right hide-on-med-and-down">
                    {this.renderContent()}
                </ul>
                </div>
            </nav>
        );
    }
}

function mapStateToProps({auth}){
    return {auth};
}

export default connect(mapStateToProps)(Header);