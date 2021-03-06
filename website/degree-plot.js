var updateDegreeSlider;
var updateDegreeSet;

function startDegreePlot() {
    

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
var presTextureArray;
var precTextureArray;
var humTextureArray;
var multivarTextureArray;

    canvas = document.getElementById("degree-canvas");
    gl = canvas.getContext("experimental-webgl");


    if (gl) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things



        initShaders();
        initBuffers();

        tempTextureArray = Array(12);
        presTextureArray = Array(12);
        precTextureArray = Array(12);
        humTextureArray = Array(12);
        multivarTextureArray = Array(12);
        for (var i = 0; i < 12; i++) {
            tempTextureArray[i] = gl.createTexture();
            presTextureArray[i] = gl.createTexture();
            precTextureArray[i] = gl.createTexture();
            humTextureArray[i] = gl.createTexture();
            multivarTextureArray[i] = gl.createTexture();
        }

        loadData("./temp_temp_degrees.bin", tempTextureArray, 800.0);
        loadData("./pres_pres_degrees.bin", presTextureArray, 850.0);
        loadData("./prec_prec_degrees.bin", precTextureArray, 1200.0);
        loadData("./hum_hum_degrees.bin", humTextureArray, 1650.0);
        loadData("./multivariate_degrees.bin", multivarTextureArray, 2700.0);


    }


function loadData(filename, textureArray, maxVal) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", filename, true);
    oReq.responseType = "arraybuffer";
    oReq.send(null);

    oReq.onload = function (oEvent) {
        var arrayBuffer = new Int32Array(oReq.response);

        if (arrayBuffer) {
            var has_float_tex = gl.getExtension("OES_texture_float");
            var has_float_linear = gl.getExtension("OES_texture_float_linear");
            for (var texNum = 0; texNum < 12; texNum++)
            {
                var data = new Float32Array(256*128*3);

                for (var i = 0; i < 256; i++) {
                    for (var j = 0; j < 128; j++) {
                        if (i < 144 && j < 73) {
                            data[(j*256+i)*3+2] = arrayBuffer[j*144+(i+72)%144 + texNum*(144*73)]/maxVal;
                            data[(j*256+i)*3+1] = arrayBuffer[j*144+(i+72)%144 + texNum*(144*73)]/maxVal;
                            data[(j*256+i)*3+0] = arrayBuffer[j*144+(i+72)%144 + texNum*(144*73)]/maxVal;
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
        //updateSlider(document.getElementById("dataset-range").value);

        drawScene();
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

  var sliderVal = parseInt(document.getElementById("degree-range").value);
  var datasetType = document.getElementById("degree-dataset-select").value;

      if (datasetType == "temperature") {
          gl.bindTexture(gl.TEXTURE_2D, tempTextureArray[sliderVal]);
      } else if (datasetType == "humidity") {
          gl.bindTexture(gl.TEXTURE_2D, humTextureArray[sliderVal]);
      } else if (datasetType == "precipitation") {
          gl.bindTexture(gl.TEXTURE_2D, precTextureArray[sliderVal]);
      } else if (datasetType == "pressure") {
          gl.bindTexture(gl.TEXTURE_2D, presTextureArray[sliderVal]);
      } else if (datasetType == "multivariate") {
          gl.bindTexture(gl.TEXTURE_2D, multivarTextureArray[sliderVal]);
      }
  gl.uniform1i(gl.getUniformLocation(shaderProgram, "dataType"), 4);

  orthoMatrix = makeOrtho(-1, 1, -1, 1, -10, 10);
  loadIdentity();
  mvTranslate([-0.0, 0.0, -6.0]);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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


updateDegreeSlider = function(sliderVal) {
    //gl.bindTexture(gl.TEXTURE_2D, tempTextureArray[sliderVal]);
    //document.getElementById("dataset-date").innerHTML=months[sliderVal%12]+", "+(Math.floor(sliderVal/12)+1948);
    var startRange = sliderVal*5 + 1948;
    document.getElementById("degree-date").innerHTML= startRange + " to " + (startRange+4);
    drawScene();
}


updateDegreeSet = function() {
    drawScene();
}

}
