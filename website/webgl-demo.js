var updateSlider;
var updateDataset;
var animateDataset;

function start() {
    

var canvas;
var gl;
var squareVerticesBuffer;
var textureCoordBuffer;
var vertexIndexBuffer;
var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var texturePositionAttribute;
var perspectiveMatrix;
var tempTextureArray;
var humTextureArray;
var presTextureArray;
var precTextureArray;
var loadProgress = 0;

var months = new Array();
months[0] = "January";
months[1] = "February";
months[2] = "March";
months[3] = "April";
months[4] = "May";
months[5] = "June";
months[6] = "July";
months[7] = "August";
months[8] = "September";
months[9] = "October";
months[10] = "November";
months[11] = "December";



    canvas = document.getElementById("glcanvas");
    gl = canvas.getContext("experimental-webgl");


    if (gl) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things



        initShaders();
        initBuffers();

        tempTextureArray = Array(809);
        precTextureArray = Array(809);
        presTextureArray = Array(809);
        humTextureArray = Array(809);
        for (var i = 0; i < 809; i++) {
            tempTextureArray[i] = gl.createTexture();
            humTextureArray[i] = gl.createTexture();
            precTextureArray[i] = gl.createTexture();
            presTextureArray[i] = gl.createTexture();
        }

        loadData("./temperature.bin", tempTextureArray);
        loadData("./pr_wtr.bin", precTextureArray);
        loadData("./pressure.bin", presTextureArray);
        loadData("./humidity.bin", humTextureArray);


    }


function loadData(filename, textureArray) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", filename, true);
    oReq.responseType = "arraybuffer";
    oReq.send(null);

    oReq.onload = function (oEvent) {
        var arrayBuffer = new Float32Array(oReq.response);

        if (arrayBuffer) {
            var has_float_tex = gl.getExtension("OES_texture_float");
            var has_float_linear = gl.getExtension("OES_texture_float_linear");
            for (var texNum = 0; texNum < 809; texNum++)
            {
                var data = new Float32Array(256*128*3);

                for (var i = 0; i < 256; i++) {
                    for (var j = 0; j < 128; j++) {
                        if (i < 144 && j < 73) {
                            data[(j*256+i)*3+2] = arrayBuffer[j*144+(i+72)%144 + texNum*(144*73)];
                            data[(j*256+i)*3+1] = arrayBuffer[j*144+(i+72)%144 + texNum*(144*73)];
                            data[(j*256+i)*3+0] = arrayBuffer[j*144+(i+72)%144 + texNum*(144*73)];
                        }
                    }
                }
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, textureArray[texNum]);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 256, 128, 0, gl.RGB, gl.FLOAT, data);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                gl.generateMipmap(gl.TEXTURE_2D);
            }
        }


        gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);
        updateSlider(document.getElementById("dataset-range").value);

        loadProgress += 1;
        if (loadProgress == 4) {
            drawScene();
        }
    };
}


function initBuffers() {
  squareVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
  var vertices = [
    1.0,  1.0,  0.0,
    -1.0, 1.0,  0.0,
    1.0,  -1.0, 0.0,
    -1.0, -1.0, 0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  
  textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  
  var textureCoordinates = [
    144.0/256.0, 0.0,
    0.0, 0.0,
    144.0/256.0, 73.0/128.0,
    0.0, 73.0/128.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex array for each face's vertices.
  
  verticesIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, verticesIndexBuffer);
  
  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.
  
  var vertexIndexBuffer = [
    0,  1,  2,      0,  2,  3,    // front
  ]
  
  // Now send the element array to GL
  
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(verticesIndexBuffer), gl.STATIC_DRAW);

}

