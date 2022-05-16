import axios from "axios";
import React,{Component} from "react";
import { connect } from "react-redux";
import loadingPng from '../assets/spinning.gif';

class PaymentsConfirmation extends Component{    
    constructor(props){
        super(props);

        this.state = {walletAddress:'', 
        amount:'', 
        displayState:'Working'};        
    }

    async componentDidMount(){
        const payment_intent = new URLSearchParams(window.location.search).get("payment_intent");
        const result = new URLSearchParams(window.location.search).get("redirect_status");

        console.log(result);
        console.log(payment_intent);

        if(result!=="succeeded")
        {
            this.setState({walletAddress:"unknown",
                amount:"NA",
                displayState:'Failed'
                });
        }

        let res = await axios.get('/api/payments/confirmation', { params: { payment_intent: payment_intent } });
        res = res.data;
        
        console.log(res);

        if(res.stripePaymentIntentId)
        {
            this.setState({walletAddress:res.destWallet,
            amount:res.amount,
            displayState:'Confirmed'
            });
        }
        else
        {
            this.setState({walletAddress:"unknown",
                amount:"NA",
                displayState:'Failed'
                });
        }
        
    }

    render(){
        switch(this.state.displayState)
        {
            case "Failed":
                return(<div className="error-message-anywhere">Your transaction failed. Please contact Aadharsh.</div>)
            
            case "Confirmed":
                return(<div className="transaction-success-message row">
                    <h3>Thank You</h3>
                    <div>We will soon transfer ${this.state.amount} worth of AKDC to {this.state.walletAddress}</div>
                    </div>);
            default:
                return(
                <div className="row">
                    <div className="payment-form-label">Fetching Transaction Details</div>
                    <img src = {loadingPng} alt="Fetching..."/>
                </div>
                );
        }
    }


}
function mapStateToProps({auth}){
    return {auth};
}

export default connect(mapStateToProps)(PaymentsConfirmation);