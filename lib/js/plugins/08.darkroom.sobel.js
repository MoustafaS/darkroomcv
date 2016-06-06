(function() {
'use strict';

var Sobel = Darkroom.Transformation.extend({
  applyTransformation: function(canvas, image, next) {
    var snapshot = new Image();
    snapshot.onload = function() {
      var imgInstance = new fabric.Image(this, {
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        lockUniScaling: true,
        hasControls: false,
        hasBorders: false
      });
      image.remove();
      canvas.add(imgInstance);
      next(imgInstance);
    };
	
	var w = canvas.width, h = canvas.height;
	var context =canvas.getContext("2d");
	var imageData=context.getImageData(0,0,w,h);
	var img_u8 = new jsfeat.matrix_t(w,h, jsfeat.U8_t | jsfeat.C1_t);
	var img_gxgy = new jsfeat.matrix_t(w, h, jsfeat.S32C2_t);
	//gray scale for processing
	jsfeat.imgproc.grayscale(imageData.data, w,h, img_u8);
	//apply sobel
	jsfeat.imgproc.sobel_derivatives(img_u8, img_gxgy);
	var data_u32 = new Uint32Array(imageData.data.buffer);
    var alpha = (0xff << 24);
    var i = img_u8.cols*img_u8.rows, pix=0, gx = 0, gy = 0;
    while(--i >= 0) {
        gx = Math.abs(img_gxgy.data[i<<1]>>2)&0xff;
        gy = Math.abs(img_gxgy.data[(i<<1)+1]>>2)&0xff;
        pix = ((gx + gy)>>1)&0xff;
        data_u32[i] = (pix << 24) | (gx << 16) | (0 << 8) | gy;
    }
	 var c = document.createElement("canvas");//canvas to write the image with
	 var wc = c.getContext("2d");
	 c.width = w;
	 c.height = h;
     wc.putImageData(imageData, 0, 0);
	 snapshot.src = c.toDataURL();
  }
});
Darkroom.plugins['sobel'] = Darkroom.Plugin.extend({

  initialize: function InitDarkroomSobelPlugin() {
    var buttonGroup = this.darkroom.toolbar.createButtonGroup();

    this.sobelButton = buttonGroup.createButton({
      image: 'sobel',
	  tooltip:'Sobel edge detection'
    });
    
    // Buttons click
    this.sobelButton.addEventListener('click', this.sobelImage.bind(this));
    
  },
    sobelImage: function() {
    this.darkroom.applyTransformation(new Sobel());
  }
});

})();
