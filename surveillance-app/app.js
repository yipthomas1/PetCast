let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

// Function to start the video stream
function startVideoStream() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function(stream) {
            video.srcObject = stream;
            video.play();
        })
        .catch(function(err) {
            console.log("An error occurred: " + err);
        });
}

// Function to perform object detection on each frame
function detectObjects() {
    // Draw the current video frame onto the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas image to a Mat object
    let src = cv.imread_uchar(canvas);
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
        requestAnimationFrame(detectObjects);
    });
}

// Load the YOLO model
yolo.loadModel('yolo/yolov4-tiny.cfg', 'yolo/yolov4-tiny.weights', 'yolo/coco.names', function() {
    console.log('YOLO model loaded successfully!');
    startVideoStream();
});

// Start object detection when the video stream is ready
video.addEventListener('loadeddata', function() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    detectObjects();
});