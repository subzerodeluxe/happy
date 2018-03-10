import * as functions from 'firebase-functions';

// Import Firebase
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);

// Import Cloud Vision
import * as vision from '@google-cloud/vision'; 
const visionClient = new vision.ImageAnnotatorClient(); 

// Dedicated bucket for cloud function invocation
const bucketName = 'happy-9aced-functions';

// Function 
export const imageTagger = functions.storage
    .bucket(bucketName)
    .object()
    .onChange(async event => {
       
        // File data
        const object = event.data;
        const filePath = object.name; 

        // Location of saved file in bucket
        const imageUri = `gs://${bucketName}/${filePath}`; 

        // Firestore docID === file name  
        const docId = filePath.split('.jpg')[0];  // remove the .jpg extension

        const docRef = admin.firestore().collection('photos').doc(docId);

        // Await the cloud vision response
        const results = await visionClient.labelDetection(imageUri); 

        //Map the data to desired format (returns string[])
        const labels = results[0].labelAnnotations.map(obj => obj.description);
        
        const check = ["model", "hair", "photograph", "girl", "girls", "woman", "women", "boy", "boys", "man", "men", "person", "persons", "human", "humans"]; 
        let found = false;
        for(let i = 0; i < check.length; i++) {
            if(labels.indexOf(check[i]) > -1) {
                found = true;
                break; 
            } 
        }
        
        const human = found;  

        // save result in firestore
        return docRef.set({human,labels})
    });