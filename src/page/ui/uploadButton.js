/**
 * UI parts - Upload Button.
 */

export function setup() {
    $('.js-btn-upload').off('click').on('click', () => {

        const pdfFileName = $('#dropdownPdf .js-text').text();
        if (!pdfFileName || pdfFileName === 'PDF File') {
            return alert('Display a PDF, before upload.');
        }
        const contentBase64 = window.fileMap[pdfFileName];

        const $progressBar = $('.js-upload-progress');

        $.ajax({
            xhr: function(){
               var xhr = new window.XMLHttpRequest();
               //Upload progress
               xhr.upload.addEventListener("progress", function(evt){
               if (evt.lengthComputable) {
                 var percentComplete = evt.loaded / evt.total;
                 //Do something with upload progress
                 console.log('uploadProgress:', percentComplete);

                 let percent = Math.floor(percentComplete * 100);
                 $progressBar.find('.progress-bar').css('width', percent + '%').attr('aria-valuenow', percent).text(percent + '%');
                 if (percent === 100) {
                    setTimeout(() => {
                        $progressBar.addClass('hidden');
                    }, 2000);
                 }
                }
               }, false);
             //Download progress
               xhr.addEventListener("progress", function(evt){
                 if (evt.lengthComputable) {
                   var percentComplete = evt.loaded / evt.total;
                 //Do something with download progress
                   console.log('downloadProgress:', percentComplete);
                 }
               }, false);
               return xhr;
            },
            url : '/api/pdf_upload',
            method : 'POST',
            dataType : 'json',
            data : { name : pdfFileName, content : contentBase64 }
        }).then(result => {
            console.log('result:', result);
            setTimeout(() => {
                // alert('Upload completed.');
                $('#uploadResult').text(result.status);
            }, 500); // wait for progress bar animation.
        });

        // Show.
        $progressBar.removeClass('hidden').find('.progress-bar').css('width', '0%').attr('aria-valuenow', 0).text('0%');

        return false;
    });
}
