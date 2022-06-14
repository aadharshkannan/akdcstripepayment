import React,{Component} from "react";
import { connect } from "react-redux";
import {ethers} from "ethers"

import erc20ABI from './abi/erc20ABI';
import emitContractABI from './abi/EmitAndTransfer';

import metaMaskLogo from './assets/MetaMask_Fox.svg.png';
import msftLogo from './assets/msftlogo.png';
import akdcLogo from './assets/ak-dc.png';

import polygonLogo from './assets/polygon-matic-logo.png'
import solLogo from './assets/solana-sol-logo.png'

import './assets/cryptocheckout.css';
import axios from "axios";
import detectEthereumProvider from '@metamask/detect-provider';

class CryptoSwap extends Component{

    constructor(props)
    {
        super(props);
        
        this.state = {displayState:"init",
                     balance:0,
                     decimal:-1,
                     txHash:"",
                     customerWallet:"",
                     allowance:0,
                     signer:null,
                     provider:null}

        this.renderBalance= this.renderBalance.bind(this);
        this.buttonHandler = this.buttonHandler.bind(this);
        this.acountChangeHandler = this.acountChangeHandler.bind(this);
        this.signHandler = this.signHandler.bind(this);
        this.signHandlerConvert = this.signHandlerConvert.bind(this);                          
    }

    async buttonHandler()
    {
        try 
        {
           await detectEthereumProvider();
           
           // Request account access
           if(!window.ethereum)
           {
               throw new Error("Metamask not founr");
           }

           window.ethereum.on('chainChanged', (chainid)=>{this.buttonHandler()});

           const chainId =  parseInt(await window.ethereum.request({ method: 'eth_chainId' }));
           
           if(chainId === 5 || chainId === 3)
           {
                window.alert("Only Polygon Swap Allowed!")
           }
           else
           {
            window.ethereum.on('accountsChanged',
            (accounts)=>{this.acountChangeHandler(accounts[0])} 
            );

            window.ethereum.request({method:'eth_requestAccounts'})
            .then(result=>{
                this.acountChangeHandler(result[0]);
            });
           }                                
        } 
        catch(e) 
        {
            this.setState({displayState:"No Metamask"}); 
            return
        }
    }

    signHandlerConvert()
    {

    }

    readableNumber(balancenum,digitval)
    {
        let bnum = balancenum.toNumber();
        let tkbal = bnum/Math.pow(10,digitval);
        return +(tkbal.toFixed(2))
    }

    async acountChangeHandler(newAddress){

        let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        let tempSigner = tempProvider.getSigner();
        let tempContractAKDC = new ethers.Contract(this.props.swap.currencyContract,
            erc20ABI,
            tempSigner);
        
        let akdcBalance = await tempContractAKDC.balanceOf(newAddress);        
        let akdcDecimals = await tempContractAKDC.decimals();
        let allowance = await tempContractAKDC.allowance(newAddress,
            this.props.swap.emitAndTransferContract);

        this.setState(
            {
                displayState:"balance",
                customerWallet:newAddress,
                balance:akdcBalance,
                signer:tempSigner,
                provider:tempProvider,
                decimal:akdcDecimals,
                allowance:allowance
            });        
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

    renderBalance()
    {
        var btnClassName = "row currency-action"
        var sighHandFn = this.signHandler

        var akdcBalance = this.readableNumber(this.state.balance,this.state.decimal);
        var allowanceBalance = this.readableNumber(this.state.allowance,this.state.decimal);

        return(
        <div className="row checkout-card-sign">
            <div className="row convert-card">
                <div className="col s8 m6">
                    <div className="card">
                        <div className="card-content">
                            <div></div><span className="card-title">Your Address</span>
                                <p>{this.state.customerWallet}</p>
                            </div>                            
                        <div className="swap-chicklet">
                            <img className="curr-logo curr-in-swap" src={akdcLogo} alt="akdc-logo"></img>                        
                            <span className="card-action-to">you have {akdcBalance} AKDCs</span>
                            <span className="card-action-from">and authorized {allowanceBalance}</span>                            
                        </div>
                    </div>
                </div>
                <div className="col s4 m2">
                    <div className="conversion-info">
                        <span className="poly-logo"><img src={polygonLogo} alt="Polygon"></img></span>
                        <span className="to-logo"> to </span>
                        <span className="sol-logo"><img src={solLogo} alt="Solana"></img></span>
                    </div>                    
                </div>                               
            </div>            
            
            <div className={btnClassName}>
                <button className="btn waves-effect waves-light btn-small" 
                        type="button" 
                        name="action"
                        onClick={sighHandFn}>
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

export default connect(mapStateToProps)(CryptoSwap);