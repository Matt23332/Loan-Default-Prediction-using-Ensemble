import { Routes, RouterModule } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Register } from './components/register/register';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { NgModule } from '@angular/core';
import { ProfileComponent } from './components/profile/profile';
import { LoanApplication } from './components/loan-application/loan-application';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: 'login', component: Login},
    {path: 'dashboard', component: Dashboard},
    {path: 'register', component: Register},
    {path: 'forgot-password', component: ForgotPassword},
    {path: 'verify-email', component: ForgotPassword},
    {path: 'profile', component: ProfileComponent},
    {path: 'loan-application', component: LoanApplication},
    {path: '**', redirectTo: 'login'}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }