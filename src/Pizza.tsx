import { Component } from 'react';
import './Pizza.css';
import { ProductPizza, CurrencyName, SpaConfig, priceCalc } from './util';

export default class Pizza extends Component<{
    cart: any,
    amount: number,
    item: ProductPizza,
    change: (id: number, change: number) => void,
    xcurrency: CurrencyName,
    xconfig: SpaConfig,
}, {}> {
    constructor(props: any) {
        super(props);
        this.inc = this.change.bind(this, 1);
        this.dec = this.change.bind(this, -1);
    }
    inc: () => void;
    dec: () => void;
    change(n: number) {
        this.props.change(this.props.item.id, n);
    }
    render() {
        if (this.props.cart) return (
            <div className="Pizza-cart">
                <div>
                    {this.props.item.picture ? <img className="Pizza-cart-pic" alt="" src={"/storage/pizza_product/" + this.props.item.picture} /> :
                        <img className="Pizza-cart-pic" alt="" src="" />
                    }
                </div>
                <div>
                    <p className="h5 m-0 d-flex justify-content-between align-items-center">{this.props.item.title}</p>
                    <p className="h4 m-0 d-flex justify-content-between align-items-center">
                        {priceCalc(this.props.item.price, this.props.xcurrency, this.props.xconfig)}
                    </p>
                </div>
                <div>
                    <p className="h4 m-0 d-flex justify-content-between align-items-center">
                        {this.props.amount ? (
                            <span>
                                <button className="btn btn-warning btn-sm" onClick={this.dec}>➖</button>
                                <span className="text-center d-inline-block" style={{ width: '50px', whiteSpace: 'nowrap' }}>{this.props.amount}</span>
                                <button className="btn btn-warning btn-sm" onClick={this.inc}>➕</button>
                            </span>
                        ) : <span><button className="btn btn-warning btn-sm" onClick={this.inc}>Add to cart</button></span>
                        }
                    </p>
                </div>
                <div>
                    <p className="h4 m-0 d-flex justify-content-between align-items-center">
                        {priceCalc(this.props.item.price, this.props.xcurrency, this.props.xconfig, this.props.amount, false)}
                    </p>
                </div>
            </div>
        );
        return (
            <div className="Pizza card">
                {this.props.item.picture ? <img className="card-img-top" alt="" src={"/storage/pizza_product/" + this.props.item.picture} /> :
                    <img className="card-img-top" alt="" src="" />
                }
                <div className="card-body">
                    <h5 className="card-title">{this.props.item.title}</h5>
                    <p className="card-text">{this.props.item.description}</p>
                </div>
                <div className="card-footer">
                    <p className="h4 m-0 d-flex justify-content-between align-items-center">
                        {priceCalc(this.props.item.price, this.props.xcurrency, this.props.xconfig)}
                        {this.props.amount ? (
                            <span>
                                <button className="btn btn-warning btn-sm" onClick={this.dec}>➖</button>
                                <span className="text-center d-inline-block" style={{ width: '50px', whiteSpace: 'nowrap' }}>{this.props.amount}</span>
                                <button className="btn btn-warning btn-sm" onClick={this.inc}>➕</button>
                            </span>
                        ) : <span><button className="btn btn-warning btn-sm" onClick={this.inc}>Add to cart</button></span>
                        }
                    </p>
                </div>
            </div>
        );
    }
}