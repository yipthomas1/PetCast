let yolo = {
  net: null,
  names: null,

  loadModel: function(configPath, weightsPath, namesPath, callback) {
      this.net = cv.dnn.readNetFromDarknet(configPath, weightsPath);
      this.names = namesPath;
      callback();
  },

  detect: function(mat, callback) {
      // Convert the image to a 4D blob
      let blob = cv.blobFromImage(mat, 1/255.0, new cv.Size(416, 416), new cv.Scalar(0, 0, 0), true, false);
      
      // Set the blob as input to the network
      this.net.setInput(blob);

      // Forward pass through the network
      let output = this.net.forward();

      // Get the class names
      let classNames = this.names.split('\n').map(name => name.trim());

      // Initialize the results array
      let results = [];

      // Loop through the detected objects
      for (let i = 0; i < output.rows; i++) {
          let confidence = output.at(i, 5);
          if (confidence > 0.5) {
              let classId = output.at(i, 0);
              let className = classNames[classId];
              let x = output.at(i, 1) * mat.cols;
              let y = output.at(i, 2) * mat.rows;
              let width = output.at(i, 3) * mat.cols - x;
              let height = output.at(i, 4) * mat.rows - y;
              results.push({
                  classId: classId,
                  className: className,
                  confidence: confidence,
                  x: x,
                  y: y,
                  width: width,
                  height: height
              });
          }
      }

      // Draw the bounding boxes on the mat
      for (let i = 0; i < results.length; i++) {
          let rect = new cv.Rect(results[i].x, results[i].y, results[i].width, results[i].height);
          let color = new cv.Scalar(255, 0, 0);
          cv.rectangle(mat, rect, color, 2);
          cv.putText(mat, results[i].className + ': ' + results[i].confidence.toFixed(2), new cv.Point(results[i].x, results[i].y - 5), cv.FONT_HERSHEY_SIMPLEX, 0.5, color, 1);
      }

      // Clean up
      blob.delete();
      output.delete();

      // Return the results
      callback(null, mat);
  }
};