import { Component, OnInit } from '@angular/core';

interface SourceNetwork {
  name: string,
}

@Component({
  selector: 'app-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.scss']
})
export class SwapComponent implements OnInit {

  sourceNetworks: SourceNetwork[];

  constructor() {
    this.sourceNetworks = [
      { name: 'UMI' }
    ];
  }

  ngOnInit(): void {
  }

}
