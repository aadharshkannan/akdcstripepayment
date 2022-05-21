import React,{Component} from "react";
import noimage from '../assets/product_no_image.png';

class ProductConfirmationCard extends Component{

    constructor(props)
    {
        super(props);
        
        const {id,name, img, price, qty,currency} = props.data;
       
        this.state = {id:id,
                      name:name,
                      img:img,
                      price:price,
                      currency:currency,
                      qty:qty};
    }

    
    render()
    {

        const noimgerr = ({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
            currentTarget.src=noimage;
          };

        return(
        <div className="product product-conf">
            <div className="product-image">
                <img src={this.state.img} 
                    alt={this.state.id}
                    onError={noimgerr}/>
            </div>
            <div className="product-details">
                <h4 className="product-name">{this.state.name}</h4>
                <p className="product-price">{this.state.price} {this.state.currency}</p>
                <p className="product-qty">{this.state.qty} Count</p>                
            </div>
        </div>);            
    }
}

export default ProductConfirmationCard;