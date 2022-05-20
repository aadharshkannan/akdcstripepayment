import React,{Component} from "react";
import { connect } from "react-redux";
import {ethers} from "ethers"
import erc20ABI from './erc20ABI';
import metaMaskLogo from './MetaMask_Fox.svg.png';
import msftLogo from './msftlogo.png';
import './cryptocheckout.css';

class CryptoCheckout extends Component{

    constructor(props)
    {
        super(props);
        
        this.state = {displayState:"init",
                     txHash:"",
                     customerWallet:"",
                     usdcContract:null,
                     akdcContract:null,
                     signer:null,
                     provider:null,
                     decimals:[]}
        this.renderBalance= this.renderBalance.bind(this);
        this.buttonHandler = this.buttonHandler.bind(this);
        this.acountChangeHandler = this.acountChangeHandler.bind(this);
        this.signHandler = this.signHandler.bind(this);  
    }

    async signHandler()
    {
        let transferAmount = Math.round(this.props.totals[0]*Math.pow(10,this.state.decimals[0])) 
        let txt = await this.state.usdcContract.transfer(this.props.storeWallet,transferAmount);
        
        this.setState({displayState:"signed",txHash:txt});
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
        
        console.log(tempContractUSDC.decimals())
        console.log(usdcBalance)

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
                balances:[redableNumber(usdcBalance,6),
                          redableNumber(akdcBalance,2)],
                decimals:[6,2]
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

    renderBalance()
    {
        return(
        <div className="row checkout-card-sign">
            
            <div className="row">
                <div className="col s12 m6">
                <div className="card blue-grey darken-1">
                    <div className="card-content white-text">
                    <span className="card-title">Your Address</span>
                        <p>{this.state.customerWallet}</p>
                    </div>
                    <div className="card-action-from">
                        Transferring {this.props.totals[0]} USDC
                    </div>
                </div>
                </div>
                <div className="col s12 m6">
                <div className="card blue-grey darken-1">
                    <div className="card-content white-text">
                    <span className="card-title">Store Address</span>
                        <p>{this.props.storeWallet}</p>
                    </div>
                    <div className="card-action-to">
                        Receiving {this.props.totals[0]} USDC
                    </div>
                </div>
                </div>
                
            </div>
            <span>
                <label>
                    <input className="with-gap" name="group3" type="radio" defaultChecked />
                    <span>USDC (you have {this.state.balances[0]})</span>
                </label>
                <label>&nbsp;</label>
                <label>
                    <input className="with-gap" name="group5" type="radio" />
                    <span>AKDC (you have {this.state.balances[1]})</span>
                </label>
            </span>
            <div className="row">
                <button className="btn waves-effect waves-light btn-small" 
                        type="button" 
                        name="action"
                        onClick={this.signHandler}>
                        Sign   
                </button>
            </div>

            <div className="row">
                <div className="msft-logo">Powered by &nbsp;<img src={msftLogo} alt="Microsoft"></img></div>
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
                return this.renderBalance();;

            case "signed":
                return(
                    <div className="row checkout-card-sign">
                        <div>Transaction Complete! TxHash: {this.state.txHash}</div>
                        <div>Will redirect you soon...</div>
                        <div className="row">
                            <div className="msft-logo">Powered by &nbsp;<img src={msftLogo} alt="Microsoft"></img></div>
                        </div>  
                    </div>
                );    
            
            default:
                return(<div className="metamask-not-found">Unable to connect to Metamask</div>)
        }
    }


}

function mapStateToProps({auth}){
    return {auth};
}

export default connect(mapStateToProps)(CryptoCheckout);