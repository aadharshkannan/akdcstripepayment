import React,{Component} from "react";
import { connect } from "react-redux";
import loadingPng from '../assets/spinning.gif';
import axios from "axios";

import '../assets/format.css';
import ProductCard from "./ProductCard";
import CryptoCheckout from "../msft/CryptoCheckout";

class Shopping extends Component{

    constructor(props){
        super(props);

        this.state = {
            //component state
            diplayState:"Loading",
            //metadata                        
            prodIds:[],
            prodNames:[],
            prodUrls:[],
            prodQtys:[],
            prodPricesAKDC:[],
            prodPricesUSDC:[],
            catalog:[],
            //mandatory props for wallet component
            //also needs a callback address
            supported_currency:["USDC","AKDC"],
            totals:[0,0],
            storeWallet:"",
            //these not needed in a final implementation
            usdcContract:"",
            akdcContract:""
        };

        this.handleBuy = this.handleBuy.bind(this);
        this.handleChildProductAdd = this.handleChildProductAdd.bind(this);
    }
    
    async componentDidMount(){

        const addresses = await axios.get('/api/shopping/storewallet');
        const catalog = await axios.get('/api/shopping/catalog');
        
        this.setState(
            {
                diplayState:"Catalog",
                storeWallet:addresses.data.storeWallet,
                usdcContract:addresses.data.usdcContract,
                akdcContract:addresses.data.akdcContract,
                catalog: catalog.data
            });
    }

    handleChildProductAdd(idx)
    {
        var prodIds = this.state.prodIds;
        var prodNames = this.state.prodNames;
        var prodUrls = this.state.prodUrls;
        var prodQtys = this.state.prodQtys;
        var prodPricesAKDC = this.state.prodPricesAKDC;
        var prodPricesUSDC = this.state.prodPricesUSDC;
        var totals = this.state.totals;

        var pIdx = prodIds.indexOf(idx.id);
        
        if(pIdx===-1)
        {
            prodIds.push(idx.id);
            prodNames.push(idx.name);
            prodUrls.push(idx.img);
            prodQtys.push(0);
            prodPricesAKDC.push(idx.akdcPrice);
            prodPricesUSDC.push(idx.usdcPrice);
            pIdx = prodIds.length-1;
        }

        prodQtys[pIdx] = prodQtys[pIdx] + 1;
        totals[0] = +((totals[0] + prodPricesUSDC[pIdx]).toFixed(2));
        totals[1] = +((totals[1] + prodPricesAKDC[pIdx]).toFixed(2));
        
        this.setState({
            prodIds:prodIds,
            prodNames:prodNames,
            prodUrls:prodUrls,
            prodQtys:prodQtys,
            prodPricesAKDC:prodPricesAKDC,
            prodPricesUSDC:prodPricesUSDC,
            totals:totals
        });
    }

    handleBuy()
    {        
        this.setState({diplayState:"Buy"});
    }

    renderCatalog(){

        var ak = this.state.totals[1]
        var us = this.state.totals[0]

        var sav = +((us-ak).toFixed(2));
        var savp = Math.round(sav*100/(us+0.001));

        var itemCnt = this.state.catalog.length;

        var final = [];
        var items = [];

        final.push( 
        <div className="row shopping-top-card" key="product_headers">
            <div className="col s9">
                <div className="row shopping-top-label ">Total Amount
                    <span className="shopping-currency-us">&nbsp;{this.state.totals[0]} USDC</span>
                    <span className="shopping-currency-ak">&nbsp;(OR) {this.state.totals[1]} AKDC</span>
                </div>
                <div className ="row shopping-currency-saving">Pay with AKDC and save
                    <span>&nbsp;{sav} USDC ({savp}%)</span>
                </div>
            </div>
            <button className="btn waves-effect waves-light btn-large col s3" 
                    type="button" 
                    name="action" 
                    onClick={this.handleBuy}>
                    <span>Buy</span>
                <i className="large material-icons">attach_money</i>
            </button>                                        
        </div>    
        );

        for(var i=0;i<itemCnt;i++)
        {
            var key = `prod_${i}`
            items.push(<div className="col s3" key= {key}>
                        <ProductCard 
                                    data={this.state.catalog[i]}                                    
                                    idx={i} 
                                    clickHandler={this.handleChildProductAdd}>                
                        </ProductCard>
                      </div>);
                                  
        }
        final.push(<div key="product_cards" className="row">{items}</div>);

        return(final);
    }

    renderCheckout()
    {
        //expected by MSFT Checkout component
        var metadata = {
            prodIds: this.state.prodIds,
            qtys:this.state.prodQtys,
            prodNames:this.state.prodNames,
            prodUrls: this.state.prodUrls
        }

        var prodPrices = [this.state.prodPricesUSDC,
                          this.state.prodPricesAKDC];

        var supported_currency = ["USDC","AKDC"];
        var totals= this.state.totals;
        var storeWallet = this.state.storeWallet;
        //these not needed in a final implementation
        var usdcContract = this.state.usdcContract;
        var akdcContract=this.state.akdcContract;

        return(<CryptoCheckout metadata={metadata}
            prodPrices = {prodPrices}
            supported_currency = {supported_currency}
            totals = {totals}
            storeWallet = {storeWallet}
            usdcContract = {usdcContract}
            akdcContract = {akdcContract}
            callBack = "/api/shopping/purchase"
            ></CryptoCheckout>)
    }

    //renderDisplay
    render(){        
        switch(this.state.diplayState)
        {
            case "Catalog":
                return this.renderCatalog();
            
            case "Buy":
                return this.renderCheckout();
            
            default:
                return(
                <div className="row">
                    <div className="payment-form-label">Fetching Catalog</div>
                    <img src = {loadingPng} alt="Fetching..."/>
                </div>
                );

        }        
    }
}

function mapStateToProps({auth}){
    return {auth};
}

export default connect(mapStateToProps)(Shopping);