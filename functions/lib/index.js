"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
// Import Firebase
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
// Import Cloud Vision
const vision = require("@google-cloud/vision");
const visionClient = new vision.ImageAnnotatorClient();
// Dedicated bucket for cloud function invocation
const bucketName = 'happy-9aced-functions';
// Function 
exports.imageTagger = functions.storage
    .bucket(bucketName)
    .object()
    .onChange((event) => __awaiter(this, void 0, void 0, function* () {
    // File data
    const object = event.data;
    const filePath = object.name;
    // Location of saved file in bucket
    const imageUri = `gs://${bucketName}/${filePath}`;
    // Firestore docID === file name  
    const docId = filePath.split('.jpg')[0]; // remove the .jpg extension
    const docRef = admin.firestore().collection('photos').doc(docId);
    // Await the cloud vision response
    const results = yield visionClient.labelDetection(imageUri);
    //Map the data to desired format (returns string[])
    const labels = results[0].labelAnnotations.map(obj => obj.description);
    const check = ["model", "hair", "photograph", "girl", "girls", "woman", "women", "boy", "boys", "man", "men", "person", "persons", "human", "humans"];
    let found = false;
    for (let i = 0; i < check.length; i++) {
        if (labels.indexOf(check[i]) > -1) {
            found = true;
            break;
        }
    }
    const human = found;
    // save result in firestore
    return docRef.set({ human, labels });
}));
//# sourceMappingURL=index.js.map