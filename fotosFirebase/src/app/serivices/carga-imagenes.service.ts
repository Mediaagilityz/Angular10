import { Injectable } from '@angular/core';

import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';
import { FileItem } from '../models/file-item';

@Injectable({
  providedIn: 'root',
})
export class CargaImagenesService {
  private CARPETA_IMAGENES = 'img';

  constructor(private db: AngularFirestore) {}

  cargarImagenesFirebase(imagenes: FileItem[]) {
    // Referencia al storage
    const storageRef = firebase.storage().ref();

    for (const item of imagenes) {
      item.estaSubiendo = true;

      if (item.progreso >= 100) {
        continue;
      }

      const uploadTask: firebase.storage.UploadTask = storageRef
        .child(`${this.CARPETA_IMAGENES}/${item.nombreArchivo}`)
        .put(item.archivo);

      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED),
        (snapshot: firebase.storage.UploadTaskSnapshot) =>
          (item.progreso =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        (error) => console.log('Error al subir' + error),
        () => {
          console.log('Imagen cargada correctamente');
          // item.url = uploadTask.snapshot.downloadURL;
          item.url = uploadTask.snapshot.ref.getDownloadURL.toString();
          item.estaSubiendo = false;

          this.guardarImage({
            nombre: item.nombreArchivo,
            url: item.url,
          });
        };
    }
  }

  private guardarImage(imagen: { nombre: string; url: string }) {
    this.db.collection(`/${this.CARPETA_IMAGENES}`).add(imagen);
  }
}
