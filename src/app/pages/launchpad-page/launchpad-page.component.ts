import { Component } from '@angular/core';

@Component({
  selector: 'app-launchpad-page',
  templateUrl: './launchpad-page.component.html',
  styleUrls: ['./launchpad-page.component.css']
})
export class LaunchpadPageComponent {
  openCollapsibles: { [key: number]: boolean } = {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false
  };

  toggleCollapsible(chapterNumber: number): void {
    this.openCollapsibles[chapterNumber] = !this.openCollapsibles[chapterNumber];
  }

  scrollToCollapsibles(): void {
    // Open the first collapsible section
    this.openCollapsibles[1] = true;
    
    // Scroll to the collapsible sections after a short delay to ensure DOM is updated
    setTimeout(() => {
      const collapsibleSection = document.getElementById('collapsible-sections');
      if (collapsibleSection) {
        collapsibleSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  }
}
