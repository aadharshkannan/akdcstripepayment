import React,{Component} from "react";
import { connect } from "react-redux";
import {ethers} from "ethers"
import erc20ABI from './abi/erc20ABI';
import metaMaskLogo from './assets/MetaMask_Fox.svg.png';
import msftLogo from './assets/msftlogo.png';
import akdcLogo from './assets/ak-dc.png';
import usdcLogo from './assets/usdc-logo.png'
import cbdcLogo from './assets/cbdc-logo.png'
import gsnLogo from './assets/gsn-logo.png';
import loadingLogo from './assets/loading.gif'
import './assets/cryptocheckout.css';
import axios from "axios";
import detectEthereumProvider from '@metamask/detect-provider';
import {RelayProvider} from '@opengsn/provider';

class CryptoCheckout extends Component{

    constructor(props)
    {
        super(props);
        
        this.state = {displayState:"init",
                     txHash:"",
                     customerWallet:"",
                     currencyIdx:0,
                     chain:"",
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

        this.acountChangeHandlerGSN = this.acountChangeHandlerGSN.bind(this);
        this.signHandlerGSN = this.signHandlerGSN.bind(this);

        this.usdcSelect = React.createRef();
        this.akdcSelect = React.createRef();
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

           console.log(chainId)
           
           if(chainId === 5 || chainId === 3)
           {
                window.ethereum.on('accountsChanged',
                (accounts)=>{this.acountChangeHandler(accounts[0])} 
                );
    
                window.ethereum.request({method:'eth_requestAccounts'})
                .then(result=>{
                    this.acountChangeHandler(result[0]);
                });
           }
           else
           {
            window.ethereum.on('accountsChanged',
            (accounts)=>{this.acountChangeHandlerGSN(accounts[0])} 
            );

            window.ethereum.request({method:'eth_requestAccounts'})
            .then(result=>{
                this.acountChangeHandlerGSN(result[0]);
            });
           }                                
        } 
        catch(e) 
        {
            this.setState({displayState:"No Metamask"}); 
            return
        }
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


    redableNumber(balancenum,digitval)
    {
        let bnum = balancenum.toNumber();
        let tkbal = bnum/Math.pow(10,digitval);
        return +(tkbal.toFixed(2))
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

        this.setState(
            {
                displayState:"balance",
                customerWallet:newAddress,
                usdcContract:tempContractUSDC,
                akdcContract:tempContractAKDC,
                chain:"ethereum",
                signer:tempSigner,
                provider:tempProvider,
                balances:[this.redableNumber(usdcBalance,usdcDecimals),
                          this.redableNumber(akdcBalance,akdcDecimals)],
                decimals:[usdcDecimals,akdcDecimals]
            });        
    }

    async acountChangeHandlerGSN(newAddress){
        let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        let tempSigner = tempProvider.getSigner();
        let tempContractAKDC = new ethers.Contract(this.props.gsn.contract,
            erc20ABI,
            tempSigner);
        
        let akdcBalance = await tempContractAKDC.balanceOf(newAddress);
        let akdcDecimals = await tempContractAKDC.decimals()                

        this.setState(
            {
                displayState:"balance",
                customerWallet:newAddress,
                usdcContract:null,
                akdcContract:tempContractAKDC,
                chain:"polygon",
                currencyIdx:1,
                signer:tempSigner,
                provider:tempProvider,
                balances:[0,
                          this.redableNumber(akdcBalance,akdcDecimals)],
                decimals:[1,akdcDecimals]
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

    async signHandlerGSN(){

        var idx = 1

        this.setState({displayState:"signing"})
        
        const gsnConfig = { 
            paymasterAddress:this.props.gsn.payMaster,
            preferredRelays:[this.props.gsn.preferredRelay],
            relayLookupWindowBlocks: 900,
            relayRegistrationLookupBlocks: 900,
            pastEventsQueryMaxPageSize: 900,            
            loggerConfiguration: {
                logLevel: 'debug'
            }
        }

        var newRelayProvider = await RelayProvider.newProvider({ provider: window.ethereum, 
            config: gsnConfig }).init()

        const provider = new ethers.providers.Web3Provider(newRelayProvider);
        const signer = provider.getSigner();

        var contractObjNew = new ethers.Contract(this.props.gsn.contract,
            erc20ABI,
            signer);
        let transferAmount = Math.round(this.props.totals[idx]*Math.pow(10,
            this.state.decimals[idx])) 

        var txt = await contractObjNew.transfer(this.props.storeWallet,
            transferAmount);
        
        let resp = await axios.post(this.props.callBack,{            
            customerWallet:this.state.customerWallet,
            transactionHash: txt.hash,
            chain:this.state.chain,       
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
    
            window.location = `${resp.data.redirect}&chain=polygon`;
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

    renderBalance(inProgress = false)
    {
        const chainStyleLabel = `chain-style-${this.state.chain}`
        const chainStyleGSNLogo = `chain-style-gsn-${this.state.chain}`

        var btnClassName = "row currency-action"
        var loadingClassName = "sign-loading-action"
        var akdcChecked = false;

        if(this.akdcSelect.current)
        {
            akdcChecked = this.akdcSelect.current.checked
        }

        if(inProgress)
        {
            btnClassName = "row currency-inaction"
            loadingClassName = "sign-loading-inaction"            
        }

        var sighHandFn = this.signHandler
        if(this.state.chain==="polygon")
        {
            sighHandFn = this.signHandlerGSN;
            akdcChecked=true
        }

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
                <label className={chainStyleLabel}>
                    <input className="with-gap" name="group3" type="radio" defaultChecked ref={this.usdcSelect} onChange = {this.radioButtonHandler}/>
                    <span className="curr-chicklet"><img className="curr-logo" src={usdcLogo} alt="usdc-logo"></img> USDC (you have {this.state.balances[0]})</span>
                </label>
                <label>&nbsp;</label>
                <label>
                    <input className="with-gap" name="group3" type="radio" onChange = {this.radioButtonHandler} ref={this.akdcSelect} checked={akdcChecked}/>
                    <span className="curr-chicklet"><img className="curr-logo" src={akdcLogo} alt="akdc-logo"></img> AKDC (you have {this.state.balances[1]})</span>
                </label>
                <label>
                    <input className="with-gap" name="group5" type="radio" disabled={true}/>
                    <span className="curr-chicklet"><img className="curr-logo" src={cbdcLogo} alt="cbdc-logo"></img> CBDC (Coming Soon)</span>
                </label>
            </span>
            <div className={loadingClassName}>
                <span>
                    <img alt="loading" src={loadingLogo}>
                    </img>
                    &nbsp; Gas free signing in progress
                </span>
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
                <span className="msft-logo">Powered by &nbsp;<img src={msftLogo} alt="Microsoft"></img></span><span className={chainStyleGSNLogo}> and <img alt="gsn" src={gsnLogo}></img></span>
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

            case "signing":
                return this.renderBalance(true);
            
            default:
                return(<div className="metamask-not-found">Unable to connect to Metamask</div>)
        }
    }


}

function mapStateToProps({auth}){
    return {auth};
}

export default connect(mapStateToProps)(CryptoCheckout);