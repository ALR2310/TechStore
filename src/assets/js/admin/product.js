var notedEditor;
BalloonEditor
    .create(document.querySelector('#ckeditor_balloon'))
    .then(editor => {
        notedEditor = editor;
    })
    .catch(error => {
        console.error(error);
    });