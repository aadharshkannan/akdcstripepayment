import React,{Component} from "react";
import { connect } from "react-redux";
import loadingPng from '../assets/spinning.gif';
import axios from "axios";

import '../assets/format.css';
import CryptoSwap from "../msft/CryptoSwap";

class CryptoInterchange extends Component{

    constructor(props){
        super(props);

        this.state = {
            //component state
            diplayState:"Loading",
            swap:null
        };
    }
    
    async componentDidMount(){

        const addresses = await axios.get('/api/shopping/storewallet');
        this.setState(
            {
                diplayState:"CryptoSwap",                
                swap: addresses.data.swap
            });
    }

    //renderDisplay
    render(){        
        switch(this.state.diplayState)
        {
            case "CryptoSwap":
                return(<CryptoSwap 
                    swap={this.state.swap}>                
                    </CryptoSwap>);
            
            default:
                return(
                <div className="row">
                    <div className="payment-form-label">Fetching Details</div>
                    <img src = {loadingPng} alt="Fetching..."/>
                </div>
                );

        }        
    }
}

function mapStateToProps({auth}){
    return {auth};
}

export default connect(mapStateToProps)(CryptoInterchange);