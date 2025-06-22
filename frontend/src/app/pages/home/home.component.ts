import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {HelpChatComponent} from '../help-chat/help-chat.component';

@Component({
  selector: 'app-home',
  imports: [
    HelpChatComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']).then(r => r);
  }

  goToRegister() {
    this.router.navigate(['/register']).then(r => r);
  }
}
