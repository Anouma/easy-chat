import { Component } from '@angular/core';


const config = {
  apiKey: 'AIzaSyAxVOS-gkNuU6MUq-SwCEkcYWQ1tQ43kqo',
  databaseURL: 'https://tchat-database.firebaseio.com/',
  authDomain: 'databasetest-2a6fa.firebaseapp.com',
  projectId: 'databasetest-2a6fa'
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-chat';

  constructor() {
  
  }
}
