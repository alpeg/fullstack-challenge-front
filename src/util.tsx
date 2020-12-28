export interface ProductPizza {
    id: number,
    title: string,
    description: string,
    order: number,
    picture: string | null,
    price: string,
    disabled: number,
};
export interface CartItem {
    id: number,
    amount: number,
};
export interface CartHash {
    [id: number]: number,
};
export interface User {
    name: string,
    email: string,
};
export type CurrencyName = 'USD' | 'EUR';
export interface SpaConfig {
    currencies: CurrencyName[],
    currencyInfo: {
        [k in CurrencyName]: { scale: number, symbhol: string }
    },
    deliveryCost: number,
    // deliveryFreeIf: number | null,
}
export function cartArrToHash(cartArr: CartItem[]): CartHash {
    return Object.fromEntries(cartArr.map(({ id, amount }) => [id, amount]));
}
export function cartAdd(oldCart: CartItem[], id: number, n: number) {
    const index = oldCart.findIndex(e => e.id === id);
    if (index === -1) {
        const cart = [...oldCart, { id, amount: 1 }];
        return {
            cart, cartHash: cartArrToHash(cart),
        };
    }
    const cart = oldCart.concat();
    const amount = oldCart[index].amount + n;
    if (amount > 0) {
        cart.splice(index, 1, { id, amount: amount });
    } else {
        cart.splice(index, 1);
    }
    return {
        cart, cartHash: cartArrToHash(cart),
    };
}
export function priceCalc(priceInput: string | number, xcurrency: CurrencyName, xconfig: SpaConfig, mult: number = 1, symb: boolean = true) {
    if (!xconfig) return;
    let price = ('string' == typeof priceInput) ? parseFloat(priceInput) : priceInput;
    const c = xconfig.currencyInfo[xcurrency];
    return (mult * price * c.scale).toFixed(2) + (symb ? (' ' + c.symbhol) : '');
}
export function priceCalcFloat(priceInput: string | number, xcurrency: CurrencyName, xconfig: SpaConfig, mult: number = 1) {
    if (!xconfig) return;
    let price = ('string' == typeof priceInput) ? parseFloat(priceInput) : priceInput;
    const c = xconfig.currencyInfo[xcurrency];
    return mult * price * c.scale;
}
export function priceSymb(xcurrency: CurrencyName, xconfig: SpaConfig) {
    if (!xconfig) return;
    const c = xconfig.currencyInfo[xcurrency];
    return c.symbhol;
}