const Gvarv = function (canvasId) {
    this.canvas = new fabric.Canvas(canvasId);
    this.addImageToCanvas = function (url,width,height){
        return new Promise((resolve, reject)=>{
            this.canvas.setDimensions({ width: width, height: height});
            fabric.Image.fromURL(url, function(oImg) {
                oImg
                    .set({
                        left:0,
                        top: 0,
                    });
                resolve(oImg);
            },function(err){
                reject(err);
            });
        });
    };
    this.addFaceRect = function (top, left, width, height, color) {
        return new fabric.Rect({
            top:top,
            left:left,
            width: width,
            height: height,
            stroke:color,
            strokeWidth:1,
            fill: 'transparent'});
    };
    this.addFacePoly = function (points, color) {
        return new fabric.Polygon(points,{
            stroke:color,
            strokeWidth:2,
            fill: 'transparent'});
    };
    this.addWordPoly = function (points, color) {
        return new fabric.Polygon(points,{
            stroke:color,
            strokeWidth:1,
            fill: 'transparent'});
    };
    this.addLandmarkPoly = function (points, color) {
        return new fabric.Polygon(points,{
            stroke:color,
            strokeWidth:5,
            fill: 'transparent'});
    };
    this.addLogoPoly = function (points, color) {
        return new fabric.Polygon(points,{
            stroke:color,
            strokeWidth:2,
            fill: 'transparent'});
    };
    this.addFaceLandmark = function (top, left,color) {
        return new fabric.Circle({
            top:top,
            left:left,
            originX:"center",
            originY:"center",
            radius:2,
            stroke:color,
            strokeWidth:1,
            fill: 'transparent'});
    };
    this.addPolyNumber = function (num,obj) {
        return new fabric.Text(num, {
            left:obj.x,
            top:obj.y,
            fill:"red",
            fontSize:20
        });
    };
    this.addGroup = function(arr) {
        return new fabric.Group(arr, {
            left: 0,
            top: 0,
            lockScalingY:true,
            lockScalingX:true,
            lockRotation:true
        });
    }
};

/**
 * Used to apply Zooming on the canvas.
 */
const applyZoom = function (canvas1,canvasId) {
    function zoom(e) {
        const evt=window.event || e;
        const delta = evt.detail? evt.detail*(-120) : evt.wheelDelta;
        const curZoom = canvas1.getZoom(),  newZoom = curZoom + delta / 4000,
            x = e.offsetX, y = e.offsetY;
        //applying zoom values.
        canvas1.zoomToPoint({ x: x, y: y }, newZoom);
        if(e != null)e.preventDefault();
        return false;
    }

    const canvasarea = document.getElementById(canvasId);
    if (canvasarea.addEventListener) {
        // IE9, Chrome, Safari, Opera
        canvasarea.addEventListener("mousewheel", zoom, false);
        // Firefox
        canvasarea.addEventListener("DOMMouseScroll", zoom, false);
    }
    // IE 6/7/8
    else canvasarea.attachEvent("onmousewheel", zoom);
    return this;
};


