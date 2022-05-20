import React,{Component} from "react";
import { connect } from "react-redux";
import spinning from '../assets/spinning.gif';

import '../assets/format.css';

class Shopping extends Component{

    constructor(props){
        super(props);

        this.state = {
            diplayState:"Loading",
            transactionHash:"",        
            currency:"USDC",
            total:"0 USDC",
            prodIds:[],
            prodNames:[],
            prodUrls:[],
            prodPricesAKDC:[],
            prodPricesUSDC:[],
            transactionStatus:"",
            storeWallet:"",
            usdcContract:"",
            akdcContract:"",
            customerWallet:""};        
    }

    //renderDisplay

    render(){
        return("Shopping Component!");
    }
}

function mapStateToProps({auth}){
    return {auth};
}

export default connect(mapStateToProps)(Shopping);