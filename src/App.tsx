import './App.css';
import Transaction from './Pages/Transaction/index.tsx';
import Welcome from './Pages/Welcome/index.tsx';
import { Redirect, Route, Switch } from "react-router-dom"

function App() {
    return ( 
        <div className = "App">
            <Switch>
                <Route path = "/welcome" component={Welcome}/>
                <Route path = "/transaction" component={Transaction}/>
                <Redirect to = '/welcome'/>
            </Switch>
        </div>
    );
}

export default App;