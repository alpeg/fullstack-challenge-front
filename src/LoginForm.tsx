import React, { Component } from 'react';
import axios from './axiosConfig';
import { Redirect } from 'react-router-dom';
import { User } from './util';

export default class LoginForm extends Component<{
    login: (user: User | null) => any,
    user: User | null,
    isRegister: any,
}, {
    loading: boolean,
    loginError: string | null,
    name: string,
    email: string,
    password: string,
    remember: boolean,
}> {
    constructor(props: any) {
        super(props);
        this.state = {
            loading: false,
            loginError: null,
            remember: true,
            name: '',
            email: '',
            password: '',
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.login = this.login.bind(this);
    }
    handleInputChange(event: React.FormEvent<HTMLInputElement>) {
        const target = event.currentTarget;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({
            [name]: value
        } as any);
    }
    login(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        (async () => {
            const name = this.state.name;
            const email = this.state.email;
            const password = this.state.password;
            const remember = this.state.remember;
            this.setState({ loading: true, loginError: null });
            try {
                let regName = this.props.isRegister ? { name: name } : {};
                const authResult = (await axios.post(this.props.isRegister ? '/auth/signup' : '/auth/login', { email, password, remember, ...regName })).data;
                if (authResult && authResult.success) {
                    this.props.login(authResult.user);
                    this.setState({ loginError: null });
                } else if (authResult && !authResult.success) {
                    this.props.login(null);
                    this.setState({
                        loginError: authResult?.error || 'Unknown error occured during login.',
                        password: '',
                    });
                } else {
                    this.props.login(null);
                    this.setState({ loginError: 'Unknown error occured during login.' });
                }
            } catch (e) {
                this.props.login(null);
                if (e?.response?.status == 422) {
                    let flatError = e.response.data.message + ': ' + Object.entries(e.response.data.errors).map(([field, errors]) => field + ': ' + (errors as any).join(', ')).join(' ');
                    this.setState({ loginError: flatError });
                } else {
                    this.setState({ loginError: ' Unknown error occured during login: ' + (e?.message || e) });
                }
            } finally {
                this.setState({ loading: false });
            }
        })();
    }
    render() {
        if (this.state.loading) return <>Loading...</>;
        if (this.props.user) return <Redirect to={{ pathname: "/" }} />;
        return (
            <>
                {
                    this.state.loginError && <div className="Login-Error alert alert-danger">
                        {this.state.loginError}
                    </div>
                }
                <form onSubmit={this.login} className="Login">
                    {this.props.isRegister &&
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label">Name</label>
                            <div className="col-sm-10">
                                <input id="LoginFormName" placeholder="Name" className="form-control" name="name" type="text" value={this.state.name} onChange={this.handleInputChange} required />
                            </div>
                        </div>
                    }
                    <div className="form-group row">
                        <label className="col-sm-2 col-form-label">Email</label>
                        <div className="col-sm-10">
                            <input id="LoginFormEmail" placeholder="Email" className="form-control" name="email" type="email" value={this.state.email} onChange={this.handleInputChange} required />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label className="col-sm-2 col-form-label">Password</label>
                        <div className="col-sm-10">
                            <input id="LoginFormPassword" placeholder="Password" className="form-control" name="password" type="password" value={this.state.password} onChange={this.handleInputChange} required />
                        </div>
                    </div>
                    <div className="form-group row">
                        <div className="col-sm-2">Remember</div>
                        <div className="col-sm-10">
                            <div className="form-check text-left">
                                <label className="form-check-label">
                                    <input className="form-check-input" id="LoginFormRemember" type="checkbox" name="remember" value="1" checked={this.state.remember} onChange={this.handleInputChange} />
                                    Remember me
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="form-group row">
                        <div className="col-sm-10 text-center">
                            <button className="btn btn-warning btn-lg" type="submit">{this.props.isRegister ? 'Create account' : 'Sign In'}</button>
                        </div>
                    </div>
                </form>
            </>
        )
    }
}