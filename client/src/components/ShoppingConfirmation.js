import React,{Component} from "react";
import { connect } from "react-redux";

class ShoppingConfirmation extends Component{

    constructor(props){
        super(props);

        this.state = {}
    }


}

function mapStateToProps({auth}){
    return {auth};
}

export default connect(mapStateToProps)(ShoppingConfirmation);