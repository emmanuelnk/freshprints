$(function() {
  // Your custom JavaScript goes here
    // Dropzone config

    $("#spinnerdiv").hide();
    function formatJsonToHtml (obj) {
        $("#image-props")
        .append('<h5 style="font-style:italic;font-weight:400;">'+ obj.cloudFileName + '</h5>')
        .append(renderjson(obj));
        numFilesJSONContainer++;
        if(numFilesJSONContainer >= numFiles && numFiles !== 0) {
            $("#spinnertext").text("Finished!");
            $("#spinnerel").spin(false);
            $("#spinnerdiv").hide();
        }
    }
    const maxGlobalFileSize = 1024*1024*8;
    let currGlobalFileSize = 0;
    let numFiles = 0;
    let numFilesJSONContainer = 0;

   Dropzone.options.myAwesomeDropzone = {
        maxFilesize: 5,//mb
        maxFiles:16,
        addRemoveLinks: false,
        dictResponseError: 'Server not Configured',
        acceptedFiles: ".png,.jpg,.gif,.bmp,.jpeg",
        init:function(){
            const self = this;
            // config
            self.options.addRemoveLinks = false;
            self.options.dictRemoveFile = "Delete";
            //New file added
            self.on("addedfile", function (file) {
                console.log('new file added ', file);
                currGlobalFileSize+=file.size;
                numFiles++;
                $("#spinnerdiv").show();
                $("#spinnerel").spin({ position:"relative", left:"10%", lines: 8, length: 8, width: 6, radius: 10 });
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
        },
        accept: function (file, done) {
            if (currGlobalFileSize >= maxGlobalFileSize ) {
                return done('8MB total upload per request quota exceeded!');
            }
            return done();
        }
    };

    // Events
    // Reset dropzone
    $("#resetDropzone").click(function(){
        $("#my-awesome-dropzone").load(location.href+" #my-awesome-dropzone>*","");
        $("#image-props").load(location.href+" #image-props>*","");
        setTimeout(function(){$("#spinnerdiv").hide();},50);
        currGlobalFileSize = 0;
        numFiles = 0;
    });
});