function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  gl.vertexAttribPointer(texturePositionAttribute, 2, gl.FLOAT, false, 0, 0);


  var datasetType = document.getElementById("dataset-select").value;
  var sliderVal = parseInt(document.getElementById("dataset-range").value);

  if (datasetType != "everything") {
      if (datasetType == "temperature") {
          gl.bindTexture(gl.TEXTURE_2D, tempTextureArray[sliderVal]);
          gl.uniform1i(gl.getUniformLocation(shaderProgram, "dataType"), 0);
      } else if (datasetType == "humidity") {
          gl.bindTexture(gl.TEXTURE_2D, humTextureArray[sliderVal]);
          gl.uniform1i(gl.getUniformLocation(shaderProgram, "dataType"), 1);
      } else if (datasetType == "precipitation") {
          gl.bindTexture(gl.TEXTURE_2D, precTextureArray[sliderVal]);
          gl.uniform1i(gl.getUniformLocation(shaderProgram, "dataType"), 2);
      } else if (datasetType == "pressure") {
          gl.bindTexture(gl.TEXTURE_2D, presTextureArray[sliderVal]);
          gl.uniform1i(gl.getUniformLocation(shaderProgram, "dataType"), 3);
      }


      orthoMatrix = makeOrtho(-1, 1, -1, 1, -10, 10);
      loadIdentity();
      mvTranslate([-0.0, 0.0, -6.0]);
      setMatrixUniforms();
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  } else {
      orthoMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);
      //orthoMatrix = makeOrtho(-1, 1, -1, 1, -10, 10);
      loadIdentity();
      mvTranslate([-0.0, 0.0, -4.0]);
      mvRotate(45, [0, 1, 0]);


      gl.bindTexture(gl.TEXTURE_2D, tempTextureArray[sliderVal]);
      setMatrixUniforms();
      gl.uniform1i(gl.getUniformLocation(shaderProgram, "dataType"), 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      gl.bindTexture(gl.TEXTURE_2D, precTextureArray[sliderVal]);
      loadIdentity();
      mvTranslate([-1.0, 0.0, -4.0]);
      mvRotate(45, [0, 1, 0]);
      setMatrixUniforms();
      gl.uniform1i(gl.getUniformLocation(shaderProgram, "dataType"), 2);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      gl.bindTexture(gl.TEXTURE_2D, presTextureArray[sliderVal]);
      loadIdentity();
      mvTranslate([0.8, 0.0, -4.0]);
      mvRotate(45, [0, 1, 0]);
      setMatrixUniforms();
      gl.uniform1i(gl.getUniformLocation(shaderProgram, "dataType"), 3);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      gl.bindTexture(gl.TEXTURE_2D, humTextureArray[sliderVal]);
      loadIdentity();
      mvTranslate([1.7, 0.0, -4.0]);
      mvRotate(45, [0, 1, 0]);
      setMatrixUniforms();
      gl.uniform1i(gl.getUniformLocation(shaderProgram, "dataType"), 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  if (document.getElementById("dataset-animate").checked) {
      setTimeout(function() { 
        var sliderVal = parseInt(document.getElementById("dataset-range").value);
        sliderVal = (sliderVal+1)%809;
        document.getElementById("dataset-range").value = sliderVal;
        updateSlider(sliderVal);
      }, 100);
  }
}

function initShaders() {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");
  
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
  }
  
  gl.useProgram(shaderProgram);
  
  vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(vertexPositionAttribute);

  texturePositionAttribute = gl.getAttribLocation(shaderProgram, "aTexCoord");
  gl.enableVertexAttribArray(texturePositionAttribute);
}

function getShader(gl, id) {
  var shaderScript = document.getElementById(id);
  
  if (!shaderScript) {
    return null;
  }
  
  // Walk through the source element's children, building the
  // shader source string.
  
  var theSource = "";
  var currentChild = shaderScript.firstChild;
  
  while(currentChild) {
    if (currentChild.nodeType == 3) {
      theSource += currentChild.textContent;
    }
    
    currentChild = currentChild.nextSibling;
  }
  
  // Now figure out what type of shader script we have,
  // based on its MIME type.
  
  var shader;
  
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;  // Unknown shader type
  }
  
  // Send the source to the shader object
  
  gl.shaderSource(shader, theSource);
  
  // Compile the shader program
  
  gl.compileShader(shader);
  
  // See if it compiled successfully
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    return null;
  }
  
  return shader;
}

updateSlider = function(sliderVal) {
    //gl.bindTexture(gl.TEXTURE_2D, tempTextureArray[sliderVal]);
    document.getElementById("dataset-date").innerHTML=months[sliderVal%12]+", "+(Math.floor(sliderVal/12)+1948);
    drawScene();
}

updateDataset = function() {
  if (!document.getElementById("dataset-animate").checked) {
      drawScene();
      
  }
}

animateDataset = function() {
    drawScene();
}



//
// Matrix utility functions
//

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(orthoMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}


function mvRotate(angle, v) {
  var inRadians = angle * Math.PI / 180.0;
  
  var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
  multMatrix(m);
}

}
