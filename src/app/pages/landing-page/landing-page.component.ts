import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
  redirectToPdf() {
    window.open('assets/ODX_OAT_WHITEPAPPER.pdf', '_blank');
  }
}
