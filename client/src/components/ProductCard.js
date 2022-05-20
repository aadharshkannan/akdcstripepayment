import React,{Component} from "react";
import { connect } from "react-redux";
import noimage from '../assets/product_no_image.png';

class ProductCard extends Component{

    constructor(props)
    {
        super(props);
        
        const {id, sku, name, brand, img, pricing} = props.data;

        const imgUrl = img.split(",");
        var usdcPrice = pricing[0].price;
        var akdcPrice = pricing[1].price;
        
        this.state = {id:id,
                      sku:sku,
                      brand:brand,
                      name:name,
                      img:imgUrl,
                      usdcPrice:usdcPrice,
                      akdcPrice:akdcPrice};

        this.onClick = this.onClick.bind(this);
    }

    onClick()
    {
        this.props.clickHandler(this.state);
    }

    render()
    {

        const noimgerr = ({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
            currentTarget.src=noimage;
          };

        return(
        <div className="product">
            <div className="product-brand">{this.state.brand}</div>
            <div className="product-image">
                <img src={this.state.img} 
                    alt={this.state.brand}
                    onError={noimgerr}/>
            </div>
            <div className="product-details">
                <h4 className="product-name">{this.state.name}</h4>
                <p className="product-price">{this.state.usdcPrice} USDC</p>
                <p className="product-price">{this.state.akdcPrice} AKDC</p>
                <div className="product-action">
                <button className="btn waves-effect waves-light btn-small" 
                    type="button" 
                    name="action"
                    onClick={this.onClick}>
                        <i className="large material-icons">add_shopping_cart</i>
                    </button>
                </div>
            </div>
        </div>);
            
    }
}

function mapStateToProps({auth}){
    return {auth};
}

export default connect(mapStateToProps)(ProductCard);