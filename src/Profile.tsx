import React, { Component } from 'react';
import axios from './axiosConfig';
import { User, CurrencyName, SpaConfig, priceCalc } from './util';

export default class Profile extends Component<{
    user: User | null,
    xcurrency: CurrencyName,
    xconfig: SpaConfig,
}, {
    loading: boolean,
    loginError: string | null,
    v: any,
}> {
    constructor(props: any) {
        super(props);
        this.state = {
            loading: true,
            loginError: null,
            v: null,
        };
        this.next = this.next.bind(this);
    }
    componentDidMount() {
        (async () => {
            if (this.props.user) {
                var x = (await axios.get('/order/history')).data;
                this.setState({ v: x, loading: false });
            }
        })();
    }
    async next(u: string) {
        if (this.props.user) {
            const url = new URL(u);
            u = url.pathname + url.search;
            this.setState({ loading: true });
            var x = (await axios.get(u)).data;
            this.setState({ v: x, loading: false });
        }
    }
    render() {
        if (this.state.loading) return <>Loading...</>;
        // if (this.props.user) return <Redirect to={{ pathname: "/" }} />;
        return (
            <>
                {this.state.v?.length == 0 && <h3>No orders found.</h3>}
                {this.state.v?.data.map(({ id, total, created_at, pizza_products }: any) => {
                    return (<div key={id}>
                        <p className="m-0">{priceCalc(+total, this.props.xcurrency, this.props.xconfig)} | {created_at} |
                            {pizza_products.map(({ id, title, pivot: { amount } }: any) => (
                            <span className="ml-3" key={id}><strong>{amount}</strong> × {title}</span>
                        ))}
                        </p>
                    </div>);
                })}
                <p className="m-0">
                    {this.state.v?.first_page_url && <button className="btn btn-sm btn-danger" onClick={() => this.next(this.state.v?.first_page_url)}>Page 1</button>}
                    {this.state.v?.prev_page_url && <button className="btn btn-info" onClick={() => this.next(this.state.v?.prev_page_url)}>Previous page</button>}
                    {this.state.v?.next_page_url && <button className="btn btn-lg btn-warning" onClick={() => this.next(this.state.v?.next_page_url)}>Next page</button>}
                </p>
                <p className="m-0">
                    Showing records from <strong>{this.state.v?.from}</strong> to <strong>{this.state.v?.to}</strong>
                </p>
            </>
        )
    }
}