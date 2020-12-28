import React, { Component } from 'react';
import { HashRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom"; // HashRouter -> BrowserRouter
import './App.css';
import axios from './axiosConfig';
import Pizza from './Pizza';
import { ProductPizza, CartItem, CartHash, cartArrToHash, cartAdd, User, SpaConfig, CurrencyName, priceCalcFloat, priceSymb } from './util';
import { storageValidCart, storageValidCurrency, storageSet } from './utilStorage';
import LoginForm from './LoginForm';
import OrderForm from './OrderForm';
import Profile from './Profile';
import * as apiHelper from './apiHelper';


class App extends Component<{}, {
  spaConfig: SpaConfig,
  currency: CurrencyName,
  appCrashed: any,
  appLoading: string | null,
  user: User | null,
  productList: ProductPizza[] | null,
  cart: CartItem[],
  cartHash: CartHash,
}> {
  constructor(props: any) {
    super(props);
    const cartStorage = storageValidCart();
    this.state = {
      spaConfig: null as unknown as SpaConfig,
      currency: storageValidCurrency(),
      appCrashed: null,
      appLoading: null,
      user: null,
      productList: null,
      cart: cartStorage || [],
      cartHash: cartArrToHash(cartStorage),
    };
    this.addToCart = this.addToCart.bind(this);
    this.login = this.login.bind(this);
    this.logoutAction = this.logoutAction.bind(this);
    this.handleCurrencyChange = this.handleCurrencyChange.bind(this);
    this.orderDone = this.orderDone.bind(this);
  }
  orderDone() {
    this.setState({ cart: [], cartHash: cartArrToHash([]) });
  }
  handleCurrencyChange(event: React.FormEvent<HTMLSelectElement>) {
    const currency = event.currentTarget.value;
    this.setState({ currency: currency as CurrencyName });
    storageSet('pizzaCurrency', currency, false);
  }
  addToCart(id: number, n: number) {
    this.setState(prevState => {
      const cartState = cartAdd(prevState.cart, id, n);
      storageSet('pizzaCart', cartState.cart, true);
      return cartState;
    });
  }
  login(user: User | null) {
    this.setState({ user });
  }
  logoutAction(event: React.FormEvent<HTMLAnchorElement>) {
    event.preventDefault();
    (async () => {
      try {
        this.setState({ appLoading: 'Logging out...' });
        var logoutSuccess = (await axios.post('/auth/logout')).data.success;
        if (logoutSuccess) {
          this.setState({ user: null, appLoading: null });
        }
      } catch (e) {
        this.setState({ appCrashed: 'Unfortunately, an error occurred while trying to communicate with backend service. Please try again later. ' + (e?.message || e) });
      }
    })();
  }
  async componentDidMount() {
    this.setState({ appLoading: 'Loading application...' });
    apiHelper.apiInitialize().then(opts => {
      this.setState({ appLoading: null, ...opts })
    }).catch(e => this.setState({ appCrashed: e?.message || e }))
  }

  render() {
    if (this.state.appCrashed) return <>{this.state.appCrashed}</>
    if (this.state.appLoading) return <>{this.state.appLoading}</>
    var subtotalFloat = ((this.state.cart || []).map(({ id, amount }) => {
      var item = this.state.productList?.find(p => p.id == id) as ProductPizza;
      if (!item) return 0;
      return priceCalcFloat(item.price, this.state.currency, this.state.spaConfig, amount);
    }) as any).reduce((acc: number, v: number) => acc + v, 0);
    var subtotal = subtotalFloat.toFixed(2) + ' ' + priceSymb(this.state.currency, this.state.spaConfig);
    var deliveryFloat = priceCalcFloat(this.state.spaConfig?.deliveryCost || 0, this.state.currency, this.state.spaConfig, 1) || 0;
    var delivery = deliveryFloat.toFixed(2) + ' ' + priceSymb(this.state.currency, this.state.spaConfig);
    var total = (subtotalFloat + deliveryFloat).toFixed(2) + ' ' + priceSymb(this.state.currency, this.state.spaConfig);
    return (
      <Router>
        <div className="App">
          <header className="App-header container-fluid">
            <div className="container">
              <Link className="App-header-logo" to="/">🍕 Pizza App Menu</Link>
              <Link className="App-header-link" to="/cart">🛒 Cart {this.state.cart?.length ? (<span className="badge badge-warning">{this.state.cart?.length}</span>) : ''}</Link>
              {!this.state.user && <>
                <Link className="App-header-link" to="/login">👤 Login</Link>
                <Link className="App-header-link" to="/register">💻 Register</Link>
              </>}
              {this.state.user && <>
                <Link className="App-header-link" to="/profile">👤 Profile <small>{this.state.user.email}</small></Link>
                <a className="App-header-link" href="#" onClick={this.logoutAction}>🚪 Logout</a>
              </>}
              <form className="App-header-link form-inline d-inline-block">
                <select className="form-control form-control-sm"
                  name="currency" value={this.state.currency} onChange={this.handleCurrencyChange}>
                  <optgroup label="💵">
                    {this.state.spaConfig?.currencies.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </optgroup>
                </select>
              </form>
            </div>
          </header>
          <div className="container-fluid">
            <Switch>
              <Route path="/cart">
                <h3 className="text-center">Your order</h3>
                {this.state.cart?.length ?
                  <>
                    <div className="container">
                      {this.state.cart.map(({ id, amount }) => {
                        var item = this.state.productList?.find(p => p.id == id) as ProductPizza;
                        if (!item) return;
                        return (<>
                          <Pizza cart={1} key={id} amount={amount} item={item} change={this.addToCart}
                            xcurrency={this.state.currency} xconfig={this.state.spaConfig} />
                        </>);
                      })}
                    </div>
                    <div className="container">
                      <p className="h6 m-0 mt-4 d-flex justify-content-between align-items-center">Subotal: {subtotal}</p>
                      <p className="h6 m-0 mt-1 d-flex justify-content-between align-items-center">Delivery: {delivery}</p>
                      <p className="h4 m-0 mt-2 d-flex justify-content-between align-items-center">Total: {total}</p>
                      {this.state.user ? '' : (<p className="m-0 mt-1">You are not logged in. Your order would not be stored in order history.</p>)}
                      <OrderForm cart={this.state.cart} user={this.state.user} success={this.orderDone} />
                    </div>
                  </>
                  : <>
                    <div className="container">
                      <p className="h6 m-0 mt-4 d-flex justify-content-between align-items-center">Your shopping cart is empty.</p>
                    </div>
                  </>}
              </Route>
              <Route path="/login">
                <h3 className="text-center">Login form</h3>
                <div className="text-center formContainer">
                  <LoginForm user={this.state.user} login={this.login} isRegister={false} />
                </div>
              </Route>
              <Route path="/register">
                <h3 className="text-center">Create account</h3>
                <div className="text-center formContainer">
                  <LoginForm user={this.state.user} login={this.login} isRegister={true} />
                </div>
              </Route>
              <Route path="/profile">
                {!this.state.user && (<Redirect to={{ pathname: "/" }} />)}
                <h3 className="text-center">User Profile</h3>
                <Profile user={this.state.user} xcurrency={this.state.currency} xconfig={this.state.spaConfig} />
              </Route>
              <Route path="/">
                <h3 className="text-center">Pizza App Menu</h3>
                <div className="PizzaContainer">
                  {
                    this.state.productList && this.state.productList.map(pizza =>
                      <Pizza cart={0} key={pizza.id} amount={this.state.cartHash[pizza.id] ?? 0} item={pizza} change={this.addToCart}
                        xcurrency={this.state.currency} xconfig={this.state.spaConfig} />
                    )
                  }
                </div>
              </Route>
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
