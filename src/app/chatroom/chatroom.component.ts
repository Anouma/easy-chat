import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { AngularFirestore, DocumentReference ,DocumentChangeAction} from '@angular/fire/firestore';
import {BehaviorSubject, from, combineLatest, Observable, Subject,of} from 'rxjs';
import {filter,first, switchMap, takeUntil, tap,map} from 'rxjs/operators';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

export const snapshotToArray = (snapshot: any) => {
  const returnArr = [];

  snapshot.forEach((childSnapshot: any) => {
      const item = childSnapshot.val();
      item.key = childSnapshot.key;
      returnArr.push(item);
  });

  return returnArr;
};

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.css']
})
export class ChatroomComponent implements OnInit {

  @ViewChild('chatcontent') chatcontent: ElementRef;
  scrolltop: number = null;

  chatForm: FormGroup;
  nickname = '';
  roomname = '';
  message = '';
  users = [];
  chats = [];
  matcher = new MyErrorStateMatcher();

  constructor(private router: Router,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private afs:AngularFirestore,
              public datepipe: DatePipe) {
                this.nickname = localStorage.getItem('nickname');
                this.roomname = this.route.snapshot.params.roomname;
                this.getChat$(this.roomname).pipe(
                           tap((x:any[])=>this.chats = x),
                          )
                .subscribe();
                this.getUsersOnline$().pipe(
                           tap((x:any[])=>this.users = x),
                          )
                .subscribe();
             
             
              }

  ngOnInit(): void {
    this.chatForm = this.formBuilder.group({
      'message' : [null, Validators.required]
    });
  }
  
   getChat$(roomname) {

     return this.afs
      .collection('chat',ref => ref.where('roomname', '==', roomname))
      .valueChanges();
    }
    
     getUsersOnline$() {

     return this.afs
      .collection('roomusers',ref => ref.where('status', '==', 'online'))
      .valueChanges();
    }
    
      getRoomUserById$(name){
      
         return this.afs
                .collection('roomusers',ref => ref.where('nickname', '==', name))
               .snapshotChanges()
               .pipe(
                  map((targetsSnap: DocumentChangeAction<any>[]) => {
                    const targets= [];
                    targetsSnap.forEach(target => targets.push({
                    uid:target.payload.doc.id,
                }));
          return targets[0];
        }),
            )
      }
    
     postMessage$(obj){
          return from(this.afs.collection('chat').add(obj))
     }
     
      setUserStatus$(user,userstatus) {  
      return from(this.getRoomUserById$(user).pipe(switchMap((x)=>this.afs.collection('roomusers').doc(x.uid).set({status: userstatus},{merge:true}))))
       }

  onFormSubmit(form: any) {
    const chat = form;
    chat.roomname = this.roomname;
    chat.nickname = this.nickname;
    chat.date = this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss');
    chat.type = 'message';
    this.postMessage$(chat).subscribe();
    this.chatForm = this.formBuilder.group({
      'message' : [null, Validators.required]
    });
  }

  exitChat() {
    const chat = { roomname: '', nickname: '', message: '', date: '', type: '' };
    chat.roomname = this.roomname;
    chat.nickname = this.nickname;
    chat.date = this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss');
    chat.message = `${this.nickname} leave the room`;
    chat.type = 'exit';
    this.postMessage$(chat).subscribe();
    this.setUserStatus$(this.nickname,'offline').subscribe();
    this.router.navigate(['/roomlist']);
  }

}
