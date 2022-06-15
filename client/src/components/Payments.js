import React,{Component} from "react";
import { connect } from "react-redux";
import axios from "axios";
import {loadStripe} from '@stripe/stripe-js';
import {Elements} from '@stripe/react-stripe-js';
import loadingPng from '../assets/spinning.gif';
import CheckoutForm from "./CheckoutForm";

class Payments extends Component{    
    constructor(props){
        super(props);

        this.state = {walletAddress:'', amount:20, clientSecret:'',paymentState:'unsubmitted'};

        this.labRef = React.createRef();
        this.akdcRef = React.createRef();
        this.wallRef = React.createRef();
        this.amtRef = React.createRef();

        this.handleAmountChange = this.handleAmountChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleAmountChange(event){
        
        var amount = +((event.target.value/10.0).toFixed(2))

        this.labRef.current.innerText=amount;        
        this.akdcRef.current.innerText =amount;
        
        this.setState({walletAddress:this.state.walletAddress,
            amount:amount,
            paymentState:'unsubmitted'});

    }

    handleTextChange(event){
        this.setState({walletAddress:event.target.value,
            amount:this.state.amount,
            paymentState:'unsubmitted'});
    }

    async handleSubmit(event){
        
        this.setState({walletAddress:this.state.walletAddress,
            amount:this.state.amount,
            paymentState:'processing'});

        const paymentIntentSecret = await axios.post('/api/payments/intent',
        {
            walletAddress:this.state.walletAddress,
            amount:this.state.amount

        });

        const clientSecret = paymentIntentSecret.data.clientSecret;

        this.setState({clientSecret:clientSecret,
            paymentState:"readypay"
        });
    }

    renderFormPage(clientSecret)
    {
        const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY);
        const options ={clientSecret}

        return(<div>{clientSecret && (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
          )}</div>);
    }

    renderLoadingPage()
    {
        return(
            <div className="row">
                <div className="payment-form-label">Fetching Stripe form</div>
                <img src = {loadingPng} alt="Processing..."/>
            </div>
        );
    }
        
    render(){
        
        switch(this.state.paymentState)
        {
            case "processing":
                return this.renderLoadingPage()
            case "readypay":
                return this.renderFormPage(this.state.clientSecret);                                    
            default:
                return(
                    <div>
                        <div className="row">
                                &nbsp;
                        </div>
                        <div ref={this.formSectionRef}>                    
                            <form className="col s12">
                            <div className="row">
                                <div className="payment-form-label">Destination Wallet Address (Goerli)</div>  
                                <div className="payment-form-warning">Please verify carefully. Currency is lost in case of typographic errors.</div>
                                <div className="input-field col s6">                    
                                <input ref={this.wallRef} id="wallet_address" type="text" className="validate" onChange={this.handleTextChange}/>                  
                                </div>                
                            </div>
                            <div className="row">
                                <div className="payment-form-label">Amount $<span ref={this.labRef}>20.00</span> gives you <span ref={this.akdcRef}>20.00</span> AKDCs</div>  
                                <div className="input-field col s6">                    
                                    <input ref={this.amtRef} type="range" min="100" max="1000" defaultValue="200" onChange={this.handleAmountChange}/>                 
                                </div>                
                            </div>
                            <button className="btn waves-effect waves-light btn-large" type="button" name="action" onClick={this.handleSubmit}><span>Buy</span>
                                <i className="large material-icons">attach_money</i>
                            </button>         
                            </form>
                        </div>                
                    </div>
                );
        }
    }
}

function mapStateToProps({auth}){
    return {auth};
}

export default connect(mapStateToProps)(Payments);