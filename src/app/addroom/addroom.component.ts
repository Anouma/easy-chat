import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  selector: 'app-addroom',
  templateUrl: './addroom.component.html',
  styleUrls: ['./addroom.component.css']
})
export class AddroomComponent implements OnInit {

  roomForm: FormGroup;
  nickname = '';
  roomname = '';
  room :any[];

  matcher = new MyErrorStateMatcher();

  constructor(private router: Router,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private afs : AngularFirestore, 
              private snackBar: MatSnackBar) {
              }

  ngOnInit(): void {
    this.roomForm = this.formBuilder.group({
      'roomname' : [null, Validators.required]
    });
  }

   getRoom$(roomname2) {

     return this.afs
      .collection('rooms',ref => ref.where('roomname', '==', roomname2))
      .valueChanges();
    }
    
     addRoom$(newRoom){
          return from(this.afs.collection('rooms').add({roomname:newRoom}))
     }
    
     createRoom(rooms:any[],roomname){
         if(rooms.length >0) {
          this.snackBar.open('Room name already exist!');
         } else {
          this.addRoom$(roomname).subscribe();
          this.router.navigate(['/roomlist']);
         }
     }
  
  
  onFormSubmit(form: any) {
  
    const room = form;
      this.getRoom$(room.roomname).pipe(
        tap((x:any[])=>this.room = x),
        tap(()=>this.createRoom(this.room,room.roomname))
      )
     .subscribe();
      
  }
  


}
