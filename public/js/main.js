$(function() {
  // Your custom JavaScript goes here
    // Dropzone config

    $("#spinnerdiv").hide();
    $("#div_clone").hide();
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
    let numClones = 1;


   Dropzone.options.myAwesomeDropzone = {
        maxFilesize: 5,//mb
        maxFiles:16,
        addRemoveLinks: false,
        dictResponseError: 'Server not Configured',
        acceptedFiles: ".png,.jpg,.gif,.bmp,.jpeg",
        renameFilename: function (filename) {
           return new Date().getTime() + '_' + filename;
        },
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
                // formatJsonToHtml(resp);
                makeGVARVCard("image-props","div_clone",numClones++,resp,file);
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
        // $("#my-awesome-dropzone").load(location.href+" #my-awesome-dropzone>*","");
        // $("#image-props").load(location.href+" #image-props>*","");
        // setTimeout(function(){$("#spinnerdiv").hide();},50);
        // currGlobalFileSize = 0;
        // numFiles = 0;
        // numClones = 1;
        location.reload();
    });

    // Functions
    function makeCloneDiv(appendDivId,cloneDivId,cloneCount) {
        const clone = $(`#${cloneDivId}`).clone(false);
        // change all id values to a new unique value by adding "_cloneX" to the end
        // where X is a number that increases each time you make a clone
        $("*", clone).add(clone).each(function() {
            if (this.id) {
                this.id = this.id + "_" + cloneCount;

            }
            if (this.name) {
                this.name = this.name +"_" + cloneCount;
            }

        });

        $(`#${appendDivId}`).append(clone);
    }

    function makeGVARVCard(appendDivId,cloneDivId,cloneCount,data,file) {
        const clone = $(`#${cloneDivId}`).clone(false);
        // change all id values to a new unique value by adding "_cloneX" to the end
        // where X is a number that increases each time you make a clone
        $("*", clone).add(clone).each(function() {
            if (this.id) {
                this.id = this.id + "_" + cloneCount;

            }
            if (this.name) {
                this.name = this.name +"_" + cloneCount;
            }

        });

        $(`#${appendDivId}`).append(clone);
        $("#div_clone_"+cloneCount).show();
        // set data targets
        $("#collapse_button_"+cloneCount).attr('data-target',"#foo_" + cloneCount);
        $("#face-tab_"+cloneCount).attr('href',"#face-view_" + cloneCount);
        $("#labels-tab_"+cloneCount).attr('href',"#labels-view_" + cloneCount);
        $("#text-tab_"+cloneCount).attr('href',"#text-view_" + cloneCount);
        $("#landmark-tab_"+cloneCount).attr('href',"#landmark-view_" + cloneCount);
        $("#logo-tab_"+cloneCount).attr('href',"#logo-view_" + cloneCount);
        $("#props-tab_"+cloneCount).attr('href',"#props-view_" + cloneCount);
        $("#json-tab_"+cloneCount).attr('href',"#json-view_" + cloneCount);
        //stop spinner
        $("#spinnerel").spin(false);
        $("#spinnerdiv").hide();

        // insert response data

        // Title and thumbnail
        const titleArr = data.cloudFileName.split(/(_)/);
        titleArr.shift();
        titleArr.shift();
        const gvarvImageTitle = titleArr.join("");
        $("#gvarv_image_title_"+cloneCount).text(gvarvImageTitle);
        $("#gvarv_image_thumb_"+cloneCount).attr("src",data.imagePublicUrl);

        // JSON tab
        $("#json-view_"+cloneCount).append(renderjson(data));

        // Build tabs
        buildFaceTab ();
        buildLabelsTab ();
        buildTextTab ();

        // Face tab
        // create new gvarv obj
        function buildFaceTab () {
            if(data.responses[0].faceAnnotations.length > 0) {
                const gvarv = new Gvarv("face_canvas_" + cloneCount);
                applyZoom(gvarv.canvas, "canvasContainer_" + cloneCount);
                setPanAndZoomCanvasEvents(gvarv, `face_${cloneCount}`);
                // add image to canvas
                // console.log("File_deb",file);
                gvarv.addImageToCanvas(data.imagePublicUrl, file.width, file.height).then(function (oImg) {
                    const gvarv_group = gvarv.addGroup([oImg]);
                        let barChartDataObjArr = [];
                        let confBarChartDataObjArr = [];
                        $("#num_faces_id_" + cloneCount).text(data.responses[0].faceAnnotations.length);
                        data.responses[0].faceAnnotations.forEach(function (el, i) {
                            i++;
                            gvarv_group.addWithUpdate(gvarv.addFacePoly(el.boundingPoly.vertices, "lightgreen"));
                            gvarv_group.addWithUpdate(gvarv.addFacePoly(el.fdBoundingPoly.vertices, "lightgreen"));
                            gvarv_group.addWithUpdate(gvarv.addFaceNumber(`${i}`, el.boundingPoly.vertices[0]));
                            if (el.landmarks.length > 0) {
                                el.landmarks.forEach(function (ell) {
                                    gvarv_group.addWithUpdate(gvarv.addFaceLandmark(ell.position.y, ell.position.x, "lightgreen"));
                                });
                            }


                            let likelihoodArr = [];
                            likelihoodArr.push(getLikelihood(el.joyLikelihood));
                            likelihoodArr.push(getLikelihood(el.sorrowLikelihood));
                            likelihoodArr.push(getLikelihood(el.angerLikelihood));
                            likelihoodArr.push(getLikelihood(el.surpriseLikelihood));
                            likelihoodArr.push(getLikelihood(el.underExposedLikelihood));
                            likelihoodArr.push(getLikelihood(el.blurredLikelihood));
                            likelihoodArr.push(getLikelihood(el.headwearLikelihood));
                            barChartDataObjArr.push({name: "Face " + i, data: likelihoodArr});

                            let confidenceArr = [];
                            confidenceArr.push(_.round(el.detectionConfidence, 2));
                            confidenceArr.push(_.round(el.landmarkingConfidence, 2));
                            confBarChartDataObjArr.push({name: "Face " + i, data: confidenceArr});

                            buildAnglesTable(cloneCount, i, {
                                panAngle: _.round(angle360(el.panAngle * (180 / Math.PI), 1)) + "°",
                                rollAngle: _.round(angle360(el.rollAngle * (180 / Math.PI), 1)) + "°",
                                tiltAngle: _.round(angle360(el.tiltAngle * (180 / Math.PI), 1)) + "°"
                            });

                        });
                        buildLikelihoodChart("chartContainer_" + cloneCount, barChartDataObjArr);
                        buildConfidenceChart("confidenceChartContainer_" + cloneCount, confBarChartDataObjArr);
                    gvarv.canvas.add(gvarv_group);
                }, function (err) {
                    console.log(err);
                });
            } else {
                $("#face-view_"+cloneCount).empty();
                $("#face-view_"+cloneCount).append("<h3 class='text-center no-data' >NONE DETECTED</h3>");
            }
        }


        // untied functions
        // Liklihood
        function getLikelihood(val){
            switch (val) {
                case "UNKNOWN":return 0;break;
                case "VERY_UNLIKEL":return 0.2;break;
                case "UNLIKELY":return 0.4;break;
                case "POSSIBLE":return 0.6;break;
                case "LIKELY":return 0.8;break;
                case "VERY_LIKELY":return 1;break;
                default:return 0;break;
            }
        }

        function setPanAndZoomCanvasEvents(gvarvObj,countId) {
            // pan and zoom events
            $('#zoomIn_'+countId).click(function(){
                gvarvObj.canvas.setZoom(gvarvObj.canvas.getZoom() * 1.1 ) ;
            }) ;
            $('#zoomOut_'+countId).click(function(){
                gvarvObj.canvas.setZoom(gvarvObj.canvas.getZoom() / 1.1 ) ;
            }) ;
            $('#goRight_'+countId).click(function(){
                const units = 10 ;
                const delta = new fabric.Point(units,0) ;
                gvarvObj.canvas.relativePan(delta) ;
            }) ;
            $('#goLeft_'+countId).click(function(){
                const units = 10 ;
                const delta = new fabric.Point(-units,0) ;
                gvarvObj.canvas.relativePan(delta) ;
            }) ;
            $('#goUp_'+countId).click(function(){
                const units = 10 ;
                const delta = new fabric.Point(0,-units) ;
                gvarvObj.canvas.relativePan(delta) ;
            }) ;
            $('#goDown'+countId).click(function(){
                const units = 10 ;
                const delta = new fabric.Point(0,units) ;
                gvarvObj.canvas.relativePan(delta) ;
            }) ;
        }

        function buildLikelihoodChart(chartContainerId,dataArr) {
            const likelihoodValues = {
                0: 'UNKNOWN',
                0.2: 'VERY_UNLIKELY',
                0.4: 'UNLIKELY',
                0.6: 'POSSIBLE',
                0.8: 'LIKELY',
                1: 'VERY_LIKELY'
            };
            Highcharts.chart(chartContainerId, {
                chart: {
                    type: 'bar'
                },
                title: {
                    text: 'Likelihood'
                },
                xAxis: {
                    categories: ['Joy', 'Sorrow', 'Anger', 'Surprise', 'Under-exposed','Blurred','Headwear'],
                    title: {
                        text: null
                    }
                },
                yAxis: {
                    labels: {
                        formatter: function() {
                            const value = likelihoodValues[this.value];
                            return value !== 'undefined' ? value : this.value;
                        }
                    }
                },
                tooltip: {
                    valueSuffix: ''
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                credits: {
                    enabled: false
                },
                series: dataArr
            });
        }

        function buildConfidenceChart (containerId,dataArr) {
            Highcharts.chart(containerId, {
                chart: {
                    type: 'bar'
                },
                title: {
                    text: 'Detection Confidence'
                },
                xAxis: {
                    categories: ['Face Bounds','Facial Landmarks'],
                    title: {
                        text: null
                    }
                },
                yAxis: {
                    min: 0,
                    max:1,
                    title: {
                        text: 'Confidence',
                        align: 'high'
                    },
                    labels: {
                        overflow: 'justify'
                    }
                },
                tooltip: {
                    valueSuffix: ''
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                credits: {
                    enabled: false
                },
                series: dataArr
            });
        }

        // build table for roll, tilt and pan angles
        function buildAnglesTable (itemIndex,faceNum,obj) {
            const $dataRow = $( `<tr><td>${faceNum}</td><td>${obj.panAngle}</td><td>${obj.rollAngle}</td><td>${obj.tiltAngle}</td></tr>`);
            $("#anglesTable_"+itemIndex+" > tbody").append($dataRow);
        }
        // to limit angle to
        function angle360 (angle) {
            if (angle > 360 || angle < -360) {
                return (angle - (360 * Math.floor(angle/360)))
            }
            return angle;
        }

        // Labels tab
        function buildLabelsTab () {
            if (data.responses[0].labelAnnotations.length > 0) {
                $("#num_labels_id_"+cloneCount).text(data.responses[0].labelAnnotations.length);
                let labelsDataArr = [];
                data.responses[0].labelAnnotations.forEach(function(el,i){
                    labelsDataArr.push([el.description,_.round(el.score,2)]);
                });
                // console.log(labelsDataArr);
                buildLabelsGraph("labelsChartContainer_"+cloneCount,labelsDataArr);
            } else {
                $("#labels-view_"+cloneCount).empty();
                $("#labels-view_"+cloneCount).append("<h3 class='text-center no-data' >NONE DETECTED</h3>");
            }
        }


        function buildLabelsGraph (containerId,seriesData) {
            Highcharts.chart(containerId, {
                chart: {
                    type: 'bar'
                },
                title: {
                    text: 'Labels'
                },
                xAxis: {
                    tickInterval: 1,
                    labels: {
                        enabled: true,
                        formatter: function() { return seriesData[this.value][0];},
                    }
                },
                yAxis: {
                    min: 0,
                    max:1,
                    title: {
                        text: 'Confidence',
                        align: 'high'
                    },
                    labels: {
                        overflow: 'justify'
                    }
                },
                tooltip: {
                    valueSuffix: ''
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                credits: {
                    enabled: false
                },
                series: [{
                    name:"Detection Confidence",
                    data:seriesData
                }]
            });
        }

        // Text tab
        // create new gvarv obj

        function buildTextTab () {
            if (data.responses[0].textAnnotations.length > 0) {
                const gvarv = new Gvarv("text_canvas_"+cloneCount);
                applyZoom(gvarv.canvas,"textCanvasContainer_"+cloneCount);
                setPanAndZoomCanvasEvents(gvarv, `text_${cloneCount}`);
                $("#num_text_id_"+cloneCount).text("✓");
                $("#detectedTextParagraph_"+cloneCount).text(data.responses[0].fullTextAnnotation.text);

                gvarv.addImageToCanvas(data.imagePublicUrl,file.width,file.height).then(function(oImg) {
                    const gvarv_group = gvarv.addGroup([oImg]);

                    data.responses[0].fullTextAnnotation.pages.forEach(function(page){
                        //page.property.detectedLanguages.{confidence,languageCode}
                        page.blocks.forEach(function(block){
                            // block.boundingBox.vertices //to fabric poly
                            gvarv_group.addWithUpdate(gvarv.addWordPoly(block.boundingBox.vertices, "red"));
                            block.paragraphs.forEach(function(paragraph){
                                // paragraph.boundingBox.vertices //to fabric poly
                                gvarv_group.addWithUpdate(gvarv.addWordPoly(paragraph.boundingBox.vertices, "orange"));
                                paragraph.words.forEach(function(word){
                                    // word.boundingBox.vertices //to fabric poly
                                    gvarv_group.addWithUpdate(gvarv.addWordPoly(word.boundingBox.vertices, "yellow"));
                                    word.symbols.forEach(function(symbol){
                                        // symbol.boundingBox.vertices //to fabric poly
                                        gvarv_group.addWithUpdate(gvarv.addWordPoly(symbol.boundingBox.vertices, "lightgreen"));
                                    });
                                });
                            });
                        });
                    });
                    gvarv.canvas.add(gvarv_group);
                },function(err){
                    console.log(err);
                });
            }else{
                $("#text-view_"+cloneCount).empty();
                $("#text-view_"+cloneCount).append("<h3 class='text-center no-data' >NONE DETECTED</h3>");
            }
        }


    }


});
