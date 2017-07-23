$(function() {
  // Your custom JavaScript goes here
    // Dropzone config

    function formatJsonToHtml (obj) {
        $("#image-props")
        .append('<h5 style="font-style:italic;font-weight:400;">'+ obj.cloudFileName + '</h5>')
        .append(renderjson(obj));
    }

    Dropzone.options.myAwesomeDropzone = {
        maxFilesize: 500,
        addRemoveLinks: true,
        dictResponseError: 'Server not Configured',
        acceptedFiles: ".png,.jpg,.gif,.bmp,.jpeg",
        init:function(){
            var self = this;
            // config
            self.options.addRemoveLinks = true;
            self.options.dictRemoveFile = "Delete";
            //New file added
            self.on("addedfile", function (file) {
                console.log('new file added ', file);
            });
            // Send file starts
            self.on("sending", function (file) {
                console.log('upload started', file);
                $('.meter').show();
            });

            // Success
            self.on('success', function( file, resp ){
                console.log(resp);
                formatJsonToHtml(resp);
            });

            // File upload Progress
            self.on("totaluploadprogress", function (progress) {
                console.log("progress ", progress);
                $('.roller').width(progress + '%');
            });

            self.on("queuecomplete", function (progress) {
                $('.meter').delay(999).slideUp(999);
            });

            // On removing file
            self.on("removedfile", function (file) {
                console.log(file);
            });
        }
    };
});
