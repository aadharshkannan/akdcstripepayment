import React, {Component} from 'react';
import {BrowserRouter,Route} from 'react-router-dom';
import { connect } from 'react-redux';

import * as actions from '../actions';

import Header from './Header';
import Landing from './Landing';
import Payments from './Payments';
import PaymentsConfirmation from './PaymentsConfirmation';
import Shopping from './Shopping';

const AskHelp=()=><div>Please contact Aadharsh. Only he can allow you into this site.</div>;

class App extends Component{
    render(){
        return(
            <div className="container">            
                <BrowserRouter>
                    <div>
                        <Header />
                        <Route exact = {true} path="/" component={Landing} />
                        <Route exact = {true} path="/payments" component={Payments} />                        
                        <Route exact = {true} path = "/payments/confirmation" component={PaymentsConfirmation} />
                        <Route exact={true} path="/shopping" component={Shopping}/>
                        <Route exact = {true} path="/askhelp" component={AskHelp} />
                    </div>
                </BrowserRouter>
            </div>
        );
    }

    componentDidMount(){
        this.props.fetchUser();
    }
};


export default connect(null,actions)(App);