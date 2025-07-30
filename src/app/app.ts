import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Login } from "./pages/login/login";
import { Register } from "./pages/register/register";
import { MainLayout } from "./layout/main-layout/main-layout";
import { HostProperties } from "./components/host-properties/host-properties";
import { Footer } from "./components/footer/footer";
import { Confirm } from "./shared/components/confirm/confirm";
import { ConfirmOtp } from "./pages/confirm-otp/confirm-otp";
import { SignalrTestComponent } from "./signal-rtest/signal-rtest";
import { ResetPassword } from "./pages/reset-password/reset-password";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Confirm, Login, Register, SignalrTestComponent, ResetPassword],

  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'AirbnbFrontend';
}
