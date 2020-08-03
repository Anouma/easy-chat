import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AngularFirestore, DocumentReference ,DocumentChangeAction} from '@angular/fire/firestore';
import {BehaviorSubject, from, combineLatest, Observable, Subject,of} from 'rxjs';
import {filter,first, switchMap, takeUntil, tap,map} from 'rxjs/operators';

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
  selector: 'app-roomlist',
  templateUrl: './roomlist.component.html',
  styleUrls: ['./roomlist.component.css']
})
export class RoomlistComponent implements OnInit {

  nickname = '';
  displayedColumns: string[] = ['roomname'];
  rooms:any[];
  users:any[];
  isLoadingResults = true;

  constructor(
            private route: ActivatedRoute, 
            private router: Router, 
            public datepipe: DatePipe,
            private afs: AngularFirestore
        ) {
    
    this.nickname = localStorage.getItem('nickname');
    this.getRooms$().pipe(
        tap((x:any[])=>this.rooms = x),
        tap(()=>this.isLoadingResults = false)
      )
     .subscribe();
  }



  ngOnInit(): void {
   
     
  }
    getRooms$() {

     return this.afs
      .collection('rooms')
      .valueChanges();
    }

     
      postMessage$(obj){
          return from(this.afs.collection('chat').add(obj))
     }
     
      addRoomUser$(newUser){
          return from(this.afs.collection('roomusers').add(newUser))
            
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
      
      getRoomUser$(nickName) {

     return this.afs
      .collection('roomusers',ref => ref.where('nickname', '==', nickName))
      .valueChanges();
     }
  
      setUserStatus$(user,userstatus) {  
      return from (
    this.getRoomUserById$(user).pipe(switchMap((x)=>this.afs.collection('roomusers').doc(x.uid).set({status: userstatus},{merge:true})))
       )
       }
       
       setRoomUser(userName,roomname) {
  
      this.getRoomUser$(userName).pipe(
        tap((x:any[])=>this.users = x),
        tap(()=>this.enterRoom(this.users,roomname))
      )
     .subscribe();
     
  }
  
   enterRoom(user:any[],roomname){
         if (user.length > 0) {
        this.setUserStatus$(this.nickname,'online').subscribe();
      } else {
        const newroomuser = { roomname: '', nickname: '', status: '' };
        newroomuser.roomname = roomname;
        newroomuser.nickname = this.nickname;
        newroomuser.status = 'online';
        this.addRoomUser$(newroomuser).subscribe();
      }
     }
     
  enterChatRoom(roomname: string) {
    const chat = { roomname: '', nickname: '', message: '', date: '', type: '' };
    chat.roomname = roomname;
    chat.nickname = this.nickname;
    chat.date = this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss');
    chat.message = `${this.nickname} enter the room`;
    chat.type = 'join';
    
    this.postMessage$(chat).subscribe();
    this.setRoomUser(this.nickname,roomname);
    this.router.navigate(['/chatroom', roomname]);
  }

  logout(): void {
    localStorage.removeItem('nickname');
    this.router.navigate(['/login']);
  }

}
