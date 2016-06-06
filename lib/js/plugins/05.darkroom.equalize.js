(function() {
'use strict';

var Equalize = Darkroom.Transformation.extend({
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
	jsfeat.imgproc.grayscale(imageData.data, w,h, img_u8);
	jsfeat.imgproc.equalize_histogram(img_u8, img_u8);
	var data_u32 = new Uint32Array(imageData.data.buffer);
     var alpha = (0xff << 24);
     var i = img_u8.cols*img_u8.rows, pix = 0;
     while(--i >= 0) {
         pix = img_u8.data[i];
         data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
     }
	 var c = document.createElement("canvas");//canvas to write the image with
	 var wc = c.getContext("2d");
	 c.width = w;
	 c.height = h;
     wc.putImageData(imageData, 0, 0);
	 snapshot.src = c.toDataURL();
  }
});
Darkroom.plugins['equalize'] = Darkroom.Plugin.extend({

  initialize: function InitDarkroomEqualizePlugin() {
    var buttonGroup = this.darkroom.toolbar.createButtonGroup();

    this.equalizeButton = buttonGroup.createButton({
      image: 'equalize',
	  tooltip:'Equalize histogram'
    });
    
    // Buttons click
    this.equalizeButton.addEventListener('click', this.equalizeImage.bind(this));
    
  },
    equalizeImage: function() {
    this.darkroom.applyTransformation(new Equalize());
  }
});

})();
