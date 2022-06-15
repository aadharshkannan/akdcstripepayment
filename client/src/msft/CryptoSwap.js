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
                     walletAddress:"",
                     currencyContract:null,
                     emitContract:null,
                     amount:-1,
                     allowance:0,
                     signer:null,
                     provider:null}

        this.akdcRef = React.createRef();
                            
        this.renderBalance= this.renderBalance.bind(this);
        this.renderComplete = this.renderComplete.bind(this);
        this.buttonHandler = this.buttonHandler.bind(this);
        this.acountChangeHandler = this.acountChangeHandler.bind(this);
        this.handleAmountChange = this.handleAmountChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);   

        this.authorizeHandler = this.authorizeHandler.bind(this);
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
        let tempEmitContract = new ethers.Contract(this.props.swap.emitAndTransferContract,
            emitContractABI.abi,
            tempSigner)
        
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
                currencyContract:tempContractAKDC,
                emitContract:tempEmitContract,
                provider:tempProvider,
                decimal:akdcDecimals,
                allowance:allowance
            });        
    }   

    async authorizeHandler()
    {
        var transferAmt = this.state.amount*Math.pow(10,this.state.decimal);
        await this.state.currencyContract.approve(this.props.swap.emitAndTransferContract,
            transferAmt);

        this.setState({displayState:"balance"});
    }

    async signHandlerConvert()
    {
        var transferAmt = this.state.amount*Math.pow(10,this.state.decimal);
        var tx = await this.state.emitContract.registerTransfer(this.state.walletAddress,
            transferAmt)
        
        this.setState({displayState:"completed",
        txHash:tx.hash});
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

    handleAmountChange(event){
        
        var amount = +((event.target.value/10.0).toFixed(2))

        this.akdcRef.current.innerText =amount;
        
        this.setState({amount:amount});

    }

    handleTextChange(event){
        console.log(event.target.value)
        this.setState({walletAddress:event.target.value});
    }

    renderBalance()
    {
        var btnClassName = "row currency-action"
        var sighHandFn = this.signHandlerConvert
        var authText = "Sign";
        var maxV = this.state.allowance.toNumber()/10.0;
        var inpClassName = "row currency-action"         

        var akdcBalance = this.readableNumber(this.state.balance,this.state.decimal);
        var allowanceBalance = this.readableNumber(this.state.allowance,this.state.decimal);

        if(this.state.allowance.toNumber()===0)
        {
            authText = "Authorize";
            sighHandFn = this.authorizeHandler
            maxV = this.state.balance.toNumber()/10.0;
            inpClassName = "row currency-inaction"            
        }

        return(
        <div className="row checkout-card-sign">
            <div className="row convert-card">
                <div className="col s6 m6">
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

            <div className="row">
                <div className="payment-form-label">{authText} <span ref={this.akdcRef}>10.00</span> AKDCs</div>  
                <div className="input-field col s6">                    
                    <input ref={this.amtRef} type="range" min="100" max={maxV} defaultValue="100" onChange={this.handleAmountChange}/>                 
                </div>                
            </div>            
            <div className={inpClassName}>
                <div className="payment-form-label">Destination Wallet Address (Solana)</div>  
                <div className="payment-form-warning">Please verify carefully. Currency is lost in case of typographic errors.</div>
                <div className="input-field col s6">                    
                <input ref={this.wallRef} id="wallet_address" type="text" className="validate" onChange={this.handleTextChange}/>                  
                </div>                
            </div>
            <div className={btnClassName}>
                <button className="btn waves-effect waves-light btn-small" 
                        type="button" 
                        name="action"
                        onClick={sighHandFn}>                        
                        {authText}  
                </button>
            </div>

            <div className="row msft-branding">
                <span className="msft-logo">Powered by &nbsp;<img src={msftLogo} alt="Microsoft"></img></span>
            </div>            
        </div>
        );
    }

    renderComplete()
    {

        return(
            <div className="row checkout-card-sign">
                <div className="transaction-success-message row">
                    <h3>Success!</h3>
                    <div>We will soon transfer {this.state.amount} AKDCs to Solana {this.state.walletAddress}</div>
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
            
            case "completed":
                return this.renderComplete();
            
            default:
                return(<div className="metamask-not-found">Unable to connect to Metamask</div>)
        }
    }
}

function mapStateToProps({auth}){
    return {auth};
}

export default connect(mapStateToProps)(CryptoSwap);