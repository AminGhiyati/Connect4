// Initialisiert die Dropzonen und das ziehbare Spielstück
export function setupDragAndDrop(callbackOnDrop) {
  const row = document.getElementById("dropzoneRow");

  // Für jede der 7 Spalten eine Dropzone anlegen
  for (let c = 0; c < 7; c++) {
    const dropzone = document.createElement("div");
    dropzone.className = "dropzone";
    dropzone.dataset.col = c; // Spaltenindex speichern

    // Dragover erlauben, sonst funktioniert das Droppen nicht
    dropzone.addEventListener("dragover", (e) => e.preventDefault());

    // Wenn Spielstein in diese Zone fallen gelassen wird
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      callbackOnDrop(Number(e.currentTarget.dataset.col)); // Callback ausführen mit Spalte
    });

    row.appendChild(dropzone);
  }

  // Ein einziges ziehbares Spielstück über dem Spielfeld anzeigen
  const piece = document.createElement("div");
  piece.className = "draggable";
  piece.draggable = true;
  row.appendChild(piece);
}
