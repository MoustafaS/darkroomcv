(function() {
'use strict';

var Grey = Darkroom.Transformation.extend({
  applyTransformation: function(canvas, image, next) {
    // Snapshot the image delimited by the crop zone
    var snapshot = new Image();
    snapshot.onload = function() {
      
      var imgInstance = new fabric.Image(this, {
        // options to make the image static
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


Darkroom.plugins['grey'] = Darkroom.Plugin.extend({

  initialize: function InitDarkroomCropPlugin() {
    var buttonGroup = this.darkroom.toolbar.createButtonGroup();

    this.cropButton = buttonGroup.createButton({
      image: 'grey',
	  tooltip:'Convert to grayscale'
    });
    
    // Buttons click
    this.cropButton.addEventListener('click', this.greyImage.bind(this));
    
  },
    greyImage: function() {

    this.darkroom.applyTransformation(new Grey());
  }

});

})();
