let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

// Add event listener to start the video stream when the page loads
window.addEventListener('load', function() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(function(stream) {
        video.srcObject = stream;
        video.play();
    })
    .catch(function(err) {
        console.log("An error occurred: " + err);
    });
});

// Function to perform object detection on each frame
function detectObjects() {
    // Draw the current video frame onto the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert the canvas image to a Mat object
    let src = cv.imread(canvas);
    let dst = new cv.Mat();
    
    // Perform object detection using YOLO
    yolo.detect(src, function(err, result) {
        if (err) {
            console.log(err);
            return;
        }
        
        // Draw the detected objects on the canvas
        cv.imshow(canvas, result);
        src.delete();
        dst.delete();
        
        // Schedule the next frame
        setTimeout(detectObjects, 0);
    });
}

// Start object detection when the video stream is ready
video.addEventListener('loadeddata', function() {
    detectObjects();
});