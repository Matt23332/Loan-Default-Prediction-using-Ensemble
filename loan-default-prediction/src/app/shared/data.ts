import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../model/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private collectionName = 'users';

  constructor(private firestore: AngularFirestore) { }

  addUser(user: User): Promise<any> {
    user.id = this.firestore.createId();
    return this.firestore.collection('/users').add(user);
  }

  getUsers(): Observable<any[]> {
    return this.firestore.collection('/users').snapshotChanges();
  }

  deleteUser(user: User): Promise<void> {
    return this.firestore.doc('/users/' + user.id).delete();
  }

  updateUser(user: User) {
    this.deleteUser(user);
    this.addUser(user);
  }
  
}
