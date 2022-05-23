import React,{Component} from "react";
import { connect } from "react-redux";
import loadingPng from '../assets/spinning.gif';
import axios from "axios";
import ProductConfirmationCard from "./ProductConfirmationCard";

class ShoppingConfirmation extends Component{

    constructor(props)
    {
        super(props);
        
        var qPM = new URLSearchParams(this.props.location.search);
        var txH = qPM.get('txhash')
        
        this.state = {displayState:"loading",
                     transactionStatus:txH,
                     customerWallet:"",
                     transactionHash:"",
                     currency:"",
                     total:0,
                     prodIds:[],
                     qtys:[],
                     prodNames:[],
                     prodUrls:[],
                     prodPrices:[]
                     }
        this.getTxHDetails = this.getTxHDetails.bind(this)
        this.renderReady = this.renderReady.bind(this)
    }

    async componentDidMount()
    {
        
        var data = await this.getTxHDetails()

        var stateData = {
            displayState:"ready",
            transactionStatus:data.transactionStatus,
            customerWallet:data.customerWallet,
            transactionHash:data.transactionHash,
            currency:data.currency,
            total:data.total,
            prodIds:data.prodIds,
            qtys:data.qtys,
            prodNames:data.prodNames,
            prodUrls:data.prodUrls,
            prodPrices:data.prodPrices
        }

        if(data.transactionStatus === "Pending")
        {
           this.interval = setInterval(() => this.tick(), 10000);
        }

        this.setState(stateData);
        
    }
    
    async tick()
    {
        var data = await this.getTxHDetails();

        if(data.transactionStatus !== "Pending")
        {
            clearInterval(this.interval);
        }

        this.setState({transactionStatus:data.transactionStatus});
    }

    async getTxHDetails()
    {
        var qPM = new URLSearchParams(this.props.location.search);
        var txH = qPM.get('txhash')

        var getS =  `/api/shopping/txstatus?transactionHash=${txH}`;
        var resp = await axios.get(getS);

        return resp.data;
    }

    componentWillUnmount()
    {
        clearInterval(this.interval);
    }

    renderReady()
    {
        var summaryCard = [];
        summaryCard.push(
            <div className="row shopping-top-card" key="summary_card">
                <div className="col s9">
                    <div className="shopping-top-label ">Transaction is {this.state.transactionStatus.toLowerCase()}</div>
                    <div className="shopping-wallet-info-total">Total {this.state.total} {this.state.currency}</div>                     
                    <div className="shopping-wallet-info-hash">Transaction Hash {this.state.transactionHash}</div>
                    <div className="shopping-wallet-info-hash">paid using {this.state.customerWallet}</div>                   
                </div>
            </div>
        );

        var itemCnt = this.state.prodIds.length;
        var items = [];
        for(var i=0;i<itemCnt;i++)
        {
            var key = `prod_${i}`
            items.push(<div className="col s3" key= {key}>
                        <ProductConfirmationCard 
                                    data={{
                                        id:this.state.prodIds[i],
                                        name:this.state.prodNames[i],
                                        img:this.state.prodUrls[i],
                                        price:this.state.prodPrices[i],
                                        currency:this.state.currency,
                                        qty:this.state.qtys[i]
                                    }}                                    
                                    idx={i}>                
                        </ProductConfirmationCard>
                      </div>);                                  
        }
        summaryCard.push(<div key="product_cards" className="row">{items}</div>);

        return(summaryCard);
    }    

    render()
    {
        switch(this.state.displayState)
        {
            case "ready":
                return this.renderReady();

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

export default connect(mapStateToProps)(ShoppingConfirmation);