import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { AngularFirestore, DocumentReference ,DocumentChangeAction} from '@angular/fire/firestore';
import {BehaviorSubject, from, combineLatest, Observable, Subject,of} from 'rxjs';
import {filter,first, switchMap, takeUntil, tap,map} from 'rxjs/operators';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  nickname = '';
  user:any[];
  matcher = new MyErrorStateMatcher();

  constructor(
             private router: Router, 
             private formBuilder: FormBuilder,  
             private afs: AngularFirestore
            ) { }

  ngOnInit() {
    
    this.loginForm = this.formBuilder.group({
      'nickname' : [null, Validators.required]
    });
  }
  
     getUser$(nickName) {

     return this.afs
      .collection('users',ref => ref.where('nickname', '==', nickName))
      .valueChanges();
    }

     addUser$(newUser){
          return from(this.afs.collection('users').add({nickname:newUser}))
     }
     
     enterRoom(user:any[],nickname){
         if(user.length >0) {
        localStorage.setItem('nickname', nickname);
        this.router.navigate(['/roomlist']);
         } else {
            
          this.addUser$(nickname).subscribe();
          localStorage.setItem('nickname', nickname);
          this.router.navigate(['/roomlist']);
         }
     }
     
     
     
     
     

  onFormSubmit(form: any) {
  
    const login = form;
      this.getUser$(login.nickname).pipe(
        tap((x:any[])=>this.user = x),
        tap(()=>this.enterRoom(this.user,login.nickname))
      )
     .subscribe();
      
  }
  

 

}
