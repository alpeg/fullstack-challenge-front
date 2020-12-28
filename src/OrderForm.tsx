import React, { Component } from 'react';
import axios from './axiosConfig';
import { CartItem, User } from './util';

export default class OrderForm extends Component<{
    user: User | null,
    cart: CartItem[],
    success: () => void
}, {
    loading: boolean,
    loginError: string | null,
    loginError2: string | null,
    name: string,
    email: string,
    addr: string,
    tel: string,
}> {
    constructor(props: any) {
        super(props);
        this.state = {
            loading: false,
            loginError: null,
            loginError2: null,
            name: '',
            email: '',
            addr: '',
            tel: '',
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.order = this.order.bind(this);
    }
    componentDidMount() {
        (async () => {
            if (this.props.user) {
                var x = (await axios.post('/order/fill')).data;
                if (x && x.success !== false) {
                    var { addr, email, name, tel } = x;
                    this.setState({ addr, email, name, tel });
                }
            }
        })();
    }
    successFn() {
        this.props.success();
    }
    handleInputChange(event: React.FormEvent<HTMLInputElement>) {
        const target = event.currentTarget;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({
            [name]: value
        } as any);
    }
    order(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        (async () => {
            const name = this.state.name;
            const email = this.state.email;
            const tel = this.state.tel;
            const addr = this.state.addr;
            this.setState({ loading: true, loginError: null });
            try {
                const orderAjax = (await axios.post('/order/create', { name, email, tel, addr, cart: this.props.cart })).data;
                if (orderAjax && orderAjax.success) {
                    this.successFn();
                    this.setState({ loginError: null });
                } else if (orderAjax && !orderAjax.success) {

                    this.setState({
                        loginError: orderAjax?.error || 'Unknown error occured.',
                    });
                } else {

                    this.setState({ loginError: 'Unknown error occured.' });
                }
            } catch (e) {

                if (e?.response?.status == 422) {
                    let flatError = e.response.data.message + ': ' + Object.entries(e.response.data.errors).map(([field, errors]) => field + ': ' + (errors as any).join(', ')).join(' ');
                    this.setState({ loginError: flatError });
                } else {
                    this.setState({ loginError: ' Unknown error occured: ' + (e?.message || e) });
                }
            } finally {
                this.setState({ loading: false });
            }
        })();
    }
    render() {
        if (this.state.loading) return <>Loading...</>;
        // if (this.props.user) return <Redirect to={{ pathname: "/" }} />;
        return (
            <>
                {
                    this.state.loginError && <div className="Order-Error alert alert-danger">
                        {this.state.loginError}
                    </div>
                }
                <form onSubmit={this.order} className="Order">
                    <div className="form-group row">
                        <label className="col-sm-2 col-form-label">Name</label>
                        <div className="col-sm-10">
                            <input id="OrderFormName" placeholder="Name" className="form-control" name="name" type="text" value={this.state.name} onChange={this.handleInputChange} required />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label className="col-sm-2 col-form-label">Telephone no.</label>
                        <div className="col-sm-10">
                            <input id="OrderFormTel" placeholder="Phone number" className="form-control" name="tel" type="text" value={this.state.tel} onChange={this.handleInputChange} required />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label className="col-sm-2 col-form-label">Email</label>
                        <div className="col-sm-10">
                            <input id="OrderFormEmail" placeholder="Email" className="form-control" name="email" type="email" value={this.state.email} onChange={this.handleInputChange} required />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label className="col-sm-2 col-form-label">Address</label>
                        <div className="col-sm-10">
                            <input id="OrderFormAddress" placeholder="Address" className="form-control" name="addr" type="text" value={this.state.addr} onChange={this.handleInputChange} required />
                        </div>
                    </div>
                    <div className="form-group row">
                        <div className="col-sm-10 text-center">
                            <button className="btn btn-warning btn-lg" type="submit">Confirm order & Checkout</button>
                        </div>
                    </div>
                </form>
            </>
        )
    }
}