import React,{Component} from "react";
import { connect } from "react-redux";
import {ethers} from "ethers"
import erc20ABI from './erc20ABI';
import metaMaskLogo from './MetaMask_Fox.svg.png';
import msftLogo from './msftlogo.png';
import akdcLogo from './ak-dc.png';
import usdcLogo from './usdc-logo.png'
import cbdcLogo from './cbdc-logo.png'
import './cryptocheckout.css';
import axios from "axios";

class CryptoCheckout extends Component{

    constructor(props)
    {
        super(props);
        
        this.state = {displayState:"init",
                     txHash:"",
                     customerWallet:"",
                     currencyIdx:0,
                     usdcContract:null,
                     akdcContract:null,
                     signer:null,
                     provider:null,
                     decimals:[]}

        this.renderBalance= this.renderBalance.bind(this);
        this.buttonHandler = this.buttonHandler.bind(this);
        this.acountChangeHandler = this.acountChangeHandler.bind(this);
        this.signHandler = this.signHandler.bind(this);  
        this.radioButtonHandler = this.radioButtonHandler.bind(this);

        this.usdcSelect = React.createRef();
    }

    async signHandler()
    {
        var idx = 1
        var contract = this.state.akdcContract;

        if(this.usdcSelect.current.checked)
        {
            idx = 0
            contract = this.state.usdcContract    
        }

        let transferAmount = Math.round(this.props.totals[idx]*Math.pow(10,this.state.decimals[idx])) 
        let txt = await contract.transfer(this.props.storeWallet,transferAmount);

        let resp = await axios.post(this.props.callBack,{            
            customerWallet:this.state.customerWallet,
            transactionHash: txt.hash,        
            currency:this.props.supported_currency[idx],
            total: this.props.totals[idx],
            prodPrices:this.props.prodPrices[idx],
            metadata:this.props.metadata
            },
            {
                headers: {
                  'Content-Type': 'application/json'
                }
            });

        console.log(resp);
        window.location = resp.data.redirect;
    }

    async buttonHandler()
    {
        try 
        {
            // Request account access
            await window.ethereum.enable();
            window.ethereum.request({method:'eth_requestAccounts'})
            .then(result=>{
                this.acountChangeHandler(result[0]);
            })            
        } 
        catch(e) 
        {
            this.setState({displayState:"No Metamask"}); 
            return
        }
    }

    async acountChangeHandler(newAddress){

        let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        let tempSigner = tempProvider.getSigner();
        let tempContractAKDC = new ethers.Contract(this.props.akdcContract,
            erc20ABI,
            tempSigner);
        let tempContractUSDC = new ethers.Contract(this.props.usdcContract,
                erc20ABI,
                tempSigner);
        
        let akdcBalance = await tempContractAKDC.balanceOf(newAddress);
        let usdcBalance = await tempContractUSDC.balanceOf(newAddress);
        
        let akdcDecimals = await tempContractAKDC.decimals()
        let usdcDecimals = await tempContractUSDC.decimals()

        
        function redableNumber(balancenum,digitval)
        {
            let bnum = balancenum.toNumber();
            let tkbal = bnum/Math.pow(10,digitval);
            return +(tkbal.toFixed(2))
        }

        this.setState(
            {
                displayState:"balance",
                customerWallet:newAddress,
                usdcContract:tempContractUSDC,
                akdcContract:tempContractAKDC,
                signer:tempSigner,
                provider:tempProvider,
                balances:[redableNumber(usdcBalance,usdcDecimals),
                          redableNumber(akdcBalance,akdcDecimals)],
                decimals:[usdcDecimals,akdcDecimals]
            });        
    }


    renderInit()
    {
        return(
            <div className="row crypto-payment-header">
                <div className="metamask-logo"><img src={metaMaskLogo} alt="MetaMask"></img></div>
                <button className="btn waves-effect waves-light btn-small" 
                    type="button" 
                    name="action"
                    onClick={this.buttonHandler}>
                        Connect
                </button>
                <div className="msft-logo">Powered by &nbsp;<img src={msftLogo} alt="Microsoft"></img></div>                
            </div>
        );
    }

    radioButtonHandler()
    {
        var idx = 1
        if(this.usdcSelect.current.checked)
        {
            idx = 0    
        }
        this.setState({currencyIdx:idx});
    }

    renderBalance()
    {
        return(
        <div className="row checkout-card-sign">
            
            <div className="row">
                <div className="col s12 m6">
                <div className="card">
                    <div className="card-content">
                    <span className="card-title">Your Address</span>
                        <p>{this.state.customerWallet}</p>
                    </div>
                    <div className="card-action-from">
                        Transferring {this.props.totals[this.state.currencyIdx]} {this.props.supported_currency[this.state.currencyIdx]}
                    </div>
                </div>
                </div>
                <div className="col s12 m6">
                <div className="card">
                    <div className="card-content">
                    <span className="card-title">Store Address</span>
                        <p>{this.props.storeWallet}</p>
                    </div>
                    <div className="card-action-to">
                        Receiving {this.props.totals[this.state.currencyIdx]}  {this.props.supported_currency[this.state.currencyIdx]}
                    </div>
                </div>
                </div>
                
            </div>
            <span className="currency-list">
                <label>
                    <input className="with-gap" name="group3" type="radio" defaultChecked ref={this.usdcSelect} onChange = {this.radioButtonHandler}/>
                    <span className="curr-chicklet"><img className="curr-logo" src={usdcLogo} alt="usdc-logo"></img> USDC (you have {this.state.balances[0]})</span>
                </label>
                <label>&nbsp;</label>
                <label>
                    <input className="with-gap" name="group3" type="radio" onChange = {this.radioButtonHandler}/>
                    <span className="curr-chicklet"><img className="curr-logo" src={akdcLogo} alt="akdc-logo"></img> AKDC (you have {this.state.balances[1]})</span>
                </label>
                <label>
                    <input className="with-gap" name="group5" type="radio" disabled={true}/>
                    <span className="curr-chicklet"><img className="curr-logo" src={cbdcLogo} alt="akdc-logo"></img> CBDC (Coming Soon)</span>
                </label>
            </span>
            <div className="row currency-action">
                <button className="btn waves-effect waves-light btn-small" 
                        type="button" 
                        name="action"
                        onClick={this.signHandler}>
                        Sign   
                </button>
            </div>

            <div className="row msft-branding">
                <span className="msft-logo">Powered by &nbsp;<img src={msftLogo} alt="Microsoft"></img></span>
            </div>            
        </div>
        );
    }

    render()
    {
        switch(this.state.displayState)
        {            
            case "init":
                return this.renderInit();

            case "balance":
                return this.renderBalance();           
            
            default:
                return(<div className="metamask-not-found">Unable to connect to Metamask</div>)
        }
    }


}

function mapStateToProps({auth}){
    return {auth};
}

export default connect(mapStateToProps)(CryptoCheckout);