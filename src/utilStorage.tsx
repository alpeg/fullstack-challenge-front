import { CartItem, CurrencyName } from './util';

export function storageValidCart(): CartItem[] {
    var cartStorage = null;
    try {
        if (localStorage['pizzaCart']) {
            cartStorage = JSON.parse(localStorage['pizzaCart']);
            if (!(
                cartStorage instanceof Array && cartStorage.every(v => (
                    'object' === typeof v && 'number' === typeof v.id && 'number' === typeof v.amount
                ))
            )) {
                cartStorage = null;
            }
        }
    } catch (e) { cartStorage = null; }
    return cartStorage || [];
}
export function storageValidCurrency(): CurrencyName {
    var pizzaCurrency: CurrencyName = 'USD';
    try {
        pizzaCurrency = localStorage['pizzaCurrency']
    } catch (e) { }
    if (pizzaCurrency === 'USD' || pizzaCurrency === 'EUR') return pizzaCurrency;
    return 'USD';
}
export function storageSet(key: string, value: any, json: boolean = true) {
    try {
        if (json) {
            localStorage[key] = JSON.stringify(value);
        } else {
            localStorage[key] = value;
        }
    } catch (e) { }
}