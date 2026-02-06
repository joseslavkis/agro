import { Redirect, Route, Switch } from "wouter";

import { LoginScreen } from "@/screens/LoginScreen";
import { MainScreen } from "@/screens/MainScreen";
import { SignupScreen } from "@/screens/SignupScreen";
import { WelcomeScreen } from "@/screens/WelcomeScreen";
import { useToken } from "@/services/TokenContext";

import { PartnersScreen } from "@/screens/PartnersScreen";
import { FieldDetailScreen } from "@/screens/FieldDetailScreen";
import { WeatherDashboardScreen } from "@/screens/WeatherDashboardScreen";

import { LivestockScreen } from "@/screens/LivestockScreen";
import { FieldLivestockScreen } from "@/screens/FieldLivestockScreen";
import { AgendaScreen } from "@/screens/AgendaScreen";

export const Navigation = () => {
  const [tokenState] = useToken();
  switch (tokenState.state) {
    case "LOGGED_IN":
      return (
        <Switch>
          <Route path="/">
            <MainScreen />
          </Route>
          <Route path="/partners">
            <PartnersScreen />
          </Route>
          <Route path="/livestock">
            <LivestockScreen />
          </Route>
          <Route path="/fields/:id">
            {(params) => <FieldDetailScreen id={Number(params.id)} />}
          </Route>
          <Route path="/fields/:id/weather">
            {(params) => <WeatherDashboardScreen id={Number(params.id)} />}
          </Route>
          <Route path="/fields/:id/livestock">
            {(params) => <FieldLivestockScreen id={Number(params.id)} />}
          </Route>
          <Route path="/agenda">
            <AgendaScreen />
          </Route>
          <Route>
            <Redirect href="/" />
          </Route>
        </Switch>
      );
    case "LOGGED_OUT":
      return (
        <Switch>
          <Route path="/">
            <WelcomeScreen />
          </Route>
          <Route path="/login">
            <LoginScreen />
          </Route>
          <Route path="/signup">
            <SignupScreen />
          </Route>
          <Route>
            <Redirect href="/" />
          </Route>
        </Switch>
      );
    default:
      // Make the compiler check this is unreachable
      return tokenState satisfies never;
  }
};
