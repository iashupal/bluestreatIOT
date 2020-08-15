import React from "react";
import { Switch, Route } from "react-router-dom";
// import Loader from "../components/Loader";
// import Loadable from "react-loadable";
import ForgotPassword from "../components/Accounts/ForgotPassword";
import LoginForm from "../components/Accounts/LoginForm";
// const Login = Loadable({
//   loader: () => import("../layout/Login"),
//   loading: Loader,
// });

function AuthRouter() {
  return (
    <Switch>
      <Route path="/" exact component={LoginForm} />
      <Route path="/forgot-password" exact component={ForgotPassword} />
    </Switch>
  );
}

export default AuthRouter;
