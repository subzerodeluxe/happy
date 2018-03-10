import { Component } from '@angular/core';
import { IonicPage, LoadingController, Loading, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';

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
  result$: Observable<any>;
  loading: Loading;
  image: string; 
  shakeButton: boolean = true;
  constructor(public camera: Camera, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, 
    public afs: AngularFirestore, public storage: AngularFireStorage,
    public navCtrl: NavController, public navParams: NavParams) {

      this.loading = this.loadingCtrl.create({
        spinner: 'dots',
        content: "Finding out if it's a human or an object. Stay tuned ..."
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
    this.result$ = photoRef.valueChanges()
      .pipe(
        filter(data => !!data),
        tap(_ => this.loading.dismiss())
      );

    // Upload the image
    this.image = 'data:image/jpg;base64,' + file;
    this.task = this.storage.ref(path).putString(this.image, 'data_url'); 
  }

  // Take picture and start the upload
  captureAndUpload() {  
    const options: CameraOptions = {
      quality: 100,
      targetWidth: 900,
      targetHeight: 600,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      saveToPhotoAlbum: false
    }

    this.camera.getPicture(options)
      .then((imageData) => {
        let toast = this.toastCtrl.create({
          message: 'Image was succesfully sent',
          duration: 3500,
          position: 'bottom'
        });
      
        toast.present();
          this.startUpload(imageData); 
        })
      .catch((err) => {
        let alert = this.alertCtrl.create({
          title: 'Something went wrong',
          message: err,
          buttons: ['Dismiss']
        });
        alert.present();
       });
    }

}
