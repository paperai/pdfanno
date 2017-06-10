/**
 * UI parts - Upload Button.
 */

export function setup() {
    $('.js-btn-upload').off('click').on('click', () => {

        const pdfFileName = $('#dropdownPdf .js-text').text();
        if (!pdfFileName || pdfFileName === 'PDF File') {
            return alert('Display a PDF before upload.');
        }
        // const contentBase64 = window.pdfanno.fileMap[pdfFileName];
        const contentBase64 = window.annoPage.getContentFile(pdfFileName);

        const $progressBar = $('.js-upload-progress');

        const url = $('#serverURL').val();
        if (!url) {
            return alert('Set server URL.');
        }

        $('#uploadResult').val("Waiting for response...");

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
            url : url,
            method : 'POST',
            dataType : "text",
            data : contentBase64
            //dataType : 'json',
            //data : { name : pdfFileName, content : contentBase64 }
        }).then(result => {
            console.log('result:', result);
            setTimeout(() => {
                // alert('Upload completed.');
                var json = JSON.parse(result);
                $('#uploadResult').val(json.text);
                window.addAll(json.anno);
            }, 500); // wait for progress bar animation.
        });

        // Show.
        $progressBar.removeClass('hidden').find('.progress-bar').css('width', '0%').attr('aria-valuenow', 0).text('0%');

        return false;
    });
}
