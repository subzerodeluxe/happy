import { Component } from '@angular/core';
import { IonicPage, LoadingController, Loading, NavController, NavParams } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { tap, filter } from 'rxjs/operators'; 

import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFirestore } from 'angularfire2/firestore'; 

import { Camera, CameraOptions } from '@ionic-native/camera'; 

@IonicPage({
  name: 'dashboard'
})
@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html',
})
export class DashboardPage {

  // Upload tasks
  task: AngularFireUploadTask;
  results: Observable<any>;
  loading: Loading;
  image: string; 
  shakeButton: boolean = true;

  constructor(public camera: Camera, public loadingCtrl: LoadingController, 
    public afs: AngularFirestore, public storage: AngularFireStorage,
    public navCtrl: NavController, public navParams: NavParams) {

      this.loading = this.loadingCtrl.create({
        content: "Finding out if it's a girl ..."
      })
  }

  startUpload(file: string) {

    // show loader
    this.loading.present();

    // const timestamp = new Date().getTime().toString();
    const docId = this.afs.createId(); // generates random id for document
    const path = `${docId}.jpg`;  // set the path (id + .jpg)
    const photoRef = this.afs.collection('photos').doc(docId); // set the photoRef in collection

    // Firestore observable
    this.results = photoRef.valueChanges()
      .pipe(
        filter(data => !!data),
        tap(_ => this.loading.dismiss())
      );

    // Upload the image
    this.image = 'data:image/jpg;base64,' + file;
    this.task = this.storage.ref(path).putString(this.image, 'data_url'); 
  }

  // Take picture and start the upload
  async captureAndUpload() {  
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG
    }

    const base64 = await this.camera.getPicture(options);

    this.startUpload(base64); 
  }

}
